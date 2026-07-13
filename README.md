# CareerPath

커리어 고민을 **주제별로** 정리하고, 각 주제마다 **AI와 대화**하며 생각을 발전시키는 개인 대시보드.
모든 데이터는 로컬 **파일**로 저장된다. (설계 배경: [OVERVIEW.md](./OVERVIEW.md))

## 동작 방식

- 주제 하나 = `data/topics/<slug>/` 폴더 하나
  - `meta.json` — 제목, 상태(탐색중/보류/결론), 요약
  - `messages.json` — 나와 AI의 대화 로그
  - `ai_memory.md` — AI가 정리한 **장기 기억(정리본)**
- 대화 한 턴에 보내는 것 = `시스템 프롬프트 + ai_memory.md + 최근 12턴 + 새 메시지`
  - 앞부분(시스템+기억)은 **prompt caching**으로 캐시 → 비용/지연 절감
  - 대화가 길어지면 **[기억 갱신]** 버튼으로 요약해 `ai_memory.md`에 접어 넣는다 → 토큰이 무한정 안 커짐
- **AI는 스스로 기억하지 않는다.** "기억"은 매 요청에 `ai_memory.md`를 다시 넣어 구현한다 (학습/파인튜닝 아님).

## 실행 방법

```bash
npm install
cp .env.example .env      # .env 를 열어 ANTHROPIC_API_KEY 채우기
npm run dev               # http://localhost:3000
```

API 키는 https://console.anthropic.com 에서 발급한다.
Claude.ai 구독과 API는 **별도 과금**이며, 이 앱은 API 크레딧을 사용한다(개인용은 보통 월 몇 달러 수준).

### 모델 / 비용

`.env` 의 `CLAUDE_MODEL` 로 조절한다. 미설정 시 `claude-opus-4-8`.
- `claude-sonnet-5` — 이 용도에 권장 (품질/비용 균형)
- `claude-haiku-4-5` — 가장 저렴

## 구조

```
app/
  page.tsx                     # 대시보드 (주제 카드 그리드)
  topics/[slug]/page.tsx       # 주제 상세 (대화 + 기억 패널)
  api/topics/...               # 주제 CRUD / 대화 / 기억 갱신
lib/
  topics.ts                    # 파일 IO
  claude.ts                    # Claude API 호출 (대화 + 기억 정리)
data/topics/                   # 개인 데이터 (gitignore)
```
