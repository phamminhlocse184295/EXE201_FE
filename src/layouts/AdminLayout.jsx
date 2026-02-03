import { NavLink, Outlet, useNavigate } from "react-router-dom";
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
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <div>
            <div style={{ fontWeight: 900 }}>Welcome</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              {user?.email ? user.email : "Admin"}
            </div>
          </div>

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
