import React, { useState } from "react";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css";
import buildingImg from "../assets/background.png";
import logoImg from "../assets/logo.png";

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

const whyPoints = [
  { num: "01", title: "شركات موثوقة",       body: "كل الشركات معتمدة ومراجعة قبل ما تنضاف للمنصة" },
  { num: "02", title: "أفضل الأسعار",       body: "قارن بين الأسعار واختار الأنسب لميزانيتك بسهولة" },
  { num: "03", title: "من التصميم للتسليم", body: "كل ما يحتاجه مشروعك في منصة واحدة" },
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

/* ── الصفحة ── */
export default function LandingPage() {
  const { token } = useAuth();
  const [activeStage, setActiveStage] = useState(0);
  const stagePrev = () => setActiveStage(i => (i - 1 + stages.length) % stages.length);
  const stageNext = () => setActiveStage(i => (i + 1) % stages.length);

  return (
    <div className="home-page" dir="rtl">

      {/* 1 ── HERO — كريمي ── */}
      <section className="hero-section">
        <div className="hero-text">
          <h1 className="hero-heading-ar">عمار</h1>
          <div className="hero-divider">
            <span className="hero-divider-line"/>
            <span className="hero-divider-diamond"/>
            <span className="hero-divider-line"/>
          </div>
          <p className="hero-desc">
            بيت أحلامك يبدأ من هنا — نجمع لك أفضل شركات البناء والهندسة وموردي المواد الموثوقين في الرياض.
          </p>
          <div className="hero-actions">
            <Link to="/register/role" className="btn-primary">
              ابدأ مجاناً <ArrowLeft size={16}/>
            </Link>
          </div>
          <div className="hero-triangles">
            {Array(15).fill(0).map((_, i) => <span key={i} className="hero-tri"/>)}
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-dots-tr"/>
          <div className="hero-circle-bronze"/>
          <img src={buildingImg} alt="" className="hero-building-img"/>
        </div>
      </section>

      {/* 2 ── HOW IT WORKS — أبيض ── */}
      <section className="how-section">
        <div className="how-header">
          <span className="section-badge">كيف يعمل عمار؟</span>
          <h2 className="how-title">ثلاث خطوات بس</h2>
        </div>
        <div className="how-steps">
          {steps.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="how-step">
                <div className="how-step-num">{s.num}</div>
                <h3 className="how-step-title">{s.title}</h3>
                <p className="how-step-desc">{s.body}</p>
              </div>
              {i < steps.length - 1 && <div className="how-step-divider" />}
            </React.Fragment>
          ))}
        </div>
        <div className="how-cta">
          <Link to="/register/role" className="btn-primary">
            سجّل الآن <ArrowLeft size={15}/>
          </Link>
        </div>
      </section>

      {/* 4 ── WHY — زيتي ── */}
      <section className="why-section">
        <div className="why-heading-col">
          <span className="section-badge">لماذا عمار؟</span>
          <h2 className="why-statement">كل اللي تحتاجه لبناء بيتك في مكان واحد</h2>
        </div>
        <div className="why-list">
          {whyPoints.map(w => (
            <div key={w.num} className="why-item">
              <span className="why-item-num">{w.num}</span>
              <div className="why-item-body">
                <h3 className="why-item-title">{w.title}</h3>
                <p className="why-item-desc">{w.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5 ── STAGES ── */}
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

      {/* 6 ── FAQ — كريمي ── */}
      <section style={{ padding: "80px 80px", background: "#FAF7F0", borderTop: "1px solid #EDE3D8", textAlign: "right" }}>
        <span className="section-badge">أسئلة شائعة</span>
        <h2 style={{ fontSize: "clamp(26px, 3vw, 38px)", fontWeight: 900, color: "#111827", margin: "0 0 48px", letterSpacing: -0.5 }}>
          الأسئلة الشائعة
        </h2>
        <div style={{ maxWidth: 720 }}>
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
