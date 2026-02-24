import api from "./api";

const TOKEN_KEY = "token";
const USER_KEY = "user";

// --- 1. LOCAL STORAGE HELPERS ---
export function setAuth({ token, user }) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// --- 2. API AUTHENTICATION ---

/**
 * Đăng nhập
 */
export const login = async (credentials) => {
  const res = await api.post("/users/signin", credentials);

  if (res && res.success) {
    const token = res.token || res.accessToken || res.data?.token;

    // Logic lấy User: Xử lý cả Object lẫn Array
    let user = res.data;
    if (res.data?.data) user = res.data.data; // Trường hợp lồng data.data
    if (Array.isArray(user)) user = user[0]; // Trường hợp trả về mảng

    if (token) {
      setAuth({ token, user });
    }
  }
  return res;
};

/**
 * Đăng xuất
 */
export const logout = () => {
  clearAuth();
  window.location.href = "/login";
};

/**
 * Lấy Profile
 */
export const getProfile = async () => {
  try {
    const res = await api.get("/users/profile");

    if (res && res.success) {
      let userData = res.data;

      // Xử lý các trường hợp dị biệt của API
      if (userData && userData.data) userData = userData.data; // Lồng nhau
      if (Array.isArray(userData)) userData = userData[0]; // Là Mảng

      // Nếu lấy được data hợp lệ (có id), lưu lại ngay
      if (userData && (userData.id || userData.user_Id)) {
        const currentUser = getUser();
        // Merge với data cũ để tránh mất các trường thiếu
        const mergedUser = { ...currentUser, ...userData };
        localStorage.setItem(USER_KEY, JSON.stringify(mergedUser));
        return mergedUser;
      }
    }
    return null;
  } catch (error) {
    console.error("Lỗi getProfile:", error);
    return null;
  }
};

/**
 * Cập nhật Profile
 */
export const updateProfile = async (data) => {
  const res = await api.patch("/users/update", data);

  if (res && res.success) {
    // Gọi lại getProfile để đảm bảo data đồng bộ chuẩn nhất từ server
    await getProfile();
  }
  return res;
};

/**
 * Check Admin
 */
export const isAdmin = () => {
  const user = getUser();
  return user?.role?.toLowerCase() === "admin";
};
