'use client';

import React from 'react';
import { useAppContext } from '../../context/AppContext';

export const ApplicationsTab: React.FC = () => {
  const {
    language,
    myShifts,
    employerCompany,
    profileName,
    handleApproveApplication,
    handleDeclineApplication
  } = useAppContext();

  const companyApplications = myShifts.filter(ms => ms.company === employerCompany && ms.status === 'pending');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-gray-200/50 dark:border-slate-800 overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-150 dark:border-slate-800">
        <h3 className="text-base font-black text-oneclick-navy dark:text-white">
          {language === 'uk' ? 'Заявки на працевлаштування від студентів' : 'Candidate Job Applications'}
        </h3>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse text-xs select-none">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800 text-secondary dark:text-slate-400 font-bold border-b border-gray-100 dark:border-slate-700 uppercase tracking-widest text-[9px]">
              <th className="py-4 px-6">{language === 'uk' ? 'Кандидат' : 'Candidate'}</th>
              <th className="py-4 px-6">{language === 'uk' ? 'Вакансія' : 'Role'}</th>
              <th className="py-4 px-6">{language === 'uk' ? 'Дата зміни' : 'Shift Date'}</th>
              <th className="py-4 px-6 text-right">{language === 'uk' ? 'Оплата' : 'Price'}</th>
              <th className="py-4 px-6 text-center">{language === 'uk' ? 'Дії' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
            {companyApplications.length > 0 ? (
              companyApplications.map((us) => (
                <tr key={us.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-oneclick-navy text-white flex items-center justify-center font-bold text-xs">
                        ОК
                      </div>
                      <div>
                        <p className="font-black text-oneclick-navy dark:text-white">{profileName}</p>
                        <p className="text-[10px] text-success-green font-bold">★ 4.9 • {language === 'uk' ? 'Дія верифікований' : 'Verified'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-bold text-oneclick-navy dark:text-white">{us.role}</td>
                  <td className="py-4 px-6">{us.date} {language === 'uk' ? 'Жовтня' : 'Oct'} • {us.time}</td>
                  <td className="py-4 px-6 text-right font-black text-oneclick-orange">{us.price} ₴</td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2 justify-center">
                      <button 
                        onClick={() => handleApproveApplication(us.id)}
                        className="bg-success-green text-white hover:bg-success-green/95 px-3 py-1.5 rounded-xl font-bold transition-transform active:scale-95"
                      >
                        {language === 'uk' ? 'Схвалити' : 'Approve'}
                      </button>
                      <button 
                        onClick={() => handleDeclineApplication(us.id)}
                        className="bg-gray-150 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-secondary dark:text-white px-3 py-1.5 rounded-xl font-bold transition-transform active:scale-95"
                      >
                        {language === 'uk' ? 'Відхилити' : 'Decline'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-secondary dark:text-slate-500 font-bold">
                  {language === 'uk' ? 'Жодних нових заявок немає.' : 'No pending applications.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
