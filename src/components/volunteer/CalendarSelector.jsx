import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarSelector({ calendarDays, selectedDateStr, setSelectedDateStr }) {
  const scrollContainerRef = useRef(null);

  const handleWheel = (e) => {
    if (scrollContainerRef.current && e.deltaY !== 0) {
      scrollContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group my-1">
      {/* Scroll Left Button */}
      <button
        onClick={() => scroll('left')}
        className="flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 sm:-translate-x-3 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm text-gray-700 dark:text-zinc-200 border border-gray-200/80 dark:border-zinc-700/80 shadow-md items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all cursor-pointer active:scale-90"
        title="Прокрутити назад"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Scroll Right Button */}
      <button
        onClick={() => scroll('right')}
        className="flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 sm:translate-x-3 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm text-gray-700 dark:text-zinc-200 border border-gray-200/80 dark:border-zinc-700/80 shadow-md items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all cursor-pointer active:scale-90"
        title="Прокрутити вперед"
      >
        <ChevronRight size={16} />
      </button>

      {/* Calendar Scroll Track */}
      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        className="flex gap-2 overflow-x-auto pt-2 pb-3.5 px-4 sm:px-0 no-scrollbar scroll-smooth select-none"
      >
        {calendarDays.map((day) => {
          const isActive = day.dateStr === selectedDateStr;
          return (
            <button
              key={day.dateStr}
              onClick={() => setSelectedDateStr(day.dateStr)}
              className={`flex-shrink-0 w-12 h-20 rounded-full flex flex-col justify-between items-center py-3 transition-all duration-200 active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-[#FF5522] dark:bg-orange-500 text-white shadow-md scale-105'
                  : 'bg-white text-gray-600 dark:bg-[#27272A] dark:text-zinc-300 border border-gray-100 dark:border-transparent hover:border-gray-200 dark:hover:bg-zinc-700 dark:hover:text-white'
              }`}
            >
              <span className={`text-[9px] font-bold tracking-wider ${isActive ? 'text-orange-100' : 'text-gray-400 dark:text-zinc-550'}`}>
                {day.weekday}
              </span>
              <span className="text-base font-black leading-none">
                {day.dayNum}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
