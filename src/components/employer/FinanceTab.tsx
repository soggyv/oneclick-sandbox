'use client';

import React from 'react';
import { useAppContext } from '../../context/AppContext';

export const FinanceTab: React.FC = () => {
  const {
    language,
    employerDeposit,
    employerCompany,
    myShifts,
    profileName,
    setShowTopUpModal
  } = useAppContext();

  const companyHistory = myShifts.filter(ms => ms.company === employerCompany && ms.status === 'completed');
  const companyActiveCheckins = myShifts.filter(ms => 
    ms.company === employerCompany && 
    (ms.status === 'in_progress' || ms.status === 'completed_pending_payout')
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Deposit Balance Card */}
        <div className="bg-oneclick-navy text-white p-6 rounded-[28px] shadow-xl relative overflow-hidden md:col-span-1">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-oneclick-orange opacity-25 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col justify-between h-full space-y-8">
            <div>
              <p className="text-white/60 font-bold text-[10px] uppercase tracking-wider">{language === 'uk' ? 'Депозитний Рахунок' : 'Deposit Balance'}</p>
              <h3 className="text-3xl font-black mt-2">{employerDeposit.toLocaleString('en-US')} ₴</h3>
            </div>
            
            <button 
              onClick={() => setShowTopUpModal(true)}
              className="w-full bg-oneclick-orange hover:bg-oneclick-orange/95 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              <span>{language === 'uk' ? 'Поповнити Депозит' : 'Top Up Deposit'}</span>
            </button>
          </div>
        </div>

        {/* Financial Statistics Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] shadow-sm border border-gray-200/50 dark:border-slate-800 md:col-span-2 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-black text-oneclick-navy dark:text-white mb-2">{language === 'uk' ? 'Фінансовий звіт за місяць' : 'Monthly Financial Summary'}</h4>
            <p className="text-xs text-secondary dark:text-slate-400 font-medium">
              {language === 'uk' 
                ? 'Усі транзакції автоматично супроводжуються рахунками-фактурами та актами виконаних робіт.' 
                : 'All payments automatically generate invoices and acts of acceptance.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100 dark:border-slate-800 mt-6 text-center">
            <div>
              <p className="text-[9px] font-bold text-secondary dark:text-slate-500 uppercase tracking-widest">{language === 'uk' ? 'Всього виплачено' : 'Total Paid'}</p>
              <p className="text-base font-black text-oneclick-navy dark:text-white mt-1">
                {companyHistory.reduce((sum, current) => sum + current.price, 0).toLocaleString('en-US')} ₴
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-secondary dark:text-slate-500 uppercase tracking-widest">{language === 'uk' ? 'Резерв під зміни' : 'Reserved Payouts'}</p>
              <p className="text-base font-black text-oneclick-navy dark:text-white mt-1">
                {companyActiveCheckins.reduce((sum, current) => sum + current.price, 0).toLocaleString('en-US')} ₴
              </p>
            </div>
            <div>
              <p className="text-[9px] font-bold text-secondary dark:text-slate-500 uppercase tracking-widest">{language === 'uk' ? 'Податкові звіти' : 'Tax Reports'}</p>
              <span className="bg-success-green/10 text-success-green text-[9px] font-black px-2 py-0.5 rounded-full uppercase mt-1 inline-block">
                {language === 'uk' ? 'Подано' : 'Submitted'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Billing History / Ledger */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-gray-200/50 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-gray-150 dark:border-slate-800">
          <h3 className="text-base font-black text-oneclick-navy dark:text-white">
            {language === 'uk' ? 'Журнал фінансових операцій' : 'Billing Transactions Ledger'}
          </h3>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs select-none">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800 text-secondary dark:text-slate-400 font-bold border-b border-gray-100 dark:border-slate-700 uppercase tracking-widest text-[9px]">
                <th className="py-4 px-6">{language === 'uk' ? 'Тип транзакції' : 'Transaction'}</th>
                <th className="py-4 px-6">{language === 'uk' ? 'Дата / Час' : 'Date / Time'}</th>
                <th className="py-4 px-6">{language === 'uk' ? 'Призначення' : 'Purpose'}</th>
                <th className="py-4 px-6 text-right">{language === 'uk' ? 'Сума' : 'Amount'}</th>
                <th className="py-4 px-6 text-center">{language === 'uk' ? 'Статус' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
              {companyHistory.length > 0 ? (
                companyHistory.map((us) => (
                  <tr key={us.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-4 px-6 flex items-center gap-2">
                      <span className="material-symbols-outlined text-success-green text-lg">payment</span>
                      <span className="font-bold">{language === 'uk' ? 'Спліт-виплата ЦПХ' : 'Split Payout'}</span>
                    </td>
                    <td className="py-4 px-6 text-secondary dark:text-slate-400">Сьогодні, щойно</td>
                    <td className="py-4 px-6 font-bold text-oneclick-navy dark:text-white">
                      {language === 'uk' ? `Оплата зміни: ${us.role} (${profileName})` : `Payout for ${us.role} (${profileName})`}
                    </td>
                    <td className="py-4 px-6 text-right font-black text-red-500">-{us.price} ₴</td>
                    <td className="py-4 px-6 text-center">
                      <span className="bg-success-green/10 text-success-green text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                        {language === 'uk' ? 'Проведено' : 'Settled'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-secondary dark:text-slate-500 font-bold">
                    {language === 'uk' ? 'Жодних операцій виплат поки що не зареєстровано.' : 'No financial transactions recorded yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
