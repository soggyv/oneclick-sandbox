'use client';

import React from 'react';
import Image from 'next/image';
import { useAppContext } from '../../context/AppContext';
import { B2BDashboard } from './B2BDashboard';
import { PostShiftTab } from './PostShiftTab';
import { ShiftsListTab } from './ShiftsListTab';
import { ApplicationsTab } from './ApplicationsTab';
import { CheckinsTab } from './CheckinsTab';
import { FinanceTab } from './FinanceTab';

export const EmployerLayout: React.FC = () => {
  const {
    language,
    setLanguage,
    darkModeEnabled,
    setDarkModeEnabled,
    employerCompany,
    setEmployerCompany,
    b2bActiveTab,
    setB2bActiveTab,
    employerDeposit,
    setUserRole,
    triggerToast,
    myShifts,
    shifts,
    showTopUpModal,
    setShowTopUpModal,
    topUpAmount,
    setTopUpAmount,
    handleTopUpDepositSubmit,
    showSuccessOverlay,
    setShowSuccessOverlay,
    successOverlayTitle,
    successOverlayMessage,
    setSuccessOverlayTitle,
    setSuccessOverlayMessage,
    toastMessage
  } = useAppContext();

  // Company counters
  const companyShifts = shifts.filter(s => s.company === employerCompany);
  const companyApplications = myShifts.filter(ms => ms.company === employerCompany && ms.status === 'pending');
  const companyHistory = myShifts.filter(ms => ms.company === employerCompany && ms.status === 'completed');

  const stats = {
    deposit: employerDeposit,
    postedCount: companyShifts.length,
    pendingCount: companyApplications.length,
    completedCount: companyHistory.length
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F5F7] dark:bg-slate-950 text-oneclick-navy dark:text-white flex flex-col lg:flex-row transition-colors duration-300 font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-oneclick-navy text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce border border-white/20 text-sm font-semibold max-w-sm text-center">
          <span className="material-symbols-outlined text-oneclick-orange">info</span>
          {toastMessage}
        </div>
      )}

      {/* 1. LEFT SIDEBAR */}
      <aside className="w-full lg:w-[280px] bg-oneclick-navy text-white flex flex-col shrink-0 border-r border-white/10 relative z-30">
        {/* Brand Logo Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-oneclick-orange rounded-xl flex items-center justify-center shadow-lg">
              <span className="material-symbols-outlined text-white text-xl font-bold">touch_app</span>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight flex items-center">
                OneClick <span className="text-oneclick-orange ml-0.5">.</span>
              </h1>
              <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest text-left">Business Portal</p>
            </div>
          </div>
        </div>

        {/* Company Picker */}
        <div className="p-4 mx-4 my-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl overflow-hidden relative flex items-center justify-center shrink-0 border border-white/10">
              <Image 
                src={
                  employerCompany === 'Rozetka' 
                    ? 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&auto=format&fit=crop&q=60' 
                    : employerCompany === 'Aroma Kava'
                      ? 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=100&auto=format&fit=crop&q=60'
                      : employerCompany === 'Glovo'
                        ? 'https://images.unsplash.com/photo-1528127269322-539801943592?w=100&auto=format&fit=crop&q=60'
                        : 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&auto=format&fit=crop&q=60'
                } 
                alt={employerCompany} 
                fill 
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <h3 className="text-xs font-bold truncate text-white">{employerCompany}</h3>
              <p className="text-[9px] text-white/60 truncate font-semibold mt-0.5">Одеса • {language === 'uk' ? 'Роботодавець' : 'Employer'}</p>
            </div>
          </div>

          <div className="relative">
            <label className="block text-[8px] font-bold text-white/40 uppercase mb-1 text-left">{language === 'uk' ? 'Змінити Компанію (Демо)' : 'Switch Company (Demo)'}</label>
            <select 
              value={employerCompany} 
              onChange={(e) => {
                setEmployerCompany(e.target.value);
                triggerToast(language === 'uk' ? `Перемкнуто на: ${e.target.value}` : `Switched to: ${e.target.value}`);
              }}
              className="w-full bg-white/10 text-white border border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-oneclick-orange cursor-pointer appearance-none animate-none"
            >
              <option value="Rozetka" className="bg-oneclick-navy text-white">Rozetka (Склади)</option>
              <option value="Aroma Kava" className="bg-oneclick-navy text-white">Aroma Kava (Кафе)</option>
              <option value="Glovo" className="bg-oneclick-navy text-white">Glovo (Кур'єри)</option>
              <option value="Сільпо" className="bg-oneclick-navy text-white">Сільпо (Рітейл)</option>
            </select>
            <span className="material-symbols-outlined text-white/60 text-xs absolute right-3 bottom-2.5 pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
          {[
            { id: 'dashboard', label: language === 'uk' ? 'Дашборд' : 'Dashboard', icon: 'dashboard' },
            { id: 'post-shift', label: language === 'uk' ? 'Створити зміну' : 'Post a Shift', icon: 'add_circle' },
            { id: 'shifts', label: language === 'uk' ? 'Вакансії компанії' : 'Posted Shifts', icon: 'list_alt' },
            { 
              id: 'applications', 
              label: language === 'uk' ? 'Заявки' : 'Applications', 
              icon: 'group',
              badge: stats.pendingCount
            },
            { 
              id: 'checkins', 
              label: language === 'uk' ? 'Чек-іни та Виплати' : 'Check-ins', 
              icon: 'payments',
              badge: myShifts.filter(us => us.company === employerCompany && us.status === 'completed_pending_payout').length
            },
            { id: 'finance', label: language === 'uk' ? 'Фінанси' : 'Finances', icon: 'account_balance' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setB2bActiveTab(item.id as any)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                b2bActiveTab === item.id
                  ? 'bg-oneclick-orange text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && item.badge > 0 ? (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  b2bActiveTab === item.id ? 'bg-white text-oneclick-orange' : 'bg-oneclick-orange text-white'
                }`}>
                  {item.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 space-y-4">
          <div className="flex items-center justify-between text-xs text-white/50 font-bold px-2">
            <button 
              onClick={() => setLanguage(language === 'uk' ? 'en' : 'uk')} 
              className="hover:text-white flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">language</span>
              <span>{language === 'uk' ? 'EN' : 'UA'}</span>
            </button>

            <button 
              onClick={() => setDarkModeEnabled(!darkModeEnabled)} 
              className="hover:text-white flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">
                {darkModeEnabled ? 'light_mode' : 'dark_mode'}
              </span>
              <span>{darkModeEnabled ? (language === 'uk' ? 'Світла' : 'Light') : (language === 'uk' ? 'Темна' : 'Dark')}</span>
            </button>
          </div>

          <button
            onClick={() => {
              setUserRole('worker');
              triggerToast(language === 'uk' ? 'Переключено в Кабінет Шукача (B2C)' : 'Switched to Worker Portal (B2C)');
            }}
            className="w-full bg-white/10 hover:bg-white/15 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 border border-white/10 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-base">person</span>
            <span>{language === 'uk' ? 'Кабінет Шукача' : 'Worker Portal'}</span>
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto min-h-screen">
        
        {/* TOPBAR */}
        <header className="bg-white dark:bg-slate-900 border-b border-gray-200/50 dark:border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-secondary dark:text-slate-400 font-bold text-xs uppercase tracking-wider">OneClick Business</span>
            <span className="text-gray-300">/</span>
            <span className="text-oneclick-navy dark:text-white font-black text-xs uppercase tracking-wider">
              {b2bActiveTab === 'dashboard' && (language === 'uk' ? 'Дашборд' : 'Dashboard')}
              {b2bActiveTab === 'post-shift' && (language === 'uk' ? 'Нова Вакансія' : 'New Shift')}
              {b2bActiveTab === 'shifts' && (language === 'uk' ? 'Список змін' : 'Shifts List')}
              {b2bActiveTab === 'applications' && (language === 'uk' ? 'Заявки' : 'Applications')}
              {b2bActiveTab === 'checkins' && (language === 'uk' ? 'Чек-іни та Виплати' : 'Check-ins')}
              {b2bActiveTab === 'finance' && (language === 'uk' ? 'Фінанси' : 'Finance')}
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div 
              onClick={() => setB2bActiveTab('finance')}
              className="bg-gray-50 dark:bg-slate-800 border border-gray-150 dark:border-slate-700 rounded-2xl px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-gray-100/50 transition-colors"
            >
              <span className="material-symbols-outlined text-success-green">account_balance_wallet</span>
              <div className="text-left">
                <p className="text-[9px] font-bold text-secondary dark:text-slate-400 uppercase tracking-widest">{language === 'uk' ? 'Баланс Депозиту' : 'Deposit Balance'}</p>
                <p className="text-sm font-black text-oneclick-navy dark:text-white">{stats.deposit.toLocaleString('en-US')} ₴</p>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTopUpModal(true);
                }}
                className="bg-oneclick-orange text-white p-1 rounded-lg flex items-center justify-center hover:bg-oneclick-orange/90"
              >
                <span className="material-symbols-outlined text-sm font-bold">add</span>
              </button>
            </div>

            <div className="flex items-center gap-2 border-l border-gray-200 dark:border-slate-800 pl-6">
              <div className="w-8 h-8 rounded-full bg-oneclick-orange text-white font-black flex items-center justify-center text-xs">
                {employerCompany.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-oneclick-navy dark:text-white leading-none">{employerCompany} Admin</p>
                <p className="text-[9px] text-secondary mt-0.5">ID: {employerCompany === 'Rozetka' ? '54321' : '98765'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE PAGES */}
        <div className="p-6 max-w-6xl w-full mx-auto flex-1 space-y-6">
          {b2bActiveTab === 'dashboard' && <B2BDashboard />}
          {b2bActiveTab === 'post-shift' && <PostShiftTab />}
          {b2bActiveTab === 'shifts' && <ShiftsListTab />}
          {b2bActiveTab === 'applications' && <ApplicationsTab />}
          {b2bActiveTab === 'checkins' && <CheckinsTab />}
          {b2bActiveTab === 'finance' && <FinanceTab />}
        </div>
      </main>

      {/* TOP-UP MODAL */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form 
            onSubmit={handleTopUpDepositSubmit}
            className="bg-white dark:bg-slate-900 rounded-[32px] max-w-sm w-full p-6 space-y-4 border border-gray-100 dark:border-slate-800 shadow-2xl animate-fade-in"
          >
            <div className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-slate-800">
              <h3 className="text-base font-black text-oneclick-navy dark:text-white">
                {language === 'uk' ? 'Поповнити баланс депозиту' : 'Top Up Deposit'}
              </h3>
              <button 
                type="button" 
                onClick={() => setShowTopUpModal(false)} 
                className="material-symbols-outlined text-gray-400 hover:text-on-surface"
              >
                close
              </button>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-secondary dark:text-slate-400 uppercase mb-1 text-left">
                {language === 'uk' ? 'Сума поповнення (₴)' : 'Top Up Amount (₴)'}
              </label>
              <input 
                type="number" 
                required
                min={100}
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder="5000"
                className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-250 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-oneclick-navy dark:text-white outline-none focus:border-oneclick-orange"
              />
            </div>

            <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl text-[10px] text-secondary dark:text-slate-400 leading-normal text-left">
              {language === 'uk' 
                ? 'Поповнення балансу відбувається симуляційно. Кошти будуть миттєво зараховані на баланс депозиту для виплат.' 
                : 'This is a simulation. Funds will be instantly credited to your deposit balance for payout testing.'}
            </div>

            <button 
              type="submit" 
              className="w-full bg-oneclick-orange text-white py-3.5 rounded-xl font-bold text-xs shadow-premium-glow active:scale-95 transition-transform"
            >
              {language === 'uk' ? 'Поповнити баланс' : 'Confirm Top Up'}
            </button>
          </form>
        </div>
      )}

      {/* GLOBAL SUCCESS OVERLAY */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 z-[9999] bg-oneclick-navy flex flex-col items-center justify-center p-6 text-center text-white animate-fade-in">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-success-green/10 rounded-full blur-3xl"></div>
          
          <div className="w-24 h-24 bg-success-green text-white rounded-full flex items-center justify-center mb-6 shadow-lg border-4 border-white/20 scale-110 relative z-10 animate-bounce">
            <span className="material-symbols-outlined text-[54px] font-bold">done</span>
          </div>

          <h2 className="text-2xl font-black text-white mb-2 relative z-10">{successOverlayTitle}</h2>
          <p className="text-sm text-white/80 max-w-md font-medium leading-relaxed mb-10 relative z-10">
            {successOverlayMessage}
          </p>

          <button 
            onClick={() => {
              setShowSuccessOverlay(false);
              setSuccessOverlayTitle('');
              setSuccessOverlayMessage('');
            }}
            className="w-full max-w-xs bg-white text-oneclick-navy py-4 rounded-2xl font-black text-sm active:scale-95 transition-transform shadow-xl relative z-10"
          >
            {language === 'uk' ? 'Чудово' : 'Awesome'}
          </button>
        </div>
      )}

    </div>
  );
};
