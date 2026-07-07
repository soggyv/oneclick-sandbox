import React from 'react';

export default function AuthForm({
  regRole,
  setRegRole,
  regName,
  setRegName,
  regPhone,
  setRegPhone,
  regEmail,
  setRegEmail,
  regPassword,
  setRegPassword,
  handleLoginSubmit,
  handleGoogleLogin,
  setForgotPasswordMode
}) {
  return (
    <form onSubmit={handleLoginSubmit} className="space-y-4 w-full max-w-[320px]">
      {/* Role Toggle Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl border border-gray-200 mb-4">
        <button
          type="button"
          onClick={() => setRegRole('B2C')}
          className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-wider cursor-pointer ${
            regRole === 'B2C'
              ? 'bg-[#FF5522] text-white shadow-sm'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          Волонтер (B2C)
        </button>
        <button
          type="button"
          onClick={() => setRegRole('B2B')}
          className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-wider cursor-pointer ${
            regRole === 'B2B'
              ? 'bg-[#FF5522] text-white shadow-sm'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          Організатор (B2B)
        </button>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
          Ваше ім'я
        </label>
        <input
          type="text"
          placeholder="напр. Дмитро"
          value={regName}
          onChange={(e) => setRegName(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm transition-all"
        />
      </div>

      {regRole === 'B2B' ? (
        <>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
              Електронна пошта
            </label>
            <input
              type="email"
              placeholder="email@example.com"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              required
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm transition-all"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
              Пароль
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm transition-all"
            />
            <span className="text-[9px] text-gray-400 mt-1 block px-1">
              Мінімум 6 символів
            </span>
            <button
              type="button"
              onClick={() => {
                setForgotPasswordMode(true);
              }}
              className="text-[10px] text-[#FF5522] hover:underline font-bold mt-1.5 block px-1 cursor-pointer"
            >
              Забули пароль?
            </button>
          </div>
        </>
      ) : (
        <div>
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
            Телефон
          </label>
          <div className="flex gap-2 items-center">
            <span className="bg-gray-100 border border-gray-200 text-gray-500 font-extrabold rounded-2xl px-3 py-3.5 text-xs shrink-0">
              +380
            </span>
            <input
              type="text"
              placeholder="0931234567"
              value={regPhone}
              onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, '').slice(0, 12))}
              required
              className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm transition-all"
            />
          </div>
          <span className="text-[9px] text-gray-400 mt-1 block px-1">
            Введіть 10 цифр (наприклад, 0931234567)
          </span>
        </div>
      )}

      <button
        type="submit"
        className="w-full py-4 mt-2 bg-[#FF5522] hover:bg-[#FF5522]/90 text-white font-extrabold rounded-full shadow-md text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
      >
        Увійти / Зареєструватися
      </button>

      <div className="relative my-4 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <span className="relative px-3 bg-[#f5f5f7] text-[10px] text-gray-400 font-bold uppercase tracking-wider">
          або
        </span>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full py-3.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-extrabold rounded-full shadow-sm text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
        </svg>
        Продовжити з Google
      </button>
    </form>
  );
}
