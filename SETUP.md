# 설정 & 배포 가이드

폰·컴에서 같은 데이터를 보려면 **Supabase(무료 저장소)** + **GitHub Pages(무료 호스팅)** 조합을 쓴다.
아래 순서대로 하면 된다. 코드는 이미 다 준비돼 있고, 네가 할 건 값 채우기와 버튼 누르기 정도다.

---

## 1. Supabase 프로젝트 만들기 (약 3분)

1. https://supabase.com 가입 → **New project** 생성 (region은 가까운 곳, 예: Northeast Asia)
2. 프로젝트가 준비되면 좌측 **SQL Editor** → **New query** 에
   저장소의 [`supabase/schema.sql`](./supabase/schema.sql) 내용을 붙여넣고 **Run**.
   → `topics` 테이블 + 보안 정책(RLS)이 생성된다.
3. 좌측 **Project Settings → API** 에서 두 값을 복사:
   - **Project URL** (예: `https://abcd.supabase.co`)
   - **anon public** key (`eyJ...` 로 시작하는 긴 문자열)

> ⚠️ **공개 모드**: 이 앱은 로그인이 없다. 스키마의 정책이 anon 키로 전체 접근을 허용하므로,
> **사이트 주소를 아는 사람은 누구나 데이터를 읽고 수정할 수 있다.** 개인용 단일 데이터셋 전제다.
> (주소를 널리 퍼뜨리지 말 것. 나중에 비공개가 필요하면 로그인 방식으로 되돌릴 수 있다.)

---

## 2. 로컬에서 먼저 확인 (선택)

```bash
cp .env.local.example .env.local   # 파일 열어 URL/anon key 채우기
npm install
npm run dev                        # http://localhost:3000
```

로그인 없이 바로 대시보드가 뜨고, 주제를 만들고 저장이 되는지 확인.

---

## 3. GitHub Pages 배포

1. 이 저장소 **Settings → Secrets and variables → Actions → New repository secret** 로 2개 등록:
   - `NEXT_PUBLIC_SUPABASE_URL` = 위의 Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 위의 anon key
2. **Settings → Pages → Build and deployment → Source** 를 **GitHub Actions** 로 설정.
3. 이 브랜치를 **main 에 병합**(또는 main에 push)하면
   [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) 가 자동으로 빌드·배포한다.
   (Actions 탭에서 진행 상황 확인)
4. 완료되면 `https://<너의깃허브아이디>.github.io/CareerPath/` 에서 폰·컴 어디서든 접속.

> 리포 이름이 `CareerPath` 가 아니면 `deploy.yml` 의 `NEXT_PUBLIC_BASE_PATH` 값을 `/<리포이름>` 으로 바꾼다.
> 리포가 `<아이디>.github.io` 형태면 `NEXT_PUBLIC_BASE_PATH` 를 빈 값으로 둔다.

---

## 요약

| 하는 일 | 어디서 |
|---|---|
| DB/보안 생성 | Supabase SQL Editor ← `supabase/schema.sql` |
| 로그인 주소 등록 | Supabase Authentication → URL Configuration |
| 키 2개 등록 | GitHub 저장소 Secrets |
| 배포 켜기 | GitHub Settings → Pages → Source: GitHub Actions |
| 접속 | `https://<아이디>.github.io/CareerPath/` |
