import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Building2, Phone, Mail, FileText, Trash2, Users } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
const TYPE_MAP = {
  full_construction:    "بناء كامل",
  partial_construction: "بناء جزئي",
  materials_supplier:   "مواد بناء"
};
export default function AdminPanel() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState("pending");
  const [note,      setNote]      = useState("");
  const [activeId,  setActiveId]  = useState(null);
  useEffect(() => {
    if (!token || user?.role !== "admin") {
      navigate("/login");
    }
  }, [token, user]);
  const fetchCompanies = async (type = "pending") => {
    setLoading(true);
    try {
      const urlMap = {
        pending:  "/api/admin/companies/pending",
        all:      "/api/admin/companies/all",
        delreqs:  "/api/admin/companies/delete-requests",
      };
      const res  = await fetch(urlMap[type] || urlMap.pending, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setCompanies(data.data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchCompanies(tab); }, [tab]);

  const handleApprove = async (id) => {
    await fetch(`/api/admin/companies/${id}/approve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ note: "تمت الموافقة" })
    });
    fetchCompanies(tab);
  };
  const handleReject = async (id) => {
    await fetch(`/api/admin/companies/${id}/reject`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ note: note || "لم يتم قبول الطلب" })
    });
    setNote("");
    setActiveId(null);
    fetchCompanies(tab);
  };
  const handleDelete = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الشركة نهائياً؟")) return;
    await fetch(`/api/admin/companies/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchCompanies(tab);
  };
  const handleRejectDelete = async (id) => {
    await fetch(`/api/admin/companies/${id}/reject-delete`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchCompanies(tab);
  };

  const statusBadge = (s) => {
    const map = {
      pending:  { bg: "#fef3c7", color: "#92400e", label: "معلق",   icon: <Clock size={12} /> },
      approved: { bg: "#dcfce7", color: "#166534", label: "معتمد",  icon: <CheckCircle size={12} /> },
      rejected: { bg: "#fee2e2", color: "#991b1b", label: "مرفوض",  icon: <XCircle size={12} /> },
    };
    const st = map[s] || map.pending;
    return (
      <span style={{ background: st.bg, color: st.color, fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 4 }}>
        {st.icon} {st.label}
      </span>
    );
  };
  return (
    <div style={{ background: "#FAF7F0", minHeight: "100vh" }} dir="rtl">
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "28px 56px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 900, margin: 0 }}>لوحة إدارة عمار</h1>
            <p style={{ color: "#6b7280", margin: "4px 0 0", fontSize: 14 }}>مراجعة وموافقة طلبات الشركات</p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <TabBtn active={tab === "pending"} onClick={() => setTab("pending")} label="المعلقة" />
            <TabBtn active={tab === "all"}     onClick={() => setTab("all")}     label="الكل" />
            <TabBtn active={tab === "delreqs"} onClick={() => setTab("delreqs")} label="طلبات الحذف" danger />
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 56px 60px" }}>
        {loading ? (
          <p style={{ textAlign: "center", color: "#9ca3af", padding: 60 }}>جاري التحميل...</p>
        ) : companies.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>
            <CheckCircle size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
            <p>
              {tab === "pending"  ? "لا توجد شركات معلقة 🎉" :
               tab === "delreqs" ? "لا توجد طلبات حذف حالياً" :
               "لا توجد شركات مسجّلة"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {companies.map(company => (
              <CompanyCard
                key={company.id}
                company={company}
                tab={tab}
                onApprove={() => handleApprove(company.id)}
                onReject={() => setActiveId(company.id)}
                onDelete={() => handleDelete(company.id)}
                onRejectDelete={() => handleRejectDelete(company.id)}
                isRejectOpen={activeId === company.id}
                note={note}
                setNote={setNote}
                confirmReject={() => handleReject(company.id)}
                cancelReject={() => { setActiveId(null); setNote(""); }}
                statusBadge={statusBadge}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
function TabBtn({ active, onClick, label, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 18px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700,
        background: active ? (danger ? "#ef4444" : "#C4956A") : "#f3f4f6",
        color:      active ? "white" : (danger ? "#ef4444" : "#374151"),
        transition: "all 0.15s"
      }}
    >
      {label}
    </button>
  );
}
function CompanyCard({ company, tab, onApprove, onReject, onDelete, onRejectDelete, isRejectOpen, note, setNote, confirmReject, cancelReject, statusBadge }) {
  const u = company.User || {};
  return (
    <div style={{ background: "white", borderRadius: 20, padding: "26px 30px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", border: company.deleteRequested ? "2px solid #fecaca" : "none" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ textAlign: "right" }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>{company.ownerName}</h3>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "4px 0 0" }}>
            {u.firstName} {u.lastName} — @{u.username}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <span style={{ background: "#fff1e8", color: "#C4956A", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>
            {TYPE_MAP[company.type] || company.type}
          </span>
          {statusBadge(company.approvalStatus)}
          {company.clientCount !== undefined && (
            <span style={{ background: "#eff6ff", color: "#2563eb", fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Users size={12} /> {company.clientCount} عميل
            </span>
          )}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 30px", marginBottom: 18 }}>
        <InfoRow icon={<Mail size={14} />}     label={u.email} />
        <InfoRow icon={<Phone size={14} />}    label={u.phone} />
        {company.commercialRegistrationNumber && <InfoRow icon={<FileText size={14} />} label={`سجل: ${company.commercialRegistrationNumber}`} />}
        {company.vatNumber && <InfoRow icon={<FileText size={14} />} label={`ضريبي: ${company.vatNumber}`} />}
        {company.establishmentNumber && <InfoRow icon={<Building2 size={14} />} label={`منشأة: ${company.establishmentNumber}`} />}
        <InfoRow icon={<Clock size={14} />} label={`تاريخ التسجيل: ${new Date(company.createdAt).toLocaleDateString("ar-SA")}`} />
      </div>
      {company.commercialRegistrationFile ? (
        <a
          href={`${company.commercialRegistrationFile}`}
          target="_blank"
          rel="noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff1e8", color: "#C4956A", fontSize: 13, fontWeight: 700, padding: "7px 16px", borderRadius: 10, marginBottom: 14, textDecoration: "none" }}
        >
          📄 عرض السجل التجاري PDF
        </a>
      ) : (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f9fafb", color: "#9ca3af", fontSize: 13, fontWeight: 600, padding: "7px 14px", borderRadius: 10, marginBottom: 14 }}>
          ⚠️ لم يُرفع ملف السجل التجاري بعد
        </span>
      )}
      {company.approvalStatus === "rejected" && company.approvalNote && (
        <p style={{ color: "#ef4444", fontSize: 13, background: "#fee2e2", padding: "8px 14px", borderRadius: 10, marginBottom: 14 }}>
          سبب الرفض: {company.approvalNote}
        </p>
      )}
      {/* Delete request note */}
      {company.deleteRequested && company.deleteRequestNote && (
        <p style={{ color: "#92400e", fontSize: 13, background: "#fef3c7", padding: "8px 14px", borderRadius: 10, marginBottom: 14 }}>
          📝 سبب طلب الحذف: {company.deleteRequestNote}
        </p>
      )}

      {/* Action buttons */}
      {tab === "delreqs" ? (
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <button
            onClick={onRejectDelete}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 10, padding: "9px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            رفض الطلب
          </button>
          <button
            onClick={onDelete}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 10, padding: "9px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            حذف الشركة نهائياً <Trash2 size={15} />
          </button>
        </div>
      ) : tab === "all" ? (
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onDelete}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 10, padding: "9px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            <Trash2 size={15} /> حذف
          </button>
        </div>
      ) : company.approvalStatus === "pending" ? (
        <>
          {!isRejectOpen ? (
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={onReject}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: 10, padding: "9px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
              >
                رفض <XCircle size={16} />
              </button>
              <button
                onClick={onApprove}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "#dcfce7", color: "#166534", border: "none", borderRadius: 10, padding: "9px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
              >
                موافقة <CheckCircle size={16} />
              </button>
            </div>
          ) : (
            <div>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="سبب الرفض (اختياري)..."
                rows={2}
                style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: 10, padding: "10px", fontSize: 14, outline: "none", resize: "none", marginBottom: 10, textAlign: "right", fontFamily: "inherit", boxSizing: "border-box" }}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={confirmReject} style={{ background: "#ef4444", color: "white", border: "none", borderRadius: 10, padding: "9px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  تأكيد الرفض
                </button>
                <button onClick={cancelReject} style={{ background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 10, padding: "9px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
function InfoRow({ icon, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b7280", fontSize: 13, justifyContent: "flex-start" }}>
      {label}
      <span style={{ color: "#C4956A" }}>{icon}</span>
    </div>
  );
}
