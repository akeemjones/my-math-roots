-- ════════════════════════════════════════
-- MY MATH ROOTS — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ════════════════════════════════════════

-- ── PROFILES ────────────────────────────
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  role         text not null default 'student'
               check (role in ('student', 'parent')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', ''),
    'student'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── STUDENT PROGRESS (syncs DONE object) ─
create table public.student_progress (
  id         bigserial primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  done_json  jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create unique index student_progress_user_id_idx on public.student_progress(user_id);

alter table public.student_progress enable row level security;

create policy "Users can read own progress"
  on public.student_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.student_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.student_progress for update
  using (auth.uid() = user_id);

-- ── QUIZ SCORES (syncs SCORES array) ─────
create table public.quiz_scores (
  id           bigserial primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  local_id     bigint not null,
  qid          text not null,
  label        text not null default '',
  type         text not null default '',
  score        int  not null default 0,
  total        int  not null default 0,
  pct          int  not null default 0,
  stars        text not null default '',
  unit_idx     int,
  color        text,
  student_name text,
  time_taken   text,
  answers      jsonb not null default '[]'::jsonb,
  date_str     text,
  time_str     text,
  quit         boolean not null default false,
  abandoned    boolean not null default false,
  created_at   timestamptz not null default now()
);

create unique index quiz_scores_user_local_idx on public.quiz_scores(user_id, local_id);

alter table public.quiz_scores enable row level security;

create policy "Users can read own scores"
  on public.quiz_scores for select
  using (auth.uid() = user_id);

create policy "Users can insert own scores"
  on public.quiz_scores for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own scores"
  on public.quiz_scores for delete
  using (auth.uid() = user_id);

-- ── FEEDBACK ─────────────────────────────
create table public.feedback (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  user_id      uuid references auth.users(id) on delete set null,
  rating       int check (rating >= 1 and rating <= 5),
  category     text,
  comment      text,
  app_version  text
);

alter table public.feedback enable row level security;

-- Anyone (including guests) can insert feedback
create policy "Anyone can submit feedback"
  on public.feedback for insert
  with check (true);

-- Only the submitting user can read their own feedback
create policy "Users can read own feedback"
  on public.feedback for select
  using (auth.uid() = user_id);
