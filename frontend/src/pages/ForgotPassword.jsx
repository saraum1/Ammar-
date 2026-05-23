import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
export default function ForgotPassword() {
  const [email, setEmail]     = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) return setError("البريد الإلكتروني مطلوب");
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "حدث خطأ");
      sessionStorage.setItem("resetEmail", data.email);
      navigate("/reset-password");
    } catch {
      setError("تعذر الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10 border border-gray-100 text-right">
        <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">استعادة كلمة المرور</h2>
        <p className="text-gray-500 mb-8 text-sm text-center">أدخل بريدك الإلكتروني المسجّل وسنتحقق منه</p>
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#C4956A]"
              placeholder="example@mail.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C4956A] text-white py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-md disabled:opacity-60"
          >
            {loading ? "جاري التحقق..." : "التحقق من البريد"}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-500">
          <Link to="/login" className="text-[#C4956A] font-bold hover:underline">
            ← رجوع لتسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}