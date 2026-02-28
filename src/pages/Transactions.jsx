import { useEffect, useState, useMemo } from "react";
import { getAllOrders, updateOrderStatus } from "../services/orderService";

export default function Transactions() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await getAllOrders();
      const data = Array.isArray(res) ? res : res.data?.data || res.data || [];
      // Sắp xếp đơn mới nhất lên đầu
      const sortedData = data.sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0),
      );
      setOrders(sortedData);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return orders;
    return orders.filter((o) => {
      const id = (String(o.id) || String(o._id) || "").toLowerCase();
      const name = (o.user_name || o.user?.full_name || "").toLowerCase();
      const email = (o.email || o.user?.email || "").toLowerCase();
      return id.includes(s) || name.includes(s) || email.includes(s);
    });
  }, [orders, q]);

  // HÀM ĐỔI TRẠNG THÁI ĐƠN HÀNG (Dùng PATCH API)
  const handleStatusChange = async (orderId, newStatus) => {
    if (!confirm(`Xác nhận đổi trạng thái đơn hàng này thành ${newStatus}?`))
      return;
    try {
      await updateOrderStatus(orderId, newStatus);
      alert("Cập nhật trạng thái thành công!");
      fetchOrders(); // Load lại danh sách
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
            Hiển thị {filtered.length} đơn hàng
          </div>
        </div>
        <input
          className="input"
          placeholder="Tìm mã GD, tên, email..."
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
                  const userName = t.user_name || t.user?.full_name || "User";
                  const email = t.email || t.user?.email || "---";
                  const courseName =
                    t.course_name || t.course?.title || "Khóa học";
                  const price = Number(
                    t.price || t.total_price || t.course?.price || 0,
                  );
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
                        {/* DROPDOWN CHUYỂN TRẠNG THÁI */}
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
                          <option value="PENDING">Chờ xử lý (Pending)</option>
                          <option value="COMPLETED">
                            Đã thanh toán (Completed)
                          </option>
                          <option value="CANCELED">Hủy (Canceled)</option>
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
