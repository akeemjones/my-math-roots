-- Migration: add mastery/streak/apptime columns to student_profiles
-- Run in: Supabase Dashboard → SQL Editor → New Query

alter table public.student_profiles
  add column if not exists mastery_json  jsonb        not null default '{}'::jsonb,
  add column if not exists streak_current int         not null default 0,
  add column if not exists streak_longest  int        not null default 0,
  add column if not exists streak_last_date text      not null default '',
  add column if not exists apptime_json  jsonb        not null default '{}'::jsonb;
