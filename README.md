# CareerPath

커리어 고민을 **주제별로** 정리하는 개인 대시보드.
각 주제에서 내 생각을 적고, 버튼 한 번으로 **AI에 넘길 프롬프트를 복사**해 Claude(claude.ai)에 붙여넣고,
받은 답변을 **정리해 저장**한다. 데이터는 클라우드(Supabase)에 저장돼 **폰·컴 어디서나** 이어본다.

> **AI API를 쓰지 않는다.** 앱은 "정리 + 저장 + 프롬프트 복사"만 한다. 실제 AI 대화는 이미 쓰는
> Claude 구독으로 claude.ai에서 하므로 **AI 추가 비용이 없다.** 저장/동기화는 Supabase 무료 티어.

## 구성

- **프론트엔드**: Next.js 정적 빌드 → **GitHub Pages** 무료 호스팅
- **저장/인증**: **Supabase** (이메일 매직 링크 로그인, 행 수준 보안으로 내 데이터는 나만 접근)
- 주제 하나 = DB의 한 행: `title`, `status`, `thoughts`(내 생각), `notes`(정리)

## 사용 흐름

1. 이메일로 로그인 (기기마다 한 번)
2. 주제 추가 → 클릭
3. 왼쪽 **내 생각** 적기 (자동 저장)
4. **[프롬프트 복사]** → claude.ai에 붙여넣기
5. 받은 답을 오른쪽 **정리** 칸에 붙여넣고 저장

## 설치 & 배포

Supabase 프로젝트 생성부터 GitHub Pages 배포까지 전체 절차는 **[SETUP.md](./SETUP.md)** 참고.

로컬 실행:

```bash
cp .env.local.example .env.local   # Supabase URL / anon key 채우기
npm install
npm run dev                        # http://localhost:3000
```

## 구조

```
app/
  page.tsx              # SPA 진입점: 로그인 게이트 → 대시보드/주제 상세 전환
components/
  Auth.tsx              # 이메일 매직 링크 로그인
  Dashboard.tsx         # 주제 카드 그리드 + 생성
  TopicDetail.tsx       # 내 생각/정리 편집 + 프롬프트 복사
lib/
  supabase.ts           # Supabase 클라이언트
  store.ts              # 주제 CRUD (Supabase 직접 호출)
supabase/schema.sql     # 테이블 + RLS 정책 (한 번 실행)
.github/workflows/      # GitHub Pages 자동 배포
```

## 나중에

AI 자동호출·배치가 필요해지면 그때 Claude API를 붙이면 된다 (초기 프로토타입은 git 히스토리에 있음).
