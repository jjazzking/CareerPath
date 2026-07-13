import { NextResponse } from "next/server";
import { getMeta, getMessages, getMemory, appendMessages, updateMeta } from "@/lib/topics";
import { chatTurn } from "@/lib/claude";

type Ctx = { params: Promise<{ slug: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const meta = await getMeta(slug);
  if (!meta) return NextResponse.json({ error: "없는 주제" }, { status: 404 });

  const { text } = await req.json();
  if (!text || !text.trim()) {
    return NextResponse.json({ error: "메시지가 비어있습니다." }, { status: 400 });
  }

  const [history, memory] = await Promise.all([getMessages(slug), getMemory(slug)]);

  let reply: string;
  try {
    reply = await chatTurn(memory, history, text.trim());
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI 호출 실패";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const now = new Date().toISOString();
  await appendMessages(slug, [
    { role: "user", content: text.trim(), at: now },
    { role: "assistant", content: reply, at: new Date().toISOString() },
  ]);
  // 대시보드 요약 = 가장 최근 AI 응답의 첫 줄
  await updateMeta(slug, { summary: reply.split("\n")[0].slice(0, 120) });

  return NextResponse.json({ reply });
}
