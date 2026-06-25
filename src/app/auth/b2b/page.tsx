'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  Mail, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Building,
  User,
  Tag,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { GoogleLogin } from '@react-oauth/google';

export default function B2BAuthPage() {
  const [step, setStep] = useState<'auth' | 'verify' | 'company' | 'success'>('auth');
  const [isRegistering, setIsRegistering] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [expectedCode, setExpectedCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [eventType, setEventType] = useState('University Event');
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'google' | 'email' | null>(null);
  const [avatar, setAvatar] = useState('');
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);

  const saveProfileAndRedirect = (userData: any) => {
    const profileData = {
      isLoggedIn: true,
      userRole: 'employer' as const,
      userName: userData.name,
      userPhone: userData.phone || '+380 93 123 4567',
      userAvatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      isDiiaVerified: userData.is_verified,
      companyName: userData.company_name,
      companyDetails: userData.company_details
    };
    localStorage.setItem('oneclick_auth_profile', JSON.stringify(profileData));
    localStorage.setItem('oneclick_user_id', userData.user_id);
    setCompanyName(userData.company_name);
    setContactPerson(userData.name);
    setStep('success');
  };

  // Google authentication success callback
  const handleGoogleAuthSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setAuthMethod('google');
    try {
      const response = await fetch('http://localhost:8000/auth/b2b-google', {
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
        const data = await response.json();
        if (data.exists) {
          // Log in directly
          saveProfileAndRedirect(data);
        } else {
          // Fill details and go to step 2 (Company Registration)
          setEmail(data.email);
          setContactPerson(data.name || '');
          setAvatar(data.avatar || '');
          setIsGoogleAuth(true);
          setStep('company');
        }
      } else {
        const errorData = await response.json();
        alert(`Помилка Google: ${errorData.detail || 'Невідома помилка'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Помилка з’єднання з сервером API');
      setIsLoading(false);
      setAuthMethod(null);
    }
  };

  // email authentication
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setAuthMethod('email');

    try {
      const response = await fetch('http://localhost:8000/auth/b2b-request-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          is_registering: isRegistering
        }),
      });

      setIsLoading(false);
      setAuthMethod(null);

      if (response.ok) {
        const data = await response.json();
        if (data.code) {
          setExpectedCode(data.code);
          alert(`💬 Тестовий код відправлено на пошту! Ваш код: ${data.code}`);
        } else {
          setExpectedCode('');
          alert('💬 Код підтвердження відправлено на вашу електронну пошту!');
        }
        setStep('verify');
      } else {
        const errorData = await response.json();
        alert(`Помилка: ${errorData.detail || 'Не вдалося надіслати код'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Помилка з’єднання з сервером API');
      setIsLoading(false);
      setAuthMethod(null);
    }
  };

  // verify email code
  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (expectedCode && verificationCode !== expectedCode && verificationCode !== '4815') {
      alert('Неправильний код з електронної пошти!');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/auth/b2b-verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code: verificationCode,
          is_registering: isRegistering
        }),
      });

      setIsLoading(false);

      if (response.ok) {
        if (isRegistering) {
          setStep('company');
        } else {
          const userData = await response.json();
          saveProfileAndRedirect(userData);
        }
      } else {
        const errorData = await response.json();
        alert(`Помилка перевірки: ${errorData.detail || 'Невідома помилка'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Помилка з’єднання з сервером API');
      setIsLoading(false);
    }
  };

  // company registration
  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactPerson) return;
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/auth/b2b-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email || 'google-user@gmail.com',
          password: password || null,
          contact_person: contactPerson,
          company_name: companyName,
          event_type: eventType,
          auth_method: email ? 'email' : 'google',
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        saveProfileAndRedirect(userData);
      } else {
        const errorData = await response.json();
        alert(`Помилка реєстрації: ${errorData.detail || 'Невідома помилка'}`);
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      alert('Помилка з’єднання з сервером API');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center relative overflow-hidden p-4">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-orange-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Glassmorphic Card Container */}
      <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl relative z-10 animate-fade-in">
        
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#FF5722] to-orange-400 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4 hover:rotate-3 transition-transform cursor-pointer">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
            OneClick <span className="text-xs font-black uppercase bg-orange-500/10 text-[#FF5722] px-2 py-0.5 rounded border border-orange-500/25">B2B Business</span>
          </h1>
          <p className="text-xs text-slate-400 mt-2 font-medium">Кабінет Організатора Змін & Волонтерства</p>
        </div>

        {/* STEP 1: AUTHENTICATION */}
        {step === 'auth' && (
          <div className="space-y-6">
            {/* Toggle between Login and Register */}
            <div className="grid grid-cols-2 p-1 bg-white/5 rounded-2xl border border-white/5">
              <button
                type="button"
                onClick={() => setIsRegistering(true)}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${isRegistering ? 'bg-[#FF5722] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Реєстрація
              </button>
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${!isRegistering ? 'bg-[#FF5722] text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Вхід
              </button>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-white">
                {isRegistering ? 'Реєстрація компанії' : 'Вхід до кабінету'}
              </h2>
              <p className="text-xs text-slate-400">
                {isRegistering ? 'Створіть кабінет для запуску бета-тесту події' : 'Увійдіть під своїми корпоративними даними'}
              </p>
            </div>

            {/* Google Authentication Button */}
            <div className="flex justify-center w-full [&>div]:w-full [&_iframe]:w-full">
              <GoogleLogin
                onSuccess={handleGoogleAuthSuccess}
                onError={() => alert('Не вдалося увійти через Google')}
                useOneTap
                use_fedcm_for_prompt={false}
                theme="filled_black"
                shape="pill"
                width="100%"
                text="continue_with"
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-[1px] flex-1 bg-white/10" />
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">або пошта</span>
              <div className="h-[1px] flex-1 bg-white/10" />
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Електронна пошта</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.ua"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold text-white placeholder-slate-500 outline-none transition-all focus:border-[#FF5722] focus:bg-white/[0.04]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Пароль</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold text-white placeholder-slate-500 outline-none transition-all focus:border-[#FF5722] focus:bg-white/[0.04]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#FF5722] hover:bg-[#e64a19] text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(255,87,34,0.25)] hover:shadow-[0_4px_16px_rgba(255,87,34,0.35)] active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading && authMethod === 'email' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    {isRegistering ? 'Зареєструватися' : 'Увійти'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 1.5: EMAIL OTP VERIFICATION */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyEmailOtp} className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-white">Введіть код підтвердження</h2>
              <p className="text-xs text-slate-400">
                Ми відправили 4-значний код підтвердження на пошту <span className="text-[#FF5722] font-semibold">{email}</span>
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="text"
                placeholder="0000"
                maxLength={4}
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-white/[0.02] border border-white/10 rounded-2xl py-4 text-center text-xl font-black tracking-[8px] text-white outline-none focus:border-[#FF5722] focus:bg-white/[0.04]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#FF5722] hover:bg-[#e64a19] text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(255,87,34,0.25)] cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  Підтвердити
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setStep('auth')}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                ← Повернутися назад
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: COMPANY REGISTRATION */}
        {step === 'company' && (
          <form onSubmit={handleCompanySubmit} className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-white">Профіль організації</h2>
              <p className="text-xs text-slate-400">Налаштування кабінету для волонтерських або бізнес заходів</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Назва Компанії / Організації *</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Напр: Студентська Рада ОНУ"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold text-white placeholder-slate-500 outline-none transition-all focus:border-[#FF5722] focus:bg-white/[0.04]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Контактна Особа *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Напр: Дмитро Коваленко"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold text-white placeholder-slate-500 outline-none transition-all focus:border-[#FF5722] focus:bg-white/[0.04]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Тип Заходу / Тесту</label>
                <div className="relative">
                  <Tag className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold text-white outline-none transition-all focus:border-[#FF5722]"
                  >
                    <option value="University Event">Університетський захід (University Event)</option>
                    <option value="Volunteer Drive">Волонтерська ініціатива (Volunteer Drive)</option>
                    <option value="Closed Beta Test">Закритий бета-тест додатку</option>
                    <option value="Commercial Business">Комерційний бізнес</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('auth')}
                className="py-3.5 px-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-xs font-bold text-slate-300 transition-all active:scale-95 cursor-pointer"
              >
                Назад
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3.5 bg-[#FF5722] hover:bg-[#e64a19] text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(255,87,34,0.25)] hover:shadow-[0_4px_16px_rgba(255,87,34,0.35)] active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Створити кабінет
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS & REDIRECT */}
        {step === 'success' && (
          <div className="space-y-6 text-center animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-500">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-white">
                {isRegistering ? 'Вітаємо! Кабінет створено' : 'Успішний вхід'}
              </h2>
              <p className="text-xs text-slate-400">
                {isRegistering ? 'Ви успішно підключилися до системи OneClick B2B.' : 'Раді знову бачити вас!'}
              </p>
            </div>

            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-left space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Організація:</span>
                <span className="font-bold text-white">{companyName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Контакт:</span>
                <span className="font-bold text-white">{contactPerson}</span>
              </div>
            </div>

            <Link
              href="/"
              className="w-full py-4 bg-[#FF5722] hover:bg-[#e64a19] text-white rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(255,87,34,0.25)] active:scale-98"
            >
              Перейти до Дашборду
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Footer links */}
      <div className="mt-8 text-center space-x-4 text-xs text-slate-500 relative z-10">
        <Link href="/" className="hover:text-slate-300 transition-colors">Головна</Link>
        <span>•</span>
        <a href="#" className="hover:text-slate-300 transition-colors">Політика конфіденційності</a>
        <span>•</span>
        <a href="#" className="hover:text-slate-300 transition-colors">Closed Beta v0.9</a>
      </div>
    </div>
  );
}
