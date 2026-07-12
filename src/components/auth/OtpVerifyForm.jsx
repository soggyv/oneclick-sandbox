import React from 'react';

export default function OtpVerifyForm({
  enteredOtp,
  setEnteredOtp,
  otpCode,
  regEmail,
  regPhone,
  regRole,
  setOtpMode,
  setOtpCode,
  handleVerifyOtp
}) {
  return (
    <form onSubmit={handleVerifyOtp} className="space-y-4 w-full max-w-[320px] animate-fadeIn">
      <div>
        <label className="block text-[10px] font-bold text-gray-400 dark:text-dark-text-muted uppercase tracking-widest mb-1 px-1">
          Код підтвердження
        </label>
        <p className="text-[10px] text-gray-400 dark:text-dark-text-muted font-semibold mb-3 px-1 leading-relaxed">
          {regRole === 'B2B' ? (
            <>
              Ми надіслали 4-значний код на пошту <span className="text-gray-900 dark:text-gray-200 font-black">{regEmail}</span> (Код доступу: <span className="text-[#FF5522] font-black">{otpCode}</span>)
              <span className="block mt-1 text-[#FF5522] font-bold text-[9px] uppercase tracking-wide">
                * Якщо код не приходить протягом хвилини, перевірте папку "Спам"
              </span>
            </>
          ) : (
            <>
              Ми надіслали 4-значний код на номер <span className="text-gray-900 dark:text-gray-200 font-black">{regPhone}</span> (Код доступу: <span className="text-[#FF5522] font-black">{otpCode}</span>)
            </>
          )}
        </p>
        <input
          type="text"
          placeholder="0 0 0 0"
          value={enteredOtp}
          onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
          required
          className="w-full bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-2xl px-4 py-3.5 text-center text-lg font-black tracking-widest text-gray-800 dark:text-dark-text-header focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm transition-all"
        />
      </div>

      <button
        type="submit"
        className="w-full py-4 mt-2 bg-[#FF5522] hover:bg-[#FF5522]/90 text-white font-extrabold rounded-full shadow-md text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
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
        className="w-full py-3.5 bg-white hover:bg-gray-50 dark:bg-dark-bg dark:hover:bg-dark-card-hover border border-gray-200 dark:border-dark-border text-gray-700 dark:text-dark-text-body font-extrabold rounded-full shadow-sm text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
      >
        Назад
      </button>
    </form>
  );
}
