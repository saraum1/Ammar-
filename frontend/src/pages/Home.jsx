import React, { useState, useEffect } from "react";
import { ArrowLeft, Star, MapPin, Search, Send, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css";
import heroBgVideo from "../assets/hero-bg.mp4";
import logoImg from "../assets/logo.png";
import defaultCover from "../assets/background.png";

const TYPE_LABELS = {
  full_construction: "هندسية",
  partial_construction: "مقاولات",
  materials_supplier: "مواد بناء",
};

const TYPE_IMAGES = {
  full_construction: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
  partial_construction: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
  materials_supplier: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80",
};

// تُعرض مؤقتاً لين تتوفر شركات حقيقية مسجّلة ومقيّمة على المنصة
const PLACEHOLDER_COMPANIES = [
  { id: "p1", ownerName: "شركة الأساس الذهبي", type: "partial_construction", city: "الرياض", rating: 4.8, coverPhoto: TYPE_IMAGES.partial_construction, to: "/contracting" },
  { id: "p2", ownerName: "مكتب الرؤية الهندسي", type: "full_construction", city: "جدة", rating: 4.7, coverPhoto: TYPE_IMAGES.full_construction, to: "/engineering" },
  { id: "p3", ownerName: "مؤسسة متين للمواد", type: "materials_supplier", city: "الدمام", rating: 4.6, coverPhoto: TYPE_IMAGES.materials_supplier, to: "/materials" },
];

const quickActions = [
  { icon: Search,       title: "اختر فئتك",   desc: "هندسية، مقاولات، أو مواد بناء" },
  { icon: Send,         title: "أرسل طلبك",   desc: "وصف مشروعك بضغطة واحدة" },
  { icon: CheckCircle2, title: "تابع التنفيذ", desc: "تواصل وتحديثات بمكان واحد" },
];

const stages = [
  { label: "التراخيص",  num: "01", desc: "استخراج التصاريح والموافقات اللازمة قبل بدء البناء" },
  { label: "التصميم",   num: "02", desc: "وضع المخططات الهندسية مع مكتب هندسي معتمد" },
  { label: "الأساسات",  num: "03", desc: "أعمال الحفر وصب الأساسات بإشراف هندسي متخصص" },
  { label: "الهيكل",    num: "04", desc: "تشييد الجدران والأعمدة والسقف الخرساني" },
  { label: "التشطيبات", num: "05", desc: "التشطيبات الداخلية والخارجية والأعمال الكهربائية والسباكة" },
  { label: "التسليم",   num: "06", desc: "الفحص النهائي وتسليم المشروع جاهزاً للسكن" },
];

const categories = [
  { label: "مواد البناء",       to: "/materials",   image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80", desc: "تصفح وقارن أسعار مواد البناء من أفضل الموردين" },
  { label: "شركات المقاولات",  to: "/contracting", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80", desc: "مقاولون موثوقون لتنفيذ مشروع بنائك بأعلى جودة" },
  { label: "الشركات الهندسية", to: "/engineering", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80", desc: "اعثر على أفضل المكاتب الهندسية لتصميم بيت أحلامك" },
];

function ArchDivider({ from, to }) {
  return (
    <div className="arch-divider" style={{ background: to }}>
      <svg viewBox="0 0 1440 50" preserveAspectRatio="none">
        <path d="M0,0 L0,22 Q720,42 1440,22 L1440,0 Z" fill={from}/>
      </svg>
    </div>
  );
}

export default function Home() {
  const { token } = useAuth();
  const [topCompanies, setTopCompanies] = useState([]);
  const [activeStage, setActiveStage] = useState(0);
  const stagePrev = () => setActiveStage(i => (i - 1 + stages.length) % stages.length);
  const stageNext = () => setActiveStage(i => (i + 1) % stages.length);

  useEffect(() => {
    Promise.all([
      fetch("/api/companies?type=full_construction").then(r => r.json()),
      fetch("/api/companies?type=partial_construction").then(r => r.json()),
      fetch("/api/companies?type=materials_supplier").then(r => r.json()),
    ])
      .then(([eng, contr, mat]) => {
        const all = [...(eng.data || []), ...(contr.data || []), ...(mat.data || [])];
        const sorted = all.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3);
        setTopCompanies(sorted.length > 0 ? sorted : PLACEHOLDER_COMPANIES);
      })
      .catch(() => setTopCompanies(PLACEHOLDER_COMPANIES));
  }, []);

  return (
    <div className="home-page" dir="rtl">

      {/* ════════ HERO ════════ */}
      <section className="hero-section">
        <video autoPlay muted loop playsInline className="hero-bg-img">
          <source src={heroBgVideo} type="video/mp4" />
        </video>
        <div className="hero-overlay"/>
        <div className="hero-text">
          <h1 className="hero-heading-ar">عمار</h1>
          <p className="hero-desc">
            بيت أحلامك يبدأ من هنا — نجمع لك أفضل شركات البناء والهندسة وموردي المواد الموثوقين.
          </p>
          {!token && (
            <div className="hero-actions">
              <Link to="/register/role" className="btn-primary">
                ابدأ رحلة البناء <ArrowLeft size={16}/>
              </Link>
            </div>
          )}
        </div>
      </section>

      <ArchDivider from="#0F2218" to="#FAF7F0"/>

      {/* ════════ QUICK ACTIONS ════════ */}
      <section className="quick-actions-section">
        {quickActions.map((a, i) => (
          <div key={a.title} className="quick-action-item">
            <div className="quick-action-icon"><a.icon size={20} /></div>
            <div>
              <h3 className="quick-action-title">{a.title}</h3>
              <p className="quick-action-desc">{a.desc}</p>
            </div>
            {i < quickActions.length - 1 && <span className="quick-action-sep" />}
          </div>
        ))}
      </section>

      {/* ════════ CATEGORIES ════════ */}
      <section className="categories-section">
        {categories.map(cat => (
          <Link key={cat.label} to={cat.to} className="cat-card">
            <img src={cat.image} alt={cat.label} className="cat-bg-img" />
            <div className="cat-overlay">
              <p className="cat-desc">{cat.desc}</p>
              <h3 className="cat-name">{cat.label}</h3>
              <span className="cat-arrow">عرض <ArrowLeft size={14}/></span>
            </div>
          </Link>
        ))}
      </section>

      <ArchDivider from="#FAF7F0" to="#FFFFFF"/>

      {/* ════════ RECOMMENDED COMPANIES ════════ */}
      {topCompanies.length > 0 && (
        <section className="recommended-section">
          <div className="recommended-header">
            <span className="section-badge">الأعلى تقييماً</span>
            <h2 className="recommended-title">شركات موصى بها</h2>
          </div>
          <div className="recommended-grid">
            {topCompanies.map(c => (
              <Link key={c.id} to={c.to || `/companies/${c.id}`} className="recommended-card">
                <div className="recommended-card-img-wrap">
                  <img src={c.coverPhoto || TYPE_IMAGES[c.type] || defaultCover} alt={c.ownerName} className="recommended-card-img" />
                  {c.rating > 0 && (
                    <span className="recommended-rating-badge">
                      <Star size={11} fill="white" /> {Number(c.rating).toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="recommended-card-body">
                  <div className="recommended-card-top">
                    <h3 className="recommended-card-name">{c.ownerName}</h3>
                    <span className="recommended-card-type">{TYPE_LABELS[c.type] || "شركة"}</span>
                  </div>
                  <span className="recommended-card-city"><MapPin size={12} /> {c.city || "الرياض"}</span>
                  <span className="recommended-card-view">عرض</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <ArchDivider from="#FFFFFF" to="#FAF7F0"/>

      {/* ════════ STAGES ════════ */}
      <section className="stages-section">
        <div className="stages-slider-area">
          <button className="stages-arrow" onClick={stageNext} aria-label="التالي">
            <ArrowLeft size={20} />
          </button>
          <div className="stages-track-wrap">
            <div className="stages-track" style={{ transform: `translateX(${-activeStage * 100}%)` }}>
              {stages.map((s, i) => (
                <div key={s.label} className={`stages-card stages-card-${(i % 3) + 1}`}>
                  <div className="stages-card-text">
                    <span className="section-badge">خطوات البناء</span>
                    <h3 className="stages-card-title">{s.label}</h3>
                    <p className="stages-card-desc">{s.desc}</p>
                    <Link to="/register/role" className="btn-primary" style={{ display: "inline-flex", marginTop: 28 }}>
                      ابدأ الآن <ArrowLeft size={16}/>
                    </Link>
                  </div>
                  <div className="stages-card-visual">
                    <span className="stages-card-num">{s.num}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="stages-arrow stages-arrow-prev" onClick={stagePrev} aria-label="السابق">
            <ArrowLeft size={20} />
          </button>
        </div>
        <div className="stages-dots">
          {stages.map((_, i) => (
            <button key={i} className={`stages-dot${i === activeStage ? " active" : ""}`} onClick={() => setActiveStage(i)} />
          ))}
        </div>
      </section>

      {/* ════════ WELCOME BACK ════════ */}
      {token && (
        <section className="welcome-back-section">
          <div className="welcome-back-card">
            <div>
              <h2 className="welcome-back-title">أهلاً بك</h2>
              <p className="welcome-back-desc">تابع مشاريعك ومراحل تنفيذها.</p>
            </div>
            <Link to="/my-projects" className="welcome-back-btn">
              مشاريعي <ArrowLeft size={15}/>
            </Link>
          </div>
        </section>
      )}

      {/* ════════ CTA ════════ */}
      {!token && (
        <section className="cta-section">
          {/* لوقو يمين */}
          <div className="cta-logo-wrap">
            <img src={logoImg} alt="عمار" className="cta-logo"/>
          </div>

          {/* نص وسط */}
          <div className="cta-content">
            <h2 className="cta-title">جاهز تبني بيت أحلامك؟</h2>
            <p className="cta-sub">انضم إلى عمار</p>
            <Link to="/register/role">
              <button className="cta-btn">ابدأ الآن <ArrowLeft size={15} style={{display:"inline",verticalAlign:"middle"}}/></button>
            </Link>
          </div>

          {/* ديكور يسار */}
          <div className="cta-triangles">
            {Array(15).fill(0).map((_, i) => <span key={i} className="cta-tri"/>)}
          </div>
        </section>
      )}

    </div>
  );
}
