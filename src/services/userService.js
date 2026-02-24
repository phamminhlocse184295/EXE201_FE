import api from "./api";

// 1. Lấy danh sách user
export const getAllUsers = () => api.get("/admin-users/users");

// 2. Tạo user mới
export const createUser = (data) => api.post("/admin-users/users", data);

// 3. Cập nhật user
export const updateUser = (id, data) => api.patch(`/admin-users/${id}`, data);

// --- SỬA LẠI PHẦN BAN/UNBAN (QUAN TRỌNG) ---

/**
 * 4. Khóa tài khoản (Ban)
 * Method: POST (Theo ảnh image_441b3e.png)
 * Body bắt buộc: time, type, reason
 */
export const banUser = (id, reason = "Vi phạm quy định") => {
  const body = {
    time: 36500, // Khóa 36500 ngày (~100 năm)
    type: "day", // Đơn vị tính là ngày
    reason: reason, // Lý do khóa
  };
  return api.post(`/admin-users/ban/${id}`, body);
};

/**
 * 5. Mở khóa tài khoản (Unban)
 * Method: POST (Theo ảnh image_441ff1.png)
 */
export const unbanUser = (id) => {
  return api.post(`/admin-users/unban/${id}`);
};
