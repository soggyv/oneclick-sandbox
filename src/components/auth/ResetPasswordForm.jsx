import React from 'react';

export default function ResetPasswordForm({
  resetEmail,
  setResetEmail,
  newPassword,
  setNewPassword,
  resetOtpCode,
  resetEnteredOtp,
  setResetEnteredOtp,
  resetOtpMode,
  setResetOtpMode,
  handleResetPasswordSubmit,
  handleRequestResetOtp,
  setForgotPasswordMode
}) {
  if (resetOtpMode) {
    return (
      <form onSubmit={handleResetPasswordSubmit} className="space-y-4 w-full max-w-[320px] animate-fadeIn">
        <div>
          <label htmlFor="reset-otp-input" className="block text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-widest mb-1 px-1">
            Код відновлення
          </label>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold mb-3 px-1 leading-relaxed">
            Ми надіслали код для зміни паролю на пошту <span className="text-gray-900 dark:text-white font-black">{resetEmail}</span>
            <span className="block mt-1 text-[#FF5522] font-bold text-[9px] uppercase tracking-wide">
              * Якщо лист не надходить, перевірте папку "Спам"
            </span>
          </p>
          <input
            id="reset-otp-input"
            name="reset-otp"
            autoComplete="one-time-code"
            type="text"
            placeholder="0 0 0 0"
            value={resetEnteredOtp}
            onChange={(e) => setResetEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
            required
            className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl px-4 py-3.5 text-center text-lg font-black tracking-widest text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm transition-all"
          />
        </div>

        <div>
          <label htmlFor="reset-new-password" className="block text-[10px] font-bold text-gray-400 dark:text-gray-555 uppercase tracking-widest mb-1.5 px-1">
            Новий пароль
          </label>
          <input
            id="reset-new-password"
            name="new-password"
            autoComplete="new-password"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl px-4 py-3.5 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm transition-all"
          />
          <span className="text-[9px] text-gray-400 dark:text-gray-550 mt-1 block px-1">
            Мінімум 6 символів
          </span>
        </div>

        <button
          type="submit"
          className="w-full py-4 mt-2 bg-[#FF5522] hover:bg-[#FF5522]/90 dark:bg-orange-500 dark:hover:bg-orange-600 text-white dark:text-white font-extrabold rounded-full shadow-md text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
        >
          Змінити пароль
        </button>

        <button
          type="button"
          onClick={() => {
            setResetOtpMode(false);
            setResetEnteredOtp('');
            setNewPassword('');
          }}
          className="w-full py-3.5 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 dark:hover:text-white border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-200 font-extrabold rounded-full shadow-sm text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          Назад
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleRequestResetOtp} className="space-y-4 w-full max-w-[320px] animate-fadeIn">
      <h2 className="text-sm font-bold text-gray-850 dark:text-gray-200 mb-2 px-1 text-center font-black tracking-tight">
        Відновлення паролю
      </h2>
      <div>
        <label htmlFor="reset-email" className="block text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase tracking-widest mb-1.5 px-1">
          Електронна пошта
        </label>
        <input
          id="reset-email"
          name="email"
          autoComplete="email"
          type="email"
          placeholder="email@example.com"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          required
          className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl px-4 py-3.5 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm transition-all"
        />
      </div>

      <button
        type="submit"
        className="w-full py-4 mt-2 bg-[#FF5522] hover:bg-[#FF5522]/90 dark:bg-orange-500 dark:hover:bg-orange-600 text-white dark:text-white font-extrabold rounded-full shadow-md text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
      >
        Надіслати код
      </button>

      <button
        type="button"
        onClick={() => {
          setForgotPasswordMode(false);
        }}
        className="w-full py-3.5 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 dark:hover:text-white border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-200 font-extrabold rounded-full shadow-sm text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
      >
        Назад до входу
      </button>
    </form>
  );
}
