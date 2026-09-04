import React from 'react';
import { Mail } from 'lucide-react';

export default function OtpVerifyForm({
  enteredOtp,
  setEnteredOtp,
  otpCode,
  regEmail,
  setOtpMode,
  setOtpCode,
  handleVerifyOtp,
  emailNotifPref = true,
  setEmailNotifPref
}) {
  return (
    <form onSubmit={handleVerifyOtp} className="space-y-4 w-full max-w-[320px] animate-fadeIn">
      <div>
        <label htmlFor="otp-input" className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 px-1">
          Код підтвердження
        </label>
        <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold mb-4 px-1 leading-relaxed">
          Ми надіслали 4-значний код на пошту <span className="text-gray-900 dark:text-white font-black">{regEmail}</span>
          <span className="block mt-2 text-[#FF5522] dark:text-orange-400 font-bold text-[10px] uppercase tracking-wide">
            * Якщо код не приходить протягом хвилини, перевірте папку "Спам"
          </span>
        </p>
        <input
          id="otp-input"
          name="one-time-code"
          autoComplete="one-time-code"
          type="text"
          placeholder="0 0 0 0"
          value={enteredOtp}
          onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
          required
          className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl px-4 py-3.5 text-center text-xl font-black tracking-widest text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#FF5522] dark:focus:border-orange-500 shadow-sm transition-all"
        />

        {/* Email Notification Preference Badge / Toggle Card ("Плашка сповіщень на пошту") */}
        <div className="bg-orange-50/70 dark:bg-zinc-800/60 border border-orange-200/60 dark:border-zinc-700/80 rounded-2xl p-3.5 text-left transition-all mt-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-[#FF5522] dark:text-orange-400 flex items-center justify-center shrink-0">
                <Mail size={16} />
              </div>
              <div>
                <span className="text-xs font-black text-gray-900 dark:text-zinc-100 block leading-tight">
                  Сповіщення на пошту
                </span>
                <span className="text-[10px] text-gray-500 dark:text-zinc-400 font-semibold block mt-0.5 leading-snug">
                  Листи про оновлення ваших заявок
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setEmailNotifPref && setEmailNotifPref(!emailNotifPref)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer shrink-0 ${
                emailNotifPref ? 'bg-[#FF5522] dark:bg-orange-500 justify-end' : 'bg-gray-300 dark:bg-zinc-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-4 mt-2 bg-[#FF5522] hover:bg-[#FF5522]/90 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-extrabold rounded-full shadow-md text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
      >
        Підтвердити код
      </button>

      <button
        type="button"
        onClick={() => {
          setOtpMode(false);
          setOtpCode('');
          setEnteredOtp('');
        }}
        className="w-full py-3.5 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-100 border border-gray-200 dark:border-zinc-700 font-extrabold rounded-full shadow-sm text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
      >
        Назад
      </button>
    </form>
  );
}
