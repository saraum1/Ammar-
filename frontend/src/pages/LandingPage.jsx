import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css";
import heroBgVideo from "../assets/hero-bg.mp4";
import logoImg from "../assets/logo.png";
import laptopImg from "../assets/laptop-mockup.png";

/* ── بيانات ── */
const stages = [
  { label: "التراخيص",  num: "01", desc: "استخراج التصاريح والموافقات اللازمة قبل بدء البناء" },
  { label: "التصميم",   num: "02", desc: "وضع المخططات الهندسية مع مكتب هندسي معتمد" },
  { label: "الأساسات",  num: "03", desc: "أعمال الحفر وصب الأساسات بإشراف هندسي متخصص" },
  { label: "الهيكل",    num: "04", desc: "تشييد الجدران والأعمدة والسقف الخرساني" },
  { label: "التشطيبات", num: "05", desc: "التشطيبات الداخلية والخارجية والأعمال الكهربائية والسباكة" },
  { label: "التسليم",   num: "06", desc: "الفحص النهائي وتسليم المشروع جاهزاً للسكن" },
];

const steps = [
  { num: "01", title: "ابحث عن الشركة المناسبة",  body: "تصفح شركات هندسية ومقاولين وموردي مواد، قارن بينهم واختار اللي يناسب مشروعك وميزانيتك." },
  { num: "02", title: "أرسل طلبك مباشرة",          body: "صف مشروعك وأرسل الطلب للشركة بضغطة واحدة." },
  { num: "03", title: "تابع مشروعك خطوة بخطوة",    body: "بعد القبول تقدر تتابع نسبة الإنجاز، تستقبل تحديثات، وتتواصل مع الشركة بكل سهولة." },
];

const audiencePoints = [
  { title: "العميل",            body: "تصفح شركات موثوقة، قارن بينها، وأرسل طلبك بضغطة واحدة بدل المكالمات والبحث." },
  { title: "الشركات الهندسية",  body: "وصول مباشر لعملاء جادين يبحثون عن تصميم بيوتهم، بدون وسطاء." },
  { title: "شركات المقاولات",   body: "استقبل طلبات تنفيذ وتابع مشاريعك مع عملائك في مكان واحد." },
  { title: "موردي مواد البناء", body: "اعرض منتجاتك أمام شركات وعملاء يبحثون عن مواد بناء فعلاً." },
];

const faqs = [
  { q: "هل التسجيل مجاني؟",
    a: "نعم، التسجيل مجاني تماماً للعملاء. تقدر تتصفح وترسل طلباتك بدون أي رسوم." },
  { q: "كيف أتأكد من موثوقية الشركات؟",
    a: "كل شركة تمر بعملية مراجعة من فريق عمار قبل ظهورها في المنصة، وبإمكانك الاطلاع على تقييمات العملاء السابقين." },
  { q: "هل أقدر أتواصل مع أكثر من شركة؟",
    a: "بالتأكيد، تقدر ترسل طلبات لعدة شركات في نفس الوقت وتقارن بين ردودهم." },
  { q: "وش يصير للطلب بعد الإرسال؟",
    a: "الشركة تستقبل طلبك وتراجعه، ثم ترسل لك ردها مباشرة في المنصة — قبول أو رفض مع توضيح السبب. لو قبلت، يتحول الطلب لمشروع وتبدأ تتابع كل مرحلة من التنفيذ خطوة بخطوة." },
  { q: "هل الخدمة متاحة في كل مناطق السعودية؟",
    a: "حالياً متاحة في الرياض — وبنتوسع لمناطق جديدة قريباً." },
];

/* ── فاصل مقوّس بين الأقسام ── */
function ArchDivider({ from, to }) {
  return (
    <div className="arch-divider" style={{ background: to }}>
      <svg viewBox="0 0 1440 50" preserveAspectRatio="none">
        <path d="M0,0 L0,22 Q720,42 1440,22 L1440,0 Z" fill={from}/>
      </svg>
    </div>
  );
}

/* ── مكوّن السؤال ── */
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{ borderBottom: "1px solid #EDE3D8", cursor: "pointer", padding: "20px 0" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
        <div style={{ flexShrink: 0 }}>
          {open ? <Minus size={15} color="#C4956A" /> : <Plus size={15} color="#C4956A" />}
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0, textAlign: "right", flex: 1 }}>{q}</h3>
      </div>
      {open && (
        <p style={{ fontSize: 14, color: "#4b5563", margin: "12px 0 0", lineHeight: 1.9, textAlign: "right" }}>{a}</p>
      )}
    </div>
  );
}

