import api from "./api";

// 1. Lấy toàn bộ đơn hàng
export const getAllOrders = () => api.get("/orders");

// 2. Lấy đơn hàng theo ngày (Format: YYYY-MM-DD)
export const getOrdersByDate = (date) => api.get(`/orders/date?date=${date}`);

// 3. Lấy doanh thu theo ngày cụ thể
export const getDailyRevenue = (date) =>
  api.get(`/orders/revenue/daily?date=${date}`);

// 4. Lấy tổng doanh thu toàn hệ thống
export const getTotalRevenue = () => api.get("/orders/revenue");

// 5. Lấy chi tiết 1 đơn hàng
export const getOrderById = (id) => api.get(`/orders/${id}`);

// 6. Cập nhật trạng thái đơn hàng (Dùng PATCH theo chuẩn của bạn)
// Trạng thái thường có: PENDING, COMPLETED, CANCELED...
export const updateOrderStatus = (id, status) =>
  api.patch(`/orders/${id}`, { status });
