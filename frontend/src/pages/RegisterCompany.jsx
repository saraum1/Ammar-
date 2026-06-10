import React, { useState } from "react";
import { Upload, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RegisterCompany() {
  const navigate = useNavigate();
  const [crFile, setCrFile] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    ownerName: "",
    phone: "",
    email: "",
    username: "",
    password: "",
    type: "full_construction",
    commercialRegistrationNumber: "",
    vatNumber: "",
    establishmentNumber: ""
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: false, general: false });
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (
      !form.firstName ||
      !form.lastName ||
      !form.ownerName ||
      !form.phone ||
      !form.email ||
      !form.username ||
      !form.password ||
      !form.type
    ) {
      newErrors.general = "جميع الحقول المطلوبة يجب تعبئتها";
    }

    if (!crFile) {
      newErrors.crFile = "يجب رفع ملف السجل التجاري (PDF) قبل إرسال الطلب";
    }

    if (form.username && form.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (form.password && form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Invalid email format";
    }

    if (
      form.commercialRegistrationNumber &&
      isNaN(form.commercialRegistrationNumber)
    ) {
      newErrors.commercialRegistrationNumber = "Commercial registration number must be a number";
    }

    if (form.vatNumber && isNaN(form.vatNumber)) {
      newErrors.vatNumber = "VAT number must be a number";
    }

    if (form.establishmentNumber && isNaN(form.establishmentNumber)) {
      newErrors.establishmentNumber = "Establishment number must be a number";
    }

    if (!form.phone) {
      newErrors.phone = "رقم الجوال مطلوب";
    } else if (!/^05\d{8}$/.test(form.phone)) {
      newErrors.phone = "رقم الجوال يجب أن يكون 10 أرقام ويبدأ بـ 05";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length !== 0) return;

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
          role: "company",
          ownerName: form.ownerName,
          type: form.type,
          commercialRegistrationNumber: form.commercialRegistrationNumber,
          vatNumber: form.vatNumber,
          establishmentNumber: form.establishmentNumber
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.message || "فشل التسجيل" });
        return;
      }

      if (crFile && data.data?.token) {
        const fd = new FormData();
        fd.append("crDoc", crFile);
        const uploadRes = await fetch("/api/auth/upload-cr-doc", {
          method: "POST",
          headers: { Authorization: `Bearer ${data.data.token}` },
          body: fd
        });
        if (!uploadRes.ok) {
          const uploadData = await uploadRes.json().catch(() => ({}));
          setErrors({ general: `تم التسجيل لكن فشل رفع ملف السجل التجاري: ${uploadData.message || uploadData.error || "خطأ غير معروف"}` });
          return;
        }
      }

      setSuccess("تم إرسال طلب التسجيل بنجاح وتم رفع ملف السجل التجاري ✓ سيتم مراجعة بياناتك والرد عليك قريباً");
    } catch (error) {
      setErrors({ general: "تعذر الاتصال بالسيرفر" });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] py-12 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-[#1B3A2D] mb-8">
          تسجيل شركة جديدة
        </h2>

        {errors.general && (
          <p className="text-red-500 text-sm text-center mb-4">{errors.general}</p>
        )}

        {success && (
          <p className="text-green-600 text-sm text-center mb-4">{success}</p>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-right">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">الاسم الأول</label>
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
            <label className="block text-sm font-medium mb-2 text-gray-700">الاسم الأخير</label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              type="text"
              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#C4956A]"
              placeholder="العلي"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">اسم الشركة</label>
            <input
              name="ownerName"
              value={form.ownerName}
              onChange={handleChange}
              type="text"
              className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#C4956A]"
              placeholder="شركة العمار للمقاولات"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">رقم الجوال</label>
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

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">البريد الإلكتروني للشركة</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              className={`w-full p-3 rounded-xl border outline-none focus:border-[#C4956A] ${
                errors.email ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="company@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">اسم المستخدم</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              type="text"
              className={`w-full p-3 rounded-xl border outline-none focus:border-[#C4956A] ${
                errors.username ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="Ammar_Company"
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-gray-700">كلمة المرور</label>
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
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-gray-700">نوع الخدمة المقدمة</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-gray-200 outline-none bg-white focus:border-[#C4956A]"
            >
              <option value="full_construction">شركة هندسية</option>
              <option value="partial_construction">شركة مقاولات</option>
              <option value="materials_supplier">مورد بناء</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">رقم السجل التجاري <span className="text-gray-400 font-normal">(اختياري)</span></label>
            <input
              name="commercialRegistrationNumber"
              value={form.commercialRegistrationNumber}
              onChange={handleChange}
              type="text"
              className={`w-full p-3 rounded-xl border outline-none focus:border-[#C4956A] ${
                errors.commercialRegistrationNumber ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="10xxxxxxxx"
            />
            {errors.commercialRegistrationNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.commercialRegistrationNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">الرقم الضريبي VAT <span className="text-gray-400 font-normal">(اختياري)</span></label>
            <input
              name="vatNumber"
              value={form.vatNumber}
              onChange={handleChange}
              type="text"
              className={`w-full p-3 rounded-xl border outline-none focus:border-[#C4956A] ${
                errors.vatNumber ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="3xxxxxxxxxxxxxx"
            />
            {errors.vatNumber && <p className="text-red-500 text-xs mt-1">{errors.vatNumber}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-gray-700">رقم المنشأة <span className="text-gray-400 font-normal">(اختياري)</span></label>
            <input
              name="establishmentNumber"
              value={form.establishmentNumber}
              onChange={handleChange}
              type="text"
              className={`w-full p-3 rounded-xl border outline-none focus:border-[#C4956A] ${
                errors.establishmentNumber ? "border-red-500" : "border-gray-200"
              }`}
              placeholder="7xxxxxxxx"
            />
            {errors.establishmentNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.establishmentNumber}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2 text-gray-700">
              إرفاق السجل التجاري (PDF) <span className="text-red-500">*</span>
            </label>
            <div
              className={`relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                crFile
                  ? "border-green-400 bg-green-50"
                  : errors.crFile
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200 hover:border-[#C4956A] bg-gray-50"
              }`}
              onClick={() => document.getElementById("crFileInput").click()}
            >
              <input
                id="crFileInput"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={e => {
                  setCrFile(e.target.files[0] || null);
                  setErrors(prev => ({ ...prev, crFile: false }));
                }}
              />
              {crFile ? (
                <>
                  <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                  <p className="text-sm text-green-700 font-semibold">{crFile.name}</p>
                  <p className="text-xs text-green-500 mt-1">تم اختيار الملف ✓</p>
                </>
              ) : (
                <>
                  <Upload className={`w-8 h-8 mb-2 ${errors.crFile ? "text-red-400" : "text-gray-400"}`} />
                  <p className={`text-sm ${errors.crFile ? "text-red-500 font-semibold" : "text-gray-500"}`}>
                    {errors.crFile ? "⚠️ هذا الحقل مطلوب — اضغط لرفع الملف" : "اضغط هنا لرفع الملف أو اسحبه للمربع"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF فقط — حد أقصى 5MB</p>
                </>
              )}
            </div>
            {errors.crFile && (
              <p className="text-red-500 text-xs mt-1">{errors.crFile}</p>
            )}
          </div>

          <button
            type="submit"
            className="md:col-span-2 bg-[#1B3A2D] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#254E3D] shadow-lg mt-6 transition-all active:scale-[0.98]"
          >
            إرسال طلب الانضمام لعمار
          </button>
        </form>
      </div>
    </div>
  );
}
