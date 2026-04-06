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

// Lấy chi tiết một mission
export const getMissionById = (id) => api.get(`/missions/${id}`);

// Cập nhật thông tin mission
export const updateMission = (id, data) => api.put(`/missions/${id}`, data);

// Xóa mission
export const deleteMission = (id) => api.delete(`/missions/${id}`);

// Lấy danh sách bài tập trong mission
export const getMissionExercises = (id) => api.get(`/missions/${id}/exercises`);

// Xóa bài tập khỏi mission
export const removeExerciseFromMission = (missionId, exerciseId) => api.delete(`/missions/${missionId}/exercises/${exerciseId}`);

// Lấy thống kê completion rate của mission
export const getMissionStats = (id) => api.get(`/missions/${id}/stats`);

// Cập nhật bài tập trong nhiệm vụ
export const updateMissionExercise = (missionId, exerciseId, data) => api.patch(`/missions/${missionId}/exercise/${exerciseId}`, data);
