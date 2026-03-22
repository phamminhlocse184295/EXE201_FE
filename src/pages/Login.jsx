import { useState, useEffect } from "react";
import { login } from "../services/auth";
import { motion } from "framer-motion";

// Các hạt nổi trong nền
const FloatingParticle = ({ delay, size, x, y, duration }) => (
  <div
    style={{
      position: "absolute",
      left: `${x}%`,
      top: `${y}%`,
      width: size,
      height: size,
      borderRadius: "50%",
      background: "var(--grad-primary)",
      opacity: 0.15,
      filter: "blur(1px)",
      animation: `float-particle ${duration}s ${delay}s ease-in-out infinite alternate`,
      pointerEvents: "none",
    }}
  />
);

const particles = [
  { id: 1, delay: 0, size: 12, x: 10, y: 20, duration: 4 },
  { id: 2, delay: 1, size: 8, x: 80, y: 10, duration: 5 },
  { id: 3, delay: 2, size: 16, x: 25, y: 70, duration: 6 },
  { id: 4, delay: 0.5, size: 10, x: 65, y: 60, duration: 4.5 },
  { id: 5, delay: 1.5, size: 14, x: 90, y: 40, duration: 5.5 },
  { id: 6, delay: 3, size: 6, x: 45, y: 85, duration: 3.5 },
  { id: 7, delay: 2.5, size: 18, x: 70, y: 25, duration: 7 },
];

