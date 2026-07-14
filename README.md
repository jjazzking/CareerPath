# CareerPath

커리어 고민을 **주제별로** 정리하는 개인 대시보드.
각 주제에서 내 생각을 적고, 버튼 한 번으로 **AI에 넘길 프롬프트를 복사**해 Claude(claude.ai)에 붙여넣고,
받은 답변을 **정리해 저장**한다. (설계 배경: [OVERVIEW.md](./OVERVIEW.md))

> **AI API를 쓰지 않는다.** 앱은 순수하게 "정리 + 저장 + 프롬프트 복사"만 한다.
> 실제 AI 대화는 이미 쓰고 있는 Claude 구독으로 claude.ai에서 하면 되므로, **추가 비용도 API 키도 없다.**

## 동작 방식

- 주제 하나 = `data/topics/<slug>/` 폴더 하나
  - `meta.json` — 제목, 상태(탐색중/보류/결론), 요약
  - `thoughts.md` — 내가 직접 쓰는 생각·논리
  - `notes.md` — AI에게 받은 답변을 정리해 저장하는 곳
- 주제 화면에서:
  1. **내 생각**을 왼쪽에 적는다 (자동 저장)
  2. **[프롬프트 복사]** → `내 생각 + 정리`가 하나의 질문으로 묶여 클립보드에 복사됨
  3. Claude(claude.ai)에 붙여넣고, 받은 답을 오른쪽 **정리** 칸에 붙여넣어 다듬어 저장

## 실행 방법

```bash
npm install
npm run dev        # http://localhost:3000
```

API 키·환경변수·계정 설정이 전혀 필요 없다. 데이터는 전부 `data/topics/` 아래 로컬 파일로 저장된다.

## 구조

```
app/
  page.tsx                 # 대시보드 (주제 카드 그리드)
  topics/[slug]/page.tsx   # 주제 상세 (내 생각 / 정리 편집 + 프롬프트 복사)
  api/topics/...           # 주제 목록·생성 / 문서 저장·조회 (파일 IO만)
lib/
  topics.ts                # 파일 IO
data/topics/               # 개인 데이터 (gitignore)
```

## 나중에 자동화가 필요해지면

주제를 한꺼번에 여러 개 돌리거나 자동 요약이 필요해지면 그때 Claude API를 붙이면 된다.
그 버전은 git 히스토리(첫 프로토타입 커밋)에 남아 있다.
