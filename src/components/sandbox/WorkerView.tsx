/* eslint-disable @next/next/no-img-element */
import React from 'react';
import {
  Award,
  ArrowLeft,
  Calendar,
  Clock,
  Building,
  MapPin,
  Search,
  Star,
  CheckCircle,
  Info,
  AlertTriangle,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Wallet,
  User,
  Settings,
  HelpCircle,
  ShieldCheck,
  LogOut,
  Camera
} from 'lucide-react';
import { Shift, Transaction, UkCalendarDay } from '../../types/sandbox';
import {
  getUkMonthGenitive,
  getHoursRemaining,
  formatRemainingTime
} from '../../utils/sandbox';

interface LeafletMapInstance {
  setView: (center: [number, number], zoom: number) => LeafletMapInstance;
  remove: () => void;
}

interface LeafletMarkerInstance {
  addTo: (map: LeafletMapInstance) => {
    bindPopup: (content: string) => void;
  };
}

interface LeafletTileLayerInstance {
  addTo: (map: LeafletMapInstance) => void;
}

interface LeafletStatic {
  map: (element: HTMLElement) => LeafletMapInstance;
  tileLayer: (urlTemplate: string, options?: { attribution?: string }) => LeafletTileLayerInstance;
  marker: (latlng: [number, number]) => LeafletMarkerInstance;
}

interface LeafletWindow extends Window {
  L?: LeafletStatic;
}

interface LeafletContainer extends HTMLElement {
  _leaflet_id?: string;
}

interface WorkerViewProps {
  theme: 'light' | 'dark';
  activeTab: 'feed' | 'my-shifts' | 'wallet' | 'profile';
  setActiveTab: React.Dispatch<React.SetStateAction<'feed' | 'my-shifts' | 'wallet' | 'profile'>>;
  selectedShift: Shift | null;
  setSelectedShift: (s: Shift | null) => void;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  calendarDays: UkCalendarDay[];
  selectedDate: string;
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  feedShifts: Shift[];
  shifts: Shift[];
  nowDate: Date;
  signedContract: boolean;
  setSignedContract: React.Dispatch<React.SetStateAction<boolean>>;
  handleBookShift: (id: string) => void;
  myShiftsSubTab: 'active' | 'history';
  setMyShiftsSubTab: React.Dispatch<React.SetStateAction<'active' | 'history'>>;
  activeFeedbackShiftId: string | null;
  setActiveFeedbackShiftId: React.Dispatch<React.SetStateAction<string | null>>;
  feedbackRating: number;
  setFeedbackRating: React.Dispatch<React.SetStateAction<number>>;
  feedbackComment: string;
  setFeedbackComment: React.Dispatch<React.SetStateAction<string>>;
  handleSubmitFeedback: (id: string) => void;
  handleWithdraw: () => void;
  triggerToast: (msg: string) => void;
  setShowScannerModal: React.Dispatch<React.SetStateAction<string | null>>;
  setShowCancelModal: React.Dispatch<React.SetStateAction<string | null>>;
  setShowReportModalId: React.Dispatch<React.SetStateAction<string | null>>;
  collapsedDisputes: Record<string, boolean>;
  setCollapsedDisputes: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setArbitratorModalShiftId: React.Dispatch<React.SetStateAction<string | null>>;
  balance: number;
  transactions: Transaction[];
  userName: string;
  userPhone: string;
  userAvatar: string;
  isDiiaVerified: boolean;
  rating: number;
  profileSubPage: 'main' | 'personal' | 'docs' | 'help' | 'developer';
  setProfileSubPage: React.Dispatch<React.SetStateAction<'main' | 'personal' | 'docs' | 'help' | 'developer'>>;
  setShowAvatarEditModal: React.Dispatch<React.SetStateAction<boolean>>;
  simulateDeadline: boolean;
  setSimulateDeadline: React.Dispatch<React.SetStateAction<boolean>>;
  handleSignOut: () => void;
}

