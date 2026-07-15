"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { listTopics, createTopic, type Topic } from "@/lib/store";

const STATUS_LABEL: Record<Topic["status"], string> = {
  exploring: "탐색중",
  onhold: "보류",
  concluded: "결론",
};

export default function Dashboard({
  email,
  onOpen,
}: {
  email: string;
  onOpen: (id: string) => void;
}) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    try {
      setTopics(await listTopics());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "불러오기 실패");
    }
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    setErr("");
    try {
      await createTopic(title);
      setTitle("");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "생성 실패");
    }
    setBusy(false);
  }

  return (
    <div>
      <div className="dash-head">
        <h1>커리어 주제</h1>
        <div className="dash-right">
          <span className="muted small">{email}</span>
          <button className="ghost" onClick={() => supabase.auth.signOut()}>
            로그아웃
          </button>
        </div>
      </div>

      <form className="new-form wide" onSubmit={create}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="새 주제 (예: 지금 이직할까?)"
        />
        <button disabled={busy || !title.trim()}>추가</button>
      </form>
      {err && <div className="err">{err}</div>}

      {loading ? (
        <p className="empty">불러오는 중…</p>
      ) : topics.length === 0 ? (
        <p className="empty">아직 주제가 없습니다. 위에서 첫 주제를 추가해 보세요.</p>
      ) : (
        <div className="grid">
          {topics.map((t) => (
            <button key={t.id} className="card" onClick={() => onOpen(t.id)}>
              <h3>{t.title}</h3>
              <div className="meta">
                <span className={`badge ${t.status}`}>{STATUS_LABEL[t.status]}</span>
                <span>{t.entries.length}개 기록</span>
                <span>{new Date(t.updated_at).toLocaleDateString("ko-KR")}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
