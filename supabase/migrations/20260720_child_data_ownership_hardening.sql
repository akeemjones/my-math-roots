-- ════════════════════════════════════════════════════════════════════════════
--  Child-data ownership hardening (single-family-account model)
--
--  STATUS: APPLIED TO PRODUCTION 2026-07-20 (project omjegwtzirskgmgeojdn,
--  "My Math Roots") via Supabase migration `harden_child_data_ownership`.
--  This file is the repo record of what was applied.
--
--  WHY
--  Before this change the write policies on student_progress and quiz_scores
--  checked only `auth.uid() = user_id`. They did NOT verify that the row's
--  student_id referred to a child profile owned by that account. The
--  single-family-account client routes EVERY child write through the parent's
--  Supabase session (_pushAllParent -> direct upserts), which made this the
--  primary authorization boundary: a signed-in parent could insert/update rows
--  tagged with another family's student_id.
--
--  WHAT
--  Each write policy now additionally requires that student_id belongs to a
--  child profile owned by the authenticated account. Ownership is the same
--  relation enforced by student_profiles' `parent_owns_profiles` policy
--  (parent_id = auth.uid()); the EXISTS subquery is itself subject to that RLS,
--  so it reinforces rather than bypasses it. No SECURITY DEFINER needed.
--
--  NULL student_id is explicitly permitted: the column is nullable and is used
--  by local/legacy rows and by the ON DELETE SET NULL behaviour when a child
--  profile is removed.
--
--  PRE-FLIGHT (verified on production before applying)
--    student_progress: 1 row  (1 null student_id, 0 with student_id, 0 mis-owned)
--    quiz_scores:      344 rows (185 null, 159 with student_id, 0 mis-owned)
--  => no existing row violates the new rule; this is additive, not a backfill.
--
--  VERIFIED AFTER APPLYING (predicate evaluated under a real JWT, read-only)
--    real parent -> own child ............ allowed
--    real parent -> foreign/bogus child .. denied
--    other account -> this family's child  denied
--    student_id NULL ..................... still allowed
--  Supabase security advisors: 0 errors introduced.
--
--  ROLLBACK
--  Restore the prior (weaker) predicate by re-running each ALTER POLICY with
--  only `auth.uid() = user_id`:
--    ALTER POLICY "Users can insert own progress" ON public.student_progress
--      WITH CHECK (auth.uid() = user_id);
--    ALTER POLICY "Users can update own progress" ON public.student_progress
--      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
--    ALTER POLICY "Users can insert own scores"   ON public.quiz_scores
--      WITH CHECK (auth.uid() = user_id);
--    ALTER POLICY "Users can update own scores"   ON public.quiz_scores
--      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- ════════════════════════════════════════════════════════════════════════════

ALTER POLICY "Users can insert own progress" ON public.student_progress
  WITH CHECK (
    auth.uid() = user_id
    AND (
      student_progress.student_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.student_profiles sp
        WHERE sp.id = student_progress.student_id
          AND sp.parent_id = auth.uid()
      )
    )
  );

ALTER POLICY "Users can update own progress" ON public.student_progress
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      student_progress.student_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.student_profiles sp
        WHERE sp.id = student_progress.student_id
          AND sp.parent_id = auth.uid()
      )
    )
  );

ALTER POLICY "Users can insert own scores" ON public.quiz_scores
  WITH CHECK (
    auth.uid() = user_id
    AND (
      quiz_scores.student_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.student_profiles sp
        WHERE sp.id = quiz_scores.student_id
          AND sp.parent_id = auth.uid()
      )
    )
  );

ALTER POLICY "Users can update own scores" ON public.quiz_scores
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      quiz_scores.student_id IS NULL
      OR EXISTS (
        SELECT 1 FROM public.student_profiles sp
        WHERE sp.id = quiz_scores.student_id
          AND sp.parent_id = auth.uid()
      )
    )
  );
