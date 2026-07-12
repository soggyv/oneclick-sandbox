import React from 'react';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';

export default function TimePickerModal({
  isOpen,
  tempStartHour,
  setTempStartHour,
  tempStartMin,
  setTempStartMin,
  tempEndHour,
  setTempEndHour,
  tempEndMin,
  setTempEndMin,
  onClose,
  onConfirm
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-[340px] p-6 shadow-2xl animate-scaleUp text-left flex flex-col">
        <div className="flex items-center gap-2 mb-4 text-[#FF5522]">
          <Clock size={16} />
          <h3 className="text-xs font-black uppercase tracking-wider">
            Оберіть години роботи
          </h3>
        </div>

        <div className="space-y-6">
          {/* Start Time block */}
          <div>
            <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
              Час початку зміни
            </span>
            <div className="flex items-center justify-center gap-3">
              {/* Start Hour */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    let num = parseInt(tempStartHour, 10) || 0;
                    num = num >= 23 ? 0 : num + 1;
                    setTempStartHour(String(num).padStart(2, '0'));
                  }}
                  className="text-gray-400 hover:text-[#FF5522] p-1 transition-colors active:scale-125"
                >
                  <ChevronUp size={18} />
                </button>
                <input
                  type="text"
                  maxLength={2}
                  value={tempStartHour}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '');
                    if (clean === '') {
                      setTempStartHour('');
                      return;
                    }
                    let num = parseInt(clean, 10);
                    if (num > 23) num = 23;
                    setTempStartHour(String(num).padStart(2, '0'));
                  }}
                  onBlur={() => {
                    if (tempStartHour === '') {
                      setTempStartHour('09');
                    } else {
                      setTempStartHour(String(parseInt(tempStartHour, 10) || 0).padStart(2, '0'));
                    }
                  }}
                  className="w-16 h-14 bg-orange-50/50 text-[#FF5522] font-black text-2xl text-center rounded-2xl border border-orange-200/55 focus:outline-none focus:border-[#FF5522] focus:bg-orange-50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    let num = parseInt(tempStartHour, 10) || 0;
                    num = num <= 0 ? 23 : num - 1;
                    setTempStartHour(String(num).padStart(2, '0'));
                  }}
                  className="text-gray-400 hover:text-[#FF5522] p-1 transition-colors active:scale-125"
                >
                  <ChevronDown size={18} />
                </button>
              </div>

              <span className="text-[#FF5522] font-black text-2xl pb-6">:</span>

              {/* Start Minute */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    let num = parseInt(tempStartMin, 10) || 0;
                    num = num >= 59 ? 0 : num + 1;
                    setTempStartMin(String(num).padStart(2, '0'));
                  }}
                  className="text-gray-400 hover:text-[#FF5522] p-1 transition-colors active:scale-125"
                >
                  <ChevronUp size={18} />
                </button>
                <input
                  type="text"
                  maxLength={2}
                  value={tempStartMin}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '');
                    if (clean === '') {
                      setTempStartMin('');
                      return;
                    }
                    let num = parseInt(clean, 10);
                    if (num > 59) num = 59;
                    setTempStartMin(String(num).padStart(2, '0'));
                  }}
                  onBlur={() => {
                    if (tempStartMin === '') {
                      setTempStartMin('00');
                    } else {
                      setTempStartMin(String(parseInt(tempStartMin, 10) || 0).padStart(2, '0'));
                    }
                  }}
                  className="w-16 h-14 bg-orange-50/50 text-[#FF5522] font-black text-2xl text-center rounded-2xl border border-orange-200/55 focus:outline-none focus:border-[#FF5522] focus:bg-orange-50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    let num = parseInt(tempStartMin, 10) || 0;
                    num = num <= 0 ? 59 : num - 1;
                    setTempStartMin(String(num).padStart(2, '0'));
                  }}
                  className="text-gray-400 hover:text-[#FF5522] p-1 transition-colors active:scale-125"
                >
                  <ChevronDown size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* End Time block */}
          <div>
            <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
              Час закінчення зміни
            </span>
            <div className="flex items-center justify-center gap-3">
              {/* End Hour */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    let num = parseInt(tempEndHour, 10) || 0;
                    num = num >= 23 ? 0 : num + 1;
                    setTempEndHour(String(num).padStart(2, '0'));
                  }}
                  className="text-gray-400 hover:text-[#FF5522] p-1 transition-colors active:scale-125"
                >
                  <ChevronUp size={18} />
                </button>
                <input
                  type="text"
                  maxLength={2}
                  value={tempEndHour}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '');
                    if (clean === '') {
                      setTempEndHour('');
                      return;
                    }
                    let num = parseInt(clean, 10);
                    if (num > 23) num = 23;
                    setTempEndHour(String(num).padStart(2, '0'));
                  }}
                  onBlur={() => {
                    if (tempEndHour === '') {
                      setTempEndHour('18');
                    } else {
                      setTempEndHour(String(parseInt(tempEndHour, 10) || 0).padStart(2, '0'));
                    }
                  }}
                  className="w-16 h-14 bg-orange-50/50 text-[#FF5522] font-black text-2xl text-center rounded-2xl border border-orange-200/55 focus:outline-none focus:border-[#FF5522] focus:bg-orange-50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    let num = parseInt(tempEndHour, 10) || 0;
                    num = num <= 0 ? 23 : num - 1;
                    setTempEndHour(String(num).padStart(2, '0'));
                  }}
                  className="text-gray-400 hover:text-[#FF5522] p-1 transition-colors active:scale-125"
                >
                  <ChevronDown size={18} />
                </button>
              </div>

              <span className="text-[#FF5522] font-black text-2xl pb-6">:</span>

              {/* End Minute */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => {
                    let num = parseInt(tempEndMin, 10) || 0;
                    num = num >= 59 ? 0 : num + 1;
                    setTempEndMin(String(num).padStart(2, '0'));
                  }}
                  className="text-gray-400 hover:text-[#FF5522] p-1 transition-colors active:scale-125"
                >
                  <ChevronUp size={18} />
                </button>
                <input
                  type="text"
                  maxLength={2}
                  value={tempEndMin}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '');
                    if (clean === '') {
                      setTempEndMin('');
                      return;
                    }
                    let num = parseInt(clean, 10);
                    if (num > 59) num = 59;
                    setTempEndMin(String(num).padStart(2, '0'));
                  }}
                  onBlur={() => {
                    if (tempEndMin === '') {
                      setTempEndMin('00');
                    } else {
                      setTempEndMin(String(parseInt(tempEndMin, 10) || 0).padStart(2, '0'));
                    }
                  }}
                  className="w-16 h-14 bg-orange-50/50 text-[#FF5522] font-black text-2xl text-center rounded-2xl border border-orange-200/55 focus:outline-none focus:border-[#FF5522] focus:bg-orange-50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => {
                    let num = parseInt(tempEndMin, 10) || 0;
                    num = num <= 0 ? 59 : num - 1;
                    setTempEndMin(String(num).padStart(2, '0'));
                  }}
                  className="text-gray-400 hover:text-[#FF5522] p-1 transition-colors active:scale-125"
                >
                  <ChevronDown size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
          >
            Скасувати
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-5 py-2 bg-[#FF5522] hover:bg-[#FF5522]/90 text-white font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95"
          >
            Підтвердити
          </button>
        </div>
      </div>
    </div>
  );
}
