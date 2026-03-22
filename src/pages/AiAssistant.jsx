import React, { useState, useRef, useEffect } from "react";
import { askAiQuestion } from "../services/aiService";

// ── Suggested prompts ──
const SUGGESTIONS = [
  "Hệ thống có bao nhiêu người dùng?",
  "Doanh thu tháng này là bao nhiêu?",
  "Khóa học nào bán chạy nhất?",
  "Có bao nhiêu bài tập trong thư viện?",
];

// ── Animated dots for "thinking" ──
function ThinkingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: "50%",
          background: "#00f5ff",
          animation: `aiPulse 1.2s ${i * 0.2}s ease-in-out infinite`,
          boxShadow: "0 0 8px #00f5ff",
        }} />
      ))}
    </span>
  );
}

// ── Glitch text effect ──
function GlitchText({ children }) {
  return (
    <span style={{ position: "relative", display: "inline-block" }} className="glitch-wrap">
      <span style={{ color: "#00f5ff", fontFamily: "monospace", letterSpacing: "2px", fontWeight: 900 }}>
        {children}
      </span>
    </span>
  );
}

export default function AiAssistant() {
  const [messages, setMessages] = useState([{
    sender: "bot",
    text: "SYSTEM ONLINE. Xin chào! Tôi là AI Assistant của EasyStretch — sẵn sàng phân tích dữ liệu hệ thống cho bạn. Hỏi bất cứ điều gì về người dùng, doanh thu, khóa học...",
    time: new Date(),
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (text) => {
    const userMsg = (text || input).trim();
    if (!userMsg) return;
    setMessages(prev => [...prev, { sender: "user", text: userMsg, time: new Date() }]);
    setInput("");
    setCharCount(0);
    setLoading(true);
    try {
      const res = await askAiQuestion(userMsg);
      const botReply = res.data?.answer || res.answer || "NEURAL NETWORK ERROR — Không thể tìm thấy câu trả lời.";
      const queryUsed = res.data?.query_used || res.query_used || "";
      setMessages(prev => [...prev, { sender: "bot", text: botReply, queryInfo: queryUsed, time: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { sender: "bot", text: "⚠ CONNECTION FAILED — Hệ thống AI đang bận hoặc mất kết nối. Vui lòng thử lại.", time: new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const fmtTime = d => d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 112px)", gap: 14, position: "relative" }}>
      {/* CSS Keyframes */}
      <style>{`
        @keyframes aiPulse { 0%,100%{opacity:.2;transform:scale(.8)} 50%{opacity:1;transform:scale(1.2)} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes borderGlow { 0%,100%{box-shadow:0 0 8px #00f5ff33,0 0 20px #00f5ff11,inset 0 0 8px #00f5ff05} 50%{box-shadow:0 0 16px #00f5ff66,0 0 40px #00f5ff22,inset 0 0 16px #00f5ff0a} }
        @keyframes msgIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes hue-rotate { 0%{filter:hue-rotate(0deg)} 100%{filter:hue-rotate(360deg)} }
        @keyframes gridMove { 0%{background-position:0 0} 100%{background-position:40px 40px} }
        .ai-msg { animation: msgIn 0.3s ease-out; }
        .ai-input::placeholder { color: rgba(0,245,255,0.3); }
        .ai-input:focus { outline: none; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ position: "relative", padding: "16px 20px", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(0,245,255,0.2)", background: "rgba(0,10,20,0.8)", animation: "borderGlow 3s ease-in-out infinite", flexShrink: 0 }}>
        {/* Scanline effect */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,245,255,0.015) 2px,rgba(0,245,255,0.015) 4px)", pointerEvents: "none" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* AI Avatar */}
            <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#001a2e,#003d60)", border: "2px solid #00f5ff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px #00f5ff44, inset 0 0 20px #00f5ff11", fontSize: 22 }}>🤖</div>
              <div style={{ position: "absolute", bottom: 0, right: 0, width: 12, height: 12, borderRadius: "50%", background: "#00ff88", border: "2px solid #0a0a1a", boxShadow: "0 0 8px #00ff88" }} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <GlitchText>AI NEURAL ASSISTANT</GlitchText>
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: "rgba(0,255,136,0.15)", color: "#00ff88", fontFamily: "monospace", border: "1px solid rgba(0,255,136,0.3)", letterSpacing: "1px" }}>ONLINE</span>
              </div>
              <div style={{ fontSize: 12, color: "rgba(0,245,255,0.5)", fontFamily: "monospace", marginTop: 2 }}>
                EasyStretch Data Intelligence v2.0 — <span style={{ color: "#00f5ff" }}>{messages.length}</span> messages
              </div>
            </div>
          </div>
          {/* Stats */}
          <div style={{ display: "flex", gap: 20 }}>
            {[{ label: "LATENCY", val: "~1.2s" }, { label: "MODEL", val: "GPT-4o" }, { label: "STATUS", val: loading ? "PROCESSING" : "READY" }].map(({ label, val }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "rgba(0,245,255,0.4)", fontFamily: "monospace", letterSpacing: "1px" }}>{label}</div>
                <div style={{ fontSize: 13, color: loading && label === "STATUS" ? "#f59e0b" : "#00f5ff", fontFamily: "monospace", fontWeight: 700 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Chat Window ── */}
      <div style={{ flex: 1, position: "relative", borderRadius: 16, overflow: "hidden", border: "1px solid rgba(0,245,255,0.15)", background: "rgba(0,6,16,0.9)", display: "flex", flexDirection: "column" }}>
        {/* Animated grid background */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,245,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,245,255,0.03) 1px,transparent 1px)", backgroundSize: "40px 40px", animation: "gridMove 8s linear infinite", pointerEvents: "none" }} />

        {/* Corner decorations */}
        {["top-left","top-right","bottom-left","bottom-right"].map(pos => (
          <div key={pos} style={{ position: "absolute", width: 20, height: 20, borderColor: "#00f5ff", borderStyle: "solid", borderWidth: 0, opacity: 0.5, zIndex: 1,
            ...(pos.includes("top") ? { top: 8 } : { bottom: 8 }),
            ...(pos.includes("left") ? { left: 8, borderLeftWidth: 2, borderTopWidth: pos.includes("top") ? 2 : 0, borderBottomWidth: pos.includes("bottom") ? 2 : 0 } : { right: 8, borderRightWidth: 2, borderTopWidth: pos.includes("top") ? 2 : 0, borderBottomWidth: pos.includes("bottom") ? 2 : 0 })
          }} />
        ))}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14, position: "relative", zIndex: 1 }}>
          {messages.map((msg, i) => (
            <div key={i} className="ai-msg" style={{ display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start", gap: 10, alignItems: "flex-start" }}>
              {msg.sender === "bot" && (
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#001a2e,#003d60)", border: "1px solid #00f5ff44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, boxShadow: "0 0 10px #00f5ff33" }}>🤖</div>
              )}
              <div style={{ maxWidth: "72%", position: "relative" }}>
                {/* Sender label */}
                <div style={{ fontSize: 9, fontFamily: "monospace", letterSpacing: "1.5px", marginBottom: 4, color: msg.sender === "user" ? "rgba(99,102,241,0.7)" : "rgba(0,245,255,0.5)", textAlign: msg.sender === "user" ? "right" : "left" }}>
                  {msg.sender === "user" ? "► YOU" : "◄ NEURAL-AI"} · {fmtTime(msg.time)}
                </div>
                <div style={{
                  padding: "12px 16px", borderRadius: msg.sender === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                  background: msg.sender === "user" ? "linear-gradient(135deg,rgba(99,102,241,0.25),rgba(59,130,246,0.15))" : "rgba(0,20,40,0.8)",
                  border: `1px solid ${msg.sender === "user" ? "rgba(99,102,241,0.4)" : "rgba(0,245,255,0.2)"}`,
                  boxShadow: msg.sender === "user" ? "0 0 20px rgba(99,102,241,0.15)" : "0 0 20px rgba(0,245,255,0.1)",
                  fontSize: 13, lineHeight: 1.7, color: msg.sender === "user" ? "#c7d2fe" : "#9de8f0",
                  fontFamily: msg.sender === "bot" ? "'Courier New', monospace" : "inherit",
                }}>
                  {msg.text}
                  {msg.queryInfo && (
                    <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(0,0,0,0.4)", borderRadius: 8, borderLeft: "2px solid #00f5ff44" }}>
                      <div style={{ fontSize: 9, color: "rgba(0,245,255,0.5)", letterSpacing: "1px", marginBottom: 4 }}>▸ SQL QUERY EXECUTED</div>
                      <code style={{ fontSize: 11, color: "#00f5ff77", fontFamily: "monospace" }}>{msg.queryInfo}</code>
                    </div>
                  )}
                </div>
              </div>
              {msg.sender === "user" && (
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,rgba(99,102,241,0.4),rgba(59,130,246,0.3))", border: "1px solid rgba(99,102,241,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#c7d2fe", fontSize: 13, flexShrink: 0 }}>U</div>
              )}
            </div>
          ))}

          {/* Loading / Thinking indicator */}
          {loading && (
            <div className="ai-msg" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#001a2e,#003d60)", border: "1px solid #00f5ff44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
              <div style={{ padding: "14px 18px", borderRadius: "4px 16px 16px 16px", background: "rgba(0,20,40,0.8)", border: "1px solid rgba(0,245,255,0.2)", display: "flex", alignItems: "center", gap: 12 }}>
                <ThinkingDots />
                <span style={{ fontSize: 12, color: "rgba(0,245,255,0.5)", fontFamily: "monospace", letterSpacing: "1px" }}>PROCESSING NEURAL QUERY...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested prompts */}
        {messages.length <= 1 && !loading && (
          <div style={{ padding: "0 24px 16px", display: "flex", gap: 8, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => handleSend(s)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(0,245,255,0.2)", background: "rgba(0,245,255,0.06)", color: "rgba(0,245,255,0.7)", cursor: "pointer", fontSize: 12, fontFamily: "monospace", transition: "all 0.18s" }}
                onMouseEnter={e => { e.target.style.background = "rgba(0,245,255,0.14)"; e.target.style.borderColor = "rgba(0,245,255,0.5)"; }}
                onMouseLeave={e => { e.target.style.background = "rgba(0,245,255,0.06)"; e.target.style.borderColor = "rgba(0,245,255,0.2)"; }}
              >
                ▸ {s}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div style={{ padding: "12px 20px 16px", borderTop: "1px solid rgba(0,245,255,0.1)", background: "rgba(0,8,20,0.9)", position: "relative", zIndex: 1 }}>
          {/* Char counter + status bar */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(0,245,255,0.3)", letterSpacing: "1px" }}>
              {focused ? "► INPUT ACTIVE" : "◌ STANDBY"} {loading && "· AWAITING RESPONSE..."}
            </span>
            <span style={{ fontSize: 10, fontFamily: "monospace", color: charCount > 200 ? "#f87171" : "rgba(0,245,255,0.3)" }}>
              {charCount}/500
            </span>
          </div>
          <form onSubmit={e => { e.preventDefault(); handleSend(); }} style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ flex: 1, position: "relative" }}>
              {/* Neon border on focus */}
              <div style={{ position: "absolute", inset: -1, borderRadius: 11, background: focused ? "linear-gradient(90deg,#00f5ff,#6366f1,#00f5ff)" : "transparent", backgroundSize: "200% 100%", animation: focused ? "hue-rotate 3s linear infinite" : "none", opacity: 0.6, zIndex: 0 }} />
              <input
                ref={inputRef}
                className="ai-input"
                style={{ position: "relative", zIndex: 1, width: "100%", padding: "13px 46px 13px 20px", borderRadius: 10, border: "1px solid rgba(0,245,255,0.2)", background: "rgba(0,10,30,0.9)", color: "#00f5ff", fontSize: 13, fontFamily: "'Courier New', monospace", letterSpacing: "0.5px", outline: "none", boxSizing: "border-box", transition: "border 0.2s", boxShadow: focused ? "0 0 20px rgba(0,245,255,0.15), inset 0 0 20px rgba(0,245,255,0.05)" : "none" }}
                placeholder="ENTER QUERY // Hỏi AI về dữ liệu hệ thống..."
                value={input}
                onChange={e => { setInput(e.target.value); setCharCount(e.target.value.length); }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                disabled={loading}
                maxLength={500}
              />
              {/* Cursor blink indicator */}
              {focused && !input && <span style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", color: "#00f5ff", animation: "cursorBlink 1s step-end infinite", pointerEvents: "none", fontSize: 16, zIndex: 2 }}>_</span>}
            </div>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                padding: "13px 22px", borderRadius: 10, border: "1px solid rgba(0,245,255,0.4)",
                background: loading || !input.trim() ? "rgba(0,245,255,0.05)" : "linear-gradient(135deg,rgba(0,245,255,0.15),rgba(99,102,241,0.25))",
                color: loading || !input.trim() ? "rgba(0,245,255,0.3)" : "#00f5ff",
                fontWeight: 900, fontSize: 13, cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                fontFamily: "monospace", letterSpacing: "2px",
                boxShadow: !loading && input.trim() ? "0 0 20px rgba(0,245,255,0.2)" : "none",
                transition: "all 0.18s", whiteSpace: "nowrap",
              }}
            >
              {loading ? "WAIT..." : "SEND →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
