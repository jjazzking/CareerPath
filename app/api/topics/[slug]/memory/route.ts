import { NextResponse } from "next/server";
import { getMeta, getMessages, getMemory, setMemory } from "@/lib/topics";
import { updateMemory } from "@/lib/claude";

type Ctx = { params: Promise<{ slug: string }> };

// 대화 로그를 읽고 ai_memory.md(장기 기억)를 다시 써준다.
export async function POST(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  const meta = await getMeta(slug);
  if (!meta) return NextResponse.json({ error: "없는 주제" }, { status: 404 });

  const [history, oldMemory] = await Promise.all([getMessages(slug), getMemory(slug)]);
  if (history.length === 0) {
    return NextResponse.json({ error: "정리할 대화가 없습니다." }, { status: 400 });
  }

  try {
    const memory = await updateMemory(oldMemory, history);
    await setMemory(slug, memory);
    return NextResponse.json({ memory });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI 호출 실패";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
