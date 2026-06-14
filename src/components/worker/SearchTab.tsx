'use client';

import React from 'react';
import Image from 'next/image';
import { useAppContext } from '../../context/AppContext';

export const SearchTab: React.FC = () => {
  const {
    language,
    t,
    shifts,
    myShifts,
    searchQuery,
    setSearchQuery,
    selectedDate,
    setSelectedDate,
    selectedCategory,
    setSelectedCategory,
    setSelectedJob,
    setShowJobDetails,
    setShowMap,
    handleApply
  } = useAppContext();

  // Filters shifts according to category, date, and query
  const filteredShifts = shifts.filter(job => {
    const matchesCategory = selectedCategory === 'Всі' || job.type === selectedCategory;
    const matchesDate = job.date === selectedDate;
    const matchesQuery = !searchQuery || 
      job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesDate && matchesQuery;
  });

  return (
    <div className="animate-fade-in p-4 space-y-4">
      {/* Search and view toggle */}
      <div className="flex gap-2">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center px-4 py-3 gap-3 flex-1">
          <span className="material-symbols-outlined text-secondary dark:text-slate-400">search</span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'uk' ? 'Пошук професії чи компанії...' : 'Search role or company...'}
            className="font-medium text-sm flex-1 bg-transparent border-none outline-none text-on-surface dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="material-symbols-outlined text-gray-400 text-sm hover:text-on-surface">close</button>
          )}
        </div>
        <button 
          onClick={() => setShowMap(true)} 
          className="bg-oneclick-navy dark:bg-slate-800 text-white rounded-2xl w-12 h-12 flex items-center justify-center shadow-md border border-gray-100 dark:border-slate-700 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined">map</span>
        </button>
      </div>

      {/* Date Selector */}
      <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
        {[
          { day: '15', label: t.mon },
          { day: '16', label: t.tue },
          { day: '17', label: t.wed },
          { day: '18', label: t.thu },
          { day: '19', label: t.fri },
        ].map((item) => (
          <button
            key={item.day}
            onClick={() => setSelectedDate(item.day)}
            className={`flex flex-col items-center justify-center min-w-[64px] h-[78px] rounded-2xl border transition-all cursor-pointer ${
              selectedDate === item.day
                ? 'date-tab-active border-transparent'
                : 'bg-white dark:bg-slate-800 border-gray-200/60 dark:border-slate-700 text-secondary dark:text-slate-400'
            }`}
          >
            <span className="text-[10px] uppercase font-bold tracking-wider opacity-75 mb-1">{item.label}</span>
            <span className="text-xl font-extrabold leading-none">{item.day}</span>
          </button>
        ))}
      </div>

      {/* Category Filter Chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {['Всі', 'Склади', 'Рітейл', 'Кафе', 'Кур\'єр'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
              selectedCategory === cat
                ? 'bg-oneclick-navy dark:bg-white text-white dark:text-oneclick-navy border-transparent shadow-sm'
                : 'bg-white dark:bg-slate-800 text-secondary dark:text-slate-400 border-gray-200/60 dark:border-slate-700 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Shift Feed */}
      <div className="space-y-4 pt-2">
        {filteredShifts.length > 0 ? (
          filteredShifts.map((job) => (
            <div 
              key={job.id} 
              className={`rounded-2xl p-5 premium-card shadow-card border transition-all duration-300 relative group cursor-pointer ${
                job.hot 
                  ? 'bg-gradient-to-b from-white to-orange-50/20 dark:from-slate-800 dark:to-orange-900/10 border-orange-200/50 dark:border-orange-900/30 shadow-premium-glow' 
                  : 'bg-white dark:bg-slate-800 border-gray-100 dark:border-slate-800'
              }`}
              onClick={() => {
                setSelectedJob(job);
                setShowJobDetails(true);
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-slate-600 relative shrink-0">
                    {job.logo ? (
                      <Image src={job.logo} alt={job.company} fill className="object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-oneclick-navy dark:text-white text-2xl">{job.icon}</span>
                    )}
                  </div>
                  <div className="text-left">
                    {job.hot && (
                      <span className="bg-warning-amber text-white text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 w-fit mb-1 shadow-sm">
                        <span className="material-symbols-outlined text-[10px] font-bold">local_fire_department</span>
                        {t.hot}
                      </span>
                    )}
                    <h3 className="text-base font-extrabold text-oneclick-navy dark:text-white leading-tight group-hover:text-oneclick-orange transition-colors">{job.role}</h3>
                    <p className="text-xs text-secondary dark:text-slate-400 font-semibold mt-0.5">{job.company} • {job.dist}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-oneclick-orange leading-none">{job.price} ₴</div>
                  <div className="text-[9px] uppercase tracking-wider font-extrabold text-secondary dark:text-slate-500 mt-1">{t.perShift}</div>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-gray-100/50 dark:border-slate-700/50 mt-1">
                <div className="flex items-center gap-1.5 text-xs text-oneclick-navy dark:text-slate-300 font-bold">
                  <span className="material-symbols-outlined text-oneclick-orange text-base font-bold">schedule</span>
                  <span>{job.time}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-success-green font-bold">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  <span>{language === 'uk' ? 'Гарантія виплати' : 'Payout Guarantee'}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedJob(job);
                    setShowJobDetails(true);
                  }}
                  className="flex-1 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-oneclick-navy dark:text-white py-3 rounded-xl font-bold text-xs transition-colors"
                >
                  {t.details}
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApply(job);
                  }}
                  className="flex-[2] bg-oneclick-orange text-white py-3 rounded-xl font-bold text-xs active:scale-95 transition-transform shadow-premium-glow"
                >
                  {myShifts.some(ms => ms.shiftId === job.id) 
                    ? (language === 'uk' ? 'Вже відгукнулися' : 'Already applied') 
                    : t.apply}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-800">
            <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-slate-600 mb-2">work_off</span>
            <p className="text-sm font-bold text-secondary dark:text-slate-400">
              {language === 'uk' ? 'Немає доступних змін на цей день.' : 'No available shifts for this day.'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {language === 'uk' ? 'Спробуйте вибрати іншу дату або категорію' : 'Try selecting another date or category'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
