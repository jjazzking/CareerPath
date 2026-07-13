"use client";

import { use, useEffect, useRef, useState } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  at: string;
}
interface TopicMeta {
  slug: string;
  title: string;
  status: "exploring" | "onhold" | "concluded";
}

export default function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [meta, setMeta] = useState<TopicMeta | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [memory, setMemory] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [compacting, setCompacting] = useState(false);
  const [error, setError] = useState("");
  const logRef = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch(`/api/topics/${slug}`);
    if (!res.ok) return;
    const data = await res.json();
    setMeta(data.meta);
    setMessages(data.messages);
    setMemory(data.memory);
  }
  useEffect(() => {
    load();
  }, [slug]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const t = text.trim();
    if (!t || sending) return;
    setError("");
    setSending(true);
    // 낙관적 렌더링: 내 메시지를 즉시 표시
    setMessages((m) => [...m, { role: "user", content: t, at: new Date().toISOString() }]);
    setText("");

    const res = await fetch(`/api/topics/${slug}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: t }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "오류가 발생했습니다.");
    } else {
      setMessages((m) => [...m, { role: "assistant", content: data.reply, at: new Date().toISOString() }]);
    }
    setSending(false);
  }

  async function compact() {
    setCompacting(true);
    setError("");
    const res = await fetch(`/api/topics/${slug}/memory`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) setError(data.error || "정리 실패");
    else setMemory(data.memory);
    setCompacting(false);
  }

  async function setStatus(status: TopicMeta["status"]) {
    await fetch(`/api/topics/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setMeta((m) => (m ? { ...m, status } : m));
  }

  return (
    <div>
      <a href="/" className="back">← 주제 목록</a>
      <h1 className="topic-title">{meta?.title ?? "…"}</h1>

      <div className="topic-layout">
        <div className="chat-panel">
          <div className="chat-log" ref={logRef}>
            {messages.length === 0 && (
              <p className="hint">이 주제에 대한 네 생각을 편하게 적어봐. AI가 발전시켜 줄게.</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`bubble ${m.role}`}>
                {m.content}
              </div>
            ))}
            {sending && <div className="bubble assistant">…생각 중</div>}
          </div>

          <form className="chat-input" onSubmit={send}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="생각을 적고 Enter (줄바꿈은 Shift+Enter)"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(e);
                }
              }}
            />
            <button disabled={sending || !text.trim()}>보내기</button>
          </form>
          {error && <div className="err">{error}</div>}
        </div>

        <aside className="side">
          <h4>AI 기억 (정리본)</h4>
          <div className="memory">{memory || "아직 없음"}</div>
          <div className="row">
            <button className="ghost" onClick={compact} disabled={compacting}>
              {compacting ? "정리 중…" : "기억 갱신"}
            </button>
          </div>
          <div className="hint">대화가 길어지면 [기억 갱신]으로 요약해 저장하세요.</div>

          <h4 style={{ marginTop: 20 }}>상태</h4>
          <div className="row">
            {(["exploring", "onhold", "concluded"] as const).map((s) => (
              <button
                key={s}
                className="ghost"
                onClick={() => setStatus(s)}
                style={{ fontWeight: meta?.status === s ? 700 : 400 }}
              >
                {s === "exploring" ? "탐색중" : s === "onhold" ? "보류" : "결론"}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
