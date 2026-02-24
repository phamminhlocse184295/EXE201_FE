import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { clearAuth, getUser } from "../services/auth";

export default function AdminLayout() {
  const navigate = useNavigate();
  const user = getUser();

  const logout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandBadge" />
          <div className="brandText">
            <b>ADMIN PANEL</b>
            <span>EasyStretch vibe</span>
          </div>
        </div>

        <nav className="nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "navLink active" : "navLink"
            }
          >
            <span>Dashboard</span>
            <span className="navPill">Home</span>
          </NavLink>

          <NavLink
            to="/users"
            className={({ isActive }) =>
              isActive ? "navLink active" : "navLink"
            }
          >
            <span>Users</span>
            <span className="navPill">CRUD</span>
          </NavLink>

          <NavLink
            to="/exercises"
            className={({ isActive }) =>
              isActive ? "navLink active" : "navLink"
            }
          >
            <span>Exercises</span>
            <span className="navPill">Lib</span>
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive ? "navLink active" : "navLink"
            }
          >
            <span>Profile</span>
            <span className="navPill">Admin</span>
          </NavLink>

          {/* ĐÃ SỬA: Đồng bộ style navLink giống các mục trên */}
          <NavLink
            to="/courses"
            className={({ isActive }) =>
              isActive ? "navLink active" : "navLink"
            }
          >
            <span>Courses</span>
            <span className="navPill">New</span>
          </NavLink>
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <Link
            to="/profile"
            style={{
              textDecoration: "none",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            <div style={{ fontWeight: 900 }}>Welcome</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              {user?.full_name ? user.full_name : user?.email || "Admin"}
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
    </div>
  );
}
