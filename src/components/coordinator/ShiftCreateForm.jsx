import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Clock, MapPin, Save, ChevronDown, Search, Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

const monthsUkFull = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
];

const monthsUkGen = [
  'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
  'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'
];

export default function ShiftCreateForm({
  formTitle,
  setFormTitle,
  formSphere,
  setFormSphere,
  startTime,
  endTime,
  formLocation,
  setFormLocation,
  selectedDateStr,
  setSelectedDateStr,
  calendarDays,
  formAddress,
  setFormAddress,
  handleAddressBlur,
  showCreateMapPicker,
  setShowCreateMapPicker,
  formDescription,
  setFormDescription,
  handleCreateShift,
  setTempStartHour,
  setTempStartMin,
  setTempEndHour,
  setTempEndMin,
  setIsTimePickerOpen,
  shiftTemplates,
  onLoadFromTemplate,
  onCreateTemplate,
  formMaxVolunteers,
  setFormMaxVolunteers
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownSearch, setDropdownSearch] = useState('');
  const [isNamingTemplate, setIsNamingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [titleAlertMessage, setTitleAlertMessage] = useState('');

  // Custom B2B DatePicker state
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Parse currently selected date
  const [selY, selM, selD] = (selectedDateStr || '').split('-').map(Number);
  const selectedDateObj = (selY && selM && selD) ? new Date(selY, selM - 1, selD) : new Date();
  const selectedMonthIdx = selectedDateObj.getMonth();
  const selectedYear = selectedDateObj.getFullYear();
  const selectedDayNum = selectedDateObj.getDate();

  const formattedDateTitle = `${selectedDayNum} ${monthsUkGen[selectedMonthIdx]} ${selectedYear}`;

  // DatePicker view month/year
  const [pickerMonth, setPickerMonth] = useState(selectedMonthIdx);
  const [pickerYear, setPickerYear] = useState(selectedYear);

  const handleSaveAsTemplate = () => {
    if (!formTitle.trim()) {
      setTitleAlertMessage("Будь ласка, введіть назву заходу / завдання, перш ніж зберігати як шаблон.");
      return;
    }
    setTemplateName(formTitle.trim());
    setIsNamingTemplate(true);
  };

  // Filter templates based on search string
  const filteredTemplates = (shiftTemplates || []).filter(t => 
    t.name.toLowerCase().includes(dropdownSearch.toLowerCase()) ||
    t.title.toLowerCase().includes(dropdownSearch.toLowerCase())
  );

  // DatePicker grid generation
  const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfWeek = (m, y) => (new Date(y, m, 1).getDay() + 6) % 7;

  const totalDays = getDaysInMonth(pickerMonth, pickerYear);
  const startOffset = getFirstDayOfWeek(pickerMonth, pickerYear);
  const pickerGrid = [...Array(startOffset).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];

  const now = new Date();
  const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return (
    <div className="animate-fadeIn text-left">
      <div className="mb-5">
        <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-gray-200">Новий захід</h1>
        <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Опублікувати завдання для волонтерів</p>
      </div>

      <form onSubmit={handleCreateShift} className="space-y-4">
        {/* Templates dropdown if available */}
        {shiftTemplates && shiftTemplates.length > 0 && (
          <div className="bg-orange-50/30 dark:bg-zinc-800/40 border border-orange-100/30 dark:border-zinc-700/40 rounded-2xl p-4 mb-4 relative">
            <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 px-1">
              Завантажити з шаблону
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full text-left bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm flex justify-between items-center cursor-pointer transition-colors hover:border-[#FF5522]/50"
              >
                <span>Оберіть існуючий шаблон...</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {isDropdownOpen && (
                <>
                  {/* Overlay to catch click outside */}
                  <div 
                    className="fixed inset-0 z-40 bg-transparent" 
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setDropdownSearch('');
                    }}
                  />
                  {/* Dropdown panel */}
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-transparent rounded-xl shadow-xl z-50 p-2 space-y-2 max-h-64 flex flex-col animate-fadeIn">
                    <div className="relative flex items-center">
                      <Search size={12} className="absolute left-3 text-gray-400 dark:text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Пошук шаблону за назвою..."
                        value={dropdownSearch}
                        onChange={(e) => setDropdownSearch(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-transparent rounded-lg pl-8 pr-3 py-1.5 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#FF5522]"
                        autoFocus
                      />
                    </div>
                    <div className="overflow-y-auto flex-1 space-y-0.5 pr-1 max-h-48 scrollbar-thin">
                      {filteredTemplates.length === 0 ? (
                        <div className="text-center text-[10px] text-gray-400 py-3 font-semibold">
                          Нічого не знайдено
                        </div>
                      ) : (
                        filteredTemplates.map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              onLoadFromTemplate(t);
                              setIsDropdownOpen(false);
                              setDropdownSearch('');
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-gray-700 dark:text-zinc-200 hover:bg-orange-50 dark:hover:bg-zinc-800 rounded-lg transition-colors flex flex-col gap-0.5 cursor-pointer"
                          >
                            <span className="text-gray-900 dark:text-zinc-100">{t.name}</span>
                            <span className="text-[9px] text-gray-400 dark:text-zinc-500 font-semibold truncate">
                              {t.title} • {t.category}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 px-1">
            Назва заходу / Завдання
          </label>
          <input
            type="text"
            placeholder="напр. Волонтер на кавовий лекторій"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
            className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 px-1">
              Напрямок
            </label>
            <input
              type="text"
              placeholder="напр. IT-відділ"
              value={formSphere}
              onChange={(e) => setFormSphere(e.target.value)}
              required
              className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm"
            />
          </div>

          <div
            onClick={() => {
              setTempStartHour(startTime.split(':')[0] || '09');
              setTempStartMin(startTime.split(':')[1] || '00');
              setTempEndHour(endTime.split(':')[0] || '18');
              setTempEndMin(endTime.split(':')[1] || '00');
              setIsTimePickerOpen(true);
            }}
            className="cursor-pointer"
          >
            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 px-1 cursor-pointer">
              Години роботи
            </label>
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3.5 shadow-sm hover:border-[#FF5522]/50 transition-colors">
              <Clock size={14} className="text-gray-400 dark:text-zinc-500" />
              <span className="text-xs font-black text-gray-800 dark:text-gray-200">
                {startTime} — {endTime}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 px-1">
              Локація (приміщення)
            </label>
            <input
              type="text"
              placeholder="напр. Актова зала"
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              required
              className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-xs font-semibold text-gray-850 dark:text-gray-200 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 px-1">
              Дата заходу
            </label>
            <button
              type="button"
              onClick={() => {
                setPickerMonth(selectedMonthIdx);
                setPickerYear(selectedYear);
                setIsDatePickerOpen(true);
              }}
              className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-xs font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm cursor-pointer flex items-center justify-between hover:border-[#FF5522]/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-[#FF5522]" />
                <span>{formattedDateTitle}</span>
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-550 uppercase tracking-widest mb-1.5 px-1">
            Кількість потрібних волонтерів
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFormMaxVolunteers(prev => Math.max(1, (parseInt(prev) || 1) - 1))}
              className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 font-black text-lg flex items-center justify-center transition-all active:scale-90 border border-gray-200 dark:border-zinc-700 shrink-0 cursor-pointer"
              title="Зменшити"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max="999"
              value={formMaxVolunteers}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setFormMaxVolunteers('');
                } else {
                  const parsed = parseInt(val, 10);
                  if (!isNaN(parsed)) {
                    setFormMaxVolunteers(Math.max(1, Math.min(999, parsed)));
                  }
                }
              }}
              onBlur={() => {
                if (!formMaxVolunteers || parseInt(formMaxVolunteers, 10) < 1) {
                  setFormMaxVolunteers(1);
                }
              }}
              required
              className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-center text-sm font-black text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm"
            />
            <button
              type="button"
              onClick={() => setFormMaxVolunteers(prev => Math.min(999, (parseInt(prev) || 0) + 1))}
              className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 font-black text-lg flex items-center justify-center transition-all active:scale-90 border border-gray-200 dark:border-zinc-700 shrink-0 cursor-pointer"
              title="Збільшити"
            >
              +
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 px-1">
            Фізична адреса (Одеса)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="вул. Канатна, 15"
              value={formAddress}
              onChange={(e) => setFormAddress(e.target.value)}
              onBlur={handleAddressBlur}
              required
              className="flex-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-xs font-semibold text-gray-850 dark:text-gray-200 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowCreateMapPicker(!showCreateMapPicker)}
              className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0 ${
                showCreateMapPicker
                  ? 'bg-[#FF5522] dark:bg-orange-500 border-transparent text-white shadow-md'
                  : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 dark:hover:text-white shadow-sm'
              }`}
              title="Вибрати на карті"
            >
              <MapPin size={15} />
              <span>{showCreateMapPicker ? "Сховати карту" : "Мапа"}</span>
            </button>
          </div>

          {showCreateMapPicker && (
            <div className="mt-3 bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-inner overflow-hidden animate-fadeIn">
              <div
                id="address-picker-map"
                className="w-full h-[180px] rounded-xl z-0"
                style={{ minHeight: '180px' }}
              ></div>
              <p className="text-[9px] text-gray-400 dark:text-zinc-500 mt-2 font-semibold text-center leading-relaxed">
                Перетягніть маркер або клікніть на карту в Одесі, щоб автоматично обрати адресу
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 px-1">
            Опис / Задачі
          </label>
          <textarea
            rows="3"
            placeholder="Ключові обов'язки волонтера..."
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm resize-none"
          ></textarea>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={handleSaveAsTemplate}
            className="flex-1 py-4 bg-orange-50 hover:bg-orange-100/80 dark:bg-zinc-900 dark:hover:bg-zinc-950 text-[#FF5522] dark:text-orange-400 border border-orange-200/40 dark:border-zinc-800/80 font-extrabold rounded-full shadow-sm text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Save size={14} />
            <span>Зберегти як шаблон</span>
          </button>

          <button
            type="submit"
            className="flex-[2] py-4 bg-[#FF5522] hover:bg-[#FF5522]/90 dark:bg-orange-500 dark:hover:bg-orange-600 text-white dark:text-white font-extrabold rounded-full shadow-md text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
          >
            + ОПУБЛІКУВАТИ ЗАХІД
          </button>
        </div>
      </form>

      {/* Custom B2B DatePicker Modal via React Portal */}
      {isDatePickerOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-[#18181B] text-gray-900 dark:text-zinc-100 rounded-3xl p-5 w-full max-w-xs sm:max-w-sm shadow-2xl border border-gray-200 dark:border-zinc-800 animate-scaleUp text-left">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="font-black text-base flex items-center gap-2">
                <Calendar size={16} className="text-[#FF5522]" />
                <span>Оберіть дату заходу</span>
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
                {monthsUkFull[pickerMonth]} {pickerYear}
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
                const isToday = dateStr === nowStr;

                return (
                  <button
                    key={dateStr}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => {
                      if (!isAvailable) return;
                      setSelectedDateStr(dateStr);
                      setIsDatePickerOpen(false);
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
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => {
                  setSelectedDateStr(nowStr);
                  setIsDatePickerOpen(false);
                }}
                className="font-bold text-[#FF5522] dark:text-orange-400 hover:underline cursor-pointer"
              >
                Обрати сьогодні
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {isNamingTemplate && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 max-w-md w-full border border-gray-200 dark:border-zinc-800 shadow-2xl relative text-left">
            <h3 className="text-base font-black text-gray-950 dark:text-zinc-200 mb-2">
              Зберегти як шаблон
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium mb-4">
              Введіть зрозумілу назву шаблону (напр. Чергування в приймальній комісії):
            </p>
            
            <input
              type="text"
              autoFocus
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="напр. Чергування в приймальній комісії"
              className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs font-semibold text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm mb-5"
            />
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsNamingTemplate(false)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 font-extrabold text-[10px] rounded-xl uppercase tracking-wider transition-all active:scale-95 cursor-pointer text-center"
              >
                Скасувати
              </button>
              <button
                type="button"
                onClick={() => {
                  if (templateName.trim()) {
                    onCreateTemplate(templateName.trim());
                    setIsNamingTemplate(false);
                  }
                }}
                disabled={!templateName.trim()}
                className="flex-1 py-3 bg-[#FF5522] hover:bg-[#FF5522]/90 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-extrabold text-[10px] rounded-xl uppercase tracking-wider transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center"
              >
                Зберегти
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {titleAlertMessage && createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] p-4 animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 max-w-md w-full border border-gray-200 dark:border-zinc-800 shadow-2xl relative text-left">
            <h3 className="text-base font-black text-gray-950 dark:text-zinc-200 mb-2">
              Увага
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium mb-5 leading-relaxed">
              {titleAlertMessage}
            </p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setTitleAlertMessage('')}
                className="px-6 py-3 bg-[#FF5522] hover:bg-[#FF5522]/90 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-extrabold text-[10px] rounded-xl uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
              >
                Зрозуміло
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
