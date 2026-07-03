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
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 px-1">
            Код відновлення
          </label>
          <p className="text-[10px] text-gray-400 font-semibold mb-3 px-1 leading-relaxed">
            Ми надіслали код для зміни паролю на пошту <span className="text-gray-900 font-black">{resetEmail}</span> (симуляція: <span className="text-[#FF5522] font-black">{resetOtpCode}</span>)
          </p>
          <input
            type="text"
            placeholder="0 0 0 0"
            value={resetEnteredOtp}
            onChange={(e) => setResetEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
            required
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-center text-lg font-black tracking-widest text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm transition-all"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
            Новий пароль
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm transition-all"
          />
        </div>

        <button
          type="submit"
          className="w-full py-4 mt-2 bg-[#FF5522] hover:bg-[#FF5522]/90 text-white font-extrabold rounded-full shadow-md text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
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
          className="w-full py-3.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-extrabold rounded-full shadow-sm text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          Назад
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleRequestResetOtp} className="space-y-4 w-full max-w-[320px] animate-fadeIn">
      <h2 className="text-sm font-bold text-gray-850 mb-2 px-1 text-center font-black tracking-tight">
        Відновлення паролю
      </h2>
      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
          Електронна пошта
        </label>
        <input
          type="email"
          placeholder="email@example.com"
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
          required
          className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm transition-all"
        />
      </div>

      <button
        type="submit"
        className="w-full py-4 mt-2 bg-[#FF5522] hover:bg-[#FF5522]/90 text-white font-extrabold rounded-full shadow-md text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
      >
        Надіслати код
      </button>

      <button
        type="button"
        onClick={() => {
          setForgotPasswordMode(false);
        }}
        className="w-full py-3.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-extrabold rounded-full shadow-sm text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
      >
        Назад до входу
      </button>
    </form>
  );
}
