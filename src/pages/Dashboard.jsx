import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { getAllUsers } from "../services/userService";
import { getAllExercises } from "../services/exerciseService";
import { getAllCourses } from "../services/courseService";
import { playTick, playSend } from "../lib/sounds";
import AnimatedCounter from "../components/AnimatedCounter";
import { FadeIn, ScaleFade } from "../components/Animations";
import { motion } from "framer-motion";

const PIE_COLORS = ["#00f5ff", "#10B981", "#8B5CF6", "#F59E0B"];

function StatCard({ title, value, sub, color, icon, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ position: "relative", padding: 20, borderRadius: 18, background: "rgba(0,10,20,0.7)", border: "1px solid rgba(0,245,255,0.12)", overflow: "hidden", transition: "all 0.2s", cursor: "default", borderTop: `3px solid ${color}` }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = `0 0 30px ${color}22, 0 8px 30px rgba(0,0,0,0.4)`; playTick(); }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,245,255,0.01) 2px,rgba(0,245,255,0.01) 4px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `${color}15`, filter: "blur(16px)", pointerEvents: "none" }} />
      <div style={{ fontSize: 10, color: "rgba(0,245,255,0.5)", letterSpacing: "1.5px", fontFamily: "monospace", fontWeight: 600 }}>{icon} {title}</div>
      <div style={{ fontSize: 30, fontWeight: 900, color, marginTop: 8, letterSpacing: "-0.5px" }}>
        <AnimatedCounter value={value} duration={1000} />
      </div>
      <div style={{ fontSize: 11, color: "rgba(0,245,255,0.3)", marginTop: 6, fontFamily: "monospace" }}>{sub}</div>
    </motion.div>
  );
}

