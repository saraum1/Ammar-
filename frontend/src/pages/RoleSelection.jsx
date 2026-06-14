import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2 } from 'lucide-react';

export default function RoleSelection() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-[#FAF7F0] px-4" dir="rtl">
      <div className="bg-white p-10 rounded-xl border border-gray-200 max-w-md w-full">
        <h1 className="text-3xl font-black text-gray-900 mb-1 text-right">انضم إلينا</h1>
        <p className="text-gray-400 mb-8 text-sm text-right">اختر نوع الحساب للبدء في رحلتك مع عمار</p>
        <div className="space-y-3">
          <button
            onClick={() => navigate('/register/client')}
            className="w-full text-right p-5 border border-gray-200 rounded-lg hover:border-[#1B3A2D] hover:bg-[#F7F4EE] transition-all flex items-center gap-4"
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
            className="w-full text-right p-5 border border-gray-200 rounded-lg hover:border-[#1B3A2D] hover:bg-[#F7F4EE] transition-all flex items-center gap-4"
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
      </div>
    </div>
  );
}
