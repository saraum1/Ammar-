import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn, UserCircle, LogOut, ChevronDown, Bell, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logoImg from "../assets/logo.png";

/* ── Brand ── */
const DARK   = "#1B3A2D";
const BRONZE = "#C4956A";

/* ── Nav link groups ── */
const GUEST_LINKS = [
  { to: "/",            label: "الرئيسية" },
  { to: "/engineering", label: "الشركات الهندسية" },
  { to: "/contracting", label: "شركات المقاولات" },
  { to: "/materials",   label: "مواد البناء" },
];
const CLIENT_LINKS = [
  { to: "/home",        label: "الرئيسية" },
  { to: "/engineering", label: "الشركات الهندسية" },
  { to: "/contracting", label: "شركات المقاولات" },
  { to: "/materials",   label: "مواد البناء" },
  { to: "/notes",       label: "مذكراتي" },
];
const COMPANY_LINKS = [
  { to: "/home",        label: "الرئيسية" },
  { to: "/engineering", label: "الشركات الهندسية" },
  { to: "/contracting", label: "شركات المقاولات" },
  { to: "/materials",   label: "مواد البناء" },
];
const ADMIN_LINKS = [
  { to: "/home",        label: "الرئيسية" },
  { to: "/engineering", label: "الشركات الهندسية" },
  { to: "/contracting", label: "شركات المقاولات" },
  { to: "/materials",   label: "مواد البناء" },
];

const NOTIF_ICONS = {
  new_update: "·", new_note: "·", phase_update: "·",
  status_change: "·", new_meeting: "·",
  meeting_confirmed: "·", meeting_declined: "·",
  new_order: "·",
};

