"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getTopic, updateTopic, newEntry, type Topic, type Entry, type Status } from "@/lib/store";

// 지금까지의 스레드 전체를 하나의 프롬프트로 묶는다 → 붙여넣을 때마다 맥락이 이어진다.
function buildPrompt(title: string, entries: Entry[]): string {
  const parts = [`# 커리어 주제: ${title}`, "", "## 지금까지의 흐름"];
  if (entries.length === 0) parts.push("(아직 없음)");
  for (const e of entries) parts.push(`\n[${e.role === "me" ? "내 생각" : "AI 답변"}]`, e.text.trim());
  parts.push(
    "",
    "---",
    "위 흐름을 이어서, 내 마지막 생각을 발전시켜줘. 논리의 강점과 빈틈, 놓친 관점이나 반론을 짚고,",
    "여기서 더 깊이 파고들 수 있게 꼬리를 무는 다음 질문을 1~2개 던져줘."
  );
  return parts.join("\n");
}

export default function TopicDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [draftRole, setDraftRole] = useState<Entry["role"]>("me");
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const t = await getTopic(id);
      if (t) {
        setTopic(t);
        setEntries(t.entries);
      }
    })();
  }, [id]);

  // entries 변경을 저장(스레드는 구조가 있어 변경 시마다 바로 저장)
  const persist = useCallback(
    async (next: Entry[]) => {
      setEntries(next);
      setSaved(false);
      await updateTopic(id, { entries: next });
      setSaved(true);
    },
    [id]
  );

  async function addEntry() {
    const text = draft.trim();
    if (!text) return;
    const next = [...entries, newEntry(draftRole, text)];
    setDraft("");
    // 방금 AI 답변을 넣었다면 다음은 내 생각 차례로
    if (draftRole === "ai") setDraftRole("me");
    await persist(next);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  async function saveEdit(entryId: string) {
    const next = entries.map((e) => (e.id === entryId ? { ...e, text: editText } : e));
    setEditingId(null);
    await persist(next);
  }

  async function remove(entryId: string) {
    if (!confirm("이 기록을 삭제할까요?")) return;
    await persist(entries.filter((e) => e.id !== entryId));
  }

  async function copyPrompt() {
    const prompt = buildPrompt(topic?.title ?? "", entries);
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = prompt;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function setStatus(status: Status) {
    await updateTopic(id, { status });
    setTopic((t) => (t ? { ...t, status } : t));
  }

  return (
    <div className="topic">
      <div className="topic-bar">
        <button className="back" onClick={onBack}>
          ← 주제 목록
        </button>
        <div className="topic-bar-right">
          <span className="save-state">{saved ? "저장됨" : "저장 중…"}</span>
          <button onClick={copyPrompt}>{copied ? "복사됨 ✓" : "프롬프트 복사"}</button>
        </div>
      </div>

      <h1 className="topic-title">{topic?.title ?? "…"}</h1>

      <div className="status-row">
        {(["exploring", "onhold", "concluded"] as const).map((s) => (
          <button
            key={s}
            className={`chip ${topic?.status === s ? "on" : ""}`}
            onClick={() => setStatus(s)}
          >
            {s === "exploring" ? "탐색중" : s === "onhold" ? "보류" : "결론"}
          </button>
        ))}
      </div>

      {/* 스레드 */}
      <div className="thread">
        {entries.length === 0 && (
          <p className="hint">
            아래에 첫 생각을 적어 추가하세요. [프롬프트 복사]로 Claude에 물어보고, 받은 답을 &quot;AI 답변&quot;으로
            추가하면 꼬리에 꼬리를 물고 이어집니다.
          </p>
        )}
        {entries.map((e) => (
          <div key={e.id} className={`entry ${e.role}`}>
            <div className="entry-head">
              <span className="entry-role">{e.role === "me" ? "내 생각" : "AI 답변"}</span>
              <span className="entry-actions">
                {editingId === e.id ? (
                  <>
                    <button className="link" onClick={() => saveEdit(e.id)}>저장</button>
                    <button className="link" onClick={() => setEditingId(null)}>취소</button>
                  </>
                ) : (
                  <>
                    <button
                      className="link"
                      onClick={() => {
                        setEditingId(e.id);
                        setEditText(e.text);
                      }}
                    >
                      편집
                    </button>
                    <button className="link" onClick={() => remove(e.id)}>삭제</button>
                  </>
                )}
              </span>
            </div>
            {editingId === e.id ? (
              <textarea
                className="doc-area"
                value={editText}
                onChange={(ev) => setEditText(ev.target.value)}
                autoFocus
              />
            ) : (
              <div className="entry-text">{e.text}</div>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* 작성기 */}
      <div className="composer">
        <div className="composer-tabs">
          <button
            className={`chip ${draftRole === "me" ? "on" : ""}`}
            onClick={() => setDraftRole("me")}
          >
            내 생각
          </button>
          <button
            className={`chip ${draftRole === "ai" ? "on" : ""}`}
            onClick={() => setDraftRole("ai")}
          >
            AI 답변 붙여넣기
          </button>
        </div>
        <textarea
          className="doc-area composer-area"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={
            draftRole === "me"
              ? "이어질 생각을 적어봐. (Ctrl/⌘+Enter 로 추가)"
              : "Claude에게 받은 답변을 붙여넣어 추가하세요. (Ctrl/⌘+Enter)"
          }
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              addEntry();
            }
          }}
        />
        <div className="composer-actions">
          <button onClick={addEntry} disabled={!draft.trim()}>
            추가
          </button>
        </div>
      </div>
    </div>
  );
}
