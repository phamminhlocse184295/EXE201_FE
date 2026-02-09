import api from "./api";

const TOKEN_KEY = "token";
const USER_KEY = "user";

// --- 1. Quản lý LocalStorage ---
export function setAuth({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user ?? null));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Lỗi parse User từ LocalStorage:", error);
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// --- 2. Gọi API Authentication ---

/**
 * Đăng nhập người dùng
 * Đã sửa endpoint thành /user/signin theo đúng link Azure của bạn
 */
export const login = async (credentials) => {
  // credentials truyền vào nên là { email, password }
  const response = await api.post("/user/signin", credentials);

  /**
   * Dựa trên ảnh Swagger bạn cung cấp:
   * Dữ liệu trả về có dạng: { success: true, data: { user_Id, ... }, token: "..." }
   */
  if (response.success) {
    setAuth({
      token: response.token,
      user: response.data, // response.data chính là Object chứa thông tin user
    });
  }

  return response;
};

/**
 * Đăng xuất
 */
export const logout = () => {
  clearAuth();
  // Điều hướng về trang login và làm mới trạng thái ứng dụng
  window.location.href = "/login";
};

/**
 * Kiểm tra xem user có phải Admin không (Dựa trên field 'role' trong ảnh Swagger)
 */
export const isAdmin = () => {
  const user = getUser();
  return user?.role === "admin";
};
/**
 * Lấy thông tin chi tiết của User hiện tại
 * Endpoint: /user/profile
 */
export const getProfile = async () => {
  const response = await api.get("/user/profile");

  // Dựa trên cấu trúc API bạn cung cấp, dữ liệu user thường nằm trong response.data
  return response.success ? response.data : null;
};
