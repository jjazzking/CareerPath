"use client";

import { useState } from "react";
import { isConfigured } from "@/lib/supabase";
import Dashboard from "@/components/Dashboard";
import TopicDetail from "@/components/TopicDetail";

export default function Home() {
  const [openId, setOpenId] = useState<string | null>(null);

  if (!isConfigured) return <ConfigNeeded />;

  return openId ? (
    <TopicDetail id={openId} onBack={() => setOpenId(null)} />
  ) : (
    <Dashboard onOpen={setOpenId} />
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
