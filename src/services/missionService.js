import api from "./api";

// Lấy danh sách nhiệm vụ (có thể lọc theo ngày target_date)
export const getAllMissions = (date) => {
  const params = date ? { date } : {};
  return api.get("/missions", { params });
};

// Tạo nhiệm vụ mới
export const createMission = (data) => api.post("/missions", data);

// Thêm bài tập vào nhiệm vụ
export const addExerciseToMission = (id, data) => api.post(`/missions/${id}/add-exercise`, data);

// User hoàn thành bài tập (Dành cho phía user, có thể để ở đây dùng chung nếu cần)
export const completeMissionExercise = (data) => api.post("/missions/complete-exercise", data);
