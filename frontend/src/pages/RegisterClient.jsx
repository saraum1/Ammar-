import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import heroBgImg from "../assets/hero-bg.png";
export default function RegisterClient() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    phone: "",
    email: "",
    password: ""
  });
  const [errors,        setErrors]        = useState({});
  const [success,       setSuccess]       = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    setErrors({
      ...errors,
      [e.target.name]: "",
      general: ""
    });
    setSuccess("");
  };
  const validateForm = () => {
    const newErrors = {};
    if (!form.firstName || !form.lastName || !form.username || !form.email || !form.password || !form.phone) {
      newErrors.general = "All required fields are required";
    }
    if (!form.username) {
      newErrors.username = "اسم المستخدم مطلوب";
    } else if (form.username.length < 3) {
      newErrors.username = "اسم المستخدم يجب أن يكون 3 أحرف على الأقل";
    } else if (form.username.length > 20) {
      newErrors.username = "اسم المستخدم لا يتجاوز 20 حرفاً";
    } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
      newErrors.username = "يُسمح فقط بأحرف إنجليزية وأرقام وشرطة سفلية (_)";
    }
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!form.phone) {
      newErrors.phone = "رقم الجوال مطلوب";
    } else if (!/^05\d{8}$/.test(form.phone)) {
      newErrors.phone = "رقم الجوال يجب أن يكون 10 أرقام ويبدأ بـ 05";
    }
    return newErrors;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    setErrors(newErrors);
    if (Object.keys(newErrors).length !== 0) {
      return;
    }
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          username: form.username,
          email: form.email,
          password: form.password,
          phone: form.phone,
          role: "client"
        })
      });
      const data = await response.json();
      if (!response.ok) {
        setErrors({ general: data.message || "Registration failed" });
        return;
      }
      setSuccess("User registered successfully");
      setForm({
        firstName: "",
        lastName: "",
        username: "",
        phone: "",
        email: "",
        password: ""
      });
    } catch (error) {
      setErrors({ general: "Cannot connect to server" });
    }
  };
  const handleGoogleSuccess = async ({ credential }) => {
    setGoogleLoading(true);
    try {
      const res  = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (!res.ok) { setErrors({ general: data.message || "فشل التسجيل بقوقل" }); return; }
      login(data.token, data.data);
      navigate("/home");
    } catch {
      setErrors({ general: "تعذر الاتصال بالسيرفر" });
    } finally {
      setGoogleLoading(false);
    }
  };
  return (
    <div
      className="min-h-screen py-12 px-4 relative"
      style={{
        backgroundImage: `url(${heroBgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
      dir="rtl"
    >
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(160deg, rgba(15,33,25,0.96) 0%, rgba(27,58,45,0.9) 100%)" }}
      />
      <div className="max-w-2xl mx-auto bg-white rounded-xl p-10 border border-gray-200 relative z-10">
        <h2 className="text-3xl font-bold text-center text-[#1B3A2D] mb-8">
          إنشاء حساب عميل
        </h2>
        {errors.general && (
          <p className="text-red-500 text-sm text-center mb-4">
            {errors.general}
          </p>
        )}
        {success && (
          <p className="text-green-600 text-sm text-center mb-4">
            {success}
          </p>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              الاسم الأول (First Name)
            </label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              type="text"
              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#C4956A]"
              placeholder="سارة"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              الاسم الأخير (Last Name)
            </label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              type="text"
              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#C4956A]"
              placeholder="الموكلي"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              اسم المستخدم (Username)
            </label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              type="text"
              className={`w-full p-3 rounded-xl border outline-none focus:border-[#C4956A] ${
                errors.username ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="sara_2026"
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              رقم الجوال
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              type="tel"
              maxLength={10}
              className={`w-full p-3 rounded-xl border outline-none focus:border-[#C4956A] ${
                errors.phone ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="05xxxxxxxx"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              البريد الإلكتروني
            </label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              className={`w-full p-3 rounded-xl border outline-none focus:border-[#C4956A] ${
                errors.email ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="example@mail.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              كلمة المرور
            </label>
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              type="password"
              className={`w-full p-3 rounded-xl border outline-none focus:border-[#C4956A] ${
                errors.password ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>
          <button
            type="submit"
            className="md:col-span-2 bg-[#1B3A2D] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#254E3D] shadow-lg mt-4 transition-all"
          >
            إنشاء حسابي في عمار
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
              جاري التسجيل...
            </div>
          ) : (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setErrors({ general: "فشل التسجيل بقوقل" })}
                locale="ar"
                text="signup_with"
                shape="rectangular"
                theme="outline"
                size="large"
                width="360"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}