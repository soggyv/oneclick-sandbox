import React from 'react';
import { Building, User } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
  userRole: 'worker' | 'employer';
  handleToggleUserRole: () => void;
}

export function Header({ theme, setTheme, userRole, handleToggleUserRole }: HeaderProps) {
  return (
    <header className={`px-4 py-4 flex items-center justify-between sticky top-0 z-40 border-b transition-all duration-300 ${theme === 'light'
      ? 'bg-white/70 border-[#ebe7e7] text-[#001B3D]'
      : 'bg-[#0f172a]/70 border-white/10 text-white'
      } backdrop-blur-[24px]`}>
      <div className="flex items-center gap-2 relative z-10">
        <div className="w-9 h-9 bg-gradient-to-br from-[#FF5722] to-[#e64a19] rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-[0_4px_10px_rgba(255,87,34,0.3)]">
          1C
        </div>
        <span className="font-black text-lg uppercase tracking-tight">OneClick</span>
      </div>

      <div className="flex items-center gap-2.5 relative z-10">
        {/* Theme Toggle Button */}
        <button
          onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
          className={`p-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center border ${theme === 'light'
            ? 'bg-white/70 hover:bg-white border-black/10 text-[#001B3D]'
            : 'bg-[#1c2541]/60 hover:bg-[#252f55]/80 border-white/10 text-white'
            } backdrop-blur-[24px]`}
          title="Переключити тему"
        >
          {theme === 'light' ? (
            <svg className="w-4 h-4 text-[#FF5722]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 text-[#FF5722]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {/* B2C/B2B Switcher */}
        <button
          onClick={handleToggleUserRole}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[11px] transition-all active:scale-95 border ${theme === 'light'
            ? 'bg-white/70 hover:bg-white border-black/10 text-[#001B3D] font-bold'
            : 'bg-[#1c2541]/60 hover:bg-[#252f55]/80 border-white/10 text-white font-bold'
            } backdrop-blur-[24px]`}
        >
          {userRole === 'worker' ? (
            <>
              <Building className="w-3.5 h-3.5 text-[#FF5722]" />
              <span>Бізнес (B2B)</span>
            </>
          ) : (
            <>
              <User className="w-3.5 h-3.5 text-[#FF5722]" />
              <span>Шукач (B2C)</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
