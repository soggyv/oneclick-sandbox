import React from 'react';
import { Clock, MapPin } from 'lucide-react';

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
  setIsTimePickerOpen
}) {
  return (
    <div className="animate-fadeIn text-left">
      <div className="mb-5">
        <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-dark-text-header">Новий захід</h1>
        <p className="text-[10px] text-gray-400 dark:text-dark-text-muted font-bold uppercase tracking-wider">Опублікувати завдання для волонтерів</p>
      </div>

      <form onSubmit={handleCreateShift} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-gray-400 dark:text-dark-text-muted uppercase tracking-widest mb-1.5 px-1">
            Назва заходу / Завдання
          </label>
          <input
            type="text"
            placeholder="напр. Волонтер на кавовий лекторій"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
            className="w-full bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-xs font-semibold text-gray-800 dark:text-dark-text-header focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-dark-text-muted uppercase tracking-widest mb-1.5 px-1">
              Напрямок
            </label>
            <input
              type="text"
              placeholder="напр. IT-відділ"
              value={formSphere}
              onChange={(e) => setFormSphere(e.target.value)}
              required
              className="w-full bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-xs font-semibold text-gray-800 dark:text-dark-text-header focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm"
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
            <label className="block text-[10px] font-bold text-gray-400 dark:text-dark-text-muted uppercase tracking-widest mb-1.5 px-1 cursor-pointer">
              Години роботи
            </label>
            <div className="flex items-center gap-2 bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3.5 shadow-sm hover:border-[#FF5522]/50 transition-colors">
              <Clock size={14} className="text-gray-400 dark:text-dark-text-muted" />
              <span className="text-xs font-black text-gray-800 dark:text-dark-text-header">
                {startTime} — {endTime}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-dark-text-muted uppercase tracking-widest mb-1.5 px-1">
              Локація (приміщення)
            </label>
            <input
              type="text"
              placeholder="напр. Актова зала"
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              required
              className="w-full bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-xs font-semibold text-gray-800 dark:text-dark-text-header focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-dark-text-muted uppercase tracking-widest mb-1.5 px-1">
              Дата заходу
            </label>
            <select
              value={selectedDateStr}
              onChange={(e) => setSelectedDateStr(e.target.value)}
              className="w-full bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-xs font-semibold text-gray-800 dark:text-dark-text-header focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm"
            >
              {calendarDays.map(day => (
                <option key={day.dateStr} value={day.dateStr} className="bg-white dark:bg-dark-card text-gray-800 dark:text-dark-text-header">
                  {day.dayNum} ({day.weekday})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 dark:text-dark-text-muted uppercase tracking-widest mb-1.5 px-1">
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
              className="flex-1 bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-xs font-semibold text-gray-800 dark:text-dark-text-header focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowCreateMapPicker(!showCreateMapPicker)}
              className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0 ${
                showCreateMapPicker
                  ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                  : 'bg-white dark:bg-dark-bg border-gray-200 dark:border-dark-border text-gray-700 dark:text-dark-text-body hover:bg-gray-50 dark:hover:bg-dark-card-hover shadow-sm'
              }`}
              title="Вибрати на карті"
            >
              <MapPin size={15} />
              <span>{showCreateMapPicker ? "Сховати карту" : "Мапа"}</span>
            </button>
          </div>

          {showCreateMapPicker && (
            <div className="mt-3 bg-white dark:bg-dark-bg p-2 rounded-2xl border border-gray-150 dark:border-dark-border shadow-inner overflow-hidden animate-fadeIn">
              <div
                id="address-picker-map"
                className="w-full h-[180px] rounded-xl z-0"
                style={{ minHeight: '180px' }}
              ></div>
              <p className="text-[9px] text-gray-400 dark:text-dark-text-muted mt-2 font-semibold text-center leading-relaxed">
                Перетягніть маркер або клікніть на карту в Одесі, щоб автоматично обрати адресу
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-[10px] font-bold text-gray-400 dark:text-dark-text-muted uppercase tracking-widest mb-1.5 px-1">
            Опис / Задачі
          </label>
          <textarea
            rows="3"
            placeholder="Ключові обов'язки волонтера..."
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            className="w-full bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-xs font-semibold text-gray-800 dark:text-dark-text-header focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm resize-none"
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-[#FF5522] hover:bg-[#FF5522]/90 text-white font-extrabold rounded-full shadow-md text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
        >
          + ОПУБЛІКУВАТИ ЗАХІД
        </button>
      </form>
    </div>
  );
}
