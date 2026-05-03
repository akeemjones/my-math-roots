-- Add 'admin' to the profiles role CHECK constraint.
-- The original constraint only allowed 'student' | 'parent'.
-- analytics-query.js gates the admin dashboard on profiles.role = 'admin',
-- so this value must be permitted at the DB level.
ALTER TABLE public.profiles
  DROP CONSTRAINT profiles_role_check,
  ADD CONSTRAINT profiles_role_check
    CHECK (role = ANY (ARRAY['student'::text, 'parent'::text, 'admin'::text]));
