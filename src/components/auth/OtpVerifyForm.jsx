import React from 'react';

export default function OtpVerifyForm({
  enteredOtp,
  setEnteredOtp,
  otpCode,
  regEmail,
  setOtpMode,
  setOtpCode,
  handleVerifyOtp
}) {
  return (
    <form onSubmit={handleVerifyOtp} className="space-y-4 w-full max-w-[320px] animate-fadeIn">
      <div>
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 px-1">
          Код підтвердження
        </label>
        <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold mb-4 px-1 leading-relaxed">
          Ми надіслали 4-значний код на пошту <span className="text-gray-900 dark:text-white font-black">{regEmail}</span> (Код доступу: <span className="text-[#FF5522] dark:text-orange-400 font-black">{otpCode}</span>)
          <span className="block mt-2 text-[#FF5522] dark:text-orange-400 font-bold text-[10px] uppercase tracking-wide">
            * Якщо код не приходить протягом хвилини, перевірте папку "Спам"
          </span>
        </p>
        <input
          type="text"
          placeholder="0 0 0 0"
          value={enteredOtp}
          onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
          required
          className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl px-4 py-3.5 text-center text-xl font-black tracking-widest text-gray-800 dark:text-gray-100 focus:outline-none focus:border-[#FF5522] dark:focus:border-orange-500 shadow-sm transition-all"
        />
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
