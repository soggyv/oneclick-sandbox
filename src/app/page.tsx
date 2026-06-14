'use client';

import React from 'react';
import { AppProvider, useAppContext } from '../context/AppContext';
import { EmployerLayout } from '../components/employer/EmployerLayout';
import { WorkerLayout } from '../components/worker/WorkerLayout';
import { WorkerAuth } from '../components/worker/WorkerAuth';

function HomeContent() {
  const {
    isLoggedIn,
    userRole,
    showPhoneFrame,
    setShowPhoneFrame,
    toastMessage,
    language
  } = useAppContext();

  // Route to B2B portal if userRole is employer
  if (userRole === 'employer') {
    return <EmployerLayout />;
  }

  // Render B2C worker view
  return (
    <div className={
      showPhoneFrame 
        ? "min-h-screen w-full flex items-center justify-center p-0 md:p-6 bg-gradient-to-br from-orange-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300" 
        : "min-h-screen w-full bg-[#fcf9f8] dark:bg-[#0b0c10] transition-colors duration-300"
    }>
      
      {/* Floating Emulator Frame Toggle for desktop */}
      <button 
        onClick={() => setShowPhoneFrame(!showPhoneFrame)}
        className="hidden md:flex fixed top-4 right-4 z-[9999] bg-oneclick-navy hover:bg-oneclick-navy/95 text-white px-4 py-2.5 rounded-xl shadow-lg items-center justify-center gap-1.5 active:scale-95 transition-transform text-xs font-bold border border-white/10 select-none cursor-pointer"
      >
        <span className="material-symbols-outlined text-base">
          {showPhoneFrame ? 'splitscreen' : 'smartphone'}
        </span>
        <span>
          {showPhoneFrame 
            ? (language === 'uk' ? 'Без рамки' : 'No Frame') 
            : (language === 'uk' ? 'Рамка телефону' : 'Phone Frame')
          }
        </span>
      </button>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-oneclick-navy text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-bounce border border-white/20 text-sm font-semibold max-w-sm text-center">
          <span className="material-symbols-outlined text-oneclick-orange">info</span>
          {toastMessage}
        </div>
      )}

      {/* Main smartphone emulator screen */}
      <div className={
        showPhoneFrame 
          ? "w-full max-w-[450px] min-h-[100dvh] md:min-h-[850px] md:max-h-[850px] bg-[#fcf9f8] dark:bg-[#0b0c10] md:rounded-[42px] md:shadow-[0_24px_70px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col relative md:border-[8px] md:border-oneclick-navy dark:md:border-slate-800"
          : "w-full max-w-[500px] min-h-screen mx-auto bg-[#fcf9f8] dark:bg-[#0b0c10] flex flex-col relative border-x border-gray-200/50 dark:border-slate-800/80 shadow-md"
      }>
        
        {/* Notch/Dynamic Island for realistic look on desktop */}
        {showPhoneFrame && (
          <div className="hidden md:flex absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-oneclick-navy dark:bg-slate-800 rounded-b-2xl z-50 items-center justify-around px-2 text-[10px] text-white/50">
            <div className="w-2.5 h-2.5 bg-black rounded-full"></div>
            <div className="w-16 h-1 bg-white/20 rounded-full"></div>
            <div className="w-2 h-2 bg-blue-500/80 rounded-full animate-pulse"></div>
          </div>
        )}

        {/* If logged in, show search/profile tabs; otherwise, welcome & phone forms */}
        {isLoggedIn ? <WorkerLayout /> : <WorkerAuth />}

      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <HomeContent />
    </AppProvider>
  );
}
