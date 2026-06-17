import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function ChangePassword() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]       = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword)
      return setError("جميع الحقول مطلوبة");
    if (form.newPassword !== form.confirmPassword)
      return setError("كلمتا المرور الجديدة غير متطابقتين");
    if (form.newPassword.length < 6)
      return setError("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, 
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "حدث خطأ");
      setSuccess("تم تغيير كلمة المرور بنجاح! سيتم تسجيل خروجك...");
      setTimeout(() => {
        logout();
        navigate("/login");
      }, 2000);
    } catch {
      setError("تعذر الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center py-12 px-4" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10 border border-gray-100 text-right">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">تغيير كلمة المرور</h2>
        {error   && <p className="text-red-500   text-sm text-center mb-4">{error}</p>}
        {success && <p className="text-green-600 text-sm text-center mb-4">{success}</p>}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">كلمة المرور الحالية</label>
            <input
              type="password"
              value={form.currentPassword}
              onChange={e => setForm({ ...form, currentPassword: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#C4956A]"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">كلمة المرور الجديدة</label>
            <input
              type="password"
              value={form.newPassword}
              onChange={e => setForm({ ...form, newPassword: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#C4956A]"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">تأكيد كلمة المرور الجديدة</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#C4956A]"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1B3A2D] text-white py-3 rounded-lg font-bold hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </form>
      </div>
    </div>
  );
}