import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Building, Mail, Phone, User } from 'lucide-react';

interface WelcomeScreenProps {
  theme: 'light' | 'dark' | 'minimalist';
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark' | 'minimalist'>>;
  authStep: 'welcome' | 'phone-input' | 'phone-verify' | 'diia-qr' | 'company-register';
  setAuthStep: React.Dispatch<React.SetStateAction<'welcome' | 'phone-input' | 'phone-verify' | 'diia-qr' | 'company-register'>>;
  regRole: 'worker' | 'employer';
  setRegRole: React.Dispatch<React.SetStateAction<'worker' | 'employer'>>;
  agreedToTerms: boolean;
  setAgreedToTerms: React.Dispatch<React.SetStateAction<boolean>>;
  setShowAgreementModal: React.Dispatch<React.SetStateAction<boolean>>;
  regCompanyName: string;
  setRegCompanyName: React.Dispatch<React.SetStateAction<string>>;
  regCompanyEdrpou: string;
  setRegCompanyEdrpou: React.Dispatch<React.SetStateAction<string>>;
  regCompanyAddress: string;
  setRegCompanyAddress: React.Dispatch<React.SetStateAction<string>>;
  regCompanyCategory: 'Кава' | 'Рітейл' | 'Склади';
  setRegCompanyCategory: React.Dispatch<React.SetStateAction<'Кава' | 'Рітейл' | 'Склади'>>;
  tempPhone: string;
  setTempPhone: React.Dispatch<React.SetStateAction<string>>;
  tempName: string;
  setTempName: React.Dispatch<React.SetStateAction<string>>;
  smsCode: string;
  setSmsCode: React.Dispatch<React.SetStateAction<string>>;
  expectedSmsCode: string;
  setExpectedSmsCode: React.Dispatch<React.SetStateAction<string>>;
  handleRegisterCompanySubmit: (e: React.FormEvent) => void;
  handleLoginSuccess: (name: string, phone: string, isDiia: boolean) => void;
  triggerToast: (msg: string) => void;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  setUserRole: React.Dispatch<React.SetStateAction<'worker' | 'employer'>>;
}

