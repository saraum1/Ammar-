import React, { useState } from "react";
import { User, Phone, Lock, Send, Clock, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
const STATUS = {
  pending:  { label: "معلق",   color: "#92400e", bg: "#fef3c7", icon: <Clock size={13}/> },
  accepted: { label: "مقبول",  color: "#166534", bg: "#dcfce7", icon: <CheckCircle size={13}/> },
  rejected: { label: "مرفوض", color: "#991b1b", bg: "#fee2e2", icon: <XCircle size={13}/> },
};
export default function ClientProfile() {
  const { token, user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState("");

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteErr("");
    try {
      const res = await fetch("/api/auth/account", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        logout();
        navigate("/");
      } else {
        const d = await res.json();
        setDeleteErr(d.message || "حدث خطأ");
        setDeleteConfirm(false);
      }
    } catch { setDeleteErr("تعذر الاتصال بالسيرفر"); setDeleteConfirm(false); }
    finally { setDeleting(false); }
  };
  if (!token) {
    return (
      <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center" dir="rtl">
        <div className="bg-white rounded-2xl p-10 text-center shadow-lg max-w-sm w-full">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-black mb-3">سجّل دخولك أول</h2>
          <Link to="/login" className="block bg-[#1B3A2D] text-white py-3 rounded-xl font-bold hover:opacity-90 mt-4">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }
  const [tab, setTab] = useState("profile");
  const [firstName, setFirstName] = useState(user?.name?.split(" ")[0] || "");
  const [lastName,  setLastName]  = useState(user?.name?.split(" ").slice(1).join(" ") || "");
  const [phone,     setPhone]     = useState(user?.phone || "");
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [profErr,   setProfErr]   = useState("");
  const handleSaveProfile = async () => {
    setProfErr("");
    if (phone && !/^05\d{8}$/.test(phone)) {
      setProfErr("رقم الجوال يجب أن يكون 10 أرقام ويبدأ بـ 05");
      return;
    }
    setSaving(true);
    try {
      const res  = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ firstName, lastName, phone })
      });
      const data = await res.json();
      if (!res.ok) { setProfErr(data.message); return; }
      login(token, data.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { setProfErr("تعذر الاتصال بالسيرفر"); }
    finally { setSaving(false); }
  };
  const [pwForm,  setPwForm]  = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwErr,   setPwErr]   = useState("");
  const [pwOk,    setPwOk]    = useState(false);
  const [pwLoad,  setPwLoad]  = useState(false);
  const handleChangePassword = async () => {
    setPwErr("");
    if (!pwForm.currentPassword || !pwForm.newPassword || !pwForm.confirmPassword)
      return setPwErr("جميع الحقول مطلوبة");
    if (pwForm.newPassword !== pwForm.confirmPassword)
      return setPwErr("كلمتا المرور الجديدة غير متطابقتين");
    if (pwForm.newPassword.length < 6)
      return setPwErr("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    setPwLoad(true);
    try {
      const res  = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(pwForm)
      });
      const data = await res.json();
      if (!res.ok) return setPwErr(data.message);
      setPwOk(true);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPwOk(false), 2500);
    } catch { setPwErr("تعذر الاتصال"); }
    finally { setPwLoad(false); }
  };
  const [requests,  setRequests]  = useState([]);
  const [reqLoad,   setReqLoad]   = useState(false);
  const [reqFetched, setReqFetched] = useState(false);
  const fetchRequests = async () => {
    if (reqFetched) return;
    setReqLoad(true);
    try {
      const res  = await fetch("/api/requests/my-requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setRequests(data.data);
      setReqFetched(true);
    } finally { setReqLoad(false); }
  };
  const switchTab = (t) => {
    setTab(t);
    if (t === "requests") fetchRequests();
  };
  return (
    <div className="min-h-screen bg-[#FAF7F0]" dir="rtl">
      <div className="bg-white border-b border-gray-100 px-8 py-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">حسابي</h1>
            <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
          </div>
          <div className="flex gap-2">
            <TabBtn active={tab === "profile"}  onClick={() => switchTab("profile")}  icon={<User size={15}/>}  label="البروفايل" />
            <TabBtn active={tab === "requests"} onClick={() => switchTab("requests")} icon={<Send size={15}/>}  label="طلباتي" />
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-8 py-8">
        {tab === "profile" && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-[#F0E4D0] rounded-xl flex items-center justify-center text-[#C4956A]">
                  <User size={20}/>
                </div>
                <h2 className="text-lg font-bold">المعلومات الشخصية</h2>
              </div>
              {profErr && <p className="text-red-500 text-sm mb-4">{profErr}</p>}
              {saved   && <p className="text-green-600 text-sm mb-4">✓ تم حفظ التغييرات</p>}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">الاسم الأول</label>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#C4956A] text-right" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">الاسم الأخير</label>
                  <input value={lastName}  onChange={e => setLastName(e.target.value)}  className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#C4956A] text-right" />
                </div>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">رقم الجوال</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} maxLength={10} placeholder="05xxxxxxxx" className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#C4956A] text-right" />
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm text-right">
                <p className="text-gray-500 mb-1">اسم المستخدم</p>
                <p className="font-bold text-gray-700">@{user?.username}</p>
              </div>
              <button onClick={handleSaveProfile} disabled={saving} className="w-full bg-[#1B3A2D] text-white py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-opacity">
                {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
              </button>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-[#F0E4D0] rounded-xl flex items-center justify-center text-[#C4956A]">
                  <Lock size={20}/>
                </div>
                <h2 className="text-lg font-bold">تغيير كلمة المرور</h2>
              </div>
              {pwErr && <p className="text-red-500 text-sm mb-4">{pwErr}</p>}
              {pwOk  && <p className="text-green-600 text-sm mb-4">✓ تم تغيير كلمة المرور بنجاح</p>}
              {["currentPassword","newPassword","confirmPassword"].map((key, i) => (
                <div key={key} className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {i === 0 ? "كلمة المرور الحالية" : i === 1 ? "كلمة المرور الجديدة" : "تأكيد كلمة المرور"}
                  </label>
                  <input type="password" value={pwForm[key]} onChange={e => setPwForm({...pwForm, [key]: e.target.value})} placeholder="••••••••" className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-[#C4956A]" />
                </div>
              ))}
              <button onClick={handleChangePassword} disabled={pwLoad} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-opacity">
                {pwLoad ? "جاري التغيير..." : "تغيير كلمة المرور"}
              </button>
            </div>
            {/* حذف الحساب */}
            {deleteErr && <p className="text-red-500 text-sm text-center">{deleteErr}</p>}
            <button onClick={() => setDeleteConfirm(true)} className="w-full border border-red-200 text-red-400 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors">
              حذف الحساب
            </button>

            {/* Modal تأكيد الحذف */}
            {deleteConfirm && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, padding: 20 }}>
                <div style={{ background: "white", borderRadius: 20, padding: 28, maxWidth: 360, width: "100%", textAlign: "center" }} dir="rtl">
                  <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "#111827", marginBottom: 10 }}>حذف الحساب</h3>
                  <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, marginBottom: 22 }}>
                    سيتم حذف حسابك وجميع بياناتك نهائياً ولا يمكن التراجع عن هذه العملية.
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => setDeleteConfirm(false)}
                      style={{ flex: 1, background: "#f3f4f6", color: "#374151", border: "none", borderRadius: 12, padding: "11px 0", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      style={{ flex: 1, background: "#ef4444", color: "white", border: "none", borderRadius: 12, padding: "11px 0", fontWeight: 700, fontSize: 14, cursor: "pointer", opacity: deleting ? 0.6 : 1, fontFamily: "inherit" }}
                    >
                      {deleting ? "جاري الحذف..." : "تأكيد"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {tab === "requests" && (
          reqLoad ? (
            <p className="text-center text-gray-400 py-16">جاري التحميل...</p>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Send size={44} className="mx-auto mb-4 opacity-30"/>
              <p>لم ترسل أي طلبات بعد</p>
              <Link to="/engineering" className="text-[#C4956A] font-bold mt-3 block hover:underline">
                تصفح الشركات الهندسية
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {requests.map(req => <RequestTracker key={req.id} req={req} />)}
            </div>
          )
        )}
      </div>
    </div>
  );
}
function TabBtn({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-none cursor-pointer transition-all ${active ? "bg-[#1B3A2D] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
      {icon} {label}
    </button>
  );
}

function RequestTracker({ req }) {
  const co = req.Company || {};
  const isAccepted = req.status === "accepted";
  const isRejected = req.status === "rejected";

  // الخطوات: 0=إرسال، 1=مراجعة، 2=النتيجة
  const stepDone  = isAccepted || isRejected ? 2 : 1; // الخطوة الحالية (0-based)

  const steps = [
    {
      label: "إرسال الطلب",
      sublabel: new Date(req.createdAt).toLocaleDateString("ar-SA"),
      icon: "📤",
      done: true,
      active: false,
    },
    {
      label: "قيد المراجعة",
      sublabel: "الشركة تراجع طلبك",
      icon: "🔍",
      done: isAccepted || isRejected,
      active: !isAccepted && !isRejected,
    },
    {
      label: isAccepted ? "تم القبول" : isRejected ? "تم الرفض" : "النتيجة",
      sublabel: isAccepted ? "🎉 الشركة وافقت على طلبك" : isRejected ? (req.companyNote || "لم يتم قبول الطلب") : "في انتظار الرد",
      icon: isAccepted ? "✅" : isRejected ? "❌" : "⏳",
      done: isAccepted || isRejected,
      active: false,
      result: true,
      accepted: isAccepted,
      rejected: isRejected,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-50">
        <div className="flex items-start justify-between">
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
            background: isAccepted ? "#dcfce7" : isRejected ? "#fee2e2" : "#fef3c7",
            color:      isAccepted ? "#166534" : isRejected ? "#991b1b" : "#92400e",
          }}>
            {isAccepted ? "✅ مقبول" : isRejected ? "❌ مرفوض" : "⏳ معلق"}
          </span>
          <div className="text-right">
            <p className="font-bold text-gray-900 text-sm">{req.projectType}</p>
            <p className="text-xs text-gray-400 mt-0.5">🏗️ {co.ownerName}</p>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="px-5 py-5">
        <div className="flex items-start justify-between relative" dir="rtl">
          {/* خط الوصل */}
          <div style={{
            position: "absolute",
            top: 18,
            right: "calc(16.5% + 18px)",
            left: "calc(16.5% + 18px)",
            height: 3,
            background: "#f0e8df",
            borderRadius: 999,
            zIndex: 0,
          }} />
          {/* خط التقدم */}
          <div style={{
            position: "absolute",
            top: 18,
            right: "calc(16.5% + 18px)",
            width: stepDone === 0 ? "0%" : stepDone === 1 ? "50%" : "100%",
            height: 3,
            background: isRejected ? "#fca5a5" : "linear-gradient(90deg, #A67C52, #C4956A)",
            borderRadius: 999,
            zIndex: 1,
            transition: "width 0.5s ease",
          }} />

          {steps.map((step, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2 }}>
              {/* الدائرة */}
              <div style={{
                width: 36, height: 36,
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
                background: step.done
                  ? (step.result && step.rejected ? "#fee2e2" : step.result && step.accepted ? "#dcfce7" : "#F0E4D0")
                  : step.active ? "#fff7ed" : "#f9fafb",
                border: step.done
                  ? (step.result && step.rejected ? "2.5px solid #f87171" : step.result && step.accepted ? "2.5px solid #4ade80" : "2.5px solid #C4956A")
                  : step.active ? "2.5px dashed #C4956A" : "2.5px solid #e5e7eb",
                boxShadow: step.active ? "0 0 0 4px #fff7ed" : "none",
                transition: "all 0.3s",
              }}>
                {step.icon}
              </div>
              {/* النص */}
              <p style={{
                fontSize: 11, fontWeight: 700, marginTop: 8, textAlign: "center",
                color: step.done ? (step.result && step.rejected ? "#ef4444" : step.result && step.accepted ? "#16a34a" : "#1B3A2D") : step.active ? "#C4956A" : "#9ca3af",
              }}>{step.label}</p>
              <p style={{ fontSize: 10, color: "#9ca3af", marginTop: 2, textAlign: "center", lineHeight: 1.4, maxWidth: 80 }}>
                {step.sublabel}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* تفاصيل */}
      <div className="px-5 pb-5 space-y-1 text-right text-sm text-gray-500 border-t border-gray-50 pt-3">
        <p>📍 الموقع: <span className="text-gray-700 font-medium">{req.location}</span></p>
        {req.budget  && <p>💰 الميزانية: <span className="text-gray-700 font-medium">{req.budget}</span></p>}
        {req.message && <p className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 mt-2">{req.message}</p>}
      </div>
    </div>
  );
}