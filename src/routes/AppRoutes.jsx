import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

import Login from "../pages/Login.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import Users from "../pages/Users.jsx";
import Profile from "../pages/Profile.jsx"; // 1. Import trang Profile mới tạo
import Exercises from "../pages/Exercises";
import Courses from "../pages/Courses";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Những Route bên trong này yêu cầu phải Login mới vào được */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />

          {/* 2. Thêm route profile tại đây */}
          <Route path="profile" element={<Profile />} />
          <Route path="exercises" element={<Exercises />} />

          <Route path="courses" element={<Courses />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
