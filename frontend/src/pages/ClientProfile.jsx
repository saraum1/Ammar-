import React, { useState } from "react";
import { User, Phone, Lock, Send, Clock, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
const STATUS = {
  pending:  { label: "معلق",   color: "#92400e", bg: "#fef3c7", icon: <Clock size={13}/> },
  accepted: { label: "مقبول",  color: "#166534", bg: "#dcfce7", icon: <CheckCircle size={13}/> },
  rejected: { label: "مرفوض", color: "#991b1b", bg: "#fee2e2", icon: <XCircle size={13}/> },
};
export default function ClientProfile() {
  const { token, user, login } = useAuth();
  const navigate = useNavigate();
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
            <div className="space-y-4">
              {requests.map(req => {
                const st = STATUS[req.status] || STATUS.pending;
                const co = req.Company || {};
                return (
                  <div key={req.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <span style={{ background: st.bg, color: st.color }} className="text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        {st.icon} {st.label}
                      </span>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{req.projectType}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(req.createdAt).toLocaleDateString("ar-SA")}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1 text-right">
                      <p>🏗️ الشركة: <span className="font-semibold text-gray-800">{co.ownerName}</span></p>
                      <p>📍 الموقع: {req.location}</p>
                      {req.budget  && <p>💰 الميزانية: {req.budget}</p>}
                      {req.message && <p className="bg-gray-50 rounded-xl p-3 mt-2">{req.message}</p>}
                      {req.status === "rejected" && req.companyNote && (
                        <p className="text-red-500 text-xs mt-2">سبب الرفض: {req.companyNote}</p>
                      )}
                    </div>
                  </div>
                );
              })}
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