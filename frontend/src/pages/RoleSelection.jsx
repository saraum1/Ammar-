import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2 } from 'lucide-react';
export default function RoleSelection() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-gray-50 px-4">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">انضم إلينا</h1>
        <p className="text-gray-500 mb-8">اختر نوع الحساب للبدء في رحلتك مع عمار</p>
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/register/client')}
            className="w-full flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-[#1B3A2D] hover:bg-[#E8F0EC] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F0E4D0] flex items-center justify-center text-[#1B3A2D]">
                <User size={24} />
              </div>
              <span className="font-bold text-lg text-gray-700"> عميل</span>
            </div>
            <span className="text-[#1B3A2D] opacity-0 group-hover:opacity-100">←</span>
          </button>
          <button 
            onClick={() => navigate('/register/company')}
            className="w-full flex items-center justify-between p-4 border-2 border-gray-100 rounded-xl hover:border-[#1B3A2D] hover:bg-[#E8F0EC] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#F0E4D0] flex items-center justify-center text-[#1B3A2D]">
                <Building2 size={24} />
              </div>
              <span className="font-bold text-lg text-gray-700"> شركة</span>
            </div>
            <span className="text-[#1B3A2D] opacity-0 group-hover:opacity-100">←</span>
          </button>
        </div>
      </div>
    </div>
  );
}