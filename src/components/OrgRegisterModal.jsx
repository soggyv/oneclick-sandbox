import React from 'react';
import { X } from 'lucide-react';

export default function OrgRegisterModal({
  isOpen,
  onClose,
  regOrgName,
  setRegOrgName,
  regOrgAddr,
  setRegOrgAddr,
  regOrgDesc,
  setRegOrgDesc,
  onSubmit
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-3xl w-full max-w-[380px] p-6 shadow-2xl animate-scaleUp text-left relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-black dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800/50 dark:hover:text-white rounded-full transition-all active:scale-95 cursor-pointer"
        >
          <X size={18} />
        </button>

        <h3 className="font-black text-gray-900 dark:text-zinc-100 text-base mb-1">
          Реєстрація факультету / підрозділу
        </h3>
        <p className="text-[10px] text-gray-400 dark:text-zinc-400 font-bold uppercase tracking-wider mb-5">
          Створіть кабінет факультету для публікації заходів
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-[9px] font-bold text-gray-400 dark:text-zinc-400 uppercase tracking-widest mb-1 px-0.5">
              Факультет / Підрозділ
            </label>
            <input
              type="text"
              placeholder="напр. Студрада ФКІТ чи Деканат ФПС"
              value={regOrgName}
              onChange={(e) => setRegOrgName(e.target.value)}
              required
              className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 dark:text-zinc-100 focus:outline-none focus:border-[#FF5522] dark:placeholder-zinc-500 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-[9px] font-bold text-gray-400 dark:text-zinc-400 uppercase tracking-widest mb-1 px-0.5">
              Локація / Корпус
            </label>
            <input
              type="text"
              placeholder="напр. Головний корпус, каб. 204"
              value={regOrgAddr}
              onChange={(e) => setRegOrgAddr(e.target.value)}
              required
              className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 dark:text-zinc-100 focus:outline-none focus:border-[#FF5522] dark:placeholder-zinc-500 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-[9px] font-bold text-gray-400 dark:text-zinc-400 uppercase tracking-widest mb-1 px-0.5">
              Опис факультету
            </label>
            <textarea
              rows="2"
              placeholder="Короткий опис діяльності факультету чи підрозділу..."
              value={regOrgDesc}
              onChange={(e) => setRegOrgDesc(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-gray-250 dark:border-zinc-700 rounded-xl p-2.5 text-xs font-semibold text-gray-800 dark:text-zinc-100 focus:outline-none focus:border-[#FF5522] dark:placeholder-zinc-500 resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-[#FF5522] hover:bg-[#FF5522]/90 dark:bg-orange-500 dark:hover:bg-orange-600 text-white dark:text-white font-extrabold rounded-full text-xs shadow-md uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
          >
            Зареєструвати факультет
          </button>
        </form>
      </div>
    </div>
  );
}
