import React, { useState, useRef, useEffect } from "react";
import { askAiQuestion } from "../services/aiService";

export default function AiAssistant() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Xin chào! Tôi là trợ lý AI của EasyStretch. Bạn muốn biết gì về dữ liệu hệ thống (số lượng người dùng, doanh thu...)?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    // Thêm tin nhắn của User vào khung chat
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await askAiQuestion(userMsg);
      // Bóc tách câu trả lời từ API
      const botReply =
        res.data?.answer ||
        res.answer ||
        "Xin lỗi, tôi không tìm thấy câu trả lời.";
      const queryUsed = res.data?.query_used || res.query_used || "";

      // Thêm câu trả lời của Bot
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: botReply, queryInfo: queryUsed },
      ]);
    } catch (error) {
      console.error("Lỗi AI:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Hệ thống AI đang bận hoặc có lỗi kết nối. Vui lòng thử lại sau!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 120px)",
      }}
    >
      <div>
        <h2 style={{ margin: 0, fontWeight: 900 }}>Trợ Lý AI (Manager)</h2>
        <div style={{ color: "var(--muted)", marginBottom: 16 }}>
          Hỏi đáp dữ liệu hệ thống bằng ngôn ngữ tự nhiên
        </div>
      </div>

      {/* KHUNG CHAT */}
      <div
        className="card"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Vùng hiển thị tin nhắn */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            background: "#f8fafc",
          }}
        >
          {messages.map((msg, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent:
                  msg.sender === "user" ? "flex-end" : "flex-start",
              }}
            >
              <div
                style={{
                  maxWidth: "70%",
                  padding: "12px 16px",
                  borderRadius: 16,
                  background: msg.sender === "user" ? "#3B82F6" : "#ffffff",
                  color: msg.sender === "user" ? "#ffffff" : "#333",
                  border: msg.sender === "bot" ? "1px solid #e2e8f0" : "none",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
              >
                {/* Icon Bot/User */}
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    marginBottom: 4,
                    color: msg.sender === "user" ? "#93c5fd" : "#94a3b8",
                  }}
                >
                  {msg.sender === "user" ? "Bạn" : "🤖 AI Assistant"}
                </div>

                {/* Nội dung chat */}
                <div style={{ lineHeight: 1.5 }}>{msg.text}</div>

                {/* Nếu có câu Query SQL thì hiện nhỏ nhỏ cho ngầu */}
                {msg.queryInfo && (
                  <div
                    style={{
                      marginTop: 8,
                      padding: 8,
                      background: "#f1f5f9",
                      borderRadius: 6,
                      fontSize: 11,
                      fontFamily: "monospace",
                      color: "#64748b",
                    }}
                  >
                    <b>Truy vấn: </b> {msg.queryInfo}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div
                style={{
                  background: "#ffffff",
                  padding: "12px 16px",
                  borderRadius: 16,
                  border: "1px solid #e2e8f0",
                }}
              >
                <span style={{ color: "#94a3b8" }}>AI đang suy nghĩ... 🤔</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Ô nhập chat */}
        <div
          style={{
            padding: 16,
            borderTop: "1px solid #eee",
            background: "#fff",
          }}
        >
          <form onSubmit={handleSend} style={{ display: "flex", gap: 10 }}>
            <input
              className="input"
              style={{ flex: 1, borderRadius: 99, padding: "12px 20px" }}
              placeholder="Ví dụ: Hiện tại hệ thống có bao nhiêu người dùng?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="btn btnPrimary"
              style={{ borderRadius: 99, padding: "0 24px", fontWeight: 700 }}
              disabled={loading || !input.trim()}
            >
              Gửi
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
