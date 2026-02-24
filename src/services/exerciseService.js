import api from "./api";

/**
 * 1. Lấy danh sách tất cả bài tập
 * Link: GET https://easystretch-be-2.vercel.app/exercises
 */
export const getAllExercises = async () => {
  return await api.get("/exercises");
};

/**
 * 2. Tạo bài tập mới
 * Link: POST https://easystretch-be-2.vercel.app/exercises
 */
export const createExercise = async (exerciseData) => {
  return await api.post("/exercises", exerciseData);
};

/**
 * 3. Cập nhật bài tập
 * Link: PATCH https://easystretch-be-2.vercel.app/exercises/{id}
 */
export const updateExercise = async (id, exerciseData) => {
  // Đã sửa từ /exercises?id=${id} sang /exercises/${id}
  return await api.patch(`/exercises/${id}`, exerciseData);
};

/**
 * 4. Xóa bài tập
 * Link: DELETE https://easystretch-be-2.vercel.app/exercises/{id}
 */
export const deleteExercise = async (id) => {
  // Đã sửa từ /exercises?id=${id} sang /exercises/${id}
  return await api.delete(`/exercises/${id}`);
};
