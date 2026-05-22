-- ══════════════════════════════════════════════════════════════
--  Migration: family-code 8-digit numeric standardization
--
--  Product decision: family codes are now ALWAYS exactly 8
--  numeric digits (no hex, no alphanumeric). Stored format is
--      MMR-12345678
--  The parent dashboard displays the full code and the Copy
--  Code button copies only the 8-digit suffix. The child/device
--  link UI shows "MMR-" as a fixed visual prefix and the
--  editable input accepts only the 8 digits (pasted full
--  MMR-XXXXXXXX is also accepted and normalized).
--
--  Changes here:
--    1. CREATE _generate_family_code() — private helper that
--       picks a unique MMR-XXXXXXXX with collision retry.
--    2. CREATE OR REPLACE ensure_family_code     to use it.
--    3. CREATE OR REPLACE create_student_profile to use it.
--    4. Rotate every existing profile whose family_code does
--       not already match ^MMR-[0-9]{8}$.
--    5. Self-verifying DO blocks at the bottom abort the
--       migration if any non-compliant code survives or if the
--       generator ever returns a non-compliant string.
--
--  Notes:
--    * Helper is REVOKE'd from anon/authenticated. Invoked
--      only from other SECURITY DEFINER RPCs that already
--      gate caller identity.
--    * CREATE OR REPLACE preserves the existing GRANTs on
--      ensure_family_code (authenticated only) and
--      create_student_profile.
--    * pin_sessions reference student_id, not family_code, so
--      existing linked child devices keep working after a
--      parent's code is rotated.
--    * gen_random_bytes(4) → 32 random bits → mod 1e8 gives
--      ~2 % bias toward the lower 92.9M of the 100M-code
--      space. Acceptable: the per-code rate-limited lookup
--      (20/5min in get_profiles_by_family_code) is the
--      dominant enumeration defense, not raw entropy.
-- ══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public._generate_family_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bytes    BYTEA;
  v_num      BIGINT;
  v_code     TEXT;
  v_attempts INT := 0;
BEGIN
  LOOP
    v_bytes := gen_random_bytes(4);
    v_num := ((get_byte(v_bytes, 0)::bigint) << 24)
           | ((get_byte(v_bytes, 1)::bigint) << 16)
           | ((get_byte(v_bytes, 2)::bigint) << 8)
           | (get_byte(v_bytes, 3)::bigint);
    v_code := 'MMR-' || lpad((v_num % 100000000)::text, 8, '0');
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE family_code = v_code) THEN
      RETURN v_code;
    END IF;
    v_attempts := v_attempts + 1;
    IF v_attempts >= 10 THEN
      RAISE EXCEPTION 'family_code_generation_failed'
        USING DETAIL = 'Could not pick a unique 8-digit family code in 10 attempts.';
    END IF;
  END LOOP;
END;
$$;

REVOKE EXECUTE ON FUNCTION public._generate_family_code() FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public._generate_family_code() TO service_role;

COMMENT ON FUNCTION public._generate_family_code() IS
  'Picks a unique MMR-XXXXXXXX (8-digit numeric) family code with collision '
  'retry. Private — invoked only by other SECURITY DEFINER RPCs '
  '(20260610_family_code_8_digit.sql).';


