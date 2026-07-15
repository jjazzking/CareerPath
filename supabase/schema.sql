-- CareerPath: Supabase 스키마 + 행 수준 보안(RLS)
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 실행하세요.

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  status text not null default 'exploring',
  thoughts text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 각 사용자는 자기 행만 접근 가능 (남의 커리어 노트 못 봄)
alter table public.topics enable row level security;

drop policy if exists "topics_select_own" on public.topics;
drop policy if exists "topics_insert_own" on public.topics;
drop policy if exists "topics_update_own" on public.topics;
drop policy if exists "topics_delete_own" on public.topics;

create policy "topics_select_own" on public.topics
  for select using (auth.uid() = user_id);

create policy "topics_insert_own" on public.topics
  for insert with check (auth.uid() = user_id);

create policy "topics_update_own" on public.topics
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "topics_delete_own" on public.topics
  for delete using (auth.uid() = user_id);
