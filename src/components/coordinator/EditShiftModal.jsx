import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Clock, MapPin, X, Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useStore } from '../../store/useStore';
import TimePickerModal from '../TimePickerModal';
import { TARGET_FACULTIES_OPTIONS } from '../../constants/faculties';

const monthsUkGen = [
  'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
  'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'
];

const monthsUkFull = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
];

export default function EditShiftModal({ isOpen, onClose, shift }) {
  const updateShift = useStore((state) => state.updateShift);
  const calendarDays = React.useMemo(() => {
    const days = [];
    const weekdaysShort = ['НД', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
    const shiftDateStr = shift?.date;
    let shiftDateAdded = false;

    const upcomingDays = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const weekday = weekdaysShort[d.getDay()];
      const dayNum = d.getDate();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      upcomingDays.push({ weekday, dayNum, dateStr });
      if (shiftDateStr === dateStr) {
        shiftDateAdded = true;
      }
    }

    if (shiftDateStr && !shiftDateAdded) {
      const parts = shiftDateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        if (!isNaN(d.getTime())) {
          const weekday = weekdaysShort[d.getDay()];
          const dayNum = d.getDate();
          days.push({ weekday, dayNum, dateStr: shiftDateStr });
        }
      }
    }

    return [...days, ...upcomingDays];
  }, [shift]);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [targetFaculty, setTargetFaculty] = useState('ALL');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [maxVolunteers, setMaxVolunteers] = useState(1);
  const [showMap, setShowMap] = useState(false);

  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [tempStartHour, setTempStartHour] = useState('09');
  const [tempStartMin, setTempStartMin] = useState('00');
  const [tempEndHour, setTempEndHour] = useState('18');
  const [tempEndMin, setTempEndMin] = useState('00');

  // Custom DatePicker modal state
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [selY, selM, selD] = (date || '').split('-').map(Number);
  const selectedDateObj = (selY && selM && selD) ? new Date(selY, selM - 1, selD) : new Date();
  const selectedMonthIdx = selectedDateObj.getMonth();
  const selectedYear = selectedDateObj.getFullYear();
  const selectedDayNum = selectedDateObj.getDate();

  const formattedDateTitle = `${selectedDayNum} ${monthsUkGen[selectedMonthIdx]} ${selectedYear}`;
  const [pickerMonth, setPickerMonth] = useState(selectedMonthIdx);
  const [pickerYear, setPickerYear] = useState(selectedYear);

  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (shift) {
      setTitle(shift.title || '');
      setCategory(shift.category || '');
      setTargetFaculty(shift.target_faculty || 'ALL');
      setLocation(shift.location || '');
      setAddress(shift.address || '');
      setDescription(shift.description || '');
      setDate(shift.date || '');
      setMaxVolunteers(shift.max_volunteers || 1);
      const times = (shift.time || '09:00 - 18:00').split(' - ');
      const start = times[0] || '09:00';
      const end = times[1] || '18:00';
      setStartTime(start);
      setEndTime(end);
      setTempStartHour(start.split(':')[0] || '09');
      setTempStartMin(start.split(':')[1] || '00');
      setTempEndHour(end.split(':')[0] || '18');
      setTempEndMin(end.split(':')[1] || '00');

      const [y, m, d] = (shift.date || '').split('-').map(Number);
      if (y && m) {
        setPickerMonth(m - 1);
        setPickerYear(y);
      }
    }
  }, [shift, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setShowMap(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && showMap) {
      const L = window.L;
      if (!L) return;

      const defaultLat = 46.4825;
      const defaultLng = 30.7233;

      const initMap = async () => {
        let initialLat = defaultLat;
        let initialLng = defaultLng;

        if (address.trim()) {
          try {
            const query = address.toLowerCase().includes('одеса') ? address : `${address}, Одеса`;
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
            const data = await res.json();
            if (data && data.length > 0) {
              initialLat = parseFloat(data[0].lat);
              initialLng = parseFloat(data[0].lon);
            }
          } catch (err) {
            console.error("Geocoding address error on open:", err);
          }
        }

        const mapContainer = document.getElementById('edit-shift-map');
        if (!mapContainer) return;

        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        const map = L.map('edit-shift-map', {
          center: [initialLat, initialLng],
          zoom: 14,
          zoomControl: false
        });
        mapRef.current = map;

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          subdomains: 'abcd',
          attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        const customIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `<div style="background-color: #FF5522; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); transform: translate(-50%, -50%);"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([initialLat, initialLng], {
          draggable: true,
          icon: customIcon
        }).addTo(map);
        markerRef.current = marker;

        const updateAddressFromCoords = async (lat, lng) => {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data && data.display_name) {
              const road = data.address.road || data.address.pedestrian || data.address.suburb || '';
              const houseNumber = data.address.house_number || '';
              const shortAddr = houseNumber ? `${road}, ${houseNumber}` : road || data.display_name.split(',')[0];
              setAddress(shortAddr || data.display_name);
            }
          } catch (err) {
            console.error("Reverse geocoding error:", err);
          }
        };

        marker.on('dragend', (e) => {
          const { lat, lng } = e.target.getLatLng();
          updateAddressFromCoords(lat, lng);
        });

        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          updateAddressFromCoords(lat, lng);
        });
      };

      const timer = setTimeout(initMap, 150);

      return () => {
        clearTimeout(timer);
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
          markerRef.current = null;
        }
      };
    }
  }, [isOpen, showMap]);

  const handleAddressBlur = async () => {
    if (!address.trim()) return;
    try {
      const query = address.toLowerCase().includes('одеса') ? address : `${address}, Одеса`;
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        if (mapRef.current && markerRef.current) {
          markerRef.current.setLatLng([newLat, newLng]);
          mapRef.current.setView([newLat, newLng], 15);
        }
      }
    } catch (err) {
      console.error("Geocoding address error:", err);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateShift(shift.id, {
        title,
        category,
        date,
        time: `${startTime} - ${endTime}`,
        location,
        address,
        description,
        max_volunteers: maxVolunteers,
        target_faculty: targetFaculty || 'ALL'
      });
      onClose();
    } catch (err) {
      console.error("Error updating shift:", err);
    }
  };

  // DatePicker grid logic
  const getDaysInMonth = (m, y) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfWeek = (m, y) => (new Date(y, m, 1).getDay() + 6) % 7;

  const totalDays = getDaysInMonth(pickerMonth, pickerYear);
  const startOffset = getFirstDayOfWeek(pickerMonth, pickerYear);
  const pickerGrid = [...Array(startOffset).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-[#18181B] text-gray-900 dark:text-zinc-100 rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-gray-200 dark:border-zinc-800 animate-scaleUp max-h-[90vh] overflow-y-auto text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800 mb-5">
          <div>
            <h2 className="text-lg font-black tracking-tight">Редагування заходу</h2>
            <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Оновлення інформації про зміну</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 bg-gray-100 dark:bg-zinc-800 rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 px-1">
              Назва заходу / Завдання
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-xs font-semibold text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 px-1">
              Цільовий факультет
            </label>
            <select
              value={targetFaculty || 'ALL'}
              onChange={(e) => setTargetFaculty(e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-xs font-bold text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm cursor-pointer"
            >
              {TARGET_FACULTIES_OPTIONS.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  {fac.name}
                </option>
              ))}
            </select>
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
            <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-550 uppercase tracking-widest mb-1.5 px-1 cursor-pointer">
              Години роботи
            </label>
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3.5 shadow-sm hover:border-[#FF5522]/50 transition-colors">
              <Clock size={14} className="text-gray-400 dark:text-zinc-500" />
              <span className="text-xs font-black text-gray-800 dark:text-zinc-200">
                {startTime} — {endTime}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 px-1">
                Локація (приміщення)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-xs font-semibold text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 px-1">
                Потрібно волонтерів
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMaxVolunteers(prev => Math.max(1, (parseInt(prev) || 1) - 1))}
                  className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 font-black text-base flex items-center justify-center transition-all active:scale-90 border border-gray-200 dark:border-zinc-700 shrink-0 cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={maxVolunteers}
                  onChange={(e) => setMaxVolunteers(e.target.value)}
                  required
                  className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-2 py-2 text-center text-xs font-black text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-[#FF5522] shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setMaxVolunteers(prev => Math.min(999, (parseInt(prev) || 0) + 1))}
                  className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 font-black text-base flex items-center justify-center transition-all active:scale-90 border border-gray-200 dark:border-zinc-700 shrink-0 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 px-1">
              Адреса
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onBlur={handleAddressBlur}
                required
                className="flex-1 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-xs font-semibold text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  showMap
                    ? 'bg-[#FF5522] border-transparent text-white shadow-md'
                    : 'bg-white dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 shadow-sm'
                }`}
              >
                <MapPin size={15} />
                <span>{showMap ? "Сховати карту" : "Мапа"}</span>
              </button>
            </div>

            {showMap && (
              <div className="mt-3 bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-inner overflow-hidden animate-fadeIn">
                <div
                  id="edit-shift-map"
                  className="w-full h-[180px] rounded-xl z-0"
                  style={{ minHeight: '180px' }}
                ></div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 px-1">
              Опис / Задачі
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-xs font-semibold text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm resize-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 text-xs font-bold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            >
              Скасувати
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#FF5522] hover:bg-[#FF5522]/90 dark:bg-orange-500 dark:hover:bg-orange-600 text-white text-xs font-extrabold shadow-md transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
            >
              Зберегти зміни
            </button>
          </div>
        </form>

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
            setStartTime(`${tempStartHour}:${tempStartMin}`);
            setEndTime(`${tempEndHour}:${tempEndMin}`);
            setIsTimePickerOpen(false);
          }}
        />

        {/* DatePicker modal */}
        {isDatePickerOpen && createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
            <div className="bg-white dark:bg-[#18181B] text-gray-900 dark:text-zinc-100 rounded-3xl p-5 w-full max-w-xs sm:max-w-sm shadow-2xl border border-gray-200 dark:border-zinc-800 animate-scaleUp text-left">
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

              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'НД'].map((d) => (
                  <span key={d} className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-wider py-1">
                    {d}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {pickerGrid.map((dayNum, index) => {
                  if (!dayNum) {
                    return <div key={`empty-${index}`} className="h-9" />;
                  }

                  const dateStr = `${pickerYear}-${String(pickerMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const isAvailable = (calendarDays || []).some(d => d.dateStr === dateStr);
                  const isSelected = dateStr === date;
                  const isToday = dateStr === nowStr;

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => {
                        if (!isAvailable) return;
                        setDate(dateStr);
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

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setDate(nowStr);
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
      </div>
    </div>,
    document.body
  );
}
