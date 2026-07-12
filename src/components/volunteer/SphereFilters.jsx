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
            className={`flex-shrink-0 px-4.5 py-2 rounded-full text-[11px] font-extrabold transition-all duration-200 active:scale-95 ${
              isActive
                ? 'bg-[#FFCC00] text-black shadow-sm'
                : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
            }`}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
}
