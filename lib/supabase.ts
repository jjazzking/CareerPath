import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// 이 두 값은 빌드 시 주입된다(공개돼도 안전 — 데이터는 RLS + 로그인으로 보호).
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 값이 없으면(설정 전) 안내 화면을 띄우기 위한 플래그.
export const isConfigured = Boolean(url && anon);

export const supabase: SupabaseClient = createClient(
  url ?? "https://placeholder.supabase.co",
  anon ?? "placeholder-anon-key"
);