-- ── ensure_family_code: 8-digit generation ────────────────────
CREATE OR REPLACE FUNCTION public.ensure_family_code(p_parent_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != p_parent_id THEN
    RAISE EXCEPTION 'Not authorized' USING ERRCODE = '42501';
  END IF;
  SELECT family_code INTO v_code FROM profiles WHERE id = p_parent_id;
  IF v_code IS NULL THEN
    v_code := public._generate_family_code();
    UPDATE profiles SET family_code = v_code, updated_at = now() WHERE id = p_parent_id;
  END IF;
  RETURN v_code;
END;
$$;

COMMENT ON FUNCTION public.ensure_family_code(UUID) IS
  'Mints a family_code (MMR-XXXXXXXX, 8 numeric digits) for the caller''s '
  'own profile if not set. Caller must equal auth.uid(). '
  '8-digit standardization in 20260610_family_code_8_digit.sql.';


-- ── create_student_profile: 8-digit generation ────────────────
CREATE OR REPLACE FUNCTION public.create_student_profile(
  p_display_name text,
  p_avatar_emoji text,
  p_avatar_color_from text,
  p_avatar_color_to text,
  p_age integer,
  p_pin text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
DECLARE
  v_parent_id UUID;
  v_profile   student_profiles;
  v_family    TEXT;
BEGIN
  v_parent_id := auth.uid();
  IF v_parent_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  SELECT family_code INTO v_family FROM profiles WHERE id = v_parent_id;
  IF v_family IS NULL THEN
    v_family := public._generate_family_code();
    UPDATE profiles SET family_code = v_family, updated_at = now() WHERE id = v_parent_id;
  END IF;

  INSERT INTO student_profiles (
    parent_id, display_name, username, avatar_emoji,
    avatar_color_from, avatar_color_to, age, pin_hash
  ) VALUES (
    v_parent_id, p_display_name, lower(p_display_name), p_avatar_emoji,
    p_avatar_color_from, p_avatar_color_to, p_age,
    crypt(p_pin, gen_salt('bf'))
  )
  RETURNING * INTO v_profile;

  RETURN jsonb_build_object(
    'id',                v_profile.id,
    'display_name',      v_profile.display_name,
    'age',               v_profile.age,
    'avatar_emoji',      v_profile.avatar_emoji,
    'avatar_color_from', v_profile.avatar_color_from,
    'avatar_color_to',   v_profile.avatar_color_to,
    'parent_id',         v_profile.parent_id,
    'family_code',       v_family
  );
END;
$$;

COMMENT ON FUNCTION public.create_student_profile(text, text, text, text, integer, text) IS
  'Creates a student profile for auth.uid(). Mints a family_code on demand '
  'via _generate_family_code() (MMR-XXXXXXXX, 8 numeric digits). '
  '8-digit standardization in 20260610_family_code_8_digit.sql.';


-- ── Rotate existing non-compliant family codes ────────────────
DO $rotate$
DECLARE
  v_row   RECORD;
  v_new   TEXT;
  v_count INT := 0;
BEGIN
  FOR v_row IN
    SELECT id FROM public.profiles
    WHERE family_code IS NOT NULL
      AND family_code !~ '^MMR-[0-9]{8}$'
  LOOP
    v_new := public._generate_family_code();
    UPDATE public.profiles
       SET family_code = v_new,
           updated_at  = now()
     WHERE id = v_row.id;
    v_count := v_count + 1;
  END LOOP;
  RAISE NOTICE '[20260610_family_code_8_digit] rotated % non-compliant family code(s).', v_count;
END
$rotate$;


-- ── Verification 1: no non-compliant codes remain ─────────────
DO $verify_data$
DECLARE
  v_total        INT;
  v_compliant    INT;
  v_noncompliant INT;
BEGIN
  SELECT
    COUNT(*) FILTER (WHERE family_code IS NOT NULL),
    COUNT(*) FILTER (WHERE family_code ~ '^MMR-[0-9]{8}$'),
    COUNT(*) FILTER (WHERE family_code IS NOT NULL AND family_code !~ '^MMR-[0-9]{8}$')
    INTO v_total, v_compliant, v_noncompliant
  FROM public.profiles;
  IF v_noncompliant > 0 THEN
    RAISE EXCEPTION '[20260610] data verification failed: % non-compliant codes remain', v_noncompliant;
  END IF;
  RAISE NOTICE '[20260610] data ok: total_codes=% compliant=% noncompliant=%',
               v_total, v_compliant, v_noncompliant;
END
$verify_data$;


-- ── Verification 2: generator returns compliant codes ─────────
-- Calls the helper 5 times; the codes are returned (not persisted)
-- and asserted to match the 8-digit format.
DO $verify_gen$
DECLARE
  v_code TEXT;
  v_i    INT;
BEGIN
  FOR v_i IN 1..5 LOOP
    v_code := public._generate_family_code();
    IF v_code !~ '^MMR-[0-9]{8}$' THEN
      RAISE EXCEPTION '[20260610] _generate_family_code returned non-compliant code (sample %): regex check failed', v_i;
    END IF;
  END LOOP;
  RAISE NOTICE '[20260610] generator ok: 5 sample codes all match ^MMR-[0-9]{8}$ (not persisted).';
END
$verify_gen$;


-- ══════════════════════════════════════════════════════════════
--  Manual post-apply verification (no PII printed)
--
--    SELECT
--      COUNT(*) AS total,
--      COUNT(*) FILTER (WHERE family_code ~ '^MMR-[0-9]{8}$') AS compliant,
--      COUNT(*) FILTER (WHERE family_code IS NOT NULL AND family_code !~ '^MMR-[0-9]{8}$') AS noncompliant
--    FROM profiles
--    WHERE family_code IS NOT NULL;
--
--  Expected after apply: compliant = total, noncompliant = 0.
-- ══════════════════════════════════════════════════════════════
