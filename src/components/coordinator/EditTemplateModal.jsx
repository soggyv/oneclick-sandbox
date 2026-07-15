import React, { useState, useEffect } from 'react';

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
    }
  }, [template, isOpen]);

  if (!isOpen || !template) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(template.id, {
      name: editName,
      title: editTitle,
      category: editCategory,
      time: editTime,
      location: editLocation,
      address: editAddress,
      description: editDescription
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-[32px] w-full max-w-lg p-6 md:p-8 shadow-2xl relative animate-scaleUp text-left">
        <h2 className="text-lg font-black text-gray-900 dark:text-gray-150 mb-1">Редагувати шаблон</h2>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-5">
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
              className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-850 dark:text-gray-250 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522]"
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
              className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-850 dark:text-gray-250 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522]"
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
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-850 dark:text-gray-255 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522]"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-1 px-1">
                Години роботи
              </label>
              <input
                type="text"
                required
                placeholder="напр. 09:00 - 18:00"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-850 dark:text-gray-255 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522]"
              />
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
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-850 dark:text-gray-250 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522]"
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
                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-850 dark:text-gray-250 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522]"
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
              className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-850 dark:text-gray-250 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] resize-none"
            ></textarea>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-gray-700 dark:text-zinc-350 font-extrabold rounded-2xl text-xs tracking-wider uppercase transition-all cursor-pointer text-center"
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
    </div>
  );
}
