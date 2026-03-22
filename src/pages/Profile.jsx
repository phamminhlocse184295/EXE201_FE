import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, getUser, updateProfile } from "../services/auth";
import { playTick, playSend } from "../lib/sounds";

const iStyle = {
  width: "100%", padding: "12px 16px", borderRadius: 12,
  border: "1px solid rgba(0,245,255,0.15)", background: "rgba(0,10,20,0.6)",
  color: "#fff", fontSize: 14, outline: "none",
  transition: "border 0.2s, box-shadow 0.2s", boxSizing: "border-box",
};

const roleMeta = {
  admin:      { bg: "rgba(245,158,11,0.18)", bd: "rgba(245,158,11,0.4)", tx: "#f59e0b" },
  manager:    { bg: "rgba(99,102,241,0.18)",  bd: "rgba(99,102,241,0.4)",  tx: "#818cf8" },
  annotator:  { bg: "rgba(16,185,129,0.18)", bd: "rgba(16,185,129,0.4)", tx: "#34d399" },
  reviewer:   { bg: "rgba(59,130,246,0.18)", bd: "rgba(59,130,246,0.4)", tx: "#60a5fa" },
};

function RoleBadge({ role }) {
  const r = (role || "").toLowerCase();
  const s = roleMeta[r] || { bg: "rgba(255,255,255,0.1)", bd: "rgba(255,255,255,0.2)", tx: "rgba(255,255,255,0.7)" };
  return (
    <span style={{ padding: "4px 14px", borderRadius: 999, fontSize: 12, border: `1px solid ${s.bd}`, background: s.bg, color: s.tx, fontWeight: 700, textTransform: "capitalize" }}>
      ● {role || "User"}
    </span>
  );
}

function DarkModal({ open, title, onClose, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "grid", placeItems: "center", zIndex: 100, padding: 16, backdropFilter: "blur(4px)" }}
      onMouseDown={onClose}>
      <div style={{ width: "min(500px,100%)", borderRadius: 22, border: "1px solid rgba(255,255,255,0.12)", background: "#111827", boxShadow: "0 40px 120px rgba(0,0,0,0.5)", overflow: "hidden" }}
        onMouseDown={e => e.stopPropagation()}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <b style={{ color: "#fff", fontSize: 16 }}>{title}</b>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.6)", cursor: "pointer", padding: "4px 10px", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{value || <span style={{ color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>Chưa cập nhật</span>}</div>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", gender: "male", height_cm: "", weight_kg: "", goal: "" });

  const loadData = async () => {
    const localUser = getUser();
    if (localUser) setUser(localUser);
    try { const data = await getProfile(); if (data) setUser(data); } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleEdit = () => {
    if (!user) return;
    setFormData({ full_name: user.full_name || "", gender: user.gender || "male", height_cm: user.height_cm || "", weight_kg: user.weight_kg || "", goal: user.goal || "" });
    setOpen(true);
  };

  const handleSave = async () => {
    if (!formData.full_name.trim()) return alert("Họ tên không được để trống");
    setUpdating(true);
    try {
      const res = await updateProfile(formData);
      if (res?.success) { alert("Cập nhật thành công!"); setOpen(false); await loadData(); }
      else alert(res?.message || "Cập nhật thất bại");
    } catch { alert("Lỗi kết nối server"); }
    finally { setUpdating(false); }
  };

  const inp = (field, type = "text", placeholder = "") => (
    <input type={type} style={iStyle} value={formData[field]}
      onChange={e => setFormData({ ...formData, [field]: e.target.value })}
      placeholder={placeholder}
      onFocus={e => { e.target.style.border = "1px solid rgba(99,102,241,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.18)"; }}
      onBlur={e => { e.target.style.border = "1px solid rgba(255,255,255,0.12)"; e.target.style.boxShadow = "none"; }}
    />
  );

  if (loading) return <div style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", padding: 60 }}>Đang tải hồ sơ...</div>;
  if (!user) return (
    <div style={{ textAlign: "center", padding: 60 }}>
      <div style={{ color: "#f87171", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Phiên đăng nhập hết hạn</div>
      <button onClick={() => navigate("/login")} style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#f59e0b,#ef4444)", color: "#fff", fontWeight: 700, cursor: "pointer" }}>Đăng nhập lại</button>
    </div>
  );

  const initials = (user.full_name || user.name || "A").charAt(0).toUpperCase();

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 900, fontSize: 24, color: "#fff" }}>Hồ Sơ Cá Nhân</h2>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, marginTop: 4 }}>Thông tin tài khoản hệ thống</div>
        </div>
        <button onClick={handleEdit} style={{ padding: "11px 22px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 16px rgba(59,130,246,0.3)", fontSize: 14 }}>
          ✏️ Cập nhật thông tin
        </button>
      </div>

      {/* Profile Card */}
      <div style={{ borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
        {/* Gradient header strip */}
        <div style={{ height: 120, background: "linear-gradient(135deg,rgba(59,130,246,0.4),rgba(99,102,241,0.3),rgba(139,92,246,0.4))", position: "relative" }} />
        
        <div style={{ padding: "0 32px 32px" }}>
          {/* Avatar */}
          <div style={{ marginTop: -50, marginBottom: 16, display: "flex", alignItems: "flex-end", gap: 20, flexWrap: "wrap" }}>
            <div style={{
              width: 100, height: 100, borderRadius: "50%",
              background: "linear-gradient(135deg,#f59e0b,#ef4444)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 42, fontWeight: 900, color: "#fff",
              border: "4px solid #111827", boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              flexShrink: 0,
            }}>{initials}</div>
            <div style={{ paddingBottom: 8 }}>
              <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#fff" }}>
                {user.full_name || user.name}
              </h2>
              <RoleBadge role={user.role} />
            </div>
          </div>

          {/* Info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "20px 28px", marginTop: 8 }}>
            <InfoRow label="Username" value={user.user_name} />
            <InfoRow label="Email" value={user.email} />
            <InfoRow label="Giới Tính" value={user.gender === "male" ? "Nam 👨" : user.gender === "female" ? "Nữ 👩" : user.gender ? "Khác" : null} />
            <InfoRow label="Mục Tiêu" value={user.goal} />
            <InfoRow label="Chiều Cao" value={user.height_cm ? `${user.height_cm} cm` : null} />
            <InfoRow label="Cân Nặng" value={user.weight_kg ? `${user.weight_kg} kg` : null} />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <DarkModal open={open} title="✏️ Cập nhật hồ sơ" onClose={() => setOpen(false)}>
        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Họ và tên</label>
            {inp("full_name", "text", "Nhập họ tên...")}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Chiều cao (cm)</label>
              {inp("height_cm", "number")}
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Cân nặng (kg)</label>
              {inp("weight_kg", "number")}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Giới tính</label>
              <select style={{ ...iStyle }} value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Mục tiêu</label>
              {inp("goal", "text", "VD: Giảm cân, Tăng cơ...")}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <button onClick={() => setOpen(false)} disabled={updating} style={{ padding: "11px 20px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 14 }}>Hủy</button>
            <button onClick={handleSave} disabled={updating} style={{ padding: "11px 22px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: updating ? 0.7 : 1 }}>
              {updating ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </DarkModal>
    </div>
  );
}
