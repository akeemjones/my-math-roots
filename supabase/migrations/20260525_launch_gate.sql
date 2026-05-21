-- supabase/migrations/20260525_launch_gate.sql
-- Controlled beta launch gate — server-enforced signup cap, per-parent
-- student-profile cap, and waitlist.
--
-- Tables:
--   launch_settings   singleton config (id=1), read via SECURITY DEFINER RPCs
--   waitlist_entries  email + status, insert via SECURITY DEFINER RPC only
--
-- Trigger:
--   enforce_max_students_per_parent  BEFORE INSERT ON student_profiles
--
-- RPCs:
--   get_launch_status            anon-callable; returns {signup_open, waitlist_open}
--   join_waitlist                anon-callable; normalizes + upserts email
--   admin_get_launch_dashboard   admin only; returns settings + counts
--   admin_update_launch_settings admin only; partial update
--
-- Whitelist additions (event names):
--   waitlist_viewed, waitlist_joined, signup_gate_viewed,
--   signup_blocked_capacity, launch_settings_updated

-- ── 1. launch_settings ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.launch_settings (
  id                       INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  signup_enabled           BOOLEAN     NOT NULL DEFAULT TRUE,
  max_parent_accounts      INTEGER     NOT NULL DEFAULT 50  CHECK (max_parent_accounts BETWEEN 1 AND 100000),
  max_students_per_parent  INTEGER     NOT NULL DEFAULT 2   CHECK (max_students_per_parent BETWEEN 1 AND 50),
  waitlist_enabled         BOOLEAN     NOT NULL DEFAULT TRUE,
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by               UUID
);

INSERT INTO public.launch_settings (id) VALUES (1)
  ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.launch_settings ENABLE ROW LEVEL SECURITY;
-- No policies → no client-side read/write. All access via SECURITY DEFINER RPCs.

-- ── 2. waitlist_entries ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.waitlist_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        NOT NULL,
  email_lower   TEXT        NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source        TEXT,
  status        TEXT        NOT NULL DEFAULT 'pending',
  notified_at   TIMESTAMPTZ,
  metadata_json JSONB       NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON public.waitlist_entries(status, created_at DESC);

ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;
-- No policies → no anon/authenticated read/write. Anon writes only via join_waitlist().

-- ── 3. Trigger: enforce max_students_per_parent ─────────────────────────────
CREATE OR REPLACE FUNCTION public.enforce_max_students_per_parent()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_max INTEGER;
  v_cur INTEGER;