const featureCards = [
  {
    category: "موثوقية",
    title: "شركات موثوقة\nومعتمدة",
    desc: "كل الشركات معتمدة ومراجعة قبل ما تنضاف للمنصة.",
  },
  {
    category: "الأسعار",
    title: "أفضل الأسعار",
    desc: "قارن بين الأسعار واختار الأنسب لميزانيتك بسهولة.",
  },
  {
    category: "تنفيذ المشروع",
    title: "من التصميم\nللتسليم",
    desc: "كل ما يحتاجه مشروعك في منصة واحدة.",
  },
  {
    category: "متابعة المشروع",
    title: "كل مرحلة\nتحت إشرافك",
    desc: "تابع نسبة الإنجاز، استقبل تحديثات الشركة، وراقب مراحل البناء خطوة بخطوة.",
  },
  {
    category: "التقييمات",
    title: "آراء حقيقية\nمن عملاء فعليين",
    desc: "قرارك مبني على تجارب حقيقية — تقييمات موثقة من عملاء أنهوا مشاريعهم فعلاً.",
  },
];

/* ── الصفحة ── */
export default function LandingPage() {
  const { token } = useAuth();
  const location = useLocation();
  const [activeStage, setActiveStage] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeVTab, setActiveVTab] = useState(0);
  const [fDragging, setFDragging] = useState(false);
  const fTrackWrapRef = useRef(null);
  const fCardRefs = useRef([]);
  const fDragRef = useRef({ down: false, lastX: 0 });

  useEffect(() => {
    const wrap = fTrackWrapRef.current;
    if (!wrap) return;
    const observer = new IntersectionObserver((entries) => {
      let best = null;
      entries.forEach(entry => {
        if (entry.isIntersecting && (!best || entry.intersectionRatio > best.intersectionRatio)) best = entry;
      });
      if (best) {
        const idx = fCardRefs.current.indexOf(best.target);
        if (idx !== -1) setActiveFeature(idx);
      }
    }, { root: wrap, threshold: 0.6 });
    fCardRefs.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const fGoTo = (idx) => {
    fCardRefs.current[idx]?.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
    setActiveFeature(idx);
  };
  const fPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    fDragRef.current = { down: true, lastX: e.clientX };
    setFDragging(true);
  };
  const fPointerMove = (e) => {
    if (!fDragRef.current.down || !fTrackWrapRef.current) return;
    const dx = e.clientX - fDragRef.current.lastX;
    fTrackWrapRef.current.scrollLeft -= dx;
    fDragRef.current.lastX = e.clientX;
  };
  const fPointerUp = () => { fDragRef.current.down = false; setFDragging(false); };
  const stagePrev = () => setActiveStage(i => (i - 1 + stages.length) % stages.length);
  const stageNext = () => setActiveStage(i => (i + 1) % stages.length);

  useEffect(() => {
    if (!location.hash) return;
    const el = document.getElementById(location.hash.slice(1));
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash]);

  return (
    <div className="home-page" dir="rtl">

      {/* 1 ── HERO ── */}
      <section id="hero" className="hero-section">
        <video autoPlay muted loop playsInline className="hero-bg-img">
          <source src={heroBgVideo} type="video/mp4" />
        </video>
        <div className="hero-overlay"/>
        <div className="hero-text">
          <h1 className="hero-heading-ar">عمار</h1>
          <p className="hero-desc">
            بيت أحلامك يبدأ من هنا — نجمع لك أفضل شركات البناء والهندسة وموردي المواد الموثوقين.
          </p>
          <div className="hero-actions">
            <Link to="/register/role" className="btn-hero-white">
              ابدأ مجاناً <ArrowLeft size={16}/>
            </Link>
          </div>
        </div>
      </section>

      <ArchDivider from="#0F2218" to="#FAF7F0"/>

      {/* 2 ── FEATURES CAROUSEL ── */}
      <section id="features" className="fcarousel-section">
        <div className="fcarousel-header">
          <div className="fcarousel-header-text">
            <span className="section-badge">المميزات</span>
            <h2 className="fcarousel-title">بيتك يبدأ من هنا</h2>
          </div>
        </div>

        <div
          className="fcarousel-track-wrap"
          ref={fTrackWrapRef}
          onPointerDown={fPointerDown}
          onPointerMove={fPointerMove}
          onPointerUp={fPointerUp}
          onPointerCancel={fPointerUp}
          style={{ cursor: fDragging ? "grabbing" : "grab" }}
        >
          <div className="fcarousel-track">
            {featureCards.map((f, i) => (
              <div
                key={f.category}
                ref={(el) => { fCardRefs.current[i] = el; }}
                className={`fcarousel-card fcarousel-card-${(i % 3) + 1}`}
                style={{ userSelect: fDragging ? "none" : "auto" }}
              >
                <div className="fcarousel-card-top">
                  <span className="fcarousel-category">{f.category}</span>
                </div>
                <h3 className="fcarousel-card-title">
                  {f.title.split("\n").map((line, j) => <span key={j}>{line}<br/></span>)}
                </h3>
                <p className="fcarousel-card-desc">{f.desc}</p>
                <div className="fcarousel-card-bottom">
                  <Link to="/register/role" className="fcarousel-cta">
                    ابدأ الآن <ArrowLeft size={14}/>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fcarousel-dots-row">
          <button
            className="fcarousel-arrow-sm"
            onClick={() => fGoTo(Math.max(0, activeFeature - 1))}
            aria-label="السابق"
          >
            <ArrowLeft size={16}/>
          </button>
          <div className="fcarousel-dots">
            {featureCards.map((_, i) => (
              <button key={i} onClick={() => fGoTo(i)}
                className={`fcarousel-dot${i === activeFeature ? " active" : ""}`}/>
            ))}
          </div>
          <button
            className="fcarousel-arrow-sm fcarousel-arrow-sm-prev"
            onClick={() => fGoTo(Math.min(featureCards.length - 1, activeFeature + 1))}
            aria-label="التالي"
          >
            <ArrowLeft size={16}/>
          </button>
        </div>
      </section>

      <ArchDivider from="#FAF7F0" to="#FFFFFF"/>

      {/* 3 ── HOW IT WORKS — أبيض ── */}
      <section id="how" className="how-section">
        <div className="how-inner">
          {/* يمين: خطوات */}
          <div className="how-steps-col">
            <span className="section-badge">كيف يعمل عمار؟</span>
            <h2 className="how-title">ثلاث خطوات بس</h2>
            <div className="how-steps-list">
              {steps.map((s, i) => (
                <div key={s.num} className="how-step-row">
                  <div className="how-step-right">
                    <div className="how-step-circle">{s.num}</div>
                    {i < steps.length - 1 && <div className="how-step-connector"/>}
                  </div>
                  <div className="how-step-body">
                    <h3 className="how-step-title">{s.title}</h3>
                    <p className="how-step-desc">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link to="/register/role" className="btn-primary" style={{marginTop: 12, display: "inline-flex"}}>
              سجّل الآن <ArrowLeft size={15}/>
            </Link>
          </div>

          {/* يسار: لابتوب موكاب */}
          <div className="how-laptop-col">
            <img src={laptopImg} alt="عمار على لابتوب" className="laptop-mockup-img" />
          </div>
        </div>
      </section>

      <ArchDivider from="#FFFFFF" to="#FAF7F0"/>

      {/* 4 ── STAGES ── */}
      <section id="stages" className="stages-section">
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

      <ArchDivider from="#FAF7F0" to="#1B3A2D"/>

      {/* 5 ── لمن عمار — زيتي ── */}
      <section id="why" className="why-section">
        <div className="why-heading-row">
          <h2 className="why-statement">لمن عمار؟</h2>
        </div>
        <div className="why-grid">
          {audiencePoints.map(w => (
            <div key={w.title} className="why-tile">
              <h3 className="why-tile-title">{w.title}</h3>
              <p className="why-tile-desc">{w.body}</p>
            </div>
          ))}
        </div>
      </section>

      <ArchDivider from="#1B3A2D" to="#FAF7F0"/>

      {/* 6 ── FAQ — كريمي ── */}
      <section id="faq" style={{ padding: "80px 80px", background: "#FAF7F0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span className="section-badge">أسئلة شائعة</span>
        <h2 style={{ fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 900, color: "#111827", margin: "0 0 48px", letterSpacing: -0.5 }}>
          الأسئلة الشائعة
        </h2>
        <div style={{ maxWidth: 720, width: "100%" }}>
          <div style={{ borderTop: "1px solid #EDE3D8" }}>
            {faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* 6 ── CTA — كريمي ── */}
      {!token && (
        <section className="cta-section">
          <div className="cta-logo-wrap">
            <img src={logoImg} alt="عمار" className="cta-logo"/>
          </div>
          <div className="cta-content">
            <h2 className="cta-title">جاهز تبني بيت أحلامك؟</h2>
            <p className="cta-sub">سجّل الآن وابدأ في دقائق — مجاناً.</p>
            <Link to="/register/role">
              <button className="cta-btn">ابدأ الآن <ArrowLeft size={15} style={{display:"inline",verticalAlign:"middle"}}/></button>
            </Link>
          </div>
          <div className="cta-triangles">
            {Array(15).fill(0).map((_, i) => <span key={i} className="cta-tri"/>)}
          </div>
        </section>
      )}

    </div>
  );
}
