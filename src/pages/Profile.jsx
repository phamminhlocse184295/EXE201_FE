import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// Import service
import { getProfile, getUser, updateProfile } from "../services/auth";

// --- CÁC COMPONENT PHỤ (MODAL, FORM, BADGE) ---

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
  const s = map[r] || { bg: "#f3f4f6", bd: "#d1d5db", tx: "#374151" };

  return (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: 99,
        fontSize: 12,
        border: `1px solid ${s.bd}`,
        background: s.bg,
        color: s.tx,
        fontWeight: 700,
        textTransform: "capitalize",
      }}
    >
      {role || "User"}
    </span>
  );
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="modalOverlay" onMouseDown={onClose}>
      <div
        className="modal"
        style={{ width: "500px", maxWidth: "95%" }}
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
        <div className="modalBody">{children}</div>
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

const InfoGroup = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
      {label}
    </div>
    <div style={{ fontSize: 15, fontWeight: 600 }}>{value || "---"}</div>
  </div>
);

// --- COMPONENT CHÍNH ---

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // State cho Modal cập nhật
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    gender: "male",
    height_cm: "",
    weight_kg: "",
    goal: "",
  });

  // 1. Load dữ liệu
  const loadData = async () => {
    const localUser = getUser();
    // Ưu tiên hiển thị local trước cho nhanh
    if (localUser) setUser(localUser);

    try {
      const data = await getProfile();
      if (data) setUser(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // 2. Mở Modal và điền dữ liệu cũ vào form
  const handleEdit = () => {
    if (!user) return;
    setFormData({
      full_name: user.full_name || "",
      gender: user.gender || "male",
      height_cm: user.height_cm || "",
      weight_kg: user.weight_kg || "",
      goal: user.goal || "",
    });
    setOpen(true);
  };

  // 3. Gọi API cập nhật
  const handleSave = async () => {
    if (!formData.full_name.trim()) return alert("Họ tên không được để trống");

    setUpdating(true);
    try {
      const res = await updateProfile(formData);
      if (res && res.success) {
        alert("Cập nhật thành công!");
        setOpen(false);
        // Load lại data mới nhất để hiển thị
        await loadData();
      } else {
        alert(res?.message || "Cập nhật thất bại");
      }
    } catch (error) {
      alert("Lỗi kết nối server");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  if (!user) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h3 style={{ color: "#ef4444" }}>Phiên đăng nhập hết hạn</h3>
        <button className="btn btnPrimary" onClick={() => navigate("/login")}>
          Đăng nhập lại
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "end",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontWeight: 900 }}>Hồ Sơ Admin</h2>
          <div style={{ color: "var(--muted)" }}>
            Thông tin tài khoản hệ thống
          </div>
        </div>
        {/* Nút bấm giờ đã có tác dụng */}
        <button className="btn btnPrimary" onClick={handleEdit}>
          Cập nhật thông tin
        </button>
      </div>

      {/* BOARD THÔNG TIN */}
      <div className="board">
        <div className="boardHeader">
          <b>Chi tiết tài khoản</b>
          <span>ID: {user.user_Id || user.id || "---"}</span>
        </div>
        <div className="boardBody" style={{ padding: "32px" }}>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {/* Avatar */}
            <div style={{ flexShrink: 0 }}>
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #ff9800, #ed6c02)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 40,
                  fontWeight: 900,
                  color: "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                {(user.full_name || user.name || "A").charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Info Text */}
            <div style={{ flex: 1, minWidth: "250px" }}>
              <div style={{ marginBottom: 24 }}>
                <h2
                  style={{ margin: "0 0 8px 0", fontSize: 24, fontWeight: 800 }}
                >
                  {user.full_name || user.name}
                </h2>
                <RoleBadge role={user.role} />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "24px 16px",
                }}
              >
                <InfoGroup label="Username" value={user.user_name} />
                <InfoGroup label="Email" value={user.email} />
                <InfoGroup
                  label="Giới tính"
                  value={
                    user.gender === "male"
                      ? "Nam"
                      : user.gender === "female"
                        ? "Nữ"
                        : "Khác"
                  }
                />
                <InfoGroup label="Mục tiêu" value={user.goal} />
                <InfoGroup
                  label="Chiều cao"
                  value={user.height_cm ? `${user.height_cm} cm` : ""}
                />
                <InfoGroup
                  label="Cân nặng"
                  value={user.weight_kg ? `${user.weight_kg} kg` : ""}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CẬP NHẬT (Pop-up) */}
      <Modal open={open} title="Cập nhật hồ sơ" onClose={() => setOpen(false)}>
        <div style={{ display: "grid", gap: 16 }}>
          <FormGroup label="Họ và tên">
            <input
              className="input"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              placeholder="Nhập họ tên..."
            />
          </FormGroup>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <FormGroup label="Chiều cao (cm)">
              <input
                type="number"
                className="input"
                value={formData.height_cm}
                onChange={(e) =>
                  setFormData({ ...formData, height_cm: e.target.value })
                }
              />
            </FormGroup>
            <FormGroup label="Cân nặng (kg)">
              <input
                type="number"
                className="input"
                value={formData.weight_kg}
                onChange={(e) =>
                  setFormData({ ...formData, weight_kg: e.target.value })
                }
              />
            </FormGroup>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <FormGroup label="Giới tính">
              <select
                className="input"
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </FormGroup>
            <FormGroup label="Mục tiêu tập luyện">
              <input
                className="input"
                value={formData.goal}
                onChange={(e) =>
                  setFormData({ ...formData, goal: e.target.value })
                }
                placeholder="VD: Giảm cân, Tăng cơ..."
              />
            </FormGroup>
          </div>

          {/* Footer Modal */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 10,
            }}
          >
            <button
              className="btn"
              onClick={() => setOpen(false)}
              disabled={updating}
            >
              Hủy
            </button>
            <button
              className="btn btnPrimary"
              onClick={handleSave}
              disabled={updating}
            >
              {updating ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
