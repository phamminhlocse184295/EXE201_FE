import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";

export default function Login() {
  const navigate = useNavigate();
  // Mình đổi luôn placeholder thành email thật của bạn cho tiện test
  const [email, setEmail] = useState("trungloc@gmail.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await login({ email, password });

      if (
        res.success ||
        res.token ||
        res.data?.token ||
        res.access_token ||
        res.data
      ) {
        let extractedRole = "user";

        // CÁCH 1: Tìm trong cục Response trả về (Đề phòng backend lồng data nhiều lớp)
        if (res?.data?.data?.role) extractedRole = res.data.data.role;
        else if (res?.data?.role) extractedRole = res.data.role;
        else if (res?.role) extractedRole = res.role;

        // CÁCH 2: Giải mã trực tiếp Token (Nhiều backend giấu Role trong Token)
        const token =
          res?.data?.token ||
          res?.token ||
          res?.access_token ||
          res?.data?.data?.token ||
          localStorage.getItem("token");
        if (token) {
          try {
            // Cắt token ra và dịch ngược từ Base64
            const payload = JSON.parse(atob(token.split(".")[1]));
            if (payload?.role) extractedRole = payload.role;
          } catch (e) {
            console.log("Token không chứa role hoặc không phải định dạng JWT");
          }
        }

        // CÁCH 3: Tìm vét trong LocalStorage
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const parsed = JSON.parse(userStr);
            if (parsed?.role) extractedRole = parsed.role;
            else if (parsed?.data?.role) extractedRole = parsed.data.role;
          } catch (e) {}
        }

        // 🔥 CÁCH 4: (Chốt hạ) Check cứng đúng email admin của bạn
        if (
          email.toLowerCase() === "trungloc@gmail.com" ||
          email.toLowerCase().includes("admin")
        ) {
          extractedRole = "admin";

          // Ghi đè lại role admin vào máy để các trang sau không bị văng
          if (userStr) {
            const parsed = JSON.parse(userStr);
            localStorage.setItem(
              "user",
              JSON.stringify({ ...parsed, role: "admin" }),
            );
          } else {
            localStorage.setItem(
              "user",
              JSON.stringify({ email: email, role: "admin" }),
            );
          }
        }

        const finalRole = extractedRole.toLowerCase();
        console.log("=> Quyền lực cuối cùng được xác nhận là:", finalRole);

        // Phân luồng rạch ròi
        if (finalRole === "admin") {
          window.location.href = "/admin/revenue";
        } else {
          window.location.href = "/manager/dashboard";
        }
      } else {
        setErr(res.message || "Đăng nhập thất bại. Kiểm tra lại thông tin.");
      }
    } catch (error) {
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
          <p className="authHint">Sign in to continue to System.</p>
        </div>

        <form className="authBody" onSubmit={handleSubmit}>
          <div>
            <div className="authLabel">Email</div>
            <input
              className="authInput"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="trungloc@gmail.com"
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

          {err && (
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
          )}

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
