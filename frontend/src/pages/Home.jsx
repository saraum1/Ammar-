import React from "react";
import { Shield, Star, Layers, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css";
import buildingImg from "../assets/background.png";

const DARK   = "#1B3A2D";
const BRONZE = "#C4956A";

const categories = [
  { label: "مواد البناء",       to: "/materials",   image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&q=80", desc: "تصفح وقارن أسعار مواد البناء من أفضل الموردين" },
  { label: "شركات المقاولات",  to: "/contracting", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&q=80", desc: "مقاولون موثوقون لتنفيذ مشروع بنائك بأعلى جودة" },
  { label: "الشركات الهندسية", to: "/engineering", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&q=80", desc: "اعثر على أفضل المكاتب الهندسية لتصميم بيت أحلامك" },
];

const features = [
  { icon: <Shield size={26}/>, title: "شركات موثوقة",  desc: "كل الشركات معتمدة ومراجعة قبل ما تنضاف للمنصة" },
  { icon: <Star   size={26}/>, title: "أفضل الأسعار",  desc: "قارن بين الأسعار واختار الأنسب لميزانيتك بسهولة" },
  { icon: <Layers size={26}/>, title: "كل شي في مكان", desc: "هندسة، مقاولات، ومواد بناء كلها تحت سقف واحد"   },
];

const stages = [
  { label: "التراخيص",  num: "01" },
  { label: "التصميم",   num: "02" },
  { label: "الأساسات",  num: "03" },
  { label: "الهيكل",    num: "04" },
  { label: "التشطيبات", num: "05" },
  { label: "التسليم",   num: "06" },
];

export default function Home() {
  const { token } = useAuth();
  return (
    <div className="home-page" dir="rtl">

      {/* ════════ HERO ════════ */}
      <section className="hero-section">

        {/* Text side — RIGHT in RTL */}
        <div className="hero-text">
          <span className="hero-badge">
            <span className="hero-badge-dot"/>
            منصتك الشاملة لبناء بيت أحلامك
          </span>

          <h1 className="hero-heading-ar">عمار</h1>

          <div className="hero-divider">
            <span className="hero-divider-line"/>
            <span className="hero-divider-diamond"/>
            <span className="hero-divider-line"/>
          </div>

          <p className="hero-desc">
            تجمع لك أفضل الشركات الهندسية وشركات المقاولات
            وموردي مواد البناء في منصة واحدة سهلة الاستخدام.
          </p>

          {!token && (
            <div className="hero-actions">
              <Link to="/register/role" className="btn-primary">
                ابدأ رحلة البناء <ArrowLeft size={16}/>
              </Link>
            </div>
          )}

          {/* triangles — bottom of text */}
          <div className="hero-triangles">
            {Array(15).fill(0).map((_, i) => <span key={i} className="hero-tri"/>)}
          </div>
        </div>

        {/* Building image — LEFT in RTL */}
        <div className="hero-visual">
          <div className="hero-dots-tr"/>
          <div className="hero-circle-bronze"/>
          <img src={buildingImg} alt="" className="hero-building-img"/>
        </div>

      </section>

      {/* ════════ CATEGORIES ════════ */}
      <section className="categories-section">
        {categories.map(cat => (
          <Link key={cat.label} to={cat.to} className="cat-card">
            <div className="cat-img"><img src={cat.image} alt={cat.label}/></div>
            <div className="cat-info">
              <h3>{cat.label}</h3>
              <p>{cat.desc}</p>
            </div>
          </Link>
        ))}
      </section>

      {/* ════════ WHY ════════ */}
      <section className="why-section">
        <div className="section-header">
          <span className="section-badge">لماذا عمار؟</span>
          <h2>كل اللي تحتاجه في مكان واحد</h2>
        </div>
        <div className="features-grid">
          {features.map(f => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ STAGES ════════ */}
      <section className="stages-section">
        <div className="section-header">
          <span className="section-badge">ابدأ مشروعك الآن</span>
          <h2>تابع كل مرحلة من مراحل بناء بيتك</h2>
        </div>
        <div className="stages-track">
          {stages.map((s, i) => (
            <div key={s.label} className="stage-item">
              <div className="stage-box">
                <span className="stage-num">{s.num}</span>
                <span className="stage-label">{s.label}</span>
              </div>
              {i < stages.length - 1 && <span className="stage-arrow">←</span>}
            </div>
          ))}
        </div>
        <Link to="/engineering" className="btn-primary" style={{ marginTop: 36, display: "inline-flex" }}>
          ابحث عن شركة هندسية <ArrowLeft size={16}/>
        </Link>
      </section>

      {/* ════════ CTA ════════ */}
      <section className="cta-section">
        <div className="cta-dots"/>
        <h2>جاهز تبني بيت أحلامك؟</h2>
        {!token && (
          <>
            <p>انضم إلى عمار</p>
            <Link to="/register/role">
              <button className="cta-btn">ابدأ الآن</button>
            </Link>
          </>
        )}
      </section>

    </div>
  );
}
