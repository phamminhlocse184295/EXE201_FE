import { useEffect, useState, useMemo } from "react";
import { getAllOrders } from "../services/orderService";
import { getAllCourses } from "../services/courseService";

const darkCard = (accent) => ({
  padding: 24, borderRadius: 18,
  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.2)", position: "relative", overflow: "hidden",
  borderTop: `3px solid ${accent}`,
});
const badge = (bg, col) => ({
  display: "inline-block", padding: "2px 10px", borderRadius: 999,
  background: bg, color: col, fontWeight: 700, fontSize: 12,
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
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const { totalRevenue, todayRevenue, topCourses } = useMemo(() => {
    let total = 0, today = 0;
    const courseStats = {};
    const dateToday = new Date().toISOString().split("T")[0];
    orders.forEach(o => {
      const status = (o.status || "").toUpperCase();
      if (status !== "SUCCESS" && status !== "COMPLETED") return;
      const matchedCourse = coursesMap[o.course_id] || {};
      const courseName = o.course_name || matchedCourse.title || "Khóa học chưa rõ tên";
      const price = Number(o.amount || o.price || o.total_price || matchedCourse.price || 0);
      total += price;
      if (o.created_at || o.createdAt) {
        const orderDate = new Date(o.created_at || o.createdAt).toISOString().split("T")[0];
        if (orderDate === dateToday) today += price;
      }
      if (!courseStats[courseName]) courseStats[courseName] = { title: courseName, price, sold: 0, revenue: 0 };
      courseStats[courseName].sold += 1;
      courseStats[courseName].revenue += price;
    });
    return {
      totalRevenue: total, todayRevenue: today,
      topCourses: Object.values(courseStats).sort((a, b) => b.revenue - a.revenue),
    };
  }, [orders, coursesMap]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "rgba(255,255,255,0.5)", fontSize: 16 }}>
      ⏳ Đang đồng bộ sổ sách...
    </div>
  );

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div>
        <h2 style={{ margin: 0, fontWeight: 900, fontSize: 24, color: "#fff" }}>Báo Cáo Doanh Thu</h2>
        <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, marginTop: 4 }}>Dành riêng cho Admin — dữ liệu thời thực</div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
        <div style={darkCard("#10B981")}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase" }}>Tổng Doanh Thu</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: "#10B981", marginTop: 8, letterSpacing: "-1px" }}>{totalRevenue.toLocaleString()}đ</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>Từ các đơn thành công</div>
        </div>
        <div style={darkCard("#3B82F6")}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase" }}>Doanh Thu Hôm Nay</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: "#3B82F6", marginTop: 8, letterSpacing: "-1px" }}>{todayRevenue.toLocaleString()}đ</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>Phát sinh trong ngày</div>
        </div>
        <div style={darkCard("#F59E0B")}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase" }}>Tổng Lượt Mua</div>
          <div style={{ fontSize: 30, fontWeight: 900, color: "#F59E0B", marginTop: 8, letterSpacing: "-1px" }}>
            {orders.length} <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.3)" }}>lượt</span>
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>Bao gồm đơn chưa xử lý</div>
        </div>
      </div>

      {/* Top Courses Table */}
      <div style={{ borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>🏆 Top Khóa Học Bán Chạy</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: 999 }}>Đã thanh toán</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)", fontWeight: 600 }}>#</th>
                <th style={{ padding: "12px 20px", textAlign: "left", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)", fontWeight: 600 }}>Khóa Học</th>
                <th style={{ padding: "12px 20px", textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)", fontWeight: 600 }}>Lượt Bán</th>
                <th style={{ padding: "12px 20px", textAlign: "right", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: "1px", textTransform: "uppercase", borderBottom: "1px solid rgba(255,255,255,0.06)", fontWeight: 600 }}>Tổng Thu</th>
              </tr>
            </thead>
            <tbody>
              {topCourses.map((c, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 20px", color: "rgba(255,255,255,0.3)", fontWeight: 700, fontSize: 13 }}>#{i + 1}</td>
                  <td style={{ padding: "14px 20px", color: "#fff", fontWeight: 600, fontSize: 14 }}>{c.title}</td>
                  <td style={{ padding: "14px 20px", textAlign: "center" }}>
                    <span style={badge("rgba(59,130,246,0.18)", "#60a5fa")}>{c.sold}</span>
                  </td>
                  <td style={{ padding: "14px 20px", textAlign: "right", fontWeight: 800, color: "#10B981", fontSize: 14 }}>
                    +{c.revenue.toLocaleString()}đ
                  </td>
                </tr>
              ))}
              {topCourses.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.25)", fontSize: 14 }}>
                    Chưa có dữ liệu bán hàng thành công
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
