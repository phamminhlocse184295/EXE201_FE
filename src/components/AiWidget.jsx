import React, { useState, useRef, useEffect } from "react";
import { askAiQuestion } from "../services/aiService";
import { playTick, playOpen, playClose, playSend, playReceive } from "../lib/sounds";

// ─── Typewriter component ─────────────────────────────────────────────────────
function TypewriterText({ text, speed = 18, onDone }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const idxRef = useRef(0);

  useEffect(() => {
    idxRef.current = 0;
    setDisplayed("");
    setDone(false);
    const tick = () => {
      if (idxRef.current >= text.length) { setDone(true); onDone?.(); return; }
      idxRef.current++;
      setDisplayed(text.slice(0, idxRef.current));
      // Play tick every 2 chars to avoid sound spam
      if (idxRef.current % 2 === 0) playTick();
    };
    const id = setInterval(tick, speed);
    return () => clearInterval(id);
  }, [text]);

  return (
    <span>
      {displayed}
      {!done && <span style={{ display: "inline-block", width: 8, height: 12, background: "#00f5ff", opacity: 0.9, marginLeft: 1, verticalAlign: "middle", animation: "wBlink 0.6s step-end infinite" }} />}
    </span>
  );
}

// ─── Thinking dots ────────────────────────────────────────────────────────────
function ThinkingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#00f5ff", animation: `wPulse 1.2s ${i * 0.2}s ease-in-out infinite`, boxShadow: "0 0 6px #00f5ff", display: "inline-block" }} />
      ))}
    </span>
  );
}

