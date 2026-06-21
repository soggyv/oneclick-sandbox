'use client';

export const dynamic = 'force-dynamic';

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

export default function B2BAuthPage() {
  const [step, setStep] = useState<'auth' | 'company' | 'success'>('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [eventType, setEventType] = useState('University Event');
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'google' | 'email' | null>(null);

  // Google authentication
  const handleGoogleAuth = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthMethod('google');
    // Simulated delay
    setTimeout(() => {
      setIsLoading(false);
      setEmail('google-user@gmail.com');
      setStep('company');
      setAuthMethod(null);
    }, 1200);
  };

  // email authentication
  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoading(true);
    setAuthMethod('email');
    // Simulated delay
    setTimeout(() => {
      setIsLoading(false);
      setStep('company');
      setAuthMethod(null);
    }, 1500);
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
        
        // Save profile to localStorage so OneClickSandbox can pick it up automatically
        const profileData = {
          isLoggedIn: true,
          userRole: 'employer' as const,
          userName: userData.name,
          userPhone: userData.phone || '+380 93 123 4567',
          userAvatar: userData.avatar,
          isDiiaVerified: userData.is_verified,
          companyName: userData.company_name,
          companyDetails: userData.company_details
        };
        localStorage.setItem('oneclick_auth_profile', JSON.stringify(profileData));
        localStorage.setItem('oneclick_user_id', userData.user_id);
        
        setIsLoading(false);
        setStep('success');
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
      <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-2xl relative z-10">
        
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-[#FF5722] to-orange-400 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 mb-4 hover:rotate-3 transition-transform cursor-pointer">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
            OneClick <span className="text-xs font-black uppercase bg-orange-500/10 text-[#FF5722] px-2 py-0.5 rounded border border-orange-500/25">B2B Business</span>
          </h1>
          <p className="text-xs text-slate-400 mt-2 font-medium">Кабінет Організатора Смен & Волонтерства</p>
        </div>

        {/* STEP 1: AUTHENTICATION */}
        {step === 'auth' && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-white">Реєстрація компанії</h2>
              <p className="text-xs text-slate-400">Створіть кабінет для запуску бета-тесту події</p>
            </div>

            {/* Google Authentication Button */}
            <button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-3 transition-all hover:bg-white/10 hover:border-white/20 active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && authMethod === 'google' ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Продовжити з Google
            </button>

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
                    Зареєструватися
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
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
              <h2 className="text-xl font-bold text-white">Вітаємо! Кабінет створено</h2>
              <p className="text-xs text-slate-400">Ви успішно підключилися до системи OneClick B2B.</p>
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
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Тип:</span>
                <span className="font-bold text-orange-400">{eventType}</span>
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
