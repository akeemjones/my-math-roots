-- Migration: add student_id to quiz_scores for per-student dashboard filtering
-- Run in: Supabase Dashboard → SQL Editor → New Query

alter table public.quiz_scores
  add column if not exists student_id uuid references public.student_profiles(id) on delete set null;

create index if not exists quiz_scores_student_id_idx on public.quiz_scores(student_id);
