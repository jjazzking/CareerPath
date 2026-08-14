# CareerPath

커리어 고민을 **주제별로** 정리하는 개인 대시보드.
각 주제에서 내 생각을 적고, 버튼 한 번으로 **AI에 넘길 프롬프트를 복사**해 Claude(claude.ai)에 붙여넣고,
받은 답변을 **정리해 저장**한다. 데이터는 클라우드(Supabase)에 저장돼 **폰·컴 어디서나** 이어본다.

> **AI API를 쓰지 않는다.** 앱은 "정리 + 저장 + 프롬프트 복사"만 한다. 실제 AI 대화는 이미 쓰는
> Claude 구독으로 claude.ai에서 하므로 **AI 추가 비용이 없다.** 저장/동기화는 Supabase 무료 티어.

## 구성

- **프론트엔드**: Next.js 정적 빌드 → **GitHub Pages** 무료 호스팅
- **저장**: **Supabase** (로그인 없는 공개 모드 — 개인용 단일 데이터셋)
- 주제 하나 = DB의 한 행: `title`, `status`, `entries`(내 생각/AI 답변이 순서대로 쌓이는 스레드)

> ⚠️ 공개 모드다. 사이트 주소를 아는 사람은 누구나 데이터를 읽고 수정할 수 있다. 주소를 널리 퍼뜨리지 말 것.

## 사용 흐름

1. (로그인 없음) 대시보드에서 주제 추가 → 클릭
2. 하단에서 **내 생각** 적어 추가
3. **[프롬프트 복사]** → 지금까지 흐름 전체가 복사됨 → claude.ai에 붙여넣기
4. 받은 답을 **AI 답변**으로 추가 → 다음 생각으로 꼬리에 꼬리를 물고 이어가기

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
  page.tsx              # SPA 진입점: 대시보드 ↔ 주제 상세 전환
components/
  Dashboard.tsx         # 주제 카드 그리드(제목만) + 생성
  TopicDetail.tsx       # 스레드(내 생각/AI 답변) + 프롬프트 복사
lib/
  supabase.ts           # Supabase 클라이언트
  store.ts              # 주제 CRUD (Supabase 직접 호출)
supabase/schema.sql     # 테이블 + 공개 접근 정책 (한 번 실행)
.github/workflows/      # GitHub Pages 자동 배포
```

## 나중에

AI 자동호출·배치가 필요해지면 그때 Claude API를 붙이면 된다 (초기 프로토타입은 git 히스토리에 있음).
