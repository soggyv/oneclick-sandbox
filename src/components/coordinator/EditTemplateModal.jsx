import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import TimePickerModal from '../TimePickerModal';

export default function EditTemplateModal({
  isOpen,
  onClose,
  template,
  onSave
}) {
  const [editName, setEditName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [tempStartHour, setTempStartHour] = useState('09');
  const [tempStartMin, setTempStartMin] = useState('00');
  const [tempEndHour, setTempEndHour] = useState('18');
  const [tempEndMin, setTempEndMin] = useState('00');

  const [isClosing, setIsClosing] = useState(false);

  // Sync state when template changes
  useEffect(() => {
    if (template) {
      setEditName(template.name || '');
      setEditTitle(template.title || '');
      setEditCategory(template.category || '');
      setEditTime(template.time || '');
      setEditLocation(template.location || '');
      setEditAddress(template.address || '');
      setEditDescription(template.description || '');

      const times = (template.time || '09:00 - 18:00').split(' - ');
      const start = times[0] || '09:00';
      const end = times[1] || '18:00';
      setTempStartHour(start.split(':')[0] || '09');
      setTempStartMin(start.split(':')[1] || '00');
      setTempEndHour(end.split(':')[0] || '18');
      setTempEndMin(end.split(':')[1] || '00');
    }
  }, [template, isOpen]);

  if (!isOpen || !template) return null;

  const handleClose = (action) => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      if (action) action();
      else onClose();
    }, 210);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleClose(() => {
      onSave(template.id, {
        name: editName,
        title: editTitle,
        category: editCategory,
        time: editTime,
        location: editLocation,
        address: editAddress,
        description: editDescription
      });
    });
  };

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto ${isClosing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop-in'}`}
      onClick={() => handleClose()}
    >
      <div
        className={`bg-white dark:bg-zinc-900 rounded-[32px] w-full max-w-lg p-6 md:p-8 shadow-2xl relative text-left ${isClosing ? 'animate-modal-card-out' : 'animate-modal-card-in'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-black text-gray-900 dark:text-zinc-100 mb-1">Редагувати шаблон</h2>
        <p className="text-[10px] text-gray-400 dark:text-zinc-400 font-bold uppercase tracking-wider mb-5">
          Оновлення збережених даних шаблону
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1 px-1">
              Назва шаблону (для списку)
            </label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-850 dark:text-zinc-100 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522]"
            />
          </div>

          <div>
            <label className="block text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1 px-1">
              Назва заходу / Завдання
            </label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-850 dark:text-zinc-100 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1 px-1">
                Напрямок
              </label>
              <input
                type="text"
                required
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-850 dark:text-zinc-100 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522]"
              />
            </div>

            <div
              onClick={() => {
                const times = (editTime || '09:00 - 18:00').split(' - ');
                const start = times[0] || '09:00';
                const end = times[1] || '18:00';
                setTempStartHour(start.split(':')[0] || '09');
                setTempStartMin(start.split(':')[1] || '00');
                setTempEndHour(end.split(':')[0] || '18');
                setTempEndMin(end.split(':')[1] || '00');
                setIsTimePickerOpen(true);
              }}
              className="cursor-pointer"
            >
              <label className="block text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1 px-1 cursor-pointer">
                Години роботи
              </label>
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 shadow-sm hover:border-[#FF5522]/50 transition-colors">
                <Clock size={12} className="text-gray-400 dark:text-zinc-550" />
                <span className="text-xs font-semibold text-gray-850 dark:text-zinc-200">
                  {editTime || '09:00 - 18:00'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1 px-1">
                Локація (приміщення)
              </label>
              <input
                type="text"
                required
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-850 dark:text-zinc-100 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522]"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1 px-1">
                Фізична адреса
              </label>
              <input
                type="text"
                required
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-850 dark:text-zinc-100 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1 px-1">
              Опис / Задачі
            </label>
            <textarea
              rows="4"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-850 dark:text-zinc-100 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] resize-none"
            ></textarea>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleClose()}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 dark:hover:text-white font-extrabold rounded-2xl text-xs tracking-wider uppercase transition-all cursor-pointer text-center"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-[#FF5522] hover:bg-[#FF5522]/90 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-extrabold rounded-2xl text-xs tracking-wider uppercase transition-all cursor-pointer text-center"
            >
              Зберегти
            </button>
          </div>
        </form>
      </div>
      <TimePickerModal
        isOpen={isTimePickerOpen}
        tempStartHour={tempStartHour}
        setTempStartHour={setTempStartHour}
        tempStartMin={tempStartMin}
        setTempStartMin={setTempStartMin}
        tempEndHour={tempEndHour}
        setTempEndHour={setTempEndHour}
        tempEndMin={tempEndMin}
        setTempEndMin={setTempEndMin}
        onClose={() => setIsTimePickerOpen(false)}
        onConfirm={() => {
          setEditTime(`${tempStartHour}:${tempStartMin} - ${tempEndHour}:${tempEndMin}`);
          setIsTimePickerOpen(false);
        }}
      />
    </div>
  );
}
