-- supabase/migrations/20260612_leads_lockdown.sql
--
-- Pre-launch hardening — addresses audit SS-4 (2026-05-22): the leads
-- table allows unrestricted INSERT from anon (policy `leads_insert`
-- WITH CHECK (true), confirmed via pg_policies). The Supabase advisor
-- also flags this as `rls_policy_always_true`.
--
-- IMPACT IF EXPLOITED:
--   POST /rest/v1/leads {"email":"x@x.com","grade":"K"} with the public
--   anon key. No Turnstile, no rate limit, no email validation, no row
--   cap. A botnet can fill the table with junk and inject attacker-
--   controlled email addresses (a PII collection vector if downstream
--   tooling ever processes them).
--
-- CURRENT UI STATE (verified 2026-05-22):
--   The soft-gate modal (src/auth.js:_showSoftGate, line 2938) only
--   renders a consent checkbox + nav buttons. It does NOT render
--   `sg-email`, `sg-grade`, or `sg-referral` inputs. _submitSoftGate
--   (src/auth.js:2978), which contains the `_supa.from('leads').insert()`
--   call, is registered in src/events.js but no `data-action="_submitSoftGate"`
--   exists in any rendered HTML. The lead-capture client path is
--   effectively dead code already; this migration locks the DB layer.
--
-- This migration is the minimum-correct fix:
--   1. DROP POLICY leads_insert (removes the always-true WITH CHECK).
--   2. REVOKE INSERT/UPDATE/DELETE/TRUNCATE/TRIGGER/REFERENCES on
--      public.leads from anon, authenticated, PUBLIC. Service role keeps
--      full access for admin tooling. SELECT grants are also revoked from
--      anon/authenticated — they were redundant given the
--      `auth.role()='service_role'` SELECT policy, but removing the
--      grants closes the defense-in-depth hole.
--   3. Documents the future re-enablement path (submit_lead RPC + Netlify
--      function with Turnstile, mirroring waitlist-join.js).
--
-- Re-applying on prod is safe (DROP POLICY IF EXISTS + REVOKE).

-- ── 1. Drop the open INSERT policy ────────────────────────────────────────
DROP POLICY IF EXISTS leads_insert ON public.leads;

-- ── 2. Lock down table grants ─────────────────────────────────────────────
-- Revoke from PUBLIC first to catch any inherited grants.
REVOKE ALL ON TABLE public.leads FROM PUBLIC;
REVOKE ALL ON TABLE public.leads FROM anon;
REVOKE ALL ON TABLE public.leads FROM authenticated;

-- Re-grant service_role full access (admin tooling). Idempotent.
GRANT ALL ON TABLE public.leads TO service_role;

-- ── 3. Document table state ───────────────────────────────────────────────
COMMENT ON TABLE public.leads IS
  'Pre-account lead capture. WRITES BLOCKED at launch (2026-05-22). RLS '
  'enabled, no INSERT policy, anon/authenticated grants revoked. Service '
  'role only. To re-enable lead capture post-launch: (a) create a '
  'public.submit_lead(p_email, p_grade, p_referral) SECURITY DEFINER RPC '
  'mirroring public.join_waitlist_internal (20260606_waitlist_lockdown.sql); '
  '(b) add a netlify/functions/lead-submit.js with Turnstile + per-IP '
  'rate-limit via check_and_increment_rate_limit (mirror waitlist-join.js); '
  '(c) update the soft-gate UI to render email/grade/referral inputs and '
  'call the new function.';

-- ── Manual verification (post-apply) ──────────────────────────────────────
-- 1. The always-true INSERT policy is gone:
--      SELECT count(*) FROM pg_policies
--      WHERE schemaname='public' AND tablename='leads' AND cmd='INSERT';
--      -- expected: 0
--
-- 2. Anon and authenticated have no write grants:
--      SELECT grantee, privilege_type FROM information_schema.role_table_grants
--      WHERE table_schema='public' AND table_name='leads'
--        AND grantee IN ('anon','authenticated')
--      ORDER BY grantee, privilege_type;
--      -- expected: 0 rows
--
-- 3. Direct anon POST is blocked:
--      curl -X POST "$SUPABASE_URL/rest/v1/leads" \
--        -H "apikey: $SUPABASE_ANON_KEY" \
--        -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
--        -H "Content-Type: application/json" \
--        -d '{"email":"audit@test.com","grade":"K"}'
--      -- expected: 401 permission_denied
--
-- 4. Service role can still write (admin):
--      curl -X POST "$SUPABASE_URL/rest/v1/leads" \
--        -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
--        -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
--        -H "Content-Type: application/json" \
--        -d '{"email":"audit@test.com","grade":"K"}'
--      -- expected: 201
--      DELETE FROM public.leads WHERE email='audit@test.com';
