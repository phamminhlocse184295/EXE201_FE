import { useEffect, useMemo, useState } from "react";
import { getAllUsers, createUser, updateUser, banUser, unbanUser } from "../services/userService";

// ── Shared Styles ──
const darkInput = {
  width: "100%", padding: "11px 14px", borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.07)",
  color: "#fff", fontSize: 13, outline: "none", boxSizing: "border-box",
};
const thStyle = { padding: "12px 16px", textAlign: "left", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)", fontWeight: 600 };
const tdStyle = { padding: "13px 16px", borderBottom: "1px solid rgba(255,255,255,0.05)", fontSize: 13 };

function RoleBadge({ role }) {
  const map = {
    admin: { bg: "rgba(245,158,11,0.18)", bd: "rgba(245,158,11,0.35)", tx: "#f59e0b" },
    user:  { bg: "rgba(59,130,246,0.18)",  bd: "rgba(59,130,246,0.35)",  tx: "#60a5fa" },
  };
  const s = map[(role || "user").toLowerCase()] || map.user;
  return <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11, border: `1px solid ${s.bd}`, background: s.bg, color: s.tx, fontWeight: 700, textTransform: "capitalize" }}>{role || "user"}</span>;
}

function DarkModal({ open, title, onClose, width = 600, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "grid", placeItems: "center", zIndex: 100, padding: 16, backdropFilter: "blur(4px)" }} onMouseDown={onClose}>
      <div style={{ width: `min(${width}px,95%)`, borderRadius: 20, border: "1px solid rgba(255,255,255,0.12)", background: "#111827", boxShadow: "0 40px 120px rgba(0,0,0,0.5)", overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column" }} onMouseDown={e => e.stopPropagation()}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <b style={{ color: "#fff", fontSize: 15 }}>{title}</b>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#aaa", cursor: "pointer", padding: "4px 10px", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ padding: 22, overflowY: "auto" }}>{children}</div>
      </div>
    </div>
  );
}

function FG({ label, children }) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
      {children}
    </div>
  );
}

