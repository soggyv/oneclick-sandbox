import React, { useState, useEffect } from 'react';
import { User, Clock, MapPin, Star, Calendar, Edit2, Trash2, Eye, RotateCw, Sun, Moon } from 'lucide-react';
import { useStore } from '../../store/useStore';
import EditShiftModal from './EditShiftModal';

export default function CoordinatorShifts({
  organization,
  toggleRole,
  activeB2BFilter,
  setActiveB2BFilter,
  filteredB2BShifts,
  b2bApplications,
  setCurrentDetailsShift,
  fetchVolunteerReviews,
  handleReviewCandidate,
  attendanceCodes,
  setAttendanceCodes,
  handleConfirmAttendance,
  ratings,
  setRatings,
  reviews,
  setReviews,
  handleRateVolunteer,
  API_URL,
  isDark,
  toggleTheme
}) {
  const deleteShift = useStore((state) => state.deleteShift);
  const loadData = useStore((state) => state.loadData);
  const [editingShift, setEditingShift] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData(undefined, undefined, undefined, true); // force load
    setIsRefreshing(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      loadData(undefined, undefined, undefined, false);
    }, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-5">
        <div className="text-left">
          <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-zinc-100">Керування заходами</h1>
          <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
            Організація: {organization ? organization.name : "..."}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2.5 bg-gray-50 border border-transparent hover:bg-gray-100 dark:bg-[#27272A] dark:border-transparent dark:hover:bg-zinc-700 text-gray-500 hover:text-gray-900 dark:text-zinc-300 dark:hover:text-zinc-100 rounded-full shadow-sm transition-all active:scale-90 cursor-pointer flex items-center justify-center"
            title={isDark ? "Світла тема" : "Темна тема"}
          >
            {isDark ? <Sun size={14} className="text-[#FF5522]" /> : <Moon size={14} className="text-[#FF5522]" />}
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2.5 bg-gray-50 border border-transparent hover:bg-gray-100 dark:bg-[#27272A] dark:border-transparent dark:hover:bg-zinc-700 text-gray-500 hover:text-gray-900 dark:text-zinc-300 dark:hover:text-zinc-100 rounded-full shadow-sm transition-all active:scale-90 cursor-pointer flex items-center justify-center"
            title="Оновити дані"
          >
            <RotateCw size={14} className={isRefreshing ? "animate-spin text-[#FF5522]" : ""} />
          </button>
        </div>
      </div>

      {/* Event filters */}
      <div className="flex gap-2.5 mb-5 bg-gray-100 dark:bg-[#27272A] p-1 rounded-full border border-gray-200 dark:border-transparent">
        {["АКТИВНІ", "ЗАКРИТІ"].map((filter) => {
          const isActive = activeB2BFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveB2BFilter(filter)}
              className={`flex-1 py-2 rounded-full text-xs font-black transition-all duration-200 active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-[#FF5522] dark:bg-orange-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-black dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Shifts list */}
      <div className="space-y-4">
        {filteredB2BShifts.length > 0 ? (
          filteredB2BShifts.map((shift) => {
            const shiftApps = b2bApplications.filter(
              (app) => app.shift_id === shift.id || app.shift?.id === shift.id
            );

            return (
              <div
                key={shift.id}
                className="bg-white dark:bg-[#27272A] rounded-2xl p-5 border border-gray-100 dark:border-transparent shadow-sm relative overflow-hidden text-left"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2.5 py-0.5 text-[9px] font-extrabold rounded-full bg-gray-50 dark:bg-zinc-800/80 text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                    {shift.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full uppercase tracking-wider ${
                      shift.status === 'open' ? 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-450' :
                      shift.status === 'cancelled' ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400' :
                      'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-450'
                    }`}>
                      {shift.status === 'open' ? 'Активний' :
                       shift.status === 'cancelled' ? 'Скасовано' : 'Закритий'}
                    </span>
                    {shift.status === 'open' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setEditingShift(shift)}
                          className="p-2 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/20 dark:hover:bg-orange-950/40 text-[#FF5522] dark:text-orange-400 rounded-xl transition-all active:scale-90 cursor-pointer"
                          title="Редагувати зміну"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("Ви дійсно хочете видалити/скасувати цю зміну?")) {
                              deleteShift(shift.id);
                            }
                          }}
                          className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-500 dark:text-red-400 rounded-xl transition-all active:scale-90 cursor-pointer"
                          title="Видалити зміну"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <h3
                  onClick={() => setCurrentDetailsShift(shift)}
                  className="font-black text-gray-950 dark:text-zinc-200 text-base leading-snug mb-2 cursor-pointer hover:underline"
                >
                  {shift.title}
                </h3>

                <div className="space-y-1 mb-3 text-[11px] text-gray-500 dark:text-zinc-450 font-semibold">
                  <p className="flex items-center gap-1.5">
                    <Clock size={12} className="text-gray-300 dark:text-zinc-600" />
                    <span>Час: {shift.time} ({shift.date})</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-gray-300 dark:text-zinc-600" />
                    <span>Локація: {shift.location}</span>
                  </p>
                </div>

                {/* Applications Section within this shift card */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-transparent">
                  <h4 className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-3">
                    Заявки волонтерів ({shiftApps.length})
                  </h4>

                  {shiftApps.length > 0 ? (
                    <div className="space-y-3">
                      {shiftApps.map((app) => (
                        <div
                          key={app.id}
                          className="bg-gray-50 dark:bg-zinc-900/40 rounded-xl p-3.5 border border-gray-100 dark:border-transparent text-left space-y-3"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              {app.volunteer_avatar_url ? (
                                <img
                                  src={`${API_URL.replace('/api', '')}${app.volunteer_avatar_url}`}
                                  alt="Avatar"
                                  onClick={() => fetchVolunteerReviews(app.volunteer_id, app.volunteer_name)}
                                  className="w-6 h-6 rounded-full object-cover cursor-pointer hover:opacity-80 active:scale-95 transition-all"
                                  title="Переглянути профіль волонтера"
                                />
                              ) : (
                                <div
                                  onClick={() => fetchVolunteerReviews(app.volunteer_id, app.volunteer_name)}
                                  className="w-6 h-6 bg-[#FFCC00] dark:bg-[#F97316] text-black dark:text-white text-[10px] font-black rounded-full flex items-center justify-center cursor-pointer hover:opacity-85 active:scale-95 transition-all"
                                  title="Переглянути профіль волонтера"
                                >
                                  {app.volunteer_name ? app.volunteer_name.charAt(0).toUpperCase() : 'У'}
                                </div>
                              )}
                              <span
                                onClick={() => fetchVolunteerReviews(app.volunteer_id, app.volunteer_name)}
                                className="group text-xs font-black text-gray-800 dark:text-zinc-200 hover:text-[#FF5522] dark:hover:text-[#FF5522] cursor-pointer flex items-center gap-1.5 transition-colors duration-150"
                                title="Переглянути профіль волонтера"
                              >
                                <span>{app.volunteer_name}</span>
                                <Eye size={12} className="text-gray-450 dark:text-zinc-550 group-hover:text-[#FF5522] shrink-0 transition-colors duration-150" />
                              </span>
                            </div>
                            
                            <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase tracking-wider ${
                              app.status === 'pending' ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/20 dark:text-orange-400' :
                              app.status === 'rejected' ? 'bg-red-50 text-red-655 dark:bg-red-950/20 dark:text-red-400' :
                              app.status === 'approved' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400' :
                              app.status === 'attended' ? 'bg-[#FFCC00]/10 text-orange-600 dark:bg-orange-950/20 dark:text-[#F97316]' :
                              'bg-green-55 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                            }`}>
                              {app.status === 'pending' && 'Очікує узгодження'}
                              {app.status === 'rejected' && 'Відхилено'}
                              {app.status === 'approved' && 'Підтверджений'}
                              {app.status === 'attended' && 'Присутній'}
                              {app.status === 'reviewed' && 'Оцінено'}
                            </span>
                          </div>

                          {/* Status 1: Pending */}
                          {app.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleReviewCandidate(app.id, 'approved')}
                                className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                              >
                                Схвалити
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReviewCandidate(app.id, 'rejected')}
                                className="flex-1 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-300 dark:border-transparent hover:bg-gray-100 dark:hover:bg-zinc-700 dark:hover:text-white text-gray-600 dark:text-zinc-200 font-extrabold text-[10px] rounded-full uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                              >
                                Відхилити
                              </button>
                            </div>
                          )}

                          {/* Status 2: Approved (Waiting for attendance code) */}
                          {app.status === 'approved' && (
                            <div className="p-3 bg-white dark:bg-[#18181B] rounded-xl border border-gray-100 dark:border-transparent space-y-2">
                              <label className="block text-[8px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                                Введіть код волонтера (check-in)
                              </label>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                  type="text"
                                  placeholder="напр. 1C-489A"
                                  value={attendanceCodes[app.id] || ""}
                                  onChange={(e) => setAttendanceCodes(prev => ({ ...prev, [app.id]: e.target.value.toUpperCase() }))}
                                  className="w-full sm:flex-1 bg-gray-55 dark:bg-zinc-800 border border-gray-200 dark:border-transparent rounded-lg px-2.5 py-1.5 text-xs font-black tracking-widest text-center focus:outline-none focus:border-[#FF5522] dark:text-zinc-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleConfirmAttendance(app.id)}
                                  className="w-full sm:w-auto px-3.5 py-2 bg-black hover:bg-black/90 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-white font-bold text-[9px] rounded-lg uppercase tracking-wider transition-all active:scale-95 cursor-pointer shrink-0"
                                >
                                  Перевірити
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Status 3: Attended (Needs review) */}
                          {app.status === 'attended' && (
                            <div className="p-3 bg-white dark:bg-[#18181B] rounded-xl border border-gray-100 dark:border-transparent space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-[9px] font-bold text-gray-500 dark:text-zinc-450 uppercase tracking-wider">
                                  Оцініть волонтера
                                </span>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => {
                                    const currentRating = ratings[app.id] || 5;
                                    return (
                                      <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRatings(prev => ({ ...prev, [app.id]: star }))}
                                        className="text-orange-500 active:scale-125 transition-transform cursor-pointer"
                                      >
                                        <Star size={16} className={star <= currentRating ? "fill-orange-400 text-orange-500 dark:fill-[#F97316] dark:text-[#F97316]" : "text-gray-300 dark:text-zinc-700"} />
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              <textarea
                                rows="2"
                                placeholder="Короткий коментар..."
                                value={reviews[app.id] || ""}
                                onChange={(e) => setReviews(prev => ({ ...prev, [app.id]: e.target.value }))}
                                className="w-full bg-gray-55 dark:bg-zinc-800 border border-gray-200 dark:border-transparent rounded-lg p-2 text-xs font-semibold focus:outline-none focus:border-[#FF5522] resize-none dark:text-zinc-200"
                              ></textarea>

                              <button
                                type="button"
                                onClick={() => handleRateVolunteer(app.id)}
                                className="w-full py-2 bg-[#FF5522] hover:bg-[#FF5522]/90 dark:bg-orange-500 dark:hover:bg-orange-600 text-white dark:text-white font-bold text-[9px] rounded-full uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                              >
                                Надіслати відгук та закрити зміну
                              </button>
                            </div>
                          )}

                          {/* Status 4: Reviewed */}
                          {app.status === 'reviewed' && app.review && (
                            <div className="p-2.5 bg-green-50/50 dark:bg-green-950/10 border border-green-100 dark:border-transparent rounded-lg text-xs space-y-0.5">
                              <div className="flex items-center gap-1 font-bold text-green-800 dark:text-green-400">
                                <Star size={12} className="fill-green-600 text-green-700 dark:fill-green-550 dark:text-green-400" />
                                <span>Оцінено: {app.review.rating} / 5</span>
                              </div>
                              {app.review.comment && (
                                <p className="text-[10px] text-green-700 dark:text-green-500 italic font-semibold">
                                  "{app.review.comment}"
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-400 dark:text-zinc-550 font-bold italic">
                      Немає активних запитів від волонтерів.
                    </p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white dark:bg-[#27272A] rounded-2xl p-8 border border-gray-100 dark:border-transparent shadow-sm text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center text-gray-400 dark:text-zinc-550 mb-3">
              <Calendar size={20} />
            </div>
            <h4 className="font-bold text-gray-800 dark:text-zinc-200 text-xs mb-1">Немає створених заходів</h4>
            <p className="text-[10px] text-gray-400 dark:text-zinc-550 max-w-[200px] leading-relaxed">
              Ви ще не створили жодного заходу для волонтерів.
            </p>
          </div>
        )}
      </div>
      <EditShiftModal
        isOpen={!!editingShift}
        onClose={() => setEditingShift(null)}
        shift={editingShift}
      />
    </div>
  );
}
