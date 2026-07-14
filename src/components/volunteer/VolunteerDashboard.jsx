import React, { useState } from 'react';
import { Building2, Search, Clock, MapPin, RotateCw, Sun, Moon } from 'lucide-react';
import { useStore } from '../../store/useStore';
import CalendarSelector from './CalendarSelector';
import SphereFilters from './SphereFilters';

export default function VolunteerDashboard({
  shifts,
  searchQuery,
  setSearchQuery,
  b2cFilters,
  selectedFilter,
  setSelectedFilter,
  calendarDays,
  selectedDateStr,
  setSelectedDateStr,
  setCurrentDetailsShift,
  toggleRole,
  organization,
  isDark,
  toggleTheme
}) {
  const loadData = useStore((state) => state.loadData);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData(selectedDateStr, selectedFilter, searchQuery, true); // force load
    setIsRefreshing(false);
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-5">
        <div className="text-left">
          <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-zinc-100">Пошук заходів</h1>
          <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Знайдіть волонтерські завдання</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2.5 bg-gray-50 border border-transparent hover:bg-gray-100 dark:bg-[#27272A] dark:border-transparent dark:hover:bg-zinc-700 text-gray-500 hover:text-gray-900 dark:text-zinc-300 dark:hover:text-zinc-100 rounded-full shadow-sm transition-all active:scale-90 cursor-pointer flex items-center justify-center"
            title={isDark ? "Світла тема" : "Темна тема"}
          >
            {isDark ? <Sun size={14} className="text-[#FF5522]" /> : <Moon size={14} className="text-[#FF5522]" />}
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2.5 bg-gray-50 border border-transparent hover:bg-gray-100 dark:bg-[#27272A] dark:border-transparent dark:hover:bg-zinc-700 text-gray-500 hover:text-gray-900 dark:text-zinc-300 dark:hover:text-zinc-100 rounded-full shadow-sm transition-all active:scale-90 cursor-pointer flex items-center justify-center"
            title="Оновити дані"
          >
            <RotateCw size={14} className={isRefreshing ? "animate-spin text-[#FF5522]" : ""} />
          </button>
        </div>
      </div>

      {/* 14-day calendar */}
      <CalendarSelector
        calendarDays={calendarDays}
        selectedDateStr={selectedDateStr}
        setSelectedDateStr={setSelectedDateStr}
      />

      {/* Search Bar */}
      <div className="mb-4 relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-zinc-500">
          <Search size={14} />
        </span>
        <input
          type="text"
          placeholder="Пошук за напрямком, локацією, описом..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-[#27272A] border border-gray-200 dark:border-transparent rounded-full pl-9 pr-4 py-2.5 text-xs font-semibold text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm placeholder:text-gray-400 dark:placeholder:text-zinc-500"
        />
      </div>

      {/* Filters */}
      <SphereFilters
        b2cFilters={b2cFilters}
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
      />

      {/* Shift Feed */}
      <div className="space-y-4 mt-1">
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] font-extrabold text-gray-400 dark:text-zinc-550 uppercase tracking-widest">
            Доступні події ({shifts.length})
          </span>
          <span className="text-[10px] text-gray-500 dark:text-zinc-400 font-bold uppercase tracking-wider">
            Одеса
          </span>
        </div>

        {shifts.length > 0 ? (
          shifts.map((shift) => (
            <div
              key={shift.id}
              onClick={() => setCurrentDetailsShift(shift)}
              className="bg-white dark:bg-[#27272A] rounded-2xl p-5 border border-gray-100 dark:border-transparent shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 active:scale-[0.98] text-left"
            >
              <div className="flex justify-between items-center gap-2 mb-2">
                <span className="px-2.5 py-1 bg-gray-50 dark:bg-zinc-800/80 text-[9px] font-extrabold text-gray-500 dark:text-zinc-400 rounded-full tracking-wider uppercase">
                  {shift.category}
                </span>
                <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full uppercase tracking-wider ${(shift.approved_count || 0) >= shift.max_volunteers
                    ? 'bg-red-50 text-red-500 border border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-transparent'
                    : 'bg-green-50 text-green-600 border border-green-100 dark:bg-green-950/20 dark:text-green-400 dark:border-transparent'
                  }`}>
                  {(shift.approved_count || 0) >= shift.max_volunteers
                    ? 'Місць немає'
                    : 'Вільне місце'}
                </span>
              </div>

              <h3 className="font-black text-gray-900 dark:text-zinc-200 text-base leading-snug mb-1.5">
                {shift.title}
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-zinc-500 font-bold mb-3 flex items-center gap-1.5">
                <Building2 size={13} className="text-gray-300 dark:text-zinc-600" />
                <span>Організатор: {shift.organization_name}</span>
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-gray-50 dark:border-transparent text-[10px] text-gray-500 dark:text-zinc-400 font-bold">
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-[#FF5522] dark:text-[#F97316]" />
                  <span>{shift.time}</span>
                </span>
                <span className="flex items-center gap-0.5 font-medium">
                  <MapPin size={12} className="text-gray-400 dark:text-zinc-500" />
                  <span>{shift.location}</span>
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-[#27272A] rounded-2xl p-8 border border-gray-100 dark:border-transparent shadow-sm text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center text-gray-400 dark:text-zinc-500 mb-3">
              <Search size={20} />
            </div>
            <h4 className="font-bold text-gray-800 dark:text-zinc-200 text-xs mb-1">Подій не знайдено</h4>
            <p className="text-[10px] text-gray-400 dark:text-zinc-500 max-w-[180px] mx-auto leading-relaxed">
              Немає активних ініціатив на обраний день.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
