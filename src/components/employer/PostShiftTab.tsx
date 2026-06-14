'use client';

import React from 'react';
import { useAppContext } from '../../context/AppContext';

export const PostShiftTab: React.FC = () => {
  const {
    language,
    newShiftRole,
    setNewShiftRole,
    newShiftCategory,
    setNewShiftCategory,
    newShiftDate,
    setNewShiftDate,
    newShiftTime,
    setNewShiftTime,
    newShiftPrice,
    setNewShiftPrice,
    newShiftAddress,
    setNewShiftAddress,
    newShiftDetails,
    setNewShiftDetails,
    newShiftRequirements,
    setNewShiftRequirements,
    newShiftResponsibilities,
    setNewShiftResponsibilities,
    handleCreateShift
  } = useAppContext();

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-sm border border-gray-200/50 dark:border-slate-800 animate-fade-in max-w-2xl mx-auto">
      <h2 className="text-xl font-black text-oneclick-navy dark:text-white mb-2">
        {language === 'uk' ? 'Опублікувати нову зміну' : 'Post a New Shift'}
      </h2>
      <p className="text-xs text-secondary dark:text-slate-400 font-medium mb-6">
        {language === 'uk' 
          ? 'Заповніть форму. Вакансія з\'явиться в стрічці пошуку мобільного додатка OneClick миттєво.' 
          : 'Fill in the form to publish a gig. It will instantly show up in the worker feed.'}
      </p>

      <form onSubmit={handleCreateShift} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-secondary dark:text-slate-400 uppercase tracking-wider mb-1">
              {language === 'uk' ? 'Назва Посади' : 'Position Title'} *
            </label>
            <input 
              type="text" 
              required
              value={newShiftRole}
              onChange={(e) => setNewShiftRole(e.target.value)}
              placeholder={language === 'uk' ? 'наприклад Бариста' : 'e.g. Barista'}
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-oneclick-navy dark:text-white outline-none focus:border-oneclick-orange"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-secondary dark:text-slate-400 uppercase tracking-wider mb-1">
              {language === 'uk' ? 'Категорія' : 'Category'} *
            </label>
            <select 
              value={newShiftCategory}
              onChange={(e) => setNewShiftCategory(e.target.value as any)}
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-oneclick-navy dark:text-white outline-none focus:border-oneclick-orange cursor-pointer"
            >
              <option value="Склади">{language === 'uk' ? 'Склади / Логістика' : 'Warehouses'}</option>
              <option value="Рітейл">{language === 'uk' ? 'Рітейл / Торгівля' : 'Retail'}</option>
              <option value="Кафе">{language === 'uk' ? 'Кафе / Ресторани' : 'Cafes'}</option>
              <option value="Кур\'єр">{language === 'uk' ? 'Доставка / Кур\'єри' : 'Delivery'}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-secondary dark:text-slate-400 uppercase tracking-wider mb-1">
              {language === 'uk' ? 'Дата роботи (День)' : 'Work Date (Day)'} *
            </label>
            <select 
              value={newShiftDate}
              onChange={(e) => setNewShiftDate(e.target.value)}
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-oneclick-navy dark:text-white outline-none focus:border-oneclick-orange cursor-pointer"
            >
              <option value="15">15 {language === 'uk' ? 'Жовтня' : 'October'}</option>
              <option value="16">16 {language === 'uk' ? 'Жовтня' : 'October'}</option>
              <option value="17">17 {language === 'uk' ? 'Жовтня' : 'October'}</option>
              <option value="18">18 {language === 'uk' ? 'Жовтня' : 'October'}</option>
              <option value="19">19 {language === 'uk' ? 'Жовтня' : 'October'}</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-secondary dark:text-slate-400 uppercase tracking-wider mb-1">
              {language === 'uk' ? 'Час роботи' : 'Working Hours'} *
            </label>
            <input 
              type="text" 
              required
              value={newShiftTime}
              onChange={(e) => setNewShiftTime(e.target.value)}
              placeholder="08:00 — 20:00"
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-oneclick-navy dark:text-white outline-none focus:border-oneclick-orange"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-secondary dark:text-slate-400 uppercase tracking-wider mb-1">
              {language === 'uk' ? 'Виплата (₴)' : 'Payout (₴)'} *
            </label>
            <input 
              type="number" 
              required
              value={newShiftPrice}
              onChange={(e) => setNewShiftPrice(e.target.value)}
              placeholder="1200"
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-oneclick-navy dark:text-white outline-none focus:border-oneclick-orange"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-secondary dark:text-slate-400 uppercase tracking-wider mb-1">
            {language === 'uk' ? 'Адреса роботи' : 'Location Address'} *
          </label>
          <input 
            type="text" 
            required
            value={newShiftAddress}
            onChange={(e) => setNewShiftAddress(e.target.value)}
            placeholder={language === 'uk' ? 'Одеса, вул. Середньофонтанська, 19' : 'Odesa, Seredniofontanska Str, 19'}
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-oneclick-navy dark:text-white outline-none focus:border-oneclick-orange"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-secondary dark:text-slate-400 uppercase tracking-wider mb-1">
            {language === 'uk' ? 'Детальний опис вакансії' : 'Job Details / Description'}
          </label>
          <textarea 
            value={newShiftDetails}
            onChange={(e) => setNewShiftDetails(e.target.value)}
            rows={3}
            placeholder={language === 'uk' ? 'Опишіть завдання, місце входу на склад/кав\'ярню та додаткові особливості...' : 'Describe duties, where to report, or other guidelines...'}
            className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-oneclick-navy dark:text-white outline-none focus:border-oneclick-orange resize-none"
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-secondary dark:text-slate-400 uppercase tracking-wider mb-1">
              {language === 'uk' ? 'Вимоги до працівника (через кому)' : 'Worker Requirements (comma-separated)'}
            </label>
            <input 
              type="text" 
              value={newShiftRequirements}
              onChange={(e) => setNewShiftRequirements(e.target.value)}
              placeholder={language === 'uk' ? 'Медична книжка, Досвід від 6 міс, Ввічливість' : 'Medical book, Punctuality'}
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-oneclick-navy dark:text-white outline-none focus:border-oneclick-orange"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-secondary dark:text-slate-400 uppercase tracking-wider mb-1">
              {language === 'uk' ? 'Обов\'язки на зміні (через кому)' : 'Responsibilities (comma-separated)'}
            </label>
            <input 
              type="text" 
              value={newShiftResponsibilities}
              onChange={(e) => setNewShiftResponsibilities(e.target.value)}
              placeholder={language === 'uk' ? 'Приготування напоїв, Прибирання залу, Робота з касами' : 'Item packing, Loading goods'}
              className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-bold text-oneclick-navy dark:text-white outline-none focus:border-oneclick-orange"
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-oneclick-orange text-white py-4 rounded-2xl font-black text-sm active:scale-98 transition-transform shadow-premium-glow select-none"
        >
          {language === 'uk' ? 'Опублікувати зміну в OneClick' : 'Publish Shift in OneClick'}
        </button>
      </form>
    </div>
  );
};
