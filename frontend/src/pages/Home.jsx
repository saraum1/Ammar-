import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css";
import buildingImg from "../assets/background.png";
import logoImg from "../assets/logo.png";

const categories = [
  { label: "مواد البناء",       to: "/materials",   image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80", desc: "تصفح وقارن أسعار مواد البناء من أفضل الموردين" },
  { label: "شركات المقاولات",  to: "/contracting", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80", desc: "مقاولون موثوقون لتنفيذ مشروع بنائك بأعلى جودة" },
  { label: "الشركات الهندسية", to: "/engineering", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80", desc: "اعثر على أفضل المكاتب الهندسية لتصميم بيت أحلامك" },
];

const features = [
  { num: "01", title: "شركات موثوقة",  desc: "كل الشركات معتمدة ومراجعة قبل ما تنضاف للمنصة" },
  { num: "02", title: "أفضل الأسعار",  desc: "قارن بين الأسعار واختار الأنسب لميزانيتك بسهولة" },
  { num: "03", title: "من التصميم للتسليم", desc: "كل ما يحتاجه مشروعك في منصة واحدة" },
];

const stages = [
  { label: "التراخيص",  num: "01", desc: "استخراج التصاريح والموافقات اللازمة قبل بدء البناء" },
  { label: "التصميم",   num: "02", desc: "وضع المخططات الهندسية مع مكتب هندسي معتمد" },
  { label: "الأساسات",  num: "03", desc: "أعمال الحفر وصب الأساسات بإشراف هندسي متخصص" },
  { label: "الهيكل",    num: "04", desc: "تشييد الجدران والأعمدة والسقف الخرساني" },
  { label: "التشطيبات", num: "05", desc: "التشطيبات الداخلية والخارجية والأعمال الكهربائية والسباكة" },
  { label: "التسليم",   num: "06", desc: "الفحص النهائي وتسليم المشروع جاهزاً للسكن" },
];

export default function Home() {
  const { token } = useAuth();
  const [activeStage, setActiveStage] = useState(0);
  const stagePrev = () => setActiveStage(i => (i - 1 + stages.length) % stages.length);
  const stageNext = () => setActiveStage(i => (i + 1) % stages.length);
  return (
    <div className="home-page" dir="rtl">

      {/* ════════ HERO ════════ */}
      <section className="hero-section">

        {/* Text side — RIGHT in RTL */}
        <div className="hero-text">
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
            <img src={cat.image} alt={cat.label} className="cat-bg-img" />
            <div className="cat-overlay">
              <p className="cat-desc">{cat.desc}</p>
              <h3 className="cat-name">{cat.label}</h3>
              <span className="cat-arrow">اكتشف <ArrowLeft size={14}/></span>
            </div>
          </Link>
        ))}
      </section>

      {/* ════════ HOW IT WORKS ════════ */}
      <section className="how-section">
        <div className="how-header">
          <span className="section-badge">كيف يعمل عمار؟</span>
          <h2 className="how-title">بيتك يبدأ من هنا</h2>
        </div>
        <div className="how-steps">
          <div className="how-step">
            <div className="how-step-num">01</div>
            <h3 className="how-step-title">ابحث عن الشركة المناسبة</h3>
            <p className="how-step-desc">تصفح شركات هندسية ومقاولين وموردي مواد، قارن بينهم واختار اللي يناسب مشروعك وميزانيتك.</p>
          </div>
          <div className="how-step-divider" />
          <div className="how-step">
            <div className="how-step-num">02</div>
            <h3 className="how-step-title">أرسل طلبك مباشرة</h3>
            <p className="how-step-desc">وصف مشروعك وأرسل الطلب للشركة بضغطة واحدة، من غير ما تحتاج تدور على أرقامهم أو تتصل.</p>
          </div>
          <div className="how-step-divider" />
          <div className="how-step">
            <div className="how-step-num">03</div>
            <h3 className="how-step-title">تابع مشروعك خطوة بخطوة</h3>
            <p className="how-step-desc">بعد القبول تقدر تتابع نسبة الإنجاز، تستقبل تحديثات، وتتواصل مع الشركة بكل سهولة.</p>
          </div>
        </div>
        {!token && (
          <div className="how-cta">
            <Link to="/register/role" className="btn-primary">ابدأ الآن <ArrowLeft size={15}/></Link>
          </div>
        )}
      </section>

      {/* ════════ WHY ════════ */}
      <section className="why-section">
        <div className="why-heading-col">
          <span className="section-badge">لماذا عمار؟</span>
          <h2 className="why-statement">كل اللي تحتاجه لبناء بيتك في مكان واحد</h2>
        </div>
        <div className="why-list">
          {features.map((f, i) => (
            <div key={f.title} className="why-item">
              <span className="why-item-num">{f.num}</span>
              <div className="why-item-body">
                <h3 className="why-item-title">{f.title}</h3>
                <p className="why-item-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ STAGES ════════ */}
      <section className="stages-section">
        <div className="stages-slider-area">
          <button className="stages-arrow" onClick={stageNext} aria-label="التالي">
            <ArrowLeft size={20} />
          </button>

          <div className="stages-track-wrap">
            <div
              className="stages-track"
              style={{ transform: `translateX(${-activeStage * 100}%)` }}
            >
              {stages.map((s, i) => (
                <div key={s.label} className={`stages-card stages-card-${(i % 3) + 1}`}>
                  <div className="stages-card-text">
                    <span className="section-badge">خطوات البناء</span>
                    <h3 className="stages-card-title">{s.label}</h3>
                    <p className="stages-card-desc">{s.desc}</p>
                    <Link to="/engineering" className="btn-primary" style={{display:"inline-flex", marginTop:28}}>
                      ابحث عن شركة <ArrowLeft size={16}/>
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
            <button
              key={i}
              className={`stages-dot${i === activeStage ? " active" : ""}`}
              onClick={() => setActiveStage(i)}
            />
          ))}
        </div>
      </section>

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
