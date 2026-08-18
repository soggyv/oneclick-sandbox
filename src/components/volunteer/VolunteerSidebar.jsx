import React from 'react';
import { Search, Calendar, User, LogOut, Building2, Sun, Moon, Star } from 'lucide-react';

export default function VolunteerSidebar({
  activeTab,
  setActiveTab,
  user,
  organization,
  toggleRole,
  handleSignOut,
  isDark,
  toggleTheme,
  API_URL
}) {
  const tabs = [
    { id: 'search', label: 'Пошук заходів', icon: Search },
    { id: 'myshifts', label: 'Мої заходи', icon: Calendar },
    { id: 'profile', label: 'Профіль волонтера', icon: User }
  ];

  return (
    <div className="hidden md:flex flex-col justify-between w-64 bg-white dark:bg-[#18181B] border-r border-gray-200 dark:border-zinc-800 p-6 shrink-0 h-full">
      <div>
        {/* Brand Logo */}
        <div className="mb-8 px-2 text-left">
          <h1 className="text-xl font-black leading-none tracking-tight">
            <span className="text-[#FF5522]">One</span><span className="text-gray-950 dark:text-zinc-200">Click</span>
          </h1>
          <span className="text-[8px] text-[#FF5522] font-black uppercase tracking-widest block mt-1.5">Кабінет волонтера</span>
        </div>

        {/* Volunteer Card */}
        {user && (
          <div
            onClick={() => setActiveTab('profile')}
            className="bg-orange-50/50 dark:bg-zinc-800/80 border border-orange-100/50 dark:border-zinc-700/50 hover:border-[#FF5522]/40 dark:hover:border-zinc-600 rounded-2xl p-4 mb-6 text-left flex items-center gap-3 cursor-pointer transition-all active:scale-[0.98]"
            title="Перейти у ваш профіль"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#FF5522] text-white font-black text-sm flex items-center justify-center shrink-0 border-2 border-white dark:border-zinc-700 shadow-sm">
              {user.avatar_url ? (
                <img
                  src={`${API_URL.replace('/api', '')}${user.avatar_url}`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                user.name ? user.name.charAt(0).toUpperCase() : 'У'
              )}
            </div>
            <div className="overflow-hidden">
              <h3 className="text-xs font-black text-gray-800 dark:text-zinc-200 truncate">{user.name}</h3>
              <div className="flex items-center gap-1 mt-0.5">
                <Star size={10} className="fill-yellow-400 text-yellow-500 dark:fill-orange-500 dark:text-orange-500" />
                <span className="text-[10px] font-extrabold text-gray-600 dark:text-zinc-400">
                  {user.rating ? `${user.rating} / 5.0` : 'Волонтер'}
                </span>
              </div>
            </div>
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
                    ? 'bg-[#FF5522] dark:bg-orange-500 text-white shadow-md shadow-orange-500/10'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800'
                }`}
              >
                <IconComponent size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-2.5 pt-6 border-t border-gray-100 dark:border-zinc-800/80">
        {organization && (
          <button
            onClick={toggleRole}
            className="w-full py-3 px-3 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/30 dark:hover:bg-orange-950/50 text-[#FF5522] dark:text-orange-400 font-bold rounded-2xl border border-orange-200/50 dark:border-transparent transition-all active:scale-95 text-[10px] uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
          >
            <Building2 size={13} />
            <span>Кабінет B2B</span>
          </button>
        )}

        <button
          onClick={toggleTheme}
          className="w-full py-2.5 px-3 bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 font-bold rounded-2xl border border-gray-200/60 dark:border-transparent transition-all active:scale-95 text-[10px] uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
        >
          {isDark ? <Sun size={13} className="text-[#FF5522]" /> : <Moon size={13} className="text-[#FF5522]" />}
          <span>{isDark ? "Світла тема" : "Темна тема"}</span>
        </button>

        <button
          onClick={handleSignOut}
          className="w-full py-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400 font-bold rounded-2xl border border-red-100 dark:border-transparent transition-all active:scale-95 text-[10px] uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
        >
          <LogOut size={13} />
          <span>Вийти з акаунту</span>
        </button>
      </div>
    </div>
  );
}
