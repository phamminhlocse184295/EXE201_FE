import api from "./api";

// Lấy danh sách tất cả user
export const getAllUsers = async () => {
  // Endpoint: /admin/users
  return await api.get("/admin/users");
};

// Tạo user mới
export const createUser = async (userData) => {
  return await api.post("/admin/users", userData);
};

// Cập nhật user
export const updateUser = async (id, userData) => {
  return await api.put(`/admin/users/${id}`, userData);
};

// Xóa user
export const deleteUser = async (id) => {
  return await api.delete(`/admin/users/${id}`);
};
