import axios from "axios";

// 1. Khởi tạo instance
const api = axios.create({
  baseURL: "https://easystretch-be-2.vercel.app",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. Request Interceptor: Gắn token (Lấy trực tiếp từ localStorage để tránh vòng lặp)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 3. Response Interceptor: Trả về data gọn gàng
api.interceptors.response.use(
  (response) => {
    // Trả về thẳng body response (bỏ qua lớp vỏ axios)
    return response.data;
  },
  (error) => {
    const status = error.response ? error.response.status : null;

    // Nếu lỗi 401 (Hết hạn token) -> Xóa storage và đá về login
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Chỉ redirect nếu chưa ở trang login để tránh loop
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
