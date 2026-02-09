import { useEffect, useMemo, useState } from "react";
// Import service
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../services/userService";

// --- Components phụ ---

function RoleBadge({ role }) {
  const map = {
    admin: {
      bg: "rgba(255,106,0,.12)",
      bd: "rgba(255,106,0,.28)",
      tx: "#C2410C",
    },
    manager: {
      bg: "rgba(124,58,237,.12)",
      bd: "rgba(124,58,237,.28)",
      tx: "#5B21B6",
    },
    annotator: {
      bg: "rgba(16,185,129,.12)",
      bd: "rgba(16,185,129,.28)",
      tx: "#065F46",
    },
    reviewer: {
      bg: "rgba(59,130,246,.12)",
      bd: "rgba(59,130,246,.28)",
      tx: "#1D4ED8",
    },
  };
  const r = (role || "").toLowerCase();
  const s = map[r] || {
    bg: "rgba(152,162,179,.16)",
    bd: "rgba(152,162,179,.30)",
    tx: "#344054",
  };

  return (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: 99,
        fontSize: 11,
        border: `1px solid ${s.bd}`,
        background: s.bg,
        color: s.tx,
        fontWeight: 700,
        textTransform: "capitalize",
      }}
    >
      {role}
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

// Component input nhỏ để code Form đỡ dài
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

// --- Main Component ---