export default function AiWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{
    sender: "bot", text: "SYSTEM ONLINE // Xin chào! Tôi là AI Assistant. Hỏi tôi bất cứ điều gì về dữ liệu hệ thống.", id: 0, typed: true,
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pulse, setPulse] = useState(false);
  const messagesEndRef = useRef(null);
  const msgIdRef = useRef(1);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) return;
    const id = setInterval(() => { setPulse(true); setTimeout(() => setPulse(false), 700); }, 5000);
    return () => clearInterval(id);
  }, [isOpen]);

  const openWidget = () => { playOpen(); setIsOpen(true); };
  const closeWidget = () => { playClose(); setIsOpen(false); };

  const markTyped = (id) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, typed: true } : m));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input.trim();
    playSend();
    const uid = msgIdRef.current++;
    setMessages(prev => [...prev, { sender: "user", text: userMsg, id: uid, typed: true }]);
    setInput("");
    setLoading(true);
    try {
      const res = await askAiQuestion(userMsg);
      const botReply = res.data?.answer || res.answer || "NEURAL ERROR — Không tìm thấy câu trả lời.";
      playReceive();
      const bid = msgIdRef.current++;
      setMessages(prev => [...prev, { sender: "bot", text: botReply, id: bid, typed: false }]);
    } catch {
      playReceive();
      const bid = msgIdRef.current++;
      setMessages(prev => [...prev, { sender: "bot", text: "⚠ CONNECTION FAILED — Vui lòng thử lại sau.", id: bid, typed: false }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes wPulse { 0%,100%{opacity:.2;transform:scale(.7)} 50%{opacity:1;transform:scale(1.3)} }
        @keyframes wGlow { 0%,100%{box-shadow:0 0 16px #00f5ff44,0 0 40px #00f5ff11} 50%{box-shadow:0 0 28px #00f5ff88,0 0 60px #00f5ff33} }
        @keyframes wOrbit { 0%{transform:rotate(0deg) translateX(32px) rotate(0deg)} 100%{transform:rotate(360deg) translateX(32px) rotate(-360deg)} }
        @keyframes wPulseScale { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
        @keyframes wMsgIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes wScan { 0%{transform:translateY(-100%)} 100%{transform:translateY(600px)} }
        @keyframes wHue { 0%{filter:hue-rotate(0deg)} 100%{filter:hue-rotate(360deg)} }
        @keyframes wGridMove { 0%{background-position:0 0} 100%{background-position:20px 20px} }
        @keyframes wBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        .w-msg { animation: wMsgIn 0.25s ease-out; }
        .w-input::placeholder { color: rgba(0,245,255,0.3); font-family: monospace; }
        .w-input:focus { outline: none; }
      `}</style>

      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
        {/* Floating Button */}
        {!isOpen && (
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: -8, borderRadius: "50%", border: "1px solid rgba(0,245,255,0.2)", animation: "wGlow 2s ease-in-out infinite", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: "50%", left: "50%", width: 0, height: 0, animation: "wOrbit 3s linear infinite", pointerEvents: "none" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00f5ff", boxShadow: "0 0 8px #00f5ff", marginTop: -3, marginLeft: -3 }} />
            </div>
            <button onClick={openWidget} style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg,#001a2e,#003d60)", color: "#00f5ff", border: "2px solid #00f5ff44", boxShadow: "0 0 20px rgba(0,245,255,0.3), inset 0 0 20px rgba(0,245,255,0.08)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, transition: "all 0.2s", animation: pulse ? "wPulseScale 0.7s ease-in-out" : "wGlow 2s ease-in-out infinite" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}>
              🤖
            </button>
            <div style={{ position: "absolute", top: -2, right: -2, width: 14, height: 14, borderRadius: "50%", background: "#00ff88", border: "2px solid #0a0a1a", boxShadow: "0 0 8px #00ff88" }} />
          </div>
        )}

        {/* Chat Popup */}
        {isOpen && (
          <div style={{ width: 380, height: 560, background: "rgba(0,6,16,0.97)", borderRadius: 18, overflow: "hidden", border: "1px solid rgba(0,245,255,0.2)", boxShadow: "0 0 40px rgba(0,245,255,0.15), 0 20px 60px rgba(0,0,0,0.8)", display: "flex", flexDirection: "column", animation: "wMsgIn 0.25s ease-out", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,245,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,0.025) 1px,transparent 1px)", backgroundSize: "20px 20px", animation: "wGridMove 6s linear infinite", pointerEvents: "none", zIndex: 0 }} />
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 80, background: "linear-gradient(transparent,rgba(0,245,255,0.03),transparent)", animation: "wScan 4s linear infinite", pointerEvents: "none", zIndex: 1 }} />

            {/* Header */}
            <div style={{ padding: "14px 18px", background: "rgba(0,12,28,0.95)", borderBottom: "1px solid rgba(0,245,255,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 2, flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ position: "relative" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#001a2e,#003d60)", border: "1.5px solid rgba(0,245,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, boxShadow: "0 0 12px rgba(0,245,255,0.3)" }}>🤖</div>
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 9, height: 9, borderRadius: "50%", background: loading ? "#f59e0b" : "#00ff88", border: "1.5px solid #0a0a1a", boxShadow: `0 0 6px ${loading ? "#f59e0b" : "#00ff88"}` }} />
                </div>
                <div>
                  <div style={{ color: "#00f5ff", fontFamily: "monospace", fontWeight: 900, fontSize: 13, letterSpacing: "1.5px" }}>AI NEURAL ASSISTANT</div>
                  <div style={{ color: "rgba(0,245,255,0.45)", fontSize: 10, fontFamily: "monospace" }}>{loading ? "▸ PROCESSING QUERY..." : "▸ ONLINE · READY"}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <span style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(0,245,255,0.35)", background: "rgba(0,245,255,0.08)", padding: "3px 8px", borderRadius: 4, border: "1px solid rgba(0,245,255,0.15)" }}>{messages.length} MSG</span>
                <button onClick={closeWidget} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", borderRadius: 6, width: 26, height: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900 }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.3)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}>✕</button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10, position: "relative", zIndex: 2 }}>
              {messages.map((msg) => (
                <div key={msg.id} className="w-msg" style={{ display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}>
                  {msg.sender === "bot" && (
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(0,20,45,0.85)", border: "1px solid rgba(0,245,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>🤖</div>
                  )}
                  <div style={{ maxWidth: "78%", padding: "10px 13px", fontSize: 12, lineHeight: 1.6, borderRadius: msg.sender === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px", background: msg.sender === "user" ? "linear-gradient(135deg,rgba(99,102,241,0.25),rgba(59,130,246,0.15))" : "rgba(0,20,45,0.85)", border: `1px solid ${msg.sender === "user" ? "rgba(99,102,241,0.35)" : "rgba(0,245,255,0.15)"}`, color: msg.sender === "user" ? "#c7d2fe" : "#9de8f0", fontFamily: msg.sender === "bot" ? "'Courier New', monospace" : "inherit", boxShadow: msg.sender === "user" ? "0 0 12px rgba(99,102,241,0.15)" : "0 0 12px rgba(0,245,255,0.08)" }}>
                    {msg.sender === "bot" && !msg.typed
                      ? <TypewriterText text={msg.text} speed={16} onDone={() => markTyped(msg.id)} />
                      : msg.text}
                  </div>
                  {msg.sender === "user" && (
                    <div style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,rgba(99,102,241,0.4),rgba(59,130,246,0.3))", border: "1px solid rgba(99,102,241,0.4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#c7d2fe", fontSize: 10, fontWeight: 900, flexShrink: 0 }}>U</div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="w-msg" style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(0,20,45,0.85)", border: "1px solid rgba(0,245,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🤖</div>
                  <div style={{ padding: "10px 14px", borderRadius: "4px 14px 14px 14px", background: "rgba(0,20,45,0.85)", border: "1px solid rgba(0,245,255,0.15)", display: "flex", alignItems: "center", gap: 10 }}>
                    <ThinkingDots />
                    <span style={{ fontSize: 10, color: "rgba(0,245,255,0.4)", fontFamily: "monospace", letterSpacing: "1px" }}>PROCESSING...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "10px 14px 14px", borderTop: "1px solid rgba(0,245,255,0.1)", background: "rgba(0,8,20,0.98)", position: "relative", zIndex: 2, flexShrink: 0 }}>
              <div style={{ fontSize: 9, fontFamily: "monospace", color: "rgba(0,245,255,0.3)", letterSpacing: "1px", marginBottom: 7 }}>
                {focused ? "► INPUT ACTIVE" : "◌ STANDBY"}{loading && " · AWAITING RESPONSE..."}
              </div>
              <form onSubmit={handleSend} style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  {focused && <div style={{ position: "absolute", inset: -1, borderRadius: 11, background: "linear-gradient(90deg,#00f5ff,#6366f1,#00f5ff)", backgroundSize: "200%", animation: "wHue 3s linear infinite", opacity: 0.5, zIndex: 0 }} />}
                  <input className="w-input" style={{ position: "relative", zIndex: 1, width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(0,245,255,0.2)", background: "rgba(0,10,30,0.95)", color: "#00f5ff", fontSize: 12, fontFamily: "monospace", outline: "none", boxSizing: "border-box", boxShadow: focused ? "0 0 14px rgba(0,245,255,0.12)" : "none" }}
                    placeholder="ENTER QUERY..." value={input}
                    onChange={e => setInput(e.target.value)}
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    disabled={loading} />
                </div>
                <button type="submit" disabled={loading || !input.trim()} style={{ padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(0,245,255,0.3)", background: loading || !input.trim() ? "rgba(0,245,255,0.05)" : "linear-gradient(135deg,rgba(0,245,255,0.15),rgba(99,102,241,0.25))", color: loading || !input.trim() ? "rgba(0,245,255,0.25)" : "#00f5ff", cursor: loading || !input.trim() ? "not-allowed" : "pointer", fontFamily: "monospace", fontWeight: 900, fontSize: 12, letterSpacing: "1px", boxShadow: !loading && input.trim() ? "0 0 16px rgba(0,245,255,0.2)" : "none", transition: "all 0.18s", whiteSpace: "nowrap" }}>SEND</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
