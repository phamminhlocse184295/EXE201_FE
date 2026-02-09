import axios from "axios";
import { getToken, clearAuth } from "./auth";

// 1. Khởi tạo instance với cấu hình mặc định tốt hơn
export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://easystretch-bwexhggmbwgncnhb.japaneast-01.azurewebsites.net",
  timeout: 10000, // Thêm timeout (10s) để tránh treo request quá lâu
  headers: {
    "Content-Type": "application/json",
  },
});

// 2. Request Interceptor: Gắn token vào header
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 3. Response Interceptor: Xử lý data và bắt lỗi tập trung
api.interceptors.response.use(
  (response) => {
    // Trả về trực tiếp data để ở Component bạn không cần phải gọi .data lần nữa
    return response.data;
  },
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401) {
      // Token hết hạn hoặc không hợp lệ
      clearAuth();
      // Điều hướng về login nếu không phải đang ở trang login
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    } else if (status === 403) {
      console.error("Bạn không có quyền truy cập tài nguyên này!");
    } else if (status >= 500) {
      console.error("Lỗi hệ thống phía Server!");
    }

    return Promise.reject(error);
  },
);

export default api;
