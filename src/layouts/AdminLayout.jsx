import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { clearAuth, getUser } from "../services/auth";
import PageTransition from "../components/PageTransition";
import { motion } from "framer-motion";

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
          background:radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 65%);
          pointer-events:none;
          animation:adminPulseGlow 4s ease-in-out infinite alternate;
        }
        @keyframes adminPulseGlow { 0%{opacity:0.6;transform:scale(1)} 100%{opacity:1;transform:scale(1.15)} }
        @keyframes adminScanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        .admin-scanline {
          position:fixed; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg,transparent,rgba(245,158,11,0.5),transparent);
          animation:adminScanline 5s linear infinite; pointer-events:none; z-index:999;
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
          animation:adminBadgePulse 3s ease-in-out infinite;
        }
        @keyframes adminBadgePulse { 0%,100%{box-shadow:0 8px 24px rgba(245,158,11,0.35)} 50%{box-shadow:0 8px 32px rgba(245,158,11,0.65)} }
        .admin-brand-text b { display:block; color:#fff; font-size:13px; letter-spacing:0.5px; }
        .admin-brand-text span { font-size:11px; color:rgba(255,255,255,0.4); }

        .admin-nav { padding:14px 12px; display:flex; flex-direction:column; gap:4px; flex:1 1 auto; overflow-y:auto; }
        .admin-nav-section { font-size:10px; letter-spacing:1.5px; color:rgba(255,255,255,0.3); padding:10px 8px 4px; }
        .admin-nav-link {
          display:flex; align-items:center; justify-content:space-between;
          padding:11px 14px; border-radius:12px; text-decoration:none;
          color:rgba(255,255,255,0.6); font-size:14px; font-weight:500;
          border:1px solid transparent;
          transition:all 0.22s cubic-bezier(0.4,0,0.2,1); position:relative; overflow:hidden;
        }
        .admin-nav-link::before {
          content:""; position:absolute; left:0; top:0; bottom:0; width:3px;
          background:linear-gradient(180deg,#f59e0b,#ef4444);
          transform:scaleY(0); transition:transform 0.2s ease; border-radius:0 2px 2px 0;
        }
        .admin-nav-link:hover { background:rgba(245,158,11,0.08); color:#fcd34d; border-color:rgba(245,158,11,0.15); transform:translateX(3px); }
        .admin-nav-link:hover::before { transform:scaleY(1); }
        .admin-nav-link.active {
          background:linear-gradient(135deg,rgba(245,158,11,0.18),rgba(239,68,68,0.12));
          border-color:rgba(245,158,11,0.3); color:#f59e0b;
          box-shadow:0 4px 20px rgba(245,158,11,0.15); transform:translateX(3px);
        }
        .admin-nav-link.active::before { transform:scaleY(1); }
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
          transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:8px;
        }
        .admin-logout-btn:hover { background:rgba(239,68,68,0.12); border-color:rgba(239,68,68,0.3); color:#f87171; transform:scale(1.02); }

        /* ── Main ── */
        .admin-main { flex:1; display:flex; flex-direction:column; min-width:0; }
        .admin-topbar {
          height:64px; display:flex; align-items:center; justify-content:space-between;
          padding:0 24px;
          background:rgba(10,15,30,0.9);
          backdrop-filter:blur(16px);
          border-bottom:1px solid rgba(245,158,11,0.12);
          position:sticky; top:0; z-index:20;
          box-shadow:0 1px 24px rgba(0,0,0,0.3);
        }
        .admin-topbar-title { font-weight:800; color:#fff; font-size:15px; transition:color 0.2s; }
        .admin-topbar-title:hover { color:#fcd34d; }
        .admin-topbar-role {
          font-size:11px; color:#f59e0b; font-weight:700; letter-spacing:0.5px;
          background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.25);
          padding:2px 10px; border-radius:999px; margin-top:2px; display:inline-block;
          animation:adminRoleGlow 2s ease-in-out infinite alternate;
        }
        @keyframes adminRoleGlow { 0%{border-color:rgba(245,158,11,0.2)} 100%{border-color:rgba(245,158,11,0.6)} }
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
            {NAV_ITEMS.map((item, i) => (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 + 0.1, duration: 0.3 }}
              >
                <NavLink
                  to={item.to}
                  className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}
                >
                  <span>{item.icon} {item.label}</span>
                  {item.pill && <span className="admin-nav-pill">{item.pill}</span>}
                </NavLink>
              </motion.div>
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
          <motion.header
            className="admin-topbar"
            initial={{ y: -64, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Link to="/admin/profile" style={{ textDecoration: "none" }}>
              <div className="admin-topbar-title">Welcome, {user?.full_name || "Admin"} 👋</div>
              <span className="admin-topbar-role">● ADMIN</span>
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <motion.div
                whileHover={{ scale: 1.15, rotate: 8 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: "linear-gradient(135deg,#f59e0b,#ef4444)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 700, color: "#fff",
                  boxShadow: "0 4px 12px rgba(245,158,11,0.3)", cursor: "pointer",
                }}
              >
                {(user?.full_name || "A")[0].toUpperCase()}
              </motion.div>
            </div>
          </motion.header>
          <div className="admin-page">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </div>
      </div>
    </>
  );
}
