-- CareerPath: Supabase 스키마 (공개 모드 — 로그인 없음)
-- Supabase 대시보드 → SQL Editor 에 붙여넣고 실행하세요. 다시 실행해도 안전합니다.
--
-- ⚠️ 공개 모드: 로그인 없이 anon 키로 전체 접근을 허용합니다.
--    사이트 주소를 아는 사람은 누구나 이 데이터를 읽고 수정할 수 있습니다.
--    (개인용 단일 데이터셋 전제)

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  title text not null,
  status text not null default 'exploring',
  entries jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 기존 테이블에도 맞춰준다(이미 있으면 무시).
alter table public.topics add column if not exists entries jsonb not null default '[]'::jsonb;
-- 로그인이 없으므로 user_id 는 비어 있어도 되게 한다.
alter table public.topics alter column user_id drop not null;

-- 공개 접근 정책: 예전 로그인 기반 정책을 지우고, 전체 허용 정책 하나로 교체.
alter table public.topics enable row level security;

drop policy if exists "topics_select_own" on public.topics;
drop policy if exists "topics_insert_own" on public.topics;
drop policy if exists "topics_update_own" on public.topics;
drop policy if exists "topics_delete_own" on public.topics;
drop policy if exists "topics_public_all" on public.topics;

create policy "topics_public_all" on public.topics
  for all using (true) with check (true);
