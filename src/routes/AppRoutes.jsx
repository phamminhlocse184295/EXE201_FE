import { Routes, Route, Navigate } from "react-router-dom";
import { getUser } from "../services/auth";

// Layouts
import AdminLayout from "../layouts/AdminLayout";
import ManagerLayout from "../layouts/ManagerLayout";

// Pages
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Exercises from "../pages/Exercises";
import Courses from "../pages/Courses";
import Profile from "../pages/Profile";
import Revenue from "../pages/Revenue";
import Transactions from "../pages/Transactions";
import Login from "../pages/Login";
import AiAssistant from "../pages/AiAssistant";
import Missions from "../pages/Missions";

// ── Role-based redirect after login ───────────────────────────────────────────
const RoleBasedRedirect = () => {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  const role = (user.role || "").toLowerCase();
  if (role === "admin") return <Navigate to="/admin/revenue" replace />;
  if (role === "manager" || role === "reviewer" || role === "annotator")
    return <Navigate to="/manager/dashboard" replace />;
  // user/unknown → back to login
  return <Navigate to="/login" replace />;
};

// ── Route guards ──────────────────────────────────────────────────────────────
const AdminGuard = ({ children }) => {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  const role = (user.role || "").toLowerCase();
  if (role !== "admin") return <Navigate to="/login" replace />;
  return children;
};

const ManagerGuard = ({ children }) => {
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  const role = (user.role || "").toLowerCase();
  // admin, manager, reviewer, annotator đều có quyền vào manager section
  const allowed = ["admin", "manager", "reviewer", "annotator"];
  if (!allowed.includes(role)) return <Navigate to="/login" replace />;
  return children;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RoleBasedRedirect />} />

      {/* ── Admin routes (admin only) ── */}
      <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
        <Route index element={<Navigate to="revenue" replace />} />
        <Route path="revenue" element={<Revenue />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* ── Manager routes (manager + admin) ── */}
      <Route path="/manager" element={<ManagerGuard><ManagerLayout /></ManagerGuard>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="exercises" element={<Exercises />} />
        <Route path="courses" element={<Courses />} />
        <Route path="missions" element={<Missions />} />
        <Route path="profile" element={<Profile />} />
        <Route path="ai" element={<AiAssistant />} />
      </Route>

      <Route path="*" element={
        <div style={{ padding: 40, textAlign: "center", color: "#fff", background: "#0a0a1a", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 80, marginBottom: 16 }}>404</div>
          <div style={{ fontSize: 18, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>PAGE NOT FOUND</div>
        </div>
      } />
    </Routes>
  );
}
