import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage } from "./topics";

const MODEL = process.env.CLAUDE_MODEL || "claude-opus-4-8";

// 매 요청에 그대로 보내는 대화 턴 수(rolling window).
// 이보다 오래된 대화는 ai_memory.md 로 접혀 장기 기억이 된다.
const WINDOW = 12;

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY 가 설정되지 않았습니다 (.env 확인).");
  }
  if (!client) client = new Anthropic();
  return client;
}

const COACH_SYSTEM = `당신은 사용자의 커리어 탐색을 돕는 사고 파트너다.
목표는 정답을 내려주는 게 아니라, 사용자의 생각을 발전시키는 것이다:
- 사용자의 논리에서 강점과 빈틈을 짚는다.
- 근거를 묻고, 놓친 관점이나 반론을 제시한다.
- 다음에 탐색하면 좋을 구체적인 질문을 던진다.
간결하고 직접적으로, 한국어로 답한다. 아부하지 말고 솔직하게.

아래는 이 주제에 대해 지금까지 정리된 내용(장기 기억)이다. 이 맥락을 이어서 대화하라.`;

/** 대화 한 턴: 기억 + 최근 대화 + 새 메시지를 보내 답을 받는다. */
export async function chatTurn(
  memory: string,
  history: ChatMessage[],
  userText: string
): Promise<string> {
  const recent = history.slice(-WINDOW);
  const messages: Anthropic.MessageParam[] = [
    ...recent.map((m) => ({ role: m.role, content: m.content })),
    { role: "user" as const, content: userText },
  ];

  const res = await getClient().messages.create({
    model: MODEL,
    max_tokens: 2000,
    // 시스템 프롬프트 + 기억은 매 턴 반복되므로 캐시해 비용/지연을 줄인다.
    system: [
      {
        type: "text",
        text: `${COACH_SYSTEM}\n\n<기억>\n${memory}\n</기억>`,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages,
  });

  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

/** 대화 로그를 읽고 ai_memory.md(장기 기억)를 다시 써준다. */
export async function updateMemory(
  oldMemory: string,
  history: ChatMessage[]
): Promise<string> {
  const transcript = history
    .map((m) => `${m.role === "user" ? "나" : "AI"}: ${m.content}`)
    .join("\n\n");

  const res = await getClient().messages.create({
    model: MODEL,
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `아래는 한 커리어 주제에 대한 나의 기존 정리와 이후 대화 로그다.
이를 통합해 이 주제에 대한 최신 정리본을 마크다운으로 다시 써라.
다음 섹션을 포함한다: ## 핵심 입장, ## 근거, ## 열린 질문, ## 다음 탐색.
군더더기 없이, 내가 나중에 다시 읽고 이어갈 수 있게.

<기존 정리>
${oldMemory}
</기존 정리>

<대화 로그>
${transcript}
</대화 로그>`,
      },
    ],
  });

  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}
