import React, { useState } from 'react';
import { ArrowLeft, Building2, Clock, MapPin, Info, User, Phone, Check } from 'lucide-react';

export function ShiftActionButton({ shift, currentRole, bookedShifts = [], handleApplyShift }) {
  if (currentRole !== 'B2C' || !shift) return null;

  const existingApp = (bookedShifts || []).find(
    app => app.shift_id === shift.id || app.shift?.id === shift.id
  );

  if (existingApp) {
    let btnText = "Ви вже відгукнулися";
    let btnClass = "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 border border-gray-200 dark:border-transparent cursor-not-allowed";

    if (existingApp.status === 'pending') {
      btnText = "Заявка на розгляді";
      btnClass = "bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-transparent cursor-not-allowed font-black";
    } else if (existingApp.status === 'approved') {
      btnText = "Схвалено (Очікує зміну)";
      btnClass = "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-transparent cursor-not-allowed font-black";
    } else if (existingApp.status === 'attended' || existingApp.status === 'reviewed') {
      btnText = "Зміна завершена";
      btnClass = "bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-transparent cursor-not-allowed font-black";
    } else if (existingApp.status === 'rejected') {
      btnText = "Відхилено";
      btnClass = "bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-transparent cursor-not-allowed font-black";
    }

    return (
      <button
        disabled
        className={`w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 ${btnClass}`}
      >
        <span>{btnText}</span>
      </button>
    );
  }

  if ((shift.approved_count || 0) >= shift.max_volunteers) {
    return (
      <button
        disabled
        className="w-full py-3.5 bg-gray-200 dark:bg-zinc-800 text-gray-400 dark:text-zinc-500 font-black uppercase tracking-wider rounded-2xl text-xs sm:text-sm cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span>Вільних місць немає</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => handleApplyShift(shift)}
      className="w-full py-3.5 bg-[#FF5522] hover:bg-[#FF5522]/90 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-extrabold uppercase tracking-wider rounded-2xl shadow-md text-xs sm:text-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
    >
      <span>Відгукнутися на захід</span>
    </button>
  );
}

export default function ShiftDetailsModal({
  shift,
  onClose,
  currentRole,
  bookedShifts = [],
  handleApplyShift
}) {
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!shift) return null;

  const handlePhoneClick = (e) => {
    e.preventDefault();
    if (!shift?.contact_phone) return;
    const clean = shift.contact_phone.replace(/[^0-9+]/g, '');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(clean).catch(() => {});
    }

    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);

    window.location.href = `tel:${clean}`;
  };

  const mapIframe = (
    <iframe
      src={`https://maps.google.com/maps?q=${encodeURIComponent(
        (() => {
          const addr = shift.address || '';
          if (!addr) return 'Одеса, Україна';
          if (addr.toLowerCase().includes('одеса') || addr.toLowerCase().includes('odesa')) {
            return addr;
          }
          return `${addr}, Одеса, Україна`;
        })()
      )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
      className="w-full h-full border-none dark:invert-[90%] dark:hue-rotate-180"
      title="Shift Details Map"
    ></iframe>
  );

  return (
    <div className="animate-fadeIn max-w-5xl mx-auto text-left pb-24 lg:pb-10 relative">
      {/* Back Navigation Bar */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#27272A] border border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-zinc-200 hover:border-[#FF5522] dark:hover:border-[#FF5522] text-xs font-black transition-all active:scale-95 shadow-sm cursor-pointer"
        >
          <ArrowLeft size={15} className="text-[#FF5522]" />
          <span>Назад до списку заходів</span>
        </button>

        <span className="px-3.5 py-1.5 bg-yellow-100 dark:bg-[#F97316]/20 text-yellow-800 dark:text-[#F97316] text-[10px] font-extrabold rounded-full tracking-wider uppercase">
          {shift.category}
        </span>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Column (PC: Title, Description, Map) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Header Card */}
          <div className="bg-white dark:bg-[#27272A] rounded-3xl p-6 sm:p-7 border border-gray-100 dark:border-transparent shadow-sm">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-zinc-100 leading-snug mb-3">
              {shift.title}
            </h1>
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-zinc-400">
              <Building2 size={16} className="text-[#FF5522]" />
              <span>Організація: <strong className="text-gray-900 dark:text-zinc-200">{shift.organization_name || shift.business}</strong></span>
            </div>
          </div>

          {/* Description Card */}
          <div className="bg-white dark:bg-[#27272A] rounded-3xl p-6 sm:p-7 border border-gray-100 dark:border-transparent shadow-sm flex-1">
            <h3 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3">
              Опис завдання та обов'язки
            </h3>
            <p className="text-gray-700 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed font-semibold whitespace-pre-line">
              {shift.description || "Допомога у координації події."}
            </p>
          </div>

          {/* Map Card (Desktop view: below description) */}
          <div className="hidden lg:block bg-white dark:bg-[#27272A] rounded-3xl p-4 sm:p-5 border border-gray-100 dark:border-transparent shadow-sm">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
                Карта розташування
              </h3>
              <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400">
                {shift.location}
              </span>
            </div>
            <div className="rounded-2xl overflow-hidden h-[240px] border border-gray-100 dark:border-zinc-800">
              {mapIframe}
            </div>
          </div>
        </div>

        {/* Right Column / Mobile Middle: Details Card */}
        <div className="lg:col-span-1 flex flex-col">
          <div className="bg-white dark:bg-[#27272A] rounded-3xl p-6 border border-gray-100 dark:border-transparent shadow-sm h-full flex flex-col justify-between">
            <div className="h-full flex flex-col justify-between">
              <h3 className="text-xs font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest pb-3.5 border-b border-gray-100 dark:border-zinc-800">
                Деталі проведення
              </h3>

              <div className="flex-1 flex flex-col justify-between py-4 space-y-4 lg:space-y-0">
                {/* Time & Date */}
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center shrink-0 border border-orange-100/50 dark:border-transparent">
                    <Clock size={20} className="text-[#FF5522]" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">Час та дата</span>
                    <span className="text-sm font-black text-gray-900 dark:text-zinc-100 block leading-tight">{shift.time}</span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">({shift.date})</span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-3.5 border-t border-gray-100 dark:border-zinc-800/80 pt-3.5 lg:border-t-0 lg:pt-0">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center shrink-0 border border-purple-100/50 dark:border-transparent">
                    <MapPin size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">Локація</span>
                    <span className="text-sm font-black text-gray-900 dark:text-zinc-100 block leading-tight">{shift.location}</span>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-center gap-3.5 border-t border-gray-100 dark:border-zinc-800/80 pt-3.5 lg:border-t-0 lg:pt-0">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center shrink-0 border border-blue-100/50 dark:border-transparent">
                    <Info size={20} className="text-blue-500 dark:text-blue-400" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">Фізична адреса</span>
                    <span className="text-sm font-black text-gray-900 dark:text-zinc-100 block leading-tight">{shift.address}</span>
                  </div>
                </div>

                {/* Phone */}
                {shift.contact_phone && (
                  <a
                    href={`tel:${shift.contact_phone.replace(/[^0-9+]/g, '')}`}
                    onClick={handlePhoneClick}
                    className="flex items-center gap-3.5 border-t border-gray-100 dark:border-zinc-800/80 pt-3.5 lg:border-t-0 lg:pt-0 group cursor-pointer hover:opacity-90 transition-all"
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
                      copiedPhone 
                        ? 'bg-green-50 dark:bg-green-950/40 border-green-200 text-green-500' 
                        : 'bg-orange-50 dark:bg-orange-950/30 border-orange-100/50 dark:border-transparent text-orange-500 group-hover:scale-105'
                    }`}>
                      {copiedPhone ? <Check size={20} className="text-green-500 animate-bounce" /> : <Phone size={20} />}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">
                          Телефон для довідок
                        </span>
                        {copiedPhone && (
                          <span className="text-[10px] font-extrabold text-green-600 dark:text-green-400 animate-pulse">
                            Скопійовано!
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-black text-[#FF5522] group-hover:underline block leading-tight">
                        {shift.contact_phone}
                      </span>
                    </div>
                  </a>
                )}

                {/* Availability */}
                <div className="flex items-center gap-3.5 border-t border-gray-100 dark:border-zinc-800/80 pt-3.5 lg:border-t-0 lg:pt-0">
                  <div className="w-10 h-10 rounded-2xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center shrink-0 border border-green-100/50 dark:border-transparent">
                    <User size={20} className="text-green-500 dark:text-green-400" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider block">Доступність місць</span>
                    <span className="text-sm font-black text-gray-900 dark:text-zinc-100 block leading-tight">
                      {(shift.approved_count || 0) >= shift.max_volunteers ? "Місць немає" : `Вільні місця (${shift.approved_count || 0} / ${shift.max_volunteers})`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop Action Button anchored at bottom of card */}
              <div className="hidden lg:block pt-4 border-t border-gray-100 dark:border-zinc-800 mt-4">
                <ShiftActionButton
                  shift={shift}
                  currentRole={currentRole}
                  bookedShifts={bookedShifts}
                  handleApplyShift={handleApplyShift}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Map Card (Mobile view: shown after Details Card) */}
        <div className="block lg:hidden bg-white dark:bg-[#27272A] rounded-3xl p-4 sm:p-5 border border-gray-100 dark:border-transparent shadow-sm">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
              Карта розташування
            </h3>
            <span className="text-[11px] font-bold text-gray-500 dark:text-zinc-400">
              {shift.location}
            </span>
          </div>
          <div className="rounded-2xl overflow-hidden h-[220px] border border-gray-100 dark:border-zinc-800">
            {mapIframe}
          </div>
        </div>

      </div>
    </div>
  );
}
