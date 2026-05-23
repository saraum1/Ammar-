import React, { useState, useEffect } from "react";
import { HardHat, MapPin, Briefcase, Star, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SORT_OPTIONS = [
  { value: "default",  label: "الافتراضي" },
  { value: "rating",   label: "الأعلى تقييماً" },
  { value: "projects", label: "الأكثر مشاريع" },
];

export default function ContractingCompanies() {
  const [search,    setSearch]    = useState("");
  const [sort,      setSort]      = useState("default");
  const [companies, setCompanies] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/companies?type=partial_construction")
      .then(r => r.json())
      .then(d => { if (d.data) setCompanies(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = companies
    .filter(c => !search || c.ownerName?.includes(search) || c.description?.includes(search) || c.city?.includes(search))
    .sort((a, b) => {
      if (sort === "rating")   return (b.rating || 0) - (a.rating || 0);
      if (sort === "projects") return (b.projectsCount || 0) - (a.projectsCount || 0);
      return 0;
    });

  return (
    <div style={{ background: "#FAF7F0", minHeight: "100vh" }} dir="rtl">
      {/* Hero */}
      <div style={{ textAlign: "center", padding: "60px 20px 36px" }}>
        <div style={{ width: 60, height: 60, background: "#F0E4D0", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", boxShadow: "0 4px 14px rgba(196,149,106,0.2)" }}>
          <HardHat size={28} color="#C4956A" />
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 900, margin: "0 0 10px", color: "#111827" }}>شركات المقاولات</h1>
        <p style={{ color: "#6b7280", fontSize: 15, margin: 0 }}>مقاولون موثوقون لتنفيذ مشروع بنائك بأعلى جودة</p>
      </div>

      {/* Search & Sort */}
      <div style={{ maxWidth: 700, margin: "0 auto 36px", padding: "0 24px", display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", background: "white", borderRadius: 14, padding: "11px 16px", gap: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #EDE3D8" }}>
          <Search size={17} color="#9ca3af" />
          <input
            type="text"
            placeholder="ابحث بالاسم أو المدينة..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: "none", outline: "none", flex: 1, fontSize: 14, background: "transparent", textAlign: "right", color: "#374151" }}
          />
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          style={{ background: "white", border: "1px solid #EDE3D8", borderRadius: 12, padding: "11px 14px", fontSize: 13, color: "#374151", cursor: "pointer", outline: "none", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Count */}
      {!loading && filtered.length > 0 && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 70px", marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "right" }}>{filtered.length} شركة</p>
        </div>
      )}

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24, padding: "0 70px 80px", maxWidth: 1200, margin: "0 auto" }}>
        {loading ? (
          [1,2,3].map(i => <SkeletonCard key={i} />)
        ) : filtered.length === 0 ? (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: "#9ca3af" }}>
            <HardHat size={48} style={{ margin: "0 auto 16px", opacity: 0.2 }} />
            <p style={{ fontSize: 16, fontWeight: 600 }}>{search ? `لا توجد نتائج لـ "${search}"` : "لا توجد شركات مقاولات مسجّلة بعد"}</p>
          </div>
        ) : (
          filtered.map(c => (
            <CompanyCard key={c.id} company={c} onView={() => navigate(`/companies/${c.id}`)} />
          ))
        )}
      </div>
    </div>
  );
}

function CompanyCard({ company, onView }) {
  const coverImg = company.coverPhoto
    ? `${company.coverPhoto}`
    : "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80";

  return (
    <div
      onClick={onView}
      style={{ background: "white", borderRadius: 22, overflow: "hidden", boxShadow: "0 4px 18px rgba(0,0,0,0.07)", border: "1px solid rgba(0,0,0,0.03)", cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 16px 36px rgba(0,0,0,0.12)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,0,0,0.07)"; }}
    >
      {/* Cover image */}
      <div style={{ height: 190, overflow: "hidden", position: "relative" }}>
        <img src={coverImg} alt={company.ownerName} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.38) 0%, transparent 55%)" }} />
        {company.rating > 0 && (
          <div style={{ position: "absolute", top: 12, right: 12, display: "flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", color: "white", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>
            <Star size={11} fill="white" color="white" /> {Number(company.rating).toFixed(1)}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: "#111827" }}>{company.ownerName}</h3>
          <span style={{ background: "#F0E4D0", color: "#C4956A", fontSize: 11, fontWeight: 700, padding: "3px 11px", borderRadius: 999 }}>مقاولات</span>
        </div>
        <p style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.75, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", flex: 1 }}>
          {company.description || "شركة مقاولات مرخصة في المملكة العربية السعودية"}
        </p>

        {/* Info chips */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 14, fontSize: 12, color: "#9ca3af", borderTop: "1px solid #f3f4f6", paddingTop: 12 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={12} color="#C4956A" /> {company.city || "الرياض"}
          </span>
          {company.projectsCount > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Briefcase size={12} color="#C4956A" /> {company.projectsCount} مشروع
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: "white", borderRadius: 22, overflow: "hidden", boxShadow: "0 4px 18px rgba(0,0,0,0.06)" }}>
      <div style={{ height: 190, background: "#f3f4f6" }} />
      <div style={{ padding: "18px 20px" }}>
        <div style={{ height: 16, background: "#f3f4f6", borderRadius: 8, marginBottom: 10, width: "60%" }} />
        <div style={{ height: 12, background: "#f3f4f6", borderRadius: 8, marginBottom: 6 }} />
        <div style={{ height: 12, background: "#f3f4f6", borderRadius: 8, width: "80%" }} />
        <div style={{ height: 40, background: "#f3f4f6", borderRadius: 12, marginTop: 16 }} />
      </div>
    </div>
  );
}