const stripEmojis = (str) =>
  str.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}]/gu, "").trim();

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [dropOpen,   setDropOpen]   = useState(false);
  const [bellOpen,   setBellOpen]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifs,     setNotifs]     = useState([]);
  const [unread,     setUnread]     = useState(0);
  const [scrolled,   setScrolled]   = useState(false);
  const bellRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const fetchNotifs = async () => {
    if (!token) return;
    try {
      const r = await fetch("/api/notifications", { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) return;
      const d = await r.json();
      setNotifs(d.data || []); setUnread(d.unread || 0);
    } catch {}
  };
  useEffect(() => {
    if (!token) { setNotifs([]); setUnread(0); return; }
    fetchNotifs();
    const t = setInterval(fetchNotifs, 8000);
    return () => clearInterval(t);
  }, [token]);

  useEffect(() => {
    const h = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const handleMarkAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
    setNotifs(p => p.map(n => ({ ...n, read: true }))); setUnread(0);
  };
  const handleNotifClick = async (n) => {
    if (!n.read) {
      await fetch(`/api/notifications/${n.id}/read`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      setNotifs(p => p.map(x => x.id === n.id ? { ...x, read: true } : x));
      setUnread(p => Math.max(0, p - 1));
    }
    setBellOpen(false);
    if (n.relatedType === "project" && n.relatedId) navigate(`/my-projects/${n.relatedId}`);
    else if (n.relatedType === "meeting") navigate(user?.role === "company" ? "/company/dashboard" : "/meetings");
    else if (n.relatedType === "order") navigate("/company/dashboard");
  };
  const handleLogout = () => { logout(); navigate("/"); setDropOpen(false); };

  const navLinks =
    !token                   ? GUEST_LINKS   :
    user?.role === "client"  ? CLIENT_LINKS  :
    user?.role === "company" ? COMPANY_LINKS :
    user?.role === "admin"   ? ADMIN_LINKS   : GUEST_LINKS;

  const dashLink  = user?.role === "admin" ? "/admin" : user?.role === "company" ? "/company/dashboard" : "/my-projects";
  const dashLabel = user?.role === "admin" ? "الإدمن" : user?.role === "company" ? "لوحة التحكم" : "مشاريعي";
  const firstName = user?.name?.split(" ")[0] || "حسابي";

  return (
    <>
      {/* ══════════════════════ DESKTOP NAV ══════════════════════ */}
      <nav dir="rtl" style={{
        height: 70,
        background: "#FFFFFF",
        display: "flex", alignItems: "center",
        padding: "0 40px",
        borderBottom: `1px solid ${scrolled ? "#DDD0C0" : "#EDE3D8"}`,
        boxShadow: scrolled ? "0 4px 24px rgba(27,58,45,0.08)" : "none",
        position: "sticky", top: 0, zIndex: 50,
        transition: "box-shadow 0.3s, border-color 0.3s",
        gap: 0,
      }}>

        {/* Logo */}
        <Link to={token ? "/home" : "/"} style={{ display: "flex", alignItems: "center", gap: 0, textDecoration: "none", flexShrink: 0, marginLeft: "auto" }}>
          <img
            src={logoImg}
            alt="عمار"
            style={{ height: 64, width: "auto", objectFit: "contain", marginLeft: -16 }}
          />
          <div style={{ fontSize: 24, fontWeight: 700, color: DARK, fontFamily: '"Amiri", serif', letterSpacing: "1px", marginRight: -14 }}>عمار</div>
        </Link>

        {/* Nav links — centered, flex */}
        <div className="nav-desktop-links" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
          {navLinks.map(link => {
            const active = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to} style={{
                textDecoration: "none",
                fontSize: 13.5,
                fontWeight: active ? 700 : 500,
                padding: "8px 12px",
                borderRadius: 10,
                position: "relative",
                color: active ? DARK : "#6B7B6B",
                whiteSpace: "nowrap",
                transition: "color 0.15s",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.color = DARK; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.color = "#6B7B6B"; }}
              >
                {link.label}
                {active && (
                  <span style={{
                    position: "absolute", bottom: 2, left: "50%",
                    transform: "translateX(-50%)",
                    width: 16, height: 2.5,
                    background: BRONZE, borderRadius: 99,
                  }}/>
                )}
              </Link>
            );
          })}
        </div>

        {/* Right actions */}
        <div className="nav-actions" style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginRight: "auto" }}>
          {!token ? (
            <>
              <Link to="/login" style={{
                display: "flex", alignItems: "center", gap: 6,
                border: `1.5px solid ${DARK}`, color: DARK,
                padding: "8px 18px", borderRadius: 12,
                fontSize: 13.5, fontWeight: 700, textDecoration: "none",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = DARK; e.currentTarget.style.color = "white"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = DARK; }}
              >
                <LogIn size={15}/> تسجيل الدخول
              </Link>
              <Link to="/register/role" style={{
                background: DARK, color: "white",
                padding: "9px 20px", borderRadius: 12,
                fontSize: 13.5, fontWeight: 700, textDecoration: "none",
                boxShadow: "0 4px 14px rgba(27,58,45,0.28)",
                transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background="#2A5940"}
              onMouseLeave={e => e.currentTarget.style.background=DARK}
              >
                ابدأ الآن
              </Link>
            </>
          ) : (
            <>
              {/* Bell */}
              <div ref={bellRef} style={{ position: "relative" }}>
                <button onClick={() => { const opening = !bellOpen; setBellOpen(opening); setDropOpen(false); if (opening) fetchNotifs(); }} style={{
                  position: "relative",
                  background: bellOpen ? "#EAF0EC" : "#FAF7F0",
                  border: `1.5px solid ${bellOpen ? "#A8C4B0" : "#DDD0C0"}`,
                  borderRadius: 11, width: 40, height: 40,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", transition: "all 0.15s",
                }}>
                  <Bell size={17} color={unread > 0 ? BRONZE : "#6B7B6B"}/>
                  {unread > 0 && (
                    <span style={{
                      position: "absolute", top: -5, right: -5,
                      minWidth: 18, height: 18,
                      background: BRONZE, color: "white",
                      borderRadius: 999, fontSize: 10, fontWeight: 800,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      padding: "0 4px", border: "2px solid white",
                    }}>{unread > 9 ? "9+" : unread}</span>
                  )}
                </button>

                {bellOpen && (
                  <div style={{
                    position: "absolute", top: 50, left: "50%", transform: "translateX(-50%)",
                    width: 330, background: "white", borderRadius: 12,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 200,
                    overflow: "hidden", border: "1px solid #EDE3D8",
                  }}>
                    <div style={{ padding: "14px 18px 10px", borderBottom: "1px solid #F2E8DC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <button onClick={handleMarkAllRead} style={{ fontSize: 11, color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>مسح الكل</button>
                      <span style={{ fontWeight: 800, fontSize: 14, color: DARK }}>
                        الإشعارات {unread > 0 && <span style={{ background: BRONZE, color: "white", fontSize: 10, padding: "1px 6px", borderRadius: 999, marginRight: 4 }}>{unread}</span>}
                      </span>
                    </div>
                    <div style={{ maxHeight: 360, overflowY: "auto" }}>
                      {notifs.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "32px 20px", color: "#9CA3AF" }}>
                          <p style={{ fontSize: 13 }}>لا توجد إشعارات بعد</p>
                        </div>
                      ) : notifs.map(n => (
                        <div key={n.id} onClick={() => handleNotifClick(n)} style={{
                          display: "flex", gap: 10, padding: "12px 16px", cursor: "pointer",
                          background: n.read ? "white" : "#FDF8F3",
                          borderBottom: "1px solid #F8F0E8", transition: "background 0.1s",
                        }}
                        onMouseEnter={e => e.currentTarget.style.background="#F2E8DC"}
                        onMouseLeave={e => e.currentTarget.style.background=n.read?"white":"#FDF8F3"}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: n.read ? "#d1d5db" : "#C4956A", flexShrink: 0, marginTop: 6, display: "inline-block" }}></span>
                          <div style={{ flex: 1, textAlign: "right" }}>
                            <p style={{ fontSize: 13, color: DARK, margin: "0 0 3px", lineHeight: 1.55, fontWeight: n.read ? 400 : 600 }}>{stripEmojis(n.message)}</p>
                            <p style={{ fontSize: 11, color: "#9CA3AF", margin: 0 }}>
                              {new Date(n.createdAt).toLocaleDateString("ar-SA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          {!n.read && <span style={{ width: 7, height: 7, borderRadius: "50%", background: BRONZE, flexShrink: 0, marginTop: 6 }}/>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dashboard */}
              <Link to={dashLink} style={{
                textDecoration: "none", fontSize: 13.5, fontWeight: 700,
                padding: "8px 16px", borderRadius: 12,
                background: location.pathname.startsWith(dashLink) ? DARK : "#EAF0EC",
                color: location.pathname.startsWith(dashLink) ? "white" : DARK,
                transition: "all 0.15s", whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { if (!location.pathname.startsWith(dashLink)) e.currentTarget.style.background="#D4E4DA"; }}
              onMouseLeave={e => { if (!location.pathname.startsWith(dashLink)) e.currentTarget.style.background="#EAF0EC"; }}
              >{dashLabel}</Link>

              {/* Profile dropdown */}
              <div ref={dropRef} style={{ position: "relative" }}>
                <button onClick={() => { setDropOpen(!dropOpen); setBellOpen(false); }} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: dropOpen ? "#EAF0EC" : "#FAF7F0",
                  border: `1.5px solid ${dropOpen ? "#A8C4B0" : "#DDD0C0"}`,
                  borderRadius: 12, padding: "7px 14px",
                  cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: DARK,
                  transition: "all 0.15s",
                }}>
                  <ChevronDown size={13} color={BRONZE} style={{ transform: dropOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}/>
                  <span style={{ maxWidth: 85, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{firstName}</span>
                  <UserCircle size={20} color={BRONZE}/>
                </button>

                {dropOpen && (
                  <div style={{
                    position: "absolute", top: 50, left: 0, width: 185,
                    background: "white", borderRadius: 16,
                    boxShadow: "0 16px 48px rgba(27,58,45,0.14)",
                    padding: 8, zIndex: 100, border: "1px solid #EDE3D8",
                  }}>
                    {user?.role === "client" && <DropItem to="/profile"         label="حسابي"             onClick={() => setDropOpen(false)}/>}
                    {user?.role === "client" && <DropItem to="/favorites"       label="مفضلاتي"           onClick={() => setDropOpen(false)}/>}
                    {user?.role === "client" && <DropItem to="/meetings"        label="اجتماعاتي"         onClick={() => setDropOpen(false)}/>}
                    {user?.role === "client" && <DropItem to="/my-orders"       label="طلباتي"            onClick={() => setDropOpen(false)}/>}
                    <DropItem to={dashLink}                                      label={dashLabel}         onClick={() => setDropOpen(false)}/>
                    <DropItem to="/change-password"                              label="تغيير كلمة المرور" onClick={() => setDropOpen(false)}/>
                    <div style={{ borderTop: "1px solid #F2E8DC", margin: "6px 0" }}/>
                    <button onClick={handleLogout} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      width: "100%", padding: "9px 12px",
                      background: "none", border: "none", cursor: "pointer",
                      borderRadius: 10, color: "#DC2626", fontSize: 14, fontWeight: 600,
                      fontFamily: "inherit",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background="#FEE2E2"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}
                    ><LogOut size={14}/> تسجيل الخروج</button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{
            background: "none", border: "none", cursor: "pointer", color: DARK, padding: 6,
            display: "none",
          }} className="nav-mobile-btn">
            {mobileOpen ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div dir="rtl" style={{
          position: "fixed", top: 70, right: 0, left: 0, bottom: 0,
          background: "rgba(248,239,228,0.98)", backdropFilter: "blur(12px)",
          zIndex: 49, padding: "24px 28px", overflowY: "auto",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} style={{
                textDecoration: "none", fontSize: 17, fontWeight: 700,
                padding: "14px 16px", borderRadius: 14, color: DARK,
                background: location.pathname === link.to ? "#EAF0EC" : "transparent",
                borderRight: location.pathname === link.to ? `3px solid ${BRONZE}` : "3px solid transparent",
              }}>{link.label}</Link>
            ))}
            {token && (
              <>
                <div style={{ height: 1, background: "#DDD0C0", margin: "12px 0" }}/>
                {user?.role === "client" && <MobileItem to="/profile" label="حسابي"/>}
                {user?.role === "client" && <MobileItem to="/favorites" label="مفضلاتي"/>}
                {user?.role === "client" && <MobileItem to="/meetings" label="اجتماعاتي"/>}
                {user?.role === "client" && <MobileItem to="/my-orders" label="طلباتي"/>}
                <MobileItem to={dashLink} label={dashLabel}/>
                <MobileItem to="/change-password" label="تغيير كلمة المرور"/>
                <div style={{ height: 1, background: "#DDD0C0", margin: "12px 0" }}/>
                <button onClick={handleLogout} style={{
                  padding: "14px 16px", borderRadius: 14, fontSize: 17, fontWeight: 700,
                  background: "none", border: "none", cursor: "pointer",
                  color: "#DC2626", textAlign: "right", fontFamily: "inherit",
                }}>تسجيل الخروج</button>
              </>
            )}
            {!token && (
              <>
                <div style={{ height: 1, background: "#DDD0C0", margin: "12px 0" }}/>
                <Link to="/login" style={{ display: "block", textDecoration: "none", padding: "14px 16px", borderRadius: 14, background: "#EAF0EC", color: DARK, fontWeight: 700, fontSize: 16, textAlign: "center" }}>تسجيل الدخول</Link>
                <Link to="/register/role" style={{ display: "block", textDecoration: "none", padding: "14px 16px", borderRadius: 14, background: DARK, color: "white", fontWeight: 700, fontSize: 16, textAlign: "center", marginTop: 8 }}>ابدأ الآن</Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-mobile-btn { display: flex !important; }
          .nav-desktop-links { display: none !important; }
          .nav-actions a, .nav-actions > div:not(:last-child) { display: none !important; }
        }
      `}</style>
    </>
  );
}

function DropItem({ to, label, onClick }) {
  return (
    <Link to={to} onClick={onClick} style={{
      display: "block", padding: "9px 12px", borderRadius: 10,
      textDecoration: "none", color: "#1B3A2D", fontSize: 14, fontWeight: 500,
    }}
    onMouseEnter={e => e.currentTarget.style.background="#F0E4D0"}
    onMouseLeave={e => e.currentTarget.style.background="transparent"}
    >{label}</Link>
  );
}

function MobileItem({ to, label }) {
  const location = useLocation();
  return (
    <Link to={to} style={{
      textDecoration: "none", fontSize: 16, fontWeight: 600,
      padding: "13px 16px", borderRadius: 12, color: "#1B3A2D",
      background: location.pathname === to ? "#EAF0EC" : "transparent",
    }}>{label}</Link>
  );
}
