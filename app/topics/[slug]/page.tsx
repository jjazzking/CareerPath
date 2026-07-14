"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";

interface TopicMeta {
  slug: string;
  title: string;
  status: "exploring" | "onhold" | "concluded";
}

// 클립보드로 복사할 프롬프트를 조립한다.
function buildPrompt(title: string, thoughts: string, notes: string): string {
  const parts = [`# 커리어 주제: ${title}`, ""];
  parts.push("## 지금까지 내 생각", thoughts.trim() || "(아직 없음)", "");
  if (notes.trim()) {
    parts.push("## 이전에 정리해둔 것", notes.trim(), "");
  }
  parts.push(
    "---",
    "위 내용을 바탕으로 내 생각을 발전시켜줘. 논리의 강점과 빈틈, 놓친 관점이나 반론, 그리고 다음에 탐색하면 좋을 질문을 짚어줘."
  );
  return parts.join("\n");
}

export default function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [meta, setMeta] = useState<TopicMeta | null>(null);
  const [thoughts, setThoughts] = useState("");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(true);
  const [copied, setCopied] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/topics/${slug}`);
      if (!res.ok) return;
      const data = await res.json();
      setMeta(data.meta);
      setThoughts(data.thoughts);
      setNotes(data.notes);
      loaded.current = true;
    })();
  }, [slug]);

  // 변경 시 디바운스 자동 저장
  const scheduleSave = useCallback(
    (next: { thoughts?: string; notes?: string }) => {
      setSaved(false);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        await fetch(`/api/topics/${slug}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next),
        });
        setSaved(true);
      }, 700);
    },
    [slug]
  );

  function onThoughts(v: string) {
    setThoughts(v);
    scheduleSave({ thoughts: v });
  }
  function onNotes(v: string) {
    setNotes(v);
    scheduleSave({ notes: v });
  }

  async function copyPrompt() {
    const prompt = buildPrompt(meta?.title ?? "", thoughts, notes);
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      // 클립보드 권한이 없을 때 대비: 임시 textarea로 복사
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
      <div className="topic-head">
        <h1 className="topic-title">{meta?.title ?? "…"}</h1>
        <span className="save-state">{saved ? "저장됨" : "저장 중…"}</span>
      </div>

      <div className="topic-layout">
        <section className="doc-panel">
          <div className="doc-head">
            <h4>내 생각</h4>
            <button onClick={copyPrompt}>{copied ? "복사됨 ✓" : "프롬프트 복사"}</button>
          </div>
          <textarea
            className="doc-area"
            value={thoughts}
            onChange={(e) => onThoughts(e.target.value)}
            placeholder="이 주제에 대한 생각·논리를 자유롭게 적어봐.&#10;[프롬프트 복사] → Claude에 붙여넣기 → 답변을 오른쪽에 정리."
          />
          <p className="hint">
            [프롬프트 복사]를 누르면 <b>내 생각 + 정리</b>가 하나의 질문으로 묶여 클립보드에 복사됩니다.
            Claude(claude.ai)에 붙여넣고, 받은 답을 오른쪽에 정리하세요.
          </p>
        </section>

        <aside className="doc-panel side">
          <div className="doc-head">
            <h4>정리 · AI 답변</h4>
          </div>
          <textarea
            className="doc-area"
            value={notes}
            onChange={(e) => onNotes(e.target.value)}
            placeholder="Claude에게 받은 답변 중 남길 부분을 여기 붙여넣고 다듬어 저장하세요."
          />

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
