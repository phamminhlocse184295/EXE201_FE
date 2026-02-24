import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      // Gọi hàm login từ services/auth.js
      const res = await login({ email, password });

      if (res.success) {
        navigate("/dashboard");
      } else {
        setErr(res.message || "Đăng nhập thất bại. Kiểm tra lại thông tin.");
      }
    } catch (error) {
      // Bắt chính xác thông báo lỗi từ backend trả về
      const errorMsg =
        error.response?.data?.message ||
        "Kết nối server thất bại. Vui lòng thử lại sau.";
      setErr(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authBg">
      <div className="authCard">
        <div className="authTop">
          <h2 className="authTitle">Welcome back</h2>
          <p className="authHint">Sign in to continue to Admin.</p>
        </div>

        <form className="authBody" onSubmit={handleSubmit}>
          <div>
            <div className="authLabel">Email</div>
            <input
              className="authInput"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gmail.com"
              required
            />
          </div>

          <div style={{ marginTop: "16px" }}>
            <div className="authLabel">Password</div>
            <input
              className="authInput"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {err ? (
            <div
              className="errorBox"
              style={{
                color: "#ef4444",
                background: "#fee2e2",
                padding: "10px",
                borderRadius: "6px",
                marginTop: "16px",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              {err}
            </div>
          ) : null}

          <button
            className="btn btnPrimary"
            disabled={loading}
            type="submit"
            style={{ width: "100%", marginTop: "24px", padding: "12px" }}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
