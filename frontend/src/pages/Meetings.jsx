import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, AlertCircle, ExternalLink, Building2, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
const ALL_STATUSES = ["all", "pending", "confirmed", "declined"];
const STATUS_META = {
  pending:   { label: "بانتظار التأكيد", bg: "#fef3c7", color: "#92400e", dot: "#f59e0b", Icon: AlertCircle },
  confirmed: { label: "مؤكد",           bg: "#dcfce7", color: "#166534", dot: "#22c55e", Icon: CheckCircle },
  declined:  { label: "مرفوض",          bg: "#fee2e2", color: "#991b1b", dot: "#ef4444", Icon: XCircle    },
};
const TAB_LABELS = { all: "الكل", pending: "بانتظار التأكيد", confirmed: "مؤكدة", declined: "مرفوضة" };
export default function Meetings() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");
  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetch("/api/meetings/client", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.data) setMeetings(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);
  const counts = meetings.reduce((acc, m) => { acc[m.status] = (acc[m.status] || 0) + 1; return acc; }, {});
  const visible = filter === "all" ? meetings : meetings.filter(m => m.status === filter);
  return (
    <div style={{ background: "#FAF7F0", minHeight: "100vh", direction: "rtl" }}>
      {}
      <div style={{ background: "white", padding: "36px 48px 28px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 6 }}>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 4px", color: "#111827", letterSpacing: -0.5 }}>اجتماعاتي</h1>
            <p style={{ fontSize: 14, color: "#9ca3af", margin: 0 }}>متابعة طلبات وتأكيدات الاجتماعات مع الشركات</p>
          </div>
          {}
          {!loading && meetings.length > 0 && (
            <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
              {(["pending","confirmed","declined"]).map(s => {
                const meta = STATUS_META[s];
                const cnt = counts[s] || 0;
                if (!cnt) return null;
                return (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 7, background: meta.bg, borderRadius: 8, padding: "6px 14px" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: meta.dot, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: meta.color, fontWeight: 700 }}>{cnt} {meta.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 48px 80px" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ background: "white", borderRadius: 10, padding: 22, border: "1px solid #EDE3D8" }}>
                <div style={{ height: 14, background: "#f3f4f6", borderRadius: 6, width: "40%", marginBottom: 10 }} />
                <div style={{ height: 10, background: "#f3f4f6", borderRadius: 6, width: "70%" }} />
              </div>
            ))}
          </div>
        ) : meetings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <p style={{ fontSize: 17, fontWeight: 700, color: "#374151", marginBottom: 8 }}>لا توجد اجتماعات بعد</p>
            <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>يمكنك طلب اجتماع من صفحة تفاصيل مشروعك</p>
          </div>
        ) : (
          <>
            {}
            <div style={{ display: "flex", gap: 6, marginBottom: 20, border: "1px solid #EDE3D8", borderRadius: 10, padding: 4, background: "white", width: "fit-content" }}>
              {ALL_STATUSES.map(s => (
                <button key={s} onClick={() => setFilter(s)}
                  style={{ padding: "7px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit",
                    background: filter === s ? "#C4956A" : "transparent",
                    color: filter === s ? "white" : "#6b7280",
                    transition: "all 0.15s"
                  }}>
                  {TAB_LABELS[s]}
                  {s !== "all" && counts[s] ? <span style={{ marginRight: 5, opacity: 0.75 }}>({counts[s]})</span> : null}
                </button>
              ))}
            </div>
            {}
            {visible.length === 0 ? (
              <p style={{ textAlign: "center", color: "#9ca3af", padding: "40px 0", fontSize: 14 }}>لا توجد اجتماعات في هذا التصنيف</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {visible.map(m => <MeetingRow key={m.id} meeting={m} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
function MeetingRow({ meeting: m }) {
  const meta = STATUS_META[m.status] || STATUS_META.pending;
  const Icon = meta.Icon;
  const dateStr = (() => {
    try { return new Date(m.proposedDate).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" }); }
    catch { return m.proposedDate; }
  })();
  return (
    <div style={{ background: "white", borderRadius: 10, border: "1px solid #EDE3D8", overflow: "hidden" }}>
      <div style={{ padding: "18px 22px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        {}
        <div style={{ flex: 1, minWidth: 160, textAlign: "right" }}>
          <p style={{ fontSize: 15, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>{m.topic}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end" }}>
            <span style={{ fontSize: 12, color: "#C4956A", fontWeight: 600 }}>{m.Company?.ownerName}</span>
            <Building2 size={12} color="#C4956A" />
          </div>
        </div>
        {}
        <div style={{ display: "flex", gap: 16, fontSize: 13, color: "#6b7280", flexShrink: 0 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Clock size={13} color="#9ca3af" /> {m.proposedTime}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <Calendar size={13} color="#9ca3af" /> {dateStr}
          </span>
        </div>
        {}
        <span style={{ display: "flex", alignItems: "center", gap: 5, background: meta.bg, color: meta.color, fontSize: 12, fontWeight: 700, padding: "5px 13px", borderRadius: 8, flexShrink: 0 }}>
          <Icon size={12} /> {meta.label}
        </span>
      </div>
      {}
      {(m.meetLink && m.status === "confirmed") || m.companyNote ? (
        <div style={{ borderTop: "1px solid #f9f9f9", padding: "10px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          {m.companyNote && (
            <p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
              <span style={{ fontWeight: 600, marginLeft: 4 }}>ملاحظة:</span>{m.companyNote}
            </p>
          )}
          {m.meetLink && (
            <a
              href={m.meetLink.startsWith("http") ? m.meetLink : `https://${m.meetLink}`}
              target="_blank" rel="noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "7px 14px", color: "#16a34a", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
              <ExternalLink size={13} /> انضم للاجتماع
            </a>
          )}
        </div>
      ) : null}
    </div>
  );
}