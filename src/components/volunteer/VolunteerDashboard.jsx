import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Building2, Search, Clock, MapPin, RotateCw, Sun, Moon, LayoutGrid, List, Bell, CheckCircle2, XCircle, Star, X, Mail } from 'lucide-react';
import { useStore } from '../../store/useStore';
import CalendarSelector from './CalendarSelector';
import SphereFilters from './SphereFilters';
import FacultyFilters from './FacultyFilters';

export default function VolunteerDashboard({
  shifts,
  searchQuery,
  setSearchQuery,
  b2cFilters,
  selectedFilter,
  setSelectedFilter,
  calendarDays,
  selectedDateStr,
  setSelectedDateStr,
  setCurrentDetailsShift,
  toggleRole,
  organization,
  isDark,
  toggleTheme
}) {
  const loadData = useStore((state) => state.loadData);
  const notifications = useStore((state) => state.notifications);
  const markNotificationsRead = useStore((state) => state.markNotificationsRead);
  const clearNotifications = useStore((state) => state.clearNotifications);
  const emailNotificationsEnabled = useStore((state) => state.emailNotificationsEnabled);
  const toggleEmailNotifications = useStore((state) => state.toggleEmailNotifications);
  const activeFacultyFilter = useStore((state) => state.activeFacultyFilter);
  const allShifts = useStore((state) => state.allShifts);
  const b2bShifts = useStore((state) => state.b2bShifts);

  const displayShifts = (shifts || []).filter((shift) => {
    if (!activeFacultyFilter || activeFacultyFilter === 'ALL') return true;
    return !shift.target_faculty || shift.target_faculty === 'ALL' || shift.target_faculty === activeFacultyFilter;
  });

  const shiftsForDots = (allShifts && allShifts.length > 0)
    ? allShifts
    : ((b2bShifts && b2bShifts.length > 0) ? b2bShifts : (shifts || []));

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('volunteerShiftsViewMode') || 'grid');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isNotifClosing, setIsNotifClosing] = useState(false);
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

  const toggleNotif = () => {
    if (isNotifOpen) {
      handleCloseNotif();
    } else {
      setIsNotifClosing(false);
      setIsNotifOpen(true);
    }
  };

  const unreadCount = (notifications || []).filter(n => !n.is_read).length;

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    localStorage.setItem('volunteerShiftsViewMode', mode);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData(selectedDateStr, selectedFilter, searchQuery, true); // force load
    setIsRefreshing(false);
  };

  return (
    <div className="animate-fadeIn pb-32 sm:pb-24">
      <div className="flex justify-between items-center mb-5">
        <div className="text-left">
          <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-zinc-100">Пошук заходів</h1>
          <p className="text-[10px] text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Знайдіть волонтерські завдання</p>
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
                            <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${notif.type === 'approval'
                                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                                : notif.type === 'rejection'
                                  ? 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                                  : notif.type === 'review'
                                    ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                                    : 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                              }`}>
                              {notif.type === 'approval' ? (
                                <CheckCircle2 size={14} />
                              ) : notif.type === 'rejection' ? (
                                <XCircle size={14} />
                              ) : notif.type === 'review' ? (
                                <Star size={14} />
                              ) : (
                                <Bell size={14} />
                              )}
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
                            <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${notif.type === 'approval'
                                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                                : notif.type === 'rejection'
                                  ? 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                                  : notif.type === 'review'
                                    ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                                    : 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                              }`}>
                              {notif.type === 'approval' ? (
                                <CheckCircle2 size={16} />
                              ) : notif.type === 'rejection' ? (
                                <XCircle size={16} />
                              ) : notif.type === 'review' ? (
                                <Star size={16} />
                              ) : (
                                <Bell size={16} />
                              )}
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

      {/* 14-day calendar */}
      <CalendarSelector
        calendarDays={calendarDays}
        selectedDateStr={selectedDateStr}
        setSelectedDateStr={setSelectedDateStr}
        shifts={shiftsForDots}
      />

      {/* Search Bar */}
      <div className="mb-3 relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-zinc-550">
          <Search size={15} />
        </span>
        <input
          type="text"
          placeholder="Пошук за напрямком, локацією, описом..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white dark:bg-[#27272A] border border-gray-200 dark:border-transparent rounded-full pl-9 pr-4 py-3 text-xs font-semibold text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-[#FF5522] dark:focus:border-[#FF5522] shadow-sm placeholder:text-gray-400 dark:placeholder:text-zinc-555"
        />
      </div>

      {/* Faculty Filters */}
      <FacultyFilters />

      {/* Shift Feed */}
      <div className="space-y-4 mt-1">
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] font-extrabold text-gray-400 dark:text-zinc-550 uppercase tracking-widest">
            Доступні події ({displayShifts.length})
          </span>

          <div className="flex items-center gap-2.5">
            <span className="text-[10px] text-gray-500 dark:text-zinc-400 font-bold uppercase tracking-wider hidden sm:inline">
              Одеса
            </span>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-[#27272A] p-1 rounded-2xl border border-gray-200/40 dark:border-zinc-800/40 shrink-0">
              <button
                type="button"
                onClick={() => handleSetViewMode('grid')}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${viewMode === 'grid'
                  ? 'bg-white dark:bg-zinc-700 text-[#FF5522] shadow-sm'
                  : 'text-gray-400 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200'
                  }`}
                title="Відображення картками"
              >
                <LayoutGrid size={13} />
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
                <List size={13} />
              </button>
            </div>
          </div>
        </div>

        {displayShifts.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {displayShifts.map((shift) => (
                <div
                  key={shift.id}
                  onClick={() => setCurrentDetailsShift(shift)}
                  className="bg-white dark:bg-[#27272A] rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-transparent shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 active:scale-[0.98] text-left flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center gap-2 mb-2.5 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 bg-orange-50 text-[#FF5522] dark:bg-orange-950/40 dark:text-orange-400 text-[10px] font-black rounded-full tracking-wide uppercase border border-orange-200 dark:border-transparent">
                          {!shift.target_faculty || shift.target_faculty === 'ALL' ? 'Усі факультети' : shift.target_faculty}
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full uppercase tracking-wide ${(shift.approved_count || 0) >= shift.max_volunteers
                        ? 'bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400'
                        : 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400'
                        }`}>
                        {(shift.approved_count || 0) >= shift.max_volunteers ? 'Місць немає' : 'Вільне місце'}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-gray-900 dark:text-zinc-100 text-sm sm:text-base leading-snug mb-2 line-clamp-2">
                      {shift.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium mb-3 flex items-center gap-1.5">
                      <Building2 size={14} className="text-gray-400 dark:text-zinc-500 shrink-0" />
                      <span className="truncate">{shift.organization_name}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-zinc-800 text-xs text-gray-700 dark:text-zinc-300 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} className="text-[#FF5522] dark:text-[#F97316] shrink-0" />
                      <span>{shift.time}</span>
                    </span>
                    <span className="flex items-center gap-1 font-medium truncate max-w-[150px]">
                      <MapPin size={13} className="text-gray-400 dark:text-zinc-500 shrink-0" />
                      <span className="truncate">{shift.location}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#27272A] rounded-2xl border border-gray-100 dark:border-zinc-800 p-2 shadow-sm space-y-2">
              {displayShifts.map((shift) => (
                <div
                  key={shift.id}
                  onClick={() => setCurrentDetailsShift(shift)}
                  className="p-3.5 hover:bg-gray-50 dark:hover:bg-zinc-800/60 rounded-xl transition-all cursor-pointer border-b border-gray-100 dark:border-zinc-800 last:border-b-0 text-left space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-orange-50 text-[#FF5522] dark:bg-orange-950/40 dark:text-orange-400 text-[10px] font-black rounded uppercase tracking-wide border border-orange-200 dark:border-transparent">
                        {!shift.target_faculty || shift.target_faculty === 'ALL' ? 'Усі факультети' : shift.target_faculty}
                      </span>
                      <h3 className="font-extrabold text-gray-900 dark:text-zinc-100 text-sm sm:text-base leading-snug">
                        {shift.title}
                      </h3>
                    </div>
                    <span className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full uppercase tracking-wide shrink-0 ${(shift.approved_count || 0) >= shift.max_volunteers
                      ? 'bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400'
                      : 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400'
                      }`}>
                      {(shift.approved_count || 0) >= shift.max_volunteers ? 'Місць немає' : 'Вільне місце'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-500 dark:text-zinc-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Building2 size={13} className="text-gray-400 dark:text-zinc-500 shrink-0" />
                      <span>{shift.organization_name}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} className="text-[#FF5522] dark:text-[#F97316] shrink-0" />
                      <span>{shift.time}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-gray-400 dark:text-zinc-500 shrink-0" />
                      <span>{shift.location}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="bg-white dark:bg-[#27272A] rounded-2xl p-8 border border-gray-100 dark:border-transparent shadow-sm text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center text-gray-400 dark:text-zinc-500 mb-3">
              <Search size={20} />
            </div>
            <h4 className="font-bold text-gray-800 dark:text-zinc-200 text-xs mb-1">Подій не знайдено</h4>
            <p className="text-[10px] text-gray-400 dark:text-zinc-500 max-w-[180px] mx-auto leading-relaxed">
              Немає активних ініціатив на обраний день.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
