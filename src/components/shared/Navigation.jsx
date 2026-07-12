import React from 'react';
import { Search, Calendar, User, PlusCircle } from 'lucide-react';

export default function Navigation({ role, activeTab, setActiveTab }) {
  const tabs = role === 'B2C' ? [
    { id: 'search', label: 'Пошук', icon: Search },
    { id: 'myshifts', label: 'Заходи', icon: Calendar },
    { id: 'profile', label: 'Профіль', icon: User }
  ] : [
    { id: 'manage', label: 'Зміни', icon: Calendar },
    { id: 'create', label: 'Створити', icon: PlusCircle },
    { id: 'profile', label: 'Профіль', icon: User }
  ];

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[418px] bg-white shadow-xl rounded-[32px] px-2 py-3 z-[100] flex justify-around items-center ${
      role === 'B2B' ? 'md:hidden' : ''
    }`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const IconComponent = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center justify-center w-20 transition-all duration-150 active:scale-95"
          >
            <div className={`p-2 rounded-full transition-all duration-200 ${isActive ? 'bg-orange-50 text-[#f97316]' : 'text-gray-400'}`}>
              <IconComponent size={18} />
            </div>
            <span className={`text-[9px] font-black mt-1 tracking-tight ${isActive ? 'text-[#f97316]' : 'text-gray-400'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
