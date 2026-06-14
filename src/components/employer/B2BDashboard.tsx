'use client';

import React from 'react';
import { useAppContext } from '../../context/AppContext';

export const B2BDashboard: React.FC = () => {
  const {
    language,
    shifts,
    myShifts,
    employerDeposit,
    employerCompany,
    profileName,
    b2bActiveTab,
    setB2bActiveTab,
    handleApproveApplication,
    handleDeclineApplication,
    handleApplyTemplate,
    setShowTopUpModal
  } = useAppContext();

  // Filters shifts and candidate applications for the active company
  const companyShifts = shifts.filter(s => s.company === employerCompany);
  const companyApplications = myShifts.filter(ms => ms.company === employerCompany && ms.status === 'pending');
  const companyHistory = myShifts.filter(ms => ms.company === employerCompany && ms.status === 'completed');

  const stats = {
    deposit: employerDeposit,
    postedCount: companyShifts.length,
    pendingCount: companyApplications.length,
    activeCheckinCount: myShifts.filter(ms => ms.company === employerCompany && ms.status === 'in_progress').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Deposit */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] shadow-sm border border-gray-200/50 dark:border-slate-800 flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-secondary dark:text-slate-400 uppercase tracking-widest">{language === 'uk' ? 'Баланс Депозиту' : 'Deposit Balance'}</p>
            <h3 className="text-2xl font-black text-oneclick-navy dark:text-white">{stats.deposit.toLocaleString('en-US')} ₴</h3>
            <p className="text-[9px] text-success-green font-semibold mt-1">
              {language === 'uk' ? '● Спліт-оплата активована' : '● Split payment active'}
            </p>
          </div>
          <button 
            onClick={() => setShowTopUpModal(true)} 
            className="bg-success-green/10 text-success-green hover:bg-success-green/20 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors"
          >
            {language === 'uk' ? 'Поповнити' : 'Top Up'}
          </button>
        </div>

        {/* Card 2: Shifts count */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] shadow-sm border border-gray-200/50 dark:border-slate-800 flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-secondary dark:text-slate-400 uppercase tracking-widest">{language === 'uk' ? 'Опубліковано змін' : 'Shifts Posted'}</p>
            <h3 className="text-2xl font-black text-oneclick-navy dark:text-white">{stats.postedCount}</h3>
            <p className="text-[9px] text-secondary dark:text-slate-500 font-semibold mt-1">
              {language === 'uk' ? 'Для тимчасових працівників' : 'For temporary workers'}
            </p>
          </div>
          <div className="w-10 h-10 bg-oneclick-navy/5 dark:bg-white/5 rounded-xl flex items-center justify-center text-oneclick-orange">
            <span className="material-symbols-outlined text-xl">list_alt</span>
          </div>
        </div>

        {/* Card 3: Applications count */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] shadow-sm border border-gray-200/50 dark:border-slate-800 flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-secondary dark:text-slate-400 uppercase tracking-widest">{language === 'uk' ? 'Отримано заявок' : 'New Applications'}</p>
            <h3 className="text-2xl font-black text-oneclick-navy dark:text-white">{stats.pendingCount}</h3>
            <p className="text-[9px] text-warning-amber font-semibold mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-warning-amber rounded-full animate-ping"></span>
              {language === 'uk' ? 'Потребують відповіді' : 'Awaiting response'}
            </p>
          </div>
          <button 
            onClick={() => setB2bActiveTab('applications')}
            className="bg-oneclick-orange/10 text-oneclick-orange hover:bg-oneclick-orange/20 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors"
          >
            {language === 'uk' ? 'Огляд' : 'Review'}
          </button>
        </div>

        {/* Card 4: Active workers */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] shadow-sm border border-gray-200/50 dark:border-slate-800 flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-secondary dark:text-slate-400 uppercase tracking-widest">{language === 'uk' ? 'Працюють зараз' : 'Active Workers'}</p>
            <h3 className="text-2xl font-black text-oneclick-navy dark:text-white">{stats.activeCheckinCount}</h3>
            <p className="text-[9px] text-success-green font-semibold mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-success-green rounded-full animate-pulse"></span>
              {language === 'uk' ? 'Зафіксовано чек-інів' : 'Checked-in session'}
            </p>
          </div>
          <div className="w-10 h-10 bg-success-green/10 rounded-xl flex items-center justify-center text-success-green">
            <span className="material-symbols-outlined text-xl">payments</span>
          </div>
        </div>

      </div>

      {/* Dashboard Secondary Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Expenditures Chart & Templates */}
        <div className="lg:col-span-2 space-y-6">
          {/* Expenditures Chart */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-sm border border-gray-200/50 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-black text-oneclick-navy dark:text-white">
              {language === 'uk' ? 'Аналітика витрат на персонал (₴)' : 'Personnel Expenses Analytics (₴)'}
            </h3>
            
            <div className="h-48 w-full flex items-end justify-between gap-4 pt-6 border-b border-gray-100 dark:border-slate-800 px-2 select-none">
              {[
                { day: language === 'uk' ? 'Пн' : 'Mon', amt: 5400 },
                { day: language === 'uk' ? 'Вт' : 'Tue', amt: 8200 },
                { day: language === 'uk' ? 'Ср' : 'Wed', amt: 0 },
                { day: language === 'uk' ? 'Чт' : 'Thu', amt: 1800 },
                { day: language === 'uk' ? 'Пт' : 'Fri', amt: 3600 },
                { day: language === 'uk' ? 'Сб' : 'Sat', amt: 1200 },
                { day: language === 'uk' ? 'Нд' : 'Sun', amt: 2900 }
              ].map((bar, idx) => {
                const maxAmt = 10000;
                const heightPercent = bar.amt > 0 ? (bar.amt / maxAmt) * 100 : 4;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] font-bold text-secondary dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity bg-oneclick-navy text-white px-1.5 py-0.5 rounded-md mb-1">
                      {bar.amt} ₴
                    </div>
                    <div 
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[32px] rounded-t-lg transition-all duration-550 ${
                        bar.amt > 0 
                          ? 'bg-oneclick-orange shadow-sm group-hover:bg-oneclick-orange/95' 
                          : 'bg-gray-100 dark:bg-slate-800'
                      }`}
                    ></div>
                    <span className="text-[10px] font-bold text-secondary dark:text-slate-500 mt-2">{bar.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Post Templates */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-sm border border-gray-200/50 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-black text-oneclick-navy dark:text-white">
              {language === 'uk' ? 'Швидкі шаблони вакансій для Одеси' : 'Quick Job Templates for Odesa'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => {
                  setB2bActiveTab('post-shift');
                  handleApplyTemplate('Комплектувальник', 'Склади', '1800', 'Одеса, вул. Середньофонтанська, 19');
                }}
                className="bg-gray-50 hover:bg-gray-100/70 dark:bg-slate-800/50 dark:hover:bg-slate-800 p-4 rounded-2xl border border-gray-150 dark:border-slate-700 flex items-center gap-3 cursor-pointer transition-all active:scale-98"
              >
                <div className="w-10 h-10 bg-oneclick-orange/10 text-oneclick-orange rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">inventory_2</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-oneclick-navy dark:text-white truncate">Комплектувальник Rozetka</p>
                  <p className="text-[10px] text-secondary dark:text-slate-400 mt-0.5">1,800 ₴ • 12 год • Склади</p>
                </div>
              </div>

              <div 
                onClick={() => {
                  setB2bActiveTab('post-shift');
                  handleApplyTemplate('Бариста', 'Кафе', '950', 'Одеса, вул. Дерибасівська, 18');
                }}
                className="bg-gray-50 hover:bg-gray-100/70 dark:bg-slate-800/50 dark:hover:bg-slate-800 p-4 rounded-2xl border border-gray-150 dark:border-slate-700 flex items-center gap-3 cursor-pointer transition-all active:scale-98"
              >
                <div className="w-10 h-10 bg-oneclick-orange/10 text-oneclick-orange rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">coffee</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-oneclick-navy dark:text-white truncate">Бариста Aroma Kava</p>
                  <p className="text-[10px] text-secondary dark:text-slate-400 mt-0.5">950 ₴ • 12 год • Кафе</p>
                </div>
              </div>

              <div 
                onClick={() => {
                  setB2bActiveTab('post-shift');
                  handleApplyTemplate('Кур\'єр з авто', 'Кур\'єр', '1600', 'Одеса, Приморський бульвар, 1');
                }}
                className="bg-gray-50 hover:bg-gray-100/70 dark:bg-slate-800/50 dark:hover:bg-slate-800 p-4 rounded-2xl border border-gray-150 dark:border-slate-700 flex items-center gap-3 cursor-pointer transition-all active:scale-98"
              >
                <div className="w-10 h-10 bg-oneclick-orange/10 text-oneclick-orange rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">delivery_dining</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-oneclick-navy dark:text-white truncate">Кур\'єр Glovo</p>
                  <p className="text-[10px] text-secondary dark:text-slate-400 mt-0.5">1,600 ₴ • 10 год • Доставка</p>
                </div>
              </div>

              <div 
                onClick={() => {
                  setB2bActiveTab('post-shift');
                  handleApplyTemplate('Касир', 'Рітейл', '1250', 'Одеса, вул. Генуезька, 24');
                }}
                className="bg-gray-50 hover:bg-gray-100/70 dark:bg-slate-800/50 dark:hover:bg-slate-800 p-4 rounded-2xl border border-gray-150 dark:border-slate-700 flex items-center gap-3 cursor-pointer transition-all active:scale-98"
              >
                <div className="w-10 h-10 bg-oneclick-orange/10 text-oneclick-orange rounded-xl flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined">credit_card</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-oneclick-navy dark:text-white truncate">Касир у Сільпо</p>
                  <p className="text-[10px] text-secondary dark:text-slate-400 mt-0.5">1,250 ₴ • 12 год • Рітейл</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Applications list */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[32px] shadow-sm border border-gray-200/50 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-black text-oneclick-navy dark:text-white">
                {language === 'uk' ? 'Активні заявки' : 'Recent Applications'}
              </h3>
              <span className="text-[10px] font-bold text-oneclick-orange bg-oneclick-orange/10 px-2 py-0.5 rounded-full">{stats.pendingCount}</span>
            </div>
            
            <div className="space-y-3">
              {companyApplications.length > 0 ? (
                companyApplications.slice(0, 3).map((us) => (
                  <div key={us.id} className="p-3 bg-gray-50 dark:bg-slate-800/40 rounded-2xl border border-gray-150 dark:border-slate-800 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-oneclick-navy text-white flex items-center justify-center font-bold text-xs">
                        ОК
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-oneclick-navy dark:text-white truncate">{profileName}</p>
                        <p className="text-[10px] text-secondary dark:text-slate-400 font-semibold truncate">
                          {us.role} • {us.price} ₴
                        </p>
                      </div>
                      <span className="bg-success-green/10 text-success-green text-[9px] font-extrabold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        ★ 4.9
                      </span>
                    </div>
                    <div className="flex gap-2 w-full">
                      <button 
                        onClick={() => handleApproveApplication(us.id)}
                        className="flex-1 bg-success-green text-white hover:bg-success-green/95 text-[10px] font-bold py-2 rounded-xl"
                      >
                        {language === 'uk' ? 'Схвалити' : 'Approve'}
                      </button>
                      <button 
                        onClick={() => handleDeclineApplication(us.id)}
                        className="bg-gray-150 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-secondary dark:text-white text-[10px] font-bold px-3 py-2 rounded-xl"
                      >
                        {language === 'uk' ? 'Відхилити' : 'Decline'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-secondary dark:text-slate-500 font-bold text-xs">
                  <span className="material-symbols-outlined text-3xl mb-1 text-gray-300 dark:text-slate-700 block">group_off</span>
                  {language === 'uk' ? 'Немає нових заявок' : 'No pending applications'}
                </div>
              )}
            </div>
          </div>

          {/* Support B2B Promo card */}
          <div className="bg-gradient-to-br from-oneclick-navy to-slate-900 text-white p-6 rounded-[32px] shadow-sm relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-oneclick-orange/15 rounded-full blur-2xl"></div>
            <h4 className="text-xs font-bold text-oneclick-orange uppercase tracking-wider">{language === 'uk' ? 'Юридична підтримка' : 'Legal Compliance'}</h4>
            <p className="text-xs text-white/80 mt-2 font-medium leading-relaxed">
              {language === 'uk' 
                ? 'OneClick автоматично формує договори ЦПХ та реєструє виплати у ДПС. Жодних податкових ризиків для ФОП 3 групи.'
                : 'OneClick automatically handles civil law agreements and registers payouts with tax office. Zero compliance risks.'}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
