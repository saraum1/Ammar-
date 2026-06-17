import React, { useState, useEffect, useCallback } from "react";
import { Package, MapPin, Briefcase, Star, Search, Tag, X, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import defaultCover from "../assets/background.png";
const CATEGORIES = ["الكل", "اسمنت", "حديد", "خشب", "بلاط", "دهانات", "كهربائيات", "سباكة", "عزل", "رخام"];
const SORT_OPTIONS = [
  { value: "default",  label: "الافتراضي" },
  { value: "rating",   label: "الأعلى تقييماً" },
  { value: "projects", label: "الأكثر طلبات" },
];
export default function BuildingMaterials() {
  const [search,       setSearch]       = useState("");
  const [debouncedQ,   setDebouncedQ]   = useState("");
  const [category,     setCategory]     = useState("الكل");
  const [sort,         setSort]         = useState("default");
  const [companies,    setCompanies]    = useState([]);
  const [products,     setProducts]     = useState([]);
  const [loadingCo,    setLoadingCo]    = useState(true);
  const [loadingProd,  setLoadingProd]  = useState(false);
  const [mode,         setMode]         = useState("companies");
  const [favIds,       setFavIds]       = useState(new Set());
  const navigate = useNavigate();
  const { token, user } = useAuth();
  useEffect(() => {
    if (!token || user?.role !== "client") return;
    fetch("/api/favorites/ids", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.data) setFavIds(new Set(d.data)); })
      .catch(() => {});
  }, [token, user]);
  const toggleFav = async (productId) => {
    if (!token) return;
    const wasFav = favIds.has(productId);
    setFavIds(prev => { const s = new Set(prev); wasFav ? s.delete(productId) : s.add(productId); return s; });
    await fetch("/api/favorites/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ productId })
    }).catch(() => {});
  };
  useEffect(() => {
    fetch("/api/companies?type=materials_supplier")
      .then(r => r.json())
      .then(d => { if (d.data) setCompanies(d.data); })
      .catch(() => {})
      .finally(() => setLoadingCo(false));
  }, []);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => {
    if (debouncedQ || category !== "الكل") {
      setMode("products");
      setLoadingProd(true);
      const params = new URLSearchParams();
      if (debouncedQ)          params.set("q",        debouncedQ);
      if (category !== "الكل") params.set("category", category);
      fetch(`/api/products/search?${params}`)
        .then(r => r.json())
        .then(d => setProducts(d.data || []))
        .catch(() => setProducts([]))
        .finally(() => setLoadingProd(false));
    } else {
      setMode("companies");
      setProducts([]);
    }
  }, [debouncedQ, category]);
  const filteredCompanies = companies
    .sort((a, b) => {
      if (sort === "rating")   return (b.rating || 0) - (a.rating || 0);
      if (sort === "projects") return (b.projectsCount || 0) - (a.projectsCount || 0);
      return 0;
    });
  const clearSearch = () => { setSearch(""); setCategory("الكل"); };
  return (
    <div style={{ background: "#FAF7F0", minHeight: "100vh" }} dir="rtl">
      {}
      <div style={{ background: "white", padding: "36px 72px 28px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 4px", color: "#111827", letterSpacing: -0.5 }}>مواد البناء</h1>
          <p style={{ color: "#9ca3af", fontSize: 14, margin: 0 }}>ابحث عن منتجات أو موردين</p>
        </div>
      </div>
      <div style={{ maxWidth: 820, margin: "0 auto 32px", padding: "24px 24px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        {}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", background: "white", borderRadius: 8, padding: "11px 16px", gap: 10, border: "1px solid #EDE3D8" }}>
            <Search size={17} color="#9ca3af" />
            <input
              type="text"
              placeholder="ابحث عن منتج أو مورد..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: "none", outline: "none", flex: 1, fontSize: 14, background: "transparent", textAlign: "right", color: "#374151" }}
            />
            {search && (
              <button onClick={clearSearch} style={{ border: "none", background: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                <X size={15} color="#9ca3af" />
              </button>
            )}
          </div>
          {mode === "companies" && (
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              style={{ background: "white", border: "1px solid #EDE3D8", borderRadius: 8, padding: "11px 14px", fontSize: 13, color: "#374151", cursor: "pointer", outline: "none", fontFamily: "inherit" }}
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          )}
        </div>
        {}
        <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 2, scrollbarWidth: "none" }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: "6px 16px", borderRadius: 999, border: "1px solid",
                cursor: "pointer", fontSize: 12.5, fontWeight: 600,
                whiteSpace: "nowrap", flexShrink: 0, transition: "all 0.15s",
                background:   category === cat ? "#1B3A2D" : "white",
                color:        category === cat ? "white"   : "#6b7280",
                borderColor:  category === cat ? "#1B3A2D" : "#EDE3D8",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      {}
      {mode === "products" && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 70px 80px" }}>
          {}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div style={{ textAlign: "right" }}>
              {debouncedQ && <span style={{ fontSize: 13, color: "#9ca3af" }}>نتائج: "<strong style={{ color: "#111827" }}>{debouncedQ}</strong>"</span>}
              {!loadingProd && <span style={{ fontSize: 13, color: "#9ca3af", marginRight: 8 }}>{products.length} منتج</span>}
            </div>
            <button
              onClick={clearSearch}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: "7px 14px", cursor: "pointer", fontSize: 13, color: "#6b7280", fontWeight: 600 }}
            >
              <Package size={14} /> عرض الموردين
            </button>
          </div>
          {loadingProd ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
              {[1,2,3,4,5,6].map(i => <SkeletonProduct key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60 }}>
              <p style={{ fontSize: 16, fontWeight: 600, color: "#9ca3af" }}>لا توجد منتجات مطابقة</p>
              <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 8 }}>حاول البحث بكلمة مختلفة أو غيّر الفئة</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
              {products.map(p => (
                <ProductResultCard
                  key={p.id}
                  product={p}
                  isFav={favIds.has(p.id)}
                  onToggleFav={() => toggleFav(p.id)}
                  showFav={!!token && user?.role === "client"}
                  onCompanyClick={() => navigate(`/companies/${p.Company?.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      )}
      {}
      {mode === "companies" && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 70px 80px" }}>
          {!loadingCo && filteredCompanies.length > 0 && (
            <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "right", marginBottom: 16 }}>{filteredCompanies.length} مورد</p>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {loadingCo ? (
              [1,2,3].map(i => <SkeletonCard key={i} />)
            ) : filteredCompanies.length === 0 ? (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60 }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: "#9ca3af" }}>لا يوجد موردون مسجّلون بعد</p>
              </div>
            ) : (
              filteredCompanies.map(c => (
                <SupplierCard key={c.id} company={c} onClick={() => navigate(`/companies/${c.id}`)} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
function ProductResultCard({ product, onCompanyClick, isFav, onToggleFav, showFav }) {
  const imgSrc = product.imageUrl
    ? (product.imageUrl.startsWith("http") ? product.imageUrl : `${product.imageUrl}`)
    : "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80";
  const companyImg = product.Company?.coverPhoto
    ? `${product.Company.coverPhoto}`
    : null;
  return (
    <div style={{ background: "white", borderRadius: 8, overflow: "hidden", border: "1px solid #EDE3D8", transition: "border-color 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "#C4956A"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "#EDE3D8"; }}
    >
      {}
      <div style={{ height: 160, overflow: "hidden", position: "relative" }}>
        <img src={imgSrc} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        {product.category && (
          <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)", color: "white", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, display: "flex", alignItems: "center", gap: 4 }}>
            <Tag size={10} /> {product.category}
          </div>
        )}
        {showFav && (
          <button onClick={e => { e.stopPropagation(); onToggleFav(); }}
            style={{ position: "absolute", top: 10, left: 10, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
            <Heart size={15} color={isFav ? "#ef4444" : "#9ca3af"} fill={isFav ? "#ef4444" : "none"} />
          </button>
        )}
      </div>
      <div style={{ padding: "14px 16px" }}>
        {}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div style={{ flexShrink: 0, textAlign: "left" }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: "#C4956A", lineHeight: 1 }}>
              {Number(product.price).toLocaleString("ar-SA")}
            </span>
            <span style={{ fontSize: 11, color: "#9ca3af", marginRight: 3 }}>﷼ / {product.unit || "وحدة"}</span>
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: "#111827", textAlign: "right" }}>{product.name}</h3>
        </div>
        {product.description && (
          <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 12px", lineHeight: 1.6, textAlign: "right", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {product.description}
          </p>
        )}
        {}
        {product.Company && (
          <button
            onClick={onCompanyClick}
            style={{ width: "100%", background: "#f9fafb", border: "1px solid #f0f0f0", borderRadius: 12, padding: "10px 12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#F0E4D0"}
            onMouseLeave={e => e.currentTarget.style.background = "#f9fafb"}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, textAlign: "right" }}>
              {companyImg && (
                <img src={companyImg} alt="" style={{ width: 34, height: 34, borderRadius: 10, objectFit: "cover", border: "1px solid #f0f0f0" }} />
              )}
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", margin: 0 }}>{product.Company.ownerName}</p>
                {product.Company.city && (
                  <p style={{ fontSize: 11, color: "#9ca3af", margin: 0, display: "flex", alignItems: "center", gap: 3 }}>
                    <MapPin size={10} color="#9ca3af" /> {product.Company.city}
                  </p>
                )}
              </div>
            </div>
            <span style={{ fontSize: 11, color: "#C4956A", fontWeight: 700, background: "#F0E4D0", padding: "2px 8px", borderRadius: 999, flexShrink: 0 }}>عرض المتجر</span>
          </button>
        )}
      </div>
    </div>
  );
}
function SupplierCard({ company, onClick }) {
  const coverImg = company.coverPhoto
    ? `${company.coverPhoto}`
    : "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&q=80";
  return (
    <div
      onClick={onClick}
      style={{ background: "white", borderRadius: 4, overflow: "hidden", border: "1px solid #E8DDD0", cursor: "pointer", transition: "transform 0.2s, border-color 0.2s", borderBottom: "3px solid transparent" }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderBottomColor = "#C4956A"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.borderBottomColor = "transparent"; }}
    >
      <div style={{ height: 190, overflow: "hidden", position: "relative" }}>
        <img src={coverImg} alt={company.ownerName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.38) 0%, transparent 55%)" }} />
        {company.rating > 0 && (
          <div style={{ position: "absolute", top: 12, right: 12, display: "flex", alignItems: "center", gap: 4, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", color: "white", fontSize: 12, fontWeight: 700, padding: "4px 10px", borderRadius: 999 }}>
            <Star size={11} fill="white" color="white" /> {Number(company.rating).toFixed(1)}
          </div>
        )}
      </div>
      <div style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <h3 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: "#111827" }}>{company.ownerName}</h3>
          <span style={{ background: "#F0E4D0", color: "#C4956A", fontSize: 11, fontWeight: 700, padding: "3px 11px", borderRadius: 999 }}>مواد بناء</span>
        </div>
        <p style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.75, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {company.description || "مورد مواد بناء معتمد في المملكة العربية السعودية"}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 14, fontSize: 12, color: "#9ca3af", borderTop: "1px solid #f3f4f6", paddingTop: 12 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={12} color="#C4956A" /> {company.city || "الرياض"}
          </span>
          {company.projectsCount > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Briefcase size={12} color="#C4956A" /> {company.projectsCount} طلب
            </span>
          )}
        </div>
      </div>
      <span style={{ display: "block", textAlign: "center", background: "#1B3A2D", color: "white", fontSize: 13, fontWeight: 800, padding: "11px 0", borderRadius: 8, margin: "0 20px 20px" }}>
        عرض
      </span>
    </div>
  );
}
function SkeletonProduct() {
  return (
    <div style={{ background: "white", borderRadius: 8, overflow: "hidden", border: "1px solid #EDE3D8" }}>
      <div style={{ height: 160, background: "#f3f4f6" }} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ height: 14, background: "#f3f4f6", borderRadius: 6, marginBottom: 8, width: "70%" }} />
        <div style={{ height: 10, background: "#f3f4f6", borderRadius: 6, marginBottom: 6 }} />
        <div style={{ height: 10, background: "#f3f4f6", borderRadius: 6, width: "50%" }} />
      </div>
    </div>
  );
}
function SkeletonCard() {
  return (
    <div style={{ background: "white", borderRadius: 4, overflow: "hidden", border: "1px solid #E8DDD0" }}>
      <div style={{ height: 190, background: "#f3f4f6" }} />
      <div style={{ padding: "18px 20px" }}>
        <div style={{ height: 16, background: "#f3f4f6", borderRadius: 4, marginBottom: 10, width: "60%" }} />
        <div style={{ height: 12, background: "#f3f4f6", borderRadius: 4, marginBottom: 6 }} />
        <div style={{ height: 12, background: "#f3f4f6", borderRadius: 4, width: "80%" }} />
      </div>
    </div>
  );
}