import React, { useState, useRef, useEffect } from "react";
import { askAiQuestion } from "../services/aiService";

export default function AiAssistant() {
  const [messages, setMessages] = useState([{
    sender: "bot",
    text: "Xin chào! Tôi là trợ lý AI của EasyStretch. Bạn muốn biết gì về dữ liệu hệ thống (số lượng người dùng, doanh thu...)? 👋",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setInput("");
    setLoading(true);
    try {
      const res = await askAiQuestion(userMsg);
      const botReply = res.data?.answer || res.answer || "Xin lỗi, tôi không tìm thấy câu trả lời.";
      const queryUsed = res.data?.query_used || res.query_used || "";
      setMessages(prev => [...prev, { sender: "bot", text: botReply, queryInfo: queryUsed }]);
    } catch {
      setMessages(prev => [...prev, { sender: "bot", text: "Hệ thống AI đang bận hoặc có lỗi kết nối. Vui lòng thử lại sau!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 112px)", gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontWeight: 900, fontSize: 24, color: "#fff" }}>🤖 Trợ Lý AI</h2>
        <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, marginTop: 4 }}>Hỏi đáp dữ liệu hệ thống bằng ngôn ngữ tự nhiên</div>
      </div>

      {/* Chat window */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.03)", overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}>
        {/* Messages area */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "20px 24px",
          display: "flex", flexDirection: "column", gap: 16,
          background: "rgba(0,0,0,0.15)",
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start", gap: 10, alignItems: "flex-end" }}>
              {msg.sender === "bot" && (
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                }}>🤖</div>
              )}
              <div style={{
                maxWidth: "72%", padding: "12px 16px", borderRadius: msg.sender === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: msg.sender === "user"
                  ? "linear-gradient(135deg,#3b82f6,#6366f1)"
                  : "rgba(255,255,255,0.07)",
                color: "#fff",
                border: msg.sender === "bot" ? "1px solid rgba(255,255,255,0.08)" : "none",
                boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
                fontSize: 14, lineHeight: 1.6,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 4, opacity: 0.55, letterSpacing: "0.5px" }}>
                  {msg.sender === "user" ? "BẠN" : "AI ASSISTANT"}
                </div>
                <div>{msg.text}</div>
                {msg.queryInfo && (
                  <div style={{ marginTop: 10, padding: "8px 10px", background: "rgba(0,0,0,0.3)", borderRadius: 8, fontSize: 11, fontFamily: "monospace", color: "#94a3b8" }}>
                    <b>Query:</b> {msg.queryInfo}
                  </div>
                )}
              </div>
              {msg.sender === "user" && (
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg,#f59e0b,#ef4444)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff", fontSize: 14,
                }}>U</div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start", gap: 10, alignItems: "flex-end" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
              <div style={{ padding: "12px 18px", borderRadius: "18px 18px 18px 4px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", fontSize: 14, display: "flex", gap: 4, alignItems: "center" }}>
                <span style={{ animation: "pulse 1s ease-in-out infinite" }}>●</span>
                <span style={{ animation: "pulse 1s 0.2s ease-in-out infinite" }}>●</span>
                <span style={{ animation: "pulse 1s 0.4s ease-in-out infinite" }}>●</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div style={{
          padding: "16px 20px",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(0,0,0,0.2)",
        }}>
          <form onSubmit={handleSend} style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input
              style={{
                flex: 1, padding: "13px 20px", borderRadius: 999,
                border: focused ? "1px solid rgba(99,102,241,0.6)" : "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 14,
                outline: "none", transition: "border 0.2s, box-shadow 0.2s",
                boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.18)" : "none",
              }}
              placeholder="Ví dụ: Hiện tại hệ thống có bao nhiêu người dùng?"
              value={input}
              onChange={e => setInput(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                padding: "13px 24px", borderRadius: 999, border: "none",
                background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
                boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
                opacity: loading || !input.trim() ? 0.5 : 1,
                transition: "all 0.18s",
              }}
            >
              Gửi →
            </button>
          </form>
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:1} }`}</style>
    </div>
  );
}
