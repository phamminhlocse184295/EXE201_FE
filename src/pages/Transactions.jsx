import { useEffect, useState, useMemo } from "react";
import { getAllOrders, updateOrderStatus } from "../services/orderService";
import { getAllCourses } from "../services/courseService";

const thStyle = { padding: "12px 16px", textAlign: "left", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)", fontWeight: 600 };
const tdStyle = { padding: "13px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 13 };

const statusMap = {
  PENDING:   { bg: "rgba(245,158,11,0.15)", col: "#f59e0b", label: "Chờ xử lý" },
  SUCCESS:   { bg: "rgba(16,185,129,0.15)", col: "#34d399", label: "Thành công" },
  COMPLETED: { bg: "rgba(16,185,129,0.15)", col: "#34d399", label: "Hoàn thành" },
  CANCELED:  { bg: "rgba(239,68,68,0.15)",  col: "#f87171", label: "Hủy bỏ" },
};

function StatusBadge({ status }) {
  const s = statusMap[status] || { bg: "rgba(255,255,255,0.08)", col: "rgba(255,255,255,0.5)", label: status };
  return <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11, background: s.bg, color: s.col, fontWeight: 700 }}>{s.label}</span>;
}

export default function Transactions() {
  const [orders, setOrders] = useState([]);
  const [coursesMap, setCoursesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const fetchData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const [resOrders, resCourses] = await Promise.all([getAllOrders(), getAllCourses()]);
      const coursesData = Array.isArray(resCourses) ? resCourses : resCourses.data?.data || resCourses.data || [];
      const cMap = {};
      coursesData.forEach(c => { cMap[c.id] = c; });
      setCoursesMap(cMap);
      const data = Array.isArray(resOrders) ? resOrders : resOrders.data?.data || resOrders.data || [];
      setOrders(data.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)));
    } catch (err) { console.error("Lỗi tải giao dịch:", err); }
    finally { if (!isBackground) setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(() => fetchData(true), 10000);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return orders;
    return orders.filter(o => {
      const id = (String(o.id || o._id || "")).toLowerCase();
      const email = (o.email || o.user_email || o.user?.email || "").toLowerCase();
      const name = (o.user_name || o.user?.full_name || o.full_name || "").toLowerCase();
      return id.includes(s) || email.includes(s) || name.includes(s);
    });
  }, [orders, q]);

  const handleStatusChange = async (orderId, newStatus) => {
    if (!confirm(`Xác nhận đổi trạng thái thành ${newStatus}?`)) return;
    try { await updateOrderStatus(orderId, newStatus); fetchData(); } catch { alert("Lỗi khi cập nhật trạng thái!"); }
  };

  const formatDate = d => d ? new Date(d).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" }) : "---";

  if (loading) return <div style={{ textAlign: "center", color: "rgba(255,255,255,0.35)", padding: 60 }}>⏳ Đang tải lịch sử giao dịch...</div>;

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 900, fontSize: 24, color: "#fff" }}>🛒 Lịch Sử Mua Hàng</h2>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 }}>
            Hiển thị {filtered.length} đơn hàng <span style={{ color: "#34d399", fontSize: 11 }}>● Tự động cập nhật</span>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>🔍</span>
          <input
            style={{ paddingLeft: 36, padding: "11px 14px 11px 36px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.07)", color: "#fff", fontSize: 13, outline: "none", width: 280 }}
            placeholder="Tìm mã GD, email, tên..." value={q} onChange={e => setQ(e.target.value)}
          />
        </div>
      </div>

      <div style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                <th style={thStyle}>Mã GD</th>
                <th style={thStyle}>Người Mua</th>
                <th style={thStyle}>Khóa Học</th>
                <th style={thStyle}>Số Tiền</th>
                <th style={thStyle}>Trạng Thái</th>
                <th style={thStyle}>Thời Gian</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => {
                const id = t.id || t._id;
                const course = coursesMap[t.course_id] || {};
                const courseName = t.course_name || course.title || "Không xác định";
                const price = Number(t.amount || t.price || t.total_price || course.price || 0);
                const userName = t.user_name || t.user?.full_name || t.full_name || "User " + String(t.user_id || "").substring(0, 6);
                const email = t.email || t.user_email || t.user?.email || "---";
                const status = (t.status || "PENDING").toUpperCase();
                return (
                  <tr key={id || i}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ ...tdStyle, color: "rgba(255,255,255,0.35)", fontWeight: 700, fontSize: 12 }}>#{String(id).substring(0, 6)}</td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 700, color: "#fff" }}>{userName}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{email}</div>
                    </td>
                    <td style={{ ...tdStyle, color: "rgba(255,255,255,0.8)", fontWeight: 600, maxWidth: 200 }}>{courseName}</td>
                    <td style={{ ...tdStyle, color: "#f59e0b", fontWeight: 800 }}>{price.toLocaleString()}đ</td>
                    <td style={tdStyle}><StatusBadge status={status} /></td>
                    <td style={{ ...tdStyle, color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{formatDate(t.created_at || t.createdAt)}</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <select
                        style={{ padding: "6px 10px", fontSize: 12, fontWeight: 700, borderRadius: 8, cursor: "pointer", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.08)", color: "#fff", outline: "none" }}
                        value={status}
                        onChange={e => handleStatusChange(id, e.target.value)}
                      >
                        <option value="PENDING">Chờ xử lý</option>
                        <option value="SUCCESS">Thành công</option>
                        <option value="COMPLETED">Hoàn thành</option>
                        <option value="CANCELED">Hủy bỏ</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.2)" }}>Không có dữ liệu.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
