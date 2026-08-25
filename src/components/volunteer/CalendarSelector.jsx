import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown, X } from 'lucide-react';

const monthsUk = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
];

const monthsUkGenitive = [
  'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
  'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'
];

const monthsUkShort = [
  'січ.', 'лют.', 'бер.', 'квіт.', 'трав.', 'черв.',
  'лип.', 'серп.', 'вер.', 'жовт.', 'лист.', 'груд.'
];

const weekdaysFull = [
  'Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'
];

export default function CalendarSelector({ calendarDays, selectedDateStr, setSelectedDateStr, shifts }) {
  const scrollContainerRef = useRef(null);
  const dayRefs = useRef({});
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Parse active selected date
  const selectedDayObj = (calendarDays || []).find(d => d.dateStr === selectedDateStr) || calendarDays?.[0];
  
  let parsedSelectedDate = selectedDayObj?.date;
  if (!parsedSelectedDate && selectedDateStr) {
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    parsedSelectedDate = new Date(y, m - 1, d);
  }
  if (!parsedSelectedDate) parsedSelectedDate = new Date();

  const selectedMonthIdx = parsedSelectedDate.getMonth();
  const selectedYear = parsedSelectedDate.getFullYear();
  const selectedDayNum = parsedSelectedDate.getDate();
  const selectedWeekdayName = weekdaysFull[parsedSelectedDate.getDay()];
  const selectedMonthGenitive = monthsUkGenitive[selectedMonthIdx];

  // DatePicker state
  const [pickerMonth, setPickerMonth] = useState(selectedMonthIdx);
  const [pickerYear, setPickerYear] = useState(selectedYear);

  // Sync picker view month/year when modal opens
  useEffect(() => {
    if (isDatePickerOpen) {
      setPickerMonth(selectedMonthIdx);
      setPickerYear(selectedYear);
    }
  }, [isDatePickerOpen, selectedMonthIdx, selectedYear]);

  // Center selected date card in view when selectedDateStr changes
  useEffect(() => {
    if (selectedDateStr) {
      scrollToDate(selectedDateStr);
    }
  }, [selectedDateStr]);

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const isSelectedToday = selectedDateStr === todayStr;

  const dateTitle = isSelectedToday
    ? `Сьогодні, ${selectedDayNum} ${selectedMonthGenitive}`
    : `${selectedWeekdayName}, ${selectedDayNum} ${selectedMonthGenitive}`;

  // Horizontal Scroll Handler
  const handleWheel = (e) => {
    if (scrollContainerRef.current && e.deltaY !== 0) {
      scrollContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' 
        ? -scrollContainerRef.current.clientWidth * 0.7 
        : scrollContainerRef.current.clientWidth * 0.7;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Center selected date element right in the middle of scroll track
  const scrollToDate = (dateStr) => {
    const el = dayRefs.current[dateStr];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  // Generate DatePicker Grid
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfWeek = (month, year) => {
    const day = new Date(year, month, 1).getDay();
    return (day + 6) % 7; // Convert Sun=0 to Mon=0..Sun=6
  };

  const totalDays = getDaysInMonth(pickerMonth, pickerYear);
  const startOffset = getFirstDayOfWeek(pickerMonth, pickerYear);
  const pickerGrid = [...Array(startOffset).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];

  return (
    <div className="mb-2">
      {/* Date Header - Clickable Trigger for DatePicker */}
      <div className="flex items-center justify-between px-1 mb-2.5">
        <button
          type="button"
          onClick={() => setIsDatePickerOpen(true)}
          className="flex items-center gap-1.5 px-2 py-1 -ml-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all cursor-pointer group active:scale-95 border border-transparent hover:border-gray-200 dark:hover:border-zinc-700"
          title="Натисніть для вибору дати з календаря"
        >
          <CalendarIcon size={15} className="text-[#FF5522] shrink-0 group-hover:scale-110 transition-transform" />
          <span className="text-sm sm:text-base font-bold tracking-tight text-gray-900 dark:text-zinc-100 flex items-center gap-1.5">
            {dateTitle}
            <ChevronDown size={14} className="text-gray-400 dark:text-zinc-500 group-hover:text-[#FF5522] transition-colors" />
          </span>
        </button>

        <span className="text-xs font-black text-[#FF5522] dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded-md border border-orange-100/60 dark:border-transparent">
          {selectedYear}
        </span>
      </div>

      {/* Calendar Strip Container */}
      <div className="relative group">
        {/* Scroll Left Button */}
        <button
          type="button"
          onClick={() => scroll('left')}
          className="flex absolute left-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md text-gray-700 dark:text-zinc-200 border border-gray-200/80 dark:border-zinc-700/80 shadow-md items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all cursor-pointer active:scale-90 opacity-80 group-hover:opacity-100"
          title="Прокрутити назад"
        >
          <ChevronLeft size={15} />
        </button>

        {/* Scroll Right Button */}
        <button
          type="button"
          onClick={() => scroll('right')}
          className="flex absolute right-0 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md text-gray-700 dark:text-zinc-200 border border-gray-200/80 dark:border-zinc-700/80 shadow-md items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-700 transition-all cursor-pointer active:scale-90 opacity-80 group-hover:opacity-100"
          title="Прокрутити вперед"
        >
          <ChevronRight size={15} />
        </button>

        {/* Calendar Scroll Track - Clean natural padding, smooth swipe & centering */}
        <div
          ref={scrollContainerRef}
          onWheel={handleWheel}
          className="flex gap-2.5 sm:gap-3 overflow-x-auto py-1 px-2 sm:px-3 no-scrollbar scroll-smooth select-none items-center"
        >
          {(calendarDays || []).map((day, idx) => {
            const isActive = day.dateStr === selectedDateStr;

            let dObj = day.date;
            if (!dObj && day.dateStr) {
              const [y, m, d] = day.dateStr.split('-').map(Number);
              dObj = new Date(y, m - 1, d);
            }
            if (!dObj) dObj = new Date();

            const monthIdx = dObj.getMonth();
            const monthShort = monthsUkShort[monthIdx];
            const isDayToday = day.dateStr === todayStr;

            // Check if this day starts a new month relative to the previous day
            let isNewMonth = false;
            if (idx > 0 && calendarDays[idx - 1]) {
              const prevDateStr = calendarDays[idx - 1].dateStr;
              const [py, pm] = prevDateStr.split('-').map(Number);
              if (pm - 1 !== monthIdx) {
                isNewMonth = true;
              }
            }

            const hasShift = (shifts || []).some(s => {
              if (!s) return false;
              const sDate = s.date || (s.start_time ? s.start_time.split('T')[0] : null) || s.shift_date;
              return sDate === day.dateStr;
            });

            return (
              <React.Fragment key={day.dateStr}>
                {isNewMonth && (
                  <div className="flex flex-col justify-center items-center shrink-0 self-center px-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-950/60 px-2.5 py-2 rounded-full border border-orange-200 dark:border-transparent animate-fadeIn">
                      {monthsUk[monthIdx]}
                    </span>
                  </div>
                )}

                <button
                  ref={(el) => (dayRefs.current[day.dateStr] = el)}
                  type="button"
                  onClick={() => {
                    setSelectedDateStr(day.dateStr);
                    scrollToDate(day.dateStr);
                  }}
                  className={`relative flex-shrink-0 w-13 h-21 sm:w-14 sm:h-22 rounded-full flex flex-col justify-between items-center py-3 px-1 transition-all duration-200 active:scale-95 cursor-pointer border ${
                    isActive
                      ? 'bg-[#FF5522] dark:bg-orange-500 text-white shadow-md shadow-orange-500/25 border-transparent scale-105 z-10'
                      : 'bg-white text-gray-700 dark:bg-[#27272A] border-gray-200/70 dark:border-zinc-800 hover:border-gray-300 dark:hover:bg-zinc-700'
                  }`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-wider ${
                    isActive ? 'text-orange-100' : 'text-gray-400 dark:text-zinc-500'
                  }`}>
                    {day.weekday}
                  </span>

                  <span className={`text-lg sm:text-xl font-black leading-none my-0.5 ${
                    isActive ? 'text-white' : 'text-gray-700 dark:text-zinc-400'
                  }`}>
                    {day.dayNum}
                  </span>

                  <span className={`text-[10px] font-black uppercase tracking-wide ${
                    isActive ? 'text-white/90' : 'text-gray-400 dark:text-zinc-500'
                  }`}>
                    {monthShort}
                  </span>

                  {/* Yellow dot indicator for available shifts on both active and inactive cards */}
                  {hasShift && (
                    <span className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${
                      isActive ? 'bg-yellow-300' : 'bg-amber-400 dark:bg-yellow-400 shadow-sm shadow-yellow-400/50'
                    }`} />
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Date Picker Modal - Rendered via React Portal onto document.body for 100% full-screen backdrop blur */}
      {isDatePickerOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-[#18181B] text-gray-900 dark:text-zinc-100 rounded-3xl p-5 w-full max-w-xs sm:max-w-sm shadow-2xl border border-gray-200 dark:border-zinc-800 animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="font-black text-base flex items-center gap-2">
                <CalendarIcon size={16} className="text-[#FF5522]" />
                <span>Оберіть дату</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 bg-gray-100 dark:bg-zinc-800 rounded-full transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-3 px-1">
              <button
                type="button"
                onClick={() => {
                  if (pickerMonth === 0) {
                    setPickerMonth(11);
                    setPickerYear(prev => prev - 1);
                  } else {
                    setPickerMonth(prev => prev - 1);
                  }
                }}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-gray-600 dark:text-zinc-300"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="font-black text-sm text-gray-900 dark:text-zinc-100 uppercase tracking-wide">
                {monthsUk[pickerMonth]} {pickerYear}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (pickerMonth === 11) {
                    setPickerMonth(0);
                    setPickerYear(prev => prev + 1);
                  } else {
                    setPickerMonth(prev => prev + 1);
                  }
                }}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-gray-600 dark:text-zinc-300"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'НД'].map((d) => (
                <span key={d} className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider py-1">
                  {d}
                </span>
              ))}
            </div>

            {/* Month Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {pickerGrid.map((dayNum, index) => {
                if (!dayNum) {
                  return <div key={`empty-${index}`} className="h-9" />;
                }

                const dateStr = `${pickerYear}-${String(pickerMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const isAvailable = (calendarDays || []).some(d => d.dateStr === dateStr);
                const isSelected = dateStr === selectedDateStr;
                const isToday = dateStr === todayStr;
                const hasShift = (shifts || []).some(s => {
                  if (!s) return false;
                  const sDate = s.date || (s.start_time ? s.start_time.split('T')[0] : null) || s.shift_date;
                  return sDate === dateStr;
                });

                return (
                  <button
                    key={dateStr}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => {
                      if (!isAvailable) return;
                      setSelectedDateStr(dateStr);
                      setIsDatePickerOpen(false);
                      setTimeout(() => scrollToDate(dateStr), 100);
                    }}
                    className={`relative h-9 rounded-xl font-black text-xs flex flex-col items-center justify-center transition-all ${
                      !isAvailable
                        ? 'opacity-20 cursor-not-allowed text-gray-400 dark:text-zinc-650 pointer-events-none'
                        : isSelected
                        ? 'bg-[#FF5522] text-white shadow-md shadow-orange-500/30 scale-105 z-10 cursor-pointer'
                        : isToday
                        ? 'bg-orange-50 text-[#FF5522] dark:bg-orange-950/40 dark:text-orange-400 border border-orange-200 dark:border-transparent cursor-pointer'
                        : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-200 cursor-pointer'
                    }`}
                  >
                    <span>{dayNum}</span>
                    {/* Yellow dot indicator if shifts are available on this date */}
                    {isAvailable && hasShift && (
                      <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                        isSelected ? 'bg-yellow-300' : 'bg-amber-400 dark:bg-yellow-400 shadow-sm shadow-yellow-400/50'
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Modal Footer Quick Actions & Legend */}
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => {
                  setSelectedDateStr(todayStr);
                  setIsDatePickerOpen(false);
                  setTimeout(() => scrollToDate(todayStr), 100);
                }}
                className="font-bold text-[#FF5522] dark:text-orange-400 hover:underline cursor-pointer"
              >
                Перейти на сьогодні
              </button>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-zinc-500 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 dark:bg-yellow-400 shadow-sm" />
                <span>Є доступні зміни</span>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
