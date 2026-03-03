import { useEffect, useState, useMemo } from "react";
import { getAllOrders, updateOrderStatus } from "../services/orderService";
import { getAllCourses } from "../services/courseService";

export default function Transactions() {
  const [orders, setOrders] = useState([]);
  const [coursesMap, setCoursesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  // Thêm cờ isBackground để phân biệt: Load lần đầu thì hiện chữ "Đang tải", load ngầm thì không hiện.
  const fetchData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true); // Chỉ bật loading khi load lần đầu tiên hoặc khi đổi trạng thái

      // Gọi song song 2 API: Lấy Đơn hàng và Lấy Khóa học
      const [resOrders, resCourses] = await Promise.all([
        getAllOrders(),
        getAllCourses(),
      ]);

      // 1. XỬ LÝ KHÓA HỌC: Biến thành dạng Dictionary { id: thông_tin } để tra cứu
      const coursesData = Array.isArray(resCourses)
        ? resCourses
        : resCourses.data?.data || resCourses.data || [];
      const cMap = {};
      coursesData.forEach((c) => {
        cMap[c.id] = c;
      });
      setCoursesMap(cMap);

      // 2. XỬ LÝ ĐƠN HÀNG
      const data = Array.isArray(resOrders)
        ? resOrders
        : resOrders.data?.data || resOrders.data || [];

      // Sắp xếp đơn mới nhất lên đầu
      const sortedData = data.sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
      );

      setOrders(sortedData);
    } catch (error) {
      console.error("Lỗi tải dữ liệu giao dịch:", error);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Load data lần đầu khi vừa vào trang
    fetchData();

    // 2. TỰ ĐỘNG RELOAD NGẦM (Short Polling) MỖI 10 GIÂY
    const intervalId = setInterval(() => {
      fetchData(true); // true = load ngầm, không hiện chữ loading
    }, 10000); // 10000ms = 10 giây (bạn có thể chỉnh thành 5000 để 5s báo 1 lần)

    // 3. Dọn dẹp đồng hồ khi thoát khỏi trang Transactions để tránh nặng máy
    return () => clearInterval(intervalId);
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return orders;
    return orders.filter((o) => {
      const id = (String(o.id) || String(o._id) || "").toLowerCase();
      const email = (
        o.email ||
        o.user_email ||
        o.user?.email ||
        ""
      ).toLowerCase();
      const name = (
        o.user_name ||
        o.user?.full_name ||
        o.full_name ||
        ""
      ).toLowerCase();
      return id.includes(s) || email.includes(s) || name.includes(s);
    });
  }, [orders, q]);

  const handleStatusChange = async (orderId, newStatus) => {
    if (!confirm(`Xác nhận đổi trạng thái đơn hàng này thành ${newStatus}?`))
      return;
    try {
      await updateOrderStatus(orderId, newStatus);
      alert("Cập nhật trạng thái thành công!");
      fetchData(); // Cố tình gọi load không ngầm để màn hình update ngay lập tức
    } catch (error) {
      alert("Lỗi khi cập nhật trạng thái!");
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "---";
    return new Date(dateString).toLocaleString("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  if (loading)
    return <div style={{ padding: 20 }}>Đang tải lịch sử giao dịch...</div>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
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
          <h2 style={{ margin: 0, fontWeight: 900 }}>Lịch Sử Mua Hàng</h2>
          <div style={{ color: "var(--muted)" }}>
            Hiển thị {filtered.length} đơn hàng{" "}
            <span style={{ fontSize: 10, color: "#10B981" }}>
              (Tự động cập nhật)
            </span>
          </div>
        </div>
        <input
          className="input"
          placeholder="Tìm mã GD, email, tên..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ width: 280 }}
        />
      </div>

      <div className="board">
        <div className="boardBody" style={{ padding: 0 }}>
          <div
            className="tableWrap"
            style={{ border: "none", borderRadius: 0, boxShadow: "none" }}
          >
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
                    Mã GD
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    Người mua
                  </th>
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
                    Số tiền
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    Thời gian
                  </th>
                  <th
                    style={{
                      padding: "12px 16px",
                      textAlign: "right",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, index) => {
                  const id = t.id || t._id;

                  // Tra cứu Khóa học từ bảng coursesMap
                  const matchedCourse = coursesMap[t.course_id] || {};

                  // Lấy dữ liệu tên và giá (ưu tiên Order -> Course)
                  const courseName =
                    t.course_name || matchedCourse.title || "Không xác định";
                  const price = Number(
                    t.amount ||
                      t.price ||
                      t.total_price ||
                      matchedCourse.price ||
                      0,
                  );

                  // Thông tin User
                  const userName =
                    t.user_name ||
                    t.user?.full_name ||
                    t.full_name ||
                    "User ID: " + String(t.user_id || "").substring(0, 8);
                  const email =
                    t.email || t.user_email || t.user?.email || "---";

                  // Căn chỉnh trạng thái chuẩn in hoa
                  const status = (t.status || "PENDING").toUpperCase();

                  return (
                    <tr
                      key={id || index}
                      style={{ borderBottom: "1px solid #eee", fontSize: 14 }}
                    >
                      <td
                        style={{
                          padding: "12px 16px",
                          color: "#666",
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        #{String(id).substring(0, 6)}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 700 }}>{userName}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>
                          {email}
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>
                        {courseName}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          color: "#d97706",
                          fontWeight: 700,
                        }}
                      >
                        {price.toLocaleString()}đ
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          color: "#666",
                          fontSize: 12,
                        }}
                      >
                        {formatDate(t.created_at || t.createdAt)}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <select
                          className="input"
                          style={{
                            padding: "4px 8px",
                            fontSize: 12,
                            fontWeight: 700,
                            borderRadius: 6,
                            cursor: "pointer",
                            background:
                              status === "COMPLETED" || status === "SUCCESS"
                                ? "#dcfce7"
                                : status === "CANCELED"
                                  ? "#fee2e2"
                                  : "#fef08a",
                            color:
                              status === "COMPLETED" || status === "SUCCESS"
                                ? "#166534"
                                : status === "CANCELED"
                                  ? "#991b1b"
                                  : "#854d0e",
                            borderColor: "transparent",
                          }}
                          value={status}
                          onChange={(e) =>
                            handleStatusChange(id, e.target.value)
                          }
                        >
                          <option value="PENDING">Chờ xử lý</option>
                          <option value="SUCCESS">Thành công (Success)</option>
                          <option value="COMPLETED">
                            Hoàn thành (Completed)
                          </option>
                          <option value="CANCELED">Hủy bỏ</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
