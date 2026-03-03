import api from "./api";

// CÁC HÀM CŨ (Nếu có)
export const getAllExercises = () => api.get("/exercises");
export const createExercise = (data) => api.post("/exercises", data);

// 2 HÀM MỚI THÊM VÀO THEO API BẠN CUNG CẤP:
// Cập nhật bài tập (PUT)
export const updateExercise = (id, data) => api.put(`/exercises/${id}`, data);

// Xóa bài tập (DELETE)
export const deleteExercise = (id) => api.delete(`/exercises/${id}`);
