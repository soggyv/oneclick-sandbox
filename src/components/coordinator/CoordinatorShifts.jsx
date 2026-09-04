import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { User, Clock, MapPin, Star, Calendar, Edit2, Trash2, Eye, RotateCw, Sun, Moon, LayoutGrid, List, ChevronDown, ChevronUp, Bell, UserX, UserPlus, X, Mail } from 'lucide-react';
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
  const notifications = useStore((state) => state.notifications);
  const markNotificationsRead = useStore((state) => state.markNotificationsRead);
  const clearNotifications = useStore((state) => state.clearNotifications);
  const emailNotificationsEnabled = useStore((state) => state.emailNotificationsEnabled);
  const toggleEmailNotifications = useStore((state) => state.toggleEmailNotifications);

  const [editingShift, setEditingShift] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedShifts, setExpandedShifts] = useState({});
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isNotifClosing, setIsNotifClosing] = useState(false);
  const [isRatingClosing, setIsRatingClosing] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleCloseNotif = () => {
    if (isNotifClosing) return;
    if (isMobile) {
      setIsNotifClosing(true);
      setTimeout(() => {
        setIsNotifOpen(false);
        setIsNotifClosing(false);
      }, 210);
    } else {
      setIsNotifOpen(false);
    }
  };

  const handleCloseRating = (callback) => {
    if (isRatingClosing) return;
    setIsRatingClosing(true);
    setTimeout(() => {
      setRatingModalApp(null);
      setIsRatingClosing(false);
      if (callback) callback();
    }, 210);
  };

  const toggleNotif = () => {
    if (isNotifOpen) {
      handleCloseNotif();
    } else {
      setIsNotifClosing(false);
      setIsNotifOpen(true);
    }
  };
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('coordinatorShiftsViewMode') || 'grid');
  const [ratingModalApp, setRatingModalApp] = useState(null);

  const unreadCount = (notifications || []).filter(n => !n.is_read).length;

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('coordinatorShiftsViewMode', mode);
  };

  const toggleExpand = (shiftId) => {
    setExpandedShifts(prev => ({
      ...prev,
      [shiftId]: !prev[shiftId]
    }));
  };

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
    <div className="animate-fadeIn pb-32 sm:pb-24">
      <div className="flex justify-between items-center mb-5">
        <div className="text-left">
          <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-zinc-100">Керування заходами</h1>
          <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
            Організація: {organization ? organization.name : "..."}
          </p>
        </div>
        <div className="flex gap-2 shrink-0 items-center">
          {/* Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={toggleNotif}
              className="relative p-2.5 bg-gray-50 border border-transparent hover:bg-gray-100 dark:bg-[#27272A] dark:border-transparent dark:hover:bg-zinc-700 text-gray-500 hover:text-gray-900 dark:text-zinc-300 dark:hover:text-zinc-100 rounded-full shadow-sm transition-all active:scale-90 cursor-pointer flex items-center justify-center"
              title="Сповіщення"
            >
              <Bell size={14} className={unreadCount > 0 ? "text-[#FF5522]" : ""} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF5522] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse border-2 border-white dark:border-[#27272A]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* PC Dropdown View (under bell button, no backdrop dimming) */}
            {isNotifOpen && !isMobile && (
              <>
                <div className="fixed inset-0 z-[90]" onClick={handleCloseNotif} />
                <div className="absolute top-full right-0 mt-2 w-[380px] bg-white/95 dark:bg-[#27272A]/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-700/80 z-[100] p-4 animate-fadeIn text-left">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100 dark:border-zinc-700/60">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-xs text-gray-900 dark:text-zinc-100 uppercase tracking-wider">Сповіщення</h3>
                      {unreadCount > 0 && (
                        <span className="bg-orange-100 dark:bg-orange-950/40 text-[#FF5522] dark:text-orange-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                          {unreadCount} нових
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markNotificationsRead()}
                          className="text-[10px] font-bold text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          Прочитати все
                        </button>
                      )}
                      {(notifications || []).length > 0 && (
                        <button
                          onClick={() => clearNotifications()}
                          className="text-[10px] font-bold text-red-500 hover:text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                        >
                          Очистити
                        </button>
                      )}
                      <button
                        onClick={handleCloseNotif}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                    {(notifications || []).length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 rounded-xl border text-xs transition-all ${!notif.is_read
                              ? 'bg-orange-50/50 dark:bg-orange-950/30 border-orange-200/60 dark:border-orange-900/40'
                              : 'bg-gray-50/50 dark:bg-zinc-800/40 border-gray-100 dark:border-zinc-800'
                            }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${notif.type === 'cancellation'
                                ? 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                                : notif.type === 'new_application'
                                  ? 'bg-orange-100 dark:bg-orange-950/40 text-[#FF5522] dark:text-orange-400'
                                  : 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                              }`}>
                              {notif.type === 'cancellation' ? <UserX size={14} /> : notif.type === 'new_application' ? <UserPlus size={14} /> : <Bell size={14} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-baseline gap-1">
                                <span className="font-extrabold text-gray-900 dark:text-zinc-100 text-[11px] leading-tight">
                                  {notif.title}
                                </span>
                                <span className="text-[9px] font-semibold text-gray-400 dark:text-zinc-500 shrink-0">
                                  {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-600 dark:text-zinc-300 mt-0.5 leading-snug">
                                {notif.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-gray-400 dark:text-zinc-500 text-xs font-semibold">
                        Немає нових сповіщень
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-700/60 flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-gray-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail size={12} className="text-[#FF5522]" />
                      <span>Email-сповіщення:</span>
                    </span>
                    <button
                      type="button"
                      onClick={toggleEmailNotifications}
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm border-0 ${emailNotificationsEnabled
                          ? 'bg-emerald-500 text-white dark:bg-emerald-500 dark:text-white'
                          : 'bg-rose-500 text-white dark:bg-rose-600 dark:text-white'
                        }`}
                    >
                      {emailNotificationsEnabled ? 'Увімкнено' : 'Вимкнено'}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Mobile Full Screen Backdrop Modal via Portal */}
            {isNotifOpen && isMobile && createPortal(
              <div
                className={`fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm ${isNotifClosing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop-in'}`}
                onClick={handleCloseNotif}
              >
                <div
                  className={`w-full max-w-sm bg-white dark:bg-[#27272A] rounded-3xl p-5 shadow-2xl border border-gray-100 dark:border-zinc-700/80 text-left relative ${isNotifClosing ? 'animate-modal-card-out' : 'animate-modal-card-in'}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100 dark:border-zinc-700/60">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-sm text-gray-900 dark:text-zinc-100 uppercase tracking-wider">Сповіщення</h3>
                      {unreadCount > 0 && (
                        <span className="bg-orange-100 dark:bg-orange-950/40 text-[#FF5522] dark:text-orange-400 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                          {unreadCount} нових
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markNotificationsRead()}
                          className="text-[10px] font-bold text-gray-500 hover:text-gray-800 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          Прочитати все
                        </button>
                      )}
                      {(notifications || []).length > 0 && (
                        <button
                          onClick={() => clearNotifications()}
                          className="text-[10px] font-bold text-red-500 hover:text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                        >
                          Очистити
                        </button>
                      )}
                      <button
                        onClick={handleCloseNotif}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-[60vh] overflow-y-auto space-y-2.5 pr-1">
                    {(notifications || []).length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3.5 rounded-2xl border text-xs transition-all ${!notif.is_read
                              ? 'bg-orange-50/60 dark:bg-orange-950/30 border-orange-200/60 dark:border-orange-900/40'
                              : 'bg-gray-50/50 dark:bg-zinc-800/40 border-gray-100 dark:border-zinc-800'
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${notif.type === 'cancellation'
                                ? 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                                : notif.type === 'new_application'
                                  ? 'bg-orange-100 dark:bg-orange-950/40 text-[#FF5522] dark:text-orange-400'
                                  : 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                              }`}>
                              {notif.type === 'cancellation' ? <UserX size={16} /> : notif.type === 'new_application' ? <UserPlus size={16} /> : <Bell size={16} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-baseline gap-1">
                                <span className="font-extrabold text-gray-900 dark:text-zinc-100 text-xs leading-tight">
                                  {notif.title}
                                </span>
                                <span className="text-[9px] font-semibold text-gray-400 dark:text-zinc-500 shrink-0">
                                  {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-600 dark:text-zinc-300 mt-1 leading-snug">
                                {notif.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-10 text-center text-gray-400 dark:text-zinc-500 text-xs font-semibold">
                        Немає нових сповіщень
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-700/60 flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-gray-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail size={14} className="text-[#FF5522]" />
                      <span>Email-сповіщення:</span>
                    </span>
                    <button
                      type="button"
                      onClick={toggleEmailNotifications}
                      className={`px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-sm border-0 ${emailNotificationsEnabled
                          ? 'bg-emerald-500 text-white dark:bg-emerald-500 dark:text-white'
                          : 'bg-rose-500 text-white dark:bg-rose-600 dark:text-white'
                        }`}
                    >
                      {emailNotificationsEnabled ? 'Увімкнено' : 'Вимкнено'}
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2.5 bg-gray-55 border border-transparent hover:bg-gray-100 dark:bg-[#27272A] dark:border-transparent dark:hover:bg-zinc-700 text-gray-500 hover:text-gray-900 dark:text-zinc-300 dark:hover:text-zinc-100 rounded-full shadow-sm transition-all active:scale-90 cursor-pointer flex items-center justify-center"
            title={isDark ? "Світла тема" : "Темна тема"}
          >
            {isDark ? <Sun size={14} className="text-[#FF5522]" /> : <Moon size={14} className="text-[#FF5522]" />}
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            className="p-2.5 bg-gray-55 border border-transparent hover:bg-gray-100 dark:bg-[#27272A] dark:border-transparent dark:hover:bg-zinc-700 text-gray-500 hover:text-gray-900 dark:text-zinc-300 dark:hover:text-zinc-100 rounded-full shadow-sm transition-all active:scale-90 cursor-pointer flex items-center justify-center"
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
              className={`flex-1 py-2 rounded-full text-xs font-black transition-all duration-200 active:scale-95 cursor-pointer ${isActive
                  ? 'bg-[#FF5522] dark:bg-orange-500 text-white shadow-sm'
                  : 'text-gray-555 hover:text-black dark:text-zinc-400 dark:hover:text-white'
                }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Feed Layout Toggles */}
      <div className="flex justify-between items-center mb-4 px-1">
        <span className="text-[10px] font-extrabold text-gray-400 dark:text-zinc-550 uppercase tracking-widest">
          Заходи ({filteredB2BShifts.length})
        </span>
        <div className="flex bg-gray-55 border border-transparent dark:bg-[#27272A] p-0.5 rounded-2xl shadow-sm">
          <button
            type="button"
            onClick={() => handleSetViewMode('grid')}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${viewMode === 'grid'
                ? 'bg-white dark:bg-zinc-700 text-[#FF5522] shadow-sm'
                : 'text-gray-400 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200'
              }`}
            title="Відображення картками"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            type="button"
            onClick={() => handleSetViewMode('list')}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${viewMode === 'list'
                ? 'bg-white dark:bg-zinc-700 text-[#FF5522] shadow-sm'
                : 'text-gray-400 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200'
              }`}
            title="Відображення списком"
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Shifts list */}
      <div className="space-y-4">
        {filteredB2BShifts.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredB2BShifts.map((shift) => {
                const shiftApps = b2bApplications.filter(
                  (app) => app.shift_id === shift.id || app.shift?.id === shift.id
                );
                const pendingApps = shiftApps.filter(app => app.status === 'pending');
                const approvedCount = shiftApps.filter(app => ['approved', 'attended', 'reviewed'].includes(app.status)).length;

                return (
                  <div
                    key={shift.id}
                    className="bg-white dark:bg-[#27272A] rounded-2xl p-5 border border-gray-100 dark:border-transparent shadow-sm relative overflow-hidden text-left flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start mb-2.5 gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-orange-50 text-[#FF5522] dark:bg-orange-950/40 dark:text-orange-400 uppercase tracking-wide border border-orange-200 dark:border-transparent">
                          {!shift.target_faculty || shift.target_faculty === 'ALL' ? 'Усі факультети' : `Факультет ${shift.target_faculty}`}
                        </span>
                        {pendingApps.length > 0 && (
                          <span className="text-[10px] bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide block w-fit animate-pulse">
                            {pendingApps.length} очікує
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full uppercase tracking-wide ${shift.status === 'open' ? 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400' :
                            shift.status === 'cancelled' ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400' :
                              'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}>
                          {shift.status === 'open' ? 'Активний' :
                            shift.status === 'cancelled' ? 'Скасовано' : 'Закритий'}
                        </span>
                        {shift.status === 'open' && (
                          <>
                            <button
                              type="button"
                              onClick={() => setEditingShift(shift)}
                              className="p-2 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/30 dark:hover:bg-orange-950/50 text-[#FF5522] dark:text-orange-400 rounded-xl transition-all active:scale-90 cursor-pointer"
                              title="Редагувати зміну"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm("Ви дійсно хочете видалити/скасувати цю зміну?")) {
                                  deleteShift(shift.id);
                                }
                              }}
                              className="p-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50 text-red-500 dark:text-red-400 rounded-xl transition-all active:scale-90 cursor-pointer"
                              title="Видалити зміну"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <h3
                      onClick={() => setCurrentDetailsShift(shift)}
                      className="font-extrabold text-gray-900 dark:text-zinc-100 text-base leading-snug mb-2.5 cursor-pointer hover:underline"
                    >
                      {shift.title}
                    </h3>

                    <div className="space-y-1.5 mb-3 text-xs text-gray-500 dark:text-zinc-400 font-medium">
                      <p className="flex items-center gap-1.5">
                        <Clock size={13} className="text-gray-400 dark:text-zinc-500 shrink-0" />
                        <span>Час: {shift.time} ({shift.date})</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-gray-400 dark:text-zinc-500 shrink-0" />
                        <span>Локація: {shift.location}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-500 dark:text-zinc-400 pt-1">
                        <span>Заявок: <span className="font-extrabold text-gray-900 dark:text-zinc-200">{shiftApps.length}</span></span>
                        <span className="text-gray-300 dark:text-zinc-700">•</span>
                        <span>Схвалено: <span className="font-extrabold text-[#FF5522] dark:text-orange-400">{approvedCount} / {shift.max_volunteers}</span></span>
                      </div>
                    </div>

                    {/* Applications Section within this shift card */}
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-transparent">
                      <h4 className="text-[10px] font-bold text-gray-400 dark:text-zinc-550 uppercase tracking-widest mb-3">
                        Заявки волонтерів ({shiftApps.length})
                      </h4>

                      {shiftApps.length > 0 ? (
                        <div className="space-y-3">
                          {shiftApps.map((app) => (
                            <div
                              key={app.id}
                              className="bg-gray-55 dark:bg-zinc-900/40 rounded-xl p-3.5 border border-gray-100 dark:border-transparent text-left space-y-3"
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
                                    className="group text-xs font-black text-gray-800 dark:text-zinc-200 hover:text-[#FF5522] dark:hover:text-[#FF5522] cursor-pointer flex items-center gap-1.5 transition-colors duration-150 flex-wrap"
                                    title="Переглянути профіль волонтера"
                                  >
                                    <span>{app.volunteer_name}</span>
                                    <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-orange-50 dark:bg-orange-950/40 text-[#FF5522] dark:text-orange-400 border border-orange-200/60 dark:border-transparent uppercase">
                                      {app.volunteer_faculty || 'ФКІТ'}
                                    </span>
                                    <Eye size={12} className="text-gray-450 dark:text-zinc-550 group-hover:text-[#FF5522] shrink-0 transition-colors duration-150" />
                                  </span>
                                </div>

                                <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase tracking-wider ${app.status === 'pending' ? 'bg-orange-100 text-orange-850 dark:bg-orange-950/20 dark:text-orange-400' :
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
                                    className="flex-1 py-2 bg-green-600 hover:bg-green-755 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                                  >
                                    Схвалити
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleReviewCandidate(app.id, 'rejected')}
                                    className="flex-1 py-2 bg-gray-55 dark:bg-zinc-800 border border-gray-300 dark:border-transparent hover:bg-gray-100 dark:hover:bg-zinc-700 dark:hover:text-white text-gray-600 dark:text-zinc-200 font-extrabold text-[10px] rounded-full uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                                  >
                                    Відхилити
                                  </button>
                                </div>
                              )}

                              {/* Status 2: Approved (Waiting for attendance code) */}
                              {app.status === 'approved' && (
                                <div className="p-3 bg-white dark:bg-[#18181B] rounded-xl border border-gray-100 dark:border-transparent space-y-2">
                                  <label className="block text-[8px] font-bold text-gray-400 dark:text-zinc-550 uppercase tracking-widest">
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
                                      className="w-full sm:w-auto px-3.5 py-2 bg-[#FF5522] hover:bg-[#FF5522]/90 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-extrabold text-[9px] rounded-lg uppercase tracking-wider transition-all active:scale-95 cursor-pointer shrink-0 shadow-sm"
                                    >
                                      Перевірити
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Status 3: Attended (Needs review) */}
                              {app.status === 'attended' && (
                                <button
                                  type="button"
                                  onClick={() => setRatingModalApp(app)}
                                  className="w-full py-2.5 px-4 bg-[#FF5522] hover:bg-[#FF5522]/90 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl uppercase tracking-wide transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                                >
                                  <Star size={14} className="fill-white text-white" />
                                  <span>Оцінити та завершити</span>
                                </button>
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
                        <p className="text-[10px] text-gray-405 dark:text-zinc-550 font-bold italic">
                          Немає активних запитів від волонтерів.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="bg-white dark:bg-[#27272A] rounded-3xl border border-gray-200/50 dark:border-zinc-800/40 p-2.5 shadow-sm space-y-1">
              {filteredB2BShifts.map((shift) => {
                const shiftApps = b2bApplications.filter(
                  (app) => app.shift_id === shift.id || app.shift?.id === shift.id
                );
                const pendingApps = shiftApps.filter(app => app.status === 'pending');
                const approvedCount = shiftApps.filter(app => ['approved', 'attended', 'reviewed'].includes(app.status)).length;
                const isExpanded = !!expandedShifts[shift.id];

                return (
                  <div
                    key={shift.id}
                    className="flex flex-col py-3.5 px-4 hover:bg-gray-50 dark:hover:bg-zinc-800/60 rounded-xl transition-all group border-b border-gray-100 dark:border-zinc-800 last:border-b-0 text-left space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Clickable area for details */}
                      <div
                        onClick={() => toggleExpand(shift.id)}
                        className="flex-1 min-w-0 cursor-pointer select-none space-y-1.5"
                        title="Натисніть для перегляду заявок та деталей"
                      >
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="text-[10px] bg-orange-50 text-[#FF5522] dark:bg-orange-950/40 dark:text-orange-400 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wide border border-orange-200 dark:border-transparent">
                            {!shift.target_faculty || shift.target_faculty === 'ALL' ? 'Усі факультети' : `Факультет ${shift.target_faculty}`}
                          </span>
                          <h3 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-zinc-100 leading-snug">
                            {shift.title}
                          </h3>
                          <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full uppercase tracking-wide ${shift.status === 'open' ? 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400' :
                              shift.status === 'cancelled' ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400' :
                                'bg-gray-100 text-gray-500 dark:bg-zinc-800 dark:text-zinc-400'
                            }`}>
                            {shift.status === 'open' ? 'Активний' :
                              shift.status === 'cancelled' ? 'Скасовано' : 'Закритий'}
                          </span>
                          {pendingApps.length > 0 && (
                            <span className="text-[10px] bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wide block w-fit animate-pulse">
                              {pendingApps.length} очікує
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-gray-500 dark:text-zinc-400">
                          <span className="flex items-center gap-1.5">
                            <Clock size={13} className="text-gray-400 dark:text-zinc-500 shrink-0" />
                            <span>{shift.time} ({shift.date})</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-gray-400 dark:text-zinc-500 shrink-0" />
                            <span>{shift.location}</span>
                          </span>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-gray-500 dark:text-zinc-400">
                            <span>Заявок: <span className="font-extrabold text-gray-900 dark:text-zinc-200">{shiftApps.length}</span></span>
                            <span className="text-gray-300 dark:text-zinc-700">•</span>
                            <span>Схвалено: <span className="font-extrabold text-[#FF5522] dark:text-orange-400">{approvedCount} / {shift.max_volunteers}</span></span>
                          </div>
                        </div>
                      </div>

                      {/* Actions & Expand Toggle */}
                      <div className="flex items-center gap-2 shrink-0">
                        {shift.status === 'open' && (
                          <>
                            <button
                              type="button"
                              onClick={() => setEditingShift(shift)}
                              className="p-2 bg-orange-55 hover:bg-orange-100 dark:bg-orange-950/20 dark:hover:bg-orange-950/40 text-[#FF5522] dark:text-orange-400 rounded-xl transition-all active:scale-90 cursor-pointer"
                              title="Редагувати зміну"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm("Ви дійсно хочете видалити/скасувати цю зміну?")) {
                                  deleteShift(shift.id);
                                }
                              }}
                              className="p-2 bg-red-50 hover:bg-red-105 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-500 dark:text-red-400 rounded-xl transition-all active:scale-90 cursor-pointer"
                              title="Видалити зміну"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => toggleExpand(shift.id)}
                          className="p-2 bg-gray-55 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-xl text-gray-500 dark:text-zinc-400 transition-all cursor-pointer animate-fadeIn"
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Applications Section */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-transparent space-y-3">
                        <h4 className="text-[10px] font-bold text-gray-400 dark:text-zinc-550 uppercase tracking-widest">
                          Заявки волонтерів ({shiftApps.length})
                        </h4>

                        {shiftApps.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {shiftApps.map((app) => (
                              <div
                                key={app.id}
                                className="bg-gray-55 dark:bg-zinc-900/40 rounded-xl p-3.5 border border-gray-100 dark:border-transparent text-left space-y-3"
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
                                       <span className="px-2 py-0.5 text-[9px] font-black rounded-full bg-orange-50 dark:bg-orange-950/40 text-[#FF5522] dark:text-orange-400 border border-orange-200/60 dark:border-transparent uppercase">
                                         {app.volunteer_faculty || 'ФКІТ'}
                                       </span>
                                      <Eye size={12} className="text-gray-450 dark:text-zinc-550 group-hover:text-[#FF5522] shrink-0 transition-colors duration-150" />
                                    </span>
                                  </div>

                                  <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase tracking-wider ${app.status === 'pending' ? 'bg-orange-100 text-orange-850 dark:bg-orange-950/20 dark:text-orange-400' :
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
                                      className="flex-1 py-2 bg-green-600 hover:bg-green-755 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                                    >
                                      Схвалити
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleReviewCandidate(app.id, 'rejected')}
                                      className="flex-1 py-2 bg-gray-55 dark:bg-zinc-800 border border-gray-300 dark:border-transparent hover:bg-gray-100 dark:hover:bg-zinc-700 dark:hover:text-white text-gray-600 dark:text-zinc-200 font-extrabold text-[10px] rounded-full uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                                    >
                                      Відхилити
                                    </button>
                                  </div>
                                )}

                                {/* Status 2: Approved (Waiting for attendance code) */}
                                {app.status === 'approved' && (
                                  <div className="p-3 bg-white dark:bg-[#18181B] rounded-xl border border-gray-100 dark:border-transparent space-y-2">
                                    <label className="block text-[8px] font-bold text-gray-400 dark:text-zinc-550 uppercase tracking-widest">
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
                                        className="w-full sm:w-auto px-3.5 py-2 bg-[#FF5522] hover:bg-[#FF5522]/90 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-extrabold text-[9px] rounded-lg uppercase tracking-wider transition-all active:scale-95 cursor-pointer shrink-0 shadow-sm"
                                      >
                                        Перевірити
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Status 3: Attended (Needs review) */}
                                {app.status === 'attended' && (
                                  <button
                                    type="button"
                                    onClick={() => setRatingModalApp(app)}
                                    className="w-full py-2.5 px-4 bg-[#FF5522] hover:bg-[#FF5522]/90 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl uppercase tracking-wide transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                                  >
                                    <Star size={14} className="fill-white text-white" />
                                    <span>Оцінити та завершити</span>
                                  </button>
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
                    )}
                  </div>
                );
              })}
            </div>
          )
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

      {/* Rating & Shift Completion Modal */}
      {ratingModalApp && createPortal(
        <div
          className={`fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md ${isRatingClosing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop-in'}`}
          onClick={() => handleCloseRating()}
        >
          <div
            className={`bg-white dark:bg-[#27272A] w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-2xl border border-gray-100 dark:border-zinc-800 space-y-4 text-left relative ${isRatingClosing ? 'animate-modal-card-out' : 'animate-modal-card-in'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                {ratingModalApp.volunteer_avatar_url ? (
                  <img
                    src={`${API_URL.replace('/api', '')}${ratingModalApp.volunteer_avatar_url}`}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-200 dark:border-zinc-700"
                  />
                ) : (
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950/40 text-[#FF5522] dark:text-orange-400 font-black rounded-full flex items-center justify-center text-sm">
                    {ratingModalApp.volunteer_name ? ratingModalApp.volunteer_name.charAt(0).toUpperCase() : 'У'}
                  </div>
                )}
                <div>
                  <h3 className="font-extrabold text-gray-900 dark:text-zinc-100 text-sm">
                    Оцінка волонтера
                  </h3>
                  <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400">
                    {ratingModalApp.volunteer_name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCloseRating()}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 py-1">
              <label className="block text-xs font-extrabold text-gray-700 dark:text-zinc-300 uppercase tracking-wide">
                Оцінка волонтера (зірочки):
              </label>
              <div className="flex justify-center gap-2 py-3 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl border border-gray-100 dark:border-zinc-800">
                {[1, 2, 3, 4, 5].map((star) => {
                  const currentRating = ratings[ratingModalApp.id] || 5;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatings(prev => ({ ...prev, [ratingModalApp.id]: star }))}
                      className="text-orange-500 hover:scale-125 active:scale-90 transition-transform cursor-pointer p-1"
                    >
                      <Star
                        size={28}
                        className={star <= currentRating ? "fill-orange-400 text-orange-500 dark:fill-[#F97316] dark:text-[#F97316]" : "text-gray-300 dark:text-zinc-700"}
                      />
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 dark:text-zinc-300 uppercase tracking-wide mb-1.5">
                  Відгук / Коментар (опціонально):
                </label>
                <textarea
                  rows="3"
                  placeholder="Враження про роботу волонтера..."
                  value={reviews[ratingModalApp.id] || ""}
                  onChange={(e) => setReviews(prev => ({ ...prev, [ratingModalApp.id]: e.target.value }))}
                  className="w-full bg-gray-55 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl p-3 text-xs font-medium text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-[#FF5522] dark:focus:border-orange-500 resize-none placeholder:text-gray-400 dark:placeholder:text-zinc-500"
                ></textarea>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleCloseRating()}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-300 font-extrabold text-xs rounded-xl uppercase tracking-wide transition-all cursor-pointer"
              >
                Скасувати
              </button>
              <button
                type="button"
                onClick={() => {
                  handleCloseRating(() => handleRateVolunteer(ratingModalApp.id));
                }}
                className="flex-1 py-2.5 bg-[#FF5522] hover:bg-[#FF5522]/90 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl uppercase tracking-wide transition-all active:scale-95 cursor-pointer shadow-md"
              >
                Завершити зміну
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
