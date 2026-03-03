import { useEffect, useState, useMemo } from "react";
import { getAllOrders } from "../services/orderService";
// IMPORT THÊM API LẤY KHÓA HỌC ĐỂ TRA GIÁ TIỀN
import { getAllCourses } from "../services/courseService";

export default function Revenue() {
  const [orders, setOrders] = useState([]);
  const [coursesMap, setCoursesMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // GỌI SONG SONG 2 API ĐỂ LẤY DATA GỐC
        const [resOrders, resCourses] = await Promise.all([
          getAllOrders(),
          getAllCourses(),
        ]);

        // 1. Xử lý Khóa học thành dạng Từ điển { id: thông_tin } để tra giá
        const coursesData = Array.isArray(resCourses)
          ? resCourses
          : resCourses.data?.data || resCourses.data || [];
        const cMap = {};
        coursesData.forEach((c) => {
          cMap[c.id] = c;
        });
        setCoursesMap(cMap);

        // 2. Xử lý Đơn hàng
        const dataOrders = Array.isArray(resOrders)
          ? resOrders
          : resOrders.data?.data || resOrders.data || [];
        setOrders(dataOrders);
      } catch (error) {
        console.error("Lỗi tải báo cáo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // TỰ ĐỘNG TÍNH TOÁN DOANH THU & TOP KHÓA HỌC BẰNG FRONTEND (CHUẨN 100%)
  const { totalRevenue, todayRevenue, topCourses } = useMemo(() => {
    let total = 0;
    let today = 0;
    const courseStats = {};

    // Lấy ngày hôm nay chuẩn định dạng (YYYY-MM-DD)
    const dateToday = new Date().toISOString().split("T")[0];

    orders.forEach((o) => {
      const status = (o.status || "").toUpperCase();

      // QUAN TRỌNG: Chỉ cộng tiền cho những đơn đã THÀNH CÔNG (SUCCESS hoặc COMPLETED)
      if (status !== "SUCCESS" && status !== "COMPLETED") return;

      // Tra cứu thông tin khóa học từ coursesMap
      const matchedCourse = coursesMap[o.course_id] || {};
      const courseName =
        o.course_name || matchedCourse.title || "Khóa học chưa rõ tên";
      const price = Number(
        o.amount || o.price || o.total_price || matchedCourse.price || 0,
      );

      // 1. Cộng vào tổng doanh thu
      total += price;

      // 2. Check xem có phải đơn phát sinh trong hôm nay không
      if (o.created_at || o.createdAt) {
        const orderDate = new Date(o.created_at || o.createdAt)
          .toISOString()
          .split("T")[0];
        if (orderDate === dateToday) {
          today += price;
        }
      }

      // 3. Gom nhóm để xếp hạng Top khóa học
      if (!courseStats[courseName]) {
        courseStats[courseName] = {
          title: courseName,
          price: price,
          sold: 0,
          revenue: 0,
        };
      }
      courseStats[courseName].sold += 1;
      courseStats[courseName].revenue += price;
    });

    // Trả về số liệu đã tính toán xong
    return {
      totalRevenue: total,
      todayRevenue: today,
      topCourses: Object.values(courseStats).sort(
        (a, b) => b.revenue - a.revenue,
      ),
    };
  }, [orders, coursesMap]);

  if (loading)
    return <div style={{ padding: 20 }}>Đang đồng bộ sổ sách...</div>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontWeight: 900 }}>Báo Cáo Doanh Thu</h2>
        <div style={{ color: "var(--muted)" }}>Dành riêng cho Admin</div>
      </div>

      {/* THẺ SỐ LIỆU */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 16,
        }}
      >
        <div
          className="card"
          style={{ padding: 20, borderTop: "4px solid #10B981" }}
        >
          <div style={{ color: "var(--muted)", fontSize: 13, fontWeight: 700 }}>
            TỔNG DOANH THU HỆ THỐNG
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: "#10B981",
              marginTop: 8,
            }}
          >
            {totalRevenue.toLocaleString()}đ
          </div>
        </div>
        <div
          className="card"
          style={{ padding: 20, borderTop: "4px solid #3B82F6" }}
        >
          <div style={{ color: "var(--muted)", fontSize: 13, fontWeight: 700 }}>
            DOANH THU HÔM NAY
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: "#3B82F6",
              marginTop: 8,
            }}
          >
            {todayRevenue.toLocaleString()}đ
          </div>
        </div>
        <div
          className="card"
          style={{ padding: 20, borderTop: "4px solid #F59E0B" }}
        >
          <div style={{ color: "var(--muted)", fontSize: 13, fontWeight: 700 }}>
            TỔNG LƯỢT MUA (ORDERS)
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: "#F59E0B",
              marginTop: 8,
            }}
          >
            {orders.length}{" "}
            <span style={{ fontSize: 14, fontWeight: 400, color: "#999" }}>
              lượt
            </span>
          </div>
        </div>
      </div>

      {/* BẢNG KHÓA HỌC BÁN CHẠY */}
      <div className="board">
        <div className="boardHeader">
          <b>🏆 Top Khóa Học Bán Chạy Nhất (Đã thanh toán)</b>
        </div>
        <div className="boardBody" style={{ padding: 0 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "#fcfcfc",
                  textAlign: "left",
                  fontSize: 13,
                }}
              >
                <th
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  Khóa học
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  Số lượt bán thành công
                </th>
                <th
                  style={{
                    padding: "12px 16px",
                    textAlign: "right",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  Tổng thu về
                </th>
              </tr>
            </thead>
            <tbody>
              {topCourses.map((c, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <b>
                      #{index + 1} - {c.title}
                    </b>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        background: "#eff6ff",
                        color: "#2563eb",
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontWeight: 700,
                      }}
                    >
                      {c.sold}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      textAlign: "right",
                      fontWeight: 800,
                      color: "#10B981",
                    }}
                  >
                    +{c.revenue.toLocaleString()}đ
                  </td>
                </tr>
              ))}
              {topCourses.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    style={{ textAlign: "center", padding: 30, color: "#999" }}
                  >
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
