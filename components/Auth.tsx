"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

// 이메일 매직 링크 로그인. 비밀번호 없음.
export default function Auth() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setErr("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      // 링크를 누르면 다시 이 앱으로 돌아온다.
      options: { emailRedirectTo: window.location.href },
    });
    setBusy(false);
    if (error) setErr(error.message);
    else setSent(true);
  }

  return (
    <div className="auth">
      <h1>CareerPath</h1>
      <p className="muted">주제별로 커리어 고민을 정리하고, 어디서나 이어보기.</p>
      {sent ? (
        <div className="auth-card">
          <p>
            <b>{email}</b> 으로 로그인 링크를 보냈습니다.
          </p>
          <p className="muted">메일의 링크를 열면 로그인됩니다. (폰·컴 각각 한 번씩)</p>
        </div>
      ) : (
        <form className="auth-card" onSubmit={send}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 주소"
            autoComplete="email"
          />
          <button disabled={busy || !email.trim()}>{busy ? "보내는 중…" : "로그인 링크 받기"}</button>
          {err && <div className="err">{err}</div>}
        </form>
      )}
    </div>
  );
}
