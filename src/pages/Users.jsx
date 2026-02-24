import { useEffect, useMemo, useState } from "react";
import {
  getAllUsers,
  createUser,
  updateUser,
  banUser,
  unbanUser,
} from "../services/userService";

// --- COMPONENT ROLE BADGE (ĐÃ SỬA: CHỈ CÒN ADMIN & USER) ---
function RoleBadge({ role }) {
  const map = {
    admin: {
      bg: "rgba(255,106,0,.12)",
      bd: "rgba(255,106,0,.28)",
      tx: "#C2410C",
    }, // Màu Cam
    user: {
      bg: "rgba(59,130,246,.12)",
      bd: "rgba(59,130,246,.28)",
      tx: "#1D4ED8",
    }, // Màu Xanh
  };

  const r = (role || "user").toLowerCase();
  // Nếu không phải admin thì mặc định là user
  const s = map[r] || map.user;

  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 99,
        fontSize: 11,
        border: `1px solid ${s.bd}`,
        background: s.bg,
        color: s.tx,
        fontWeight: 700,
        textTransform: "capitalize",
      }}
    >
      {role || "user"}
    </span>
  );
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="modalOverlay" onMouseDown={onClose}>
      <div
        className="modal"
        style={{ width: "650px", maxWidth: "95%" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modalHeader">
          <b style={{ fontSize: 16 }}>{title}</b>
          <button
            className="btn"
            onClick={onClose}
            style={{ padding: "4px 8px" }}
          >
            ✕
          </button>
        </div>
        <div
          className="modalBody"
          style={{ maxHeight: "85vh", overflowY: "auto" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

const FormGroup = ({ label, children }) => (
  <div style={{ display: "grid", gap: 4 }}>
    <label
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: "var(--muted)",
        textTransform: "uppercase",
      }}
    >
      {label}
    </label>
    {children}
  </div>
);

// --- COMPONENT CHÍNH ---

export default function Users() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  // State tìm kiếm & Lọc
  const [q, setQ] = useState("");
  const [filterRole, setFilterRole] = useState("all"); // Chỉ còn all, admin, user
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSub, setFilterSub] = useState("all");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // Form mặc định role là 'user'
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    role: "user",
    gender: "male",
    height_cm: "",
    weight_kg: "",
    goal: "",
    is_active: true,
    is_subscriber: "inactive",
  });

  // 1. Fetch Users
  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await getAllUsers();
      let data = [];
      if (res.data && Array.isArray(res.data.data)) data = res.data.data;
      else if (Array.isArray(res.data)) data = res.data;
      setUsers(data);
    } catch (error) {
      console.error("Lỗi tải users:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. LOGIC BỘ LỌC
  const filtered = useMemo(() => {
    return users.filter((u) => {
      const s = q.trim().toLowerCase();
      const matchSearch =
        (u.full_name || "").toLowerCase().includes(s) ||
        (u.email || "").toLowerCase().includes(s);

      const matchRole =
        filterRole === "all" || (u.role || "user").toLowerCase() === filterRole;

      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "active"
          ? u.is_active === true
          : u.is_active === false);

      const matchSub =
        filterSub === "all" ||
        (filterSub === "pro"
          ? u.is_subscriber === "active"
          : u.is_subscriber !== "active");

      return matchSearch && matchRole && matchStatus && matchSub;
    });
  }, [users, q, filterRole, filterStatus, filterSub]);

  const resetFilters = () => {
    setQ("");
    setFilterRole("all");
    setFilterStatus("all");
    setFilterSub("all");
  };

  // --- Modal Logic ---
  const openCreate = () => {
    setEditing(null);
    // Mặc định tạo mới là User thường
    setForm({
      full_name: "",
      email: "",
      role: "user",
      gender: "male",
      height_cm: "",
      weight_kg: "",
      goal: "",
      is_active: true,
      is_subscriber: "inactive",
    });
    setOpen(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({
      full_name: u.full_name || "",
      email: u.email || "",
      role: u.role || "user", // Nếu null thì coi là user
      gender: u.gender || "male",
      height_cm: u.height_cm || "",
      weight_kg: u.weight_kg || "",
      goal: u.goal || "",
      is_active: u.is_active,
      is_subscriber: u.is_subscriber || "inactive",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.full_name.trim()) return alert("Họ tên là bắt buộc");
    try {
      if (editing) await updateUser(editing.id, form);
      else await createUser(form);
      setOpen(false);
      fetchUsers();
    } catch (error) {
      alert("Lỗi lưu dữ liệu.");
    }
  };

  const toggleBan = async (u) => {
    const isCurrentlyActive = u.is_active;
    if (isCurrentlyActive) {
      const reason = prompt(
        `Nhập lý do khóa tài khoản "${u.full_name}":`,
        "Vi phạm quy định",
      );
      if (reason === null) return;
      try {
        await banUser(u.id, reason);
        alert("Đã khóa tài khoản thành công!");
        fetchUsers();
      } catch (error) {
        alert("Lỗi Ban.");
      }
    } else {
      if (!confirm(`Mở khóa cho tài khoản "${u.full_name}"?`)) return;
      try {
        await unbanUser(u.id);
        alert("Đã mở khóa thành công!");
        fetchUsers();
      } catch (error) {
        alert("Lỗi Unban.");
      }
    }
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* HEADER & FILTERS */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontWeight: 900 }}>Users Management</h2>
            <div style={{ color: "var(--muted)" }}>
              Hiển thị {filtered.length} / {users.length} tài khoản
            </div>
          </div>
          <button className="btn btnPrimary" onClick={openCreate}>
            + Add User
          </button>
        </div>

        {/* Filter Bar */}
        <div
          className="card"
          style={{
            padding: "12px",
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <span
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#999",
              }}
            >
              🔍
            </span>
            <input
              className="input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm tên hoặc email..."
              style={{ paddingLeft: 32, width: "100%" }}
            />
          </div>

          {/* CHỈ CÒN ADMIN VÀ USER */}
          <select
            className="input"
            style={{ width: "140px" }}
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">Tất cả vai trò</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>

          <select
            className="input"
            style={{ width: "140px" }}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">🟢 Đang hoạt động</option>
            <option value="banned">🔴 Đã bị khóa</option>
          </select>

          <select
            className="input"
            style={{ width: "140px" }}
            value={filterSub}
            onChange={(e) => setFilterSub(e.target.value)}
          >
            <option value="all">Tất cả gói</option>
            <option value="pro">⭐ Pro (Subscriber)</option>
            <option value="free">👤 Free User</option>
          </select>

          {(q ||
            filterRole !== "all" ||
            filterStatus !== "all" ||
            filterSub !== "all") && (
            <button
              className="btn"
              onClick={resetFilters}
              style={{ color: "red", borderColor: "transparent" }}
            >
              Xóa lọc ✕
            </button>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="board">
        <div className="boardBody" style={{ padding: 0 }}>
          <div
            className="tableWrap"
            style={{ border: "none", borderRadius: 0, boxShadow: "none" }}
          >
            <table>
              <thead>
                <tr>
                  <th style={{ width: "30%" }}>User Info</th>
                  <th style={{ width: "20%" }}>Stats</th>
                  <th style={{ width: "20%" }}>Physical</th>
                  <th style={{ width: "15%" }}>Status</th>
                  <th style={{ width: "15%", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id || i}>
                    <td>
                      <div style={{ fontWeight: 800 }}>
                        {u.full_name || "---"}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>
                        {u.email || "No Email"}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12 }}>
                        <b>{u.total_practice_minutes || 0}</b> mins
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12 }}>
                        {u.height_cm ? `${u.height_cm}cm` : "-"} /{" "}
                        {u.weight_kg ? `${u.weight_kg}kg` : "-"}
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <RoleBadge role={u.role} />
                        {!u.is_active && (
                          <span
                            style={{
                              fontSize: 10,
                              color: "red",
                              fontWeight: 700,
                            }}
                          >
                            (Banned)
                          </span>
                        )}
                        {u.is_subscriber === "active" && (
                          <span
                            style={{
                              fontSize: 10,
                              color: "#d97706",
                              fontWeight: 700,
                              border: "1px solid #fcd34d",
                              padding: "1px 4px",
                              borderRadius: 4,
                              background: "#fffbeb",
                            }}
                          >
                            PRO
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn"
                        onClick={() => openEdit(u)}
                        style={{ marginRight: 6 }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn"
                        onClick={() => toggleBan(u)}
                        style={{
                          color: !u.is_active ? "#059669" : "#ef4444",
                          background: !u.is_active
                            ? "rgba(16,185,129,0.1)"
                            : "rgba(239,68,68,0.1)",
                        }}
                      >
                        {!u.is_active ? "Unban" : "Ban"}
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        padding: 30,
                        color: "var(--muted)",
                      }}
                    >
                      Không tìm thấy kết quả nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <Modal
        open={open}
        title={editing ? "Edit User" : "Create New User"}
        onClose={() => setOpen(false)}
      >
        <div style={{ display: "grid", gap: 20 }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <FormGroup label="Họ tên">
              <input
                className="input"
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
              />
            </FormGroup>
            <FormGroup label="Email">
              <input
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </FormGroup>

            {/* CHỈ CÒN ADMIN VÀ USER TRONG FORM */}
            <FormGroup label="Role">
              <select
                className="input"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </FormGroup>

            <FormGroup label="Giới tính">
              <select
                className="input"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
              </select>
            </FormGroup>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16,
            }}
          >
            <FormGroup label="Chiều cao">
              <input
                type="number"
                className="input"
                value={form.height_cm}
                onChange={(e) =>
                  setForm({ ...form, height_cm: e.target.value })
                }
              />
            </FormGroup>
            <FormGroup label="Cân nặng">
              <input
                type="number"
                className="input"
                value={form.weight_kg}
                onChange={(e) =>
                  setForm({ ...form, weight_kg: e.target.value })
                }
              />
            </FormGroup>
            <FormGroup label="Goal">
              <input
                className="input"
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
              />
            </FormGroup>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <button className="btn" onClick={() => setOpen(false)}>
              Hủy
            </button>
            <button className="btn btnPrimary" onClick={save}>
              Lưu
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
