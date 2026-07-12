import React from 'react';
import { Building2, Clock, Calendar } from 'lucide-react';

export default function BookedShiftsList({
  filteredB2CBookedShifts,
  activeB2CShiftsFilter,
  setActiveB2CShiftsFilter,
  setCurrentDetailsShift,
  showQrCodes,
  setShowQrCodes
}) {
  return (
    <div className="animate-fadeIn text-left">
      <div className="mb-5">
        <h1 className="text-xl font-black tracking-tight text-gray-900">Мої заходи</h1>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Список ваших запланованих робіт</p>
      </div>

      {/* Tabs Filter (АКТИВНІ / ЗАВЕРШЕНІ) */}
      <div className="flex border border-gray-100 mb-5 bg-white p-1 rounded-full shadow-sm">
        {["АКТИВНІ", "ЗАВЕРШЕНІ"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveB2CShiftsFilter(tab)}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-full transition-all duration-150 cursor-pointer text-center ${
              activeB2CShiftsFilter === tab
                ? 'bg-[#FF5522] text-white shadow-sm'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredB2CBookedShifts.length > 0 ? (
          filteredB2CBookedShifts.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden"
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full tracking-wider uppercase flex items-center gap-1 ${
                  app.status === 'attended' || app.status === 'reviewed'
                    ? 'bg-green-50 text-green-600'
                    : app.status === 'rejected'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-orange-50 text-orange-600'
                }`}>
                  {app.status === 'pending' && 'Очікує підтвердження'}
                  {app.status === 'approved' && 'Схвалено'}
                  {app.status === 'rejected' && 'Відхилено'}
                  {app.status === 'attended' && 'Відвідано'}
                  {app.status === 'reviewed' && 'Завершено (Оцінено)'}
                </span>
              </div>

              <h3
                onClick={() => setCurrentDetailsShift(app.shift)}
                className="font-black text-gray-900 text-sm leading-snug mb-2 cursor-pointer hover:underline"
              >
                {app.shift.title}
              </h3>

              <div className="space-y-1 mb-4 text-[11px] text-gray-500 font-semibold">
                <p className="flex items-center gap-1.5">
                  <Building2 size={12} className="text-gray-300" />
                  <span>Організація: {app.shift.organization_name}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock size={12} className="text-gray-300" />
                  <span>Час: {app.shift.time} ({app.shift.date})</span>
                </p>
              </div>

              {app.status === 'approved' && (
                <div className="mt-3.5 space-y-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowQrCodes(prev => ({ ...prev, [app.id]: !prev[app.id] }));
                    }}
                    className="w-full py-2 bg-orange-50 border border-orange-100 hover:bg-orange-100/50 text-[#FF5522] font-bold text-[10px] rounded-full uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>{showQrCodes[app.id] ? "Приховати код підтвердження" : "Показати код підтвердження"}</span>
                  </button>

                  {showQrCodes[app.id] && (
                    <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3.5 text-center animate-fadeIn">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                        Код для підтвердження присутності
                      </p>
                      <span className="text-base font-black text-gray-900 tracking-widest select-all">
                        {app.check_in_code}
                      </span>
                      <p className="text-[9px] text-gray-400 mt-1 font-semibold leading-relaxed">
                        Покажіть цей код організатору при зустрічі, щоб підтвердити свою присутність на події.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-3">
              <Calendar size={20} />
            </div>
            <h4 className="font-bold text-gray-800 text-xs mb-1">
              {activeB2CShiftsFilter === 'АКТИВНІ' ? 'Немає запланованих заходів' : 'Немає завершених заходів'}
            </h4>
            <p className="text-[10px] text-gray-400 max-w-[180px] leading-relaxed">
              {activeB2CShiftsFilter === 'АКТИВНІ'
                ? 'Ви ще не відгукнулися на жодне активне волонтерське завдання.'
                : 'У вас поки що немає відвіданих або завершених заходів.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
