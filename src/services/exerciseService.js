import api from "./api";

// 1. Lấy tất cả bài tập
export const getAllExercises = async () => {
  return await api.get("/admin/exercise/all");
};

// 2. Tạo bài tập mới (POST)
export const createExercise = async (data) => {
  return await api.post("/admin/exercise", data);
};

// 3. Cập nhật bài tập (PATCH)
// Dựa vào Swagger, ta truyền id qua query params
export const updateExercise = async (id, data) => {
  return await api.patch(`/admin/exercise?id=${id}`, data);
};

// 4. Xóa bài tập (DELETE)
export const deleteExercise = async (id) => {
  return await api.delete(`/admin/exercise?id=${id}`);
};
