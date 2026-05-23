import React, { useState, useEffect } from "react";
import { Heart, MapPin, Tag, ExternalLink, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
export default function Favorites() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetch("/api/favorites", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.data) setProducts(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);
  const handleRemove = async (productId) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    await fetch("/api/favorites/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ productId })
    });
  };
  return (
    <div style={{ background: "#FAF7F0", minHeight: "100vh", direction: "rtl" }}>
      {}
      <div style={{ background: "white", borderBottom: "1px solid #f0e8df", padding: "36px 48px 28px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, background: "linear-gradient(135deg,#A67C52,#C4956A)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(196,149,106,0.3)" }}>
              <Heart size={22} color="white" fill="white" />
            </div>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, color: "#111827" }}>مفضلاتي</h1>
              <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>المنتجات التي حفظتها من موردي مواد البناء</p>
            </div>
          </div>
          {!loading && products.length > 0 && (
            <span style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>{products.length} منتج محفوظ</span>
          )}
        </div>
      </div>
      {}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "32px 48px 80px" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 20 }}>
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <EmptyState onBrowse={() => navigate("/materials")} />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 20 }}>
            {products.map(p => (
              <FavCard key={p.id} product={p} onRemove={handleRemove} onCompanyClick={() => navigate(`/companies/${p.Company?.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
function FavCard({ product, onRemove, onCompanyClick }) {
  const [removing, setRemoving] = useState(false);
  const imgSrc = product.imageUrl
    ? (product.imageUrl.startsWith("http") ? product.imageUrl : `${product.imageUrl}`)
    : null;
  const companyImg = product.Company?.coverPhoto ? `${product.Company.coverPhoto}` : null;
  const handleRemove = async () => {
    setRemoving(true);
    await onRemove(product.id);
  };
  return (
    <div style={{ background: "white", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 14px rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.04)", transition: "transform 0.15s, box-shadow 0.15s", opacity: removing ? 0.4 : 1 }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.09)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 14px rgba(0,0,0,0.06)"; }}>
      {}
      <div style={{ height: 170, background: imgSrc ? "transparent" : "#f9fafb", overflow: "hidden", position: "relative" }}>
        {imgSrc
          ? <img src={imgSrc} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><Package size={42} color="#e5e7eb" /></div>
        }
        {}
        <button onClick={handleRemove} disabled={removing}
          title="إزالة من المفضلة"
          style={{ position: "absolute", top: 10, left: 10, width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.95)", border: "none", cursor: removing ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
          <Heart size={14} color="#ef4444" fill="#ef4444" />
        </button>
        {}
        {product.category && (
          <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(17,24,39,0.55)", backdropFilter: "blur(4px)", color: "white", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, display: "flex", alignItems: "center", gap: 4 }}>
            <Tag size={9} /> {product.category}
          </div>
        )}
      </div>
      {}
      <div style={{ padding: "16px 18px" }}>
        {}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0, color: "#111827", textAlign: "right", flex: 1, marginLeft: 8 }}>{product.name}</h3>
          <div style={{ textAlign: "left", flexShrink: 0 }}>
            <span style={{ fontSize: 19, fontWeight: 900, color: "#C4956A" }}>{Number(product.price).toLocaleString("ar-SA")}</span>
            <span style={{ fontSize: 11, color: "#9ca3af", marginRight: 3 }}>﷼ / {product.unit || "وحدة"}</span>
          </div>
        </div>
        {}
        {product.description && (
          <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 14px", lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textAlign: "right" }}>
            {product.description}
          </p>
        )}
        {}
        {product.Company && (
          <button onClick={onCompanyClick}
            style={{ width: "100%", background: "#fafafa", border: "1px solid #f0f0f0", borderRadius: 13, padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}
            onMouseEnter={e => e.currentTarget.style.background="#fff1e8"} onMouseLeave={e => e.currentTarget.style.background="#fafafa"}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#C4956A", fontWeight: 700, fontSize: 12 }}>
              <ExternalLink size={11} /> عرض المتجر
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#374151", margin: 0 }}>{product.Company.ownerName}</p>
                {product.Company.city && (
                  <p style={{ fontSize: 11, color: "#9ca3af", margin: 0, display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}>
                    <MapPin size={9} /> {product.Company.city}
                  </p>
                )}
              </div>
              {companyImg
                ? <img src={companyImg} alt="" style={{ width: 34, height: 34, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} />
                : <div style={{ width: 34, height: 34, borderRadius: 10, background: "#fff1e8", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Package size={14} color="#C4956A" /></div>
              }
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
function EmptyState({ onBrowse }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px", color: "#9ca3af" }}>
      <div style={{ width: 80, height: 80, background: "#fff1e8", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        <Heart size={36} color="#C4956A" style={{ opacity: 0.4 }} />
      </div>
      <p style={{ fontSize: 18, fontWeight: 800, color: "#374151", marginBottom: 8 }}>لا توجد منتجات محفوظة</p>
      <p style={{ fontSize: 13, marginBottom: 28 }}>تصفّح مواد البناء وأضف ما يعجبك للمفضلة</p>
      <button onClick={onBrowse}
        style={{ background: "linear-gradient(135deg,#A67C52,#C4956A)", color: "white", border: "none", borderRadius: 14, padding: "13px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 18px rgba(196,149,106,0.35)" }}>
        تصفح مواد البناء
      </button>
    </div>
  );
}
function SkeletonCard() {
  return (
    <div style={{ background: "white", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(0,0,0,0.04)" }}>
      <div style={{ height: 170, background: "linear-gradient(90deg,#f3f4f6 25%,#e9eaec 50%,#f3f4f6 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
      <div style={{ padding: "16px 18px" }}>
        <div style={{ height: 14, background: "#f3f4f6", borderRadius: 6, marginBottom: 10, width: "55%" }} />
        <div style={{ height: 10, background: "#f3f4f6", borderRadius: 6, marginBottom: 6 }} />
        <div style={{ height: 10, background: "#f3f4f6", borderRadius: 6, width: "35%" }} />
      </div>
    </div>
  );
}