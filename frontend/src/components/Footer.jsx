import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.png';

export default function Footer() {
  return (
    <div
      dir="rtl"
      style={{
        background: "#111D18",
        color: "white",
        padding: "48px 56px 24px",
        width: "100%",
        textAlign: "right",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        <div style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          gap: "40px",
          flexWrap: "wrap",
          paddingBottom: 36,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          marginBottom: 24,
        }}>

          {/* الشعار والوصف */}
          <div style={{ flex: "1.5", minWidth: 250 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 16 }}>
              <img
                src={logoImg}
                alt="عمار"
                style={{ width: 80, height: 80, objectFit: "contain", mixBlendMode: "screen", marginLeft: -10 }}
              />
              <p style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "white", fontFamily: '"Amiri", serif', letterSpacing: "1px", marginRight: -4 }}>عمار</p>
            </div>
            <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.85, margin: 0, maxWidth: 300 }}>
              منصتك الشاملة للعثور على أفضل الشركات الهندسية وشركات المقاولات ومواد البناء لبناء بيت أحلامك.
            </p>
          </div>

          {/* روابط سريعة */}
          <div style={{ flex: 1, minWidth: 150 }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 20px", color: "white", borderRight: "3px solid #C4956A", paddingRight: 10 }}>
              روابط سريعة
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { to: "/",            label: "الرئيسية" },
                { to: "/engineering", label: "الشركات الهندسية" },
                { to: "/contracting", label: "شركات المقاولات" },
                { to: "/materials",   label: "مواد البناء" },
              ].map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    style={{ color: "#94a3b8", textDecoration: "none", fontSize: 14, lineHeight: 2, display: "block", transition: "color 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#C4956A"}
                    onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* تواصل معنا */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <h4 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 20px", color: "white", borderRight: "3px solid #C4956A", paddingRight: 10 }}>
              تواصل معنا
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#94a3b8", fontSize: 14, display: "flex", flexDirection: "column", gap: 8 }}>
              <li style={{ lineHeight: 2 }}>البريد: info@ammar.sa</li>
              <li style={{ lineHeight: 2 }}>الهاتف: 966500000000+</li>
            </ul>
          </div>

        </div>

        <div style={{ textAlign: "center", color: "#475569", fontSize: 13 }}>
          © 2026 عمار — جميع الحقوق محفوظة
        </div>

      </div>
    </div>
  );
}
