'use client';

import React from 'react';
import Image from 'next/image';
import { useAppContext } from '../../context/AppContext';

export const ShiftsTab: React.FC = () => {
  const {
    language,
    t,
    myShifts,
    shifts,
    shiftsSubTab,
    setShiftsSubTab,
    setSelectedJob,
    setShowJobDetails,
    setActiveTab,
    handleStartShiftSimulate,
    handleCompleteShiftSimulate
  } = useAppContext();

  const activeUserShifts = myShifts.filter(us => us.status !== 'completed');
  const historyUserShifts = myShifts.filter(us => us.status === 'completed');

  return (
    <div className="animate-fade-in p-4 space-y-4">
      <h2 className="text-2xl font-black text-oneclick-navy dark:text-white text-left">{language === 'uk' ? 'Мої зміни' : 'My Shifts'}</h2>

      {/* Active/History Toggle */}
      <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl">
        <button 
          onClick={() => setShiftsSubTab('active')}
          className={`flex-1 py-3 text-center rounded-xl text-xs font-bold transition-all ${
            shiftsSubTab === 'active'
              ? 'bg-white dark:bg-slate-700 text-oneclick-navy dark:text-white shadow-sm'
              : 'text-secondary dark:text-slate-400'
          }`}
        >
          {t.activeShifts} ({activeUserShifts.length})
        </button>
        <button 
          onClick={() => setShiftsSubTab('history')}
          className={`flex-1 py-3 text-center rounded-xl text-xs font-bold transition-all ${
            shiftsSubTab === 'history'
              ? 'bg-white dark:bg-slate-700 text-oneclick-navy dark:text-white shadow-sm'
              : 'text-secondary dark:text-slate-400'
          }`}
        >
          {t.historyShifts} ({historyUserShifts.length})
        </button>
      </div>

      {/* Sub-tab Content */}
      <div className="space-y-4">
        {shiftsSubTab === 'active' ? (
          activeUserShifts.length > 0 ? (
            activeUserShifts.map((us) => (
              <div 
                key={us.id} 
                className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden"
              >
                {/* Decorative state background glow */}
                {us.status === 'in_progress' && (
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-success-green animate-pulse"></div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-slate-600 relative shrink-0">
                      {us.logo ? (
                        <Image src={us.logo} alt={us.company} fill className="object-cover" />
                      ) : (
                        <span className="material-symbols-outlined text-oneclick-navy dark:text-white text-xl">{us.icon || 'inventory_2'}</span>
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-extrabold text-oneclick-navy dark:text-white leading-tight">{us.role}</h3>
                      <p className="text-[11px] text-secondary dark:text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[12px]">storefront</span> {us.company}
                      </p>
                    </div>
                  </div>

                  {/* Status Tag */}
                  {us.status === 'pending' && (
                    <div className="bg-warning-amber/10 dark:bg-warning-amber/20 text-warning-amber font-bold text-[10px] px-2 py-1 rounded-lg border border-warning-amber/20 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] animate-spin">schedule</span>
                      <span>{language === 'uk' ? 'Очікує' : 'Pending'}</span>
                    </div>
                  )}
                  {us.status === 'confirmed' && (
                    <div className="bg-success-green/10 dark:bg-success-green/20 text-success-green font-bold text-[10px] px-2 py-1 rounded-lg border border-success-green/20 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">check_circle</span>
                      <span>{language === 'uk' ? 'Підтверджено' : 'Confirmed'}</span>
                    </div>
                  )}
                  {us.status === 'in_progress' && (
                    <div className="bg-blue-500/10 dark:bg-blue-500/20 text-blue-500 font-bold text-[10px] px-2 py-1 rounded-lg border border-blue-500/20 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] animate-pulse">autorenew</span>
                      <span>{language === 'uk' ? 'Зміна триває' : 'In Progress'}</span>
                    </div>
                  )}
                  {us.status === 'completed_pending_payout' && (
                    <div className="bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 font-bold text-[10px] px-2 py-1 rounded-lg border border-orange-500/20 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] animate-pulse">pending_actions</span>
                      <span>{language === 'uk' ? 'Очікує оплати' : 'Awaiting Payout'}</span>
                    </div>
                  )}
                </div>

                <div className="h-px w-full bg-gray-100 dark:bg-slate-700 my-3"></div>

                <div className="space-y-2 text-xs text-on-surface dark:text-slate-300 text-left">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-oneclick-orange text-base mt-0.5">calendar_month</span>
                    <div>
                      <p className="font-bold text-oneclick-navy dark:text-white">
                        {language === 'uk' ? `Сьогодні, ${us.date} Жовтня` : `Today, October ${us.date}`}
                      </p>
                      <p className="text-secondary dark:text-slate-400 font-medium">{us.time}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-oneclick-orange text-base mt-0.5">location_on</span>
                    <p className="text-secondary dark:text-slate-400 font-medium">{us.address}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100/50 dark:border-slate-700/50 font-sans">
                  <div className="text-base font-extrabold text-oneclick-navy dark:text-white">
                    {us.price} ₴ <span className="text-[10px] font-medium text-secondary">/ зміну</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        const jobDetails = shifts.find(s => s.id === us.shiftId) || {
                          id: us.shiftId,
                          role: us.role,
                          company: us.company,
                          price: us.price,
                          time: us.time,
                          date: us.date,
                          dist: '1.5 км',
                          hot: false,
                          type: 'Склади' as const,
                          icon: us.icon || 'inventory_2',
                          logo: us.logo,
                          address: us.address,
                          details: 'Дані про зміну з архіву',
                          requirements: ['Охайний вигляд'],
                          responsibilities: ['Виконання завдань менеджера']
                        };
                        setSelectedJob(jobDetails);
                        setShowJobDetails(true);
                      }}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-oneclick-navy dark:text-white bg-gray-100 dark:bg-slate-700 hover:bg-gray-200"
                    >
                      {language === 'uk' ? 'Деталі' : 'Details'}
                    </button>
                    
                    {us.status === 'confirmed' && (
                      <button 
                        onClick={() => handleStartShiftSimulate(us)}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-oneclick-orange shadow-premium-glow active:scale-95 transition-transform"
                      >
                        {t.startShift}
                      </button>
                    )}

                    {us.status === 'in_progress' && (
                      <button 
                        onClick={() => handleCompleteShiftSimulate(us)}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-success-green hover:bg-success-green/90 active:scale-95 transition-transform"
                      >
                        {language === 'uk' ? 'Завершити зміну' : 'Complete Shift'}
                      </button>
                    )}

                    {us.status === 'completed_pending_payout' && (
                      <div className="text-[10px] font-bold text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 px-3 py-2.5 rounded-xl border border-orange-100 dark:border-orange-900/30 flex items-center gap-1 select-none">
                        <span className="material-symbols-outlined text-xs animate-pulse">info</span>
                        <span>{language === 'uk' ? 'Очікує Б2Б підтвердження' : 'Awaiting B2B Approval'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-800">
              <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-slate-600 mb-2">event_busy</span>
              <p className="text-sm font-bold text-secondary dark:text-slate-400">
                {language === 'uk' ? 'Немає запланованих змін.' : 'No active shifts planned.'}
              </p>
              <button 
                onClick={() => setActiveTab('search')}
                className="mt-4 text-xs font-bold text-oneclick-orange underline"
              >
                {language === 'uk' ? 'Знайти підробіток зараз' : 'Find work now'}
              </button>
            </div>
          )
        ) : (
          // History Sub-tab
          historyUserShifts.length > 0 ? (
            historyUserShifts.map((us) => (
              <div 
                key={us.id} 
                className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-gray-100 dark:border-slate-800 shadow-sm text-left"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="bg-success-green/10 text-success-green text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                      {language === 'uk' ? 'Завершено' : 'Completed'}
                    </span>
                    <h3 className="text-sm font-extrabold text-oneclick-navy dark:text-white mt-1.5">{us.role}</h3>
                    <p className="text-xs text-secondary dark:text-slate-400 font-semibold">{us.company} • {us.date} Жовт</p>
                  </div>
                  <div className="text-base font-black text-success-green">+{us.price} ₴</div>
                </div>
                <button className="w-full mt-2 bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 text-secondary dark:text-slate-300 py-2.5 rounded-xl font-bold text-xs border border-gray-100 dark:border-slate-700">
                  {language === 'uk' ? 'Переглянути відгук' : 'View Review'}
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-800">
              <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-slate-600 mb-2">history</span>
              <p className="text-sm font-bold text-secondary dark:text-slate-400">
                {language === 'uk' ? 'Історія змін порожня.' : 'No completed shifts in history.'}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};
