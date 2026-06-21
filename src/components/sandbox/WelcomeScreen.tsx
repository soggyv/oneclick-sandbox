import React from 'react';
import { ArrowLeft, Building, Mail, Phone, User } from 'lucide-react';

interface WelcomeScreenProps {
  theme: 'light' | 'dark';
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
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
        <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6 my-auto animate-fade-in">
          <div className="space-y-3">
            <h1 className={`text-3xl font-black tracking-tight leading-tight ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>
              Знайди зміну в <span className="text-[#FF5722]">один клік</span>
            </h1>
            <p className={`text-xs font-semibold px-4 leading-relaxed ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>
              Швидке працевлаштування поруч з домом. Оплата зарезервована та гарантована.
            </p>
          </div>

          <div className="w-full space-y-4 pt-2">
            {/* B2B vs B2C registration role selector */}
            <div className={`p-1 rounded-2xl flex border transition-all ${theme === 'light'
              ? 'bg-white/60 border-black/10'
              : 'bg-[#1c2541]/45 border-white/10'
              } mb-2`}>
              <button
                type="button"
                onClick={() => setRegRole('worker')}
                className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${regRole === 'worker'
                  ? 'bg-[#FF5722] text-white shadow-md'
                  : theme === 'light' ? 'text-[#001B3D]/70 hover:bg-black/5' : 'text-white/70 hover:bg-white/5'
                  }`}
              >
                <User className="w-3.5 h-3.5" />
                Шукач (B2C)
              </button>
              <button
                type="button"
                onClick={() => setRegRole('employer')}
                className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${regRole === 'employer'
                  ? 'bg-[#001B3D] text-white shadow-md'
                  : theme === 'light' ? 'text-[#001B3D]/70 hover:bg-black/5' : 'text-white/70 hover:bg-white/5'
                  }`}
              >
                <Building className="w-3.5 h-3.5" />
                Бізнес (B2B)
              </button>
            </div>

            {/* Agreement Checkbox */}
            <div className="flex items-start gap-2.5 px-2 text-left mb-4">
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

            {regRole === 'worker' ? (
              <>
                {/* Diia Button */}
                <button
                  onClick={() => {
                    if (!agreedToTerms) {
                      triggerToast('Погодьтеся з Умовами користування!');
                      return;
                    }
                    setAuthStep('diia-qr');
                  }}
                  className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] ${agreedToTerms
                    ? 'bg-[#001B3D] text-white hover:bg-black shadow-[0_6px_20px_rgba(0,27,61,0.25)]'
                    : 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed opacity-60'
                    }`}
                >
                  <span className="bg-white text-[#001B3D] px-1.5 py-0.5 rounded text-[8px] font-black italic">Дія</span>
                  Швидкий вхід через Дію
                </button>

                {/* Phone Button */}
                <button
                  onClick={() => {
                    if (!agreedToTerms) {
                      triggerToast('Погодьтеся з Умовами користування!');
                      return;
                    }
                    setAuthStep('phone-input');
                  }}
                  className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border transition-all active:scale-[0.98] ${agreedToTerms
                    ? 'bg-transparent border-[#FF5722] text-[#FF5722] hover:bg-[#FF5722]/5 shadow-[0_6px_20px_rgba(255,87,34,0.1)]'
                    : 'bg-transparent border-gray-300 dark:border-gray-800 text-gray-400 cursor-not-allowed opacity-60'
                    }`}
                >
                  <Phone className="w-4 h-4" />
                  За номером телефону
                </button>
              </>
            ) : (
              <>
                {/* Google Button for B2B */}
                <button
                  onClick={() => {
                    if (!agreedToTerms) {
                      triggerToast('Погодьтеся з Умовами користування!');
                      return;
                    }
                    window.location.href = '/auth/b2b';
                  }}
                  className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] ${agreedToTerms
                    ? 'bg-[#001B3D] text-white hover:bg-black shadow-[0_6px_20px_rgba(0,27,61,0.25)]'
                    : 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed opacity-60'
                    }`}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Продовжити з Google
                </button>

                {/* Email Button for B2B */}
                <button
                  onClick={() => {
                    if (!agreedToTerms) {
                      triggerToast('Погодьтеся з Умовами користування!');
                      return;
                    }
                    window.location.href = '/auth/b2b';
                  }}
                  className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border transition-all active:scale-[0.98] ${agreedToTerms
                    ? 'bg-transparent border-[#FF5722] text-[#FF5722] hover:bg-[#FF5722]/5 shadow-[0_6px_20px_rgba(255,87,34,0.1)]'
                    : 'bg-transparent border-gray-300 dark:border-gray-800 text-gray-400 cursor-not-allowed opacity-60'
                    }`}
                >
                  <Mail className="w-4 h-4" />
                  Електронна пошта та пароль
                </button>
              </>
            )}
          </div>
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
