import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { clearAuth, getUser } from "../services/auth";
// 1. IMPORT WIDGET AI TẠI ĐÂY
import AiWidget from "../components/AiWidget";

export default function ManagerLayout() {
  const navigate = useNavigate();
  const user = getUser();

  // Nếu Admin vô tình lọt vào đây (hoặc muốn chặn), có thể chặn ở đây. Tạm thời cứ để render.
  const logout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandBadge" style={{ background: "#3B82F6" }} />
          <div className="brandText">
            <b>CONTENT PANEL</b>
            <span>EasyStretch Manager</span>
          </div>
        </div>

        <nav className="nav">
          <NavLink
            to="/manager/dashboard"
            className={({ isActive }) =>
              isActive ? "navLink active" : "navLink"
            }
          >
            <span>📊 Dashboard</span>
          </NavLink>
          <NavLink
            to="/manager/users"
            className={({ isActive }) =>
              isActive ? "navLink active" : "navLink"
            }
          >
            <span>👥 Users</span>
          </NavLink>
          <NavLink
            to="/manager/exercises"
            className={({ isActive }) =>
              isActive ? "navLink active" : "navLink"
            }
          >
            <span>🏃 Exercises</span>
          </NavLink>
          <NavLink
            to="/manager/courses"
            className={({ isActive }) =>
              isActive ? "navLink active" : "navLink"
            }
          >
            <span>📚 Courses</span>
          </NavLink>

          <div
            style={{
              margin: "20px 0 5px 12px",
              borderTop: "1px solid #eee",
              paddingTop: 10,
            }}
          ></div>
          <NavLink
            to="/manager/profile"
            className={({ isActive }) =>
              isActive ? "navLink active" : "navLink"
            }
          >
            <span>⚙️ Profile</span>
          </NavLink>
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <Link
            to="/manager/profile"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div style={{ fontWeight: 900 }}>Welcome, {user?.full_name}</div>
            <div style={{ fontSize: 12, color: "#2563eb", fontWeight: 700 }}>
              Role: Manager
            </div>
          </Link>
          <button className="btn btnGhost" onClick={logout}>
            Logout
          </button>
        </header>
        <div className="page">
          <Outlet />
        </div>
      </div>

      {/* 2. NHÚNG BONG BÓNG AI VÀO ĐÂY */}
      <AiWidget />
    </div>
  );
}
