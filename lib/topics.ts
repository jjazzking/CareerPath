import fs from "fs/promises";
import path from "path";

// 모든 주제 데이터는 프로젝트 루트의 data/topics/ 아래 파일로 저장된다.
const DATA_DIR = path.join(process.cwd(), "data", "topics");

export type Status = "exploring" | "onhold" | "concluded";

export interface TopicMeta {
  slug: string;
  title: string;
  status: Status;
  summary: string; // 대시보드 카드에 보이는 1~2줄 요약
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  at: string;
}

// 파일 경로 헬퍼
const topicDir = (slug: string) => path.join(DATA_DIR, slug);
const metaPath = (slug: string) => path.join(topicDir(slug), "meta.json");
const messagesPath = (slug: string) => path.join(topicDir(slug), "messages.json");
const memoryPath = (slug: string) => path.join(topicDir(slug), "ai_memory.md");

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
      const raw = await fs.readFile(metaPath(e.name), "utf-8");
      metas.push(JSON.parse(raw));
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
  await fs.writeFile(messagesPath(slug), JSON.stringify([], null, 2));
  await fs.writeFile(
    memoryPath(slug),
    "# 이 주제에 대한 정리 (AI 기억)\n\n_아직 대화가 없습니다. 왼쪽에서 첫 메시지를 보내보세요._\n"
  );
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

export async function getMessages(slug: string): Promise<ChatMessage[]> {
  try {
    return JSON.parse(await fs.readFile(messagesPath(slug), "utf-8"));
  } catch {
    return [];
  }
}

export async function appendMessages(slug: string, msgs: ChatMessage[]): Promise<void> {
  const cur = await getMessages(slug);
  const next = [...cur, ...msgs];
  await fs.writeFile(messagesPath(slug), JSON.stringify(next, null, 2));
}

export async function getMemory(slug: string): Promise<string> {
  try {
    return await fs.readFile(memoryPath(slug), "utf-8");
  } catch {
    return "";
  }
}

export async function setMemory(slug: string, content: string): Promise<void> {
  await fs.writeFile(memoryPath(slug), content);
}
