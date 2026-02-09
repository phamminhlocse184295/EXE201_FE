import React, { useEffect, useState } from "react";
import { getProfile } from "../services/auth";

// 1. Copy y nguyên component RoleBadge từ file Users bạn gửi qua
function RoleBadge({ role }) {
  const map = {
    Admin: {
      bg: "rgba(255,106,0,.12)",
      bd: "rgba(255,106,0,.28)",
      tx: "#C2410C",
    },
    Manager: {
      bg: "rgba(124,58,237,.12)",
      bd: "rgba(124,58,237,.28)",
      tx: "#5B21B6",
    },
    Annotator: {
      bg: "rgba(16,185,129,.12)",
      bd: "rgba(16,185,129,.28)",
      tx: "#065F46",
    },
    Reviewer: {
      bg: "rgba(59,130,246,.12)",
      bd: "rgba(59,130,246,.28)",
      tx: "#1D4ED8",
    },
  };
  const s = map[role] || {
    bg: "rgba(152,162,179,.16)",
    bd: "rgba(152,162,179,.30)",
    tx: "#344054",
  };

  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        border: `1px solid ${s.bd}`,
        background: s.bg,
        color: s.tx,
        fontWeight: 700,
      }}
    >
      {role}
    </span>
  );
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then((data) => setUser(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <div style={{ padding: 20, color: "var(--muted)" }}>Loading...</div>;

  return (
    // 2. Wrapper: Dùng đúng style của Users.jsx -> display: grid, gap: 16
    // Điều này đảm bảo nó sát lên trên, không bị canh giữa
    <div style={{ display: "grid", gap: 16 }}>
      {/* 3. Header: Copy cấu trúc Header của Users */}
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
          <h2 style={{ margin: 0, fontWeight: 900 }}>Hồ Sơ Admin</h2>
          <div style={{ color: "var(--muted)" }}>
            Thông tin tài khoản hệ thống
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Nút bấm giữ nguyên style btnPrimary */}
          <button className="btn btnPrimary">Cập nhật thông tin</button>
        </div>
      </div>

      {/* 4. Board: Dùng class "board" y hệt trang Users */}
      <div className="board">
        <div className="boardHeader">
          <b>Chi tiết tài khoản</b>
          <span>ID: {user?.user_Id || "---"}</span>
        </div>

        <div className="boardBody" style={{ padding: "32px" }}>
          {/* Nội dung bên trong Board */}
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {/* Cột trái: Avatar */}
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
                {user?.full_name?.charAt(0).toUpperCase()}
              </div>
            </div>

            {/* Cột phải: Thông tin */}
            <div style={{ flex: 1, minWidth: "250px" }}>
              <div style={{ marginBottom: 24 }}>
                <h2
                  style={{ margin: "0 0 8px 0", fontSize: 24, fontWeight: 800 }}
                >
                  {user?.full_name}
                </h2>
                <RoleBadge role={user?.role || "Admin"} />
              </div>

              {/* Grid hiển thị thông tin dạng lưới */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "24px 16px",
                }}
              >
                <InfoGroup label="Tên đăng nhập" value={user?.user_name} />
                <InfoGroup label="Email" value={user?.email} />
                <InfoGroup
                  label="Thời gian luyện tập"
                  value={`${user?.total_practice_minutes || 0} phút`}
                />
                <InfoGroup
                  label="Chiều cao"
                  value={
                    user?.height_cm ? `${user.height_cm} cm` : "Chưa cập nhật"
                  }
                />
                <InfoGroup
                  label="Cân nặng"
                  value={
                    user?.weight_kg ? `${user.weight_kg} kg` : "Chưa cập nhật"
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component hiển thị từng dòng thông tin (giống style text trong table)
function InfoGroup({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600 }}>{value}</div>
    </div>
  );
}
