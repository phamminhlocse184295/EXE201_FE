import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
} from "recharts";
import { getAllUsers } from "../services/userService";
import { getAllExercises } from "../services/exerciseService";
import { getAllCourses } from "../services/courseService";

const PIE_COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B"];

const S = {
  page: { display: "grid", gap: 20 },
  heading: { margin: 0, fontWeight: 900, fontSize: 24, color: "#fff" },
  subtext: { color: "rgba(255,255,255,0.45)", fontSize: 14, marginTop: 4 },
  statGrid: { display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" },
  statCard: (color) => ({
    position: "relative", padding: "20px", borderRadius: 18,
    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
    overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
  }),
  statAccent: (color) => ({
    position: "absolute", top: 0, left: 0, right: 0, height: 3,
    background: color,
  }),
  statGlow: (color) => ({
    position: "absolute", bottom: -20, right: -20,
    width: 80, height: 80, borderRadius: "50%",
    background: `${color}22`, filter: "blur(14px)", pointerEvents: "none",
  }),
  statTitle: { fontSize: 12, color: "rgba(255,255,255,0.45)", letterSpacing: "0.4px", textTransform: "uppercase" },
  statValue: (color) => ({ fontSize: 32, fontWeight: 900, color, marginTop: 8, letterSpacing: "-1px" }),
  statSub: { fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 6 },
  board: {
    borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)", overflow: "hidden",
    boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
  },
  boardHeader: {
    padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.02)",
  },
  boardTitle: { color: "#fff", fontWeight: 700, fontSize: 15 },
  boardRight: { fontSize: 12, color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: 999 },
  boardBody: { padding: 20 },
  actCard: (color) => ({
    padding: "16px", borderRadius: 14, borderLeft: `3px solid ${color}`,
    background: "rgba(255,255,255,0.04)", border: `1px solid rgba(255,255,255,0.07)`,
    borderLeftColor: color, marginBottom: 10,
  }),
  actTitle: { color: "#fff", fontWeight: 700, fontSize: 14 },
  actSub: { color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 4 },
  btn: {
    flex: 1, padding: "11px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.06)", color: "#fff", cursor: "pointer", fontSize: 13,
    transition: "all 0.18s", fontWeight: 600,
  },
  btnPrimary: {
    flex: 1, padding: "11px", borderRadius: 12, border: "none",
    background: "linear-gradient(135deg,#3b82f6,#6366f1)", color: "#fff",
    cursor: "pointer", fontSize: 13, fontWeight: 700, transition: "all 0.18s",
    boxShadow: "0 4px 16px rgba(59,130,246,0.3)",
  },
};

function StatCard({ title, value, sub, color }) {
  return (
    <div style={S.statCard(color)}>
      <div style={S.statAccent(color)} />
      <div style={S.statGlow(color)} />
      <div style={S.statTitle}>{title}</div>
      <div style={S.statValue(color)}>{value}</div>
      <div style={S.statSub}>{sub}</div>
    </div>
  );
}

function Board({ title, right, children }) {
  return (
    <div style={S.board}>
      <div style={S.boardHeader}>
        <span style={S.boardTitle}>{title}</span>
        <span style={S.boardRight}>{right}</span>
      </div>
      <div style={S.boardBody}>{children}</div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    let ok = true;
    (async () => {
      try { const r = await getAllUsers(); if (ok) setUsers(r.data?.data || r.data || r || []); } catch {}
      try {
        const r = await getAllExercises();
        if (ok) setExercises(r.data?.data || r.data || r || []);
      } catch (err) {
        if (err?.response?.status === 403) {
          try { const { default: api } = await import("../services/api"); const r = await api.get("/exercises/client"); if (ok) setExercises(r.data?.data || r.data || r || []); } catch {}
        }
      }
      try { const r = await getAllCourses(); if (ok) setCourses(Array.isArray(r) ? r : r.data || []); } catch {}
      if (ok) setLoading(false);
    })();
    return () => { ok = false; };
  }, []);

  const stats = useMemo(() => ({
    totalUsers: users.length,
    totalExercises: exercises.length,
    totalCourses: courses.length,
    activeUsers: users.filter(u => u.is_active === true).length,
    totalCourseValue: courses.reduce((s, c) => s + (Number(c.price) || 0), 0),
  }), [users, exercises, courses]);

  const chartData = useMemo(() =>
    [{ name: "Users", value: stats.totalUsers }, { name: "Exercises", value: stats.totalExercises }, { name: "Courses", value: stats.totalCourses }]
      .filter(i => i.value > 0),
    [stats]
  );

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <h2 style={S.heading}>Hệ Thống EasyStretch</h2>
          <div style={S.subtext}>{loading ? "⏳ Đang đồng bộ dữ liệu..." : "📡 Báo cáo tổng quan thời thực"}</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={S.btn} onClick={() => navigate("/manager/courses")}>Xem Khóa Học</button>
          <button style={S.btnPrimary} onClick={() => navigate("/manager/exercises")}>+ Thêm Bài Tập</button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={S.statGrid}>
        <StatCard title="Thành Viên" value={stats.totalUsers} sub={`${stats.activeUsers} đang hoạt động`} color="#3B82F6" />
        <StatCard title="Bài Tập" value={stats.totalExercises} sub="Trong thư viện" color="#10B981" />
        <StatCard title="Khóa Học" value={stats.totalCourses} sub="Đang kinh doanh" color="#8B5CF6" />
        <StatCard title="Giá Trị Khoá" value={`${stats.totalCourseValue.toLocaleString()}đ`} sub="Tổng giá niêm yết" color="#F59E0B" />
      </div>

      {/* Charts & Activity */}
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(360px,1fr))", alignItems: "start" }}>
        <Board title="📊 Tỉ Lệ Dữ Liệu" right={`Tổng: ${stats.totalUsers + stats.totalExercises + stats.totalCourses}`}>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={5}>
                  {chartData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff" }} />
                <Legend wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Board>

        <Board title="⚡ Hoạt Động Mới" right="Live">
          <div>
            <div style={S.actCard("#3B82F6")}>
              <div style={S.actTitle}>👤 Thành viên mới nhất</div>
              <div style={S.actSub}>
                {users.length > 0 ? <>Chào mừng <b style={{ color: "#60a5fa" }}>{users[users.length - 1].full_name}</b> vừa gia nhập!</> : "Chưa có dữ liệu."}
              </div>
            </div>
            <div style={S.actCard("#8B5CF6")}>
              <div style={S.actTitle}>📚 Khóa học tiêu biểu</div>
              <div style={S.actSub}>
                {courses.length > 0 ? <>Khóa học <b style={{ color: "#a78bfa" }}>"{courses[0].title}"</b> — {Number(courses[0].price).toLocaleString()}đ</> : "Chưa có khóa học."}
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button style={S.btn} onClick={() => navigate("/manager/users")}>Quản lý Users</button>
              <button style={S.btnPrimary} onClick={() => navigate("/manager/courses")}>Quản lý Courses</button>
            </div>
          </div>
        </Board>
      </div>
    </div>
  );
}
