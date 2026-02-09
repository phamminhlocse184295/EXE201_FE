import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth"; // Dùng hàm login đã viết ở auth.js

export default function Login() {
  const navigate = useNavigate();
  // Dựa trên ảnh Swagger, API nhận email và password
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

      // Theo cấu trúc ảnh: res có success: true
      if (res.success) {
        navigate("/dashboard");
      } else {
        setErr(res.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      // Xử lý lỗi từ server (ví dụ: 400 - Mật khẩu không chính xác)
      const errorMsg =
        error.response?.data?.message || "Kết nối server thất bại";
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

          <div>
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
              style={{ color: "red", marginBottom: "10px" }}
            >
              {err}
            </div>
          ) : null}

          <button className="btn btnPrimary" disabled={loading} type="submit">
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
