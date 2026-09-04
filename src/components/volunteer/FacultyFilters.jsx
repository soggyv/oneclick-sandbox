import React from 'react';
import { useStore } from '../../store/useStore';
import { TARGET_FACULTIES_OPTIONS } from '../../constants/faculties';

export default function FacultyFilters() {
  const activeFacultyFilter = useStore((state) => state.activeFacultyFilter);
  const setActiveFacultyFilter = useStore((state) => state.setActiveFacultyFilter);
  const user = useStore((state) => state.user);

  const userFaculty = user?.faculty || 'ФКІТ';

  return (
    <div className="flex gap-2 overflow-x-auto pb-3 pt-1 no-scrollbar text-left">
      <button
        onClick={() => setActiveFacultyFilter('ALL')}
        className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer shadow-xs border ${
          activeFacultyFilter === 'ALL'
            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent shadow-sm'
            : 'bg-white text-gray-600 dark:bg-zinc-800 dark:text-zinc-300 border-gray-200 dark:border-zinc-700/60 hover:bg-gray-50 dark:hover:bg-zinc-700'
        }`}
      >
        Усі факультети
      </button>

      <button
        onClick={() => setActiveFacultyFilter(userFaculty)}
        className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer shadow-xs border ${
          activeFacultyFilter === userFaculty
            ? 'bg-[#FF5522] text-white border-transparent shadow-sm'
            : 'bg-orange-50 text-[#FF5522] dark:bg-orange-950/40 dark:text-orange-400 border-orange-200 dark:border-orange-900/60 hover:bg-orange-100'
        }`}
      >
        Мій ({userFaculty})
      </button>

      {TARGET_FACULTIES_OPTIONS.filter(f => f.id !== 'ALL').map((fac) => {
        const isActive = activeFacultyFilter === fac.id;
        return (
          <button
            key={fac.id}
            onClick={() => setActiveFacultyFilter(fac.id)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer shadow-xs border ${
              isActive
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent shadow-sm'
                : 'bg-white text-gray-600 dark:bg-zinc-800 dark:text-zinc-300 border-gray-200 dark:border-zinc-700/60 hover:bg-gray-50 dark:hover:bg-zinc-700'
            }`}
          >
            {fac.name}
          </button>
        );
      })}
    </div>
  );
}
