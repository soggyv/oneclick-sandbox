import React, { useState, useEffect, useRef } from 'react';
import { Clock, MapPin, X } from 'lucide-react';
import { useStore } from '../../store/useStore';

export default function EditShiftModal({ isOpen, onClose, shift }) {
  const updateShift = useStore((state) => state.updateShift);
  const calendarDays = React.useMemo(() => {
    const days = [];
    const weekdaysShort = ['НД', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
    const shiftDateStr = shift?.date;
    let shiftDateAdded = false;

    const upcomingDays = [];
    for (let i = 0; i < 14; i++) {
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
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [showMap, setShowMap] = useState(false);

  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (shift) {
      setTitle(shift.title || '');
      setCategory(shift.category || '');
      setLocation(shift.location || '');
      setAddress(shift.address || '');
      setDescription(shift.description || '');
      setDate(shift.date || '');
      const times = (shift.time || '09:00 - 18:00').split(' - ');
      setStartTime(times[0] || '09:00');
      setEndTime(times[1] || '18:00');
    }
  }, [shift, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setShowMap(false);
    }
  }, [isOpen]);

  // Leaflet map setup
  useEffect(() => {
    if (isOpen && showMap && window.L) {
      const timer = setTimeout(() => {
        const mapContainer = document.getElementById('edit-address-picker-map');
        if (!mapContainer) return;

        let initialLat = 46.4825;
        let initialLng = 30.7233;

        const initMap = (lat, lng) => {
          if (mapRef.current) {
            mapRef.current.setView([lat, lng], 15);
            if (markerRef.current) {
              markerRef.current.setLatLng([lat, lng]);
            }
            mapRef.current.invalidateSize();
            return;
          }

          const map = window.L.map('edit-address-picker-map').setView([lat, lng], 15);
          
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
          }).addTo(map);

          const marker = window.L.marker([lat, lng], { draggable: true }).addTo(map);
          markerRef.current = marker;
          mapRef.current = map;

          const handleMapInteraction = async (plat, plng) => {
            marker.setLatLng([plat, plng]);
            map.panTo([plat, plng]);
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${plat}&lon=${plng}&accept-language=uk`);
              const data = await res.json();
              if (data && data.address) {
                const road = data.address.road || '';
                const house = data.address.house_number || '';
                let addrStr = '';
                if (road) {
                  addrStr = road;
                  if (house) addrStr += `, ${house}`;
                } else {
                  addrStr = data.display_name.split(',')[0] || '';
                }
                setAddress(addrStr);
              }
            } catch (err) {
              console.error("Geocoding error:", err);
            }
          };

          map.on('click', (e) => {
            handleMapInteraction(e.latlng.lat, e.latlng.lng);
          });

          marker.on('dragend', () => {
            const position = marker.getLatLng();
            handleMapInteraction(position.lat, position.lng);
          });
        };

        // Geocode current address if present, otherwise use default coordinates
        if (address.trim()) {
          const query = address.toLowerCase().includes('одеса') ? address : `${address}, Одеса`;
          fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`)
            .then(res => res.json())
            .then(data => {
              if (data && data.length > 0) {
                initialLat = parseFloat(data[0].lat);
                initialLng = parseFloat(data[0].lon);
              }
              initMap(initialLat, initialLng);
            })
            .catch(() => {
              initMap(initialLat, initialLng);
            });
        } else {
          initMap(initialLat, initialLng);
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
          markerRef.current = null;
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        max_volunteers: shift.max_volunteers || 5
      });
      onClose();
    } catch (err) {
      // error is handled and toasted in store
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#f5f5f7] w-full max-w-[450px] rounded-[32px] border border-white/10 p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-left">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center border border-gray-100 shadow-sm transition-all active:scale-90 text-gray-500 cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="mb-5">
          <h2 className="text-lg font-black tracking-tight text-gray-900">Редагування заходу</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Оновіть інформацію для волонтерів</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
              Назва заходу / Завдання
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold text-gray-855 focus:outline-none focus:border-[#FF5522] shadow-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                Напрямок
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold text-gray-855 focus:outline-none focus:border-[#FF5522] shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                Дата заходу
              </label>
              <select
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm"
              >
                {calendarDays.map(day => (
                  <option key={day.dateStr} value={day.dateStr}>
                    {day.weekday}, {day.dateStr.split('-').reverse().join('.')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                Час початку
              </label>
              <input
                type="text"
                placeholder="09:00"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold text-gray-855 focus:outline-none focus:border-[#FF5522] shadow-sm text-center"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                Час завершення
              </label>
              <input
                type="text"
                placeholder="18:00"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold text-gray-855 focus:outline-none focus:border-[#FF5522] shadow-sm text-center"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                Локація (приміщення)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold text-gray-855 focus:outline-none focus:border-[#FF5522] shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
              Фізична адреса (Одеса)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onBlur={handleAddressBlur}
                required
                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold text-gray-855 focus:outline-none focus:border-[#FF5522] shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  showMap
                    ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'
                }`}
              >
                <MapPin size={15} />
                <span>Мапа</span>
              </button>
            </div>

            {showMap && (
              <div className="mt-3 bg-white p-2 rounded-2xl border border-gray-150 shadow-inner overflow-hidden animate-fadeIn">
                <div
                  id="edit-address-picker-map"
                  className="w-full h-[180px] rounded-xl z-0"
                  style={{ minHeight: '180px' }}
                ></div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
              Опис / Задачі
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold text-gray-855 focus:outline-none focus:border-[#FF5522] shadow-sm resize-none"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-4 mt-4 bg-[#FF5522] hover:bg-[#FF5522]/90 text-white font-extrabold rounded-full shadow-md text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
          >
            ЗБЕРЕГТИ ЗМІНИ
          </button>
        </form>
      </div>
    </div>
  );
}
