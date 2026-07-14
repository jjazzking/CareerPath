import { NextResponse } from "next/server";
import { getMeta, getDocs, saveDocs, updateMeta } from "@/lib/topics";
import type { Status } from "@/lib/topics";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  const meta = await getMeta(slug);
  if (!meta) return NextResponse.json({ error: "없는 주제" }, { status: 404 });
  const docs = await getDocs(slug);
  return NextResponse.json({ meta, ...docs });
}

// 문서(thoughts/notes) 저장 + 메타(title/status) 수정을 한 곳에서 처리
export async function PATCH(req: Request, { params }: Ctx) {
  const { slug } = await params;
  const meta = await getMeta(slug);
  if (!meta) return NextResponse.json({ error: "없는 주제" }, { status: 404 });

  const body = await req.json();
  const { thoughts, notes, title, status } = body as {
    thoughts?: string;
    notes?: string;
    title?: string;
    status?: Status;
  };

  if (typeof thoughts === "string" || typeof notes === "string") {
    await saveDocs(slug, { thoughts, notes });
  }
  const metaPatch: Partial<{ title: string; status: Status }> = {};
  if (typeof title === "string" && title.trim()) metaPatch.title = title.trim();
  if (status) metaPatch.status = status;
  if (Object.keys(metaPatch).length) await updateMeta(slug, metaPatch);

  return NextResponse.json(await getMeta(slug));
}
