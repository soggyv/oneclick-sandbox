import React from 'react';

export default function CalendarSelector({ calendarDays, selectedDateStr, setSelectedDateStr }) {
  return (
    <div className="flex gap-2 overflow-x-auto pt-2 pb-3.5 no-scrollbar">
      {calendarDays.map((day) => {
        const isActive = day.dateStr === selectedDateStr;
        return (
          <button
            key={day.dateStr}
            onClick={() => setSelectedDateStr(day.dateStr)}
            className={`flex-shrink-0 w-12 h-20 rounded-full flex flex-col justify-between items-center py-3 transition-all duration-200 active:scale-95 cursor-pointer ${
              isActive
                ? 'bg-[#FF5522] text-white shadow-md scale-105'
                : 'bg-white text-gray-600 dark:bg-dark-card dark:text-dark-text-body border border-gray-100 dark:border-dark-border hover:border-gray-200'
            }`}
          >
            <span className={`text-[9px] font-bold tracking-wider ${isActive ? 'text-orange-100' : 'text-gray-400 dark:text-dark-text-muted'}`}>
              {day.weekday}
            </span>
            <span className="text-base font-black leading-none">
              {day.dayNum}
            </span>
          </button>
        );
      })}
    </div>
  );
}
