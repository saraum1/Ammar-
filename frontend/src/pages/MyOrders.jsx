import React, { useState, useEffect } from "react";
import { ShoppingBag, Package, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const STATUS_INFO = {
  pending:   { label: "معلق",     bg: "#fef3c7", color: "#92400e" },
  confirmed: { label: "مؤكد",    bg: "#dbeafe", color: "#1d4ed8" },
  shipped:   { label: "جارٍ",    bg: "#fff3cd", color: "#b45309" },
  delivered: { label: "مُسلَّم", bg: "#dcfce7", color: "#166534" },
  cancelled: { label: "ملغى",    bg: "#fee2e2", color: "#991b1b" },
};

export default function MyOrders() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetch("/api/orders/my-orders", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setOrders(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div style={{ background: "#FAF7F0", minHeight: "100vh", direction: "rtl" }}>

      {/* Header */}
      <div style={{ background: "white", borderBottom: "1px solid #f0e8df", padding: "36px 48px 28px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, background: "linear-gradient(135deg,#A67C52,#C4956A)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(196,149,106,0.3)" }}>
            <ShoppingBag size={22} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0, color: "#111827" }}>طلباتي</h1>
            <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>تتبع طلبياتك من موردي مواد البناء</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 48px 80px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: "white", borderRadius: 18, padding: 22 }}>
                <div style={{ height: 14, background: "#f3f4f6", borderRadius: 6, width: "40%", marginBottom: 10 }} />
                <div style={{ height: 10, background: "#f3f4f6", borderRadius: 6, width: "70%" }} />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#9ca3af" }}>
            <div style={{ width: 80, height: 80, background: "#fff1e8", borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <ShoppingBag size={36} color="#C4956A" style={{ opacity: 0.5 }} />
            </div>
            <p style={{ fontSize: 18, fontWeight: 800, color: "#374151", marginBottom: 8 }}>لا توجد طلبيات بعد</p>
            <p style={{ fontSize: 13, marginBottom: 28 }}>تصفّح موردي مواد البناء وأضف منتجات للسلة</p>
            <button
              onClick={() => navigate("/materials")}
              style={{ background: "linear-gradient(135deg,#A67C52,#C4956A)", color: "white", border: "none", borderRadius: 14, padding: "13px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 18px rgba(196,149,106,0.35)" }}
            >
              تصفح مواد البناء
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {orders.map(o => {
              const st = STATUS_INFO[o.status] || STATUS_INFO.pending;
              const isOpen = expanded === o.id;
              return (
                <div key={o.id} style={{ background: "white", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", borderRight: `4px solid ${st.color}` }}>

                  {/* Row header */}
                  <div
                    style={{ padding: "18px 22px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    onClick={() => setExpanded(isOpen ? null : o.id)}
                  >
                    {/* LEFT: chevron + date */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {isOpen ? <ChevronUp size={16} color="#9ca3af" /> : <ChevronDown size={16} color="#9ca3af" />}
                      <div style={{ textAlign: "left" }}>
                        <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                          {new Date(o.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                        <p style={{ fontSize: 13, fontWeight: 800, color: "#C4956A", margin: "3px 0 0" }}>{Number(o.totalPrice).toLocaleString("ar-SA")} ر.س</p>
                      </div>
                    </div>

                    {/* RIGHT: company name + status */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: 0 }}>{o.Company?.ownerName || "مورد"}</p>
                        <p style={{ fontSize: 12, color: "#9ca3af", margin: "3px 0 0" }}>{Array.isArray(o.items) ? `${o.items.length} منتج` : ""}</p>
                      </div>
                      <span style={{ background: st.bg, color: st.color, fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999, flexShrink: 0 }}>
                        {st.label}
                      </span>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isOpen && (
                    <div style={{ borderTop: "1px solid #f3f4f6", padding: "16px 22px 20px" }}>

                      {/* Items */}
                      {Array.isArray(o.items) && (
                        <div style={{ background: "#f9fafb", borderRadius: 12, padding: "12px 16px", marginBottom: 14 }}>
                          {o.items.map((item, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: i < o.items.length - 1 ? 8 : 0, color: "#374151" }}>
                              <span style={{ color: "#C4956A", fontWeight: 700 }}>{(item.unitPrice * item.qty).toLocaleString("ar-SA")} ر.س</span>
                              <span>{item.name} × {item.qty}</span>
                            </div>
                          ))}
                          <div style={{ borderTop: "1px solid #e5e7eb", marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 14 }}>
                            <span style={{ color: "#C4956A" }}>{Number(o.totalPrice).toLocaleString("ar-SA")} ر.س</span>
                            <span>الإجمالي</span>
                          </div>
                        </div>
                      )}

                      {/* Address */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280", marginBottom: o.notes ? 8 : 0 }}>
                        <span>{o.address}</span>
                        <MapPin size={13} color="#C4956A" />
                      </div>
                      {o.notes && (
                        <p style={{ fontSize: 13, color: "#6b7280", margin: "8px 0 0", textAlign: "right" }}>📝 {o.notes}</p>
                      )}

                      {/* Status timeline */}
                      <div style={{ display: "flex", gap: 6, marginTop: 16, flexWrap: "wrap" }}>
                        {["pending","confirmed","shipped","delivered"].map(s => {
                          const steps = ["pending","confirmed","shipped","delivered"];
                          const done  = steps.indexOf(o.status) >= steps.indexOf(s);
                          const info  = STATUS_INFO[s];
                          return (
                            <div key={s} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: done ? 700 : 400, color: done ? info.color : "#9ca3af", background: done ? info.bg : "#f3f4f6", padding: "4px 12px", borderRadius: 999, transition: "all 0.2s" }}>
                              <span style={{ width: 7, height: 7, borderRadius: "50%", background: done ? info.color : "#d1d5db", flexShrink: 0 }} />
                              {info.label}
                            </div>
                          );
                        })}
                        {o.status === "cancelled" && (
                          <div style={{ fontSize: 12, fontWeight: 700, color: STATUS_INFO.cancelled.color, background: STATUS_INFO.cancelled.bg, padding: "4px 12px", borderRadius: 999 }}>
                            ملغى
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
