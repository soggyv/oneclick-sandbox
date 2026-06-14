'use client';

import React from 'react';
import Image from 'next/image';
import { useAppContext } from '../../context/AppContext';
import { SearchTab } from './SearchTab';
import { ShiftsTab } from './ShiftsTab';
import { WalletTab } from './WalletTab';
import { ProfileTab } from './ProfileTab';

export const WorkerLayout: React.FC = () => {
  const {
    language,
    t,
    activeTab,
    setActiveTab,
    setUserRole,
    triggerToast,
    showMap,
    setShowMap,
    mapSelectedJob,
    setMapSelectedJob,
    shifts,
    myShifts,
    handleApply,
    showJobDetails,
    setShowJobDetails,
    selectedJob,
    setSelectedJob,
    activeProfileSubPage,
    setActiveProfileSubPage,
    showDiiaLogin,
    isDiiaScanning,
    showQRModal,
    setShowQRModal,
    qrModalShift,
    confirmCheckInSimulation,
    showWithdrawModal,
    setShowWithdrawModal,
    withdrawAmount,
    setWithdrawAmount,
    withdrawCard,
    setWithdrawCard,
    handleWithdrawSubmit,
    showSuccessOverlay,
    setShowSuccessOverlay,
    successOverlayTitle,
    setSuccessOverlayTitle,
    successOverlayMessage,
    setSuccessOverlayMessage,
    balance
  } = useAppContext();

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-y-auto no-scrollbar pb-[96px]">
      
      {/* Header (Hidden on map view, job details, or profile sub-pages) */}
      {!showMap && !showJobDetails && !activeProfileSubPage && (
        <header className="bg-white dark:bg-slate-900 flex justify-between items-center w-full px-5 h-16 border-b border-gray-100 dark:border-slate-800 sticky top-0 z-40 transition-colors duration-300">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-oneclick-orange rounded-xl flex items-center justify-center text-white shadow-premium-glow">
              <span className="material-symbols-outlined text-sm font-bold">touch_app</span>
            </div>
            <h1 className="text-lg font-black text-oneclick-navy dark:text-white">
              {activeTab === 'search' && t.search}
              {activeTab === 'shifts' && t.shifts}
              {activeTab === 'wallet' && t.wallet}
              {activeTab === 'profile' && t.profile}
            </h1>
          </div>

          <div className="flex gap-3 items-center">
            {/* B2B Switcher */}
            <button 
              onClick={() => {
                setUserRole('employer');
                triggerToast(language === 'uk' ? 'Переключено в Кабінет Роботодавця (B2B)' : 'Switched to Employer Portal (B2B)');
              }}
              className="flex items-center gap-1 bg-oneclick-orange/15 hover:bg-oneclick-orange/20 text-oneclick-orange px-2.5 py-1.5 rounded-full border border-oneclick-orange/20 transition-all text-[10px] font-black"
            >
              <span className="material-symbols-outlined text-xs">business</span>
              <span>B2B</span>
            </button>

            {/* Diia Verified Status Header badge */}
            <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded-full border border-blue-100 dark:border-blue-900/50">
              <span className="w-1.5 h-1.5 bg-success-green rounded-full"></span>
              <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300">Дія</span>
            </div>
            
            <span className="material-symbols-outlined text-secondary dark:text-slate-400 cursor-pointer text-xl hover:text-oneclick-orange transition-colors">notifications</span>
          </div>
        </header>
      )}

      {/* ================= TAB CONTENT ================= */}
      <main className="flex-1 w-full relative">
        {activeTab === 'search' && !showJobDetails && <SearchTab />}
        {activeTab === 'shifts' && !showJobDetails && <ShiftsTab />}
        {activeTab === 'wallet' && !showJobDetails && <WalletTab />}
        {activeTab === 'profile' && <ProfileTab />}
      </main>

      {/* ================= PERSISTENT BOTTOM NAVIGATION ================= */}
      <nav className="absolute bottom-0 left-0 w-full z-45 flex justify-around items-center px-2 pb-safe bg-white/95 dark:bg-slate-900/95 backdrop-blur-md h-[84px] rounded-t-3xl shadow-[0_-10px_35px_rgba(0,0,0,0.05)] border-t border-gray-100 dark:border-slate-800 transition-colors duration-300">
        <button 
          onClick={() => {
            setActiveTab('search');
            setShowJobDetails(false);
            setActiveProfileSubPage(null);
          }}
          className={`flex flex-col items-center justify-center w-[72px] h-[60px] rounded-2xl relative transition-colors ${
            activeTab === 'search' ? 'text-oneclick-orange' : 'text-secondary dark:text-slate-400'
          }`}
        >
          {activeTab === 'search' && <div className="absolute inset-0 bg-oneclick-orange/10 rounded-2xl transition-transform scale-100"></div>}
          <span className="material-symbols-outlined relative z-10" style={{ fontVariationSettings: activeTab === 'search' ? '"FILL" 1' : '"FILL" 0' }}>search</span>
          <span className="text-[10px] font-extrabold mt-1 relative z-10">{t.search}</span>
        </button>
        
        <button 
          onClick={() => {
            setActiveTab('shifts');
            setShowJobDetails(false);
            setActiveProfileSubPage(null);
          }}
          className={`flex flex-col items-center justify-center w-[72px] h-[60px] rounded-2xl relative transition-colors ${
            activeTab === 'shifts' ? 'text-oneclick-orange' : 'text-secondary dark:text-slate-400'
          }`}
        >
          {activeTab === 'shifts' && <div className="absolute inset-0 bg-oneclick-orange/10 rounded-2xl transition-transform scale-100"></div>}
          <span className="material-symbols-outlined relative z-10" style={{ fontVariationSettings: activeTab === 'shifts' ? '"FILL" 1' : '"FILL" 0' }}>event</span>
          <span className="text-[10px] font-extrabold mt-1 relative z-10">{t.shifts}</span>
        </button>
        
        <button 
          onClick={() => {
            setActiveTab('wallet');
            setShowJobDetails(false);
            setActiveProfileSubPage(null);
          }}
          className={`flex flex-col items-center justify-center w-[72px] h-[60px] rounded-2xl relative transition-colors ${
            activeTab === 'wallet' ? 'text-oneclick-orange' : 'text-secondary dark:text-slate-400'
          }`}
        >
          {activeTab === 'wallet' && <div className="absolute inset-0 bg-oneclick-orange/10 rounded-2xl transition-transform scale-100"></div>}
          <span className="material-symbols-outlined relative z-10" style={{ fontVariationSettings: activeTab === 'wallet' ? '"FILL" 1' : '"FILL" 0' }}>account_balance_wallet</span>
          <span className="text-[10px] font-extrabold mt-1 relative z-10">{t.wallet}</span>
        </button>
        
        <button 
          onClick={() => {
            setActiveTab('profile');
            setShowJobDetails(false);
            setActiveProfileSubPage(null);
          }}
          className={`flex flex-col items-center justify-center w-[72px] h-[60px] rounded-2xl relative transition-colors ${
            activeTab === 'profile' ? 'text-oneclick-orange' : 'text-secondary dark:text-slate-400'
          }`}
        >
          {activeTab === 'profile' && <div className="absolute inset-0 bg-oneclick-orange/10 rounded-2xl transition-transform scale-100"></div>}
          <span className="material-symbols-outlined relative z-10" style={{ fontVariationSettings: activeTab === 'profile' ? '"FILL" 1' : '"FILL" 0' }}>person</span>
          <span className="text-[10px] font-extrabold mt-1 relative z-10">{t.profile}</span>
        </button>
      </nav>

      {/* ================= MODALS & SUB-PAGES ================= */}

      {/* 1. MAP VIEW OVERLAY */}
      {showMap && (
        <div className="absolute inset-0 z-50 bg-[#e4e7eb] dark:bg-slate-900 flex flex-col animate-fade-in">
          {/* Map Header */}
          <div className="absolute top-4 left-0 w-full px-4 z-10 flex items-center gap-3">
            <button 
              onClick={() => {
                setShowMap(false);
                setMapSelectedJob(null);
              }} 
              className="w-11 h-11 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center text-oneclick-navy dark:text-white active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined font-bold">arrow_back</span>
            </button>
            <div className="flex-1 bg-white dark:bg-slate-800 rounded-full shadow-lg px-4 py-3 flex items-center gap-2 border border-gray-100 dark:border-slate-700">
              <span className="material-symbols-outlined text-oneclick-orange">location_on</span>
              <span className="font-bold text-xs text-oneclick-navy dark:text-white">
                {language === 'uk' ? 'Робота поруч (Одеса)' : 'Shifts near you (Odesa)'}
              </span>
            </div>
          </div>

          {/* Mock Canvas Map Area */}
          <div className="flex-1 relative bg-slate-100 dark:bg-slate-950 overflow-hidden bg-[radial-gradient(#d1d5db_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:24px_24px]">
            {/* User Location Dot */}
            <div className="absolute top-[45%] left-[48%] flex flex-col items-center">
              <div className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg relative z-10"></div>
              <div className="w-20 h-20 bg-blue-500/20 rounded-full absolute -top-[30px] animate-pulse"></div>
            </div>

            {/* Pin 1: Rozetka */}
            <button 
              onClick={() => setMapSelectedJob(shifts.find(s => s.id === '1') || null)}
              className="absolute top-[30%] left-[22%] flex flex-col items-center group cursor-pointer border-none outline-none bg-transparent"
            >
              <div className="bg-oneclick-orange text-white px-2 py-0.5 rounded-md text-[9px] font-black mb-1 shadow-md">1 800 ₴</div>
              <div className="w-9 h-9 bg-white dark:bg-slate-800 rounded-full border-2 border-oneclick-orange flex items-center justify-center shadow-lg overflow-hidden">
                <span className="material-symbols-outlined text-oneclick-orange text-lg">inventory_2</span>
              </div>
            </button>

            {/* Pin 2: Aroma Kava */}
            <button 
              onClick={() => setMapSelectedJob(shifts.find(s => s.id === '2') || null)}
              className="absolute top-[58%] left-[68%] flex flex-col items-center group cursor-pointer border-none outline-none bg-transparent"
            >
              <div className="bg-oneclick-navy dark:bg-slate-700 text-white px-2 py-0.5 rounded-md text-[9px] font-black mb-1 shadow-md">950 ₴</div>
              <div className="w-9 h-9 bg-white dark:bg-slate-800 rounded-full border-2 border-oneclick-navy dark:border-slate-700 flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-oneclick-navy dark:text-white text-lg">coffee</span>
              </div>
            </button>

            {/* Pin 3: Glovo */}
            <button 
              onClick={() => setMapSelectedJob(shifts.find(s => s.id === '3') || null)}
              className="absolute top-[40%] left-[75%] flex flex-col items-center group cursor-pointer border-none outline-none bg-transparent"
            >
              <div className="bg-oneclick-orange text-white px-2 py-0.5 rounded-md text-[9px] font-black mb-1 shadow-md">1 500 ₴</div>
              <div className="w-9 h-9 bg-white dark:bg-slate-800 rounded-full border-2 border-oneclick-orange flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-oneclick-orange text-lg">delivery_dining</span>
              </div>
            </button>

            {/* Pin 4: JYSK */}
            <button 
              onClick={() => setMapSelectedJob(shifts.find(s => s.id === '9') || null)}
              className="absolute top-[68%] left-[28%] flex flex-col items-center group cursor-pointer border-none outline-none bg-transparent"
            >
              <div className="bg-oneclick-navy dark:bg-slate-700 text-white px-2 py-0.5 rounded-md text-[9px] font-black mb-1 shadow-md">1 400 ₴</div>
              <div className="w-9 h-9 bg-white dark:bg-slate-800 rounded-full border-2 border-oneclick-navy dark:border-slate-700 flex items-center justify-center shadow-lg">
                <span className="material-symbols-outlined text-oneclick-navy dark:text-white text-lg">weekend</span>
              </div>
            </button>
          </div>

          {/* Bottom Preview Sheet */}
          <div className="bg-white dark:bg-slate-900 rounded-t-[32px] p-5 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] border-t border-gray-100 dark:border-slate-800">
            {mapSelectedJob ? (
              <div className="space-y-4 animate-fade-in text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-gray-100 dark:bg-slate-800 text-secondary dark:text-slate-300 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                      {mapSelectedJob.type}
                    </span>
                    <h3 className="text-base font-extrabold text-oneclick-navy dark:text-white mt-1">{mapSelectedJob.role}</h3>
                    <p className="text-xs text-secondary dark:text-slate-400 font-semibold">{mapSelectedJob.company} • {mapSelectedJob.dist}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-oneclick-orange">{mapSelectedJob.price} ₴</div>
                    <span className="text-[9px] text-secondary font-bold uppercase">{t.perShift}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-oneclick-navy dark:text-slate-300 font-bold bg-gray-50 dark:bg-slate-800 p-2.5 rounded-xl">
                  <span className="material-symbols-outlined text-oneclick-orange text-base">schedule</span>
                  <span>{mapSelectedJob.time} ({mapSelectedJob.date} Жовтня)</span>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setSelectedJob(mapSelectedJob);
                      setShowMap(false);
                      setShowJobDetails(true);
                    }}
                    className="flex-1 bg-gray-100 dark:bg-slate-700 text-oneclick-navy dark:text-white py-3 rounded-xl font-bold text-xs"
                  >
                    {language === 'uk' ? 'Детальніше' : 'Full Details'}
                  </button>
                  <button 
                    onClick={() => {
                      handleApply(mapSelectedJob);
                      setShowMap(false);
                    }}
                    className="flex-1 bg-oneclick-orange text-white py-3 rounded-xl font-bold text-xs shadow-premium-glow"
                  >
                    {myShifts.some(ms => ms.shiftId === mapSelectedJob.id) 
                      ? (language === 'uk' ? 'Відгукнулися' : 'Applied') 
                      : t.apply}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-secondary dark:text-slate-400 font-bold flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-gray-300 dark:text-slate-600 mb-2">touch_app</span>
                <span>{language === 'uk' ? 'Оберіть шпильку на карті для перегляду деталей' : 'Select a pin on the map to view details'}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. JOB DETAILS SUB-PAGE */}
      {showJobDetails && selectedJob && (
        <div className="absolute inset-0 z-50 bg-[#fcf9f8] dark:bg-[#0b0c10] flex flex-col overflow-y-auto no-scrollbar pb-[100px] animate-fade-in text-left">
          {/* Details Header */}
          <div className="bg-white dark:bg-slate-900 px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 sticky top-0 z-10">
            <button 
              onClick={() => {
                setShowJobDetails(false);
                setSelectedJob(null);
              }} 
              className="text-secondary dark:text-slate-400 hover:text-oneclick-orange flex items-center"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h2 className="text-base font-extrabold text-oneclick-navy dark:text-white">{language === 'uk' ? 'Деталі зміни' : 'Shift Details'}</h2>
          </div>

          <div className="p-4 space-y-4">
            {/* Header Bento Box */}
            <section className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-slate-600 relative shrink-0">
                    {selectedJob.logo ? (
                      <Image src={selectedJob.logo} alt={selectedJob.company} fill className="object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-oneclick-navy dark:text-white text-2xl">{selectedJob.icon}</span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-oneclick-navy dark:text-white leading-tight">{selectedJob.role}</h2>
                    <p className="text-xs text-secondary dark:text-slate-400 font-bold mt-0.5">{selectedJob.company}</p>
                    
                    <div className="flex items-center gap-1 mt-1 font-sans">
                      <span className="material-symbols-outlined text-warning-amber text-xs" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                      <span className="text-xs font-bold text-on-surface dark:text-white">4.8</span>
                      <span className="text-[9px] text-secondary">({language === 'uk' ? '2.4к відгуків' : '2.4k reviews'})</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-success-green/10 dark:bg-success-green/20 border border-success-green/20 rounded-2xl p-3.5 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-success-green text-xl shrink-0 mt-0.5 font-bold">verified_user</span>
                <p className="text-[10px] text-on-surface dark:text-slate-300 font-medium leading-normal">
                  {language === 'uk' 
                    ? 'Оплата гарантована сервісом OneClick. Кошти резервуються на платформі під час вашого відгуку.'
                    : 'Payout is guaranteed by OneClick. Funds are locked on the platform when you apply.'}
                </p>
              </div>
            </section>

            {/* Specs Grid */}
            <section className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-secondary shrink-0">
                  <span className="material-symbols-outlined">calendar_today</span>
                </div>
                <div>
                  <p className="text-[10px] text-secondary uppercase tracking-wider font-semibold">{language === 'uk' ? 'Дата зміни' : 'Shift Date'}</p>
                  <p className="text-xs font-bold text-oneclick-navy dark:text-white">{language === 'uk' ? `${selectedJob.date} Жовтня` : `October ${selectedJob.date}`}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-secondary shrink-0">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div>
                  <p className="text-[10px] text-secondary uppercase tracking-wider font-semibold">{language === 'uk' ? 'Час зміни' : 'Shift Duration'}</p>
                  <p className="text-xs font-bold text-oneclick-navy dark:text-white">{selectedJob.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center text-oneclick-orange shrink-0">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <div>
                  <p className="text-[10px] text-secondary uppercase tracking-wider font-semibold">{language === 'uk' ? 'Виплата' : 'Payment'}</p>
                  <p className="text-lg font-black text-oneclick-orange">{selectedJob.price} ₴</p>
                </div>
              </div>
            </section>

            {/* Address Map Container */}
            <section className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-700 flex items-center justify-center text-secondary shrink-0">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div>
                  <p className="text-[10px] text-secondary uppercase tracking-wider font-semibold">{language === 'uk' ? 'Адреса роботи' : 'Work Address'}</p>
                  <p className="text-xs font-bold text-oneclick-navy dark:text-white">{selectedJob.address}</p>
                </div>
              </div>
              
              {/* Mock map graphic */}
              <div className="relative rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-700 h-[140px] bg-slate-50 dark:bg-slate-900 flex flex-col">
                <div className="flex-1 relative flex items-center justify-center bg-[radial-gradient(#e5e7eb_1.5px,transparent_1.5px)] dark:bg-[radial-gradient(#334155_1.5px,transparent_1.5px)] [background-size:16px_16px]">
                  <div className="relative animate-bounce">
                    <span className="material-symbols-outlined text-oneclick-orange text-[40px] drop-shadow-md" style={{ fontVariationSettings: '"FILL" 1' }}>location_on</span>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-black/10 rounded-full blur-[1px]"></div>
                  </div>
                </div>
                <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="absolute bottom-2 right-2 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-1 text-[10px] font-bold text-oneclick-navy dark:text-white hover:bg-gray-100">
                  <span className="material-symbols-outlined text-sm">map</span>
                  <span>{language === 'uk' ? 'Відкрити в Google Maps' : 'Google Maps'}</span>
                </a>
              </div>
            </section>

            {/* Description, Requirements, Duties */}
            <section className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4 text-xs">
              <h3 className="text-sm font-black text-oneclick-navy dark:text-white">{language === 'uk' ? 'Опис вакансії' : 'Job Description'}</h3>
              <p className="text-secondary dark:text-slate-400 font-medium leading-relaxed">{selectedJob.details}</p>

              <div className="space-y-3 pt-2">
                <div>
                  <h4 className="font-bold text-oneclick-navy dark:text-white flex items-center gap-1.5 mb-1.5">
                    <span className="material-symbols-outlined text-oneclick-orange text-base font-bold">task_alt</span>
                    {language === 'uk' ? 'Обов\'язки' : 'Responsibilities'}
                  </h4>
                  <ul className="list-disc list-inside text-secondary dark:text-slate-400 space-y-1 ml-1 font-medium">
                    {selectedJob.responsibilities.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-1">
                  <h4 className="font-bold text-oneclick-navy dark:text-white flex items-center gap-1.5 mb-1.5">
                    <span className="material-symbols-outlined text-oneclick-orange text-base font-bold">assignment_ind</span>
                    {language === 'uk' ? 'Вимоги' : 'Requirements'}
                  </h4>
                  <ul className="list-disc list-inside text-secondary dark:text-slate-400 space-y-1 ml-1 font-medium">
                    {selectedJob.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Employer Reviews */}
            <section className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="text-xs font-black text-oneclick-navy dark:text-white uppercase tracking-wider">{language === 'uk' ? 'Відгуки про роботодавця' : 'Employer Reviews'}</h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 text-xs">
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <p className="font-bold text-oneclick-navy dark:text-white">Дмитро К.</p>
                      <p className="text-[9px] text-secondary uppercase font-semibold">14 Жовтня</p>
                    </div>
                    <div className="flex text-warning-amber">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                      ))}
                    </div>
                  </div>
                  <p className="text-secondary dark:text-slate-400 font-medium leading-relaxed">
                    {language === 'uk' 
                      ? 'Виплата прийшла через 2 хвилини після зміни! Робота на складі активна, але все чесно.'
                      : 'Payout received 2 minutes after shift! Warehouse work is intense but everything is fair.'}
                  </p>
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 text-xs">
                  <div className="flex justify-between items-start mb-1.5">
                    <div>
                      <p className="font-bold text-oneclick-navy dark:text-white">Іра М.</p>
                      <p className="text-[9px] text-secondary uppercase font-semibold">10 Жовтня</p>
                    </div>
                    <div className="flex text-warning-amber">
                      {[1, 2, 3, 4].map((s) => (
                        <span key={s} className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                      ))}
                      <span className="material-symbols-outlined text-sm text-gray-300">star</span>
                    </div>
                  </div>
                  <p className="text-secondary dark:text-slate-400 font-medium leading-relaxed">
                    {language === 'uk' 
                      ? 'Хороші менеджери, допомогли розібратися з чек-іном. Все сподобалося.'
                      : 'Great managers, helped me with the check-in QR code. Loved the experience.'}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Sticky Action Button */}
          <div className="fixed bottom-[96px] left-1/2 -translate-x-1/2 w-full max-w-[450px] px-4 py-2 z-40 bg-gradient-to-t from-[#fcf9f8] via-[#fcf9f8]/95 to-transparent dark:from-[#0b0c10] dark:via-[#0b0c10]/95">
            <button 
              onClick={() => handleApply(selectedJob)}
              className="w-full bg-oneclick-orange text-white py-4 rounded-2xl font-bold text-sm shadow-premium-glow active:scale-95 transition-transform"
            >
              {myShifts.some(ms => ms.shiftId === selectedJob.id) 
                ? (language === 'uk' ? 'Ви вже відгукнулися' : 'Already applied') 
                : (language === 'uk' ? 'Відгукнутися на зміну' : 'Apply for this Shift')}
            </button>
          </div>
        </div>
      )}

      {/* 4. MOCK DIIA WEB SIGNING MODAL */}
      {showDiiaLogin && isDiiaScanning && (
        <div className="absolute inset-0 z-[999] bg-oneclick-navy/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 text-center shadow-2xl max-w-sm w-full animate-fade-in">
            <div className="w-14 h-14 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
              <span className="material-symbols-outlined text-3xl font-bold">fingerprint</span>
            </div>
            <h3 className="text-base font-extrabold text-oneclick-navy dark:text-white mb-1">
              {language === 'uk' ? 'Підпис Дія.Підпис' : 'Signing with Diia.Signature'}
            </h3>
            <p className="text-xs text-secondary dark:text-slate-400 mb-6 font-medium leading-relaxed">
              {language === 'uk' ? 'Підтвердіть запит у додатку Дія на вашому смартфоні' : 'Confirm the request in your Diia app'}
            </p>
            
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{language === 'uk' ? 'Зчитування даних...' : 'Fetching Documents...'}</p>
          </div>
        </div>
      )}

      {/* 5. CHECK-IN QR CODE MODAL */}
      {showQRModal && qrModalShift && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-oneclick-navy/60 backdrop-blur-md" onClick={() => setShowQRModal(false)}></div>
          
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 w-full max-w-xs relative z-10 flex flex-col items-center text-center shadow-2xl">
            <div className="w-14 h-14 bg-oneclick-orange/10 rounded-full flex items-center justify-center mb-4 text-oneclick-orange">
              <span className="material-symbols-outlined text-[32px]">qr_code_scanner</span>
            </div>
            
            <h3 className="text-lg font-extrabold text-oneclick-navy dark:text-white mb-1">{language === 'uk' ? 'Чек-ін на зміну' : 'Shift Check-in'}</h3>
            <p className="text-[11px] text-secondary dark:text-slate-400 mb-6 font-medium leading-relaxed">
              {language === 'uk' 
                ? `Покажіть цей код менеджеру закладу ${qrModalShift.company} для початку роботи.` 
                : `Show this QR to the manager at ${qrModalShift.company} to start your shift.`}
            </p>

            {/* QR Code placeholder */}
            <div className="bg-gray-50 dark:bg-slate-800 p-5 rounded-2xl mb-6 border-2 border-dashed border-gray-200 dark:border-slate-700">
              <svg className="w-40 h-40 text-oneclick-navy dark:text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v2h-2v-2z"></path>
              </svg>
            </div>

            <div className="w-full space-y-2">
              {/* Simulation Button for MVP */}
              <button 
                onClick={confirmCheckInSimulation}
                className="w-full py-3 bg-success-green text-white rounded-xl font-bold text-xs active:scale-95 transition-transform flex items-center justify-center gap-1 shadow-md"
              >
                <span className="material-symbols-outlined text-base">check</span>
                {language === 'uk' ? 'Симулювати чек-ін' : 'Simulate Check-in'}
              </button>
              
              <button 
                onClick={() => setShowQRModal(false)}
                className="w-full py-3 bg-gray-100 dark:bg-slate-800 text-oneclick-navy dark:text-white rounded-xl font-bold text-xs"
              >
                {language === 'uk' ? 'Закрити' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. WITHDRAW WALLET DIALOG */}
      {showWithdrawModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 animate-fade-in">
          <div className="absolute inset-0 bg-oneclick-navy/60 backdrop-blur-md" onClick={() => setShowWithdrawModal(false)}></div>
          
          <form 
            onSubmit={handleWithdrawSubmit} 
            className="bg-white dark:bg-slate-900 rounded-[32px] p-6 w-full max-w-sm relative z-10 flex flex-col shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center text-left">
              <h3 className="text-base font-extrabold text-oneclick-navy dark:text-white">
                {language === 'uk' ? 'Виведення заробітку' : 'Withdraw Earnings'}
              </h3>
              <button 
                type="button" 
                onClick={() => setShowWithdrawModal(false)} 
                className="material-symbols-outlined text-gray-400 hover:text-on-surface"
              >
                close
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 text-xs text-left">
              <p className="text-secondary dark:text-slate-400 font-bold uppercase tracking-wider text-[9px]">{language === 'uk' ? 'Доступно до виводу' : 'Available for withdrawal'}</p>
              <p className="text-xl font-black text-oneclick-orange mt-1">{balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ₴</p>
            </div>

            <div className="space-y-3 text-left">
              <div>
                <label className="block text-[10px] font-bold text-secondary uppercase mb-1">{language === 'uk' ? 'Сума виводу (₴)' : 'Withdraw Amount (₴)'}</label>
                <input 
                  type="number" 
                  required
                  min={10}
                  max={balance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="1000"
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200/50 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-oneclick-navy dark:text-white outline-none focus:border-oneclick-orange"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-secondary uppercase mb-1">{language === 'uk' ? 'Номер банківської карти' : 'Bank Card Number'}</label>
                <input 
                  type="text" 
                  required
                  value={withdrawCard}
                  onChange={(e) => setWithdrawCard(e.target.value)}
                  placeholder="4441 1144 5543 4321"
                  className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200/50 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-oneclick-navy dark:text-white outline-none focus:border-oneclick-orange"
                />
                <p className="text-[9px] text-gray-400 mt-1 font-semibold">
                  {language === 'uk' ? 'Миттєве зарахування через систему спліт-платежів.' : 'Instant payout via split payment system.'}
                </p>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-oneclick-orange text-white py-3.5 rounded-xl font-bold text-xs shadow-premium-glow active:scale-95 transition-transform mt-4"
            >
              {language === 'uk' ? 'Підтвердити виведення' : 'Confirm Withdrawal'}
            </button>
          </form>
        </div>
      )}

      {/* 7. CELEBRATION / SUCCESS FULL-SCREEN OVERLAY */}
      {showSuccessOverlay && (
        <div className="absolute inset-0 z-[9999] bg-oneclick-navy flex flex-col items-center justify-center p-6 text-center text-white animate-fade-in">
          {/* Background elements */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-success-green/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-oneclick-orange/15 rounded-full blur-3xl"></div>

          <div className="w-24 h-24 bg-success-green text-white rounded-full flex items-center justify-center mb-6 shadow-lg border-4 border-white/20 scale-110 relative z-10 animate-bounce">
            <span className="material-symbols-outlined text-[54px] font-bold">done</span>
          </div>

          <h2 className="text-2xl font-black text-white mb-2 relative z-10">{successOverlayTitle}</h2>
          <p className="text-sm text-white/80 max-w-xs font-medium leading-relaxed mb-10 relative z-10">
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
