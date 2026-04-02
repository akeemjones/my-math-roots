-- Migration: add done/actDates/settings/a11y sync columns to student_profiles
-- Run in: Supabase Dashboard → SQL Editor → New Query

alter table public.student_profiles
  add column if not exists done_json       jsonb not null default '{}'::jsonb,
  add column if not exists act_dates_json  jsonb not null default '[]'::jsonb,
  add column if not exists settings_json   jsonb not null default '{}'::jsonb,
  add column if not exists a11y_json       jsonb not null default '{}'::jsonb;
