import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
export default function Login() {
  const navigate  = useNavigate();
  const { login } = useAuth();
  const [username,      setUsername]      = useState("");
  const [password,      setPassword]      = useState("");
  const [errors,        setErrors]        = useState({});
  const [googleLoading, setGoogleLoading] = useState(false);
  const handleGoogleSuccess = async ({ credential }) => {
    setGoogleLoading(true);
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (!res.ok) { setErrors({ general: data.message || "فشل تسجيل الدخول بقوقل" }); return; }
      login(data.token, data.data);
      const role = data.data?.role;
      if      (role === "admin")   navigate("/admin");
      else if (role === "company") navigate("/company/dashboard");
      else                         navigate("/");
    } catch {
      setErrors({ general: "تعذر الاتصال بالسيرفر" });
    } finally {
      setGoogleLoading(false);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!username) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length !== 0) return;
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (!response.ok) {
        setErrors({ general: data.message || "Login failed" });
        return;
      }
      login(data.token, data.data);
      const role = data.data?.role;
      if      (role === "admin")   navigate("/admin");
      else if (role === "company") navigate("/company/dashboard");
      else                         navigate("/");
    } catch (error) {
      setErrors({ general: "Cannot connect to server" });
    }
  };
  const inp = (hasErr) =>
    `w-full p-3 rounded-xl border outline-none transition-all text-right ${
      hasErr ? "border-red-500" : "border-gray-200 focus:border-[#C4956A]"
    }`;
  return (
    <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center py-12 px-4" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">تسجيل الدخول</h2>
        <p className="text-gray-500 mb-8 text-sm text-center">مرحباً بك مجدداً في منصة عمار</p>
        {errors.general && (
          <p className="text-red-500 text-sm text-center mb-4">{errors.general}</p>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="text-right">
            <label className="block text-sm font-medium mb-2 text-gray-700">اسم المستخدم</label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrors({ ...errors, username: false, general: false });
              }}
              className={inp(errors.username)}
              placeholder="client123"
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>
          <div className="text-right">
            <label className="block text-sm font-medium mb-2 text-gray-700">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({ ...errors, password: false, general: false });
              }}
              className={inp(errors.password)}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            <div className="flex justify-end mt-2">
              <Link to="/forgot-password" className="text-xs text-[#C4956A] hover:underline font-bold">
                نسيت كلمة المرور؟
              </Link>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-[#1B3A2D] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#254E3D] shadow-md transition-all mt-6 active:scale-[0.98]"
          >
            دخول
          </button>
        </form>
        <div style={{ margin: "24px 0 0", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
          <span style={{ color: "#9ca3af", fontSize: 13, whiteSpace: "nowrap" }}>أو</span>
          <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
        </div>
        <div style={{ marginTop: 16 }}>
          {googleLoading ? (
            <div style={{ textAlign: "center", padding: "12px 0", color: "#9ca3af", fontSize: 14 }}>
              جاري تسجيل الدخول...
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setErrors({ general: "فشل تسجيل الدخول بقوقل" })}
                locale="ar"
                text="signin_with"
                shape="rectangular"
                theme="outline"
                size="large"
                width="360"
              />
            </div>
          )}
        </div>
        <div className="mt-8 text-center text-sm text-gray-600 border-t pt-6">
          ليس لديك حساب؟
          <Link to="/register/role" className="text-[#1B3A2D] font-bold hover:underline mr-1">
            انضم إلينا الآن
          </Link>
        </div>
      </div>
    </div>
  );
}