export default function Users() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // 1. State Form chứa đầy đủ các trường
  const [form, setForm] = useState({
    full_name: "",
    user_name: "",
    email: "",
    role: "annotator",
    gender: "other",
    height_cm: "",
    weight_kg: "",
    total_practice_minutes: 0,
    current_point: 0,
    isActive: true,
    is_subscriber: false,
  });

  // 2. Logic Search nâng cao: Tìm cả ID, Username, Email, Tên
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;

    return users.filter((u) => {
      const fullName = (u.full_name || u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const userName = (u.user_name || "").toLowerCase();
      const role = (u.role || "").toLowerCase();
      const id = String(u.user_Id || u.id || ""); // Chuyển ID sang chuỗi để tìm

      return (
        fullName.includes(s) ||
        email.includes(s) ||
        userName.includes(s) ||
        role.includes(s) ||
        id.includes(s)
      );
    });
  }, [users, q]);

  // 3. Fetch Data
  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await getAllUsers();
      const data = Array.isArray(res) ? res : res.data || [];
      setUsers(data);
    } catch (error) {
      console.error(error);
      // Demo data phòng khi lỗi API
      setUsers([
        {
          user_Id: 58,
          full_name: "Dương Thái Ngọc dep zai",
          user_name: "minhloc",
          email: "admin@gmail.com",
          role: "admin",
          isActive: true,
          total_practice_minutes: 120,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // 4. Reset form khi tạo mới
  const openCreate = () => {
    setEditing(null);
    setForm({
      full_name: "",
      user_name: "",
      email: "",
      role: "annotator",
      gender: "other",
      height_cm: "",
      weight_kg: "",
      total_practice_minutes: 0,
      current_point: 0,
      isActive: true,
      is_subscriber: false,
    });
    setOpen(true);
  };

  // 5. Đổ dữ liệu vào form khi sửa
  const openEdit = (u) => {
    setEditing(u);
    setForm({
      full_name: u.full_name || u.name || "",
      user_name: u.user_name || "",
      email: u.email || "",
      role: u.role || "annotator",
      gender: u.gender || "other",
      height_cm: u.height_cm || "",
      weight_kg: u.weight_kg || "",
      total_practice_minutes: u.total_practice_minutes || 0,
      current_point: u.current_point || 0,
      isActive: u.isActive === undefined ? true : u.isActive,
      is_subscriber: u.is_subscriber || false,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.full_name.trim() || !form.email.trim()) {
      alert("Họ tên và Email là bắt buộc");
      return;
    }

    try {
      if (editing) {
        await updateUser(editing.user_Id || editing.id, form);
      } else {
        await createUser(form);
      }
      setOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Lỗi lưu user:", error);
      alert("Lỗi khi lưu dữ liệu");
    }
  };

  const remove = async (u) => {
    if (!confirm(`Xoá user ${u.full_name}?`)) return;
    try {
      await deleteUser(u.user_Id || u.id);
      fetchUsers();
    } catch (error) {
      alert("Không thể xóa user này");
    }
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* Header & Filter */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontWeight: 900 }}>Users Management</h2>
          <div style={{ color: "var(--muted)" }}>
            {filtered.length !== users.length
              ? `Found ${filtered.length} results`
              : `${users.length} members total`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {/* Ô Search có nút X */}
          <div style={{ position: "relative" }}>
            <input
              className="input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, ID..."
              style={{ width: 280, paddingRight: 30 }}
            />
            {q && (
              <button
                onClick={() => setQ("")}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#999",
                  cursor: "pointer",
                  fontSize: 16,
                }}
              >
                ✕
              </button>
            )}
          </div>
          <button className="btn btnPrimary" onClick={openCreate}>
            + Add User
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="board">
        <div className="boardHeader">
          <b>All Users</b>
          <span>{filtered.length} found</span>
        </div>
        <div className="boardBody" style={{ padding: 0 }}>
          <div
            className="tableWrap"
            style={{ border: "none", borderRadius: 0, boxShadow: "none" }}
          >
            <table>
              <thead>
                <tr>
                  <th style={{ width: "30%" }}>User Info</th>
                  <th style={{ width: "25%" }}>Contact</th>
                  <th style={{ width: "15%" }}>Stats</th>
                  <th style={{ width: "15%" }}>Status</th>
                  <th style={{ width: "15%", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ fontWeight: 800 }}>
                        {u.full_name || u.name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>
                        ID: #{u.user_Id || u.id} | @{u.user_name || "---"}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {u.email}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 12 }}>
                        <b>{u.total_practice_minutes || 0}</b> mins
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)" }}>
                        {u.current_point || 0} pts
                      </div>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          alignItems: "center",
                        }}
                      >
                        <RoleBadge role={u.role} />
                        {!u.isActive && (
                          <span
                            style={{
                              fontSize: 10,
                              color: "red",
                              fontWeight: 700,
                            }}
                          >
                            (Inactive)
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
                        onClick={() => remove(u)}
                        style={{
                          color: "red",
                          background: "rgba(255,0,0,0.05)",
                          borderColor: "rgba(255,0,0,0.1)",
                        }}
                      >
                        Del
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

      {/* MODAL EDIT FULL FIELDS */}
      <Modal
        open={open}
        title={editing ? `Edit User #${editing.user_Id}` : "Create New User"}
        onClose={() => setOpen(false)}
      >
        <div style={{ display: "grid", gap: 20 }}>
          {/* Section 1: Thông tin cơ bản */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <FormGroup label="Họ và tên">
              <input
                className="input"
                value={form.full_name}
                onChange={(e) =>
                  setForm({ ...form, full_name: e.target.value })
                }
                placeholder="VD: Dương Thái Ngọc"
              />
            </FormGroup>
            <FormGroup label="Username">
              <input
                className="input"
                value={form.user_name}
                onChange={(e) =>
                  setForm({ ...form, user_name: e.target.value })
                }
                placeholder="VD: minhloc"
              />
            </FormGroup>
            <FormGroup label="Email">
              <input
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@gmail.com"
              />
            </FormGroup>
            <FormGroup label="Vai trò">
              <select
                className="input"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="annotator">Annotator</option>
                <option value="reviewer">Reviewer</option>
              </select>
            </FormGroup>
          </div>

          <hr style={{ border: 0, borderTop: "1px solid #eee", margin: 0 }} />

          {/* Section 2: Chỉ số cơ thể */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16,
            }}
          >
            <FormGroup label="Giới tính">
              <select
                className="input"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </FormGroup>
            <FormGroup label="Chiều cao (cm)">
              <input
                type="number"
                className="input"
                value={form.height_cm}
                onChange={(e) =>
                  setForm({ ...form, height_cm: e.target.value })
                }
                placeholder="0"
              />
            </FormGroup>
            <FormGroup label="Cân nặng (kg)">
              <input
                type="number"
                className="input"
                value={form.weight_kg}
                onChange={(e) =>
                  setForm({ ...form, weight_kg: e.target.value })
                }
                placeholder="0"
              />
            </FormGroup>
          </div>

          <hr style={{ border: 0, borderTop: "1px solid #eee", margin: 0 }} />

          {/* Section 3: Chỉ số hệ thống */}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <FormGroup label="Tổng phút tập">
              <input
                type="number"
                className="input"
                value={form.total_practice_minutes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    total_practice_minutes: parseInt(e.target.value) || 0,
                  })
                }
              />
            </FormGroup>
            <FormGroup label="Điểm hiện tại">
              <input
                type="number"
                className="input"
                value={form.current_point}
                onChange={(e) =>
                  setForm({
                    ...form,
                    current_point: parseInt(e.target.value) || 0,
                  })
                }
              />
            </FormGroup>
          </div>

          {/* Section 4: Checkbox */}
          <div style={{ display: "flex", gap: 24, padding: "8px 0" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
              />
              Kích hoạt (Active)
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              <input
                type="checkbox"
                checked={form.is_subscriber}
                onChange={(e) =>
                  setForm({ ...form, is_subscriber: e.target.checked })
                }
              />
              Đã đăng ký (Subscriber)
            </label>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 10,
            }}
          >
            <button className="btn" onClick={() => setOpen(false)}>
              Huỷ bỏ
            </button>
            <button className="btn btnPrimary" onClick={save}>
              Lưu thay đổi
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
