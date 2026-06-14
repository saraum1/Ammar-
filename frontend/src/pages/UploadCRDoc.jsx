import React, { useState } from "react";
import { Upload, CheckCircle } from "lucide-react";
export default function UploadCRDoc() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [crFile,   setCrFile]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState("");
  const [error,    setError]    = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError("أدخل اسم المستخدم وكلمة المرور"); return; }
    if (!crFile)                 { setError("اختر ملف PDF أولاً"); return; }
    setError("");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("crDoc",    crFile);
      fd.append("username", username);
      fd.append("password", password);
      const res  = await fetch("/api/auth/upload-cr-doc-open", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.message || data.error || "حدث خطأ"); return; }
      setSuccess("تم رفع ملف السجل التجاري بنجاح. سيراجعه الأدمن قريباً.");
    } catch {
      setError("تعذر الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-[#1B3A2D] mb-2">رفع ملف السجل التجاري</h2>
        <p className="text-gray-500 text-sm text-center mb-8">للشركات التي سجّلت ولم يُرفع ملفها</p>
        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-green-600 font-semibold">{success}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl">{error}</p>}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">اسم المستخدم</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#C4956A] text-right"
                placeholder="اسم المستخدم الخاص بالشركة"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:border-[#C4956A] text-right"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                ملف السجل التجاري <span className="text-red-500">*</span>
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center cursor-pointer transition-colors ${crFile ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-[#C4956A] bg-gray-50"}`}
                onClick={() => document.getElementById("crInput").click()}
              >
                <input
                  id="crInput"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={e => { setCrFile(e.target.files[0] || null); setError(""); }}
                />
                {crFile ? (
                  <>
                    <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                    <p className="text-sm text-green-700 font-semibold">{crFile.name}</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">اضغط لاختيار ملف PDF</p>
                  </>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1B3A2D] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#254E3D] shadow-md transition-all disabled:opacity-60"
            >
              {loading ? "جاري الرفع..." : "رفع الملف"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}