export function WorkerView({
  theme,
  activeTab,
  setActiveTab,
  selectedShift,
  setSelectedShift,
  searchQuery,
  setSearchQuery,
  calendarDays,
  selectedDate,
  setSelectedDate,
  selectedCategory,
  setSelectedCategory,
  feedShifts,
  shifts,
  nowDate,
  signedContract,
  setSignedContract,
  handleBookShift,
  myShiftsSubTab,
  setMyShiftsSubTab,
  activeFeedbackShiftId,
  setActiveFeedbackShiftId,
  feedbackRating,
  setFeedbackRating,
  feedbackComment,
  setFeedbackComment,
  handleSubmitFeedback,
  handleWithdraw,
  triggerToast,
  setShowScannerModal,
  setShowCancelModal,
  setShowReportModalId,
  collapsedDisputes,
  setCollapsedDisputes,
  setArbitratorModalShiftId,
  balance,
  transactions,
  userName,
  userPhone,
  userAvatar,
  isDiiaVerified,
  rating,
  profileSubPage,
  setProfileSubPage,
  setShowAvatarEditModal,
  simulateDeadline,
  setSimulateDeadline,
  handleSignOut
}: WorkerViewProps) {
  const [showMap, setShowMap] = React.useState(false);

  React.useEffect(() => {
    const leafletWindow = window as unknown as LeafletWindow;
    if (!showMap || typeof window === 'undefined' || !leafletWindow.L) return;
    const L = leafletWindow.L;
    
    const container = document.getElementById('shifts-map') as LeafletContainer | null;
    if (!container || container._leaflet_id) return;
    
    // Default Kyiv center coords
    const map = L.map(container).setView([50.45, 30.523], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    feedShifts.forEach((s) => {
      if (s.latitude && s.longitude) {
        const marker = L.marker([s.latitude, s.longitude]).addTo(map);
        marker.bindPopup(`
          <div class="text-left font-sans text-[11px] leading-tight p-0.5">
            <h4 class="font-bold text-[#001B3D]">${s.role}</h4>
            <p class="text-[#FF5722] font-black">${s.company}</p>
            <p class="font-bold mt-1 text-slate-800">${s.price} ₴</p>
          </div>
        `);
      }
    });

    return () => {
      map.remove();
    };
  }, [showMap, feedShifts]);

  return (
    <>
      <div className="flex-1 overflow-y-auto pb-28 no-scrollbar relative z-10">
        {/* 1. SHIFT FEED TAB */}
        {activeTab === 'feed' && !selectedShift && (
          <div className="animate-fade-in">
            {/* Search and Filters Trigger */}
            <div className="p-4 flex gap-2">
              <div className={`rounded-full shadow-sm border flex items-center px-4 py-2.5 gap-2.5 flex-1 transition-all ${theme === 'light'
                ? 'bg-white/70 border-[#ebe7e7]'
                : 'bg-[#0f172a]/60 border-white/10'
                } backdrop-blur-[24px]`}>
                <Search className="w-4 h-4 text-[#FF5722]" />
                <input
                  type="text"
                  placeholder="Пошук вакансії чи закладу..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`bg-transparent text-sm w-full outline-none font-semibold transition-all ${theme === 'light' ? 'text-[#001B3D] placeholder-[#5b4039]/65' : 'text-white placeholder-gray-400'
                    }`}
                />
              </div>
            </div>

            {/* Date Tab Selector */}
            <div className="px-4 py-1 overflow-x-auto no-scrollbar flex gap-2.5">
              {calendarDays.map((d) => (
                <button
                  key={d.date}
                  onClick={() => setSelectedDate(d.date)}
                  className={`flex flex-col items-center justify-center min-w-[68px] h-[82px] rounded-2xl border transition-all ${selectedDate === d.date
                    ? 'bg-gradient-to-br from-[#FF5722] to-[#e64a19] text-white border-transparent shadow-[0_8px_20px_rgba(255,87,34,0.25)] scale-[1.02]'
                    : theme === 'light'
                      ? 'bg-white/70 text-[#001B3D] border-[#E5E7EB] hover:bg-white'
                      : 'bg-[#1c2541]/60 text-gray-300 border-white/10 hover:bg-[#252f55]/80'
                    } backdrop-blur-[24px]`}
                >
                  <span className="text-[11px] font-bold opacity-80 mb-0.5">{d.day}</span>
                  <span className="text-lg font-black">{d.date}</span>
                </button>
              ))}
            </div>

            {/* Category Filter Chips */}
            <div className="p-4 overflow-x-auto no-scrollbar flex gap-2">
              {['Всі', 'Кава', 'Рітейл', 'Склади'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4.5 py-2 rounded-full text-xs font-bold transition-all border ${selectedCategory === cat
                    ? theme === 'light'
                      ? 'bg-[#001B3D] text-white border-transparent'
                      : 'bg-[#FF5722] text-white border-transparent shadow-[0_4px_12px_rgba(255,87,34,0.2)]'
                    : theme === 'light'
                      ? 'bg-white/70 text-[#001B3D] border-[#E5E7EB] hover:bg-white'
                      : 'bg-[#1c2541]/60 text-gray-300 border-white/10 hover:bg-[#252f55]/80'
                    } backdrop-blur-[24px]`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Map Toggle Button */}
            <div className="px-4 pb-2 text-right">
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border flex items-center gap-1.5 ml-auto cursor-pointer ${
                  showMap
                    ? 'bg-[#FF5722] text-white border-transparent'
                    : theme === 'light'
                    ? 'bg-white text-[#001B3D] border-[#E5E7EB]'
                    : 'bg-[#1c2541]/60 text-gray-300 border-white/10'
                }`}
              >
                <span>🗺️</span>
                {showMap ? 'Сховати карту' : 'Показати на карті'}
              </button>
            </div>

            {/* Map Container */}
            {showMap && (
              <div className="px-4 mb-4">
                <div
                  id="shifts-map"
                  className="h-[280px] w-full rounded-[24px] border overflow-hidden relative z-10 shadow-inner"
                  style={{ border: theme === 'light' ? '1px solid #E5E7EB' : '1px solid rgba(255,255,255,0.1)' }}
                ></div>
              </div>
            )}

            {/* Open Shift Cards */}
            <div className="px-4 space-y-4">
              <div className="flex justify-between items-center px-1">
                <h3 className={`text-xs font-black uppercase tracking-wider transition-colors ${theme === 'light' ? 'text-[#5b4039]/70' : 'text-gray-400'
                  }`}>
                  Доступно змін ({feedShifts.length})
                </h3>
              </div>

              {feedShifts.length > 0 ? (
                feedShifts.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedShift(s)}
                    className={`rounded-3xl p-5 border transition-all duration-300 cursor-pointer text-left relative overflow-hidden group backdrop-blur-[24px] ${theme === 'light'
                      ? 'bg-white/70 border-[#E5E7EB] hover:bg-white hover:-translate-y-0.5'
                      : 'bg-[#1c2541]/60 border-white/10 hover:bg-[#252f55]/60 hover:-translate-y-0.5'
                      } ${s.isHot
                        ? theme === 'light'
                          ? 'shadow-[0_8px_30px_rgba(255,149,0,0.22)] hover:shadow-[0_12px_32px_rgba(255,149,0,0.35)]'
                          : 'shadow-[0_8px_30px_rgba(255,149,0,0.35)] hover:shadow-[0_12px_32px_rgba(255,149,0,0.55)]'
                        : theme === 'light'
                          ? 'shadow-[0_8px_30px_-6px_rgba(255,87,34,0.06)] hover:shadow-[0_12px_32px_rgba(255,87,34,0.18)]'
                          : 'shadow-[0_8px_30px_-6px_rgba(255,87,34,0.2)] hover:shadow-[0_12px_32px_rgba(255,87,34,0.35)]'
                      }`}
                  >
                    <div className="flex justify-between items-start gap-2 relative z-10">
                      <div className="flex gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden border ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#121829]/60 border-white/5'
                          }`}>
                          {s.logo ? (
                            <img src={s.logo} alt={s.company} className="w-full h-full object-cover" />
                          ) : (
                            <Building className={`w-5 h-5 ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`} />
                          )}
                        </div>
                        <div>
                          {s.isHot && (
                            <span className="bg-[#FF9500] text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider mb-1 inline-block">
                              ГАРЯЧА
                            </span>
                          )}
                          <h4 className={`text-base font-bold leading-tight group-hover:text-[#FF5722] transition-colors ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'
                            }`}>{s.role}</h4>
                          <p className={`text-xs font-semibold mt-0.5 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'
                            }`}>{s.company}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-extrabold text-[#FF5722]">
                          {s.category === 'University Event / Volunteer' ? (s.volunteerReward || 'Волонтер') : `${s.price} ₴`}
                        </span>
                        <p className={`text-[9px] font-bold uppercase tracking-wider ${theme === 'light' ? 'text-[#5b4039]/70' : 'text-gray-400'
                          }`}>
                          {s.category === 'University Event / Volunteer' ? 'Нагорода' : 'за зміну'}
                        </p>
                      </div>
                    </div>

                    <div className={`mt-4 pt-3.5 border-t flex items-center justify-between text-xs font-semibold relative z-10 ${theme === 'light' ? 'border-gray-100 text-[#001B3D]' : 'border-white/5 text-white'
                      }`}>
                      <span className={`flex items-center gap-1.5 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>
                        <Clock className="w-4 h-4 text-[#FF5722]" />
                        {s.time} ({s.duration})
                      </span>
                      {(() => {
                        const hrs = getHoursRemaining(s, selectedDate, simulateDeadline, nowDate);
                        if (hrs > 0 && hrs <= 2) {
                          return (
                            <span className="text-[10px] font-black text-[#FF5722] bg-[#FF5722]/8 px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                              <span>⏳</span> {formatRemainingTime(hrs)}
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                ))
              ) : (
                <div className={`rounded-3xl border border-dashed p-10 text-center transition-all backdrop-blur-[12px] ${theme === 'light' ? 'bg-white/80 border-[#E5E7EB] text-[#001B3D]' : 'bg-[#1c2541]/40 border-white/10 text-gray-400'
                  }`}>
                  <BriefcaseIcon className="w-10 h-10 mx-auto mb-2 opacity-50 text-[#FF5722]" />
                  <p className="text-xs font-bold">Усі зміни на цю дату заброньовані.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* B2C: SHIFT DETAILS */}
        {selectedShift && (
          <div className="p-4 space-y-4 text-left animate-fade-in">
            <button
              onClick={() => {
                setSelectedShift(null);
                setSignedContract(false);
              }}
              className={`flex items-center gap-1 text-xs font-bold hover:underline mb-2 ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'
                }`}
            >
              <ArrowLeft className="w-4 h-4 text-[#FF5722]" />
              <span>Назад до пошуку</span>
            </button>

            {/* Header bento */}
            <div className={`rounded-3xl p-5 border transition-all backdrop-blur-[24px] ${theme === 'light'
              ? 'bg-white/70 border-[#E5E7EB] shadow-[0_8px_30px_-6px_rgba(255,87,34,0.06)]'
              : 'bg-[#1c2541]/60 border-white/10 shadow-[0_8px_30px_-6px_rgba(255,87,34,0.2)]'
              } space-y-4`}>
              <div className="flex gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden border shrink-0 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-[#121829]/60 border-white/5'
                  }`}>
                  {selectedShift.logo ? (
                    <img src={selectedShift.logo} alt={selectedShift.company} className="w-full h-full object-cover" />
                  ) : (
                    <Building className={`w-6 h-6 ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`} />
                  )}
                </div>
                <div>
                  <h2 className={`text-xl font-bold leading-tight ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>{selectedShift.role}</h2>
                  <p className={`text-sm font-bold mt-0.5 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>{selectedShift.company}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs">
                    <Award className="w-3.5 h-3.5 text-[#FF9500]" />
                    <span className={`font-bold ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>4.9</span>
                    <span className={theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}>(1.2к відгуків)</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#10B981]/8 border border-[#10B981]/25 rounded-2xl p-3.5 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#10B981] shrink-0" />
                <p className={`text-[11px] font-medium leading-tight ${theme === 'light' ? 'text-[#001B3D]' : 'text-gray-200'}`}>
                  Оплата за зміну зарезервована та гарантується сервісом OneClick.
                </p>
              </div>
            </div>

            {/* Details block */}
            <div className={`rounded-3xl p-5 border transition-all backdrop-blur-[24px] ${theme === 'light'
              ? 'bg-white/70 border-[#E5E7EB] shadow-[0_8px_30px_-6px_rgba(255,87,34,0.06)]'
              : 'bg-[#1c2541]/60 border-white/10 shadow-[0_8px_30px_-6px_rgba(255,87,34,0.2)]'
              } space-y-4`}>
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-[#f0edec] text-[#001B3D] border border-gray-200' : 'bg-[#121829]/60 text-gray-300'
                    }`}>
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-[10px] uppercase tracking-wider font-bold ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>Дата зміни</p>
                    <p className={`text-sm font-bold mt-0.5 ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>{selectedShift.date} {getUkMonthGenitive(selectedShift.date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-[#f0edec] text-[#001B3D] border border-gray-200' : 'bg-[#121829]/60 text-gray-300'
                    }`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className={`text-[10px] uppercase tracking-wider font-bold ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>Час роботи</p>
                    <p className={`text-sm font-bold mt-0.5 ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>{selectedShift.time} ({selectedShift.duration})</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FF5722]/8 flex items-center justify-center text-[#FF5722]">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-[#FF5722] uppercase tracking-wider font-bold">
                      {selectedShift.category === 'University Event / Volunteer' ? 'Винагорода' : 'Виплата'}
                    </p>
                    <p className="text-lg font-black text-[#FF5722] mt-0.5">
                      {selectedShift.category === 'University Event / Volunteer' ? (selectedShift.volunteerReward || 'Волонтерські бали') : `${selectedShift.price} ₴`}
                    </p>
                  </div>
                </div>

                {/* Map Location Link */}
                <div className="flex items-start gap-3 pt-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${theme === 'light' ? 'bg-[#f0edec] text-[#001B3D] border border-gray-200' : 'bg-[#121829]/60 text-gray-300'
                    }`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-[10px] uppercase tracking-wider font-bold ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>Адреса та орієнтир</p>
                    <p className={`text-sm font-bold mt-0.5 ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>{selectedShift.address}</p>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedShift.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2 bg-[#FF5722]/10 hover:bg-[#FF5722]/20 text-[#FF5722] px-3.5 py-1.8 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all hover:scale-102 active:scale-98"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Знайти в Google Maps</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className={`border-t pt-4 ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
                <h4 className={`text-xs font-black uppercase tracking-wider mb-2 ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Опис завдань:</h4>
                <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>{selectedShift.details || 'Звичайна тимчасова зміна в роздрібній торгівлі/кафе.'}</p>
              </div>

              {/* Worker Reviews Section */}
              <div className={`border-t pt-4 space-y-4 ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
                <div className="flex justify-between items-center">
                  <h4 className={`text-xs font-black uppercase tracking-wider ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>
                    Відгуки працівників ({selectedShift.reviews?.length || 0})
                  </h4>
                  {selectedShift.reviews && selectedShift.reviews.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-[#FF9500]" />
                      <span className={`text-xs font-extrabold ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>
                        {(selectedShift.reviews.reduce((acc, r) => acc + r.rating, 0) / selectedShift.reviews.length).toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1 no-scrollbar">
                  {selectedShift.reviews && selectedShift.reviews.length > 0 ? (
                    selectedShift.reviews.map((rev) => (
                      <div key={rev.id} className={`p-3 rounded-2xl border transition-all ${theme === 'light' ? 'bg-[#f0edec]/50 border-gray-200/60' : 'bg-[#121829]/30 border-white/5'
                        } space-y-1`}>
                        <div className="flex justify-between items-center">
                          <span className={`font-black text-xs ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>
                            {rev.workerName}
                          </span>
                          <span className={`text-[9px] font-bold ${theme === 'light' ? 'text-[#5b4039]/60' : 'text-gray-400'}`}>
                            {rev.date}
                          </span>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${i < rev.rating ? 'text-[#FF9500] fill-[#FF9500]' : 'text-gray-300'
                                }`}
                            />
                          ))}
                        </div>
                        <p className={`text-[10px] leading-relaxed italic ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>
                          {`"${rev.comment}"`}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className={`text-xs text-center italic ${theme === 'light' ? 'text-[#5b4039]/60' : 'text-gray-400'}`}>
                      Ще немає відгуків для цієї зміни.
                    </p>
                  )}
                </div>
              </div>

              {/* DIIA CHECKBOX CONTRACT */}
              <div className={`border rounded-2xl p-4 space-y-2.5 transition-all backdrop-blur-[8px] ${theme === 'light' ? 'bg-[#f0f5fc]/80 border-blue-200' : 'bg-[#FF5722]/10 border-[#FF5722]/30'
                }`}>
                <div className="flex items-center gap-2">
                  <div className="bg-[#001B3D] text-[#FF5722] px-2 py-0.5 rounded text-[10px] font-black italic">Дія</div>
                  <span className={`text-[11px] font-bold ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Швидкий договір ЦПХ</span>
                </div>
                <p className={`text-[10px] leading-snug ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>
                  Підпишіть цифровий договір на надання послуг за допомогою сервісу **Дія.Підпис** перед бронюванням.
                </p>
                <label className="flex items-start gap-2.5 pt-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={signedContract}
                    onChange={(e) => setSignedContract(e.target.checked)}
                    className="w-4.5 h-4.5 border-[#E5E7EB] rounded accent-[#FF5722] mt-0.5 shrink-0"
                  />
                  <span className={`text-[10px] font-bold select-none leading-normal ${theme === 'light' ? 'text-[#001B3D]' : 'text-gray-200'}`}>
                    Я підписую договір та погоджуюсь вийти на зміну.
                  </span>
                </label>
              </div>

              <button
                onClick={() => handleBookShift(selectedShift.id)}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-md ${signedContract
                  ? 'bg-[#FF5722] text-white active:scale-98 shadow-[#FF5722]/20 hover:bg-[#e64a19]'
                  : theme === 'light'
                    ? 'bg-[#f0edec] text-[#5b4039]/60 cursor-not-allowed shadow-none'
                    : 'bg-[#1c2541]/45 text-gray-500 border border-white/5 cursor-not-allowed shadow-none'
                  }`}
              >
                Відгукнутися на зміну
              </button>
            </div>
          </div>
        )}

        {/* 2. MY BOOKED SHIFTS TAB */}
        {activeTab === 'my-shifts' && (
          <div className="p-4 space-y-4 text-left animate-fade-in">
            <h3 className={`text-lg font-black tracking-tight ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Мої зміни</h3>

            {/* Active / History toggles */}
            <div className={`flex p-1 rounded-xl mb-4 border ${theme === 'light' ? 'bg-[#f0edec] border-gray-200' : 'bg-[#121829]/40 border-white/5'}`}>
              <button
                onClick={() => setMyShiftsSubTab('active')}
                className={`flex-1 py-2 text-center rounded-lg font-bold text-xs transition-all ${myShiftsSubTab === 'active'
                  ? theme === 'light'
                    ? 'bg-white text-[#001B3D] shadow-sm border border-gray-150'
                    : 'bg-[#FF5722] text-white shadow-sm border-transparent'
                  : theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'
                  }`}
              >
                Активні
              </button>
              <button
                onClick={() => setMyShiftsSubTab('history')}
                className={`flex-1 py-2 text-center rounded-lg font-bold text-xs transition-all ${myShiftsSubTab === 'history'
                  ? theme === 'light'
                    ? 'bg-white text-[#001B3D] shadow-sm border border-gray-150'
                    : 'bg-[#FF5722] text-white shadow-sm border-transparent'
                  : theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'
                  }`}
              >
                Історія
              </button>
            </div>

            <div className="space-y-4">
              {shifts.filter(s => {
                const isMatchSubTab = myShiftsSubTab === 'active'
                  ? (s.status === 'booked' || s.status === 'in_progress' || s.status === 'pending_approval' || s.status === 'disputed')
                  : s.status === 'completed';
                return isMatchSubTab;
              }).length > 0 ? (
                shifts.filter(s => {
                  const isMatchSubTab = myShiftsSubTab === 'active'
                    ? (s.status === 'booked' || s.status === 'in_progress' || s.status === 'pending_approval' || s.status === 'disputed')
                    : s.status === 'completed';
                  return isMatchSubTab;
                }).map((s) => {
                  const isFuture = parseInt(s.date, 10) > nowDate.getDate();
                  return (
                    <div
                      key={s.id}
                      className={`rounded-3xl p-5 border transition-all backdrop-blur-[16px] ${theme === 'light'
                        ? 'bg-white/85 border-[#E5E7EB] shadow-[0_8px_30px_-6px_rgba(255,87,34,0.08)] hover:bg-white/95'
                        : 'bg-[#1c2541]/45 border-white/10 shadow-[0_8px_30px_-6px_rgba(255,87,34,0.2)] hover:bg-[#1c2541]/60'
                        } relative overflow-hidden animate-fade-in`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border ${s.status === 'completed' ? 'bg-[#10B981]/8 text-[#10B981] border-[#10B981]/20' :
                            s.status === 'in_progress' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                              s.status === 'pending_approval' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                s.status === 'disputed' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                  'bg-[#FF9500]/8 text-[#FF9500] border-[#FF9500]/20'
                            }`}>
                            {s.status === 'completed' && 'Виплачено'}
                            {s.status === 'booked' && 'Заброньовано'}
                            {s.status === 'in_progress' && 'Працюю'}
                            {s.status === 'pending_approval' && 'На підтвердженні'}
                            {s.status === 'disputed' && 'У спорі ⚠️'}
                          </span>
                          <h4 className={`text-base font-extrabold mt-2 leading-tight ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'
                            }`}>{s.role}</h4>
                          <p className={`text-xs font-bold mt-0.5 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'
                            }`}>{s.company}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-base font-extrabold ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>
                            {s.category === 'University Event / Volunteer' ? (s.volunteerReward || 'Волонтер') : `${s.price} ₴`}
                          </span>
                        </div>
                      </div>

                      <div className={`mt-4 pt-3.5 border-t space-y-2 text-xs font-semibold ${theme === 'light' ? 'border-gray-100 text-[#5b4039]' : 'border-white/5 text-gray-300'
                        }`}>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#FF5722]" />
                          <span>{s.date} {getUkMonthGenitive(s.date)} • {s.time} ({s.duration})</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-[#FF5722] mt-0.5 shrink-0" />
                          <span className={`leading-snug ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>{s.address}</span>
                        </div>
                      </div>

                      {s.status === 'completed' && (
                        <div className={`mt-3 pt-3 border-t ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
                          {s.allowFeedback === false ? (
                            <div className="text-[10px] font-semibold text-gray-400 italic">
                              Для цієї компанії відгуки вимкнено роботодавцем
                            </div>
                          ) : s.hasFeedback ? (
                            <div className="flex items-center gap-1.5 text-[#10B981] text-[11px] font-black uppercase tracking-wider bg-[#10B981]/8 px-2.5 py-1.5 rounded-xl border border-[#10B981]/20 w-fit">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Відгук надіслано</span>
                            </div>
                          ) : activeFeedbackShiftId === s.id ? (
                            <div className="space-y-3 mt-1">
                              <p className={`text-[10px] font-black uppercase tracking-wider ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>Ваша оцінка зміни:</p>
                              <div className="flex gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setFeedbackRating(star)}
                                    className="focus:outline-none transition-transform active:scale-125"
                                  >
                                    <Star
                                      className={`w-5 h-5 ${star <= feedbackRating
                                        ? 'text-[#FF9500] fill-[#FF9500]'
                                        : theme === 'light' ? 'text-gray-300' : 'text-gray-600'
                                        }`}
                                    />
                                  </button>
                                ))}
                              </div>
                              <div>
                                <textarea
                                  rows={2}
                                  value={feedbackComment}
                                  onChange={(e) => setFeedbackComment(e.target.value)}
                                  placeholder="Поділіться враженнями від зміни (умови, команда, оплата)..."
                                  className={`w-full border rounded-2xl px-3 py-2.5 text-xs font-bold outline-none resize-none transition-all ${theme === 'light'
                                    ? 'bg-[#fcf9f8] border-gray-200 text-[#001B3D] focus:border-[#FF5722] focus:bg-white'
                                    : 'bg-[#121829]/50 border-[#2a3454] text-white focus:border-[#FF5722] focus:bg-[#121829]'
                                    }`}
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSubmitFeedback(s.id)}
                                  className="flex-1 bg-[#FF5722] hover:bg-[#e64a19] text-white py-2.5 rounded-xl text-xs font-bold active:scale-95 transition-all shadow-sm"
                                >
                                  Надіслати
                                </button>
                                <button
                                  onClick={() => setActiveFeedbackShiftId(null)}
                                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${theme === 'light'
                                    ? 'bg-gray-100 hover:bg-gray-200 text-[#001B3D]'
                                    : 'bg-white/5 hover:bg-white/10 text-white'
                                    }`}
                                >
                                  Скасувати
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveFeedbackShiftId(s.id);
                                setFeedbackRating(5);
                                setFeedbackComment('');
                              }}
                              className={`w-full py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${theme === 'light'
                                ? 'border-[#FF5722]/30 text-[#FF5722] hover:bg-[#FF5722]/5'
                                : 'border-[#FF5722]/40 text-[#FF5722] hover:bg-[#FF5722]/10'
                                }`}
                            >
                              <Star className="w-3.5 h-3.5 fill-[#FF5722]/10" />
                              Залишити відгук про роботу
                            </button>
                          )}
                        </div>
                      )}

                      {s.status === 'booked' && (
                        <div className="mt-3.5 space-y-2">
                          {isFuture ? (
                            <>
                              <div className={`p-3 rounded-2xl border flex items-start gap-2 text-[11px] font-bold mb-2 ${theme === 'light'
                                ? 'bg-amber-50 border-amber-200 text-amber-800'
                                : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                                }`}>
                                <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                <span>Зміна заблокована. Ви не можете розпочати її завчасно (початок {s.date} {getUkMonthGenitive(s.date)}).</span>
                              </div>
                              <button
                                onClick={() => triggerToast(`Не можна почати зміну завчасно. Вона запланована на ${s.date} ${getUkMonthGenitive(s.date)}.`)}
                                className="w-full bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-400 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-not-allowed opacity-50"
                              >
                                <Camera className="w-4 h-4" />
                                Відсканувати QR закладу
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setShowScannerModal(s.id)}
                              className="w-full bg-gradient-to-br from-[#FF5722] to-[#e64a19] text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-98 shadow-sm transition-all hover:scale-[1.01]"
                            >
                              <Camera className="w-4 h-4" />
                              Відсканувати QR закладу
                            </button>
                          )}
                          <button
                            onClick={() => setShowCancelModal(s.id)}
                            className="w-full border border-red-500/35 hover:border-red-500/50 bg-red-50/5 dark:bg-red-500/5 text-red-550 dark:text-red-400 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                          >
                            Відмовитись від зміни
                          </button>
                        </div>
                      )}

                      {s.status === 'in_progress' && (
                        <div className="mt-3.5 space-y-2">
                          <div className={`p-3 rounded-2xl border flex items-start gap-2 text-[11px] font-bold mb-2 animate-pulse ${theme === 'light'
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-green-500/10 border-green-500/20 text-green-300'
                            }`}>
                            <Clock className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            <span>Зміна триває. Не забудьте зробити Чек-аут після завершення роботи!</span>
                          </div>
                          <button
                            onClick={() => setShowReportModalId(s.id)}
                            className="w-full bg-gradient-to-br from-[#10B981] to-[#0ea975] text-white py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-98 shadow-sm transition-all"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Завершити зміну (Чек-аут)
                          </button>
                        </div>
                      )}

                      {s.status === 'pending_approval' && (
                        <div className="mt-3.5">
                          <div className={`p-3 rounded-2xl border flex items-start gap-2 text-[11px] font-bold ${theme === 'light'
                            ? 'bg-blue-50 border-blue-200 text-blue-800'
                            : 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                            }`}>
                            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <span>Зміну завершено. Очікується підтвердження та виплата від роботодавця.</span>
                          </div>
                        </div>
                      )}

                      {s.status === 'disputed' && (() => {
                        const isCollapsed = collapsedDisputes[s.id] === true;
                        return (
                          <div className="mt-3.5 space-y-3">
                            <div className={`p-3.5 rounded-2xl border ${theme === 'light' ? 'bg-red-50/50 border-red-200' : 'bg-red-500/5 border-red-500/20'} space-y-2`}>
                              <button
                                onClick={() => setCollapsedDisputes(prev => ({ ...prev, [s.id]: !prev[s.id] }))}
                                className="w-full flex items-center justify-between text-left focus:outline-none"
                              >
                                <div className="flex items-center gap-1.5 text-red-500 font-bold text-xs uppercase tracking-wider">
                                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                                  <span>Роботодавець оскаржує виконання</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-red-500 transition-transform duration-200 ${!isCollapsed ? 'rotate-180' : ''}`} />
                              </button>

                              {!isCollapsed && (
                                <div className="space-y-3 pt-2 border-t border-dashed border-red-200/40 dark:border-red-500/10">
                                  <p className={`text-[11px] font-semibold ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                                    <strong className="text-red-500">Причина:</strong> {s.disputeReason}
                                  </p>
                                  {s.disputeComment && (
                                    <p className={`text-[11px] italic ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                                      &ldquo;{s.disputeComment}&rdquo;
                                    </p>
                                  )}

                                  <button
                                    onClick={() => setArbitratorModalShiftId(s.id)}
                                    className="w-full bg-[#001B3D] dark:bg-blue-600 hover:opacity-95 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                                  >
                                    ⚖️ Відкрити Арбітраж та Чат
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })
              ) : (
                <div className={`rounded-3xl border border-dashed p-10 text-center transition-all backdrop-blur-[12px] ${theme === 'light' ? 'bg-white/80 border-[#E5E7EB] text-[#001B3D]' : 'bg-[#1c2541]/40 border-white/10 text-gray-400'
                  }`}>
                  <Calendar className="w-8 h-8 mx-auto mb-1 opacity-55 text-[#FF5722]" />
                  <p className="text-xs font-bold">Немає змін у цьому розділі</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. PROFILE & DIGITAL WALLET TAB */}
        {activeTab === 'wallet' && (
          <div className="p-4 space-y-5 text-left animate-fade-in">
            {/* Balance Card */}
            <div className="relative overflow-hidden rounded-[24px] bg-[#001B3D] p-6 shadow-xl text-white border border-white/10">
              <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#FF5722] opacity-20 rounded-full blur-3xl"></div>
              <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-blue-500 opacity-20 rounded-full blur-2xl"></div>

              <div className="relative z-10">
                <span className="text-[11px] font-bold text-white/70 uppercase tracking-widest">Доступний баланс</span>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-white font-black text-4xl leading-none">{balance.toLocaleString('en-US')}.00</span>
                  <span className="text-lg font-bold text-white/80">₴</span>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-3">
                  <button
                    onClick={handleWithdraw}
                    className="bg-[#FF5722] hover:bg-[#e64a19] text-white py-3.5 px-4 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs active:scale-95 transition-all shadow-[0_4px_12px_rgba(255,87,34,0.3)]"
                  >
                    <Wallet className="w-4 h-4" />
                    Вивести
                  </button>
                  <button
                    onClick={() => triggerToast('Історія вивантажується автоматично.')}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white py-3.5 px-4 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs active:scale-95 transition-all"
                  >
                    <Clock className="w-4 h-4" />
                    Історія
                  </button>
                </div>
              </div>
            </div>

            {/* Weekly Summary Bento */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-2xl border transition-all backdrop-blur-[16px] ${theme === 'light' ? 'bg-white/85 border-[#E5E7EB] shadow-sm' : 'bg-[#1c2541]/45 border-white/10 shadow-md'
                }`}>
                <div className="flex items-center gap-1.5 text-[#10B981] mb-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase">Нараховано</span>
                </div>
                <p className={`text-xl font-bold ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>
                  {transactions.filter(t => t.type === 'work').reduce((acc, curr) => acc + curr.amount, 0)} ₴
                </p>
                <p className={`text-[10px] font-semibold mt-1 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>Цього тижня</p>
              </div>

              <div className={`p-4 rounded-2xl border transition-all backdrop-blur-[16px] ${theme === 'light' ? 'bg-white/85 border-[#E5E7EB] shadow-sm' : 'bg-[#1c2541]/45 border-white/10 shadow-md'
                }`}>
                <div className="flex items-center gap-1.5 text-[#FF5722] mb-1.5">
                  <Clock className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase">В обробці</span>
                </div>
                <p className={`text-xl font-bold ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>
                  {shifts.filter(s => s.status === 'booked').reduce((acc, curr) => acc + curr.price, 0)} ₴
                </p>
                <p className={`text-[10px] font-semibold mt-1 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>Майбутні зміни</p>
              </div>
            </div>

            {/* Transactions list */}
            <div>
              <div className="flex justify-between items-end mb-3 px-1">
                <h2 className={`text-xs font-black uppercase tracking-wider ${theme === 'light' ? 'text-[#5b4039]/80' : 'text-gray-400'
                  }`}>Останні операції</h2>
                <button className="text-[#FF5722] text-xs font-bold hover:underline" onClick={() => triggerToast('Усі фільтри активовані')}>Фільтри</button>
              </div>

              <div className="space-y-3">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className={`p-4 rounded-2xl flex items-center justify-between border transition-all backdrop-blur-[16px] ${theme === 'light'
                        ? 'bg-white/85 border-[#E5E7EB] hover:bg-[#f0edec]/40 text-[#001B3D] shadow-sm'
                        : 'bg-[#1c2541]/45 border-white/10 hover:bg-[#252f55]/60 text-white shadow-md'
                        }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-[#10B981]/8 text-[#10B981]' : 'bg-[#FF5722]/8 text-[#FF5722]'
                          }`}>
                          {tx.amount > 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold">{tx.title}</p>
                          <span className={`text-[10px] font-semibold ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>{tx.date}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xs font-extrabold ${tx.amount > 0 ? 'text-[#10B981]' : 'text-white'}`}>
                          {tx.amount > 0 ? `+${tx.amount}` : `${tx.amount}`} ₴
                        </p>
                        <p className={`text-[9px] uppercase font-black ${tx.status === 'completed' ? 'text-[#10B981]' : 'text-[#FF5722]'
                          }`}>
                          {tx.status === 'completed' ? 'Виконано' : 'Обробка'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={`rounded-3xl border border-dashed p-8 text-center transition-all backdrop-blur-[12px] ${theme === 'light' ? 'bg-white/80 border-[#E5E7EB] text-[#001B3D]' : 'bg-[#1c2541]/40 border-white/10 text-gray-400'
                    }`}>
                    <TrendingUp className="w-7 h-7 mx-auto mb-1 opacity-55 text-[#FF5722]" />
                    <p className="text-xs font-bold">Історія виплат порожня</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="p-4 space-y-5 text-left animate-fade-in">
            {/* MAIN PROFILE SCREEN */}
            {profileSubPage === 'main' && (
              <div className="space-y-5 animate-fade-in">
                {/* Profile Card */}
                <div className={`rounded-[24px] p-5 shadow-sm border flex flex-col items-center text-center relative overflow-hidden transition-all backdrop-blur-[16px] ${theme === 'light' ? 'bg-white/85 border-[#E5E7EB]' : 'bg-[#1c2541]/45 border-white/10'
                  }`}>
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#FF5722] opacity-5 rounded-full"></div>

                  <div
                    className="relative mb-3 cursor-pointer group"
                    onClick={() => setShowAvatarEditModal(true)}
                    title="Змінити фото профілю"
                  >
                    <img
                      alt="User Avatar"
                      className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover transition-transform group-hover:scale-105"
                      src={userAvatar}
                    />
                    <div className="absolute inset-0 bg-black/45 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute bottom-0 right-0 bg-[#10B981] text-white p-0.5 rounded-full border-2 border-white flex items-center justify-center">
                      <CheckCircle className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>

                  <h2 className={`text-lg font-bold ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>{userName}</h2>

                  {isDiiaVerified ? (
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border my-2 ${theme === 'light'
                      ? 'bg-blue-50 border-blue-100 text-blue-800'
                      : 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                      }`}>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black italic ${theme === 'light' ? 'bg-[#001B3D] text-[#FF5722]' : 'bg-white text-[#FF5722]'}`}>Дія</span>
                      <span className="text-[10px] font-bold">Верифіковано через Дію</span>
                    </div>
                  ) : (
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border my-2 ${theme === 'light'
                      ? 'bg-green-50 border-green-100 text-green-800'
                      : 'bg-green-500/10 border-green-500/20 text-green-300'
                      }`}>
                      <span className="text-[10px] font-bold text-green-600 dark:text-green-400">Верифіковано по SMS</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 bg-[#FF9500]/10 px-3 py-1 rounded-xl mt-1">
                    <Award className="w-3.5 h-3.5 text-[#FF9500]" />
                    <span className={`text-xs font-black ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>{rating.toFixed(1)}</span>
                    <span className={`text-[10px] font-medium ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>(18 змін виконано)</span>
                  </div>
                </div>

                {/* Options Menu List */}
                <nav className="space-y-2">
                  <p className={`text-[10px] font-black uppercase tracking-wider px-1 ${theme === 'light' ? 'text-[#5b4039]/70' : 'text-gray-400'
                    }`}>Акаунт</p>

                  <div
                    onClick={() => setProfileSubPage('personal')}
                    className={`rounded-2xl p-4 flex items-center justify-between border cursor-pointer transition-all backdrop-blur-[12px] ${theme === 'light' ? 'bg-white/85 border-[#E5E7EB] hover:bg-white' : 'bg-[#1c2541]/45 border-white/10 hover:bg-[#252f55]/60'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${theme === 'light' ? 'bg-blue-50 text-blue-600' : 'bg-blue-500/10 text-blue-400'}`}>
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Особисті дані</p>
                        <p className={`text-[10px] font-medium mt-0.5 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>Ім’я, телефон, аватар</p>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 opacity-50 -rotate-90" />
                  </div>

                  <div
                    onClick={() => setProfileSubPage('docs')}
                    className={`rounded-2xl p-4 flex items-center justify-between border cursor-pointer transition-all backdrop-blur-[12px] ${theme === 'light' ? 'bg-white/85 border-[#E5E7EB] hover:bg-white' : 'bg-[#1c2541]/45 border-white/10 hover:bg-[#252f55]/60'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${theme === 'light' ? 'bg-purple-50 text-purple-600' : 'bg-purple-500/10 text-purple-400'}`}>
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Документи та підписи</p>
                        <p className={`text-[10px] font-medium mt-0.5 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>КПК контракти, верифікація Дії</p>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 opacity-50 -rotate-90" />
                  </div>

                  <p className={`text-[10px] font-black uppercase tracking-wider px-1 pt-3 ${theme === 'light' ? 'text-[#5b4039]/70' : 'text-gray-400'
                    }`}>Про додаток</p>

                  <div
                    onClick={() => setProfileSubPage('help')}
                    className={`rounded-2xl p-4 flex items-center justify-between border cursor-pointer transition-all backdrop-blur-[12px] ${theme === 'light' ? 'bg-white/85 border-[#E5E7EB] hover:bg-white' : 'bg-[#1c2541]/45 border-white/10 hover:bg-[#252f55]/60'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${theme === 'light' ? 'bg-amber-50 text-amber-600' : 'bg-amber-500/10 text-amber-400'}`}>
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Центр допомоги</p>
                        <p className={`text-[10px] font-medium mt-0.5 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>FAQ, правила штрафів, підтримка</p>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 opacity-50 -rotate-90" />
                  </div>

                  <div
                    onClick={() => setProfileSubPage('developer')}
                    className={`rounded-2xl p-4 flex items-center justify-between border cursor-pointer transition-all backdrop-blur-[12px] ${theme === 'light' ? 'bg-white/85 border-[#E5E7EB] hover:bg-white' : 'bg-[#1c2541]/45 border-white/10 hover:bg-[#252f55]/60'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${theme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-white/10 text-slate-350'}`}>
                        <Settings className="w-4 h-4" />
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Панель розробника</p>
                        <p className={`text-[10px] font-medium mt-0.5 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>Симуляція дедлайну, таймери</p>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 opacity-50 -rotate-90" />
                  </div>

                  {/* Log Out Button */}
                  <div className="pt-6">
                    <button
                      onClick={handleSignOut}
                      className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-550/20 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-98 transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Вийти з акаунту
                    </button>
                  </div>
                </nav>
              </div>
            )}

            {/* SUBSCENARIO: PERSONAL INFO */}
            {profileSubPage === 'personal' && (
              <div className="space-y-4 animate-fade-in">
                <button
                  onClick={() => setProfileSubPage('main')}
                  className={`flex items-center gap-1 text-xs font-bold hover:underline ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}
                >
                  <ArrowLeft className="w-4 h-4 text-[#FF5722]" /> Назад
                </button>

                <h3 className={`text-base font-black uppercase tracking-tight ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Особисті дані</h3>

                <div className={`rounded-3xl p-5 border transition-all backdrop-blur-[16px] ${theme === 'light'
                  ? 'bg-white/90 border-[#E5E7EB] shadow-[0_8px_30px_-6px_rgba(255,87,34,0.08)]'
                  : 'bg-[#1c2541]/45 border-white/10 shadow-[0_8px_30px_-6px_rgba(255,87,34,0.2)]'
                  } space-y-4`}>
                  <div>
                    <label className={`block text-[10px] font-bold uppercase mb-1.5 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>Ваше ім’я та прізвище</label>
                    <div className={`w-full border rounded-xl px-4 py-3 text-xs font-bold outline-none cursor-not-allowed ${theme === 'light'
                      ? 'bg-gray-100/60 border-[#E5E7EB] text-[#5b4039]'
                      : 'bg-[#121829]/30 border-white/5 text-gray-400'
                      }`}>
                      {userName}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[10px] font-bold uppercase mb-1.5 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>Номер телефону</label>
                    <div className={`w-full border rounded-xl px-4 py-3 text-xs font-bold outline-none cursor-not-allowed ${theme === 'light'
                      ? 'bg-gray-100/60 border-[#E5E7EB] text-[#5b4039]'
                      : 'bg-[#121829]/30 border-white/5 text-gray-400'
                      }`}>
                      {userPhone}
                    </div>
                  </div>

                  <div className={`p-3 rounded-2xl text-[10px] font-semibold flex items-start gap-2 ${theme === 'light'
                    ? 'bg-amber-50 border border-amber-250 text-amber-800'
                    : 'bg-amber-500/10 border border-amber-500/20 text-amber-300'
                    }`}>
                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                    <span>Для зміни імені чи номера телефону, будь ласка, пройдіть повторну авторизацію.</span>
                  </div>
                </div>
              </div>
            )}

            {/* SUBSCENARIO: DOCUMENTS */}
            {profileSubPage === 'docs' && (
              <div className="space-y-4 animate-fade-in">
                <button
                  onClick={() => setProfileSubPage('main')}
                  className={`flex items-center gap-1 text-xs font-bold hover:underline ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}
                >
                  <ArrowLeft className="w-4 h-4 text-[#FF5722]" /> Назад
                </button>

                <h3 className={`text-base font-black uppercase tracking-tight ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Цифрові документи</h3>

                <div className={`rounded-3xl p-5 border transition-all backdrop-blur-[16px] ${theme === 'light'
                  ? 'bg-white/90 border-[#E5E7EB] shadow-[0_8px_30px_-6px_rgba(255,87,34,0.08)]'
                  : 'bg-[#1c2541]/45 border-white/10 shadow-[0_8px_30px_-6px_rgba(255,87,34,0.2)]'
                  } space-y-4`}>
                  <div className="flex items-center justify-between border-b pb-3.5 border-dashed border-black/10 dark:border-white/10">
                    <div className="text-left">
                      <p className={`text-xs font-bold ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Податковий статус</p>
                      <p className={`text-[10px] font-medium mt-0.5 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>Гіг-контракт або ФОП 3 група</p>
                    </div>
                    <span className="text-[10px] bg-green-500/10 text-green-500 px-2.5 py-1 rounded font-black border border-green-500/20">АКТИВНИЙ</span>
                  </div>

                  <div className="flex items-center justify-between border-b pb-3.5 border-dashed border-black/10 dark:border-white/10">
                    <div className="text-left">
                      <p className={`text-xs font-bold ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Цифровий паспорт (Дія)</p>
                      <p className={`text-[10px] font-medium mt-0.5 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>Паспорт верифіковано держ.реєстром</p>
                    </div>
                    {isDiiaVerified ? (
                      <span className="text-[10px] bg-blue-500/10 text-blue-500 px-2.5 py-1 rounded font-black border border-blue-500/20">ВЕРИФІКОВАНО</span>
                    ) : (
                      <span className="text-[10px] bg-gray-500/10 text-gray-500 px-2.5 py-1 rounded font-black border border-gray-500/20">НЕ ВЕРИФІКОВАНО</span>
                    )}
                  </div>

                  {!isDiiaVerified && (
                    <button
                      onClick={() => {
                        triggerToast("🔄 Запит верифікації в Дія...");
                        setTimeout(() => {
                          triggerToast("Профіль успішно верифіковано держ.реєстром через Дію! 🤝");
                        }, 1500);
                      }}
                      className="w-full bg-[#001B3D] text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
                    >
                      <span className="bg-white text-[#001B3D] px-1.5 py-0.5 rounded text-[8px] font-black italic">Дія</span>
                      Пройти верифікацію Дія
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* SUBSCENARIO: HELP CENTER */}
            {profileSubPage === 'help' && (
              <div className="space-y-4 animate-fade-in max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
                <button
                  onClick={() => setProfileSubPage('main')}
                  className={`flex items-center gap-1 text-xs font-bold hover:underline ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}
                >
                  <ArrowLeft className="w-4 h-4 text-[#FF5722]" /> Назад
                </button>

                <h3 className={`text-base font-black uppercase tracking-tight ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Центр допомоги</h3>

                <div className={`rounded-3xl p-5 border transition-all backdrop-blur-[16px] ${theme === 'light'
                  ? 'bg-white/90 border-[#E5E7EB] shadow-[0_8px_30px_-6px_rgba(255,87,34,0.08)]'
                  : 'bg-[#1c2541]/45 border-white/10 shadow-[0_8px_30px_-6px_rgba(255,87,34,0.2)]'
                  } space-y-4`}>
                  <div className="text-left space-y-1">
                    <p className={`text-xs font-black ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Як працює виплата грошей?</p>
                    <p className={`text-[10px] leading-relaxed ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>
                      Гроші за зміну резервуються роботодавцем заздалегідь. Оплата зараховується на ваш цифровий баланс одразу після того, як роботодавець підтвердить виконання (Чек-аут). Вивести накопичені кошти на картку будь-якого банку України можна в розділі «Гаманець».
                    </p>
                  </div>

                  <div className="text-left space-y-1 pt-2 border-t border-dashed border-black/10 dark:border-white/10">
                    <p className={`text-xs font-black ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Що станеться при скасуванні зміни?</p>
                    <p className={`text-[10px] leading-relaxed ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>
                      Безкоштовно відмовитись від зміни можна більше ніж за 2 години до початку. Якщо до зміни залишилося менше 2 годин, то скасування вважається терміновим. У цьому випадку нараховується штраф у розмірі 250 ₴.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SUBSCENARIO: DEVELOPER PANEL */}
            {profileSubPage === 'developer' && (
              <div className="space-y-4 animate-fade-in">
                <button
                  onClick={() => setProfileSubPage('main')}
                  className={`flex items-center gap-1 text-xs font-bold hover:underline ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}
                >
                  <ArrowLeft className="w-4 h-4 text-[#FF5722]" /> Назад
                </button>

                <h3 className={`text-base font-black uppercase tracking-tight ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Панель розробника</h3>

                <div className={`rounded-3xl p-5 border transition-all backdrop-blur-[16px] ${theme === 'light'
                  ? 'bg-white/90 border-[#E5E7EB] shadow-[0_8px_30px_-6px_rgba(255,87,34,0.08)]'
                  : 'bg-[#1c2541]/45 border-white/10 shadow-[0_8px_30px_-6px_rgba(255,87,34,0.2)]'
                  } space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div className="text-left pr-4">
                      <p className={`text-xs font-black leading-tight ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>
                        Симуляція дедлайну (залишилось 2 год)
                      </p>
                      <p className={`text-[10px] font-semibold mt-1.5 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>
                        Робить зміни, до початку яких залишилось менше 2 годин, «гарячими» та переміщує їх на самий верх стрічки пошуку.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                      <input
                        type="checkbox"
                        checked={simulateDeadline}
                        onChange={(e) => {
                          setSimulateDeadline(e.target.checked);
                          triggerToast(e.target.checked ? 'Симуляція дедлайну активована! Гарячі зміни підняті вгору стрічки 🔥' : 'Симуляцію дедлайну вимкнено.');
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF5722]"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- PERSISTENT FLOATING BOTTOM NAVIGATION (B2C Worker only - Glassmorphic overlay) --- */}
      <nav className={`absolute bottom-4 left-4 right-4 z-40 border h-[76px] rounded-[24px] shadow-[0_12px_32px_rgba(0,0,0,0.12)] flex justify-around items-center px-2 transition-all backdrop-blur-[24px] ${theme === 'light'
        ? 'bg-white/70 border-black/10'
        : 'bg-[#0f172a]/70 border-white/10'
        }`}>
        <button
          onClick={() => {
            setActiveTab('feed');
            setSelectedShift(null);
            setProfileSubPage('main');
          }}
          className={`flex flex-col items-center justify-center w-[64px] h-[58px] rounded-[18px] relative transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${activeTab === 'feed'
            ? 'text-[#FF5722]'
            : theme === 'light' ? 'text-[#001B3D]' : 'text-gray-300'
            }`}
        >
          {activeTab === 'feed' && <div className="absolute inset-0 bg-[#FF5722]/8 rounded-[18px]"></div>}
          <Search className="w-5 h-5 relative z-10" />
          <span className="text-[10px] font-bold mt-0.5 relative z-10">Пошук</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('my-shifts');
            setSelectedShift(null);
            setProfileSubPage('main');
          }}
          className={`flex flex-col items-center justify-center w-[64px] h-[58px] rounded-[18px] relative transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${activeTab === 'my-shifts'
            ? 'text-[#FF5722]'
            : theme === 'light' ? 'text-[#001B3D]' : 'text-gray-300'
            }`}
        >
          {activeTab === 'my-shifts' && <div className="absolute inset-0 bg-[#FF5722]/8 rounded-[18px]"></div>}
          <Calendar className="w-5 h-5 relative z-10" />
          <span className="text-[10px] font-bold mt-0.5 relative z-10">Зміни</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('wallet');
            setSelectedShift(null);
            setProfileSubPage('main');
          }}
          className={`flex flex-col items-center justify-center w-[64px] h-[58px] rounded-[18px] relative transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${activeTab === 'wallet'
            ? 'text-[#FF5722]'
            : theme === 'light' ? 'text-[#001B3D]' : 'text-gray-300'
            }`}
        >
          {activeTab === 'wallet' && <div className="absolute inset-0 bg-[#FF5722]/8 rounded-[18px]"></div>}
          <Wallet className="w-5 h-5 relative z-10" />
          <span className="text-[10px] font-bold mt-0.5 relative z-10">Гаманець</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('profile');
            setSelectedShift(null);
            setProfileSubPage('main');
          }}
          className={`flex flex-col items-center justify-center w-[64px] h-[58px] rounded-[18px] relative transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${activeTab === 'profile'
            ? 'text-[#FF5722]'
            : theme === 'light' ? 'text-[#001B3D]' : 'text-gray-300'
            }`}
        >
          {activeTab === 'profile' && <div className="absolute inset-0 bg-[#FF5722]/8 rounded-[18px]"></div>}
          <User className="w-5 h-5 relative z-10" />
          <span className="text-[10px] font-bold mt-0.5 relative z-10">Профіль</span>
        </button>
      </nav>
    </>
  );
}

// Inline fallback icon component to resolve missing brief case icon
function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
  );
}
