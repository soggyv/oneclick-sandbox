import React from 'react';

export default function SphereFilters({ b2cFilters, selectedFilter, setSelectedFilter }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 pt-1 no-scrollbar">
      {b2cFilters.map((filter) => {
        const isActive = selectedFilter === filter;
        return (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`flex-shrink-0 px-4.5 py-2 rounded-full text-[11px] font-extrabold transition-all duration-200 active:scale-95 cursor-pointer ${
              isActive
                ? 'bg-[#FF5522] text-white dark:bg-orange-500 dark:hover:bg-orange-600 dark:text-white shadow-sm'
                : 'bg-white text-gray-500 dark:bg-[#27272A] dark:text-zinc-300 border border-gray-100 dark:border-transparent hover:bg-gray-50 dark:hover:bg-zinc-700 dark:hover:text-white'
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
