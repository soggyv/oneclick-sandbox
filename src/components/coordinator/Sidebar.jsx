import React from 'react';
import { Calendar, PlusCircle, User, LogOut, Sun, Moon } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function Sidebar({
  activeTab,
  setActiveTab,
  organization,
  toggleRole,
  handleSignOut,
  user
}) {
  const { theme, toggleTheme } = useStore();

  const tabs = [
    { id: 'manage', label: 'Керування заходами', icon: Calendar },
    { id: 'create', label: 'Створити новий захід', icon: PlusCircle },
    { id: 'profile', label: 'Профіль та команда', icon: User }
  ];

  return (
    <div className="hidden md:flex flex-col justify-between w-64 bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border p-6 shrink-0 h-full transition-colors duration-300">
      <div>
        {/* Brand Logo */}
        <div className="mb-8 px-2 text-left flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black leading-none tracking-tight">
              <span className="text-[#FF5522]">One</span><span className="text-gray-950 dark:text-dark-text-header">Click</span>
            </h1>
            <span className="text-[8px] text-[#FF5522] font-black uppercase tracking-widest block mt-1.5">Панель організатора</span>
          </div>
          
          {/* Mini Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 bg-gray-50 dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-dark-card-hover text-gray-700 dark:text-dark-text-body rounded-xl transition-all cursor-pointer border border-gray-100 dark:border-dark-border"
            title={theme === 'light' ? "Увімкнути темну тему" : "Увімкнути світлу тему"}
          >
            {theme === 'light' ? <Moon size={14} /> : <Sun size={14} className="text-amber-400" />}
          </button>
        </div>

        {/* Org Info */}
        {organization && (
          <div className="bg-orange-50/50 dark:bg-orange-950/20 border border-orange-100/50 dark:border-orange-900/30 rounded-2xl p-4 mb-6 text-left transition-colors duration-300">
            <p className="text-[8px] text-gray-400 dark:text-dark-text-muted font-bold uppercase tracking-widest mb-0.5">Діюча компанія</p>
            <h3 className="text-xs font-black text-gray-800 dark:text-dark-text-header truncate">{organization.name}</h3>
            <p className="text-[9px] text-gray-400 dark:text-dark-text-muted font-semibold truncate leading-tight mt-0.5">{organization.address}</p>
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#FF5522] text-white shadow-md shadow-orange-500/10'
                    : 'text-gray-500 dark:text-dark-text-muted hover:text-gray-900 dark:hover:text-dark-text-header hover:bg-gray-50 dark:hover:bg-dark-card-hover/50'
                }`}
              >
                <IconComponent size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-2.5 pt-6 border-t border-gray-100 dark:border-dark-border">
        <div className="px-2 pb-2 text-left flex justify-between items-center">
          <div>
            <p className="text-[8px] text-gray-400 dark:text-dark-text-muted font-bold uppercase tracking-widest">Користувач</p>
            <p className="text-xs font-extrabold text-gray-800 dark:text-dark-text-header truncate max-w-[140px]">{user.name}</p>
          </div>
          
          {/* B2B / B2C Toggle Button */}
          <button
            onClick={toggleRole}
            className="px-2.5 py-1 text-[8.5px] font-black text-[#FF5522] dark:text-[#FF5522]/90 bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/30 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-950/60 transition-all cursor-pointer"
          >
            Волонтер
          </button>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full py-3 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-bold rounded-2xl border border-red-100 dark:border-red-900/30 transition-all active:scale-95 text-[10px] uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
        >
          <LogOut size={13} />
          <span>Вийти з акаунту</span>
        </button>
      </div>
    </div>
  );
}
