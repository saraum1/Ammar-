import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin, Star, Phone, Mail, ChevronRight, Briefcase,
  Send, X, Package, ShoppingCart, Plus, Minus, Search,
  SortAsc, Filter, ChevronDown, Heart
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
const TYPE_LABEL = {
  full_construction:    "مكتب هندسي",
  partial_construction: "شركة مقاولات",
  materials_supplier:   "مورد مواد بناء"
};
const COVERS = {
  full_construction:    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80",
  partial_construction: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80",
  materials_supplier:   "https://images.unsplash.com/photo-1590496793929-36417d3117de?w=1200&q=80",
};
const FALLBACK  = "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80";
const PROJ_TYPES = ["فيلا", "شقة", "عمارة", "مجمع سكني", "مبنى تجاري"];
const CATEGORIES = ["الكل", "اسمنت", "حديد", "خشب", "بلاط", "دهانات", "كهربائيات", "سباكة", "عزل", "رخام"];
function bcLink(type) {
  if (type === "materials_supplier") return { to: "/materials",   label: "مواد البناء" };
  if (type === "full_construction")  return { to: "/engineering", label: "الشركات الهندسية" };
  return { to: "/contracting", label: "شركات المقاولات" };
}
export default function CompanyDetail() {
  const { id }          = useParams();
  const { token, user } = useAuth();
  const [company,   setCompany]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [showReq,   setShowReq]   = useState(false);
  const [reqForm,   setReqForm]   = useState({ projectType: "فيلا", location: "", budget: "", message: "" });
  const [reqError,  setReqError]  = useState("");
  const [reqSent,   setReqSent]   = useState(false);
  const [sending,   setSending]   = useState(false);
  const [products,  setProducts]  = useState([]);
  const [prodSearch,setProdSearch]= useState("");
  const [prodCat,   setProdCat]   = useState("الكل");
  const [cart,      setCart]      = useState({});
  const [showOrder, setShowOrder] = useState(false);
  const [orderAddr, setOrderAddr] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [ordering,  setOrdering]  = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [orderErr,  setOrderErr]  = useState("");
  const [portfolio, setPortfolio] = useState([]);
  const [reviews,   setReviews]   = useState([]);
  const [sortRev,   setSortRev]   = useState("newest");
  const [myRating,  setMyRating]  = useState(0);
  const [myComment, setMyComment] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [reviewMsg, setReviewMsg] = useState("");
  const [favIds,    setFavIds]    = useState(new Set());
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`/api/companies/${id}`);
        const data = await res.json();
        if (!res.ok) return setError(data.message || "حدث خطأ");
        setCompany(data.data);
        if (data.data.type === "materials_supplier") {
          const pr = await fetch(`/api/products/company/${id}`);
          const pd = await pr.json();
          if (Array.isArray(pd)) setProducts(pd);
        }
        const rr = await fetch(`/api/reviews/company/${id}`);
        const rd = await rr.json();
        if (Array.isArray(rd)) setReviews(rd);
        const pr2 = await fetch(`/api/portfolio/company/${id}`);
        const pd2 = await pr2.json();
        if (pd2.data) setPortfolio(pd2.data);
      } catch { setError("تعذر الاتصال بالسيرفر"); }
      finally   { setLoading(false); }
    })();
  }, [id]);

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
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF7F0" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🏗️</div>
        <p style={{ color: "#9ca3af", fontSize: 15 }}>جاري التحميل...</p>
      </div>
    </div>
  );
  if (error || !company) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FAF7F0" }} dir="rtl">
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#ef4444", marginBottom: 16 }}>{error || "الشركة غير موجودة"}</p>
        <Link to="/" style={{ color: "#C4956A", fontWeight: 700 }}>← الرئيسية</Link>
      </div>
    </div>
  );
  const bc         = bcLink(company.type);
  const cu         = company.User || {};
  const coverImg   = company.coverPhoto ? `${company.coverPhoto}` : (COVERS[company.type] || FALLBACK);
  const specs      = Array.isArray(company.specializations) ? company.specializations : [];
  const cartCount  = Object.values(cart).reduce((a, q) => a + q, 0);
  const cartTotal  = products.reduce((s, p) => s + (cart[p.id] || 0) * p.price, 0);
  const avgRating  = company.rating > 0 ? Number(company.rating).toFixed(1) : null;
  const filteredProds = products.filter(p => {
    const matchSearch = !prodSearch || p.name?.includes(prodSearch) || p.description?.includes(prodSearch) || p.category?.includes(prodSearch);
    const matchCat    = prodCat === "الكل" || p.category === prodCat;
    return matchSearch && matchCat;
  });
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortRev === "highest") return b.rating - a.rating;
    if (sortRev === "lowest")  return a.rating - b.rating;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  const handleSendRequest = async () => {
    if (!reqForm.location.trim()) { setReqError("الموقع مطلوب"); return; }
    setSending(true); setReqError("");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ companyId: id, ...reqForm })
      });
      const data = await res.json();
      if (!res.ok) { setReqError(data.message || "حدث خطأ"); return; }
      setReqSent(true);
      setTimeout(() => { setShowReq(false); setReqSent(false); }, 2500);
    } catch { setReqError("تعذر الاتصال"); }
    finally { setSending(false); }
  };
  const addToCart    = (pid) => setCart(p => ({ ...p, [pid]: (p[pid] || 0) + 1 }));
  const removeFromCart = (pid) => setCart(p => {
    const n = { ...p };
    if ((n[pid] || 0) > 1) n[pid]--; else delete n[pid];
    return n;
  });
  const handleOrder = async () => {
    if (!orderAddr.trim()) { setOrderErr("العنوان مطلوب"); return; }
    setOrdering(true); setOrderErr("");
    try {
      const items = Object.entries(cart).map(([pid, qty]) => ({ productId: Number(pid), qty }));
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ companyId: id, items, address: orderAddr, notes: orderNote || null })
      });
      const d = await res.json();
      if (!res.ok) { setOrderErr(d.message || "حدث خطأ"); return; }
      setOrderDone(true); setCart({});
      setTimeout(() => { setShowOrder(false); setOrderDone(false); setOrderAddr(""); setOrderNote(""); }, 2500);
    } catch { setOrderErr("تعذر الاتصال"); }
    finally { setOrdering(false); }
  };
  const handleReview = async () => {
    if (!myRating) return;
    setReviewing(true); setReviewMsg("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ companyId: id, rating: myRating, comment: myComment || null })
      });
      const d = await res.json();
      if (res.status === 409) { setReviewMsg("قيّمت هذه الشركة مسبقاً ✓"); return; }
      if (!res.ok)            { setReviewMsg(d.message || "حدث خطأ"); return; }
      setReviewMsg("تم إرسال تقييمك! شكراً 🌟");
      setMyRating(0); setMyComment("");
      const rr = await fetch(`/api/reviews/company/${id}`);
      const rd = await rr.json();
      if (Array.isArray(rd)) setReviews(rd);
    } catch { setReviewMsg("تعذر الاتصال"); }
    finally { setReviewing(false); }
  };
  if (company.type === "materials_supplier") {
    return (
      <div style={{ minHeight: "100vh", background: "#FAF7F0" }} dir="rtl">
        {}
        <div style={{ background: "white", borderBottom: "1px solid #f0e8df", padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#9ca3af" }}>
            <Link to={bc.to} style={{ color: "#C4956A", fontWeight: 700, textDecoration: "none" }}>{bc.label}</Link>
            <ChevronRight size={13} />
            <span style={{ color: "#374151" }}>{company.ownerName}</span>
          </div>
          {cartCount > 0 && token && user?.role === "client" && (
            <button
              onClick={() => setShowOrder(true)}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "#C4956A", color: "white", border: "none", borderRadius: 12, padding: "9px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", boxShadow: "0 3px 12px rgba(196,149,106,0.4)" }}
            >
              <ShoppingCart size={16} />
              السلة ({cartCount}) — {cartTotal.toLocaleString()} ر.س
            </button>
          )}
        </div>
        {}
        <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
          <img src={coverImg} alt={company.ownerName} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.src = FALLBACK; }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.05) 60%, transparent 100%)" }} />
          <div style={{ position: "absolute", bottom: 20, right: 24, left: 24, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-start", marginBottom: 6 }}>
                <span style={{ background: "#C4956A", color: "white", fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 999 }}>مورد مواد بناء</span>
                {avgRating && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(4px)", color: "white", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>
                    <Star size={11} fill="white" color="white" /> {avgRating}
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 900, color: "white", margin: 0, textShadow: "0 2px 8px rgba(0,0,0,0.3)", textAlign: "right" }}>{company.ownerName}</h1>
              <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, margin: "4px 0 0", display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-start" }}>
                <MapPin size={12} /> {company.city || "الرياض"}
                {company.projectsCount > 0 && <> · <Briefcase size={12} /> {company.projectsCount} طلب</>}
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {cu.phone && (
                <a href={`tel:${cu.phone}`} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)", color: "white", borderRadius: 10, padding: "6px 14px", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                  <Phone size={13} /> {cu.phone}
                </a>
              )}
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px 80px" }}>
          {}
          <div style={{ background: "white", borderRadius: 18, padding: "16px 20px", marginBottom: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", background: "#f9fafb", borderRadius: 12, padding: "10px 16px", gap: 10, border: "1.5px solid #f0e8e0" }}>
              <Search size={16} color="#9ca3af" />
              <input
                value={prodSearch}
                onChange={e => setProdSearch(e.target.value)}
                placeholder="ابحث في المنتجات..."
                style={{ border: "none", outline: "none", flex: 1, fontSize: 14, background: "transparent", textAlign: "right", color: "#374151" }}
              />
              {prodSearch && (
                <button onClick={() => setProdSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 2 }}>
                  <X size={14} />
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-start" }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setProdCat(cat)}
                  style={{
                    padding: "6px 16px", borderRadius: 999, border: "none", cursor: "pointer",
                    fontSize: 13, fontWeight: 600, transition: "all 0.15s",
                    background: prodCat === cat ? "#C4956A" : "#f3f4f6",
                    color:      prodCat === cat ? "white"   : "#6b7280",
                    boxShadow:  prodCat === cat ? "0 3px 10px rgba(196,149,106,0.35)" : "none"
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          {}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, padding: "0 4px" }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, color: "#111827" }}>
              {prodCat === "الكل" ? "جميع المنتجات" : prodCat}
            </h2>
            <span style={{ fontSize: 13, color: "#9ca3af" }}>{filteredProds.length} منتج</span>
          </div>
          {}
          {filteredProds.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af", background: "white", borderRadius: 20 }}>
              <Package size={48} style={{ margin: "0 auto 16px", opacity: 0.2 }} />
              <p style={{ fontSize: 15, fontWeight: 600 }}>{prodSearch ? `لا توجد نتائج لـ "${prodSearch}"` : "لا توجد منتجات في هذه الفئة"}</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
              {filteredProds.map(p => (
                <ProductCard key={p.id} product={p} qty={cart[p.id] || 0} onAdd={() => addToCart(p.id)} onRemove={() => removeFromCart(p.id)} isClient={!!(token && user?.role === "client")} isFav={favIds.has(p.id)} onToggleFav={() => toggleFav(p.id)} />
              ))}
            </div>
          )}
          {}
          {portfolio.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, margin: "0 0 16px", textAlign: "right", color: "#111827" }}>أعمالنا السابقة</h2>
              <PortfolioGrid items={portfolio} />
            </div>
          )}
          {}
          <div style={{ marginTop: 32, background: "white", borderRadius: 20, padding: "24px 26px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
            <ReviewSection reviews={sortedReviews} sortRev={sortRev} setSortRev={setSortRev} myRating={myRating} setMyRating={setMyRating} myComment={myComment} setMyComment={setMyComment} handleReview={handleReview} reviewing={reviewing} reviewMsg={reviewMsg} showForm={!!(token && user?.role === "client")} />
          </div>
        </div>
        <OrderModal show={showOrder} onClose={() => setShowOrder(false)} products={products} cart={cart} cartTotal={cartTotal} orderAddr={orderAddr} setOrderAddr={setOrderAddr} orderNote={orderNote} setOrderNote={setOrderNote} handleOrder={handleOrder} ordering={ordering} orderDone={orderDone} orderErr={orderErr} />
      </div>
    );
  }
  return (
    <div style={{ minHeight: "100vh", background: "#FAF7F0" }} dir="rtl">
      {}
      <div style={{ position: "relative", height: 260, overflow: "hidden" }}>
        <img src={coverImg} alt={company.ownerName} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.src = FALLBACK; }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.08) 50%, transparent 100%)" }} />
        <div style={{ position: "absolute", top: 18, right: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <Link to={bc.to} style={{ color: "rgba(255,255,255,0.9)", fontWeight: 600, textDecoration: "none", background: "rgba(0,0,0,0.28)", padding: "4px 12px", borderRadius: 999, backdropFilter: "blur(4px)" }}>{bc.label}</Link>
            <ChevronRight size={13} color="rgba(255,255,255,0.55)" />
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{company.ownerName}</span>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 22, right: 24, left: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-start", marginBottom: 7 }}>
            <span style={{ background: "#C4956A", color: "white", fontSize: 11, fontWeight: 700, padding: "3px 13px", borderRadius: 999 }}>{TYPE_LABEL[company.type]}</span>
            {avgRating && (
              <span style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)", color: "white", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.22)" }}>
                <Star size={11} fill="white" color="white" /> {avgRating}
              </span>
            )}
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "white", margin: 0, textShadow: "0 2px 8px rgba(0,0,0,0.35)", textAlign: "right" }}>{company.ownerName}</h1>
        </div>
      </div>
      <div style={{ maxWidth: 740, margin: "0 auto", padding: "22px 18px 90px" }}>
        {}
        <div style={{ background: "white", borderRadius: 18, padding: "14px 20px", marginBottom: 16, boxShadow: "0 4px 14px rgba(0,0,0,0.06)", display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-start" }}>
          <Chip icon={<MapPin size={13} color="#C4956A" />} label={company.city || "الرياض"} />
          {company.projectsCount > 0 && <Chip icon={<Briefcase size={13} color="#C4956A" />} label={`${company.projectsCount} مشروع`} />}
          {reviews.length > 0 && <Chip icon={<Star size={13} color="#C4956A" />} label={`${reviews.length} تقييم`} />}
          {avgRating && <Chip icon={<Star size={13} color="#C4956A" fill="#C4956A" />} label={`${avgRating} / 5`} highlight />}
        </div>
        {}
        {company.description && (
          <InfoCard title="عن الشركة" icon="🏢" mb={14}>
            <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 2, margin: 0 }}>{company.description}</p>
          </InfoCard>
        )}
        {}
        {specs.length > 0 && (
          <InfoCard title="التخصصات" icon="⚙️" mb={14}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "flex-start" }}>
              {specs.map((s, i) => (
                <span key={i} style={{ background: "#F0E4D0", color: "#C4956A", fontSize: 13, padding: "5px 15px", borderRadius: 999, fontWeight: 600, border: "1px solid #fde8d4" }}>{s}</span>
              ))}
            </div>
          </InfoCard>
        )}
        {}
        {portfolio.length > 0 && (
          <InfoCard title="أعمالنا السابقة" icon="🏗️" mb={14}>
            <PortfolioGrid items={portfolio} />
          </InfoCard>
        )}
        {}
        <InfoCard title="التواصل" icon="📞" mb={14}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {cu.phone && (
              <a href={`tel:${cu.phone}`} style={contactRow}>
                <div style={{ flex: 1, textAlign: "right" }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#111827" }}>{cu.phone}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>اتصال مباشر</p>
                </div>
                <div style={{ ...iconBox, background: "#C4956A" }}><Phone size={16} color="white" /></div>
              </a>
            )}
            {cu.email && (
              <a href={`mailto:${cu.email}`} style={contactRow}>
                <div style={{ flex: 1, textAlign: "right" }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#111827" }}>{cu.email}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>البريد الإلكتروني</p>
                </div>
                <div style={{ ...iconBox, background: "#6366f1" }}><Mail size={16} color="white" /></div>
              </a>
            )}
          </div>
        </InfoCard>
        {}
        {token && user?.role === "client" ? (
          <button
            onClick={() => setShowReq(true)}
            style={{ width: "100%", background: "linear-gradient(135deg,#A67C52,#C4956A)", color: "white", border: "none", borderRadius: 16, padding: "17px 0", fontWeight: 900, fontSize: 16, cursor: "pointer", boxShadow: "0 8px 22px rgba(196,149,106,0.42)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 18, transition: "transform 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = ""}
          >
            <Send size={18} /> أرسل طلبك لهذه الشركة
          </button>
        ) : !token ? (
          <Link to="/login" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "linear-gradient(135deg,#A67C52,#C4956A)", color: "white", borderRadius: 16, padding: "17px 0", fontWeight: 900, fontSize: 16, textDecoration: "none", boxShadow: "0 8px 22px rgba(196,149,106,0.42)", marginBottom: 18 }}>
            <Send size={18} /> سجّل دخولك لإرسال طلب
          </Link>
        ) : null}
        {}
        <InfoCard title="التقييمات" icon="⭐" titleExtra={reviews.length > 0 && <span style={{ fontSize: 12, color: "#9ca3af" }}>({reviews.length})</span>}>
          <ReviewSection reviews={sortedReviews} sortRev={sortRev} setSortRev={setSortRev} myRating={myRating} setMyRating={setMyRating} myComment={myComment} setMyComment={setMyComment} handleReview={handleReview} reviewing={reviewing} reviewMsg={reviewMsg} showForm={!!(token && user?.role === "client")} />
        </InfoCard>
      </div>
      {}
      <RequestModal show={showReq} onClose={() => setShowReq(false)} company={company} reqForm={reqForm} setReqForm={setReqForm} reqError={reqError} reqSent={reqSent} handleSend={handleSendRequest} sending={sending} />
    </div>
  );
}
function ProductCard({ product: p, qty, onAdd, onRemove, isClient, isFav, onToggleFav }) {
  return (
    <div style={{ background: "white", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", border: "1px solid #f0e8df", display: "flex", flexDirection: "column", transition: "box-shadow 0.2s" }}>
      <div style={{ position: "relative" }}>
        {p.imageUrl ? (
          <img src={p.imageUrl} alt={p.name} style={{ width: "100%", height: 130, objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: 130, background: "linear-gradient(135deg,#F0E4D0,#fde8d4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Package size={36} color="#e8d5c4" />
          </div>
        )}
        {isClient && (
          <button
            onClick={onToggleFav}
            style={{ position: "absolute", top: 8, left: 8, width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 6px rgba(0,0,0,0.12)" }}
          >
            <Heart size={13} color={isFav ? "#ef4444" : "#9ca3af"} fill={isFav ? "#ef4444" : "none"} />
          </button>
        )}
      </div>
      <div style={{ padding: "12px 14px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <p style={{ fontWeight: 800, fontSize: 14, margin: 0, textAlign: "right", color: "#111827", lineHeight: 1.4 }}>{p.name}</p>
        {p.category && (
          <span style={{ fontSize: 11, background: "#F0E4D0", color: "#C4956A", padding: "2px 9px", borderRadius: 999, fontWeight: 600, alignSelf: "flex-end" }}>{p.category}</span>
        )}
        {p.description && (
          <p style={{ fontSize: 12, color: "#9ca3af", margin: 0, textAlign: "right", lineHeight: 1.5, flex: 1 }}>
            {p.description.length > 55 ? p.description.slice(0, 55) + "…" : p.description}
          </p>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 8, borderTop: "1px solid #f3f4f6" }}>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <span style={{ fontWeight: 900, fontSize: 15, color: "#C4956A" }}>{p.price}</span>
            <span style={{ fontSize: 11, color: "#9ca3af" }}> ر.س/{p.unit}</span>
          </div>
          {isClient ? (
            qty > 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button onClick={onRemove} style={cBtn}><Minus size={11} /></button>
                <span style={{ fontWeight: 800, fontSize: 14, minWidth: 20, textAlign: "center" }}>{qty}</span>
                <button onClick={onAdd}    style={cBtn}><Plus  size={11} /></button>
              </div>
            ) : (
              <button onClick={onAdd} style={{ background: "#C4956A", color: "white", border: "none", borderRadius: 9, padding: "6px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>+ أضف</button>
            )
          ) : <span />}
        </div>
      </div>
    </div>
  );
}
function ReviewSection({ reviews, sortRev, setSortRev, myRating, setMyRating, myComment, setMyComment, handleReview, reviewing, reviewMsg, showForm }) {
  return (
    <>
      {}
      {reviews.length > 0 && (
        <div style={{ display: "flex", gap: 6, justifyContent: "flex-start", marginBottom: 16 }}>
          {[["newest","الأحدث"],["highest","الأعلى تقييماً"],["lowest","الأقل تقييماً"]].map(([val, lbl]) => (
            <button key={val} onClick={() => setSortRev(val)} style={{ padding: "5px 14px", borderRadius: 999, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: sortRev === val ? "#C4956A" : "#f3f4f6", color: sortRev === val ? "white" : "#6b7280", transition: "all 0.15s" }}>{lbl}</button>
          ))}
        </div>
      )}
      {}
      {showForm && (
        <div style={{ background: "#f9fafb", borderRadius: 14, padding: "16px 18px", marginBottom: 18, border: "1px solid #f0e8e0" }}>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, textAlign: "right", color: "#374151" }}>أضف تقييمك</p>
          <div style={{ display: "flex", gap: 3, justifyContent: "flex-end", marginBottom: 10 }}>
            {[1,2,3,4,5].map(s => (
              <button key={s} onClick={() => setMyRating(s)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 24, padding: 1, transition: "transform 0.1s", transform: s <= myRating ? "scale(1.25)" : "scale(1)", filter: s <= myRating ? "none" : "grayscale(1) opacity(0.3)" }}>⭐</button>
            ))}
          </div>
          <textarea value={myComment} onChange={e => setMyComment(e.target.value)} placeholder="اكتب رأيك..." rows={2} style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "9px 12px", fontSize: 13, outline: "none", textAlign: "right", resize: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 10, background: "white" }} />
          {reviewMsg && <p style={{ fontSize: 13, color: reviewMsg.includes("مسبقاً") ? "#C4956A" : "#16a34a", textAlign: "right", marginBottom: 8 }}>{reviewMsg}</p>}
          <button onClick={handleReview} disabled={!myRating || reviewing} style={{ background: "#C4956A", color: "white", border: "none", borderRadius: 10, padding: "9px 22px", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: (!myRating || reviewing) ? 0.5 : 1 }}>
            {reviewing ? "جاري الإرسال..." : "نشر التقييم"}
          </button>
        </div>
      )}
      {}
      {reviews.length === 0 ? (
        <div style={{ textAlign: "center", padding: "28px 0", color: "#9ca3af" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>⭐</div>
          <p style={{ fontSize: 14 }}>لا توجد تقييمات بعد</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {reviews.map(rv => (
            <div key={rv.id} style={{ background: "#f9fafb", borderRadius: 14, padding: "14px 18px", border: "1px solid #f0e8e0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: 2 }}>
                  {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 13, filter: s <= rv.rating ? "none" : "grayscale(1) opacity(0.3)" }}>⭐</span>)}
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: "0 0 3px", fontWeight: 700, fontSize: 13, color: "#374151" }}>{rv.Client ? `${rv.Client.firstName} ${rv.Client.lastName}` : "عميل"}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#9ca3af" }}>{new Date(rv.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" })}</p>
                </div>
              </div>
              {rv.comment && <p style={{ fontSize: 13, color: "#6b7280", margin: "10px 0 0", textAlign: "right", lineHeight: 1.75, borderTop: "1px solid #e5e7eb", paddingTop: 10 }}>{rv.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
function RequestModal({ show, onClose, company, reqForm, setReqForm, reqError, reqSent, handleSend, sending }) {
  if (!show) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 20 }} onClick={onClose}>
      <div style={{ background: "white", width: "100%", maxWidth: 460, borderRadius: 22, padding: "28px 26px", position: "relative", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()} dir="rtl">
        <button onClick={onClose} style={{ position: "absolute", top: 14, left: 14, background: "#f3f4f6", border: "none", cursor: "pointer", borderRadius: 9, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} color="#6b7280" /></button>
        <h3 style={{ fontSize: 20, fontWeight: 900, margin: "0 0 4px" }}>إرسال طلب</h3>
        <p style={{ color: "#9ca3af", fontSize: 13, margin: "0 0 20px" }}>إلى: {company.ownerName}</p>
        {reqSent ? (
          <div style={{ textAlign: "center", padding: "28px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
            <p style={{ fontWeight: 800, fontSize: 17 }}>تم إرسال طلبك!</p>
            <p style={{ color: "#6b7280", fontSize: 13 }}>سيتم الرد عليك قريباً</p>
          </div>
        ) : (
          <>
            {reqError && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12, background: "#fef2f2", padding: "9px 12px", borderRadius: 9 }}>{reqError}</p>}
            {[{ label: "نوع المشروع", key: "projectType", type: "select" }, { label: "الموقع *", key: "location", placeholder: "حي النرجس، الرياض" }, { label: "الميزانية", key: "budget", placeholder: "500,000 ريال" }].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={lbl}>{f.label}</label>
                {f.type === "select" ? (
                  <select value={reqForm[f.key]} onChange={e => setReqForm({ ...reqForm, [f.key]: e.target.value })} style={inp}>{PROJ_TYPES.map(t => <option key={t}>{t}</option>)}</select>
                ) : (
                  <input value={reqForm[f.key]} onChange={e => setReqForm({ ...reqForm, [f.key]: e.target.value })} placeholder={f.placeholder} style={inp} />
                )}
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>رسالة إضافية</label>
              <textarea value={reqForm.message} onChange={e => setReqForm({ ...reqForm, message: e.target.value })} rows={3} style={{ ...inp, resize: "none" }} />
            </div>
            <button onClick={handleSend} disabled={sending} style={{ width: "100%", background: "linear-gradient(135deg,#A67C52,#C4956A)", color: "white", border: "none", borderRadius: 12, padding: 14, fontWeight: 800, fontSize: 15, cursor: "pointer", opacity: sending ? 0.6 : 1, boxShadow: "0 5px 15px rgba(196,149,106,0.35)" }}>
              {sending ? "جاري الإرسال..." : "إرسال الطلب ←"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
function OrderModal({ show, onClose, products, cart, cartTotal, orderAddr, setOrderAddr, orderNote, setOrderNote, handleOrder, ordering, orderDone, orderErr }) {
  if (!show) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, padding: 20 }} onClick={onClose}>
      <div style={{ background: "white", width: "100%", maxWidth: 460, borderRadius: 22, padding: "28px 26px", position: "relative", maxHeight: "90vh", overflowY: "auto" }} onClick={e => e.stopPropagation()} dir="rtl">
        <button onClick={onClose} style={{ position: "absolute", top: 14, left: 14, background: "#f3f4f6", border: "none", cursor: "pointer", borderRadius: 9, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}><X size={16} color="#6b7280" /></button>
        <h3 style={{ fontSize: 20, fontWeight: 900, marginBottom: 18 }}>إتمام الطلب</h3>
        {orderDone ? (
          <div style={{ textAlign: "center", padding: "28px 0" }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>✅</div>
            <p style={{ fontWeight: 800, fontSize: 17 }}>تم إرسال طلبك بنجاح!</p>
          </div>
        ) : (
          <>
            <div style={{ background: "#f9fafb", borderRadius: 14, padding: "14px 16px", marginBottom: 16, border: "1px solid #f0e8e0" }}>
              <p style={{ fontWeight: 800, fontSize: 13, marginBottom: 10, textAlign: "right" }}>ملخص الطلب</p>
              {products.filter(p => cart[p.id]).map(p => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span>{p.name} × {cart[p.id]}</span>
                  <span style={{ color: "#C4956A", fontWeight: 700 }}>{(cart[p.id] * p.price).toLocaleString()} ر.س</span>
                </div>
              ))}
              <div style={{ borderTop: "1.5px solid #e5e7eb", marginTop: 8, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700 }}>الإجمالي</span>
                <span style={{ color: "#C4956A", fontWeight: 900, fontSize: 16 }}>{cartTotal.toLocaleString()} ر.س</span>
              </div>
            </div>
            {orderErr && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 10, background: "#fef2f2", padding: "9px 12px", borderRadius: 9 }}>{orderErr}</p>}
            <div style={{ marginBottom: 12 }}>
              <label style={lbl}>عنوان التوصيل *</label>
              <input value={orderAddr} onChange={e => setOrderAddr(e.target.value)} placeholder="الحي، الشارع، رقم المبنى" style={inp} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>ملاحظات</label>
              <textarea value={orderNote} onChange={e => setOrderNote(e.target.value)} rows={2} style={{ ...inp, resize: "none" }} />
            </div>
            <button onClick={handleOrder} disabled={ordering} style={{ width: "100%", background: "linear-gradient(135deg,#A67C52,#C4956A)", color: "white", border: "none", borderRadius: 12, padding: 14, fontWeight: 800, fontSize: 15, cursor: "pointer", opacity: ordering ? 0.6 : 1, boxShadow: "0 5px 15px rgba(196,149,106,0.35)" }}>
              {ordering ? "جاري التأكيد..." : `تأكيد الطلب — ${cartTotal.toLocaleString()} ر.س`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
function InfoCard({ title, icon, mb = 0, titleExtra, children }) {
  return (
    <div style={{ background: "white", borderRadius: 18, padding: "18px 22px", marginBottom: mb, boxShadow: "0 3px 14px rgba(0,0,0,0.055)", border: "1px solid rgba(0,0,0,0.03)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 7, marginBottom: 14 }}>
        <span style={{ fontSize: 17 }}>{icon}</span>
        <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: "#111827" }}>{title}</h3>
        {titleExtra}
      </div>
      {children}
    </div>
  );
}
function Chip({ icon, label, highlight }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 999, background: highlight ? "#F0E4D0" : "#f9fafb", border: `1px solid ${highlight ? "#fde8d4" : "#f0f0f0"}`, fontSize: 13, fontWeight: 600, color: highlight ? "#C4956A" : "#374151" }}>
      {icon}<span>{label}</span>
    </div>
  );
}
function PortfolioGrid({ items }) {
  const [selected, setSelected] = React.useState(null);
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 14 }}>
        {items.map(item => {
          const imgSrc = item.image ? `${item.image}` : null;
          return (
            <div key={item.id}
              onClick={() => setSelected(item)}
              style={{ borderRadius: 16, overflow: "hidden", cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", background: "white", border: "1px solid rgba(0,0,0,0.04)", transition: "transform 0.15s, box-shadow 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 20px rgba(0,0,0,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 2px 10px rgba(0,0,0,0.06)"; }}>
              <div style={{ height: 130, background: imgSrc ? "transparent" : "#f9fafb", overflow: "hidden", position: "relative" }}>
                {imgSrc
                  ? <img src={imgSrc} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Briefcase size={32} color="#e5e7eb" />
                    </div>
                }
                {item.year && (
                  <span style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.55)", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>{item.year}</span>
                )}
              </div>
              <div style={{ padding: "10px 12px" }}>
                <p style={{ fontSize: 14, fontWeight: 800, margin: "0 0 4px", color: "#111827", textAlign: "right" }}>{item.title}</p>
                {item.category && <span style={{ fontSize: 11, background: "#F0E4D0", color: "#C4956A", padding: "2px 8px", borderRadius: 999, fontWeight: 600 }}>{item.category}</span>}
              </div>
            </div>
          );
        })}
      </div>
      {}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 22, overflow: "hidden", maxWidth: 560, width: "100%", direction: "rtl" }}>
            {selected.image && (
              <img src={`${selected.image}`} alt={selected.title} style={{ width: "100%", height: 280, objectFit: "cover" }} />
            )}
            <div style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {selected.category && <span style={{ fontSize: 12, background: "#F0E4D0", color: "#C4956A", padding: "3px 10px", borderRadius: 999, fontWeight: 600 }}>{selected.category}</span>}
                  {selected.year && <span style={{ fontSize: 12, background: "#f3f4f6", color: "#6b7280", padding: "3px 10px", borderRadius: 999, fontWeight: 600 }}>{selected.year}</span>}
                </div>
                <p style={{ fontSize: 18, fontWeight: 900, margin: 0, color: "#111827" }}>{selected.title}</p>
              </div>
              {selected.description && (
                <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.75, margin: "0 0 16px", textAlign: "right" }}>{selected.description}</p>
              )}
              <button onClick={() => setSelected(null)}
                style={{ width: "100%", background: "#f3f4f6", border: "none", borderRadius: 12, padding: "11px 0", fontWeight: 700, fontSize: 14, cursor: "pointer", color: "#374151" }}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
const lbl = { display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6, textAlign: "right" };
const inp = { width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "10px 13px", fontSize: 14, outline: "none", textAlign: "right", boxSizing: "border-box", fontFamily: "inherit", background: "#f9fafb", color: "#111827" };
const contactRow = { display: "flex", alignItems: "center", gap: 12, background: "#f9fafb", borderRadius: 12, padding: "12px 14px", textDecoration: "none", color: "#374151", border: "1px solid #f0e8e0" };
const iconBox    = { width: 40, height: 40, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 };
const cBtn       = { background: "#F0E4D0", border: "1px solid #fde8d4", borderRadius: 7, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#C4956A" };