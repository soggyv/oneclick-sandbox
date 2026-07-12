import React from 'react';
import { Calendar, PlusCircle, User, LogOut } from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  organization,
  toggleRole,
  handleSignOut,
  user
}) {
  const tabs = [
    { id: 'manage', label: 'Керування заходами', icon: Calendar },
    { id: 'create', label: 'Створити новий захід', icon: PlusCircle },
    { id: 'profile', label: 'Профіль та команда', icon: User }
  ];

  return (
    <div className="hidden md:flex flex-col justify-between w-64 bg-white border-r border-gray-200 p-6 shrink-0 h-full">
      <div>
        {/* Brand Logo */}
        {/* Brand Logo */}
        <div className="mb-8 px-2 text-left">
          <h1 className="text-xl font-black leading-none tracking-tight">
            <span className="text-[#FF5522]">One</span><span className="text-gray-950">Click</span>
          </h1>
          <span className="text-[8px] text-[#FF5522] font-black uppercase tracking-widest block mt-1.5">Панель організатора</span>
        </div>

        {/* Org Info */}
        {organization && (
          <div className="bg-orange-50/50 border border-orange-100/50 rounded-2xl p-4 mb-6 text-left">
            <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">Діюча компанія</p>
            <h3 className="text-xs font-black text-gray-800 truncate">{organization.name}</h3>
            <p className="text-[9px] text-gray-400 font-semibold truncate leading-tight mt-0.5">{organization.address}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#FF5522] text-white shadow-md shadow-orange-500/10'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <IconComponent size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-2.5 pt-6 border-t border-gray-100">
        <div className="px-2 pb-2 text-left">
          <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Користувач</p>
          <p className="text-xs font-extrabold text-gray-800 truncate">{user.name}</p>
        </div>



        <button
          onClick={handleSignOut}
          className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-655 font-bold rounded-2xl border border-red-100 transition-all active:scale-95 text-[10px] uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
        >
          <LogOut size={13} />
          <span>Вийти з акаунту</span>
        </button>
      </div>
    </div>
  );
}
