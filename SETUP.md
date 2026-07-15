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

> anon key는 공개돼도 안전하다 — RLS + 로그인으로 데이터가 보호되기 때문. 그래서 브라우저에 노출돼도 된다.

### 로그인 리다이렉트 허용 등록

Supabase → **Authentication → URL Configuration**:
- **Site URL** 에 배포 주소 입력: `https://<너의깃허브아이디>.github.io/CareerPath/`
- **Redirect URLs** 에도 같은 주소 추가 (로컬 테스트하려면 `http://localhost:3000` 도 추가)

---

## 2. 로컬에서 먼저 확인 (선택)

```bash
cp .env.local.example .env.local   # 파일 열어 URL/anon key 채우기
npm install
npm run dev                        # http://localhost:3000
```

이메일 입력 → 받은 링크 클릭 → 로그인 → 주제 만들고 저장이 되는지 확인.

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