function Board({ title, right, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      style={{ borderRadius: 18, border: "1px solid rgba(0,245,255,0.12)", background: "rgba(0,10,20,0.7)", overflow: "hidden" }}
    >
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(0,245,255,0.08)", background: "rgba(0,245,255,0.02)" }}>
        <span style={{ color: "#00f5ff", fontWeight: 700, fontSize: 14, fontFamily: "monospace", letterSpacing: "1px" }}>{title}</span>
        <span style={{ fontSize: 11, color: "rgba(0,245,255,0.35)", background: "rgba(0,245,255,0.08)", padding: "3px 10px", borderRadius: 999, fontFamily: "monospace" }}>{right}</span>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </motion.div>
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

  const pieData = useMemo(() =>
    [{ name: "Users", value: stats.totalUsers }, { name: "Exercises", value: stats.totalExercises }, { name: "Courses", value: stats.totalCourses }]
      .filter(i => i.value > 0),
    [stats]
  );

  const barData = useMemo(() => [
    { name: "Users", count: stats.totalUsers },
    { name: "Exercises", count: stats.totalExercises },
    { name: "Courses", count: stats.totalCourses },
    { name: "Active", count: stats.activeUsers },
  ], [stats]);

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <style>{`
        @keyframes dashGrid { 0%{background-position:0 0} 100%{background-position:30px 30px} }
      `}</style>

      <FadeIn>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ margin: 0, fontWeight: 900, fontSize: 24, color: "#00f5ff", fontFamily: "monospace", letterSpacing: "1px" }}>⚡ HỆ THỐNG EASYSTRETCH</h2>
            <div style={{ color: "rgba(0,245,255,0.4)", fontSize: 13, marginTop: 4, fontFamily: "monospace" }}>{loading ? "⏳ SYNCING DATA..." : "📡 Real-time system overview"}</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ padding: "11px 18px", borderRadius: 12, border: "1px solid rgba(0,245,255,0.2)", background: "rgba(0,245,255,0.06)", color: "#00f5ff", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "monospace", transition: "all 0.18s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(0,245,255,0.12)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(0,245,255,0.06)"}
              onClick={() => { playSend(); navigate("/manager/courses"); }}>Xem Khóa Học</button>
            <button style={{ padding: "11px 18px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#00f5ff22,#6366f144)", color: "#00f5ff", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "monospace", boxShadow: "0 0 20px rgba(0,245,255,0.15)", transition: "all 0.18s" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 30px rgba(0,245,255,0.3)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 20px rgba(0,245,255,0.15)"}
              onClick={() => { playSend(); navigate("/manager/exercises"); }}>+ Thêm Bài Tập</button>
          </div>
        </div>
      </FadeIn>


      {/* Stat Cards */}
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
        <StatCard icon="👥" title="THÀNH VIÊN" value={stats.totalUsers} sub={`${stats.activeUsers} đang hoạt động`} color="#00f5ff" index={0} />
        <StatCard icon="🏋️" title="BÀI TẬP" value={stats.totalExercises} sub="Trong thư viện" color="#10B981" index={1} />
        <StatCard icon="📚" title="KHÓA HỌC" value={stats.totalCourses} sub="Đang kinh doanh" color="#8B5CF6" index={2} />
        <StatCard icon="💰" title="GIÁ TRỊ KHOÁ" value={`${stats.totalCourseValue.toLocaleString()}đ`} sub="Tổng giá niêm yết" color="#F59E0B" index={3} />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit,minmax(360px,1fr))", alignItems: "start" }}>
        <Board title="📊 TỈ LỆ DỮ LIỆU" right={`Tổng: ${stats.totalUsers + stats.totalExercises + stats.totalCourses}`} delay={0.5}>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={5}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "rgba(0,10,20,0.95)", border: "1px solid rgba(0,245,255,0.2)", borderRadius: 10, color: "#00f5ff", fontFamily: "monospace", fontSize: 12 }} />
                <Legend wrapperStyle={{ color: "rgba(0,245,255,0.5)", fontSize: 12, fontFamily: "monospace" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Board>

        <Board title="📈 THỐNG KÊ NHANH" right="Bar Chart">
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,245,255,0.08)" />
                <XAxis dataKey="name" tick={{ fill: "rgba(0,245,255,0.5)", fontSize: 11, fontFamily: "monospace" }} axisLine={{ stroke: "rgba(0,245,255,0.15)" }} />
                <YAxis tick={{ fill: "rgba(0,245,255,0.5)", fontSize: 11, fontFamily: "monospace" }} axisLine={{ stroke: "rgba(0,245,255,0.15)" }} />
                <Tooltip contentStyle={{ background: "rgba(0,10,20,0.95)", border: "1px solid rgba(0,245,255,0.2)", borderRadius: 10, color: "#00f5ff", fontFamily: "monospace", fontSize: 12 }} />
                <Bar dataKey="count" name="Số lượng" fill="#00f5ff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Board>
      </div>

      {/* Activity Board */}
      <Board title="⚡ HOẠT ĐỘNG MỚI" right="Live">
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ padding: 16, borderRadius: 14, borderLeft: "3px solid #00f5ff", background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.1)", borderLeftColor: "#00f5ff", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,245,255,0.3)"; playTick(); }}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(0,245,255,0.1)"}>
            <div style={{ color: "#00f5ff", fontWeight: 700, fontSize: 14, fontFamily: "monospace" }}>👤 Thành viên mới nhất</div>
            <div style={{ color: "rgba(0,245,255,0.5)", fontSize: 13, marginTop: 4 }}>
              {users.length > 0 ? <>Chào mừng <b style={{ color: "#00f5ff" }}>{users[users.length - 1].full_name}</b> vừa gia nhập!</> : "Chưa có dữ liệu."}
            </div>
          </div>
          <div style={{ padding: 16, borderRadius: 14, borderLeft: "3px solid #8B5CF6", background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.1)", borderLeftColor: "#8B5CF6", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(99,102,241,0.3)"; playTick(); }}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.1)"}>
            <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: 14, fontFamily: "monospace" }}>📚 Khóa học tiêu biểu</div>
            <div style={{ color: "rgba(0,245,255,0.5)", fontSize: 13, marginTop: 4 }}>
              {courses.length > 0 ? <>Khóa học <b style={{ color: "#a78bfa" }}>"{courses[0].title}"</b> — {Number(courses[0].price).toLocaleString()}đ</> : "Chưa có khóa học."}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <button style={{ flex: 1, padding: "11px", borderRadius: 12, border: "1px solid rgba(0,245,255,0.2)", background: "rgba(0,245,255,0.06)", color: "#00f5ff", cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "monospace", transition: "all 0.18s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(0,245,255,0.12)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(0,245,255,0.06)"}
              onClick={() => { playSend(); navigate("/manager/users"); }}>Quản lý Users</button>
            <button style={{ flex: 1, padding: "11px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#00f5ff22,#6366f144)", color: "#00f5ff", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "monospace", boxShadow: "0 0 16px rgba(0,245,255,0.15)", transition: "all 0.18s" }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 30px rgba(0,245,255,0.3)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 16px rgba(0,245,255,0.15)"}
              onClick={() => { playSend(); navigate("/manager/courses"); }}>Quản lý Courses</button>
          </div>
        </div>
      </Board>
    </div>
  );
}
