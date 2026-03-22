import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { clearAuth, getUser } from "../services/auth";
import AiWidget from "../components/AiWidget";

const NAV_ITEMS = [
  { to: "/manager/dashboard", icon: "📊", label: "Dashboard" },
  { to: "/manager/users",     icon: "👥", label: "Users" },
  { to: "/manager/exercises", icon: "🏃", label: "Exercises" },
  { to: "/manager/courses",   icon: "📚", label: "Courses" },
  { to: "/manager/missions",  icon: "🎯", label: "Missions" },
];

export default function ManagerLayout() {
  const navigate = useNavigate();
  const user = getUser();

  const logout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <>
      <style>{`
        .mgr-shell { display:flex; min-height:100vh; background:#0a0f1e; }

        /* ── Sidebar ── */
        .mgr-sidebar {
          width:260px; flex-shrink:0;
          background:linear-gradient(180deg,#0d1426 0%,#111827 100%);
          border-right:1px solid rgba(255,255,255,0.07);
          display:flex; flex-direction:column;
          position:sticky; top:0; height:100vh; overflow:hidden;
        }
        .mgr-sidebar-glow {
          position:absolute; top:-80px; left:-80px;
          width:260px; height:260px; border-radius:50%;
          background:radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 65%);
          pointer-events:none;
        }
        .mgr-brand {
          display:flex; align-items:center; gap:12px;
          padding:22px 20px 18px; border-bottom:1px solid rgba(255,255,255,0.06);
          position:relative;
        }
        .mgr-brand-badge {
          width:42px; height:42px; border-radius:14px;
          background:linear-gradient(135deg,#3b82f6,#6366f1);
          box-shadow:0 8px 24px rgba(59,130,246,0.35);
          display:flex; align-items:center; justify-content:center;
          font-size:18px; flex-shrink:0;
        }
        .mgr-brand-text b { display:block; color:#fff; font-size:13px; letter-spacing:0.5px; }
        .mgr-brand-text span { font-size:11px; color:rgba(255,255,255,0.4); }

        .mgr-nav { padding:14px 12px; display:flex; flex-direction:column; gap:4px; flex:1 1 auto; overflow-y:auto; }
        .mgr-nav-section { font-size:10px; letter-spacing:1.5px; color:rgba(255,255,255,0.3); padding:10px 8px 4px; }
        .mgr-nav-link {
          display:flex; align-items:center; gap:10px;
          padding:11px 14px; border-radius:12px; text-decoration:none;
          color:rgba(255,255,255,0.6); font-size:14px; font-weight:500;
          border:1px solid transparent;
          transition:all 0.18s ease;
        }
        .mgr-nav-link:hover { background:rgba(255,255,255,0.06); color:#fff; border-color:rgba(255,255,255,0.08); }
        .mgr-nav-link.active {
          background:linear-gradient(135deg,rgba(59,130,246,0.18),rgba(99,102,241,0.12));
          border-color:rgba(59,130,246,0.3); color:#60a5fa;
          box-shadow:0 4px 16px rgba(59,130,246,0.12);
        }

        .mgr-sidebar-footer {
          padding:14px 12px 18px; border-top:1px solid rgba(255,255,255,0.06);
        }
        .mgr-logout-btn {
          width:100%; padding:10px; border-radius:12px; border:1px solid rgba(255,255,255,0.1);
          background:transparent; color:rgba(255,255,255,0.55); font-size:13px; cursor:pointer;
          transition:all 0.18s; display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .mgr-logout-btn:hover { background:rgba(239,68,68,0.12); border-color:rgba(239,68,68,0.3); color:#f87171; }

        /* ── Main ── */
        .mgr-main { flex:1; display:flex; flex-direction:column; min-width:0; }
        .mgr-topbar {
          height:64px; display:flex; align-items:center; justify-content:space-between;
          padding:0 24px;
          background:rgba(10,15,30,0.85);
          backdrop-filter:blur(12px);
          border-bottom:1px solid rgba(255,255,255,0.07);
          position:sticky; top:0; z-index:20;
        }
        .mgr-topbar-title { font-weight:800; color:#fff; font-size:15px; }
        .mgr-topbar-role {
          font-size:11px; color:#60a5fa; font-weight:700; letter-spacing:0.5px;
          background:rgba(59,130,246,0.12); border:1px solid rgba(59,130,246,0.25);
          padding:2px 10px; border-radius:999px; margin-top:2px; display:inline-block;
          text-transform:uppercase;
        }
        .mgr-page { padding:24px; background:#0a0f1e; min-height:calc(100vh - 64px); }
      `}</style>

      <div className="mgr-shell">
        {/* SIDEBAR */}
        <aside className="mgr-sidebar" style={{ position: "relative" }}>
          <div className="mgr-sidebar-glow" />

          <div className="mgr-brand">
            <div className="mgr-brand-badge">📋</div>
            <div className="mgr-brand-text">
              <b>CONTENT PANEL</b>
              <span>EasyStretch Manager</span>
            </div>
          </div>

          <nav className="mgr-nav">
            <div className="mgr-nav-section">MAIN MENU</div>
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `mgr-nav-link${isActive ? " active" : ""}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}

            <div className="mgr-nav-section" style={{ marginTop: 12 }}>ACCOUNT</div>
            <NavLink
              to="/manager/profile"
              className={({ isActive }) => `mgr-nav-link${isActive ? " active" : ""}`}
            >
              <span>⚙️</span><span>Profile</span>
            </NavLink>
            <NavLink
              to="/manager/ai"
              className={({ isActive }) => `mgr-nav-link${isActive ? " active" : ""}`}
            >
              <span>🤖</span><span>AI Assistant</span>
            </NavLink>
          </nav>

          <div className="mgr-sidebar-footer">
            <button className="mgr-logout-btn" onClick={logout}>
              🚪 Đăng Xuất
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="mgr-main">
          <header className="mgr-topbar">
            <Link to="/manager/profile" style={{ textDecoration: "none" }}>
              <div className="mgr-topbar-title">Welcome, {user?.full_name || "Manager"} 👋</div>
              <span className="mgr-topbar-role">● {user?.role || "Manager"}</span>
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 700, color: "#fff",
                boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
              }}>
                {(user?.full_name || "M")[0].toUpperCase()}
              </div>
            </div>
          </header>
          <div className="mgr-page">
            <Outlet />
          </div>
        </div>

        <AiWidget />
      </div>
    </>
  );
}
