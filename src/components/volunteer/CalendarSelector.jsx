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
            className={`flex-shrink-0 w-12 h-20 rounded-full flex flex-col justify-between items-center py-3 transition-all duration-200 active:scale-95 ${
              isActive
                ? 'bg-black text-white shadow-md scale-105'
                : 'bg-white text-gray-600 border border-gray-100 hover:border-gray-200'
            }`}
          >
            <span className={`text-[9px] font-bold tracking-wider ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>
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
