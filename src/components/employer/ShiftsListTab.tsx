'use client';

import React from 'react';
import { useAppContext } from '../../context/AppContext';

export const ShiftsListTab: React.FC = () => {
  const { language, shifts, employerCompany, setB2bActiveTab } = useAppContext();
  const companyShifts = shifts.filter(s => s.company === employerCompany);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-sm border border-gray-200/50 dark:border-slate-800 overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-gray-150 dark:border-slate-800 flex justify-between items-center">
        <h3 className="text-base font-black text-oneclick-navy dark:text-white">
          {language === 'uk' ? 'Опубліковані зміни компанії' : 'Posted Shifts Log'}
        </h3>
        <button 
          onClick={() => setB2bActiveTab('post-shift')}
          className="bg-oneclick-orange text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-sm font-bold">add</span>
          <span>{language === 'uk' ? 'Створити нову' : 'Create New'}</span>
        </button>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse text-xs select-none">
          <thead>
            <tr className="bg-gray-50 dark:bg-slate-800 text-secondary dark:text-slate-400 font-bold border-b border-gray-100 dark:border-slate-700 uppercase tracking-widest text-[9px]">
              <th className="py-4 px-6">{language === 'uk' ? 'Посада' : 'Role'}</th>
              <th className="py-4 px-6">{language === 'uk' ? 'Категорія' : 'Category'}</th>
              <th className="py-4 px-6">{language === 'uk' ? 'Дата' : 'Date'}</th>
              <th className="py-4 px-6">{language === 'uk' ? 'Час' : 'Hours'}</th>
              <th className="py-4 px-6 text-right">{language === 'uk' ? 'Ставка' : 'Payout'}</th>
              <th className="py-4 px-6 text-center">{language === 'uk' ? 'Статус' : 'Status'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800 font-medium">
            {companyShifts.length > 0 ? (
              companyShifts.map((sh) => (
                <tr key={sh.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 px-6 font-black text-oneclick-navy dark:text-white">{sh.role}</td>
                  <td className="py-4 px-6 text-secondary dark:text-slate-400">{sh.type}</td>
                  <td className="py-4 px-6 font-bold">{sh.date} {language === 'uk' ? 'Жовтня' : 'Oct'}</td>
                  <td className="py-4 px-6 text-secondary dark:text-slate-400">{sh.time}</td>
                  <td className="py-4 px-6 text-right font-black text-oneclick-orange">{sh.price} ₴</td>
                  <td className="py-4 px-6 text-center">
                    <span className="bg-success-green/10 text-success-green text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                      {language === 'uk' ? 'Активна' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-12 text-center text-secondary dark:text-slate-500 font-bold">
                  {language === 'uk' ? 'Жодних змін поки що не опубліковано.' : 'No shifts posted yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