BEGIN
  SELECT max_students_per_parent INTO v_max FROM launch_settings WHERE id = 1;
  IF v_max IS NULL THEN
    -- Settings table empty (shouldn't happen) — fall back to permissive default
    RETURN NEW;
  END IF;
  SELECT COUNT(*) INTO v_cur FROM student_profiles WHERE parent_id = NEW.parent_id;
  IF v_cur >= v_max THEN
    RAISE EXCEPTION 'profile_limit_reached: max % students per parent', v_max
      USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_max_students_per_parent ON public.student_profiles;
CREATE TRIGGER trg_enforce_max_students_per_parent
  BEFORE INSERT ON public.student_profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_max_students_per_parent();

-- ── 4. Public RPC: get_launch_status ────────────────────────────────────────
-- Anon-callable. Returns just two booleans + the parent count vs cap so the
-- waitlist UI can show how full the beta is without revealing admin settings.
CREATE OR REPLACE FUNCTION public.get_launch_status()
RETURNS TABLE(signup_open BOOLEAN, waitlist_open BOOLEAN, accounts_used INTEGER, accounts_cap INTEGER)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  s        launch_settings%ROWTYPE;
  v_count  INTEGER;
BEGIN
  SELECT * INTO s FROM launch_settings WHERE id = 1;
  SELECT COUNT(*) INTO v_count FROM profiles;
  signup_open   := COALESCE(s.signup_enabled,   TRUE) AND v_count < COALESCE(s.max_parent_accounts, 50);
  waitlist_open := COALESCE(s.waitlist_enabled, TRUE);
  accounts_used := v_count;
  accounts_cap  := COALESCE(s.max_parent_accounts, 50);
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_launch_status() TO anon;
GRANT EXECUTE ON FUNCTION public.get_launch_status() TO authenticated;

-- ── 5. Public RPC: join_waitlist ────────────────────────────────────────────
-- Anon-callable. Normalizes the email (trim+lowercase), upserts on
-- email_lower so duplicates are silently merged. Per-IP rate-limiting lives
-- in the future signup-gate flow; the RPC itself is idempotent.
CREATE OR REPLACE FUNCTION public.join_waitlist(p_email TEXT, p_source TEXT DEFAULT NULL)
RETURNS TABLE(ok BOOLEAN, already_on_list BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_lower TEXT;
  v_exists BOOLEAN;
BEGIN
  IF p_email IS NULL THEN
    ok := FALSE; already_on_list := FALSE; RETURN NEXT; RETURN;
  END IF;
  v_lower := lower(trim(p_email));
  IF v_lower !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' OR length(v_lower) > 254 THEN
    ok := FALSE; already_on_list := FALSE; RETURN NEXT; RETURN;
  END IF;

  SELECT EXISTS(SELECT 1 FROM waitlist_entries WHERE email_lower = v_lower) INTO v_exists;
  IF v_exists THEN
    ok := TRUE; already_on_list := TRUE; RETURN NEXT; RETURN;
  END IF;

  INSERT INTO waitlist_entries (email, email_lower, source)
    VALUES (trim(p_email), v_lower, COALESCE(p_source, 'login_screen'));

  ok := TRUE; already_on_list := FALSE; RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.join_waitlist(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.join_waitlist(TEXT, TEXT) TO authenticated;

-- ── 6. Admin RPC: admin_get_launch_dashboard ────────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_get_launch_dashboard()
RETURNS TABLE(
  signup_enabled            BOOLEAN,
  max_parent_accounts       INTEGER,
  max_students_per_parent   INTEGER,
  waitlist_enabled          BOOLEAN,
  current_parent_accounts   INTEGER,
  current_student_profiles  INTEGER,
  waitlist_count            INTEGER,
  updated_at                TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  s launch_settings%ROWTYPE;
BEGIN
  SELECT * INTO s FROM launch_settings WHERE id = 1;
  signup_enabled           := s.signup_enabled;
  max_parent_accounts      := s.max_parent_accounts;
  max_students_per_parent  := s.max_students_per_parent;
  waitlist_enabled         := s.waitlist_enabled;
  updated_at               := s.updated_at;
  SELECT COUNT(*) INTO current_parent_accounts  FROM profiles;
  SELECT COUNT(*) INTO current_student_profiles FROM student_profiles;
  SELECT COUNT(*) INTO waitlist_count           FROM waitlist_entries WHERE status = 'pending';
  RETURN NEXT;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_get_launch_dashboard() FROM PUBLIC, anon, authenticated;

-- ── 7. Admin RPC: admin_update_launch_settings ──────────────────────────────
-- Partial update — NULL params leave the existing value unchanged.
CREATE OR REPLACE FUNCTION public.admin_update_launch_settings(
  p_signup_enabled           BOOLEAN DEFAULT NULL,
  p_max_parent_accounts      INTEGER DEFAULT NULL,
  p_max_students_per_parent  INTEGER DEFAULT NULL,
  p_waitlist_enabled         BOOLEAN DEFAULT NULL
)
RETURNS TABLE(
  signup_enabled            BOOLEAN,
  max_parent_accounts       INTEGER,
  max_students_per_parent   INTEGER,
  waitlist_enabled          BOOLEAN,
  updated_at                TIMESTAMPTZ
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE launch_settings SET
    signup_enabled          = COALESCE(p_signup_enabled,          launch_settings.signup_enabled),
    max_parent_accounts     = COALESCE(p_max_parent_accounts,     launch_settings.max_parent_accounts),
    max_students_per_parent = COALESCE(p_max_students_per_parent, launch_settings.max_students_per_parent),
    waitlist_enabled        = COALESCE(p_waitlist_enabled,        launch_settings.waitlist_enabled),
    updated_at              = NOW()
  WHERE id = 1
  RETURNING
    launch_settings.signup_enabled,
    launch_settings.max_parent_accounts,
    launch_settings.max_students_per_parent,
    launch_settings.waitlist_enabled,
    launch_settings.updated_at
  INTO
    signup_enabled,
    max_parent_accounts,
    max_students_per_parent,
    waitlist_enabled,
    updated_at;
  RETURN NEXT;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_update_launch_settings(BOOLEAN, INTEGER, INTEGER, BOOLEAN)
  FROM PUBLIC, anon, authenticated;

-- ── 8. Analytics event whitelist (Launch Gate) ──────────────────────────────
ALTER TABLE public.app_events
  DROP CONSTRAINT IF EXISTS app_events_event_name_whitelist,
  ADD CONSTRAINT app_events_event_name_whitelist CHECK (event_name IN (
    -- Phase A
    'app_opened','session_started','session_ended','grade_selected',
    'unit_started','lesson_started','lesson_completed','quiz_started',
    'quiz_completed','unit_test_started','unit_test_completed',
    'intervention_shown','intervention_completed','report_generated',
    'parent_dashboard_opened','subscription_started',
    -- Phase B
    'student_app_opened',
    'unit_viewed',
    'lesson_viewed',
    'score_history_opened',
    'hint_used',
    'student_reset',
    'free_mode_changed',
    'manual_unlock_changed',
    'quiz_abandoned',
    'parent_dash_section_viewed',
    -- Phase C.3B
    'website_viewed',
    -- Launch Gate
    'waitlist_viewed',
    'waitlist_joined',
    'signup_gate_viewed',
    'signup_blocked_capacity',
    'launch_settings_updated'
  ));
