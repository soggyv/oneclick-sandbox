'use client';

import React from 'react';
import { useAppContext } from '../../context/AppContext';

export const WalletTab: React.FC = () => {
  const {
    language,
    balance,
    myShifts,
    transactions,
    setShowWithdrawModal
  } = useAppContext();

  return (
    <div className="animate-fade-in p-4 space-y-4">
      <h2 className="text-2xl font-black text-oneclick-navy dark:text-white text-left">{language === 'uk' ? 'Гаманець' : 'Wallet'}</h2>

      {/* Balance Card */}
      <div className="relative overflow-hidden rounded-[28px] bg-oneclick-navy p-6 shadow-xl text-white text-left">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-oneclick-orange opacity-25 rounded-full blur-3xl"></div>
        <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-blue-600 opacity-20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 font-sans">
          <span className="text-xs font-semibold text-white/70 uppercase tracking-widest">
            {language === 'uk' ? 'Доступний баланс' : 'Available Balance'}
          </span>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-4xl font-black leading-none">{balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span className="text-lg font-bold text-white/80">₴</span>
          </div>
          
          <div className="mt-8 grid grid-cols-2 gap-3">
            <button 
              onClick={() => setShowWithdrawModal(true)}
              className="orange-glow bg-oneclick-orange hover:bg-oneclick-orange/90 text-white py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-xs active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-base">payments</span>
              {language === 'uk' ? 'Вивести' : 'Withdraw'}
            </button>
            <button 
              onClick={() => {
                const container = document.getElementById('transactions-container');
                if (container) container.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-xs active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-base">history</span>
              {language === 'uk' ? 'Операції' : 'History'}
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Bento Stats */}
      <div className="grid grid-cols-2 gap-4 text-left">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-success-green mb-1">
            <span className="material-symbols-outlined text-base font-bold">arrow_upward</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">{language === 'uk' ? 'Нараховано' : 'Earned'}</span>
          </div>
          <p className="text-xl font-black text-oneclick-navy dark:text-white">3,200 ₴</p>
          <p className="text-[9px] text-secondary dark:text-slate-500 font-semibold mt-1">
            {language === 'uk' ? 'За цей тиждень' : 'This week'}
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-oneclick-orange mb-1">
            <span className="material-symbols-outlined text-base">schedule</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">{language === 'uk' ? 'В обробці' : 'Pending'}</span>
          </div>
          <p className="text-xl font-black text-oneclick-navy dark:text-white">
            {myShifts.filter(s => s.status === 'pending').reduce((sum, current) => sum + current.price, 0)} ₴
          </p>
          <p className="text-[9px] text-secondary dark:text-slate-500 font-semibold mt-1">
            {language === 'uk' ? 'Очікує підтвердження' : 'Awaiting approval'}
          </p>
        </div>
      </div>

      {/* Promotion Bento card */}
      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-3xl p-5 border border-blue-100 dark:border-blue-900/40 flex items-center gap-4 relative overflow-hidden text-left">
        <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-500 opacity-5 rounded-full"></div>
        <div className="flex-1 font-sans">
          <h3 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider">{language === 'uk' ? 'Отримуйте бонуси!' : 'Get bonuses!'}</h3>
          <p className="text-xs text-blue-800/80 dark:text-blue-400/80 mt-1 font-medium leading-relaxed">
            {language === 'uk' 
              ? 'Запросіть друга та отримайте 200 ₴ після його першої зміни.' 
              : 'Invite a friend and get 200 ₴ after their first shift.'}
          </p>
        </div>
        <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
          <span className="material-symbols-outlined text-[32px] text-oneclick-orange">celebration</span>
        </div>
      </div>

      {/* Transactions list */}
      <div id="transactions-container" className="pt-2 space-y-3 text-left">
        <div className="flex justify-between items-center">
          <h3 className="text-base font-black text-oneclick-navy dark:text-white">{language === 'uk' ? 'Останні операції' : 'Recent Transactions'}</h3>
          <button className="text-oneclick-orange font-bold text-xs">{language === 'uk' ? 'Фільтр' : 'Filters'}</button>
        </div>

        <div className="space-y-3 font-sans">
          {transactions.map((tx) => (
            <div 
              key={tx.id} 
              className="bg-white dark:bg-slate-800 p-4 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  tx.type === 'work' 
                    ? 'bg-success-green/10 text-success-green' 
                    : 'bg-oneclick-orange/10 text-oneclick-orange'
                }`}>
                  <span className="material-symbols-outlined text-xl">
                    {tx.type === 'work' ? 'work' : 'account_balance_wallet'}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-on-surface dark:text-white line-clamp-1">{tx.title}</p>
                  <p className="text-[10px] text-secondary dark:text-slate-400 font-semibold mt-0.5">{tx.dateStr}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className={`text-xs font-black ${tx.amount > 0 ? 'text-success-green' : 'text-on-surface dark:text-white'}`}>
                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount} ₴
                </p>
                <span className={`text-[8px] font-black uppercase tracking-wider ${
                  tx.status === 'completed' 
                    ? 'text-success-green' 
                    : tx.status === 'processing' 
                      ? 'text-warning-amber animate-pulse' 
                      : 'text-red-500'
                }`}>
                  {tx.status === 'completed' && (language === 'uk' ? 'Виконано' : 'Completed')}
                  {tx.status === 'processing' && (language === 'uk' ? 'Обробка' : 'Processing')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
