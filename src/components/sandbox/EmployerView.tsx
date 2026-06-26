/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Info,
  QrCode,
  AlertTriangle,
  PlusCircle,
  TrendingUp,
  Wallet,
  Building,
  LogOut,
  Trash2,
  FileText,
  Check
} from 'lucide-react';
import { Shift, UkCalendarDay, Branch, Transaction } from '../../types/sandbox';
import { getUkMonthGenitive, POPULAR_ROLES } from '../../utils/sandbox';

interface EmployerViewProps {
  theme: 'light' | 'dark' | 'minimalist';
  b2bTab: 'dashboard' | 'shifts' | 'create' | 'wallet' | 'profile';
  setB2bTab: React.Dispatch<React.SetStateAction<'dashboard' | 'shifts' | 'create' | 'wallet' | 'profile'>>;
  employerBalance: number;
  employerFrozenBalance: number;
  shifts: Shift[];
  handleApproveShift: (shiftId: string, price: number) => void;
  setShowDisputeModalId: React.Dispatch<React.SetStateAction<string | null>>;
  setShowB2BQRModalId: React.Dispatch<React.SetStateAction<string | null>>;
  setArbitratorModalShiftId: React.Dispatch<React.SetStateAction<string | null>>;
  newRole: string;
  setNewRole: React.Dispatch<React.SetStateAction<string>>;
  isRoleComboOpen: boolean;
  setIsRoleComboOpen: React.Dispatch<React.SetStateAction<boolean>>;
  newCategory: 'Допомога' | 'Кураторство' | 'Наука' | 'University Event / Volunteer';
  setNewCategory: React.Dispatch<React.SetStateAction<'Допомога' | 'Кураторство' | 'Наука' | 'University Event / Volunteer'>>;
  newPrice: string;
  setNewPrice: React.Dispatch<React.SetStateAction<string>>;
  newDate: string;
  setNewDate: React.Dispatch<React.SetStateAction<string>>;
  newTime: string;
  setNewTime: React.Dispatch<React.SetStateAction<string>>;
  newAddress: string;
  setNewAddress: React.Dispatch<React.SetStateAction<string>>;
  newDetails: string;
  setNewDetails: React.Dispatch<React.SetStateAction<string>>;
  calendarDays: UkCalendarDay[];
  handleCreateShift: (e: React.FormEvent) => void;
  requiresScreening: boolean;
  setRequiresScreening: React.Dispatch<React.SetStateAction<boolean>>;
  branches: Branch[];
  selectedBranchId: string;
  setSelectedBranchId: (branchId: string) => void;

  companyName: string;
  companyDetails: string;
  transactions: Transaction[];
  userName: string;
  userPhone: string;
  userAvatar: string;
  handleSignOut: () => void;
  handleAddBranch: (name: string, address: string, requiresScreening: boolean) => void;
  handleDeleteBranch: (branchId: string) => void;
  handleDeposit: (amount: number) => void;
}

