import React, { useState } from 'react';
import { Calendar, Trash2, Layers, MapPin, Clock, ArrowRight, Pencil, Search, ChevronDown, ChevronUp } from 'lucide-react';

export default function ShiftTemplatesList({
  shiftTemplates,
  deleteTemplate,
  onEditTemplate,
  onSelectTemplate
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState({});

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm("Ви дійсно бажаєте видалити цей шаблон?")) {
      deleteTemplate(id);
    }
  };

  const handleEdit = (template, e) => {
    e.stopPropagation();
    onEditTemplate(template);
  };

  const toggleExpand = (id) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter templates based on query
  const filteredTemplates = (shiftTemplates || []).filter(t => 
    (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.category || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fadeIn text-left">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-gray-200">Шаблони заходів</h1>
          <p className="text-[10px] text-gray-400 dark:text-gray-555 font-bold uppercase tracking-wider">
            Керування шаблонами для швидкого створення завдань волонтерам
          </p>
        </div>

        {shiftTemplates.length > 0 && (
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Пошук шаблону..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm"
            />
          </div>
        )}
      </div>

      {shiftTemplates.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-gray-100 dark:border-transparent p-10 text-center shadow-sm max-w-lg mx-auto mt-10">
          <div className="w-16 h-16 bg-orange-50 dark:bg-orange-950/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Layers size={28} className="text-[#FF5522] dark:text-orange-500" />
          </div>
          <h3 className="text-sm font-black text-gray-800 dark:text-zinc-200 mb-1">Немає створених шаблонів</h3>
          <p className="text-xs text-gray-450 dark:text-zinc-450 leading-relaxed px-4">
            Ви можете зберегти поточну форму як шаблон прямо під час створення нового заходу. Це дозволить заповнювати опис, адресу та локацію в один клік!
          </p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-gray-100 dark:border-transparent p-10 text-center shadow-sm max-w-lg mx-auto mt-6">
          <h3 className="text-sm font-black text-gray-800 dark:text-zinc-200 mb-1">Нічого не знайдено</h3>
          <p className="text-xs text-gray-450 dark:text-zinc-450 leading-relaxed px-4">
            Спробуйте змінити запит або очистити рядок пошуку.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-zinc-800 rounded-3xl border border-gray-100 dark:border-transparent p-5 shadow-sm hover:shadow-md dark:shadow-black/10 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div>
                    <span className="text-[8px] bg-orange-100 dark:bg-orange-950/40 text-[#FF5522] dark:text-orange-400 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider block w-fit mb-1.5">
                      Шаблон
                    </span>
                    <h3 className="text-sm font-black text-gray-900 dark:text-zinc-100 leading-tight">
                      {template.name}
                    </h3>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={(e) => handleEdit(template, e)}
                      className="p-2 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/20 dark:hover:bg-orange-950/40 text-[#FF5522] dark:text-orange-400 rounded-xl transition-all cursor-pointer active:scale-95"
                      title="Редагувати шаблон"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(template.id, e)}
                      className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-500 dark:text-red-400 rounded-xl transition-all cursor-pointer active:scale-95"
                      title="Видалити шаблон"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Body Details */}
                <div className="space-y-2.5 my-4 border-t border-b border-gray-100 dark:border-zinc-700/60 py-3.5">
                  <div className="flex items-start gap-2">
                    <span className="text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider shrink-0 w-24">
                      Завдання:
                    </span>
                    <span className="text-xs font-bold text-gray-800 dark:text-zinc-200">
                      {template.title}
                    </span>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider shrink-0 w-24">
                      Напрямок:
                    </span>
                    <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                      {template.category}
                    </span>
                  </div>

                  {expandedIds[template.id] && (
                    <div className="space-y-2.5 pt-2.5 border-t border-dashed border-gray-100 dark:border-zinc-700/60 animate-fadeIn">
                      <div className="flex items-start gap-2">
                        <span className="text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider shrink-0 w-24">
                          Години:
                        </span>
                        <span className="text-xs font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-1">
                          <Clock size={11} className="text-gray-400 dark:text-zinc-500" />
                          {template.time}
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider shrink-0 w-24">
                          Локація:
                        </span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                          {template.location}
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider shrink-0 w-24">
                          Адреса:
                        </span>
                        <span className="text-xs font-bold text-gray-800 dark:text-zinc-200 flex items-center gap-1">
                          <MapPin size={11} className="text-gray-400 dark:text-zinc-500" />
                          {template.address}
                        </span>
                      </div>

                      {template.description && (
                        <div className="flex flex-col gap-1 mt-2 bg-gray-50 dark:bg-zinc-900/50 p-2.5 rounded-2xl">
                          <span className="text-[8px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                            Опис / Задачі
                          </span>
                          <p className="text-[10px] font-semibold text-gray-600 dark:text-zinc-300 leading-normal whitespace-pre-line">
                            {template.description}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleExpand(template.id)}
                    className="text-[10px] font-black text-[#FF5522] dark:text-orange-400 hover:text-[#FF5522]/80 flex items-center gap-1 mt-2 cursor-pointer focus:outline-none transition-colors"
                  >
                    <span>{expandedIds[template.id] ? "Згорнути деталі" : "Показати всі деталі"}</span>
                    {expandedIds[template.id] ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </button>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectTemplate(template)}
                className="w-full mt-2 py-3 bg-[#FF5522] hover:bg-[#FF5522]/90 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-extrabold rounded-2xl shadow-sm text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 group-hover:shadow-md"
              >
                <span>Використати шаблон</span>
                <ArrowRight size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
