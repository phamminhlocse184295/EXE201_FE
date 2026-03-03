import React, { useState, useRef, useEffect } from "react";
import { askAiQuestion } from "../services/aiService";

export default function AiWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Xin chào sếp! Tôi là AI trợ lý. Sếp cần tra cứu dữ liệu gì hôm nay?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Cuộn xuống cuối mỗi khi có tin nhắn mới
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await askAiQuestion(userMsg);
      const botReply =
        res.data?.answer ||
        res.answer ||
        "Xin lỗi, tôi không tìm thấy câu trả lời.";

      // Vẫn gọi API bình thường nhưng mình lờ đi cái query_used, không thèm lưu vào state nữa để khỏi hiển thị
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (error) {
      console.error("Lỗi AI:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Hệ thống AI đang bận. Vui lòng thử lại sau!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
      {/* NÚT BẤM BONG BÓNG CHAT */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "#8b5cf6",
            color: "#fff",
            border: "none",
            boxShadow: "0 4px 12px rgba(139, 92, 246, 0.4)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          ✨
        </button>
      )}

      {/* KHUNG CHAT KHI ĐƯỢC MỞ LÊN */}
      {isOpen && (
        <div
          style={{
            width: 360,
            height: 500,
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid #e2e8f0",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "#8b5cf6",
              color: "#fff",
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span>🤖</span> AI Assistant
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: 20,
                cursor: "pointer",
              }}
            >
              ✖
            </button>
          </div>

          {/* Body chứa tin nhắn */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: 16,
              background: "#f8fafc",
              display: "flex",
              flexDirection: "column",
              gap: 12,
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
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius: 16,
                    fontSize: 14,
                    background: msg.sender === "user" ? "#8b5cf6" : "#fff",
                    color: msg.sender === "user" ? "#fff" : "#333",
                    border: msg.sender === "bot" ? "1px solid #e2e8f0" : "none",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  {/* Nội dung chat gọn gàng, không còn cái SQL nào nữa */}
                  <div style={{ lineHeight: 1.5 }}>{msg.text}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    background: "#fff",
                    padding: "10px 14px",
                    borderRadius: 16,
                    border: "1px solid #e2e8f0",
                    fontSize: 14,
                  }}
                >
                  <span style={{ color: "#94a3b8" }}>Đang suy nghĩ... 🤔</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form nhập liệu */}
          <div
            style={{
              padding: 12,
              borderTop: "1px solid #eee",
              background: "#fff",
            }}
          >
            <form onSubmit={handleSend} style={{ display: "flex", gap: 8 }}>
              <input
                style={{
                  flex: 1,
                  borderRadius: 99,
                  border: "1px solid #e2e8f0",
                  padding: "10px 16px",
                  outline: "none",
                }}
                placeholder="Hỏi AI..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />
              <button
                type="submit"
                style={{
                  background: loading || !input.trim() ? "#e2e8f0" : "#8b5cf6",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                disabled={loading || !input.trim()}
              >
                ➤
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
