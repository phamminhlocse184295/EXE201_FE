import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { setAuth } from "../services/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      const token = res?.data?.token;
      const user = res?.data?.user || { email };

      if (!token) throw new Error("API chưa trả token.");

      setAuth({ token, user });
      navigate("/dashboard");
    } catch (error) {
      // DEMO (để bạn đi tiếp UI khi chưa có backend)
      setAuth({ token: "demo-token", user: { email } });
      navigate("/dashboard");

      // Nếu muốn show lỗi thật thì dùng:
      // setErr(error?.response?.data?.message || error.message || "Login failed");
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
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
            />
          </div>

          {err ? <div className="errorBox">{err}</div> : null}

          <button className="btn btnPrimary" disabled={loading} type="submit">
            {loading ? "Signing in..." : "Login"}
          </button>

          <div style={{ fontSize: 12, color: "rgba(255,255,255,.65)" }}>
            Tip: UI đang theo theme orange/purple giống app trong ảnh.
          </div>
        </form>
      </div>
    </div>
  );
}
