import { useEffect, useState, useMemo } from "react";
import {
  getAllOrders,
  getTotalRevenue,
  getDailyRevenue,
} from "../services/orderService";

export default function Revenue() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ total: 0, today: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy ngày hôm nay (YYYY-MM-DD)
        const today = new Date().toISOString().split("T")[0];

        // GỌI SONG SONG 3 API
        const [resOrders, resTotalRev, resDailyRev] = await Promise.all([
          getAllOrders(),
          getTotalRevenue(),
          getDailyRevenue(today),
        ]);

        // Xử lý danh sách đơn hàng
        const dataOrders = Array.isArray(resOrders)
          ? resOrders
          : resOrders.data?.data || resOrders.data || [];
        setOrders(dataOrders);

        // Xử lý tiền từ API (Đọc theo cấu trúc API trả về)
        const total =
          resTotalRev.data?.data ||
          resTotalRev.data?.revenue ||
          resTotalRev.data ||
          0;
        const daily =
          resDailyRev.data?.data ||
          resDailyRev.data?.revenue ||
          resDailyRev.data ||
          0;

        setStats({ total: Number(total), today: Number(daily) });
      } catch (error) {
        console.error("Lỗi tải báo cáo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // FRONTEND TỰ TÍNH TOP KHÓA HỌC BÁN CHẠY TỪ DANH SÁCH ORDERS
  const topCourses = useMemo(() => {
    const courseMap = {};
    orders.forEach((o) => {
      // Chỉ tính các đơn đã thanh toán thành công
      const status = (o.status || "").toUpperCase();
      if (status === "CANCELED" || status === "FAILED") return;

      const courseName =
        o.course_name || o.course?.title || "Khóa học chưa rõ tên";
      const price = Number(o.price || o.total_price || o.course?.price || 0);

      if (!courseMap[courseName]) {
        courseMap[courseName] = {
          title: courseName,
          price: price,
          sold: 0,
          revenue: 0,
        };
      }
      courseMap[courseName].sold += 1;
      courseMap[courseName].revenue += price;
    });

    return Object.values(courseMap).sort((a, b) => b.revenue - a.revenue);
  }, [orders]);

  if (loading)
    return <div style={{ padding: 20 }}>Đang đồng bộ sổ sách...</div>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <h2 style={{ margin: 0, fontWeight: 900 }}>Báo Cáo Doanh Thu</h2>
        <div style={{ color: "var(--muted)" }}>Dành riêng cho Admin</div>
      </div>

      {/* THẺ SỐ LIỆU TỪ API CHUYÊN DỤNG */}
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
            {stats.total.toLocaleString()}đ
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
            {stats.today.toLocaleString()}đ
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
          <b>🏆 Top Khóa Học Bán Chạy Nhất</b>
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
                    Chưa có dữ liệu
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
