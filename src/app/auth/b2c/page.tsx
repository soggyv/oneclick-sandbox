'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  ArrowRight, 
  ArrowLeft,
  Sparkles, 
  CheckCircle2, 
  Loader2,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import Link from 'next/link';
import { GoogleLogin } from '@react-oauth/google';

export default function B2CAuthPage() {
  const [step, setStep] = useState<'auth' | 'verify' | 'success'>('auth');
  const [isRegistering, setIsRegistering] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [expectedSmsCode, setExpectedSmsCode] = useState('4815');
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'diia' | 'sms' | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const saveProfileAndRedirect = (userData: any) => {
    const profileData = {
      isLoggedIn: true,
      userRole: 'worker' as const,
      userName: userData.name,
      userPhone: userData.phone || `+380 ${phone.substring(0, 2)} ${phone.substring(2, 5)} ${phone.substring(5, 9)}`,
      userAvatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      isDiiaVerified: userData.is_verified,
      companyName: '',
      companyDetails: ''
    };
    localStorage.setItem('oneclick_auth_profile', JSON.stringify(profileData));
    localStorage.setItem('oneclick_user_id', userData.user_id);
    setStep('success');
  };

  // Diia authentication
  const handleDiiaAuth = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthMethod('diia');
    triggerToast("🔄 Запит підпису в Дія... Підтвердіть у вашому застосунку.");

    setTimeout(async () => {
      try {
        const response = await fetch('http://localhost:8000/auth/verify-diia', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name.trim() || 'Олексій Коваленко',
            phone: phone.trim() ? `+380${phone.replace(/\D/g, '')}` : '+380671234567',
          }),
        });

        setIsLoading(false);
        setAuthMethod(null);

        if (response.ok) {
          const userData = await response.json();
          saveProfileAndRedirect(userData);
        } else {
          const errorData = await response.json();
          triggerToast(`Помилка Дія: ${errorData.detail || 'Невідома помилка'}`);
        }
      } catch (err) {
        console.error(err);
        triggerToast('Помилка з’єднання з сервером API');
        setIsLoading(false);
        setAuthMethod(null);
      }
    }, 1800);
  };
  // Google authentication
  const handleGoogleAuthSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setAuthMethod('google' as any);
    try {
      const response = await fetch('http://localhost:8000/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_token: credentialResponse.credential,
        }),
      });

      setIsLoading(false);
      setAuthMethod(null);

      if (response.ok) {
        const userData = await response.json();
        saveProfileAndRedirect(userData);
      } else {
        const errorData = await response.json();
        triggerToast(`Помилка Google: ${errorData.detail || 'Невідома помилка'}`);
      }
    } catch (err) {
      console.error(err);
      triggerToast('Помилка з’єднання з сервером API');
      setIsLoading(false);
      setAuthMethod(null);
    }
  };

  // request sms otp code
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      triggerToast('Будь ласка, введіть номер телефону');
      return;
    }
    if (isRegistering && !name.trim()) {
      triggerToast("Будь ласка, введіть Ваше ім'я та Прізвище");
      return;
    }

    setIsLoading(true);
    setAuthMethod('sms');

    try {
      const formattedPhone = `+380${phone.replace(/\D/g, '')}`;
      const response = await fetch('http://localhost:8000/auth/login-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formattedPhone,
          name: name.trim() || 'Користувач',
        }),
      });

      setIsLoading(false);
      setAuthMethod(null);

      if (response.ok) {
        const data = await response.json();
        if (data.code) {
          setExpectedSmsCode(data.code);
          triggerToast(`💬 Тестовий SMS-код відправлено! Ваш код: ${data.code}`);
        } else {
          setExpectedSmsCode('');
          triggerToast('💬 Код підтвердження відправлено у SMS на ваш номер!');
        }
        setStep('verify');
      } else {
        triggerToast('Не вдалося надіслати SMS');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Помилка з’єднання з сервером API');
      setIsLoading(false);
      setAuthMethod(null);
    }
  };

  // verify sms code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (expectedSmsCode && smsCode !== expectedSmsCode && smsCode !== '4815') {
      triggerToast('Неправильний код з SMS!');
      return;
    }

    setIsLoading(true);
    try {
      const formattedPhone = `+380${phone.replace(/\D/g, '')}`;
      const response = await fetch('http://localhost:8000/auth/verify-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formattedPhone,
          name: name.trim() || 'Користувач OneClick',
          code: smsCode,
        }),
      });

      setIsLoading(false);

      if (response.ok) {
        const userData = await response.json();
        saveProfileAndRedirect(userData);
      } else {
        const errorData = await response.json();
        triggerToast(`Помилка перевірки: ${errorData.detail || 'Невідома помилка'}`);
      }
    } catch (err) {
      console.error(err);
      triggerToast('Помилка з’єднання з сервером API');
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-[#fcf9f6] text-[#001B3D]' : 'bg-slate-950 text-slate-100'} flex flex-col justify-center items-center relative overflow-hidden p-4`}>
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#FF5722]/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />

      {/* Toast notifications */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-[#001B3D]/90 backdrop-blur-[24px] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-white/10 text-xs font-semibold max-w-[85%] text-center animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#FF5722] inline-block"></span>
          {toastMessage}
        </div>
      )}

      {/* Main Card Container */}
      <div className={`w-full max-w-md ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-white/[0.03] border-white/10'} backdrop-blur-xl border rounded-[32px] p-8 shadow-2xl relative z-10 animate-fade-in`}>
        
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#FF5722] to-orange-400 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4 hover:rotate-3 transition-transform cursor-pointer">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className={`text-2xl font-black tracking-tight flex items-center gap-1.5 ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>
            OneClick <span className="text-xs font-black uppercase bg-[#FF5722]/15 text-[#FF5722] px-2 py-0.5 rounded border border-[#FF5722]/25">Student</span>
          </h1>
          <p className={`text-xs mt-2 font-semibold ${theme === 'light' ? 'text-[#5b4039]/80' : 'text-slate-400'}`}>
            Кабінет Студента & Волонтера
          </p>
        </div>

        {/* STEP 1: AUTHENTICATION */}
        {step === 'auth' && (
          <div className="space-y-6">
            {/* Toggle between Login and Register */}
            <div className={`grid grid-cols-2 p-1 ${theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-white/5 border-white/5'} rounded-2xl border`}>
              <button
                type="button"
                onClick={() => setIsRegistering(true)}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${isRegistering ? 'bg-[#FF5722] text-white shadow-md' : theme === 'light' ? 'text-[#001B3D]/70' : 'text-slate-400'}`}
              >
                Реєстрація
              </button>
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${!isRegistering ? 'bg-[#FF5722] text-white shadow-md' : theme === 'light' ? 'text-[#001B3D]/70' : 'text-slate-400'}`}
              >
                Вхід
              </button>
            </div>

            <div className="text-center space-y-1">
              <h2 className={`text-lg font-bold ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>
                {isRegistering ? 'Створити акаунт' : 'Вхід у кабінет'}
              </h2>
              <p className={`text-xs ${theme === 'light' ? 'text-[#5b4039]/70' : 'text-slate-400'}`}>
                {isRegistering ? 'Реєструйтеся як волонтер та отримуйте бали за заходи' : 'Увійдіть під своїми даними волонтера'}
              </p>
            </div>

            {/* Diia Integration Button */}
            <button
              onClick={handleDiiaAuth}
              disabled={isLoading}
              className={`w-full py-4 px-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all active:scale-98 shadow-md cursor-pointer disabled:opacity-50 ${
                theme === 'light' 
                  ? 'bg-[#001B3D] text-white hover:bg-black' 
                  : 'bg-white/10 text-white hover:bg-white/15 border border-white/10'
              }`}
            >
              {isLoading && authMethod === 'diia' ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <span className="bg-white text-[#001B3D] px-1.5 py-0.5 rounded text-[8px] font-black italic">Дія</span>
              )}
              {isRegistering ? 'Швидка реєстрація через Дію' : 'Вхід через Дію'}
            </button>

            {/* Google Integration Button */}
            <div className="flex justify-center w-full [&>div]:w-full [&_iframe]:w-full">
              <GoogleLogin
                onSuccess={handleGoogleAuthSuccess}
                onError={() => triggerToast('Не вдалося увійти через Google')}
                useOneTap
                use_fedcm_for_prompt={false}
                theme={theme === 'light' ? 'outline' : 'filled_black'}
                shape="pill"
                width="100%"
                text="continue_with"
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className={`h-[1px] flex-1 ${theme === 'light' ? 'bg-gray-200' : 'bg-white/10'}`} />
              <span className={`text-[10px] uppercase font-bold tracking-wider ${theme === 'light' ? 'text-gray-400' : 'text-slate-500'}`}>або телефон</span>
              <div className={`h-[1px] flex-1 ${theme === 'light' ? 'bg-gray-200' : 'bg-white/10'}`} />
            </div>

            {/* SMS registration / login form */}
            <form onSubmit={handleRequestOtp} className="space-y-4">
              {isRegistering && (
                <div className="space-y-1.5 text-left">
                  <label className={`text-[10px] font-bold uppercase tracking-wider block ${theme === 'light' ? 'text-[#001B3D]' : 'text-slate-300'}`}>
                    Ваше ім'я та Прізвище
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Олексій Коваленко"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full border rounded-2xl pl-11 pr-4 py-3.5 text-xs font-semibold outline-none transition-all ${
                        theme === 'light'
                          ? 'bg-slate-50 border-gray-200 text-[#001B3D] focus:border-[#FF5722] focus:bg-white'
                          : 'bg-white/5 border-white/10 text-white focus:border-[#FF5722]'
                      }`}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5 text-left">
                <label className={`text-[10px] font-bold uppercase tracking-wider block ${theme === 'light' ? 'text-[#001B3D]' : 'text-slate-300'}`}>
                  Номер телефону
                </label>
                <div className="relative flex">
                  <span className={`flex items-center justify-center border border-r-0 rounded-l-2xl px-4 text-xs font-bold ${
                    theme === 'light'
                      ? 'bg-gray-50 border-gray-200 text-[#001B3D]'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}>
                    +380
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="67 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').substring(0, 9))}
                    className={`w-full border rounded-r-2xl px-4 py-3.5 text-xs font-semibold outline-none transition-all ${
                      theme === 'light'
                        ? 'bg-slate-50 border-gray-200 text-[#001B3D] focus:border-[#FF5722] focus:bg-white'
                        : 'bg-white/5 border-white/10 text-white focus:border-[#FF5722]'
                    }`}
                  />
                </div>
              </div>

              {isRegistering && (
                <div className="flex items-start gap-2.5 px-1 pt-1">
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className="mt-0.5 w-4 h-4 accent-[#FF5722] cursor-pointer"
                  />
                  <label htmlFor="terms" className={`text-[11px] font-medium leading-normal cursor-pointer ${theme === 'light' ? 'text-[#5b4039]' : 'text-slate-300'}`}>
                    Я погоджуюся з Умовами користування та Політикою конфіденційності OneClick.
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#FF5722] hover:bg-[#e64a19] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-orange-500/10 active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {isLoading && authMethod === 'sms' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Продовжити
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: VERIFICATION */}
        {step === 'verify' && (
          <div className="space-y-6">
            <div className="text-left">
              <button
                onClick={() => setStep('auth')}
                className="flex items-center gap-1.5 text-xs font-bold text-[#FF5722] hover:underline"
              >
                <ArrowLeft className="w-4 h-4" /> Назад
              </button>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-[#FF5722]/10 rounded-full flex items-center justify-center mx-auto text-[#FF5722]">
                <Smartphone className="w-6 h-6" />
              </div>
              <h2 className={`text-xl font-bold ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>
                Введіть код підтвердження
              </h2>
              <p className={`text-xs ${theme === 'light' ? 'text-[#5b4039]/70' : 'text-slate-400'}`}>
                Ми надіслали 4-значний SMS-код на номер +380 {phone.substring(0, 2)} {phone.substring(2, 5)} {phone.substring(5, 9)}
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-1 text-center">
                <input
                  type="text"
                  required
                  placeholder="0000"
                  maxLength={4}
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))}
                  className={`w-full border rounded-2xl px-4 py-4 text-center text-xl font-black tracking-[12px] outline-none transition-all ${
                    theme === 'light'
                      ? 'bg-slate-50 border-gray-200 text-[#001B3D] focus:border-[#FF5722] focus:bg-white'
                      : 'bg-white/5 border-white/10 text-white focus:border-[#FF5722]'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#FF5722] hover:bg-[#e64a19] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-orange-500/10 active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Підтвердити та увійти'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  className="text-xs font-bold text-[#FF5722] hover:underline"
                >
                  Надіслати код повторно
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: SUCCESS */}
        {step === 'success' && (
          <div className="space-y-6 py-4 animate-scale-in text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500 shadow-lg shadow-green-500/15 mb-2">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className={`text-2xl font-black ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>
                {isRegistering ? 'Вітаємо в OneClick University! 🎉' : 'З поверненням! 🚀'}
              </h2>
              <p className={`text-xs px-4 ${theme === 'light' ? 'text-[#5b4039]/70' : 'text-slate-400'}`}>
                {isRegistering 
                  ? 'Ваш акаунт волонтера успішно зареєстровано. Завантажуємо ваш особистий кабінет...' 
                  : 'Авторизація пройшла успішно. Перенаправляємо вас до особистого кабінету...'}
              </p>
            </div>
            <div className="pt-4">
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gradient-to-tr from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Перейти в кабінет
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Footer links */}
        <div className={`mt-8 pt-6 border-t flex justify-between items-center text-[10px] font-bold ${
          theme === 'light' ? 'border-gray-150 text-gray-400' : 'border-white/5 text-slate-500'
        }`}>
          <Link href="/" className="hover:text-[#FF5722] transition-colors">Головна</Link>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Безпека OneClick
          </span>
          <span>•</span>
          <Link href="/" className="hover:text-[#FF5722] transition-colors">Підтримка</Link>
        </div>

      </div>
    </div>
  );
}
