import api from "./api";

/**
 * 1. Lấy danh sách tất cả khóa học
 * Link: GET https://easystretch-be-2.vercel.app/courses
 */
export const getAllCourses = () => api.get("/courses");

/**
 * 2. Lấy danh sách khóa học đã mua
 * Link: GET https://easystretch-be-2.vercel.app/courses/bought
 */
export const getBoughtCourses = () => api.get("/courses/bought");

/**
 * 3. Tạo khóa học mới (Admin)
 * Link: POST https://easystretch-be-2.vercel.app/courses
 */
export const createCourse = (data) => api.post("/courses", data);

/**
 * 4. Cập nhật thông tin khóa học
 * Link: PATCH https://easystretch-be-2.vercel.app/courses/{id}
 */
export const updateCourse = (id, data) => api.patch(`/courses/${id}`, data);

/**
 * 5. Xóa khóa học
 * Link: DELETE https://easystretch-be-2.vercel.app/courses/{id}
 */
export const deleteCourse = (id) => api.delete(`/courses/${id}`);

/**
 * 6. Xử lý thanh toán khóa học
 * Link: POST https://easystretch-be-2.vercel.app/courses/payment/{id}
 */
export const processPayment = (id) => api.post(`/courses/payment/${id}`);
