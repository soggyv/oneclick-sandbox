'use client';

import React from 'react';
import { useAppContext } from '../../context/AppContext';

export const WorkerAuth: React.FC = () => {
  const {
    language,
    showDiiaLogin,
    setShowDiiaLogin,
    showPhoneLogin,
    setShowPhoneLogin,
    phoneNumber,
    setPhoneNumber,
    otpCode,
    setOtpCode,
    isOtpSent,
    setIsOtpSent,
    isDiiaScanning,
    handleDiiaAuth,
    handlePhoneSubmit,
    handleOtpSubmit
  } = useAppContext();

  return (
    <div className="flex-1 flex flex-col justify-between p-6 relative overflow-hidden bg-oneclick-navy text-white min-h-[500px]">
      {/* Background elements */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-oneclick-orange/15 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 -left-20 w-48 h-48 bg-blue-600/10 rounded-full blur-2xl"></div>
      
      {/* Logo and Intro */}
      <div className="mt-12 flex flex-col items-center text-center relative z-10">
        <div className="w-16 h-16 bg-oneclick-orange rounded-3xl flex items-center justify-center shadow-premium-glow mb-4">
          <span className="material-symbols-outlined text-white text-[38px] font-bold">touch_app</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white mb-2">OneClick</h1>
        <p className="text-sm text-white/80 font-medium max-w-xs">
          {language === 'uk' 
            ? 'Платформа для легального пошуку тимчасового підробітку для студентів.' 
            : 'Platform for legal temporary work search for students.'}
        </p>
        
        <div className="mt-4 flex gap-2">
          <span className="bg-white/10 text-white/90 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            ФОП 3 ГРУПА
          </span>
          <span className="bg-success-green/20 text-success-green text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            ДІЯ ВЕРИФІКАЦІЯ
          </span>
        </div>
      </div>

      {/* Login form or options */}
      <div className="mb-8 relative z-10 w-full">
        {!showDiiaLogin && !showPhoneLogin ? (
          // Primary Start Screen Buttons
          <div className="space-y-3">
            <button 
              onClick={() => setShowDiiaLogin(true)} 
              className="w-full bg-white text-oneclick-navy font-bold py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg hover:bg-gray-100"
            >
              <div className="bg-oneclick-navy text-white px-2 py-0.5 rounded-md text-[10px] font-black italic">Дія</div>
              <span>{language === 'uk' ? 'Вхід через Дію' : 'Log in with Diia'}</span>
            </button>
            
            <button 
              onClick={() => setShowPhoneLogin(true)} 
              className="w-full bg-white/10 border border-white/20 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-white/15"
            >
              <span className="material-symbols-outlined">phone_android</span>
              <span>{language === 'uk' ? 'Вхід за номером' : 'Log in with Phone'}</span>
            </button>

            <div className="text-center pt-4 text-xs text-white/50">
              {language === 'uk' ? 'Авторизуючись, ви погоджуєтесь з' : 'By logging in, you agree to'} <br />
              <span className="underline cursor-pointer hover:text-white">{language === 'uk' ? 'Умовами використання' : 'Terms of use'}</span>
            </div>
          </div>
        ) : showDiiaLogin ? (
          // Diia Authorization screen
          <div className="bg-white/10 backdrop-blur-md rounded-[32px] p-6 border border-white/10 text-center animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => setShowDiiaLogin(false)} className="text-white/60 hover:text-white flex items-center">
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <span className="text-xs uppercase font-bold tracking-wider text-white/60">{language === 'uk' ? 'Авторизація' : 'Authorization'}</span>
              <div className="w-6"></div>
            </div>
            
            <div className="bg-white text-oneclick-navy font-black text-2xl py-2 px-6 rounded-2xl mx-auto w-fit mb-4 select-none">Дія</div>
            
            <h3 className="text-lg font-bold mb-2">{language === 'uk' ? 'Швидка верифікація' : 'Quick Verification'}</h3>
            <p className="text-xs text-white/70 mb-6">
              {language === 'uk' 
                ? 'Дія автоматично надасть ваш ІПН та Паспорт для легального оформлення.' 
                : 'Diia will automatically verify tax ID & passport for legal employment.'}
            </p>

            <div className="bg-white p-4 rounded-2xl inline-block mb-6 relative">
              {isDiiaScanning ? (
                <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center rounded-2xl">
                  <div className="w-8 h-8 border-4 border-oneclick-orange border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-[10px] text-oneclick-navy font-bold uppercase">{language === 'uk' ? 'Перевірка...' : 'Verifying...'}</p>
                </div>
              ) : null}
              {/* Simulated QR code */}
              <svg className="w-32 h-32 text-oneclick-navy" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v2h-2v-2z"></path>
              </svg>
            </div>

            <button 
              onClick={handleDiiaAuth} 
              className="w-full bg-oneclick-orange text-white py-3.5 rounded-xl font-bold active:scale-95 transition-transform orange-glow-btn"
            >
              {language === 'uk' ? 'Відкрити в додатку Дія' : 'Open in Diia app'}
            </button>
          </div>
        ) : (
          // Phone authentication screen
          <div className="bg-white/10 backdrop-blur-md rounded-[32px] p-6 border border-white/10 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => { setShowPhoneLogin(false); setIsOtpSent(false); }} className="text-white/60 hover:text-white flex items-center">
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <span className="text-xs uppercase font-bold tracking-wider text-white/60">{language === 'uk' ? 'Вхід' : 'Login'}</span>
              <div className="w-6"></div>
            </div>

            {!isOtpSent ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1.5 uppercase tracking-wider text-left">
                    {language === 'uk' ? 'Номер телефону' : 'Phone Number'}
                  </label>
                  <input 
                    type="tel" 
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+380 99 123 4567" 
                    className="w-full bg-white/5 border border-white/20 focus:border-oneclick-orange rounded-xl px-4 py-3 text-white outline-none"
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-oneclick-orange text-white py-3.5 rounded-xl font-bold active:scale-95 transition-transform orange-glow-btn"
                >
                  {language === 'uk' ? 'Надіслати код' : 'Send Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-white/70 mb-1.5 uppercase tracking-wider text-left">
                    {language === 'uk' ? 'Код підтвердження (4 цифри)' : 'Verification Code (4 digits)'}
                  </label>
                  <input 
                    type="text" 
                    required
                    maxLength={4}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="0 0 0 0" 
                    className="w-full bg-white/5 border border-white/20 focus:border-oneclick-orange rounded-xl px-4 py-3 text-white text-center text-xl font-bold tracking-widest outline-none"
                  />
                  <p className="text-[10px] text-white/50 mt-1.5 text-center">
                    {language === 'uk' ? 'Введіть будь-які 4 цифри для демонстрації' : 'Enter any 4 digits to demo'}
                  </p>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-oneclick-orange text-white py-3.5 rounded-xl font-bold active:scale-95 transition-transform"
                >
                  {language === 'uk' ? 'Підтвердити' : 'Verify'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
