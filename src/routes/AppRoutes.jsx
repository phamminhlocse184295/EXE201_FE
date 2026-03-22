import { Routes, Route, Navigate } from "react-router-dom";
import { getUser } from "../services/auth";

// Layouts
import AdminLayout from "../layouts/AdminLayout";
import ManagerLayout from "../layouts/ManagerLayout"; // Layout mới cho Manager

// Pages
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Exercises from "../pages/Exercises";
import Courses from "../pages/Courses";
import Profile from "../pages/Profile";
import Revenue from "../pages/Revenue";
import Transactions from "../pages/Transactions";
import Login from "../pages/Login";
import AiAssistant from "../pages/AiAssistant"; // ĐÃ THÊM: Import trang AI
import Missions from "../pages/Missions"; // Import trang Nhiệm vụ

// Component tự động chia luồng sau khi đăng nhập
const RoleBasedRedirect = () => {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;

  // Nếu là admin -> Bay vào trang Doanh thu
  if (user.role === "admin") return <Navigate to="/admin/revenue" replace />;

  // Còn lại (manager/user) -> Bay vào trang Dashboard
  return <Navigate to="/manager/dashboard" replace />;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Khi vào trang chủ '/', tự động chia luồng */}
      <Route path="/" element={<RoleBasedRedirect />} />

      {/* --- THẾ GIỚI 1: ADMIN KINH DOANH --- */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="revenue" replace />} />
        <Route path="revenue" element={<Revenue />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* --- THẾ GIỚI 2: MANAGER NỘI DUNG --- */}
      <Route path="/manager" element={<ManagerLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="exercises" element={<Exercises />} />
        <Route path="courses" element={<Courses />} />
        <Route path="missions" element={<Missions />} />
        <Route path="profile" element={<Profile />} />

        {/* ĐÃ THÊM: Route cho trang Trợ lý AI */}
        <Route path="ai" element={<AiAssistant />} />
      </Route>

      <Route
        path="*"
        element={
          <div style={{ padding: 40, textAlign: "center" }}>
            404 - KHÔNG TÌM THẤY TRANG
          </div>
        }
      />
    </Routes>
  );
}
