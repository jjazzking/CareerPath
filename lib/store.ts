import { supabase } from "./supabase";

export type Status = "exploring" | "onhold" | "concluded";

// 스레드의 한 칸. role: 내 생각(me) / AI 답변(ai)
export interface Entry {
  id: string;
  role: "me" | "ai";
  text: string;
  at: string;
}

export interface Topic {
  id: string;
  title: string;
  status: Status;
  entries: Entry[];
  created_at: string;
  updated_at: string;
}

export function newEntry(role: Entry["role"], text: string): Entry {
  return {
    id: (globalThis.crypto?.randomUUID?.() ?? String(Date.now() + Math.random())),
    role,
    text,
    at: new Date().toISOString(),
  };
}

// 대시보드 카드용: 스레드에서 가장 최근 칸 미리보기(현재는 카드에 제목만 쓰지만 필요 시 사용)
export function preview(entries: Entry[]): string {
  const last = entries[entries.length - 1];
  return last ? last.text.split("\n").find((l) => l.trim())?.slice(0, 120) ?? "" : "";
}

export async function listTopics(): Promise<Topic[]> {
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(normalize);
}

export async function createTopic(title: string): Promise<Topic> {
  const { data, error } = await supabase
    .from("topics")
    .insert({ title: title.trim() })
    .select()
    .single();
  if (error) throw error;
  return normalize(data);
}

export async function getTopic(id: string): Promise<Topic | null> {
  const { data, error } = await supabase.from("topics").select("*").eq("id", id).single();
  if (error) return null;
  return normalize(data);
}

export async function updateTopic(
  id: string,
  patch: Partial<Pick<Topic, "title" | "status" | "entries">>
): Promise<void> {
  const { error } = await supabase
    .from("topics")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

// DB 행을 앱 타입으로: entries 가 비어있으면 구버전(thoughts/notes)에서 옮겨온다.
function normalize(row: Record<string, unknown>): Topic {
  let entries = (row.entries as Entry[] | null) ?? [];
  if ((!entries || entries.length === 0) && (row.thoughts || row.notes)) {
    entries = [];
    if (typeof row.thoughts === "string" && row.thoughts.trim())
      entries.push(newEntry("me", row.thoughts));
    if (typeof row.notes === "string" && row.notes.trim())
      entries.push(newEntry("ai", row.notes));
  }
  return {
    id: row.id as string,
    title: row.title as string,
    status: (row.status as Status) ?? "exploring",
    entries,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };
}
