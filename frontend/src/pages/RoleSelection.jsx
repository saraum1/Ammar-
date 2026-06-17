import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { User, Building2 } from 'lucide-react';
import heroBgImg from '../assets/hero-bg.png';

export default function RoleSelection() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex relative" dir="rtl">
      {/* يمين: الهوية والعرض */}
      <div
        className="role-brand-panel flex-1 flex-col justify-center relative overflow-hidden px-16 py-16"
        style={{
          backgroundImage: `url(${heroBgImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(160deg, rgba(15,33,25,0.96) 0%, rgba(27,58,45,0.9) 100%)" }}
        />
        <h1
          className="relative z-10 leading-none mb-4 text-white"
          style={{
            fontFamily: "'Amiri', 'Tajawal', serif",
            fontSize: "clamp(64px, 9vw, 110px)",
            fontWeight: 700,
            letterSpacing: "2px",
          }}
        >
          عمار
        </h1>
        <p className="relative z-10 text-2xl font-semibold leading-relaxed max-w-md text-white/90 mb-3">
          وجهتك الأولى لبناء بيت أحلامك
        </p>
        <p className="relative z-10 text-base leading-loose max-w-md text-white/75">
          عملاء وشركات وموردين، كل خطوات مشروعك تبدأ من مكان واحد.
        </p>
      </div>


      {/* يسار: نموذج اختيار الحساب */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-16">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-black text-gray-900 mb-1 text-right">انضم إلينا</h1>
          <p className="text-gray-400 mb-8 text-sm text-right">اختر نوع الحساب للبدء في رحلتك مع عمار</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/register/client')}
              className="w-full text-right p-5 bg-white border border-gray-200 rounded-lg hover:border-[#1B3A2D] transition-all flex items-center gap-4 shadow-sm hover:shadow-md"
            >
              <div className="w-11 h-11 rounded-lg bg-[#F0E9DF] flex items-center justify-center flex-shrink-0">
                <User size={20} color="#1B3A2D" />
              </div>
              <div className="flex-1 text-right">
                <p className="font-bold text-base text-gray-900 mb-0.5">عميل</p>
                <p className="text-gray-400 text-xs">ابحث عن شركات وأرسل طلبات</p>
              </div>
            </button>
            <button
              onClick={() => navigate('/register/company')}
              className="w-full text-right p-5 bg-white border border-gray-200 rounded-lg hover:border-[#1B3A2D] transition-all flex items-center gap-4 shadow-sm hover:shadow-md"
            >
              <div className="w-11 h-11 rounded-lg bg-[#F0E9DF] flex items-center justify-center flex-shrink-0">
                <Building2 size={20} color="#1B3A2D" />
              </div>
              <div className="flex-1 text-right">
                <p className="font-bold text-base text-gray-900 mb-0.5">شركة / مورد</p>
                <p className="text-gray-400 text-xs">اعرض خدماتك واستقبل طلبات العملاء</p>
              </div>
            </button>
          </div>

          <div className="mt-8 text-center text-sm text-gray-600 border-t border-gray-100 pt-6">
            لديك حساب بالفعل؟
            <Link to="/login" className="font-bold hover:underline mr-1" style={{ color: "#1B3A2D" }}>
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .role-brand-panel { display: none !important; }
        }
      `}</style>
    </div>
  );
}
