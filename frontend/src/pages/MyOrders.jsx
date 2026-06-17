import React, { useState, useEffect } from "react";
import { MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const STEPS = [
  { key: "pending",   label: "تم الطلب",    sublabel: "استلمنا طلبك" },
  { key: "confirmed", label: "تم التأكيد",  sublabel: "المورد أكد الطلب" },
  { key: "shipped",   label: "جارٍ التوصيل", sublabel: "في الطريق إليك" },
  { key: "delivered", label: "تم التسليم",  sublabel: "وصل بنجاح" },
];

const STEP_ORDER = ["pending", "confirmed", "shipped", "delivered"];

export default function MyOrders() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
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
      <div style={{ background: "white", padding: "36px 48px 28px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 4px", color: "#111827", letterSpacing: -0.5 }}>طلباتي</h1>
          <p style={{ fontSize: 14, color: "#9ca3af", margin: 0 }}>تتبع طلبياتك من موردي مواد البناء</p>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 48px 80px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ background: "white", borderRadius: 10, padding: 24, border: "1px solid #EDE3D8" }}>
                <div style={{ height: 14, background: "#f3f4f6", borderRadius: 6, width: "40%", marginBottom: 12 }} />
                <div style={{ height: 10, background: "#f3f4f6", borderRadius: 6, width: "70%" }} />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <p style={{ fontSize: 18, fontWeight: 800, color: "#374151", marginBottom: 8 }}>لا توجد طلبيات بعد</p>
            <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 28 }}>تصفّح موردي مواد البناء وأضف منتجات للسلة</p>
            <button
              onClick={() => navigate("/materials")}
              style={{ background: "#1B3A2D", color: "white", border: "none", borderRadius: 8, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >
              تصفح مواد البناء
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {orders.map(o => <OrderCard key={o.id} order={o} expanded={expanded === o.id} onToggle={() => setExpanded(expanded === o.id ? null : o.id)} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order: o, expanded, onToggle }) {
  const isCancelled = o.status === "cancelled";
  const currentStep = STEP_ORDER.indexOf(o.status);
  const progressPct = isCancelled ? 0 : (currentStep / (STEP_ORDER.length - 1)) * 100;

  return (
    <div style={{
      background: "white", borderRadius: 10,
      overflow: "hidden",
      border: isCancelled ? "1.5px solid #fecaca" : "1px solid #EDE3D8",
    }}>

      {/* ── Header ── */}
      <div
        onClick={onToggle}
        style={{ padding: "20px 24px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {expanded ? <ChevronUp size={16} color="#9ca3af" /> : <ChevronDown size={16} color="#9ca3af" />}
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: 0 }}>{o.Company?.ownerName || "مورد"}</p>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: "2px 0 0" }}>
              {Array.isArray(o.items) ? `${o.items.length} منتج` : ""}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isCancelled ? (
            <span style={{ background: "#fee2e2", color: "#991b1b", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999 }}>
              ملغى
            </span>
          ) : (
            <span style={{
              background: currentStep === STEP_ORDER.length - 1 ? "#dcfce7" : "#fff7ed",
              color:      currentStep === STEP_ORDER.length - 1 ? "#166534" : "#C4956A",
              fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 999
            }}>
              {STEPS[currentStep]?.label || "معلق"}
            </span>
          )}
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: "#C4956A", margin: 0 }}>
              {Number(o.totalPrice).toLocaleString("ar-SA")} ر.س
            </p>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: "2px 0 0" }}>
              {new Date(o.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stepper ── */}
      {!isCancelled && (
        <div style={{ padding: "0 24px 20px" }}>
          <div style={{ position: "relative" }}>
            {/* خط الخلفية */}
            <div style={{
              position: "absolute", top: 18,
              right: "calc(12.5% + 18px)", left: "calc(12.5% + 18px)",
              height: 3, background: "#f0e8df", borderRadius: 999, zIndex: 0,
            }} />
            {/* خط التقدم */}
            <div style={{
              position: "absolute", top: 18,
              right: "calc(12.5% + 18px)",
              width: `calc(${progressPct}% * 0.75)`,
              height: 3,
              background: "linear-gradient(90deg,#A67C52,#C4956A)",
              borderRadius: 999, zIndex: 1,
              transition: "width 0.6s ease",
            }} />

            <div style={{ display: "flex", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
              {STEPS.map((step, i) => {
                const done    = currentStep >= i;
                const current = currentStep === i;
                return (
                  <div key={step.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {/* الدائرة */}
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16,
                      background: done ? (i === STEP_ORDER.length - 1 ? "#dcfce7" : "#F0E4D0") : "#f9fafb",
                      border: done
                        ? `2.5px solid ${i === STEP_ORDER.length - 1 ? "#4ade80" : "#C4956A"}`
                        : current ? "2.5px dashed #C4956A" : "2.5px solid #e5e7eb",
                      boxShadow: current ? "0 0 0 5px #fff7ed" : "none",
                      transition: "all 0.3s",
                    }}>
                      {step.icon}
                    </div>
                    {/* اسم الخطوة */}
                    <p style={{
                      fontSize: 11, fontWeight: 700, marginTop: 7, textAlign: "center",
                      color: done ? (i === STEP_ORDER.length - 1 ? "#16a34a" : "#1B3A2D") : "#9ca3af",
                    }}>
                      {step.label}
                    </p>
                    {/* وصف فرعي فقط للخطوة الحالية */}
                    {current && (
                      <p style={{ fontSize: 10, color: "#C4956A", marginTop: 2, textAlign: "center", fontWeight: 600 }}>
                        {step.sublabel}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── تفاصيل (عند الفتح) ── */}
      {expanded && (
        <div style={{ borderTop: "1px solid #f3f4f6", padding: "16px 24px 22px" }}>

          {/* المنتجات */}
          {Array.isArray(o.items) && (
            <div style={{ background: "#f9fafb", borderRadius: 14, padding: "12px 16px", marginBottom: 14 }}>
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

          {/* العنوان */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6b7280", marginBottom: o.notes ? 8 : 0 }}>
            <MapPin size={13} color="#C4956A" />
            <span>{o.address}</span>
          </div>
          {o.notes && (
            <p style={{ fontSize: 13, color: "#6b7280", margin: "8px 0 0", textAlign: "right" }}>{o.notes}</p>
          )}
        </div>
      )}
    </div>
  );
}