export function EmployerView({
  theme,
  b2bTab,
  setB2bTab,
  employerBalance,
  employerFrozenBalance,
  shifts,
  handleApproveShift,
  setShowDisputeModalId,
  setShowB2BQRModalId,
  setArbitratorModalShiftId,
  newRole,
  setNewRole,
  isRoleComboOpen,
  setIsRoleComboOpen,
  newCategory,
  setNewCategory,
  newPrice,
  setNewPrice,
  newDate,
  setNewDate,
  newTime,
  setNewTime,
  newAddress,
  setNewAddress,
  newDetails,
  setNewDetails,
  calendarDays,
  handleCreateShift,
  requiresScreening,
  setRequiresScreening,
  branches,
  selectedBranchId,
  setSelectedBranchId,

  companyName,
  companyDetails,
  transactions,
  userName,
  userPhone,
  userAvatar,
  handleSignOut,
  handleAddBranch,
  handleDeleteBranch,
  handleDeposit
}: EmployerViewProps) {
  const totalPublished = shifts.length;
  const totalSpent = shifts.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.price, 0);
  const activeShifts = shifts.filter(s => s.status === 'booked' || s.status === 'in_progress' || s.status === 'pending_approval').length;
  const disputedShifts = shifts.filter(s => s.status === 'disputed').length;
  const openShifts = shifts.filter(s => s.status === 'open').length;

  const coveragePct = totalPublished > 0 ? Math.round(((totalPublished - openShifts) / totalPublished) * 100) : 0;

  // Local state for B2B tabs
  const [shiftsSubTab, setShiftsSubTab] = useState<'open' | 'active' | 'disputes' | 'history'>('active');
  const [historyFilter, setHistoryFilter] = useState<'completed' | 'expired'>('completed');
  const [depositAmountInput, setDepositAmountInput] = useState<string>('15000');
  const [newBranchName, setNewBranchName] = useState<string>('');
  const [newBranchAddress, setNewBranchAddress] = useState<string>('');
  const [newBranchScreening, setNewBranchScreening] = useState<boolean>(false);

  // Filtered shifts based on sub-tab
  const filteredShiftsList = shifts.filter(s => {
    if (shiftsSubTab === 'open') return s.status === 'open';
    if (shiftsSubTab === 'active') return s.status === 'booked' || s.status === 'in_progress' || s.status === 'pending_approval';
    if (shiftsSubTab === 'disputes') return s.status === 'disputed';
    if (shiftsSubTab === 'history') return s.status === historyFilter;
    return true;
  });

  return (
    <>
      <div className="flex-1 overflow-y-auto pb-28 no-scrollbar relative z-10">
        
        {/* ======================================================== */}
        {/* 1. B2B DASHBOARD */}
        {/* ==============================        {/* ======================================================== */}
        {/* 1. B2B DASHBOARD */}
        {/* ======================================================== */}
        {b2bTab === 'dashboard' && (
          <div className="p-4 space-y-4 text-left animate-fade-in">
            {/* Header Banner */}
            <div className={`p-5 rounded-3xl border transition-all ${
              theme === 'minimalist'
                ? 'bg-white border-gray-150 text-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.02)]'
                : theme === 'light'
                  ? 'bg-slate-50 border-slate-200 text-slate-800 shadow-sm'
                  : 'bg-gradient-to-br from-[#1c2541]/80 to-[#121829] border-white/5 text-white'
            }`}>
              <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-black ${
                theme === 'minimalist' ? 'bg-slate-900 text-white' : 'bg-[#FF5722] text-white'
              }`}>
                Панель Моніторингу
              </span>
              <h2 className={`text-lg font-black mt-2 leading-tight ${theme === 'minimalist' || theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Вітаємо, {userName}!</h2>
              <p className={`text-[10px] mt-1 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-500' : 'text-gray-300'}`}>{companyName} · {companyDetails}</p>
            </div>

            {/* Corporate Balance card */}
            <div className={`rounded-3xl p-5 border transition-all ${
              theme === 'minimalist'
                ? 'bg-white border-gray-150 shadow-[0_4px_24px_rgba(0,0,0,0.03)]'
                : theme === 'light'
                  ? 'bg-white border-slate-200 shadow-sm'
                  : 'bg-[#1c2541]/45 border-white/10 shadow-md backdrop-blur-[16px]'
              } flex items-center justify-between`}>
              <div>
                <p className={`text-[10px] uppercase font-bold ${theme === 'minimalist' || theme === 'light' ? 'text-slate-400' : 'text-gray-400'}`}>Депозит організації (бали)</p>
                <h4 className={`text-xl font-black mt-0.5 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{Math.round(employerBalance / 10).toLocaleString()} балів</h4>
              </div>
              {employerFrozenBalance > 0 ? (
                <div className="text-right">
                  <p className="text-[10px] uppercase font-black text-[#FF9500]">Зарезервовано (Сейф)</p>
                  <h4 className="text-sm font-black mt-0.5 text-[#FF9500]">{Math.round(employerFrozenBalance / 10).toLocaleString()} балів</h4>
                </div>
              ) : (
                <span className="text-[9px] font-black uppercase bg-[#10B981]/8 text-[#10B981] px-2 py-1 rounded border border-[#10B981]/25">
                  АКТИВНИЙ
                </span>
              )}
            </div>

            {/* Real-time B2B Analytics & Monitoring Grid */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className={`p-4 rounded-2xl border transition-all ${
                theme === 'minimalist'
                  ? 'bg-white border-gray-150 shadow-[0_4px_20px_rgba(0,0,0,0.02)]'
                  : theme === 'light'
                    ? 'bg-white border-slate-200 shadow-sm'
                    : 'bg-[#1c2541]/45 border-white/10 shadow-md backdrop-blur-[16px]'
              }`}>
                <p className={`text-[10px] uppercase font-black tracking-wider ${theme === 'minimalist' || theme === 'light' ? 'text-slate-400' : 'text-gray-450'}`}>Усього опубліковано</p>
                <div className="flex justify-between items-end mt-1.5">
                  <h4 className={`text-xl font-black leading-none ${theme === 'minimalist' || theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                    {totalPublished}
                  </h4>
                  <span className="text-[10px] text-green-500 font-bold">Івенти 📋</span>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border transition-all ${
                theme === 'minimalist'
                  ? 'bg-white border-gray-150 shadow-[0_4px_20px_rgba(0,0,0,0.02)]'
                  : theme === 'light'
                    ? 'bg-white border-slate-200 shadow-sm'
                    : 'bg-[#1c2541]/45 border-white/10 shadow-md backdrop-blur-[16px]'
              }`}>
                <p className={`text-[10px] uppercase font-black tracking-wider ${theme === 'minimalist' || theme === 'light' ? 'text-slate-400' : 'text-gray-450'}`}>Рейтингових балів видано</p>
                <div className="flex justify-between items-end mt-1.5">
                  <h4 className={`text-xl font-black leading-none ${theme === 'minimalist' || theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                    {Math.round(totalSpent / 10).toLocaleString()} балів
                  </h4>
                  <span className="text-[10px] text-[#FF5722] font-black">Рейтинг 🎓</span>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border transition-all ${
                theme === 'minimalist'
                  ? 'bg-white border-gray-150 shadow-[0_4px_20px_rgba(0,0,0,0.02)]'
                  : theme === 'light'
                    ? 'bg-white border-slate-200 shadow-sm'
                    : 'bg-[#1c2541]/45 border-white/10 shadow-md backdrop-blur-[16px]'
              }`}>
                <p className={`text-[10px] uppercase font-black tracking-wider ${theme === 'minimalist' || theme === 'light' ? 'text-slate-400' : 'text-gray-460'}`}>Заброньовано івентів</p>
                <div className="flex justify-between items-end mt-1.5">
                  <h4 className={`text-xl font-black leading-none ${theme === 'minimalist' || theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                    {activeShifts}
                  </h4>
                  <span className="text-[9px] text-[#FF9500] font-black uppercase">У РОБОТІ ⏳</span>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border transition-all ${
                theme === 'minimalist'
                  ? 'bg-white border-gray-150 shadow-[0_4px_20px_rgba(0,0,0,0.02)]'
                  : theme === 'light'
                    ? 'bg-white border-slate-200 shadow-sm'
                    : 'bg-[#1c2541]/45 border-white/10 shadow-md backdrop-blur-[16px]'
              }`}>
                <p className={`text-[10px] uppercase font-black tracking-wider ${theme === 'minimalist' || theme === 'light' ? 'text-slate-400' : 'text-gray-465'}`}>Суперечки (Арбітраж)</p>
                <div className="flex justify-between items-end mt-1.5">
                  <h4 className={`text-xl font-black leading-none ${disputedShifts > 0 ? 'text-red-500 animate-pulse' : theme === 'minimalist' || theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                    {disputedShifts}
                  </h4>
                  <span className="text-[9px] text-red-500 font-black uppercase">СУПЕРЕЧКИ ⚖️</span>
                </div>
              </div>
            </div>

            {/* Coverage Breakdown Dashboard */}
            <div className={`rounded-3xl p-5 border transition-all ${
              theme === 'minimalist'
                ? 'bg-white border-gray-150 shadow-[0_4px_24px_rgba(0,0,0,0.03)]'
                : theme === 'light'
                  ? 'bg-white border-slate-200 shadow-sm'
                  : 'bg-[#1c2541]/45 border-white/10 shadow-md backdrop-blur-[16px]'
              }`}>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h4 className={`text-xs font-black uppercase tracking-wider ${theme === 'minimalist' || theme === 'light' ? 'text-slate-800' : 'text-white'}`}>Заповненість івентів</h4>
                  <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Співвідношення опублікованих та зайнятих івентів</p>
                </div>
                <span className="text-sm font-black text-[#FF5722]">{coveragePct}%</span>
              </div>
              <div className={`w-full h-2.5 rounded-full overflow-hidden flex ${theme === 'minimalist' || theme === 'light' ? 'bg-slate-100' : 'bg-gray-250/20'}`}>
                <div
                  className="h-full bg-gradient-to-r from-[#FF5722] to-[#e64a19] rounded-full transition-all duration-500"
                  style={{ width: `${coveragePct}%` }}
                />
              </div>
            </div>

            {/* Premium Interactive Matching Funnel Chart */}
            <div className={`rounded-3xl p-5 border transition-all ${
              theme === 'minimalist'
                ? 'bg-white border-gray-150 shadow-[0_4px_24px_rgba(0,0,0,0.03)]'
                : theme === 'light'
                  ? 'bg-white border-slate-200 shadow-sm'
                  : 'bg-[#1c2541]/45 border-white/10 shadow-md backdrop-blur-[16px]'
              }`}>
              <h4 className={`text-xs font-black uppercase tracking-wider mb-4 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                Воронка закриття (Алгоритм Matching)
              </h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-blue-500/10 rounded-full flex items-center justify-center font-bold text-xs text-blue-500">1</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className={theme === 'minimalist' || theme === 'light' ? 'text-slate-800' : 'text-white'}>Підбір кандидатів (ШІ)</span>
                      <span className="text-gray-400">156 профілів</span>
                    </div>
                    <div className="w-full bg-gray-250/10 h-1.5 rounded-full mt-1">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: '100%' }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-[#FF9500]/10 rounded-full flex items-center justify-center font-bold text-xs text-[#FF9500]">2</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className={theme === 'minimalist' || theme === 'light' ? 'text-slate-800' : 'text-white'}>Перегляд контактів та резюме</span>
                      <span className="text-gray-450">48 волонтерів</span>
                    </div>
                    <div className="w-full bg-gray-250/10 h-1.5 rounded-full mt-1">
                      <div className="bg-[#FF9500] h-full rounded-full" style={{ width: '48%' }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-[#FF5722]/10 rounded-full flex items-center justify-center font-bold text-xs text-[#FF5722]">3</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className={theme === 'minimalist' || theme === 'light' ? 'text-slate-800' : 'text-white'}>Бронювання та Дія.Підпис</span>
                      <span className="text-gray-500">{activeShifts + totalSpent / 1000 > 0 ? Math.round(activeShifts + totalSpent / 1000) : 4} робітників</span>
                    </div>
                    <div className="w-full bg-gray-250/10 h-1.5 rounded-full mt-1">
                      <div className="bg-[#FF5722] h-full rounded-full" style={{ width: '15%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SaaS Instant Metrics */}
            <div className={`p-4 rounded-3xl border transition-all ${
              theme === 'minimalist'
                ? 'bg-slate-50 border-gray-150 text-slate-600'
                : theme === 'light'
                  ? 'bg-blue-50/40 border-blue-100 text-slate-700'
                  : 'bg-[#1c2541]/25 border-orange-500/10 text-gray-300'
            }`}>
              <div className="flex items-start gap-2.5">
                <Info className="w-4.5 h-4.5 text-[#FF5722] shrink-0 mt-0.5" />
                <div className="text-[10px] leading-relaxed">
                  <strong>Швидкий звіт:</strong> Середній рейтинг залучених волонтерів становить <span className="text-[#FF5722] font-black">4.92 ★</span>. 
                  Усі бали нараховуються автоматично після підтвердження. Для старту роботи надайте волонтеру унікальний QR-код.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. B2B SHIFTS LIST */}
        {/* ======================================================== */}
        {b2bTab === 'shifts' && (
          <div className="p-4 space-y-4 text-left animate-fade-in">
            <h2 className={`text-base font-black uppercase tracking-tight ${theme === 'minimalist' || theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
              Управління івентами
            </h2>

            {/* Sub-tabs for shifts status filtering */}
            <div className={`p-1 rounded-xl flex gap-1 ${
              theme === 'minimalist'
                ? 'bg-slate-100'
                : theme === 'light'
                  ? 'bg-slate-100'
                  : 'bg-[#121829]/65'
            }`}>
              {(['active', 'open', 'disputes', 'history'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setShiftsSubTab(tab)}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all ${shiftsSubTab === tab
                    ? theme === 'minimalist'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-[#FF5722] text-white shadow-sm'
                    : theme === 'minimalist' || theme === 'light'
                      ? 'text-slate-500 hover:text-slate-800'
                      : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {tab === 'active' && 'Активні'}
                  {tab === 'open' && 'Відкриті'}
                  {tab === 'disputes' && 'Спори'}
                  {tab === 'history' && 'Історія'}
                </button>
              ))}
            </div>

            {/* History specific sub-filters */}
            {shiftsSubTab === 'history' && (
              <div className="flex gap-2 justify-start mt-1">
                {(['completed', 'expired'] as const).map(opt => (
                  <button
                    key={opt}
                    onClick={() => setHistoryFilter(opt)}
                    className={`px-3 py-1 rounded-full text-[9px] font-black transition-all border uppercase tracking-wider ${
                      historyFilter === opt
                        ? theme === 'minimalist'
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-[#FF5722] border-[#FF5722] text-white'
                        : theme === 'minimalist' || theme === 'light'
                          ? 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          : 'bg-[#1c2541]/30 border-white/5 text-gray-400 hover:border-white/10'
                    }`}
                  >
                    {opt === 'completed' && 'Успішно виконано'}
                    {opt === 'expired' && 'Не знайдено волонтера'}
                  </button>
                ))}
              </div>
            )}

            {/* Shifts list container */}
            <div className="space-y-3">
              {filteredShiftsList.length === 0 ? (
                <div className={`p-8 rounded-2xl border text-center ${theme === 'minimalist' || theme === 'light' ? 'bg-white border-slate-250' : 'bg-[#1c2541]/30 border-white/5'}`}>
                  <p className="text-xs font-bold text-gray-400">Івентів у цій категорії не знайдено.</p>
                </div>
              ) : (
                filteredShiftsList.map((shift) => (
                  <div
                    key={shift.id}
                    className={`rounded-2xl p-4 border transition-all ${
                      theme === 'minimalist'
                        ? 'bg-white border-gray-150 shadow-[0_2px_15px_rgba(0,0,0,0.015)] hover:border-slate-350'
                        : theme === 'light'
                          ? 'bg-white border-slate-200 hover:shadow-sm'
                          : 'bg-[#1c2541]/40 border-white/5 hover:border-white/10'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-2.5">
                      <div>
                        <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${shift.status === 'completed'
                          ? 'bg-green-500/10 text-green-500'
                          : shift.status === 'expired'
                            ? 'bg-gray-500/15 text-gray-400'
                          : shift.status === 'disputed'
                            ? 'bg-red-500/15 text-red-500 animate-pulse'
                            : shift.status === 'pending_approval'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-blue-500/10 text-blue-500'
                          }`}>
                          {shift.status === 'open' && 'Відкритий івент'}
                          {shift.status === 'booked' && 'Заброньовано'}
                          {shift.status === 'in_progress' && 'В процесі проведення'}
                          {shift.status === 'pending_approval' && 'Очікує зарахування'}
                          {shift.status === 'disputed' && 'Відкрито Спір'}
                          {shift.status === 'completed' && 'Успішно проведено'}
                          {shift.status === 'expired' && 'Не знайдено волонтера'}
                        </span>
                        <h4 className={`text-sm font-black mt-1 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                          {shift.role}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{shift.company} · {shift.category}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-[#FF5722]">{shift.volunteerReward || `${Math.round(shift.price / 10)} балів`}</span>
                        <p className="text-[9px] text-gray-400 mt-0.5">{shift.duration}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-gray-450 border-t border-gray-250/5 pt-2.5 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#FF5722]" />
                        <span>
                          {shift.date} {getUkMonthGenitive(shift.date)} ({shift.dayName}) · {shift.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate">{shift.address}</span>
                      </div>
                    </div>

                    {/* Quick interactive actions based on status */}
                    <div className="flex flex-col gap-2">
                      {shift.status === 'booked' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowB2BQRModalId(shift.id)}
                            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all active:scale-95 border ${
                              theme === 'minimalist'
                                ? 'bg-slate-900 border-transparent text-white'
                                : 'bg-[#001B3D] border-white/5 text-white'
                            }`}
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            Надати QR-код
                          </button>
                        </div>
                      )}

                      {shift.status === 'pending_approval' && (
                        <div className="flex flex-col gap-2 bg-[#FF5722]/5 p-2.5 rounded-xl border border-[#FF5722]/15">
                          <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-[#FF5722] shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] font-bold text-[#FF5722]">Волонтер завершив участь</p>
                              {shift.workComment && <p className="text-[9px] text-gray-400 mt-0.5">Коментар: &quot;{shift.workComment}&quot;</p>}
                            </div>
                          </div>
                          <div className="flex gap-2 mt-1">
                            <button
                              onClick={() => handleApproveShift(shift.id, shift.price)}
                              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all active:scale-95"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Підтвердити бали
                            </button>
                            <button
                              onClick={() => setShowDisputeModalId(shift.id)}
                              className="px-3 bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95"
                            >
                              Спір
                            </button>
                          </div>
                        </div>
                      )}

                      {shift.status === 'disputed' && (
                        <button
                          onClick={() => setArbitratorModalShiftId(shift.id)}
                          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Відкрити арбітраж
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        {/* 3. B2B CREATE SHIFT */}
        {/* ======================================================== */}
        {b2bTab === 'create' && (
          <div className="p-4 space-y-4 text-left animate-fade-in">
            <div className="flex justify-between items-center mb-1">
              <h2 className={`text-base font-black uppercase tracking-tight ${theme === 'minimalist' || theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                Новий івент вручну
              </h2>
            </div>

            <form onSubmit={handleCreateShift} className="space-y-4">
              {/* Select branch drop down */}
              <div>
                <label className={`block text-[10px] font-black uppercase mb-1 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-500' : 'text-gray-300'}`}>Оберіть кафедру / підрозділ</label>
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none ${
                    theme === 'minimalist' || theme === 'light'
                      ? 'bg-white border-slate-200 text-slate-800 focus:border-slate-400'
                      : 'bg-[#121829]/50 border-[#2a3454] text-white focus:border-[#FF5722]'
                    }`}
                >
                  <option value="">-- Вказати адресу вручну --</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <p className={`text-[9px] mt-1.5 italic ${theme === 'minimalist' || theme === 'light' ? 'text-slate-400' : 'text-gray-400'}`}>Заповніть адресу автоматично або оберіть ручне введення.</p>
              </div>

              <div className="relative role-combobox-container">
                <label className={`block text-[10px] font-black uppercase mb-1 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-500' : 'text-gray-355'}`}>Посада / Роль волонтера *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Напр: Координатор, Помічник"
                    value={newRole}
                    onChange={(e) => {
                      setNewRole(e.target.value);
                      setIsRoleComboOpen(true);
                    }}
                    onFocus={() => setIsRoleComboOpen(true)}
                    className={`flex-1 border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none ${
                      theme === 'minimalist' || theme === 'light'
                        ? 'bg-white border-slate-200 text-slate-800 focus:border-slate-400'
                        : 'bg-[#121829]/50 border-[#2a3454] text-white focus:border-[#FF5722]'
                      }`}
                  />
                </div>
                <p className={`text-[9px] mt-1.5 italic ${theme === 'minimalist' || theme === 'light' ? 'text-slate-400' : 'text-gray-400'}`}>Введіть назву волонтерської ролі, наприклад: Координатор, Асистент, Фотограф.</p>

                {isRoleComboOpen && (
                  <div className={`absolute left-0 right-0 z-30 mt-1 border rounded-xl shadow-lg max-h-40 overflow-y-auto no-scrollbar ${
                    theme === 'minimalist' || theme === 'light' ? 'bg-white border-slate-200 shadow-md' : 'bg-[#121829] border-white/10'
                  }`}>
                    {POPULAR_ROLES.filter(r => r.toLowerCase().includes(newRole.toLowerCase())).map((roleOption) => (
                      <button
                        key={roleOption}
                        type="button"
                        onClick={() => {
                          setNewRole(roleOption);
                          setIsRoleComboOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-all ${
                          theme === 'minimalist' || theme === 'light' ? 'hover:bg-slate-50 text-slate-800' : 'hover:bg-[#1c2541] text-white'
                        }`}
                      >
                        {roleOption}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[10px] font-black uppercase mb-1 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-500' : 'text-gray-350'}`}>Категорія заходу</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as 'Допомога' | 'Кураторство' | 'Наука' | 'University Event / Volunteer')}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none ${
                      theme === 'minimalist' || theme === 'light'
                        ? 'bg-white border-slate-200 text-slate-800 focus:border-slate-400'
                        : 'bg-[#121829]/50 border-[#2a3454] text-white'
                      }`}
                  >
                    <option value="Допомога">Організація / Допомога</option>
                    <option value="Кураторство">Кураторство / Менторство</option>
                    <option value="Наука">Наука / Конференції</option>
                    <option value="University Event / Volunteer">Університетський захід</option>
                  </select>
                  <p className={`text-[9px] mt-1.5 italic ${theme === 'minimalist' || theme === 'light' ? 'text-slate-400' : 'text-gray-400'}`}>Напрям активності волонтерів.</p>
                </div>
                <div>
                  <label className={`block text-[10px] font-black uppercase mb-1 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-500' : 'text-gray-355'}`}>
                    Волонтерська винагорода *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="Напр: +50 балів рейтингу"
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none ${
                      theme === 'minimalist' || theme === 'light'
                        ? 'bg-white border-slate-200 text-slate-800 focus:border-slate-400'
                        : 'bg-[#121829]/50 border-[#2a3454] text-white'
                      }`}
                  />
                  <p className={`text-[9px] mt-1.5 italic ${theme === 'minimalist' || theme === 'light' ? 'text-slate-400' : 'text-gray-400'}`}>Волонтерська винагорода у балах або мерчі.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[10px] font-black uppercase mb-1 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-500' : 'text-gray-300'}`}>Дата</label>
                  <select
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none ${
                      theme === 'minimalist' || theme === 'light'
                        ? 'bg-white border-slate-200 text-slate-800 focus:border-slate-400'
                        : 'bg-[#121829]/50 border-[#2a3454] text-white'
                      }`}
                  >
                    {calendarDays.map((d, idx) => (
                      <option key={d.date} value={d.date}>
                        {d.date} {getUkMonthGenitive(d.date)}{idx === 0 ? ' (Сьогодні)' : ''}
                      </option>
                    ))}
                  </select>
                  <p className={`text-[9px] mt-1.5 italic ${theme === 'minimalist' || theme === 'light' ? 'text-slate-400' : 'text-gray-400'}`}>День проведення івенту.</p>
                </div>
                <div>
                  <label className={`block text-[10px] font-black uppercase mb-1 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-500' : 'text-gray-300'}`}>Години</label>
                  <input
                    type="text"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    placeholder="08:00 — 17:00"
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none ${
                      theme === 'minimalist' || theme === 'light'
                        ? 'bg-white border-slate-200 text-slate-800 focus:border-slate-400'
                        : 'bg-[#121829]/50 border-[#2a3454] text-white'
                      }`}
                  />
                  <p className={`text-[9px] mt-1.5 italic ${theme === 'minimalist' || theme === 'light' ? 'text-slate-400' : 'text-gray-400'}`}>Час роботи.</p>
                </div>
              </div>

              <div>
                <label className={`block text-[10px] font-black uppercase mb-1 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-500' : 'text-gray-300'}`}>Адреса локації *</label>
                <input
                  type="text"
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="Київ, вул. Хрещатик, 10"
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none ${
                    theme === 'minimalist' || theme === 'light'
                      ? 'bg-white border-slate-200 text-slate-800 focus:border-slate-400'
                      : 'bg-[#121829]/50 border-[#2a3454] text-white focus:border-[#FF5722]'
                    }`}
                />
                <p className={`text-[9px] mt-1.5 italic ${theme === 'minimalist' || theme === 'light' ? 'text-slate-400' : 'text-gray-400'}`}>Куди саме потрібно підійти волонтеру.</p>
              </div>

              <div>
                <label className={`block text-[10px] font-black uppercase mb-1 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-500' : 'text-gray-300'}`}>Опис роботи / Обов’язки *</label>
                <textarea
                  required
                  rows={3}
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  placeholder="Опишіть завдання івенту (напр., допомога на ресепшені, координація гостей)"
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none resize-none transition-all ${
                    theme === 'minimalist' || theme === 'light'
                      ? 'bg-white border-slate-200 text-slate-800 focus:border-slate-400'
                      : 'bg-[#121829]/50 border-[#2a3454] text-white focus:bg-[#121829] focus:border-[#FF5722]'
                    }`}
                />
                <p className={`text-[9px] mt-1.5 italic ${theme === 'minimalist' || theme === 'light' ? 'text-slate-400' : 'text-gray-400'}`}>Детально опишіть завдання івенту, форму одягу чи особливі вимоги.</p>
              </div>

              <div>
                <label className={`block text-[10px] font-black uppercase mb-1 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-500' : 'text-gray-300'}`}>Спосіб підтвердження волонтера</label>
                <select
                  value={requiresScreening ? 'screening' : 'instant'}
                  onChange={(e) => setRequiresScreening(e.target.value === 'screening')}
                  className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none ${
                    theme === 'minimalist' || theme === 'light'
                      ? 'bg-white border-slate-200 text-slate-800 focus:border-slate-400'
                      : 'bg-[#121829]/50 border-[#2a3454] text-white'
                    }`}
                >
                  <option value="instant">⚡ Миттєве бронювання (Instant Book)</option>
                  <option value="screening">🔍 Ручний відбір резюме (Manual Screening)</option>
                </select>
                <p className={`text-[9px] mt-1.5 italic leading-normal ${theme === 'minimalist' || theme === 'light' ? 'text-slate-400' : 'text-gray-400'}`}>
                  {requiresScreening
                    ? 'Ви зможете перевірити профіль, рейтинг кандидатів та їх відгуки перед затвердженням на івент.'
                    : 'Волонтер зможе зайняти місце на івенті в один клік без попереднього відбору.'}
                </p>
              </div>

              <button
                type="submit"
                className={`w-full mt-4 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-98 ${
                  theme === 'minimalist'
                    ? 'bg-slate-900 hover:bg-slate-850 shadow-sm'
                    : 'bg-[#FF5722] hover:bg-[#e64a19] shadow-[0_4px_12px_rgba(255,87,34,0.3)]'
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                Опублікувати івент
              </button>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. B2B WALLET & DEPOSIT ESCROW */}
        {/* ======================================================== */}
        {b2bTab === 'wallet' && (
          <div className="p-4 space-y-4 text-left animate-fade-in">
            <h2 className={`text-base font-black uppercase tracking-tight ${theme === 'minimalist' || theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
              Резервний фонд балів
            </h2>

            {/* Escrow overview cards */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className={`p-4 rounded-2xl border transition-all ${
                theme === 'minimalist'
                  ? 'bg-white border-gray-150 shadow-[0_4px_16px_rgba(0,0,0,0.02)]'
                  : theme === 'light'
                    ? 'bg-white border-slate-200 shadow-sm'
                    : 'bg-[#1c2541]/45 border-white/10'
              }`}>
                <p className="text-[10px] uppercase font-bold text-gray-400">Доступно</p>
                <h3 className={`text-lg font-black mt-1 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                  {Math.round(employerBalance / 10).toLocaleString()} балів
                </h3>
                <span className="text-[8px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded mt-2 inline-block font-bold">Сейф активований</span>
              </div>

              <div className={`p-4 rounded-2xl border transition-all ${
                theme === 'minimalist'
                  ? 'bg-white border-gray-150 shadow-[0_4px_16px_rgba(0,0,0,0.02)]'
                  : theme === 'light'
                    ? 'bg-white border-slate-200 shadow-sm'
                    : 'bg-[#1c2541]/45 border-white/10'
              }`}>
                <p className="text-[10px] uppercase font-bold text-gray-400">Утримано (Escrow)</p>
                <h3 className="text-lg font-black mt-1 text-[#FF9500]">
                  {Math.round(employerFrozenBalance / 10).toLocaleString()} балів
                </h3>
                <span className="text-[8px] bg-[#FF9500]/10 text-[#FF9500] px-1.5 py-0.5 rounded mt-2 inline-block font-bold">Гарантія нарахування</span>
              </div>
            </div>

            {/* Quick simulated top up deposit form */}
            <div className={`rounded-3xl p-5 border transition-all ${
              theme === 'minimalist'
                ? 'bg-white border-gray-150 shadow-[0_4px_24px_rgba(0,0,0,0.03)]'
                : theme === 'light'
                  ? 'bg-white border-slate-200 shadow-sm'
                  : 'bg-[#1c2541]/40 border-white/5'
            }`}>
              <h3 className={`text-xs font-black uppercase tracking-wider mb-3 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                Виділення балів з бюджету університету
              </h3>
              <div className="space-y-3.5">
                <div>
                  <label className={`block text-[10px] font-bold uppercase mb-1.5 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>Оберіть або введіть кількість балів</label>
                  <div className="flex gap-2 mb-2">
                    {['1000', '2500', '5000'].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setDepositAmountInput(val)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                          depositAmountInput === val
                            ? theme === 'minimalist'
                              ? 'bg-slate-900 text-white border-transparent'
                              : 'bg-[#FF5722] text-white border-transparent'
                            : theme === 'minimalist' || theme === 'light'
                              ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                              : 'bg-[#1c2541]/50 border-white/5 text-white'
                        }`}
                      >
                        {parseInt(val).toLocaleString()} балів
                      </button>
                    ))}
                  </div>
                  <input
                    type="number"
                    value={depositAmountInput}
                    onChange={(e) => setDepositAmountInput(e.target.value)}
                    placeholder="Інша кількість"
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none ${
                      theme === 'minimalist' || theme === 'light'
                        ? 'bg-white border-slate-200 text-slate-850 focus:border-slate-400'
                        : 'bg-[#121829]/50 border-[#2a3454] text-white focus:border-[#FF5722]'
                    }`}
                  />
                </div>

                <button
                  onClick={() => handleDeposit(Number(depositAmountInput || 0) * 10)}
                  className={`w-full text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
                    theme === 'minimalist'
                      ? 'bg-slate-900 hover:bg-slate-800'
                      : 'bg-[#FF5722] hover:bg-[#e64a19] shadow-md'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  Поповнити резервний фонд балів
                </button>
              </div>
            </div>

            {/* Corporate Invoice generation block */}
            <div className={`rounded-3xl p-5 border transition-all ${
              theme === 'minimalist'
                ? 'bg-slate-50 border-slate-200/80 text-slate-600'
                : theme === 'light'
                  ? 'bg-blue-50/20 border-blue-100 text-slate-700'
                  : 'bg-[#1c2541]/20 border-orange-500/10'
            }`}>
              <div className="flex gap-3 items-start">
                <FileText className="w-5 h-5 text-[#FF5722] shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1">
                  <h4 className={`text-xs font-black uppercase tracking-tight ${theme === 'minimalist' || theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                    Рахунок-фактура (Безготівковий розрахунок)
                  </h4>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    Генеруйте офіційну квитанцію для бухгалтерії ТОВ або ФОП для поповнення безготівковим переказом з ПДВ.
                  </p>
                  <button
                    onClick={() => {
                      handleDeposit(Number(depositAmountInput || 15000));
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border mt-2 block transition-all active:scale-95 ${
                      theme === 'minimalist'
                        ? 'border-slate-900 text-slate-900 hover:bg-slate-100'
                        : theme === 'light'
                          ? 'border-[#001B3D] text-[#001B3D] hover:bg-[#001B3D]/5'
                          : 'border-[#FF5722] text-white bg-[#FF5722]/10 hover:bg-[#FF5722]/20'
                    }`}
                  >
                    Згенерувати рахунок & Зарахувати 📥
                  </button>
                </div>
              </div>
            </div>

            {/* B2B Transaction logs */}
            <div className="space-y-2">
              <h4 className={`text-xs font-black uppercase tracking-wider ${theme === 'minimalist' || theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                Історія платежів компанії
              </h4>
              <div className="space-y-2">
                {transactions.length === 0 ? (
                  <div className={`p-4 rounded-xl border text-center text-[10px] text-gray-400 font-bold ${theme === 'minimalist' || theme === 'light' ? 'bg-white border-slate-200' : 'bg-transparent border-white/5'}`}>
                    Історія транзакцій порожня.
                  </div>
                ) : (
                  transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                        theme === 'minimalist' || theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#1c2541]/30 border-white/5'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <p className={`font-bold ${theme === 'minimalist' || theme === 'light' ? 'text-slate-850' : 'text-white'}`}>{tx.title}</p>
                        <p className="text-[9px] text-gray-400 font-semibold">{tx.date}</p>
                      </div>
                      <span className={`font-black ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {tx.amount > 0 ? `+${Math.round(tx.amount / 10).toLocaleString()}` : Math.round(tx.amount / 10).toLocaleString()} балів
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 5. B2B CORPORATE PROFILE & BRANCHES */}
        {/* ======================================================== */}
        {b2bTab === 'profile' && (
          <div className="p-4 space-y-5 text-left animate-fade-in">
            {/* Identity card */}
            <div className={`rounded-3xl p-5 border transition-all relative overflow-hidden flex items-center gap-4 ${
              theme === 'minimalist'
                ? 'bg-white border-gray-150 shadow-[0_4px_16px_rgba(0,0,0,0.02)]'
                : theme === 'light'
                  ? 'bg-white border-[#E5E7EB] shadow-sm'
                  : 'bg-gradient-to-br from-[#1c2541]/85 to-[#121829]/95 border-white/10'
            }`}>
              <div className="relative shrink-0">
                <img
                  src={userAvatar || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop&q=80'}
                  className="w-14 h-14 rounded-2xl border object-cover bg-white"
                  alt="Company Logo / Manager Avatar"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#1c2541] flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" />
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-black truncate ${theme === 'minimalist' || theme === 'light' ? 'text-slate-850' : 'text-white'}`}>
                  {companyName || 'Організатор заходів'}
                </h3>
                <p className="text-[10px] text-gray-400 font-bold truncate mt-0.5">{companyDetails || 'Код підрозділу 12345678'}</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[9px] font-bold bg-[#FF5722]/10 text-[#FF5722] px-2 py-0.5 rounded border border-[#FF5722]/20">
                    Портал Організатора
                  </span>
                  <span className="text-[9px] font-bold bg-green-500/10 text-green-500 px-2 py-0.5 rounded">
                    Верифіковано
                  </span>
                </div>
              </div>
            </div>

            {/* Representative Manager info */}
            <div className={`p-4 rounded-2xl border transition-all ${theme === 'minimalist' || theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#1c2541]/35 border-white/5'}`}>
              <h4 className={`text-[10px] font-black uppercase tracking-wider mb-2.5 ${theme === 'minimalist' || theme === 'light' ? 'text-slate-500' : 'text-gray-400'}`}>
                Контактна особа (Адміністратор)
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Ім’я менеджера:</span>
                  <span className={`font-bold ${theme === 'minimalist' || theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Номер телефону:</span>
                  <span className={`font-bold ${theme === 'minimalist' || theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{userPhone}</span>
                </div>
              </div>
            </div>

            {/* Dynamic Branch Manager CRUD */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className={`text-xs font-black uppercase tracking-wider ${theme === 'minimalist' || theme === 'light' ? 'text-slate-855' : 'text-white'}`}>
                  Кафедри та Локації ({branches.length})
                </h4>
              </div>

              {/* Branch listing */}
              <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar pr-0.5">
                {branches.map(b => (
                  <div
                    key={b.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                      theme === 'minimalist' || theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#1c2541]/25 border-white/5'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold ${theme === 'minimalist' || theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{b.name}</span>
                        {b.requiresScreening && (
                          <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1 py-0.2 rounded font-black uppercase">
                            Screening
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] text-gray-400 truncate mt-0.5">{b.address}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteBranch(b.id)}
                      className="text-red-500 hover:text-red-650 p-1.5 rounded-lg hover:bg-red-500/10 transition-all shrink-0 active:scale-90"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Inline Branch Add Form */}
              <div className={`p-4 rounded-2xl border text-xs space-y-3.5 ${theme === 'minimalist' || theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#121829]/50 border-white/5'}`}>
                <h5 className={`text-[10px] font-black uppercase tracking-wider ${theme === 'minimalist' || theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                  Додати нову кафедру/локацію
                </h5>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Назва (напр. Кафедра АСОУ, Деканат ФІОТ)"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 text-xs font-bold outline-none ${
                      theme === 'minimalist' || theme === 'light' ? 'bg-white border-slate-200 text-slate-850' : 'bg-[#121829]/50 border-[#2a3454] text-white'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Напр: Корпус 18, ауд. 405"
                    value={newBranchAddress}
                    onChange={(e) => setNewBranchAddress(e.target.value)}
                    className={`w-full border rounded-xl px-3 py-2 text-xs font-bold outline-none ${
                      theme === 'minimalist' || theme === 'light' ? 'bg-white border-slate-200 text-slate-850' : 'bg-[#121829]/50 border-[#2a3454] text-white'
                    }`}
                  />
                  <label className="flex items-center gap-2 cursor-pointer py-1 text-[10px] font-bold">
                    <input
                      type="checkbox"
                      checked={newBranchScreening}
                      onChange={(e) => setNewBranchScreening(e.target.checked)}
                      className="rounded accent-[#FF5722]"
                    />
                    <span className="text-gray-400 uppercase tracking-wide">Попередній ручний відбір кандидатів</span>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!newBranchName.trim() || !newBranchAddress.trim()) return;
                    handleAddBranch(newBranchName, newBranchAddress, newBranchScreening);
                    setNewBranchName('');
                    setNewBranchAddress('');
                    setNewBranchScreening(false);
                  }}
                  className={`w-full text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 ${
                    theme === 'minimalist' ? 'bg-slate-900 hover:bg-slate-800' : 'bg-[#001B3D]'
                  }`}
                >
                  Зберегти кафедру/локацію
                </button>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleSignOut}
              className="w-full border border-red-500/30 hover:border-red-500 text-red-500 py-3 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              Вийти з корпоративного акаунту
            </button>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* PERSISTENT MOBILE TABS BOTTOM NAVIGATION BAR FOR B2B */}
      {/* ======================================================== */}
      <div className={`absolute bottom-0 left-0 right-0 h-[83px] border-t flex items-center justify-around px-2 z-40 transition-colors duration-300 ${
        theme === 'minimalist'
          ? 'bg-white border-slate-100 shadow-[0_-4px_16px_rgba(0,0,0,0.015)] text-slate-800'
          : theme === 'light'
            ? 'bg-white/95 border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] text-[#001B3D]'
            : 'bg-[#1c2541]/95 border-white/5 shadow-[0_-4px_24px_rgba(0,0,0,0.2)] text-white'
        } backdrop-blur-md`}>
        
        {/* Tab 1: Dashboard */}
        <div
          onClick={() => setB2bTab('dashboard')}
          className={`flex flex-col items-center justify-center w-[60px] h-[54px] rounded-[18px] relative transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
            b2bTab === 'dashboard'
              ? theme === 'minimalist' ? 'text-slate-900' : 'text-[#FF5722]'
              : 'text-gray-400 hover:text-slate-650'
          }`}
        >
          {b2bTab === 'dashboard' && (
            <div className={`absolute inset-0 rounded-[18px] ${
              theme === 'minimalist' ? 'bg-slate-100' : 'bg-[#FF5722]/8'
            }`}></div>
          )}
          <TrendingUp className="w-5 h-5 relative z-10" />
          <span className="text-[8px] font-black uppercase tracking-wider mt-1 relative z-10">Аналітика</span>
        </div>

        {/* Tab 2: Shifts list */}
        <div
          onClick={() => setB2bTab('shifts')}
          className={`flex flex-col items-center justify-center w-[60px] h-[54px] rounded-[18px] relative transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
            b2bTab === 'shifts'
              ? theme === 'minimalist' ? 'text-slate-900' : 'text-[#FF5722]'
              : 'text-gray-400 hover:text-slate-650'
          }`}
        >
          {b2bTab === 'shifts' && (
            <div className={`absolute inset-0 rounded-[18px] ${
              theme === 'minimalist' ? 'bg-slate-100' : 'bg-[#FF5722]/8'
            }`}></div>
          )}
          <Calendar className="w-5 h-5 relative z-10" />
          <span className="text-[8px] font-black uppercase tracking-wider mt-1 relative z-10">Івенти</span>
        </div>

        {/* Tab 3: Create Shift */}
        <div
          onClick={() => setB2bTab('create')}
          className={`flex flex-col items-center justify-center w-[60px] h-[54px] rounded-[18px] relative transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
            b2bTab === 'create'
              ? theme === 'minimalist' ? 'text-slate-900' : 'text-[#FF5722]'
              : 'text-gray-400 hover:text-slate-650'
          }`}
        >
          {b2bTab === 'create' && (
            <div className={`absolute inset-0 rounded-[18px] ${
              theme === 'minimalist' ? 'bg-slate-100' : 'bg-[#FF5722]/8'
            }`}></div>
          )}
          <PlusCircle className="w-5 h-5 relative z-10" />
          <span className="text-[8px] font-black uppercase tracking-wider mt-1 relative z-10">Створити</span>
        </div>

        {/* Tab 4: Wallet */}
        <div
          onClick={() => setB2bTab('wallet')}
          className={`flex flex-col items-center justify-center w-[60px] h-[54px] rounded-[18px] relative transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
            b2bTab === 'wallet'
              ? theme === 'minimalist' ? 'text-slate-900' : 'text-[#FF5722]'
              : 'text-gray-400 hover:text-slate-650'
          }`}
        >
          {b2bTab === 'wallet' && (
            <div className={`absolute inset-0 rounded-[18px] ${
              theme === 'minimalist' ? 'bg-slate-100' : 'bg-[#FF5722]/8'
            }`}></div>
          )}
          <Wallet className="w-5 h-5 relative z-10" />
          <span className="text-[8px] font-black uppercase tracking-wider mt-1 relative z-10">Сейф</span>
        </div>

        {/* Tab 5: Profile */}
        <div
          onClick={() => setB2bTab('profile')}
          className={`flex flex-col items-center justify-center w-[60px] h-[54px] rounded-[18px] relative transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
            b2bTab === 'profile'
              ? theme === 'minimalist' ? 'text-slate-900' : 'text-[#FF5722]'
              : 'text-gray-400 hover:text-slate-650'
          }`}
        >
          {b2bTab === 'profile' && (
            <div className={`absolute inset-0 rounded-[18px] ${
              theme === 'minimalist' ? 'bg-slate-100' : 'bg-[#FF5722]/8'
            }`}></div>
          )}
          <Building className="w-5 h-5 relative z-10" />
          <span className="text-[8px] font-black uppercase tracking-wider mt-1 relative z-10">Профіль</span>
        </div>

      </div>
    </>
  );
}
