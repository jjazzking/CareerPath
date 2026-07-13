import { NextResponse } from "next/server";
import { getMeta, getMessages, getMemory, updateMeta } from "@/lib/topics";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  const meta = await getMeta(slug);
  if (!meta) return NextResponse.json({ error: "없는 주제" }, { status: 404 });
  const [messages, memory] = await Promise.all([getMessages(slug), getMemory(slug)]);
  return NextResponse.json({ meta, messages, memory });
}

// 상태/제목 등 메타 수정
export async function PATCH(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const patch = await req.json();
  await updateMeta(slug, patch);
  return NextResponse.json(await getMeta(slug));
}
