"use client";

import { useEffect, useState } from "react";

interface TopicMeta {
  slug: string;
  title: string;
  status: "exploring" | "onhold" | "concluded";
  summary: string;
  updatedAt: string;
}

const STATUS_LABEL: Record<TopicMeta["status"], string> = {
  exploring: "탐색중",
  onhold: "보류",
  concluded: "결론",
};

export default function Dashboard() {
  const [topics, setTopics] = useState<TopicMeta[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function load() {
    const res = await fetch("/api/topics");
    setTopics(await res.json());
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    await fetch("/api/topics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    setTitle("");
    setCreating(false);
    load();
  }

  return (
    <div>
      <div className="dash-head">
        <h1>커리어 주제</h1>
        <form className="new-form" onSubmit={create}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="새 주제 (예: 지금 이직할까?)"
          />
          <button disabled={creating || !title.trim()}>추가</button>
        </form>
      </div>

      {loading ? (
        <p className="empty">불러오는 중…</p>
      ) : topics.length === 0 ? (
        <p className="empty">아직 주제가 없습니다. 위에서 첫 주제를 추가해 보세요.</p>
      ) : (
        <div className="grid">
          {topics.map((t) => (
            <a key={t.slug} href={`/topics/${t.slug}`} className="card">
              <h3>{t.title}</h3>
              <div className="summary">{t.summary || "아직 대화가 없습니다."}</div>
              <div className="meta">
                <span className={`badge ${t.status}`}>{STATUS_LABEL[t.status]}</span>
                <span>{new Date(t.updatedAt).toLocaleDateString("ko-KR")}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
