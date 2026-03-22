import { useEffect, useState, useMemo } from "react";
import { getAllOrders } from "../services/orderService";
import { getAllCourses } from "../services/courseService";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { playTick } from "../lib/sounds";
import AnimatedCounter from "../components/AnimatedCounter";
import { FadeIn } from "../components/Animations";
import { motion } from "framer-motion";

const COLORS = ["#00f5ff", "#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#3b82f6"];

const darkCard = (accent) => ({
  padding: 24, borderRadius: 18, position: "relative", overflow: "hidden",
  background: "rgba(0,10,20,0.7)", border: "1px solid rgba(0,245,255,0.12)",
  boxShadow: `0 0 20px ${accent}11, 0 4px 24px rgba(0,0,0,0.3)`,
  borderTop: `3px solid ${accent}`,
});

export default function Revenue() {
  const [orders, setOrders] = useState([]);
  const [coursesMap, setCoursesMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [resOrders, resCourses] = await Promise.all([getAllOrders(), getAllCourses()]);
        const coursesData = Array.isArray(resCourses) ? resCourses : resCourses.data?.data || resCourses.data || [];
        const cMap = {};
        coursesData.forEach(c => { cMap[c.id] = c; });
        setCoursesMap(cMap);
        setOrders(Array.isArray(resOrders) ? resOrders : resOrders.data?.data || resOrders.data || []);
      } catch (err) {
        console.error("Lỗi tải báo cáo:", err);
      } finally { setLoading(false); }
    })();
  }, []);

  const { totalRevenue, todayRevenue, topCourses, monthlyData, pieData } = useMemo(() => {
    let total = 0, today = 0;
    const courseStats = {};
    const monthStats = {};
    const dateToday = new Date().toISOString().split("T")[0];

    orders.forEach(o => {
      const status = (o.status || "").toUpperCase();
      if (status !== "SUCCESS" && status !== "COMPLETED") return;
      const matchedCourse = coursesMap[o.course_id] || {};
      const courseName = o.course_name || matchedCourse.title || "Khóa học chưa rõ tên";
      const price = Number(o.amount || o.price || o.total_price || matchedCourse.price || 0);
      total += price;
      if (o.created_at || o.createdAt) {
        const d = new Date(o.created_at || o.createdAt);
        const orderDate = d.toISOString().split("T")[0];
        if (orderDate === dateToday) today += price;
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (!monthStats[monthKey]) monthStats[monthKey] = { month: monthKey, revenue: 0, orders: 0 };
        monthStats[monthKey].revenue += price;
        monthStats[monthKey].orders += 1;
      }
      if (!courseStats[courseName]) courseStats[courseName] = { title: courseName, price, sold: 0, revenue: 0 };
      courseStats[courseName].sold += 1;
      courseStats[courseName].revenue += price;
    });

    const sorted = Object.values(courseStats).sort((a, b) => b.revenue - a.revenue);
    return {
      totalRevenue: total, todayRevenue: today,
      topCourses: sorted,
      monthlyData: Object.values(monthStats).sort((a, b) => a.month.localeCompare(b.month)),
      pieData: sorted.slice(0, 5).map(c => ({ name: c.title, value: c.revenue })),
    };
  }, [orders, coursesMap]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "rgba(0,245,255,0.5)", fontSize: 16, fontFamily: "monospace" }}>
      ⏳ LOADING DATA...
    </div>
  );

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <style>{`
        @keyframes revGlow { 0%,100%{box-shadow:0 0 8px #00f5ff11} 50%{box-shadow:0 0 20px #00f5ff22} }
        @keyframes revGridMove { 0%{background-position:0 0} 100%{background-position:30px 30px} }
      `}</style>

      {/* Header */}
      <FadeIn>
        <div>
          <h2 style={{ margin: 0, fontWeight: 900, fontSize: 24, color: "#00f5ff", fontFamily: "monospace", letterSpacing: "1px" }}>📊 BÁO CÁO DOANH THU</h2>
          <div style={{ color: "rgba(0,245,255,0.4)", fontSize: 13, marginTop: 4, fontFamily: "monospace" }}>Admin Revenue Analytics — dữ liệu thời thực</div>
        </div>
      </FadeIn>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
        {[
          { label: "TỔNG DOANH THU", value: `${totalRevenue.toLocaleString()}đ`, sub: "Từ các đơn thành công", color: "#10B981" },
          { label: "DOANH THU HÔM NAY", value: `${todayRevenue.toLocaleString()}đ`, sub: "Phát sinh trong ngày", color: "#00f5ff" },
          { label: "TỔNG LƯỢT MUA", value: orders.length, sub: "Bao gồm đơn chưa xử lý", color: "#F59E0B" },
          { label: "KHÓA HỌC BÁN CHẠY", value: topCourses[0]?.title || "N/A", sub: topCourses[0] ? `${topCourses[0].sold} lượt — ${topCourses[0].revenue.toLocaleString()}đ` : "", color: "#8B5CF6" },
        ].map(({ label, value, sub, color }, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={darkCard(color)}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 0 30px ${color}22, 0 8px 30px rgba(0,0,0,0.4)`; playTick(); }}
            onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,245,255,0.01) 2px,rgba(0,245,255,0.01) 4px)", pointerEvents: "none" }} />
            <div style={{ fontSize: 10, color: "rgba(0,245,255,0.5)", letterSpacing: "1.5px", fontFamily: "monospace", fontWeight: 600 }}>{label}</div>
            <div style={{ fontSize: typeof value === "string" && value.length > 15 ? 16 : 30, fontWeight: 900, color, marginTop: 8, letterSpacing: "-0.5px" }}>
              {typeof value === "number" ? <AnimatedCounter value={value} duration={900} /> : value}
            </div>
            <div style={{ fontSize: 11, color: "rgba(0,245,255,0.3)", marginTop: 4, fontFamily: "monospace" }}>{sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "2fr 1fr", alignItems: "start" }}>
        {/* Bar Chart — Monthly Revenue */}
        <div style={{ borderRadius: 18, border: "1px solid rgba(0,245,255,0.12)", background: "rgba(0,10,20,0.7)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0,245,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "#00f5ff", fontWeight: 700, fontSize: 14, fontFamily: "monospace", letterSpacing: "1px" }}>📈 DOANH THU THEO THÁNG</span>
            <span style={{ fontSize: 11, color: "rgba(0,245,255,0.3)", background: "rgba(0,245,255,0.08)", padding: "2px 8px", borderRadius: 4, fontFamily: "monospace" }}>{monthlyData.length} tháng</span>
          </div>
          <div style={{ padding: 20, height: 300 }}>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,245,255,0.08)" />
                  <XAxis dataKey="month" tick={{ fill: "rgba(0,245,255,0.5)", fontSize: 11, fontFamily: "monospace" }} axisLine={{ stroke: "rgba(0,245,255,0.15)" }} />
                  <YAxis tick={{ fill: "rgba(0,245,255,0.5)", fontSize: 11, fontFamily: "monospace" }} axisLine={{ stroke: "rgba(0,245,255,0.15)" }} tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                  <Tooltip contentStyle={{ background: "rgba(0,10,20,0.95)", border: "1px solid rgba(0,245,255,0.2)", borderRadius: 10, color: "#00f5ff", fontFamily: "monospace", fontSize: 12 }} formatter={(v) => [`${v.toLocaleString()}đ`, "Doanh thu"]} />
                  <Legend wrapperStyle={{ color: "rgba(0,245,255,0.5)", fontSize: 12, fontFamily: "monospace" }} />
                  <Bar dataKey="revenue" name="Doanh thu" fill="#00f5ff" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="orders" name="Đơn hàng" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "rgba(0,245,255,0.3)", fontFamily: "monospace", fontSize: 13 }}>Chưa có dữ liệu theo tháng</div>
            )}
          </div>
        </div>

        {/* Pie Chart — Course Distribution */}
        <div style={{ borderRadius: 18, border: "1px solid rgba(0,245,255,0.12)", background: "rgba(0,10,20,0.7)", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0,245,255,0.08)" }}>
            <span style={{ color: "#00f5ff", fontWeight: 700, fontSize: 14, fontFamily: "monospace", letterSpacing: "1px" }}>🍩 PHÂN BỐ DOANH THU</span>
          </div>
          <div style={{ padding: 20, height: 300 }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={4}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "rgba(0,10,20,0.95)", border: "1px solid rgba(0,245,255,0.2)", borderRadius: 10, color: "#00f5ff", fontFamily: "monospace", fontSize: 12 }} formatter={(v) => [`${v.toLocaleString()}đ`]} />
                  <Legend wrapperStyle={{ color: "rgba(0,245,255,0.5)", fontSize: 11, fontFamily: "monospace" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "rgba(0,245,255,0.3)", fontFamily: "monospace", fontSize: 13 }}>Chưa có dữ liệu</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Courses Table */}
      <div style={{ borderRadius: 18, border: "1px solid rgba(0,245,255,0.12)", background: "rgba(0,10,20,0.7)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(0,245,255,0.08)", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#00f5ff", fontWeight: 700, fontSize: 14, fontFamily: "monospace", letterSpacing: "1px" }}>🏆 TOP KHÓA HỌC BÁN CHẠY</span>
          <span style={{ fontSize: 11, color: "rgba(0,245,255,0.3)", background: "rgba(0,245,255,0.08)", padding: "2px 8px", borderRadius: 4, fontFamily: "monospace" }}>Đã thanh toán</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(0,245,255,0.03)" }}>
                {["#", "KHÓA HỌC", "LƯỢT BÁN", "TỔNG THU"].map((h, i) => (
                  <th key={h} style={{ padding: "12px 20px", textAlign: i === 2 ? "center" : i === 3 ? "right" : "left", fontSize: 10, color: "rgba(0,245,255,0.5)", letterSpacing: "1.5px", textTransform: "uppercase", borderBottom: "1px solid rgba(0,245,255,0.08)", fontWeight: 600, fontFamily: "monospace" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topCourses.map((c, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(0,245,255,0.05)", transition: "background 0.15s", cursor: "default" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,245,255,0.05)"; playTick(); }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                  <td style={{ padding: "14px 20px", color: "rgba(0,245,255,0.3)", fontWeight: 700, fontSize: 12, fontFamily: "monospace" }}>#{i + 1}</td>
                  <td style={{ padding: "14px 20px", color: "#fff", fontWeight: 600, fontSize: 13 }}>{c.title}</td>
                  <td style={{ padding: "14px 20px", textAlign: "center" }}>
                    <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 999, background: "rgba(0,245,255,0.12)", color: "#00f5ff", fontWeight: 700, fontSize: 12, fontFamily: "monospace" }}>{c.sold}</span>
                  </td>
                  <td style={{ padding: "14px 20px", textAlign: "right", fontWeight: 800, color: "#10B981", fontSize: 14, fontFamily: "monospace" }}>+{c.revenue.toLocaleString()}đ</td>
                </tr>
              ))}
              {topCourses.length === 0 && (
                <tr><td colSpan={4} style={{ textAlign: "center", padding: 40, color: "rgba(0,245,255,0.25)", fontSize: 13, fontFamily: "monospace" }}>Chưa có dữ liệu bán hàng thành công</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
