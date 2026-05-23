import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
export default function ResetPassword() {
  const [form, setForm]       = useState({ newPassword: "", confirmPassword: "" });
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const email = sessionStorage.getItem("resetEmail");
  useEffect(() => {
    if (!email) navigate("/forgot-password");
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.newPassword || !form.confirmPassword)
      return setError("جميع الحقول مطلوبة");
    if (form.newPassword !== form.confirmPassword)
      return setError("كلمتا المرور غير متطابقتين");
    if (form.newPassword.length < 6)
      return setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...form }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "حدث خطأ");
      setSuccess("تم تغيير كلمة المرور بنجاح!");
      sessionStorage.removeItem("resetEmail");
      setTimeout(() => navigate("/login"), 2000);
    } catch {
      setError("تعذر الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10 border border-gray-100 text-right">
        <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">تعيين كلمة مرور جديدة</h2>
        <p className="text-gray-500 mb-8 text-sm text-center">{email}</p>
        {error   && <p className="text-red-500   text-sm text-center mb-4">{error}</p>}
        {success && <p className="text-green-600 text-sm text-center mb-4">{success}</p>}
        <form className="space-y-5" onSubmit={handleSubmit}>
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
            <label className="block text-sm font-medium mb-2 text-gray-700">تأكيد كلمة المرور</label>
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
            className="w-full bg-[#C4956A] text-white py-3 rounded-xl font-bold hover:opacity-90 shadow-md disabled:opacity-60"
          >
            {loading ? "جاري الحفظ..." : "تحديث كلمة المرور"}
          </button>
        </form>
      </div>
    </div>
  );
}