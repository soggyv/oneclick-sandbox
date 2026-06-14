'use client';

import React from 'react';
import { useAppContext } from '../../context/AppContext';

export const CheckinsTab: React.FC = () => {
  const {
    language,
    myShifts,
    employerCompany,
    profileName,
    profilePhone,
    handleApprovePayout
  } = useAppContext();

  const companyActiveCheckins = myShifts.filter(ms => 
    ms.company === employerCompany && 
    (ms.status === 'in_progress' || ms.status === 'completed_pending_payout')
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-gray-200/50 dark:border-slate-800 overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-150 dark:border-slate-800">
        <h3 className="text-base font-black text-oneclick-navy dark:text-white">
          {language === 'uk' ? 'Контроль Чек-інів та Спліт-Виплати' : 'Check-ins Control & Split Payouts'}
        </h3>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse text-xs select-none">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800 text-secondary dark:text-slate-400 font-bold border-b border-gray-100 dark:border-slate-700 uppercase tracking-widest text-[9px]">
              <th className="py-4 px-6">{language === 'uk' ? 'Працівник' : 'Worker'}</th>
              <th className="py-4 px-6">{language === 'uk' ? 'Зміна / Посада' : 'Shift / Role'}</th>
              <th className="py-4 px-6">{language === 'uk' ? 'Дата / Години' : 'Date / Hours'}</th>
              <th className="py-4 px-6 text-right">{language === 'uk' ? 'Виплата' : 'Amount'}</th>
              <th className="py-4 px-6 text-center">{language === 'uk' ? 'Статус чек-іну' : 'Check-in Status'}</th>
              <th className="py-4 px-6 text-center">{language === 'uk' ? 'Виплатити' : 'Action'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
            {companyActiveCheckins.length > 0 ? (
              companyActiveCheckins.map((us) => (
                <tr key={us.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-oneclick-navy text-white flex items-center justify-center font-bold text-xs">
                        ОК
                      </div>
                      <div>
                        <p className="font-black text-oneclick-navy dark:text-white">{profileName}</p>
                        <p className="text-[10px] text-secondary truncate">{profilePhone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-bold text-oneclick-navy dark:text-white">{us.role}</td>
                  <td className="py-4 px-6">{us.date} {language === 'uk' ? 'Жовтня' : 'Oct'} • {us.time}</td>
                  <td className="py-4 px-6 text-right font-black text-oneclick-orange">{us.price} ₴</td>
                  <td className="py-4 px-6 text-center">
                    {us.status === 'in_progress' ? (
                      <span className="bg-blue-500/10 text-blue-500 text-[9px] font-black px-2.5 py-1 rounded-full uppercase flex items-center gap-1 w-fit mx-auto animate-pulse">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                        {language === 'uk' ? 'На зміні' : 'On Shift'}
                      </span>
                    ) : (
                      <span className="bg-orange-500/10 text-orange-500 text-[9px] font-black px-2.5 py-1 rounded-full uppercase flex items-center gap-1 w-fit mx-auto">
                        <span className="material-symbols-outlined text-[12px]">pending_actions</span>
                        {language === 'uk' ? 'Зміну завершено' : 'Completed'}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center">
                      {us.status === 'completed_pending_payout' ? (
                        <button 
                          onClick={() => handleApprovePayout(us)}
                          className="bg-success-green text-white hover:bg-success-green/95 px-4 py-2 rounded-xl font-bold flex items-center gap-1 shadow-md active:scale-95 transition-all text-[11px]"
                        >
                          <span className="material-symbols-outlined text-sm font-bold">check</span>
                          <span>{language === 'uk' ? 'Виплатити' : 'Pay Out'}</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 font-bold italic">
                          {language === 'uk' ? 'В процесі роботи' : 'Still Working'}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-secondary dark:text-slate-500 font-bold">
                  {language === 'uk' ? 'Жодних активних робочих сесій немає.' : 'No active check-ins.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
