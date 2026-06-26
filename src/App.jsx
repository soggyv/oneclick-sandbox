import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Search,
  Calendar,
  User,
  PlusCircle,
  CheckCircle2,
  MapPin,
  Clock,
  Building2,
  X,
  AlertCircle,
  ArrowLeft,
  Info,
  Star
} from 'lucide-react'

const API_URL = "http://localhost:8000/api";

export default function App() {
  // --- Centralized Core State Object ---
  const [user, setUser] = useState(null); // Current logged in user object
  const [organization, setOrganization] = useState(null); // User's organization if B2B
  const [currentRole, setCurrentRole] = useState('B2C'); // 'B2C' (volunteer) or 'B2B' (organizer)
  
  // Navigation Tabs
  const [activeB2CTab, setActiveB2CTab] = useState('search'); // 'search' | 'myshifts' | 'profile'
  const [activeB2BTab, setActiveB2BTab] = useState('manage'); // 'manage' | 'create' | 'profile'
  const [activeB2BFilter, setActiveB2BFilter] = useState("ВІДКРИТІ"); // B2B managed filter: 'ВІДКРИТІ' | 'АКТИВНІ'

  // Form Inputs
  const [regName, setRegName] = useState('Дмитро');
  const [regPhone, setRegPhone] = useState('+380 93 123 4567');
  
  // Organization Register Form
  const [regOrgName, setRegOrgName] = useState('Foundation Coffee');
  const [regOrgDesc, setRegOrgDesc] = useState('Кав\'ярня третьої хвилі, хаб студентських ініціатив');
  const [regOrgAddr, setRegOrgAddr] = useState('вул. Канатна, 15');

  // Shift Create Form
  const [formTitle, setFormTitle] = useState('');
  const [formSphere, setFormSphere] = useState('IT-відділ');
  const [formHours, setFormHours] = useState('09:00 - 18:00');
  const [formLocation, setFormLocation] = useState('Актова зала');
  const [formAddress, setFormAddress] = useState('вул. Канатна, 15');
  const [formDescription, setFormDescription] = useState('Допомога у технічному супроводі презентації.');

  // Data States
  const [shifts, setShifts] = useState([]); // Available B2C shifts
  const [bookedShifts, setBookedShifts] = useState([]); // Applied B2C shifts (applications)
  const [b2bApplications, setB2bApplications] = useState([]); // B2B applications for approval/check-in

  // Attendance Code input state per application
  const [attendanceCodes, setAttendanceCodes] = useState({}); // { appId: 'code' }

  // Rating & Review form state per application
  const [ratings, setRatings] = useState({}); // { appId: 5 }
  const [reviews, setReviews] = useState({}); // { appId: 'comment' }

  // Modal / Detail States
  const [toast, setToast] = useState(null);
  const [currentDetailsShift, setCurrentDetailsShift] = useState(null);
  const [volunteerReviews, setVolunteerReviews] = useState([]); // Reviews of selected volunteer
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [reviewsModalUserName, setReviewsModalUserName] = useState('');
  const [isOrgRegisterModalOpen, setIsOrgRegisterModalOpen] = useState(false);

  // 14-day rolling calendar YYYY-MM-DD
  const calendarDays = useMemo(() => {
    const days = [];
    const weekdaysShort = ['НД', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
    
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const weekday = weekdaysShort[d.getDay()];
      const dayNum = d.getDate();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      days.push({ weekday, dayNum, dateStr, date: d });
    }
    return days;
  }, []);

  const [selectedDateStr, setSelectedDateStr] = useState(calendarDays[0].dateStr);
  const [selectedFilter, setSelectedFilter] = useState("Всі сфери");

  // Dynamic Spheres list derived from shifts
  const b2cFilters = useMemo(() => {
    const base = ["Всі сфери", "Кав'ярні", "Склади", "IT-відділ", "Рітейл"];
    shifts.forEach(shift => {
      if (!base.includes(shift.category)) {
        base.push(shift.category);
      }
    });
    return base;
  }, [shifts]);

  // Toast Helper
  const showToastMsg = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // API Call Wrapper
  const apiCall = useCallback(async (endpoint, method = 'GET', body = null) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (user) {
      headers['x-user-id'] = String(user.id);
    }
    const config = {
      method,
      headers,
    };
    if (body) {
      config.body = JSON.stringify(body);
    }
    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Помилка запиту');
      }
      return await response.json();
    } catch (err) {
      showToastMsg(err.message, 'error');
      throw err;
    }
  }, [user]);

  // Load Volunteer Profile / Reviews
  const fetchVolunteerReviews = async (volunteerId, volunteerName) => {
    try {
      const data = await apiCall(`/users/${volunteerId}/reviews`);
      setVolunteerReviews(data);
      setReviewsModalUserName(volunteerName);
      setIsReviewsModalOpen(true);
    } catch (err) {
      console.error("Помилка при завантаженні відгуків:", err);
    }
  };

  // Load data depending on current tab/role
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      if (currentRole === 'B2C') {
        // Fetch available shifts
        const fetchedShifts = await apiCall(`/shifts?date=${selectedDateStr}&category=${encodeURIComponent(selectedFilter)}`);
        setShifts(fetchedShifts);
        // Fetch booked shifts
        const booked = await apiCall('/applications/my');
        setBookedShifts(booked);
      } else {
        // B2B role: Fetch applications
        const apps = await apiCall('/applications/b2b');
        setB2bApplications(apps);
      }
    } catch (err) {
      console.error("Помилка завантаження даних:", err);
    }
  }, [user, currentRole, selectedDateStr, selectedFilter, apiCall]);

  // Fetch data on parameters change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle registration/login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = await apiCall('/auth/login-or-register', 'POST', {
        name: regName,
        phone: regPhone,
        role: 'B2C' // Default to volunteer
      });
      setUser(userData);
      setCurrentRole(userData.role);
      
      // Check if user already has organization
      const org = await fetch(`${API_URL}/auth/my-org`, {
        headers: { 'x-user-id': String(userData.id) }
      }).then(r => r.json()).catch(() => null);
      
      if (org) {
        setOrganization(org);
        if (userData.role === 'B2B') {
          setCurrentRole('B2B');
        }
      }
      showToastMsg(`Вітаємо, ${userData.name}! Вхід успішний.`, 'success');
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Google login/registration simulation
  const handleGoogleLogin = async () => {
    try {
      const userData = await apiCall('/auth/login-or-register', 'POST', {
        name: "Дмитро (Google)",
        email: "dima@student.ua",
        phone: null,
        role: 'B2C' // Default to volunteer
      });
      setUser(userData);
      setCurrentRole(userData.role);
      
      // Check if user already has organization
      const org = await fetch(`${API_URL}/auth/my-org`, {
        headers: { 'x-user-id': String(userData.id) }
      }).then(r => r.json()).catch(() => null);
      
      if (org) {
        setOrganization(org);
        if (userData.role === 'B2B') {
          setCurrentRole('B2B');
        }
      }
      showToastMsg(`Вітаємо, ${userData.name}! Вхід через Google успішний.`, 'success');
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Organization Registration
  const handleOrgRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const orgData = await apiCall('/auth/register-org', 'POST', {
        name: regOrgName,
        description: regOrgDesc,
        address: regOrgAddr
      });
      setOrganization(orgData);
      
      // Refetch user to get updated role (B2B)
      const updatedUser = await apiCall('/auth/me');
      setUser(updatedUser);
      setCurrentRole('B2B');
      setIsOrgRegisterModalOpen(false);
      showToastMsg(`Організацію "${orgData.name}" успішно створено!`, 'success');
    } catch (err) {
      console.error(err);
    }
  };

  // Switch role between B2C and B2B (only if they have organization)
  const toggleRole = () => {
    if (!organization) {
      setIsOrgRegisterModalOpen(true);
      return;
    }
    const nextRole = currentRole === 'B2C' ? 'B2B' : 'B2C';
    setCurrentRole(nextRole);
    showToastMsg(`Перехід до кабінету ${nextRole === 'B2C' ? 'Волонтера' : 'Організатора'}`, 'info');
  };

  // Volunteer Apply to Shift
  const handleApplyShift = async (shift) => {
    if (bookedShifts.some(s => s.shift_id === shift.id)) {
      showToastMsg("Ви вже відгукнулися на цю зміну!", "error");
      setCurrentDetailsShift(null);
      return;
    }
    try {
      await apiCall('/applications/apply', 'POST', { shift_id: shift.id });
      showToastMsg(`Ви відгукнулися на зміну: "${shift.title}"!`, "success");
      setCurrentDetailsShift(null);
      setActiveB2CTab('myshifts');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Organizer Approve/Reject Volunteer
  const handleReviewCandidate = async (appId, status) => {
    try {
      await apiCall(`/applications/${appId}/review-candidate?status=${status}`, 'POST');
      showToastMsg(status === 'approved' ? "Кандидата підтверджено!" : "Кандидата відхилено.", "success");
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Organizer Confirm Attendance by Code
  const handleConfirmAttendance = async (appId) => {
    const code = attendanceCodes[appId];
    if (!code || !code.trim()) {
      showToastMsg("Введіть код волонтера", "error");
      return;
    }
    try {
      await apiCall('/applications/confirm-attendance', 'POST', { code });
      showToastMsg("Присутність волонтера підтверджено!", "success");
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Organizer Rate Volunteer
  const handleRateVolunteer = async (appId) => {
    const rating = ratings[appId] || 5;
    const comment = reviews[appId] || "";
    try {
      await apiCall('/applications/rate', 'POST', {
        application_id: appId,
        rating,
        comment
      });
      showToastMsg("Дякуємо! Відгук успішно надіслано.", "success");
      loadData();
      
      // Update local rating state
      const updatedUser = await apiCall('/auth/me');
      setUser(updatedUser);
    } catch (err) {
      console.error(err);
    }
  };

  // Organizer Create Shift
  const handleCreateShift = async (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showToastMsg("Введіть назву заходу", "error");
      return;
    }
    try {
      await apiCall('/shifts', 'POST', {
        title: formTitle,
        category: formSphere,
        date: selectedDateStr,
        time: formHours,
        location: formLocation,
        address: formAddress,
        description: formDescription
      });
      showToastMsg("Захід успішно створено та опубліковано!", "success");
      setFormTitle('');
      setActiveB2BTab('manage');
      setActiveB2BFilter('ВІДКРИТІ');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered applications for B2B lists
  const filteredB2BApplications = useMemo(() => {
    return b2bApplications.filter(app => {
      if (activeB2BFilter === "ВІДКРИТІ") {
        return app.status === "pending" || app.status === "rejected";
      } else {
        return app.status === "approved" || app.status === "attended" || app.status === "reviewed";
      }
    });
  }, [b2bApplications, activeB2BFilter]);

  // --- STAGE 1: LOGIN FLOW ---
  if (!user) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-[#111111] via-[#1a1a24] to-[#0e0e12] flex items-center justify-center p-4">
        <div className="w-full max-w-[450px] min-h-[680px] bg-[#f5f5f7] rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col justify-between border border-white/10 p-6 text-[#111111]">
          
          <div className="flex-1 flex flex-col items-center justify-center my-auto">
            <div className="w-20 h-20 bg-gradient-to-tr from-[#FF5522] to-[#FFCC00] rounded-2xl shadow-lg flex items-center justify-center mb-6">
              <span className="text-white text-3xl font-black tracking-tight">1C</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-1">ONECLICK</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-8">Платформа волонтерства</p>

            <form onSubmit={handleLoginSubmit} className="space-y-4 w-full max-w-[320px]">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                  Ваше ім'я
                </label>
                <input
                  type="text"
                  placeholder="напр. Дмитро"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                  Телефон
                </label>
                <input
                  type="text"
                  placeholder="напр. +380 93 123 4567"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  required
                  className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 mt-2 bg-[#FF5522] hover:bg-[#FF5522]/90 text-white font-extrabold rounded-full shadow-md text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
              >
                Увійти / Зареєструватися
              </button>

              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <span className="relative px-3 bg-[#f5f5f7] text-[10px] text-gray-400 font-bold uppercase tracking-wider">або</span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-extrabold rounded-full shadow-sm text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                Продовжити з Google
              </button>
            </form>
          </div>

          <div className="text-center text-[10px] text-gray-400 mt-6 font-bold uppercase tracking-wider">
            © 2026 OneClick. Університетський тест
          </div>
        </div>
      </div>
    );
  }

  // --- STAGE 2: DETAILS OVERLAY ---
  if (currentDetailsShift) {
    return (
      <div className="w-full min-h-screen bg-slate-900/40 py-4 flex items-center justify-center relative">
        <div className="w-full max-w-[450px] min-h-screen bg-[#f5f5f7] relative pb-8 text-[#111111] overflow-x-hidden border border-gray-200 shadow-2xl flex flex-col justify-between">
          
          <div>
            <div className="w-full bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-50 flex items-center justify-between">
              <button
                onClick={() => setCurrentDetailsShift(null)}
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
                  {currentDetailsShift.category}
                </span>
              </div>

              <div>
                <h1 className="text-xl font-black text-gray-900 leading-snug mb-1">
                  {currentDetailsShift.title}
                </h1>
                <p className="text-xs text-gray-400 font-bold flex items-center gap-1">
                  <Building2 size={13} className="text-gray-300" />
                  <span>Організація: {currentDetailsShift.organization_name || currentDetailsShift.business}</span>
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Опис завдання
                </h3>
                <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                  {currentDetailsShift.description || "Допомога у координації події."}
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock size={15} className="text-[#FFCC00]" />
                  <span>Час роботи: <strong className="text-gray-900">{currentDetailsShift.time}</strong> ({currentDetailsShift.date})</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-gray-400" />
                  <span>Локація: <strong className="text-gray-900">{currentDetailsShift.location}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Info size={15} className="text-blue-400" />
                  <span>Адреса: <strong className="text-gray-900">{currentDetailsShift.address}</strong></span>
                </div>
              </div>

              <div className="bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(currentDetailsShift.address || 'Одеса')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-[180px] border-none rounded-xl"
                  title="Shift Details Map"
                ></iframe>
              </div>
            </div>
          </div>

          {currentRole === 'B2C' && (
            <div className="p-4 bg-white border-t border-gray-100">
              <button
                onClick={() => handleApplyShift(currentDetailsShift)}
                className="w-full py-4 bg-[#FF5522] hover:bg-[#FF5522]/90 text-white font-bold rounded-full shadow-md text-sm transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>Відгукнутися на захід</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- STAGE 3: MAIN APP VIEW ---
  return (
    <div className="w-full min-h-screen bg-slate-900/40 py-4 flex items-center justify-center relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-48px)] max-w-[380px] bg-white rounded-2xl shadow-xl px-4 py-3.5 border border-gray-100 flex items-center gap-3 animate-bounce">
          {toast.type === 'success' ? (
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500">
              <CheckCircle2 size={18} />
            </div>
          ) : toast.type === 'error' ? (
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <AlertCircle size={18} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
              <Info size={18} />
            </div>
          )}
          <p className="text-xs font-bold text-gray-800 flex-1 leading-snug">{toast.message}</p>
        </div>
      )}

      {/* Main frame */}
      <div className="w-full max-w-[450px] min-h-screen bg-[#f5f5f7] relative pb-[110px] text-[#111111] overflow-x-hidden border border-gray-200 shadow-2xl">
        
        {/* ------------------------------------------------------------- */}
        {/* --- B2C WORKSPACE (VOLUNTEER) --- */}
        {/* ------------------------------------------------------------- */}
        {currentRole === 'B2C' && (
          <div className="w-full px-4 pt-6">
            
            {/* VIEW 1: SEARCH TAB */}
            {activeB2CTab === 'search' && (
              <div className="animate-fadeIn">
                <div className="flex justify-between items-center mb-5">
                  <div className="text-left">
                    <h1 className="text-xl font-black tracking-tight text-gray-900">Пошук заходів</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Знайдіть волонтерські завдання</p>
                  </div>
                  
                  {/* Switch to B2B or Register */}
                  <button 
                    onClick={toggleRole}
                    className="px-3.5 py-2 bg-white hover:bg-gray-50 text-[10px] font-extrabold rounded-full border border-gray-200 shadow-sm flex items-center gap-1.5 transition-all active:scale-95 text-[#FF5522] uppercase tracking-wider cursor-pointer font-sans"
                  >
                    <span>{organization ? "Організатор" : "Реєстрація компанії"}</span>
                    <Building2 size={12} />
                  </button>
                </div>

                {/* 14-day calendar */}
                <div className="flex gap-2 overflow-x-auto pb-3.5 no-scrollbar">
                  {calendarDays.map((day) => {
                    const isActive = day.dateStr === selectedDateStr;
                    return (
                      <button
                        key={day.dateStr}
                        onClick={() => setSelectedDateStr(day.dateStr)}
                        className={`flex-shrink-0 w-12 h-20 rounded-full flex flex-col justify-between items-center py-3 transition-all duration-200 active:scale-95 ${
                          isActive 
                            ? 'bg-black text-white shadow-md scale-105' 
                            : 'bg-white text-gray-600 border border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <span className={`text-[9px] font-bold tracking-wider ${isActive ? 'text-gray-300' : 'text-gray-400'}`}>
                          {day.weekday}
                        </span>
                        <span className="text-base font-black leading-none">
                          {day.dayNum}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-4 pt-1 no-scrollbar">
                  {b2cFilters.map((filter) => {
                    const isActive = selectedFilter === filter;
                    return (
                      <button
                        key={filter}
                        onClick={() => setSelectedFilter(filter)}
                        className={`flex-shrink-0 px-4.5 py-2 rounded-full text-[11px] font-extrabold transition-all duration-200 active:scale-95 ${
                          isActive
                            ? 'bg-[#FFCC00] text-black shadow-sm'
                            : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                        }`}
                      >
                        {filter}
                      </button>
                    );
                  })}
                </div>

                {/* Shift Feed */}
                <div className="space-y-4 mt-1">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                      Доступні події ({shifts.length})
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      Одеса
                    </span>
                  </div>

                  {shifts.length > 0 ? (
                    shifts.map((shift) => (
                      <div
                        key={shift.id}
                        onClick={() => setCurrentDetailsShift(shift)}
                        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 active:scale-[0.98] text-left"
                      >
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className="px-2.5 py-1 bg-gray-50 text-[9px] font-extrabold text-gray-500 rounded-full tracking-wider uppercase">
                            {shift.category}
                          </span>
                        </div>
                        
                        <h3 className="font-black text-gray-900 text-base leading-snug mb-1.5">
                          {shift.title}
                        </h3>
                        <p className="text-[11px] text-gray-400 font-bold mb-3 flex items-center gap-1.5">
                          <Building2 size={13} className="text-gray-300" />
                          <span>Організатор: {shift.organization_name}</span>
                        </p>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-[10px] text-gray-500 font-bold">
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-[#FFCC00]" />
                            <span>{shift.time}</span>
                          </span>
                          <span className="flex items-center gap-0.5 font-medium">
                            <MapPin size={12} className="text-gray-400" />
                            <span>{shift.location}</span>
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-3">
                        <Search size={20} />
                      </div>
                      <h4 className="font-bold text-gray-800 text-xs mb-1">Подій не знайдено</h4>
                      <p className="text-[10px] text-gray-400 max-w-[180px] mx-auto leading-relaxed">
                        Немає активних ініціатив на обраний день.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW 2: BOOKED SHIFTS TAB */}
            {activeB2CTab === 'myshifts' && (
              <div className="animate-fadeIn text-left">
                <div className="mb-5">
                  <h1 className="text-xl font-black tracking-tight text-gray-900">Мої заходи</h1>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Список ваших запланованих робіт</p>
                </div>

                <div className="space-y-4">
                  {bookedShifts.length > 0 ? (
                    bookedShifts.map((app) => (
                      <div
                        key={app.id}
                        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FFCC00]"></div>
                        
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
                          <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3.5 text-center">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">
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
                    ))
                  ) : (
                    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-3">
                        <Calendar size={20} />
                      </div>
                      <h4 className="font-bold text-gray-800 text-xs mb-1">Немає запланованих заходів</h4>
                      <p className="text-[10px] text-gray-400 max-w-[180px] leading-relaxed">
                        Ви ще не відгукнулися на жодне волонтерське завдання.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW 3: PROFILE TAB */}
            {activeB2CTab === 'profile' && (
              <div className="animate-fadeIn">
                <div className="mb-5 text-left">
                  <h1 className="text-xl font-black tracking-tight text-gray-900">Профіль волонтера</h1>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ваш студентський профіль волонтера</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#FFCC00] text-black text-2xl font-black flex items-center justify-center shadow-md mx-auto mb-3">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'У'}
                  </div>

                  <h2 className="text-lg font-black text-gray-900 mb-0.5">{user.name}</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-3">
                    Одеса, Україна
                  </p>

                  {/* Dynamic Rating Stars */}
                  <div 
                    onClick={() => user.rating && fetchVolunteerReviews(user.id, user.name)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border transition-all ${
                      user.rating 
                        ? 'bg-yellow-50/50 border-yellow-200 text-yellow-700 cursor-pointer hover:bg-yellow-50' 
                        : 'bg-gray-50 border-gray-200 text-gray-400'
                    }`}
                  >
                    <Star size={14} className={user.rating ? "fill-yellow-400 text-yellow-500" : ""} />
                    <span className="text-xs font-black">
                      {user.rating ? `${user.rating} / 5.0` : 'Без оцінок'}
                    </span>
                    {user.rating && (
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                        (Дивитись відгуки)
                      </span>
                    )}
                  </div>

                  <div className="border-t border-gray-100 mt-5 pt-4 text-left space-y-2 text-[11px] font-semibold text-gray-600">
                    <div className="flex justify-between">
                      <span>Телефон:</span>
                      <span className="text-gray-950 font-bold">{user.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Статус:</span>
                      <span className="text-green-600 font-bold">Готовий допомогти</span>
                    </div>
                  </div>
                </div>

                {organization ? (
                  <button
                    onClick={toggleRole}
                    className="w-full py-4 bg-white hover:bg-gray-50 text-gray-800 font-extrabold rounded-full border border-gray-200 shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-95 text-xs uppercase tracking-wider cursor-pointer"
                  >
                    <Building2 size={15} className="text-[#FFCC00]" />
                    <span>Перейти в кабінет Організатора (B2B)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsOrgRegisterModalOpen(true)}
                    className="w-full py-4 bg-white hover:bg-gray-50 text-gray-800 font-extrabold rounded-full border border-gray-200 shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-95 text-xs uppercase tracking-wider cursor-pointer"
                  >
                    <PlusCircle size={15} className="text-[#FF5522]" />
                    <span>Зареєструвати компанію / Організацію</span>
                  </button>
                )}
              </div>
            )}

            {/* B2C Floating Bottom Navigation */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[418px] bg-white shadow-xl rounded-[32px] px-2 py-3 z-[100] flex justify-around items-center">
              {[
                { id: 'search', label: 'Пошук', icon: Search },
                { id: 'myshifts', label: 'Заходи', icon: Calendar },
                { id: 'profile', label: 'Профіль', icon: User }
              ].map(tab => {
                const isActive = activeB2CTab === tab.id;
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveB2CTab(tab.id)}
                    className="flex flex-col items-center justify-center w-20 transition-all duration-150 active:scale-95"
                  >
                    <div className={`p-2 rounded-full transition-all duration-200 ${isActive ? 'bg-orange-50 text-[#f97316]' : 'text-gray-400'}`}>
                      <IconComponent size={18} />
                    </div>
                    <span className={`text-[9px] font-black mt-1 tracking-tight ${isActive ? 'text-[#f97316]' : 'text-gray-400'}`}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* --- B2B WORKSPACE (ORGANIZER) --- */}
        {/* ------------------------------------------------------------- */}
        {currentRole === 'B2B' && (
          <div className="w-full px-4 pt-6">
            
            {/* VIEW 1: MANAGE TAB */}
            {activeB2BTab === 'manage' && (
              <div className="animate-fadeIn">
                <div className="flex justify-between items-center mb-5">
                  <div className="text-left">
                    <h1 className="text-xl font-black tracking-tight text-gray-900">Керування заходами</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Організація: {organization ? organization.name : "..."}
                    </p>
                  </div>
                  
                  {/* Switch to B2C */}
                  <button 
                    onClick={toggleRole}
                    className="px-3.5 py-2 bg-white hover:bg-gray-50 text-[10px] font-extrabold rounded-full border border-gray-200 shadow-sm flex items-center gap-1.5 transition-all active:scale-95 text-[#f97316] uppercase tracking-wider cursor-pointer font-sans"
                  >
                    <span>Волонтер</span>
                    <User size={12} />
                  </button>
                </div>

                {/* Pill filters */}
                <div className="flex gap-2.5 mb-5 bg-gray-100 p-1 rounded-full border border-gray-200">
                  {["ВІДКРИТІ", "АКТИВНІ / ЗАВЕРШЕНІ"].map((filter) => {
                    const mappedFilter = filter === "ВІДКРИТІ" ? "ВІДКРИТІ" : "АКТИВНІ";
                    const isActive = activeB2BFilter === mappedFilter;
                    return (
                      <button
                        key={filter}
                        onClick={() => setActiveB2BFilter(mappedFilter)}
                        className={`flex-1 py-2 rounded-full text-xs font-black transition-all duration-200 active:scale-95 ${
                          isActive
                            ? 'bg-[#FF5522] text-white shadow-sm'
                            : 'text-gray-500 hover:text-black'
                        }`}
                      >
                        {filter}
                      </button>
                    );
                  })}
                </div>

                {/* Applications list */}
                <div className="space-y-4">
                  {filteredB2BApplications.length > 0 ? (
                    filteredB2BApplications.map((app) => (
                      <div
                        key={app.id}
                        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden text-left"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded-full tracking-wider ${
                            app.status === 'pending' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {app.status === 'pending' && 'ОЧІКУЄ УЗГОДЖЕННЯ'}
                            {app.status === 'rejected' && 'ВІДХИЛЕНО'}
                            {app.status === 'approved' && 'ВОЛОНТЕР ПІДТВЕРДЖЕНИЙ'}
                            {app.status === 'attended' && 'ПРИСУТНІЙ'}
                            {app.status === 'reviewed' && 'ОЦІНЕНО'}
                          </span>
                        </div>

                        <h3 
                          onClick={() => setCurrentDetailsShift(app.shift)}
                          className="font-black text-gray-950 text-base leading-snug mb-2 cursor-pointer hover:underline"
                        >
                          {app.shift.title}
                        </h3>

                        <div className="space-y-1 mb-3 text-[11px] text-gray-500 font-semibold">
                          <p className="flex items-center gap-1.5">
                            <Clock size={12} className="text-gray-300" />
                            <span>Час: {app.shift.time} ({app.shift.date})</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <User size={12} className="text-gray-300" />
                            <span 
                              onClick={() => fetchVolunteerReviews(app.volunteer_id, app.volunteer_name)}
                              className="text-blue-600 underline cursor-pointer hover:text-blue-800"
                            >
                              Волонтер: {app.volunteer_name}
                            </span>
                          </p>
                        </div>

                        {/* Interactive flow depending on status */}
                        
                        {/* Status 1: Pending */}
                        {app.status === 'pending' && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 flex gap-2">
                            <button
                              onClick={() => handleReviewCandidate(app.id, 'approved')}
                              className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                            >
                              Схвалити
                            </button>
                            <button
                              onClick={() => handleReviewCandidate(app.id, 'rejected')}
                              className="flex-1 py-2 border border-gray-350 hover:bg-gray-100 text-gray-650 font-extrabold text-[10px] rounded-full uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                            >
                              Відхилити
                            </button>
                          </div>
                        )}

                        {/* Status 2: Approved (Waiting for attendance code) */}
                        {app.status === 'approved' && (
                          <div className="mt-4 p-3.5 bg-gray-50 rounded-xl border border-gray-100">
                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-0.5">
                              Введіть код волонтера (check-in)
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="напр. 1C-489A"
                                value={attendanceCodes[app.id] || ""}
                                onChange={(e) => setAttendanceCodes(prev => ({ ...prev, [app.id]: e.target.value.toUpperCase() }))}
                                className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-black tracking-widest text-center focus:outline-none focus:border-[#FF5522]"
                              />
                              <button
                                onClick={() => handleConfirmAttendance(app.id)}
                                className="px-4 py-2 bg-black hover:bg-black/90 text-white font-bold text-[10px] rounded-xl uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                              >
                                Перевірити
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Status 3: Attended (Needs review) */}
                        {app.status === 'attended' && (
                          <div className="mt-4 p-3.5 bg-yellow-50/50 border border-yellow-100 rounded-xl space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                Оцініть волонтера
                              </span>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => {
                                  const currentRating = ratings[app.id] || 5;
                                  return (
                                    <button 
                                      key={star}
                                      onClick={() => setRatings(prev => ({ ...prev, [app.id]: star }))}
                                      className="text-yellow-500 active:scale-125 transition-transform"
                                    >
                                      <Star size={18} className={star <= currentRating ? "fill-yellow-400 text-yellow-500" : "text-gray-300"} />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                            
                            <textarea
                              rows="2"
                              placeholder="Напишіть короткий коментар про роботу волонтера..."
                              value={reviews[app.id] || ""}
                              onChange={(e) => setReviews(prev => ({ ...prev, [app.id]: e.target.value }))}
                              className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#FF5522] resize-none"
                            ></textarea>

                            <button
                              onClick={() => handleRateVolunteer(app.id)}
                              className="w-full py-2 bg-[#FF5522] hover:bg-[#FF5522]/90 text-white font-bold text-[10px] rounded-full uppercase tracking-wider transition-all active:scale-95"
                            >
                              Надіслати відгук та закрити зміну
                            </button>
                          </div>
                        )}

                        {/* Status 4: Reviewed */}
                        {app.status === 'reviewed' && app.review && (
                          <div className="mt-3 p-3 bg-green-50/50 border border-green-100 rounded-xl text-xs space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-green-800">
                              <Star size={13} className="fill-green-600 text-green-700" />
                              <span>Оцінено: {app.review.rating} / 5</span>
                            </div>
                            {app.review.comment && (
                              <p className="text-[11px] text-green-700 italic">
                                "{app.review.comment}"
                              </p>
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
                      <h4 className="font-bold text-gray-800 text-xs mb-1">Немає таких запитів</h4>
                      <p className="text-[10px] text-gray-400 max-w-[180px] leading-relaxed">
                        Немає активних чи відкритих ініціатив.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* VIEW 2: CREATE FORM TAB */}
            {activeB2BTab === 'create' && (
              <div className="animate-fadeIn text-left">
                <div className="mb-5">
                  <h1 className="text-xl font-black tracking-tight text-gray-900">Новий захід</h1>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Опублікувати завдання для волонтерів</p>
                </div>

                <form onSubmit={handleCreateShift} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                      Назва заходу / Завдання
                    </label>
                    <input
                      type="text"
                      placeholder="напр. Волонтер на кавовий лекторій"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      required
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold text-gray-850 focus:outline-none focus:border-[#FF5522] shadow-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                        Напрямок
                      </label>
                      <input
                        type="text"
                        placeholder="напр. IT-відділ"
                        value={formSphere}
                        onChange={(e) => setFormSphere(e.target.value)}
                        required
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold text-gray-850 focus:outline-none focus:border-[#FF5522] shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                        Години роботи
                      </label>
                      <input
                        type="text"
                        placeholder="09:00 - 18:00"
                        value={formHours}
                        onChange={(e) => setFormHours(e.target.value)}
                        required
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold text-gray-850 focus:outline-none focus:border-[#FF5522] shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                        Локація (приміщення)
                      </label>
                      <input
                        type="text"
                        placeholder="напр. Актова зала"
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        required
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold text-gray-850 focus:outline-none focus:border-[#FF5522] shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                        Дата заходу
                      </label>
                      <select
                        value={selectedDateStr}
                        onChange={(e) => setSelectedDateStr(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm"
                      >
                        {calendarDays.map(day => (
                          <option key={day.dateStr} value={day.dateStr}>
                            {day.dayNum} ({day.weekday})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                      Фізична адреса
                    </label>
                    <input
                      type="text"
                      placeholder="вул. Канатна, 15"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      required
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold text-gray-850 focus:outline-none focus:border-[#FF5522] shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                      Опис / Задачі
                    </label>
                    <textarea
                      rows="3"
                      placeholder="Ключові обов'язки волонтера..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-semibold text-gray-850 focus:outline-none focus:border-[#FF5522] shadow-sm resize-none"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-[#FF5522] hover:bg-[#FF5522]/90 text-white font-extrabold rounded-full shadow-md text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
                  >
                    + ОПУБЛІКУВАТИ ЗАХІД
                  </button>
                </form>
              </div>
            )}

            {/* VIEW 3: CORPORATE PROFILE TAB */}
            {activeB2BTab === 'profile' && (
              <div className="animate-fadeIn text-left">
                <div className="mb-5">
                  <h1 className="text-xl font-black tracking-tight text-gray-900">Кабінет організації</h1>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Кабінет керування установою / кафедрою</p>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                    Організація
                  </span>
                  <h2 className="text-base font-black text-gray-900 mb-4">
                    {organization ? organization.name : "..."}
                  </h2>

                  <div className="text-[11px] text-gray-500 font-semibold space-y-2 border-t border-gray-50 pt-4">
                    <div className="flex justify-between">
                      <span>Координатор:</span>
                      <span className="font-bold text-gray-800">{user.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Адреса:</span>
                      <span className="font-bold text-gray-800">{organization ? organization.address : "..."}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Опис:</span>
                      <span className="font-bold text-gray-800">{organization ? organization.description : "..."}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={toggleRole}
                  className="w-full py-4 bg-white hover:bg-gray-50 text-gray-800 font-bold rounded-full border border-gray-200 shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-95 text-xs uppercase tracking-wider cursor-pointer"
                >
                  <User size={15} className="text-[#FF5522]" />
                  <span>Повернутися до акаунту Волонтера (B2C)</span>
                </button>
              </div>
            )}

            {/* B2B Floating Bottom Navigation */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[418px] bg-white shadow-xl rounded-[32px] px-2 py-3 z-[100] flex justify-around items-center">
              {[
                { id: 'manage', label: 'Зміни', icon: Calendar },
                { id: 'create', label: 'Створити', icon: PlusCircle },
                { id: 'profile', label: 'Профіль', icon: User }
              ].map(tab => {
                const isActive = activeB2BTab === tab.id;
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveB2BTab(tab.id)}
                    className="flex flex-col items-center justify-center w-24 transition-all duration-150 active:scale-95"
                  >
                    <div className={`p-2 rounded-full transition-all duration-200 ${isActive ? 'bg-orange-50 text-[#f97316]' : 'text-gray-400'}`}>
                      <IconComponent size={18} />
                    </div>
                    <span className={`text-[9px] font-black mt-1 tracking-tight ${isActive ? 'text-[#f97316]' : 'text-gray-400'}`}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>
        )}

      </div>

      {/* --- REVIEWS MODAL --- */}
      {isReviewsModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-[380px] p-6 shadow-2xl animate-scaleUp text-left relative flex flex-col max-h-[500px]">
            
            <button
              onClick={() => setIsReviewsModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-all active:scale-95"
            >
              <X size={18} />
            </button>

            <h3 className="font-black text-gray-900 text-base mb-1">
              Відгуки про волонтера
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-4">
              Студент: {reviewsModalUserName}
            </p>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
              {volunteerReviews.length > 0 ? (
                volunteerReviews.map((review) => (
                  <div key={review.id} className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-gray-800">
                        {review.author_name}
                      </span>
                      <div className="flex items-center gap-0.5 text-yellow-500 font-bold text-[10px]">
                        <Star size={11} className="fill-yellow-400 text-yellow-500" />
                        <span>{review.rating}/5</span>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-[11px] text-gray-600 font-medium italic leading-relaxed">
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-gray-400 font-bold uppercase">
                    Немає відгуків
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsReviewsModalOpen(false)}
              className="w-full py-3.5 mt-4 bg-black hover:bg-black/95 text-white font-extrabold rounded-full text-xs transition-all active:scale-95"
            >
              Закрити
            </button>
          </div>
        </div>
      )}

      {/* --- REGISTER ORGANIZATION MODAL --- */}
      {isOrgRegisterModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-[380px] p-6 shadow-2xl animate-scaleUp text-left relative">
            
            <button
              onClick={() => setIsOrgRegisterModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-all active:scale-95"
            >
              <X size={18} />
            </button>

            <h3 className="font-black text-gray-900 text-base mb-1">
              Реєстрація організації
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-5">
              Створіть кабінет організатора для публікації заходів
            </p>

            <form onSubmit={handleOrgRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 px-0.5">
                  Назва організації
                </label>
                <input
                  type="text"
                  placeholder="напр. Foundation Coffee чи Кафедра IT"
                  value={regOrgName}
                  onChange={(e) => setRegOrgName(e.target.value)}
                  required
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 px-0.5">
                  Адреса офісу / Локація
                </label>
                <input
                  type="text"
                  placeholder="вул. Канатна, 15"
                  value={regOrgAddr}
                  onChange={(e) => setRegOrgAddr(e.target.value)}
                  required
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 px-0.5">
                  Опис
                </label>
                <textarea
                  rows="2"
                  placeholder="Опишіть діяльність вашої організації..."
                  value={regOrgDesc}
                  onChange={(e) => setRegOrgDesc(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#FF5522] resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#FF5522] hover:bg-[#FF5522]/90 text-white font-extrabold rounded-full text-xs shadow-md uppercase tracking-wider transition-all active:scale-95"
              >
                Створити організацію
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