export default function Users() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSub, setFilterSub] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ full_name: "", email: "", role: "user", gender: "male", height_cm: "", weight_kg: "", goal: "", is_active: true, is_subscriber: "inactive" });

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await getAllUsers();
      setUsers(res.data?.data || res.data || res || []);
    } catch (err) {
      if (err?.response?.status === 403) alert("Thông báo: Quyền hiện tại không được phép xem danh sách người dùng.");
    } finally { setLoading(false); }
  }
  useEffect(() => { fetchUsers(); }, []);

  const filtered = useMemo(() => users.filter(u => {
    const s = q.trim().toLowerCase();
    const matchSearch = (u.full_name || "").toLowerCase().includes(s) || (u.email || "").toLowerCase().includes(s);
    const matchRole = filterRole === "all" || (u.role || "user").toLowerCase() === filterRole;
    const matchStatus = filterStatus === "all" || (filterStatus === "active" ? u.is_active === true : u.is_active === false);
    const matchSub = filterSub === "all" || (filterSub === "pro" ? u.is_subscriber === "active" : u.is_subscriber !== "active");
    return matchSearch && matchRole && matchStatus && matchSub;
  }), [users, q, filterRole, filterStatus, filterSub]);

  const openCreate = () => { setEditing(null); setForm({ full_name: "", email: "", role: "user", gender: "male", height_cm: "", weight_kg: "", goal: "", is_active: true, is_subscriber: "inactive" }); setOpen(true); };
  const openEdit = u => { setEditing(u); setForm({ full_name: u.full_name || "", email: u.email || "", role: u.role || "user", gender: u.gender || "male", height_cm: u.height_cm || "", weight_kg: u.weight_kg || "", goal: u.goal || "", is_active: u.is_active, is_subscriber: u.is_subscriber || "inactive" }); setOpen(true); };
  const save = async () => {
    if (!form.full_name.trim()) return alert("Họ tên là bắt buộc");
    try { editing ? await updateUser(editing.id, form) : await createUser(form); setOpen(false); fetchUsers(); } catch { alert("Lỗi lưu dữ liệu."); }
  };
  const toggleBan = async u => {
    if (u.is_active) {
      const reason = prompt(`Nhập lý do khóa tài khoản "${u.full_name}":`, "Vi phạm quy định");
      if (reason === null) return;
      try { await banUser(u.id, reason); fetchUsers(); } catch { alert("Lỗi Ban."); }
    } else {
      if (!confirm(`Mở khóa cho tài khoản "${u.full_name}"?`)) return;
      try { await unbanUser(u.id); fetchUsers(); } catch { alert("Lỗi Unban."); }
    }
  };

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 900, fontSize: 24, color: "#fff" }}>👥 Users Management</h2>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 }}>Hiển thị {filtered.length} / {users.length} tài khoản</div>
        </div>
        <button onClick={openCreate} style={{ padding: "11px 22px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, boxShadow: "0 4px 16px rgba(59,130,246,0.3)" }}>+ Add User</button>
      </div>

      {/* Filter Bar */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", padding: "14px 16px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14 }}>🔍</span>
          <input style={{ ...darkInput, paddingLeft: 36 }} value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm tên hoặc email..." />
        </div>
        <select style={{ ...darkInput, width: 150 }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="all">Tất cả vai trò</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <select style={{ ...darkInput, width: 150 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="active">🟢 Hoạt động</option>
          <option value="banned">🔴 Đã khóa</option>
        </select>
        <select style={{ ...darkInput, width: 150 }} value={filterSub} onChange={e => setFilterSub(e.target.value)}>
          <option value="all">Tất cả gói</option>
          <option value="pro">⭐ Pro</option>
          <option value="free">👤 Free</option>
        </select>
        {(q || filterRole !== "all" || filterStatus !== "all" || filterSub !== "all") && (
          <button onClick={() => { setQ(""); setFilterRole("all"); setFilterStatus("all"); setFilterSub("all"); }} style={{ padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#f87171", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>✕ Xóa lọc</button>
        )}
      </div>

      {/* Table */}
      <div style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 50, color: "rgba(255,255,255,0.3)" }}>⏳ Đang tải...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                  <th style={thStyle}>User Info</th>
                  <th style={thStyle}>Stats</th>
                  <th style={thStyle}>Physical</th>
                  <th style={thStyle}>Status</th>
                  <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id || i}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#6366f1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                          {(u.full_name || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>{u.full_name || "---"}</div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{u.email || "No Email"}</div>
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}><span style={{ color: "#60a5fa", fontWeight: 700 }}>{u.total_practice_minutes || 0}</span> <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>mins</span></td>
                    <td style={{ ...tdStyle, color: "rgba(255,255,255,0.6)" }}>{u.height_cm ? `${u.height_cm}cm` : "-"} / {u.weight_kg ? `${u.weight_kg}kg` : "-"}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                        <RoleBadge role={u.role} />
                        {!u.is_active && <span style={{ fontSize: 10, color: "#f87171", fontWeight: 700, background: "rgba(239,68,68,0.15)", padding: "2px 6px", borderRadius: 4 }}>BANNED</span>}
                        {u.is_subscriber === "active" && <span style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700, background: "rgba(245,158,11,0.15)", padding: "2px 6px", borderRadius: 4 }}>PRO ⭐</span>}
                      </div>
                    </td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button onClick={() => openEdit(u)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Edit</button>
                        <button onClick={() => toggleBan(u)} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: u.is_active ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)", color: u.is_active ? "#f87171" : "#34d399", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                          {u.is_active ? "Ban" : "Unban"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.2)" }}>Không tìm thấy kết quả nào.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <DarkModal open={open} title={editing ? "✏️ Edit User" : "➕ Create New User"} onClose={() => setOpen(false)}>
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FG label="Họ tên"><input style={darkInput} value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Nguyễn Văn A" /></FG>
            <FG label="Email"><input style={darkInput} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" /></FG>
            <FG label="Role">
              <select style={darkInput} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </FG>
            <FG label="Giới tính">
              <select style={darkInput} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </FG>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <FG label="Chiều cao"><input type="number" style={darkInput} value={form.height_cm} onChange={e => setForm({ ...form, height_cm: e.target.value })} placeholder="170" /></FG>
            <FG label="Cân nặng"><input type="number" style={darkInput} value={form.weight_kg} onChange={e => setForm({ ...form, weight_kg: e.target.value })} placeholder="65" /></FG>
            <FG label="Mục tiêu"><input style={darkInput} value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })} placeholder="Giảm cân..." /></FG>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <button onClick={() => setOpen(false)} style={{ padding: "11px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>Hủy</button>
            <button onClick={save} style={{ padding: "11px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Lưu</button>
          </div>
        </div>
      </DarkModal>
    </div>
  );
}
