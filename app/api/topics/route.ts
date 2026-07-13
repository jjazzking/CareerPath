import { NextResponse } from "next/server";
import { listTopics, createTopic } from "@/lib/topics";

export async function GET() {
  return NextResponse.json(await listTopics());
}

export async function POST(req: Request) {
  const { title } = await req.json();
  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "제목이 필요합니다." }, { status: 400 });
  }
  const meta = await createTopic(title);
  return NextResponse.json(meta, { status: 201 });
}
