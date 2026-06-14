'use client';

import React from 'react';
import { useAppContext } from '../../context/AppContext';

export const ProfileTab: React.FC = () => {
  const {
    language,
    profileName,
    setProfileName,
    profilePhone,
    setProfilePhone,
    profileEmail,
    setProfileEmail,
    profileCity,
    setProfileCity,
    activeProfileSubPage,
    setActiveProfileSubPage,
    setIsLoggedIn,
    setActiveTab,
    triggerToast,
    notificationsEnabled,
    setNotificationsEnabled,
    darkModeEnabled,
    setDarkModeEnabled,
    setLanguage,
    chatMessages,
    chatInput,
    setChatInput,
    handleSendMessage
  } = useAppContext();

  // If no subpage is active, render the main profile directory
  if (!activeProfileSubPage) {
    return (
      <div className="animate-fade-in p-4 space-y-5">
        {/* Profile hero card */}
        <div className="bg-white dark:bg-slate-800 rounded-[28px] p-6 border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-oneclick-orange/5 rounded-full"></div>
          <div className="absolute top-1/2 -left-8 w-20 h-20 bg-oneclick-navy/5 rounded-full"></div>
          
          <div className="relative mb-3 shrink-0">
            <div className="w-20 h-20 rounded-full border-4 border-white dark:border-slate-700 shadow-lg relative bg-oneclick-orange/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-oneclick-navy dark:text-white">person</span>
            </div>
            <div className="absolute bottom-0 right-0 bg-success-green text-white p-1 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-xs font-bold">verified</span>
            </div>
          </div>

          <h2 className="text-lg font-black text-oneclick-navy dark:text-white">{profileName}</h2>
          
          {/* Verified by Diia Badge */}
          <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/40 mt-1 mb-3">
            <div className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-[8px] font-black italic">Дія</div>
            <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300">
              {language === 'uk' ? 'Верифіковано через Дію' : 'Verified via Diia'}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-warning-amber/10 px-3 py-1 rounded-xl">
            <span className="material-symbols-outlined text-warning-amber text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
            <span className="text-xs font-bold text-on-surface dark:text-white">4.9</span>
            <span className="text-[10px] text-secondary dark:text-slate-400 ml-1">
              (124 {language === 'uk' ? 'відгуки' : 'reviews'})
            </span>
          </div>

          <div className="grid grid-cols-3 w-full mt-6 pt-5 border-t border-gray-50 dark:border-slate-700 text-xs">
            <div>
              <span className="text-[10px] text-secondary dark:text-slate-400 font-semibold uppercase">{language === 'uk' ? 'Відпрацьовано' : 'Hours'}</span>
              <p className="text-sm font-black text-oneclick-navy dark:text-white mt-1">42 год</p>
            </div>
            <div className="border-x border-gray-100 dark:border-slate-700">
              <span className="text-[10px] text-secondary dark:text-slate-400 font-semibold uppercase">{language === 'uk' ? 'Виконано' : 'Shifts'}</span>
              <p className="text-sm font-black text-oneclick-navy dark:text-white mt-1">18 змін</p>
            </div>
            <div>
              <span className="text-[10px] text-secondary dark:text-slate-400 font-semibold uppercase">{language === 'uk' ? 'Успішність' : 'Rate'}</span>
              <p className="text-sm font-black text-success-green mt-1">98%</p>
            </div>
          </div>
        </div>

        {/* Menu List */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-bold text-secondary dark:text-slate-500 uppercase tracking-widest px-2 text-left">
            {language === 'uk' ? 'Налаштування акаунту' : 'Account Settings'}
          </p>

          {/* Personal data link */}
          <button 
            onClick={() => {
              setActiveProfileSubPage('personal');
            }}
            className="w-full text-left bg-white dark:bg-slate-800 rounded-2xl p-4 flex items-center justify-between border border-gray-100 dark:border-slate-800 shadow-sm active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <span className="material-symbols-outlined">person_outline</span>
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-on-surface dark:text-white">{language === 'uk' ? 'Особисті дані' : 'Personal Data'}</p>
                <p className="text-[10px] text-secondary dark:text-slate-400 mt-0.5">{language === 'uk' ? 'ПІБ, телефон, адреса' : 'Name, phone, address'}</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-secondary text-base">chevron_right</span>
          </button>

          {/* Documents link */}
          <button 
            onClick={() => setActiveProfileSubPage('documents')}
            className="w-full text-left bg-white dark:bg-slate-800 rounded-2xl p-4 flex items-center justify-between border border-gray-100 dark:border-slate-800 shadow-sm active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center text-oneclick-orange shrink-0">
                <span className="material-symbols-outlined">description</span>
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-on-surface dark:text-white">{language === 'uk' ? 'Документи' : 'Documents'}</p>
                <p className="text-[10px] text-secondary dark:text-slate-400 mt-0.5">{language === 'uk' ? 'Паспорт, ІПН, Санкнижка' : 'Passport, tax ID, medical book'}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="bg-success-green/10 text-success-green text-[8px] font-black px-2 py-0.5 rounded-full uppercase">ОК</span>
              <span className="material-symbols-outlined text-secondary text-base">chevron_right</span>
            </div>
          </button>

          {/* Support Help Center */}
          <button 
            onClick={() => setActiveProfileSubPage('help')}
            className="w-full text-left bg-white dark:bg-slate-800 rounded-2xl p-4 flex items-center justify-between border border-gray-100 dark:border-slate-800 shadow-sm active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                <span className="material-symbols-outlined">support_agent</span>
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-on-surface dark:text-white">{language === 'uk' ? 'Центр допомоги' : 'Help Center'}</p>
                <p className="text-[10px] text-secondary dark:text-slate-400 mt-0.5">{language === 'uk' ? 'Часті питання, підтримка' : 'FAQ, support chat'}</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-secondary text-base">chevron_right</span>
          </button>

          {/* Settings link */}
          <button 
            onClick={() => setActiveProfileSubPage('settings')}
            className="w-full text-left bg-white dark:bg-slate-800 rounded-2xl p-4 flex items-center justify-between border border-gray-100 dark:border-slate-800 shadow-sm active:scale-95 transition-transform"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-slate-300 shrink-0">
                <span className="material-symbols-outlined">settings</span>
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-on-surface dark:text-white">{language === 'uk' ? 'Налаштування' : 'Settings'}</p>
                <p className="text-[10px] text-secondary dark:text-slate-400 mt-0.5">{language === 'uk' ? 'Сповіщення, інтерфейс, мова' : 'Notifications, theme, language'}</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-secondary text-base">chevron_right</span>
          </button>

          {/* Logout */}
          <button 
            onClick={() => {
              if (confirm(language === 'uk' ? 'Ви впевнені, що хочете вийти з акаунту?' : 'Are you sure you want to log out?')) {
                setIsLoggedIn(false);
                setActiveTab('search');
              }
            }}
            className="w-full text-left bg-white dark:bg-slate-800 rounded-2xl p-4 flex items-center justify-between border border-red-100 dark:border-red-950/20 shadow-sm active:scale-95 transition-transform mt-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-600 shrink-0">
                <span className="material-symbols-outlined">logout</span>
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-red-600">{language === 'uk' ? 'Вийти з акаунту' : 'Logout'}</p>
                <p className="text-[10px] text-red-400/80 mt-0.5">{language === 'uk' ? 'Завершити поточну сесію' : 'End current session'}</p>
              </div>
            </div>
          </button>
        </div>

        <div className="text-center opacity-40 py-2">
          <p className="text-[10px] font-bold">OneClick B2C Client v1.0.0</p>
          <div className="flex justify-center gap-4 text-[9px] mt-1 underline">
            <a href="#">{language === 'uk' ? 'Політика конфіденційності' : 'Privacy Policy'}</a>
            <a href="#">{language === 'uk' ? 'Умови використання' : 'Terms of Service'}</a>
          </div>
        </div>
      </div>
    );
  }

  // 1. PERSONAL DATA SUBPAGE
  if (activeProfileSubPage === 'personal') {
    return (
      <div className="absolute inset-0 z-50 bg-[#fcf9f8] dark:bg-[#0b0c10] flex flex-col overflow-y-auto no-scrollbar animate-fade-in text-left">
        <div className="bg-white dark:bg-slate-900 px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setActiveProfileSubPage(null)} className="text-secondary dark:text-slate-400 hover:text-oneclick-orange flex items-center">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-base font-extrabold text-oneclick-navy dark:text-white">{language === 'uk' ? 'Особисті дані' : 'Personal Data'}</h2>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-secondary dark:text-slate-500 uppercase mb-1">{language === 'uk' ? 'ПІБ' : 'Full Name'}</label>
              <input 
                type="text" 
                value={profileName} 
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200/50 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-oneclick-navy dark:text-white outline-none focus:border-oneclick-orange"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-secondary dark:text-slate-500 uppercase mb-1">{language === 'uk' ? 'Телефон' : 'Phone'}</label>
              <input 
                type="text" 
                value={profilePhone} 
                onChange={(e) => setProfilePhone(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200/50 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-oneclick-navy dark:text-white outline-none focus:border-oneclick-orange"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-secondary dark:text-slate-500 uppercase mb-1">Email</label>
              <input 
                type="email" 
                value={profileEmail} 
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200/50 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-oneclick-navy dark:text-white outline-none focus:border-oneclick-orange"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-secondary dark:text-slate-500 uppercase mb-1">{language === 'uk' ? 'Місто' : 'City'}</label>
              <input 
                type="text" 
                value={profileCity} 
                onChange={(e) => setProfileCity(e.target.value)}
                className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200/50 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-oneclick-navy dark:text-white outline-none focus:border-oneclick-orange"
              />
            </div>

            <button 
              onClick={() => {
                setActiveProfileSubPage(null);
                triggerToast(language === 'uk' ? 'Дані успішно збережено!' : 'Data saved successfully!');
              }}
              className="w-full bg-oneclick-orange text-white py-3.5 rounded-xl font-bold text-xs shadow-premium-glow"
            >
              {language === 'uk' ? 'Зберегти зміни' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. DOCUMENTS SUBPAGE
  if (activeProfileSubPage === 'documents') {
    return (
      <div className="absolute inset-0 z-50 bg-[#fcf9f8] dark:bg-[#0b0c10] flex flex-col overflow-y-auto no-scrollbar animate-fade-in text-left">
        <div className="bg-white dark:bg-slate-900 px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setActiveProfileSubPage(null)} className="text-secondary dark:text-slate-400 hover:text-oneclick-orange flex items-center">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-base font-extrabold text-oneclick-navy dark:text-white">{language === 'uk' ? 'Документи' : 'Documents'}</h2>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-3xl p-5 border border-blue-100 dark:border-blue-900/40 flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-600 text-xl mt-0.5 shrink-0">verified_user</span>
            <p className="text-[11px] text-blue-900 dark:text-blue-300 font-medium leading-relaxed">
              {language === 'uk' 
                ? 'Ваш аккаунт успішно верифіковано через інтеграцію з сервісом Дія. Ви маєте повний доступ до всіх вакансій.' 
                : 'Your account has been successfully verified via Diia. You have full access to all shifts.'}
            </p>
          </div>

          <div className="space-y-3">
            {[
              { title: language === 'uk' ? 'Паспорт громадянина України' : 'ID Passport', desc: language === 'uk' ? 'ID-картка верифікована через Дію' : 'Verified via Diia', date: '12.06.2026' },
              { title: language === 'uk' ? 'Реєстраційний номер платника (ІПН)' : 'Tax ID Number', desc: language === 'uk' ? 'ІПН верифіковано через Дію' : 'Verified via Diia', date: '12.06.2026' },
              { title: language === 'uk' ? 'Медична книжка' : 'Sanitary Medical Book', desc: language === 'uk' ? 'Дійсна до: 12.2027' : 'Valid until: 12.2027', date: '04.05.2026', verified: true }
            ].map((doc, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-2xl flex items-center justify-between border border-gray-100 dark:border-slate-800 shadow-sm">
                <div>
                  <p className="text-xs font-bold text-oneclick-navy dark:text-white">{doc.title}</p>
                  <p className="text-[10px] text-secondary dark:text-slate-400 mt-0.5">{doc.desc}</p>
                  <span className="text-[8px] text-gray-400 mt-1 block">{language === 'uk' ? 'Додано' : 'Added'}: {doc.date}</span>
                </div>
                <span className="bg-success-green/10 text-success-green text-[9px] font-black px-2 py-1 rounded-lg border border-success-green/20 shrink-0">
                  {language === 'uk' ? 'ВЕРИФІКОВАНО' : 'VERIFIED'}
                </span>
              </div>
            ))}
          </div>

          <button 
            onClick={() => triggerToast(language === 'uk' ? 'Функція завантаження документів буде доступна в релізі!' : 'Document upload will be available in final release!')}
            className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-slate-700 hover:border-oneclick-orange hover:bg-white dark:hover:bg-slate-800 rounded-2xl text-xs font-bold text-secondary dark:text-slate-400 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">upload_file</span>
            {language === 'uk' ? 'Завантажити новий документ' : 'Upload New Document'}
          </button>
        </div>
      </div>
    );
  }

  // 3. SETTINGS SUBPAGE
  if (activeProfileSubPage === 'settings') {
    return (
      <div className="absolute inset-0 z-50 bg-[#fcf9f8] dark:bg-[#0b0c10] flex flex-col overflow-y-auto no-scrollbar animate-fade-in text-left">
        <div className="bg-white dark:bg-slate-900 px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setActiveProfileSubPage(null)} className="text-secondary dark:text-slate-400 hover:text-oneclick-orange flex items-center">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-base font-extrabold text-oneclick-navy dark:text-white">{language === 'uk' ? 'Налаштування' : 'Settings'}</h2>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-gray-100 dark:border-slate-800 shadow-sm space-y-4">
            {/* Notifications toggle */}
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-xs font-bold text-oneclick-navy dark:text-white">{language === 'uk' ? 'Push-сповіщення' : 'Push Notifications'}</p>
                <p className="text-[10px] text-secondary dark:text-slate-400 mt-0.5">{language === 'uk' ? 'Отримувати сповіщення про нові гарячі зміни' : 'Get notified about new hot shifts'}</p>
              </div>
              <button 
                onClick={() => {
                  setNotificationsEnabled(!notificationsEnabled);
                  triggerToast(!notificationsEnabled ? 'Push-сповіщення увімкнено' : 'Push-сповіщення вимкнено');
                }}
                className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${
                  notificationsEnabled ? 'bg-oneclick-orange' : 'bg-gray-200 dark:bg-slate-700'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  notificationsEnabled ? 'right-1' : 'left-1'
                }`}></div>
              </button>
            </div>

            <div className="h-px w-full bg-gray-50 dark:bg-slate-700"></div>

            {/* Dark mode toggle */}
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-xs font-bold text-oneclick-navy dark:text-white">{language === 'uk' ? 'Темна тема' : 'Dark Mode'}</p>
                <p className="text-[10px] text-secondary dark:text-slate-400 mt-0.5">{language === 'uk' ? 'Увімкнути темне оформлення інтерфейсу' : 'Enable dark design theme'}</p>
              </div>
              <button 
                onClick={() => setDarkModeEnabled(!darkModeEnabled)}
                className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${
                  darkModeEnabled ? 'bg-oneclick-orange' : 'bg-gray-200 dark:bg-slate-700'
                }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                  darkModeEnabled ? 'right-1' : 'left-1'
                }`}></div>
              </button>
            </div>

            <div className="h-px w-full bg-gray-50 dark:bg-slate-700"></div>

            {/* Language Switch */}
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-xs font-bold text-oneclick-navy dark:text-white">{language === 'uk' ? 'Мова додатку' : 'Language'}</p>
                <p className="text-[10px] text-secondary dark:text-slate-400 mt-0.5">{language === 'uk' ? 'Вибір поточної мови інтерфейсу' : 'Select app interface language'}</p>
              </div>
              <div className="flex bg-gray-100 dark:bg-slate-900 p-0.5 rounded-lg border border-gray-200/40 dark:border-slate-800 shrink-0">
                <button 
                  onClick={() => setLanguage('uk')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-colors ${
                    language === 'uk' ? 'bg-white dark:bg-slate-700 text-oneclick-orange' : 'text-secondary'
                  }`}
                >
                  UA
                </button>
                <button 
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-colors ${
                    language === 'en' ? 'bg-white dark:bg-slate-700 text-oneclick-orange' : 'text-secondary'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. HELP CENTER SUBPAGE
  if (activeProfileSubPage === 'help') {
    return (
      <div className="absolute inset-0 z-50 bg-[#fcf9f8] dark:bg-[#0b0c10] flex flex-col overflow-y-auto no-scrollbar animate-fade-in text-left">
        <div className="bg-white dark:bg-slate-900 px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setActiveProfileSubPage(null)} className="text-secondary dark:text-slate-400 hover:text-oneclick-orange flex items-center">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-base font-extrabold text-oneclick-navy dark:text-white">{language === 'uk' ? 'Центр допомоги' : 'Help Center'}</h2>
        </div>
        
        <div className="p-4 space-y-4 flex-1 flex flex-col justify-between pb-8">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-secondary dark:text-slate-500 uppercase tracking-widest px-1">FAQ</h3>
            {[
              { q: language === 'uk' ? 'Як працює виплата?' : 'How does payout work?', a: language === 'uk' ? 'Виплата надходить на ваш баланс у додатку миттєво після того, як роботодавець підтвердить закінчення зміни. Вивести кошти на карту можна у розділі "Гаманець" за кілька секунд.' : 'Payout is credited to your wallet instantly after the employer approves the shift end. You can withdraw to your card in the "Wallet" section in seconds.' },
              { q: language === 'uk' ? 'Що таке спліт-платіж?' : 'What is split payment?', a: language === 'uk' ? 'Ми холдуємо кошти роботодавця. Під час завершення зміни гроші розділяються: чиста зарплата йде прямо вам на карту, а наша невелика комісія залишається на платформі.' : 'We hold employer funds in escrow. At shift end, funds are split: your salary is sent directly to your card, and the platform commission is held.' },
              { q: language === 'uk' ? 'Як верифікувати акаунт?' : 'How to verify my account?', a: language === 'uk' ? 'Верифікація є обов\'язковою через Дію. Це захищає бізнес від неявки, а вас — від невиплати заробленого. Пройти її можна при першому вході.' : 'Verification via Diia is mandatory. This protects businesses from no-shows and workers from non-payment. You can pass it during first login.' }
            ].map((faq, i) => (
              <details key={i} className="group bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between p-4 cursor-pointer outline-none select-none">
                  <span className="text-xs font-bold text-oneclick-navy dark:text-white">{faq.q}</span>
                  <span className="material-symbols-outlined text-secondary transition-transform group-open:rotate-180">expand_more</span>
                </summary>
                <div className="px-4 pb-4 text-[11px] text-secondary dark:text-slate-400 font-medium leading-relaxed border-t border-gray-50 dark:border-slate-700/50 pt-3">
                  <p>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>

          <button 
            onClick={() => setActiveProfileSubPage('chat')}
            className="w-full bg-oneclick-navy dark:bg-slate-800 text-white py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform mt-6"
          >
            <span className="material-symbols-outlined text-base">chat</span>
            {language === 'uk' ? 'Написати в підтримку' : 'Chat with Support'}
          </button>
        </div>
      </div>
    );
  }

  // 5. SUPPORT CHAT SUBPAGE
  if (activeProfileSubPage === 'chat') {
    return (
      <div className="absolute inset-0 z-50 bg-[#fcf9f8] dark:bg-[#0b0c10] flex flex-col animate-fade-in text-left">
        {/* Chat Header */}
        <div className="bg-white dark:bg-slate-900 px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveProfileSubPage('help')} className="text-secondary dark:text-slate-400 hover:text-oneclick-orange flex items-center">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h2 className="text-xs font-bold text-oneclick-navy dark:text-white">{language === 'uk' ? 'Підтримка OneClick' : 'OneClick Support'}</h2>
              <p className="text-[9px] text-success-green font-bold flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 bg-success-green rounded-full inline-block animate-pulse"></span>
                <span>{language === 'uk' ? 'Онлайн' : 'Online'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto no-scrollbar space-y-3.5 flex flex-col bg-slate-50 dark:bg-slate-950">
          {chatMessages.map((msg) => (
            <div 
              key={msg.id}
              className={`max-w-[85%] p-3.5 rounded-2xl text-xs font-semibold ${
                msg.sender === 'user'
                  ? 'bg-oneclick-orange text-white align-self-end rounded-tr-none self-end'
                  : 'bg-white dark:bg-slate-800 text-on-surface dark:text-white rounded-tl-none self-start border border-gray-100 dark:border-slate-800'
              }`}
            >
              <p className="leading-relaxed">{msg.text}</p>
              <span className={`text-[8px] mt-1.5 block text-right ${msg.sender === 'user' ? 'text-white/60' : 'text-gray-400'}`}>
                {msg.timestamp}
              </span>
            </div>
          ))}
        </div>

        {/* Chat Input form */}
        <form onSubmit={handleSendMessage} className="bg-white dark:bg-slate-900 p-3 border-t border-gray-100 dark:border-slate-800 flex gap-2">
          <input 
            type="text" 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={language === 'uk' ? 'Введіть повідомлення...' : 'Type a message...'}
            className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-200/50 dark:border-slate-700 rounded-xl px-4 py-3 text-xs outline-none text-on-surface dark:text-white"
          />
          <button 
            type="submit" 
            className="w-12 h-12 bg-oneclick-orange text-white rounded-xl flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-xl">send</span>
          </button>
        </form>
      </div>
    );
  }

  return null;
};