export default function Login() {
  const [email, setEmail] = useState("trungloc@gmail.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [focused, setFocused] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await login({ email, password });

      if (res.success || res.token || res.data?.token || res.access_token || res.data) {
        // Lấy token từ mọi chỗ có thể
        const token =
          res?.token || res?.access_token ||
          res?.data?.token || res?.data?.data?.token ||
          localStorage.getItem("token");

        // Lấy user object từ response (thử nhiều cấu trúc)
        let userFromRes =
          res?.data?.data ||   // {data: {data: {...user...}}}
          res?.data ||          // {data: {...user...}}
          res?.user ||          // {user: {...}}
          null;
        if (Array.isArray(userFromRes)) userFromRes = userFromRes[0];

        // Đọc user đã có trong localStorage (nếu auth.js kịp lưu)
        let storedUser = null;
        try { storedUser = JSON.parse(localStorage.getItem("user") || "null"); } catch {}

        // Merge để không mất trường nào
        const mergedUser = { ...(storedUser || {}), ...(userFromRes || {}) };

        // Lấy role
        let extractedRole =
          mergedUser?.role ||
          res?.role ||
          "";

        // Decode JWT nếu vẫn chưa có role
        if (!extractedRole && token) {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            if (payload?.role) extractedRole = payload.role;
          } catch {}
        }

        const finalRole = (extractedRole || "manager").toLowerCase();

        // Luôn lưu user (dù rỗng cũng force lưu role)
        localStorage.setItem("user", JSON.stringify({ ...mergedUser, role: finalRole }));
        if (token) localStorage.setItem("token", token);

        if (finalRole === "admin") {
          window.location.href = "/admin/revenue";
        } else {
          window.location.href = "/manager/dashboard";
        }
      } else {
        setErr(res.message || "Đăng nhập thất bại. Kiểm tra lại thông tin.");
      }
    } catch (error) {
      setErr(error.response?.data?.message || "Kết nối server thất bại. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <style>{`
        @keyframes float-particle {
          from { transform: translateY(0px) scale(1); opacity: 0.08; }
          to   { transform: translateY(-30px) scale(1.2); opacity: 0.25; }
        }
        @keyframes aurora-anim {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .login-input::placeholder { color: rgba(255,255,255,0.3); }
        .login-input:focus { outline: none; }
        .login-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }
        .login-btn:active:not(:disabled) { transform: translateY(0px); }
        .login-btn:disabled { opacity: 0.65; cursor: not-allowed; }
      `}</style>

      {/* ── Nền Aurora ── */}
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(to bottom right, #020817, #0f172a, #1e1b4b)",
      }}>

        {/* Aurora blobs */}
        <div style={{
          position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none",
        }}>
          <div style={{
            position: "absolute", top: "-20%", left: "-10%",
            width: "60vw", height: "60vw",
            borderRadius: "50%",
            background: "radial-gradient(circle at center, rgba(255,106,0,0.25), transparent 65%)",
            filter: "blur(40px)",
            animation: "aurora-anim 10s ease-in-out infinite",
            backgroundSize: "200% 200%",
          }} />
          <div style={{
            position: "absolute", bottom: "-10%", right: "-10%",
            width: "55vw", height: "55vw",
            borderRadius: "50%",
            background: "radial-gradient(circle at center, rgba(124,58,237,0.30), transparent 65%)",
            filter: "blur(40px)",
            animation: "aurora-anim 14s ease-in-out infinite reverse",
            backgroundSize: "200% 200%",
          }} />
          <div style={{
            position: "absolute", top: "40%", left: "40%",
            width: "40vw", height: "40vw",
            borderRadius: "50%",
            background: "radial-gradient(circle at center, rgba(255,176,0,0.20), transparent 65%)",
            filter: "blur(50px)",
            animation: "aurora-anim 18s ease-in-out infinite",
            backgroundSize: "200% 200%",
          }} />
        </div>

        {/* Particles */}
        {particles.map(p => <FloatingParticle key={p.id} {...p} />)}

        {/* Card */}
        <div style={{
          position: "relative", zIndex: 10,
          width: "min(440px, 100%)",
          borderRadius: "28px",
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(15, 23, 42, 0.72)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 50px 120px rgba(0,0,0,0.5)",
          animation: "fadeInUp 0.6s ease both",
          overflow: "hidden",
        }}>

          {/* Thanh sáng phía trên */}
          <div style={{
            height: "3px",
            background: "var(--grad-primary)",
            backgroundSize: "200% 200%",
            animation: "shimmer 3s linear infinite",
          }} />

          {/* Hero section */}
          <div style={{
            padding: "36px 36px 28px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}>
            {/* Logo badge */}
            <div style={{
              width: 52, height: 52,
              borderRadius: 16,
              background: "var(--grad-primary)",
              boxShadow: "0 12px 30px rgba(255,106,0,0.35)",
              marginBottom: 20,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h1 style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.5px",
              lineHeight: 1.2,
            }}>
              Welcome back 👋
            </h1>
            <p style={{
              margin: "10px 0 0",
              color: "rgba(255,255,255,0.5)",
              fontSize: "14px",
            }}>
              Sign in to your admin account to continue.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: "28px 36px 36px" }}>

            {/* Email field */}
            <div style={{ marginBottom: 18 }}>
              <label style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 8,
                letterSpacing: "0.2px",
              }}>Email address</label>
              <input
                className="login-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                placeholder="you@example.com"
                required
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  borderRadius: "14px",
                  border: focused === "email"
                    ? "1px solid rgba(255,106,0,0.6)"
                    : "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.07)",
                  color: "#fff",
                  fontSize: "15px",
                  transition: "border 0.2s, box-shadow 0.2s",
                  boxShadow: focused === "email"
                    ? "0 0 0 3px rgba(255,106,0,0.18)"
                    : "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Password field */}
            <div style={{ marginBottom: 8 }}>
              <label style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 8,
                letterSpacing: "0.2px",
              }}>Password</label>
              <input
                className="login-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                placeholder="••••••••"
                required
                style={{
                  width: "100%",
                  padding: "13px 16px",
                  borderRadius: "14px",
                  border: focused === "password"
                    ? "1px solid rgba(255,106,0,0.6)"
                    : "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.07)",
                  color: "#fff",
                  fontSize: "15px",
                  transition: "border 0.2s, box-shadow 0.2s",
                  boxShadow: focused === "password"
                    ? "0 0 0 3px rgba(255,106,0,0.18)"
                    : "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Error message */}
            {err && (
              <div style={{
                marginTop: 16,
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid rgba(239,68,68,0.35)",
                background: "rgba(239,68,68,0.12)",
                color: "#fca5a5",
                fontSize: "13px",
                textAlign: "center",
              }}>
                ⚠️ {err}
              </div>
            )}

            {/* Submit button */}
            <button
              className="login-btn"
              type="submit"
              disabled={loading}
              style={{
                marginTop: "24px",
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                border: "none",
                background: "var(--grad-primary)",
                color: "white",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 12px 32px rgba(255,106,0,0.32)",
                transition: "transform 0.18s ease, filter 0.18s ease",
                letterSpacing: "0.3px",
              }}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Signing in...
                </span>
              ) : "Sign In →"}
            </button>

          </form>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
