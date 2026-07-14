import fs from "fs/promises";
import path from "path";

// 모든 주제 데이터는 프로젝트 루트의 data/topics/ 아래 파일로 저장된다.
const DATA_DIR = path.join(process.cwd(), "data", "topics");

export type Status = "exploring" | "onhold" | "concluded";

export interface TopicMeta {
  slug: string;
  title: string;
  status: Status;
  summary: string; // 대시보드 카드에 보이는 1~2줄 요약 (내 생각 첫 줄)
  createdAt: string;
  updatedAt: string;
}

// 주제 하나가 담는 두 개의 문서
export interface TopicDocs {
  thoughts: string; // 내가 직접 쓰는 생각/논리
  notes: string; // AI에게 받은 답변을 정리해 저장하는 곳
}

// 파일 경로 헬퍼
const topicDir = (slug: string) => path.join(DATA_DIR, slug);
const metaPath = (slug: string) => path.join(topicDir(slug), "meta.json");
const thoughtsPath = (slug: string) => path.join(topicDir(slug), "thoughts.md");
const notesPath = (slug: string) => path.join(topicDir(slug), "notes.md");

function slugify(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base || "topic"}-${suffix}`;
}

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function listTopics(): Promise<TopicMeta[]> {
  await ensureDataDir();
  const entries = await fs.readdir(DATA_DIR, { withFileTypes: true });
  const metas: TopicMeta[] = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    try {
      metas.push(JSON.parse(await fs.readFile(metaPath(e.name), "utf-8")));
    } catch {
      // meta 없는 폴더는 무시
    }
  }
  return metas.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function createTopic(title: string): Promise<TopicMeta> {
  await ensureDataDir();
  const now = new Date().toISOString();
  const slug = slugify(title);
  const meta: TopicMeta = {
    slug,
    title: title.trim(),
    status: "exploring",
    summary: "",
    createdAt: now,
    updatedAt: now,
  };
  await fs.mkdir(topicDir(slug), { recursive: true });
  await fs.writeFile(metaPath(slug), JSON.stringify(meta, null, 2));
  await fs.writeFile(thoughtsPath(slug), "");
  await fs.writeFile(notesPath(slug), "");
  return meta;
}

export async function getMeta(slug: string): Promise<TopicMeta | null> {
  try {
    return JSON.parse(await fs.readFile(metaPath(slug), "utf-8"));
  } catch {
    return null;
  }
}

export async function updateMeta(slug: string, patch: Partial<TopicMeta>): Promise<void> {
  const meta = await getMeta(slug);
  if (!meta) return;
  const next = { ...meta, ...patch, updatedAt: new Date().toISOString() };
  await fs.writeFile(metaPath(slug), JSON.stringify(next, null, 2));
}

export async function getDocs(slug: string): Promise<TopicDocs> {
  const read = async (p: string) => {
    try {
      return await fs.readFile(p, "utf-8");
    } catch {
      return "";
    }
  };
  const [thoughts, notes] = await Promise.all([
    read(thoughtsPath(slug)),
    read(notesPath(slug)),
  ]);
  return { thoughts, notes };
}

// thoughts / notes 중 전달된 것만 저장. summary(대시보드 요약)도 함께 갱신.
export async function saveDocs(slug: string, patch: Partial<TopicDocs>): Promise<void> {
  if (typeof patch.thoughts === "string") {
    await fs.writeFile(thoughtsPath(slug), patch.thoughts);
  }
  if (typeof patch.notes === "string") {
    await fs.writeFile(notesPath(slug), patch.notes);
  }
  // 요약 = 내 생각의 첫 비어있지 않은 줄
  if (typeof patch.thoughts === "string") {
    const firstLine =
      patch.thoughts.split("\n").map((l) => l.trim()).find((l) => l.length > 0) ?? "";
    await updateMeta(slug, { summary: firstLine.slice(0, 120) });
  } else {
    await updateMeta(slug, {}); // updatedAt 갱신
  }
}
