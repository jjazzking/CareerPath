"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, isConfigured } from "@/lib/supabase";
import Auth from "@/components/Auth";
import Dashboard from "@/components/Dashboard";
import TopicDetail from "@/components/TopicDetail";

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!isConfigured) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!isConfigured) return <ConfigNeeded />;
  if (!ready) return <p className="empty">불러오는 중…</p>;
  if (!session) return <Auth />;

  return openId ? (
    <TopicDetail id={openId} onBack={() => setOpenId(null)} />
  ) : (
    <Dashboard email={session.user.email ?? ""} onOpen={setOpenId} />
  );
}

function ConfigNeeded() {
  return (
    <div className="auth">
      <h1>CareerPath</h1>
      <div className="auth-card">
        <p>Supabase 설정이 아직 없습니다.</p>
        <p className="muted">
          <code>NEXT_PUBLIC_SUPABASE_URL</code> 과 <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> 를
          설정한 뒤 다시 빌드하세요. (자세한 방법: <code>SETUP.md</code>)
        </p>
      </div>
    </div>
  );
}
