import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { clearAuth, getUser } from "../services/auth";

const NAV_ITEMS = [
  { to: "/admin/revenue", icon: "💰", label: "Doanh Thu", pill: "Hot" },
  { to: "/admin/transactions", icon: "🛒", label: "Lịch Sử Mua" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const user = getUser();

  const logout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <>
      <style>{`
        .admin-shell { display:flex; min-height:100vh; background:#0a0f1e; }

        /* ── Sidebar ── */
        .admin-sidebar {
          width:260px; flex-shrink:0;
          background:linear-gradient(180deg,#0d1426 0%,#111827 100%);
          border-right:1px solid rgba(255,255,255,0.07);
          display:flex; flex-direction:column;
          position:sticky; top:0; height:100vh; overflow:hidden;
        }
        .admin-sidebar-glow {
          position:absolute; top:-80px; left:-80px;
          width:260px; height:260px; border-radius:50%;
          background:radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 65%);
          pointer-events:none;
        }
        .admin-brand {
          display:flex; align-items:center; gap:12px;
          padding:22px 20px 18px; border-bottom:1px solid rgba(255,255,255,0.06);
          position:relative;
        }
        .admin-brand-badge {
          width:42px; height:42px; border-radius:14px;
          background:linear-gradient(135deg,#f59e0b,#ef4444);
          box-shadow:0 8px 24px rgba(245,158,11,0.35);
          display:flex; align-items:center; justify-content:center;
          font-size:18px; flex-shrink:0;
        }
        .admin-brand-text b { display:block; color:#fff; font-size:13px; letter-spacing:0.5px; }
        .admin-brand-text span { font-size:11px; color:rgba(255,255,255,0.4); }

        .admin-nav { padding:14px 12px; display:flex; flex-direction:column; gap:4px; flex:1 1 auto; overflow-y:auto; }
        .admin-nav-section { font-size:10px; letter-spacing:1.5px; color:rgba(255,255,255,0.3); padding:10px 8px 4px; }
        .admin-nav-link {
          display:flex; align-items:center; justify-content:space-between;
          padding:11px 14px; border-radius:12px; text-decoration:none;
          color:rgba(255,255,255,0.6); font-size:14px; font-weight:500;
          border:1px solid transparent;
          transition:all 0.18s ease;
        }
        .admin-nav-link:hover { background:rgba(255,255,255,0.06); color:#fff; border-color:rgba(255,255,255,0.08); }
        .admin-nav-link.active {
          background:linear-gradient(135deg,rgba(245,158,11,0.18),rgba(239,68,68,0.12));
          border-color:rgba(245,158,11,0.3); color:#f59e0b;
          box-shadow:0 4px 16px rgba(245,158,11,0.12);
        }
        .admin-nav-pill {
          font-size:10px; padding:2px 8px; border-radius:999px;
          background:linear-gradient(135deg,#f59e0b,#ef4444); color:#fff; font-weight:700;
        }

        .admin-sidebar-footer {
          padding:14px 12px 18px; border-top:1px solid rgba(255,255,255,0.06);
          display:flex; flex-direction:column; gap:8px;
        }
        .admin-logout-btn {
          width:100%; padding:10px; border-radius:12px; border:1px solid rgba(255,255,255,0.1);
          background:transparent; color:rgba(255,255,255,0.55); font-size:13px; cursor:pointer;
          transition:all 0.18s; display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .admin-logout-btn:hover { background:rgba(239,68,68,0.12); border-color:rgba(239,68,68,0.3); color:#f87171; }

        /* ── Main ── */
        .admin-main { flex:1; display:flex; flex-direction:column; min-width:0; }
        .admin-topbar {
          height:64px; display:flex; align-items:center; justify-content:space-between;
          padding:0 24px;
          background:rgba(10,15,30,0.85);
          backdrop-filter:blur(12px);
          border-bottom:1px solid rgba(255,255,255,0.07);
          position:sticky; top:0; z-index:20;
        }
        .admin-topbar-title { font-weight:800; color:#fff; font-size:15px; }
        .admin-topbar-role {
          font-size:11px; color:#f59e0b; font-weight:700; letter-spacing:0.5px;
          background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.25);
          padding:2px 10px; border-radius:999px; margin-top:2px; display:inline-block;
        }
        .admin-page { padding:24px; background:#0a0f1e; min-height:calc(100vh - 64px); }
      `}</style>

      <div className="admin-shell">
        {/* SIDEBAR */}
        <aside className="admin-sidebar" style={{ position: "relative" }}>
          <div className="admin-sidebar-glow" />

          <div className="admin-brand">
            <div className="admin-brand-badge">💰</div>
            <div className="admin-brand-text">
              <b>FINANCE PANEL</b>
              <span>EasyStretch Admin</span>
            </div>
          </div>

          <nav className="admin-nav">
            <div className="admin-nav-section">MAIN MENU</div>
            {NAV_ITEMS.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}
              >
                <span>{item.icon} {item.label}</span>
                {item.pill && <span className="admin-nav-pill">{item.pill}</span>}
              </NavLink>
            ))}

            <div className="admin-nav-section" style={{ marginTop: 12 }}>ACCOUNT</div>
            <NavLink
              to="/admin/profile"
              className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}
            >
              ⚙️ Profile
            </NavLink>
          </nav>

          <div className="admin-sidebar-footer">
            <button className="admin-logout-btn" onClick={logout}>
              🚪 Đăng Xuất
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="admin-main">
          <header className="admin-topbar">
            <Link to="/admin/profile" style={{ textDecoration: "none" }}>
              <div className="admin-topbar-title">Welcome, {user?.full_name || "Admin"} 👋</div>
              <span className="admin-topbar-role">● ADMIN</span>
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg,#f59e0b,#ef4444)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 700, color: "#fff",
                boxShadow: "0 4px 12px rgba(245,158,11,0.3)",
              }}>
                {(user?.full_name || "A")[0].toUpperCase()}
              </div>
            </div>
          </header>
          <div className="admin-page">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
