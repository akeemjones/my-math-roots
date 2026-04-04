-- Enable Realtime for student_profiles table so that
-- changes (e.g. parent toggling unit unlocks on the dashboard)
-- are broadcast to connected student clients in near-real-time.
alter publication supabase_realtime add table public.student_profiles;
