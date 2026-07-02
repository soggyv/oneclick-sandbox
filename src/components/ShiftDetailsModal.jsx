import React from 'react';
import { ArrowLeft, Building2, Clock, MapPin, Info, User } from 'lucide-react';

export default function ShiftDetailsModal({
  shift,
  onClose,
  currentRole,
  bookedShifts,
  handleApplyShift
}) {
  if (!shift) return null;

  return (
    <div className="w-full min-h-screen bg-slate-900/40 py-4 flex items-center justify-center relative">
      <div className="w-full max-w-[450px] min-h-screen bg-[#f5f5f7] relative pb-8 text-[#111111] overflow-x-hidden border border-gray-200 shadow-2xl flex flex-col justify-between">
        
        <div>
          <div className="w-full bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-50 flex items-center justify-between">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-black text-gray-700 hover:text-black transition-all active:scale-95 py-1.5 px-3 rounded-full bg-gray-50 border border-gray-100 shadow-sm"
            >
              <ArrowLeft size={14} className="text-[#FF5522]" />
              <span>Назад</span>
            </button>
            <span className="text-xs font-extrabold text-gray-800 uppercase tracking-widest">
              Деталі заходу
            </span>
            <div className="w-16"></div>
          </div>

          <div className="p-5 space-y-5 text-left">
            <div className="flex justify-between items-start">
              <span className="px-3 py-1 bg-yellow-100 text-black text-[10px] font-extrabold rounded-full tracking-wider uppercase">
                {shift.category}
              </span>
            </div>

            <div>
              <h1 className="text-xl font-black text-gray-900 leading-snug mb-1">
                {shift.title}
              </h1>
              <p className="text-xs text-gray-400 font-bold flex items-center gap-1">
                <Building2 size={13} className="text-gray-300" />
                <span>Організація: {shift.organization_name || shift.business}</span>
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Опис завдання
              </h3>
              <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                {shift.description || "Допомога у координації події."}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-[#FFCC00]" />
                <span>Час роботи: <strong className="text-gray-900">{shift.time}</strong> ({shift.date})</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-gray-400" />
                <span>Локація: <strong className="text-gray-900">{shift.location}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Info size={15} className="text-blue-400" />
                <span>Адреса: <strong className="text-gray-900">{shift.address}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <User size={15} className="text-green-500" />
                <span>Статус місць: <strong className="text-gray-900">{(shift.approved_count || 0) >= shift.max_volunteers ? "Зайнято" : "Вільне місце"}</strong></span>
              </div>
            </div>

            <div className="bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
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
                className="w-full h-[180px] border-none rounded-xl"
                title="Shift Details Map"
              ></iframe>
            </div>
          </div>
        </div>

        {currentRole === 'B2C' && (() => {
          const existingApp = bookedShifts.find(app => app.shift_id === shift.id || app.shift?.id === shift.id);
          if (existingApp) {
            let btnText = "Ви вже відгукнулися";
            let btnClass = "bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed";

            if (existingApp.status === 'pending') {
              btnText = "Заявка на розгляді";
              btnClass = "bg-orange-50 text-orange-600 border border-orange-200 cursor-not-allowed font-extrabold";
            } else if (existingApp.status === 'approved') {
              btnText = "Схвалено (Очікує зміну)";
              btnClass = "bg-blue-50 text-blue-600 border border-blue-200 cursor-not-allowed font-extrabold";
            } else if (existingApp.status === 'attended' || existingApp.status === 'reviewed') {
              btnText = "Зміна завершена";
              btnClass = "bg-green-50 text-green-600 border border-green-200 cursor-not-allowed font-extrabold";
            } else if (existingApp.status === 'rejected') {
              btnText = "Відхилено";
              btnClass = "bg-red-50 text-red-600 border border-red-200 cursor-not-allowed font-extrabold";
            }

            return (
              <div className="p-4 bg-white border-t border-gray-100">
                <button
                  disabled
                  className={`w-full py-4 rounded-full text-sm flex items-center justify-center gap-1.5 ${btnClass}`}
                >
                  <span>{btnText}</span>
                </button>
              </div>
            );
          }

          // No existing application: show normal sign up flow
          if ((shift.approved_count || 0) >= shift.max_volunteers) {
            return (
              <div className="p-4 bg-white border-t border-gray-100">
                <button
                  disabled
                  className="w-full py-4 bg-gray-250 text-gray-400 font-bold rounded-full shadow-inner text-sm cursor-not-allowed flex items-center justify-center gap-1.5 border border-gray-200"
                >
                  <span>Вільних місць немає</span>
                </button>
              </div>
            );
          }

          return (
            <div className="p-4 bg-white border-t border-gray-100">
              <button
                onClick={() => handleApplyShift(shift)}
                className="w-full py-4 bg-[#FF5522] hover:bg-[#FF5522]/90 text-white font-bold rounded-full shadow-md text-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Відгукнутися на захід</span>
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
