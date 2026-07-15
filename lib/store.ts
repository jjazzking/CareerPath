import { supabase } from "./supabase";

export type Status = "exploring" | "onhold" | "concluded";

export interface Topic {
  id: string;
  title: string;
  status: Status;
  thoughts: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

// 대시보드 카드 요약 = 내 생각의 첫 비어있지 않은 줄
export function summarize(thoughts: string): string {
  return (
    thoughts
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.length > 0) ?? ""
  ).slice(0, 120);
}

export async function listTopics(): Promise<Topic[]> {
  const { data, error } = await supabase
    .from("topics")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Topic[];
}

export async function createTopic(title: string): Promise<Topic> {
  // user_id 는 DB 기본값(auth.uid())으로 채워진다.
  const { data, error } = await supabase
    .from("topics")
    .insert({ title: title.trim() })
    .select()
    .single();
  if (error) throw error;
  return data as Topic;
}

export async function getTopic(id: string): Promise<Topic | null> {
  const { data, error } = await supabase.from("topics").select("*").eq("id", id).single();
  if (error) return null;
  return data as Topic;
}

export async function updateTopic(
  id: string,
  patch: Partial<Pick<Topic, "title" | "status" | "thoughts" | "notes">>
): Promise<void> {
  const { error } = await supabase
    .from("topics")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