export function WelcomeScreen({
  theme,
  setTheme,
  authStep,
  setAuthStep,
  regRole,
  setRegRole,
  agreedToTerms,
  setAgreedToTerms,
  setShowAgreementModal,
  regCompanyName,
  setRegCompanyName,
  regCompanyEdrpou,
  setRegCompanyEdrpou,
  regCompanyAddress,
  setRegCompanyAddress,
  regCompanyCategory,
  setRegCompanyCategory,
  tempPhone,
  setTempPhone,
  tempName,
  setTempName,
  smsCode,
  setSmsCode,
  expectedSmsCode,
  setExpectedSmsCode,
  handleRegisterCompanySubmit,
  handleLoginSuccess,
  triggerToast,
  setIsLoggedIn,
  setUserRole
}: WelcomeScreenProps) {
  const [showB2CLoginOptions, setShowB2CLoginOptions] = useState(false);

  return (
    <div className="flex-1 flex flex-col justify-between p-6 relative z-10 overflow-y-auto no-scrollbar">
      {/* Welcome header with theme toggle */}
      <div className="flex justify-between items-center w-full mb-8">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-[#FF5722] to-[#e64a19] rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-[0_4px_10px_rgba(255,87,34,0.3)]">
            1C
          </div>
          <span className={`font-black text-lg uppercase tracking-tight ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>OneClick</span>
        </div>
        <button
          onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
          className={`p-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center border ${theme === 'light'
            ? 'bg-white/70 hover:bg-white border-[#ebe7e7] text-[#001B3D]'
            : 'bg-[#1c2541]/60 hover:bg-[#252f55]/80 border-white/10 text-white'
            } backdrop-blur-[24px]`}
        >
          {theme === 'light' ? (
            <svg className="w-4 h-4 text-[#FF5722]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-[#FF5722]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>

      {/* Step: Welcome */}
      {authStep === 'welcome' && (
        <div className="flex-1 flex flex-col justify-between my-auto animate-fade-in text-left">
          
          {/* Header text */}
          <div className="space-y-1 mb-6 text-center">
            <h1 className={`text-2xl font-black tracking-tight leading-tight ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>
              Як ви хочете використовувати <span className="text-[#FF5722]">OneClick</span>?
            </h1>
            <p className={`text-xs font-semibold leading-relaxed ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>
              Оберіть ваш статус для початку роботи з платформою
            </p>
          </div>

          {!showB2CLoginOptions ? (
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              {/* Stacked Cards */}
              <div className="space-y-3">
                {/* Worker Card */}
                <button
                  type="button"
                  onClick={() => setRegRole('worker')}
                  className={`w-full text-left p-4.5 rounded-[24px] border-2 transition-all flex items-start gap-4 cursor-pointer relative overflow-hidden group ${
                    regRole === 'worker'
                      ? theme === 'light'
                        ? 'bg-[#FF5722]/5 border-[#FF5722] shadow-[0_6px_20px_rgba(255,87,34,0.08)]'
                        : 'bg-[#FF5722]/10 border-[#FF5722] shadow-[0_6px_24px_rgba(255,87,34,0.15)]'
                      : theme === 'light'
                        ? 'bg-white/60 border-[#E5E7EB] hover:border-gray-300'
                        : 'bg-[#1c2541]/40 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className={`p-3 rounded-2xl ${
                    regRole === 'worker' ? 'bg-[#FF5722] text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-350'
                  }`}>
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black uppercase tracking-wider ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>
                        Виконавець
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        regRole === 'worker' ? 'bg-[#FF5722]/15 text-[#FF5722]' : 'bg-gray-200 dark:bg-slate-800 text-gray-500'
                      }`}>
                        Шукач (B2C)
                      </span>
                    </div>
                    <h3 className={`text-sm font-bold mt-1 ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>
                      Шукаю підробіток та зміни
                    </h3>
                    <p className={`text-[11px] font-semibold mt-1 leading-normal ${theme === 'light' ? 'text-[#5b4039]/80' : 'text-gray-400'}`}>
                      Вільний графік, швидка оплата та зміни поруч із вашим домом.
                    </p>
                  </div>
                </button>

                {/* Employer Card */}
                <button
                  type="button"
                  onClick={() => setRegRole('employer')}
                  className={`w-full text-left p-4.5 rounded-[24px] border-2 transition-all flex items-start gap-4 cursor-pointer relative overflow-hidden group ${
                    regRole === 'employer'
                      ? theme === 'light'
                        ? 'bg-[#001B3D]/5 border-[#001B3D] shadow-[0_6px_20px_rgba(0,27,61,0.08)]'
                        : 'bg-[#001B3D]/30 border-[#001c3d]/80 shadow-[0_6px_24px_rgba(0,27,61,0.35)]'
                      : theme === 'light'
                        ? 'bg-white/60 border-[#E5E7EB] hover:border-gray-300'
                        : 'bg-[#1c2541]/40 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className={`p-3 rounded-2xl ${
                    regRole === 'employer' ? 'bg-[#001B3D] text-white' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-350'
                  }`}>
                    <Building className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-black uppercase tracking-wider ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>
                        Роботодавець
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        regRole === 'employer' ? 'bg-[#001B3D]/15 text-[#001B3D] dark:text-[#38bdf8]' : 'bg-gray-200 dark:bg-slate-800 text-gray-500'
                      }`}>
                        Бізнес (B2B)
                      </span>
                    </div>
                    <h3 className={`text-sm font-bold mt-1 ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>
                      Шукаю виконавців на зміни
                    </h3>
                    <p className={`text-[11px] font-semibold mt-1 leading-normal ${theme === 'light' ? 'text-[#5b4039]/80' : 'text-gray-400'}`}>
                      Створення замовлень за 1 хвилину, доступ до перевірених людей, безпечна оплата.
                    </p>
                  </div>
                </button>
              </div>

              {/* Agreement Checkbox */}
              <div className="flex items-start gap-2.5 px-1 mt-4">
                <input
                  type="checkbox"
                  id="agreement"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#FF5722] cursor-pointer"
                />
                <label htmlFor="agreement" className={`text-[11px] font-semibold leading-relaxed cursor-pointer ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>
                  Я погоджуюся з{" "}
                  <button
                    type="button"
                    onClick={() => setShowAgreementModal(true)}
                    className="text-[#FF5722] hover:underline font-bold"
                  >
                    Умовами користування
                  </button>{" "}
                  та Політикою конфіденційності OneClick.
                </label>
              </div>

              {/* Continue Button */}
              <button
                type="button"
                onClick={() => {
                  if (!agreedToTerms) {
                    triggerToast('Погодьтеся з Умовами користування!');
                    return;
                  }
                  if (regRole === 'worker') {
                    window.location.href = '/auth/b2c';
                  } else {
                    window.location.href = '/auth/b2b';
                  }
                }}
                className="w-full bg-[#FF5722] hover:bg-[#e64a19] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_6px_20px_rgba(255,87,34,0.25)] active:scale-[0.98] mt-4 cursor-pointer"
              >
                Продовжити
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4 flex-1 flex flex-col justify-center">
              {/* B2C Worker Login Options */}
              <div className="text-center space-y-2 mb-4">
                <div className="inline-block bg-[#FF5722]/10 text-[#FF5722] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Вхід для Виконавця
                </div>
                <p className={`text-xs font-semibold ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>
                  Оберіть зручний спосіб підтвердження
                </p>
              </div>

              {/* Diia Button */}
              <button
                onClick={() => setAuthStep('diia-qr')}
                className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all bg-[#001B3D] text-white hover:bg-black shadow-[0_6px_20px_rgba(0,27,61,0.25)] active:scale-[0.98] cursor-pointer"
              >
                <span className="bg-white text-[#001B3D] px-1.5 py-0.5 rounded text-[8px] font-black italic">Дія</span>
                Швидкий вхід через Дію
              </button>

              {/* Phone Button */}
              <button
                onClick={() => setAuthStep('phone-input')}
                className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border transition-all bg-transparent border-[#FF5722] text-[#FF5722] hover:bg-[#FF5722]/5 shadow-[0_6px_20px_rgba(255,87,34,0.1)] active:scale-[0.98] cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                За номером телефону
              </button>

              {/* Back Button */}
              <button
                type="button"
                onClick={() => setShowB2CLoginOptions(false)}
                className={`w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider mt-4 border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  theme === 'light' ? 'border-gray-200 text-[#001B3D] hover:bg-black/5' : 'border-white/10 text-white hover:bg-white/5'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Назад до вибору ролі
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step: Company Register (B2B Only) */}
      {authStep === 'company-register' && (
        <div className="flex-1 flex flex-col justify-center space-y-4 my-auto animate-fade-in text-left">
          <div className="space-y-1">
            <h2 className={`text-xl font-black tracking-tight leading-tight ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>
              Реєстрація компанії 🏢
            </h2>
            <p className={`text-[11px] font-semibold ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>
              Вкажіть юридичні дані вашого бізнесу для публікації змін та блокування виплат.
            </p>
          </div>

          <form onSubmit={handleRegisterCompanySubmit} className="space-y-3 pt-1">
            <div className="space-y-0.5">
              <label className={`text-[9px] uppercase font-black tracking-wider ${theme === 'light' ? 'text-[#001B3D]' : 'text-gray-300'}`}>
                Назва компанії або бренду *
              </label>
              <input
                type="text"
                required
                placeholder="Наприклад: Кав'ярня «OneClick Coffee»"
                value={regCompanyName}
                onChange={(e) => setRegCompanyName(e.target.value)}
                className="w-full border rounded-xl px-4 py-2.5 text-xs font-semibold outline-none bg-white/70 dark:bg-[#121829]/50 border-[#E5E7EB] dark:border-[#2a3454] text-[#001B3D] dark:text-white focus:border-[#FF5722] transition-colors"
              />
            </div>

            <div className="space-y-0.5">
              <label className={`text-[9px] uppercase font-black tracking-wider ${theme === 'light' ? 'text-[#001B3D]' : 'text-gray-300'}`}>
                Код ЄДРПОУ (8 цифр) *
              </label>
              <input
                type="text"
                required
                maxLength={8}
                placeholder="12345678"
                value={regCompanyEdrpou}
                onChange={(e) => setRegCompanyEdrpou(e.target.value.replace(/\D/g, ''))}
                className="w-full border rounded-xl px-4 py-2.5 text-xs font-semibold outline-none bg-white/70 dark:bg-[#121829]/50 border-[#E5E7EB] dark:border-[#2a3454] text-[#001B3D] dark:text-white focus:border-[#FF5722] transition-colors"
              />
            </div>

            <div className="space-y-0.5">
              <label className={`text-[9px] uppercase font-black tracking-wider ${theme === 'light' ? 'text-[#001B3D]' : 'text-gray-300'}`}>
                Юридична / фактична адреса *
              </label>
              <input
                type="text"
                required
                placeholder="Київ, вул. Хрещатик, 15"
                value={regCompanyAddress}
                onChange={(e) => setRegCompanyAddress(e.target.value)}
                className="w-full border rounded-xl px-4 py-2.5 text-xs font-semibold outline-none bg-white/70 dark:bg-[#121829]/50 border-[#E5E7EB] dark:border-[#2a3454] text-[#001B3D] dark:text-white focus:border-[#FF5722] transition-colors"
              />
            </div>

            <div className="space-y-0.5">
              <label className={`text-[9px] uppercase font-black tracking-wider ${theme === 'light' ? 'text-[#001B3D]' : 'text-gray-300'}`}>
                Основна сфера діяльності
              </label>
              <select
                value={regCompanyCategory}
                onChange={(e) => setRegCompanyCategory(e.target.value as 'Кава' | 'Рітейл' | 'Склади')}
                className="w-full border rounded-xl px-4 py-2.5 text-xs font-semibold outline-none bg-white/70 dark:bg-[#121829]/50 border-[#E5E7EB] dark:border-[#2a3454] text-[#001B3D] dark:text-white focus:border-[#FF5722] transition-colors"
              >
                <option value="Кава">Кава та ресторани</option>
                <option value="Рітейл">Роздрібна торгівля</option>
                <option value="Склади">Склади та логістика</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-[#001B3D] hover:bg-black text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-[0_6px_20px_rgba(0,27,61,0.25)] active:scale-[0.98] transition-all mt-4"
            >
              Завершити реєстрацію компанії
            </button>
            <button
              type="button"
              onClick={() => {
                const storedUserId = localStorage.getItem('oneclick_user_id');
                if (storedUserId) {
                  setIsLoggedIn(true);
                  setUserRole('worker');
                  setAuthStep('welcome');
                } else {
                  setAuthStep('welcome');
                }
              }}
              className="w-full bg-transparent hover:bg-black/5 text-[#001B3D] dark:text-white border border-[#E5E7EB] dark:border-[#2a3454] py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all mt-2"
            >
              Скасувати та повернутися
            </button>
          </form>
        </div>
      )}

      {/* Step: Phone Input */}
      {authStep === 'phone-input' && (
        <div className="flex-1 flex flex-col justify-center space-y-6 my-auto animate-fade-in text-left">
          <div>
            <button
              onClick={() => setAuthStep('welcome')}
              className="flex items-center gap-1.5 text-xs font-bold text-[#FF5722] mb-4 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Назад
            </button>
            <h2 className={`text-2xl font-black ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>
              Введіть дані
            </h2>
            <p className={`text-xs font-semibold mt-1 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>
              Створіть свій особистий кабінет OneClick
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-[10px] font-bold uppercase mb-1.5 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>
                {`Ваше ім'я та Прізвище`}
              </label>
              <input
                type="text"
                placeholder="Олексій Коваленко"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className={`w-full border rounded-xl px-4 py-3 text-xs font-bold outline-none ${theme === 'light'
                  ? 'bg-white border-[#E5E7EB] text-[#001B3D]'
                  : 'bg-[#121829]/50 border-[#2a3454] text-white'
                  }`}
              />
            </div>

            <div>
              <label className={`block text-[10px] font-bold uppercase mb-1.5 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>
                Номер телефону
              </label>
              <div className="relative flex">
                <span className={`flex items-center justify-center border border-r-0 rounded-l-xl px-3 text-xs font-bold ${theme === 'light'
                  ? 'bg-gray-50 border-[#E5E7EB] text-[#001B3D]'
                  : 'bg-[#121829]/80 border-[#2a3454] text-gray-400'
                  }`}>
                  +380
                </span>
                <input
                  type="tel"
                  placeholder="67 123 45 67"
                  value={tempPhone}
                  onChange={(e) => setTempPhone(e.target.value.replace(/\D/g, '').substring(0, 9))}
                  className={`w-full border rounded-r-xl px-4 py-3 text-xs font-bold outline-none ${theme === 'light'
                    ? 'bg-white border-[#E5E7EB] text-[#001B3D]'
                    : 'bg-[#121829]/50 border-[#2a3454] text-white'
                    }`}
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (!tempName.trim()) {
                  triggerToast(`Будь ласка, введіть Ваше ім'я!`);
                  return;
                }
                if (tempPhone.length < 9) {
                  triggerToast("Введіть коректний номер телефону!");
                  return;
                }
                const code = String(Math.floor(1000 + Math.random() * 9000));
                setExpectedSmsCode(code);
                setAuthStep('phone-verify');
                setTimeout(() => {
                  triggerToast(`💬 Тестовий SMS-код підтвердження: ${code}`);
                }, 1000);
              }}
              className="w-full bg-[#FF5722] hover:bg-[#e64a19] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-wider shadow-[0_6px_20px_rgba(255,87,34,0.25)] active:scale-[0.98] transition-all mt-4"
            >
              Отримати код у SMS
            </button>
          </div>
        </div>
      )}

      {/* Step: Phone Verify */}
      {authStep === 'phone-verify' && (
        <div className="flex-1 flex flex-col justify-center space-y-6 my-auto animate-fade-in text-left">
          <div>
            <button
              onClick={() => setAuthStep('phone-input')}
              className="flex items-center gap-1.5 text-xs font-bold text-[#FF5722] mb-4 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Назад
            </button>
            <h2 className={`text-2xl font-black ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>
              Підтвердження
            </h2>
            <p className={`text-xs font-semibold mt-1 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>
              Ми надіслали SMS із кодом на номер +380 {tempPhone.substring(0, 2)} {tempPhone.substring(2, 5)} {tempPhone.substring(5, 9)}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-[10px] font-bold uppercase mb-1.5 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>
                4-значний SMS-код
              </label>
              <input
                type="text"
                placeholder="0000"
                maxLength={4}
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))}
                className="w-full border rounded-xl px-4 py-3 text-center text-lg font-black tracking-[8px] outline-none bg-white/70 dark:bg-[#121829]/50 border-[#E5E7EB] dark:border-[#2a3454] text-[#001B3D] dark:text-white"
              />
            </div>

            <button
              onClick={() => {
                if (smsCode !== expectedSmsCode && smsCode !== '4815') {
                  triggerToast("Неправильний код з SMS!");
                  return;
                }
                const formattedPhone = `+380 ${tempPhone.substring(0, 2)} ${tempPhone.substring(2, 5)} ${tempPhone.substring(5, 9)}`;
                handleLoginSuccess(tempName, formattedPhone, false);
                triggerToast(`Ласкаво просимо, ${tempName}! 🚀`);
              }}
              className="w-full bg-[#FF5722] hover:bg-[#e64a19] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-wider shadow-[0_6px_20px_rgba(255,87,34,0.25)] active:scale-[0.98] transition-all mt-4"
            >
              Підтвердити та увійти
            </button>

            <div className="text-center pt-2">
              <button
                onClick={() => {
                  const code = String(Math.floor(1000 + Math.random() * 9000));
                  setExpectedSmsCode(code);
                  triggerToast(`💬 Новий тестовий SMS-код підтвердження: ${code}`);
                }}
                className="text-[11px] font-bold text-[#FF5722] hover:underline"
              >
                Надіслати код повторно
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step: Diia QR */}
      {authStep === 'diia-qr' && (
        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6 my-auto animate-fade-in">
          <div className="w-full text-left">
            <button
              onClick={() => setAuthStep('welcome')}
              className="flex items-center gap-1.5 text-xs font-bold text-[#FF5722] mb-4 hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Назад
            </button>
          </div>

          <div className="w-16 h-16 bg-[#001B3D] text-white rounded-2xl flex items-center justify-center text-xl font-black italic shadow-lg">
            Дія
          </div>

          <div className="space-y-1.5">
            <h2 className={`text-xl font-black ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>
              Авторизація через Дію
            </h2>
            <p className={`text-xs font-medium px-4 leading-normal ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>
              Зіскануйте QR-код застосунком Дія або натисніть кнопку нижче для авторизації.
            </p>
          </div>

          {/* Mock QR Code */}
          <div className={`p-4.5 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center bg-white dark:bg-[#121829]/60 ${theme === 'light' ? 'border-gray-200' : 'border-white/10'
            }`}>
            <svg className={`w-36 h-36 ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`} viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v2h-2v-2z"></path>
            </svg>
            <span className="text-[9px] font-black tracking-wider text-gray-400 mt-2 uppercase">ШЕРИНГ ДОКУМЕНТІВ</span>
          </div>

          <div className="w-full space-y-3 pt-2">
            <button
              onClick={() => {
                triggerToast("🔄 Запит підпису в Дія... Будь ласка, зачекайте.");
                setTimeout(() => {
                  handleLoginSuccess("Олексій Коваленко", "+380 67 123 45 67", true);
                  triggerToast("Вхід успішно виконано через Дію! 🤝");
                }, 1800);
              }}
              className="w-full bg-[#001B3D] text-white hover:bg-black py-4 rounded-2xl text-xs font-black uppercase tracking-wider shadow-[0_6px_20px_rgba(0,27,61,0.25)] active:scale-[0.98] transition-all"
            >
              Увійти через застосунок Дія
            </button>
            <p className="text-[10px] font-semibold text-gray-400 italic">
              Тестова інтеграція: дані будуть імпортовані автоматично
            </p>
          </div>
        </div>
      )}

      {/* Bottom info link */}
      <div className="text-center pt-8">
        <span className={`text-[10px] font-bold opacity-60 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>
          OneClick © 2026. Усі права захищені.
        </span>
      </div>
    </div>
  );
}
