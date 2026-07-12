import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
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
  Star,
  LogOut,
  Camera,
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Trash2,
  Settings
} from 'lucide-react'
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from './store/useStore'

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:8000/api" : "/api");

import Toast from './components/Toast';
import TimePickerModal from './components/TimePickerModal';
import ReviewsModal from './components/ReviewsModal';
import OrgRegisterModal from './components/OrgRegisterModal';
import ShiftDetailsModal from './components/ShiftDetailsModal';

import AuthForm from './components/auth/AuthForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import OtpVerifyForm from './components/auth/OtpVerifyForm';
import VolunteerDashboard from './components/volunteer/VolunteerDashboard';
import BookedShiftsList from './components/volunteer/BookedShiftsList';
import VolunteerProfile from './components/volunteer/VolunteerProfile';
import CoordinatorShifts from './components/coordinator/CoordinatorShifts';
import ShiftCreateForm from './components/coordinator/ShiftCreateForm';
import CoordinatorProfile from './components/coordinator/CoordinatorProfile';
import Navigation from './components/shared/Navigation';
import Sidebar from './components/coordinator/Sidebar';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    user, setUser, organization, setOrganization, currentRole, setCurrentRole,
    activeB2CTab, setActiveB2CTab, activeB2BTab, setActiveB2BTab,
    shifts, bookedShifts, b2bApplications, b2bShifts, orgMembers,
    toast, showToastMsg, logout, loadData, fetchVolunteerReviews, apiCall,
    isOrgRegisterModalOpen, setIsOrgRegisterModalOpen,
    selectedVolunteerProfile, setSelectedVolunteerProfile,
    volunteerReviews, setVolunteerReviews,
    reviewsModalUserName, setReviewsModalUserName,
    isReviewsModalOpen, setIsReviewsModalOpen,
    showSettingsPanel, setShowSettingsPanel,
    activeB2BFilter, setActiveB2BFilter,
    activeB2CShiftsFilter, setActiveB2CShiftsFilter
  } = useStore();

  // Form Inputs
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [otpMode, setOtpMode] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [regRole, setRegRole] = useState('B2C');
  const [googlePhone, setGooglePhone] = useState('');

  // Password Reset States
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetOtpMode, setResetOtpMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtpCode, setResetOtpCode] = useState('');
  const [resetEnteredOtp, setResetEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Organization Register Form
  const [regOrgName, setRegOrgName] = useState('');
  const [regOrgDesc, setRegOrgDesc] = useState('');
  const [regOrgAddr, setRegOrgAddr] = useState('');

  // Shift Create Form
  const [formTitle, setFormTitle] = useState('');
  const [formSphere, setFormSphere] = useState('');
  const [formHours, setFormHours] = useState('09:00 - 18:00');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [tempStartHour, setTempStartHour] = useState('09');
  const [tempStartMin, setTempStartMin] = useState('00');
  const [tempEndHour, setTempEndHour] = useState('18');
  const [tempEndMin, setTempEndMin] = useState('00');
  const [formLocation, setFormLocation] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Map Picker Refs
  const pickerMapRef = useRef(null);
  const pickerMarkerRef = useRef(null);

  // Attendance Code input state per application
  const [attendanceCodes, setAttendanceCodes] = useState({}); // { appId: 'code' }
  const [showQrCodes, setShowQrCodes] = useState({}); // { appId: boolean }

  // Rating & Review form state per application
  const [ratings, setRatings] = useState({}); // { appId: 5 }
  const [reviews, setReviews] = useState({}); // { appId: 'comment' }

  // Search and Profile Editing States
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editEmailOtpCode, setEditEmailOtpCode] = useState('');
  const [emailOtpMode, setEmailOtpMode] = useState(false);
  const [sentEmailOtp, setSentEmailOtp] = useState('');
  const [editOrgName, setEditOrgName] = useState('');
  const [editOrgDesc, setEditOrgDesc] = useState('');
  const [editOrgAddr, setEditOrgAddr] = useState('');

  const [currentDetailsShift, setCurrentDetailsShift] = useState(null);
  const [inviteOrgName, setInviteOrgName] = useState(null);
  const [isMembersListExpanded, setIsMembersListExpanded] = useState(true);
  const [showCreateMapPicker, setShowCreateMapPicker] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(true);

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

  // Sync route path changes to active tab state
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/volunteer/')) {
      const tab = path.split('/').pop();
      if (['search', 'myshifts', 'profile'].includes(tab)) {
        setActiveB2CTab(tab);
        setCurrentRole('B2C');
      }
    } else if (path.startsWith('/coordinator/')) {
      const tab = path.split('/').pop();
      if (['manage', 'create', 'profile'].includes(tab)) {
        setActiveB2BTab(tab);
        setCurrentRole('B2B');
      }
    }
  }, [location.pathname, setActiveB2CTab, setActiveB2BTab, setCurrentRole]);

  // Handle invitation links
  const handleInviteToken = useCallback(async (token, currentUser) => {
    if (!currentUser) {
      sessionStorage.setItem('pending_invite_token', token);
      return;
    }
    
    // Remove immediately to prevent duplicate parallel runs during re-renders/state updates
    sessionStorage.removeItem('pending_invite_token');
    
    // Clear token from URL query string if present
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has('invite')) {
        url.searchParams.delete('invite');
        window.history.replaceState({}, document.title, url.pathname + url.search);
      }
    } catch (e) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    try {
      const valRes = await fetch(`${API_URL}/organizations/invitations/validate/${token}`);
      if (!valRes.ok) {
        const errData = await valRes.json().catch(() => ({}));
        showToastMsg(errData.detail || "Запрошення недійсне або термін його дії закінчився", "error");
        window.history.replaceState({}, document.title, window.location.pathname);
        sessionStorage.removeItem('pending_invite_token');
        return;
      }
      
      const valData = await valRes.json();
      const orgName = valData.organization_name;
      
      const headers = {};
      const tokenLocal = localStorage.getItem('oneclick_user_token') || currentUser.token;
      if (tokenLocal) {
        headers['Authorization'] = `Bearer ${tokenLocal}`;
      }
      
      if (currentUser.company_id) {
        if (currentUser.company_role === 'owner') {
          const confirmDeleteAndJoin = window.confirm(`Ви є власником іншої організації. Приєднання до нової автоматично видалить вашу поточну організацію та всі її дані. Ви впевнені, що хочете видалити її та приєднатися до "${orgName}"?`);
          if (!confirmDeleteAndJoin) {
            window.history.replaceState({}, document.title, window.location.pathname);
            sessionStorage.removeItem('pending_invite_token');
            return;
          }
          const delRes = await fetch(`${API_URL}/organizations`, {
            method: 'DELETE',
            headers: headers
          });
          if (!delRes.ok) {
            const errData = await delRes.json().catch(() => ({}));
            throw new Error(errData.detail || "Не вдалося видалити вашу поточну організацію");
          }
        } else {
          const confirmSwitch = window.confirm(`Ви вже є учасником іншої організації. Бажаєте вийти з неї та приєднатися до "${orgName}"?`);
          if (!confirmSwitch) {
            window.history.replaceState({}, document.title, window.location.pathname);
            sessionStorage.removeItem('pending_invite_token');
            return;
          }
          const leaveRes = await fetch(`${API_URL}/organizations/leave`, {
            method: 'POST',
            headers: headers
          });
          if (!leaveRes.ok) {
            const errData = await leaveRes.json().catch(() => ({}));
            throw new Error(errData.detail || "Не вдалося вийти з вашої поточної організації");
          }
        }
      } else {
        const confirmJoin = window.confirm(`Бажаєте приєднатися до організації "${orgName}"?`);
        if (!confirmJoin) {
          window.history.replaceState({}, document.title, window.location.pathname);
          sessionStorage.removeItem('pending_invite_token');
          return;
        }
      }
      
      const acceptRes = await fetch(`${API_URL}/organizations/accept-invitation/${token}`, {
        method: 'POST',
        headers: headers
      });
      
      if (!acceptRes.ok) {
        const errData = await acceptRes.json().catch(() => ({}));
        showToastMsg(errData.detail || "Помилка при прийнятті запрошення", "error");
      } else {
        const updatedUser = await acceptRes.json();
        setUser(updatedUser);
        setCurrentRole('B2B');
        localStorage.setItem('oneclick_user_role', 'B2B');
        
        const orgRes = await fetch(`${API_URL}/auth/my-org`, { headers }).then(r => r.ok ? r.json() : null).catch(() => null);
        if (orgRes) {
          setOrganization(orgRes);
        }
        
        showToastMsg(`Ви успішно приєдналися до "${orgName}"!`, "success");
      }
      
      window.history.replaceState({}, document.title, window.location.pathname);
      sessionStorage.removeItem('pending_invite_token');
      loadData(selectedDateStr, selectedFilter, searchQuery);
    } catch (err) {
      console.error(err);
      showToastMsg(err.message || "Помилка обробки запрошення", "error");
      window.history.replaceState({}, document.title, window.location.pathname);
      sessionStorage.removeItem('pending_invite_token');
    }
  }, [loadData, selectedDateStr, selectedFilter, searchQuery, setUser, setOrganization, setCurrentRole, showToastMsg]);

  useEffect(() => {
    const inviteToken = new URLSearchParams(window.location.search).get('invite');
    if (inviteToken) {
      sessionStorage.setItem('pending_invite_token', inviteToken);
    }
    const token = sessionStorage.getItem('pending_invite_token');
    if (token) {
      if (user) {
        handleInviteToken(token, user);
      } else {
        fetch(`${API_URL}/organizations/invitations/validate/${token}`)
          .then(r => {
            if (!r.ok) throw new Error("Invalid");
            return r.json();
          })
          .then(data => {
            setInviteOrgName(data.organization_name);
          })
          .catch(() => {
            setInviteOrgName(null);
            sessionStorage.removeItem('pending_invite_token');
          });
      }
    } else {
      setInviteOrgName(null);
    }
  }, [user, handleInviteToken]);

  // Fetch data on parameters change, role change or organization change
  useEffect(() => {
    if (user) {
      loadData(selectedDateStr, selectedFilter, searchQuery);
    }
  }, [loadData, user, currentRole, organization?.id, selectedDateStr, selectedFilter, searchQuery]);

  // Leaflet Map Picker Initialization (Odessa-bound)
  useEffect(() => {
    if (activeB2BTab === 'create' && window.L) {
      const timer = setTimeout(() => {
        const mapContainer = document.getElementById('address-picker-map');
        if (!mapContainer) return;

        const defaultLat = 46.4825;
        const defaultLng = 30.7233;

        if (!pickerMapRef.current) {
          const map = window.L.map('address-picker-map').setView([defaultLat, defaultLng], 12);
          
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
          }).addTo(map);

          const marker = window.L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);
          pickerMarkerRef.current = marker;
          pickerMapRef.current = map;

          const handleMapInteraction = async (lat, lng) => {
            marker.setLatLng([lat, lng]);
            map.panTo([lat, lng]);
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=uk`);
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
                setFormAddress(addrStr);
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
        } else {
          pickerMapRef.current.invalidateSize();
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (pickerMapRef.current) {
          pickerMapRef.current.remove();
          pickerMapRef.current = null;
          pickerMarkerRef.current = null;
        }
      };
    }
  }, [activeB2BTab, showCreateMapPicker]);

  const handleAddressBlur = async () => {
    if (!formAddress.trim()) return;
    try {
      const query = formAddress.toLowerCase().includes('одеса') ? formAddress : `${formAddress}, Одеса`;
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        if (pickerMapRef.current && pickerMarkerRef.current) {
          pickerMarkerRef.current.setLatLng([newLat, newLng]);
          pickerMapRef.current.setView([newLat, newLng], 15);
        }
      }
    } catch (err) {
      console.error("Geocoding address error:", err);
    }
  };

  // Profile Editing Helpers
  const startEditingProfile = () => {
    setEditName(user.name || '');
    setEditPhone(user.phone ? user.phone.replace('+380', '') : '');
    setEditEmail(user.email || '');
    setEmailOtpMode(false);
    setEditEmailOtpCode('');
    if (organization) {
      setEditOrgName(organization.name || '');
      setEditOrgDesc(organization.description || '');
      setEditOrgAddr(organization.address || '');
    }
    setIsEditingProfile(true);
  };

  const cancelEditingProfile = () => {
    setIsEditingProfile(false);
    setEmailOtpMode(false);
    setEditEmailOtpCode('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToastMsg("Ім'я не може бути порожнім", "error");
      return;
    }

    const newEmail = editEmail.trim();
    const currentEmail = user.email || '';
    if (newEmail && newEmail !== currentEmail && !emailOtpMode) {
      const generatedCode = String(Math.floor(1000 + Math.random() * 9000));
      setSentEmailOtp(generatedCode);
      try {
        await apiCall('/users/send-email-otp', 'POST', {
          email: newEmail,
          code: generatedCode
        });
        setEmailOtpMode(true);
        setEditEmailOtpCode('');
        showToastMsg(`Код підтвердження надіслано на пошту! (Код: ${generatedCode})`, "success");
      } catch (err) {
        console.error(err);
        showToastMsg(err.message || "Помилка при надсиланні коду", "error");
      }
      return;
    }

    if (emailOtpMode && editEmailOtpCode !== sentEmailOtp) {
      showToastMsg("Невірний код підтвердження пошти", "error");
      return;
    }

    try {
      const updatedUser = await apiCall('/users/profile', 'PUT', {
        name: editName,
        phone: editPhone ? `+380${editPhone}` : null,
        email: editEmail || null,
        email_otp_code: emailOtpMode ? editEmailOtpCode : null,
        org_name: currentRole === 'B2B' ? editOrgName : null,
        org_address: currentRole === 'B2B' ? editOrgAddr : null,
        org_description: currentRole === 'B2B' ? editOrgDesc : null,
      });
      setUser(updatedUser);
      if (updatedUser.token) {
        localStorage.setItem('oneclick_user_token', updatedUser.token);
      }

      if (currentRole === 'B2B') {
        const org = await apiCall('/auth/my-org');
        setOrganization(org);
      }

      setIsEditingProfile(false);
      setEmailOtpMode(false);
      setEditEmailOtpCode('');
      showToastMsg("Профіль успішно оновлено!", "success");
      loadData(selectedDateStr, selectedFilter, searchQuery, true);
    } catch (err) {
      console.error(err);
      showToastMsg(err.message || "Помилка оновлення профілю", "error");
    }
  };

  const handleGenerateInvite = async () => {
    try {
      const data = await apiCall('/organizations/invitations', 'POST', {
        role: 'member'
      });
      const inviteUrl = `${window.location.origin}/?invite=${data.token}`;
      
      let copied = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(inviteUrl);
          copied = true;
        } catch (clipErr) {
          console.warn("Failed navigator.clipboard, trying fallback", clipErr);
        }
      }
      
      if (!copied) {
        try {
          const textArea = document.createElement("textarea");
          textArea.value = inviteUrl;
          textArea.style.position = "fixed";
          textArea.style.top = "0";
          textArea.style.left = "0";
          textArea.style.opacity = "0";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          copied = document.execCommand('copy');
          document.body.removeChild(textArea);
        } catch (fallbackErr) {
          console.error("Fallback copy failed", fallbackErr);
        }
      }
      
      if (copied) {
        showToastMsg("Посилання для запрошення згенеровано та скопійовано в буфер обміну!", "success");
      } else {
        window.prompt("Посилання згенеровано! Скопіюйте його вручну:", inviteUrl);
      }
    } catch (err) {
      console.error(err);
      showToastMsg(err.message || "Помилка генерації запрошення", "error");
    }
  };

  const handleUpdateMemberRole = async (memberId, newRole) => {
    try {
      await apiCall(`/organizations/members/${memberId}/role`, 'PUT', {
        role: newRole
      });
      showToastMsg("Роль успішно оновлено!", "success");
      loadData(selectedDateStr, selectedFilter, searchQuery, true);
    } catch (err) {
      console.error(err);
      showToastMsg(err.message || "Помилка оновлення ролі", "error");
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!window.confirm(`Ви дійсно бажаєте вилучити ${memberName} з організації?`)) {
      return;
    }
    try {
      await apiCall(`/organizations/members/${memberId}`, 'DELETE');
      showToastMsg(`${memberName} вилучено з організації`, "success");
      loadData(selectedDateStr, selectedFilter, searchQuery, true);
    } catch (err) {
      console.error(err);
      showToastMsg(err.message || "Помилка вилучення учасника", "error");
    }
  };

  const handleLeaveOrganization = async () => {
    if (!window.confirm("Ви дійсно бажаєте вийти з організації? Ви втратите доступ до кабінету організатора.")) {
      return;
    }
    try {
      const updatedUser = await apiCall('/organizations/leave', 'POST');
      setUser(updatedUser);
      setOrganization(null);
      setCurrentRole('B2C');
      navigate('/volunteer/search');
      showToastMsg("Ви успішно вийшли з організації", "success");
      loadData(selectedDateStr, selectedFilter, searchQuery, true);
    } catch (err) {
      console.error(err);
      showToastMsg(err.message || "Помилка виходу з організації", "error");
    }
  };

  const handleDeleteOrganization = async () => {
    if (!window.confirm("УВАГА! Ви дійсно бажаєте видалити організацію? Усі створені заходи будуть видалені, а всі учасники повернуться до статусу індивідуальних волонтерів. Цю дію неможливо скасувати!")) {
      return;
    }
    try {
      const updatedUser = await apiCall('/organizations', 'DELETE');
      setUser(updatedUser);
      setOrganization(null);
      setCurrentRole('B2C');
      navigate('/volunteer/search');
      showToastMsg("Організацію успішно видалено", "success");
      loadData(selectedDateStr, selectedFilter, searchQuery, true);
    } catch (err) {
      console.error(err);
      showToastMsg(err.message || "Помилка видалення організації", "error");
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToastMsg("Розмір файлу не повинен перевищувати 5MB", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const headers = {};
    const token = localStorage.getItem('oneclick_user_token') || (user && user.token);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else if (user) {
      headers['x-user-id'] = String(user.id);
    }

    try {
      const response = await fetch(`${API_URL}/users/avatar`, {
        method: "POST",
        headers,
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Помилка при завантаженні");
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      showToastMsg("Фото профілю оновлено!", "success");
      loadData(selectedDateStr, selectedFilter, searchQuery);
    } catch (err) {
      console.error(err);
      showToastMsg(err.message || "Не вдалося завантажити фото", "error");
    }
  };

  // Restore user session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const storedUserId = localStorage.getItem('oneclick_user_id');
      const storedUserRole = localStorage.getItem('oneclick_user_role');
      const storedUserToken = localStorage.getItem('oneclick_user_token');
      if (storedUserId) {
        try {
          const reqHeaders = {};
          if (storedUserToken) {
            reqHeaders['Authorization'] = `Bearer ${storedUserToken}`;
          } else {
            reqHeaders['x-user-id'] = String(storedUserId);
          }

          const userData = await fetch(`${API_URL}/auth/me`, {
            headers: reqHeaders
          }).then(async r => {
            if (!r.ok) throw new Error("Session invalid");
            return r.json();
          });

          setUser(userData);
          const activeRole = storedUserRole || userData.role;
          setCurrentRole(activeRole);

          // Fetch organization info if any
          const org = await fetch(`${API_URL}/auth/my-org`, {
            headers: reqHeaders
          }).then(r => r.ok ? r.json() : null).catch(() => null);

          if (org) {
            setOrganization(org);
          }

          // Initial routing based on authenticated user's role
          if (location.pathname === '/' || location.pathname === '/login') {
            if (activeRole === 'B2C') {
              navigate('/volunteer/search');
            } else {
              navigate('/coordinator/manage');
            }
          }
        } catch (err) {
          console.warn("Помилка відновлення сесії:", err);
          logout();
          navigate('/login');
        } finally {
          setIsRestoringSession(false);
        }
      } else {
        navigate('/login');
        setIsRestoringSession(false);
      }
    };
    restoreSession();
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (regRole === 'B2B') {
      try {
        const checkRes = await fetch(`${API_URL}/auth/check-email?email=${encodeURIComponent(regEmail)}`).then(r => r.json());

        if (checkRes.exists) {
          const userData = await apiCall('/auth/login-or-register', 'POST', {
            name: regName || "",
            email: regEmail,
            password: regPassword,
            role: 'B2B'
          });
          setUser(userData);
          setCurrentRole(userData.role);

          localStorage.setItem('oneclick_user_id', String(userData.id));
          localStorage.setItem('oneclick_user_role', userData.role);
          if (userData.token) {
            localStorage.setItem('oneclick_user_token', userData.token);
          }

          const org = await fetch(`${API_URL}/auth/my-org`, {
            headers: userData.token ? { 'Authorization': `Bearer ${userData.token}` } : { 'x-user-id': String(userData.id) }
          }).then(r => r.ok ? r.json() : null).catch(() => null);

          if (org) {
            setOrganization(org);
            setCurrentRole('B2B');
            localStorage.setItem('oneclick_user_role', 'B2B');
            navigate('/coordinator/manage');
          } else {
            navigate('/coordinator/manage');
          }
          showToastMsg(`Вітаємо, ${userData.name}! Вхід успішний.`, 'success');
        } else {
          if (!regName || !regName.trim()) {
            showToastMsg("Будь ласка, введіть ваше ім'я для реєстрації", "error");
            return;
          }
          if (!regPassword || regPassword.length < 6) {
            showToastMsg("Пароль має містити щонайменше 6 символів", "error");
            return;
          }
          const generatedCode = String(Math.floor(1000 + Math.random() * 9000));

          await apiCall('/auth/send-verification-email', 'POST', {
            email: regEmail,
            code: generatedCode
          });

          setOtpCode(generatedCode);
          setOtpMode(true);
          setEnteredOtp('');
          showToastMsg(`Код підтвердження надіслано на пошту ${regEmail}`, 'success');
        }
      } catch (err) {
        console.error(err);
        showToastMsg(err.message || "Невірний пароль або помилка авторизації", "error");
      }
    } else {
      if (regPhone.length !== 9) {
        showToastMsg("Введіть коректний 9-значний номер телефону (без першого нуля)", "error");
        return;
      }

      try {
        const checkRes = await fetch(`${API_URL}/auth/check-phone?phone=${encodeURIComponent('+380' + regPhone)}`).then(r => r.json());
        if (!checkRes.exists && (!regName || !regName.trim())) {
          showToastMsg("Будь ласка, введіть ваше ім'я для реєстрації", "error");
          return;
        }
      } catch (err) {
        console.error(err);
      }

      const generatedCode = String(Math.floor(1000 + Math.random() * 9000));
      
      try {
        await apiCall('/auth/send-verification-sms', 'POST', {
          phone: '+380' + regPhone,
          code: generatedCode
        });
      } catch (err) {
        console.error("SMS simulation send failed:", err);
      }

      setOtpCode(generatedCode);
      setOtpMode(true);
      setEnteredOtp('');

      // Code is visible on the screen in OtpVerifyForm
      console.log(`[SMS Simulation] Verification code: ${generatedCode}`);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (enteredOtp !== otpCode) {
      showToastMsg("Невірний код підтвердження", "error");
      return;
    }

    try {
      const payload = regRole === 'B2B' ? {
        name: regName,
        email: regEmail,
        password: regPassword,
        otp_code: enteredOtp,
        role: 'B2B'
      } : {
        name: regName,
        phone: `+380${regPhone}`,
        otp_code: enteredOtp,
        role: regRole
      };

      const userData = await apiCall('/auth/login-or-register', 'POST', payload);
      setUser(userData);

      const org = await fetch(`${API_URL}/auth/my-org`, {
        headers: userData.token ? { 'Authorization': `Bearer ${userData.token}` } : { 'x-user-id': String(userData.id) }
      }).then(r => r.ok ? r.json() : null).catch(() => null);

      if (org) {
        setOrganization(org);
      } else {
        setOrganization(null);
      }

      const initialRole = regRole;
      setCurrentRole(initialRole);

      localStorage.setItem('oneclick_user_id', String(userData.id));
      localStorage.setItem('oneclick_user_role', initialRole);
      if (userData.token) {
        localStorage.setItem('oneclick_user_token', userData.token);
      }
      showToastMsg(`Вітаємо, ${userData.name}! Реєстрація успішна.`, 'success');
      setOtpMode(false);
      setOtpCode('');
      setEnteredOtp('');
      
      if (initialRole === 'B2C') {
        navigate('/volunteer/search');
      } else {
        navigate('/coordinator/manage');
      }
    } catch (err) {
      console.error(err);
      showToastMsg(err.message || "Помилка реєстрації", "error");
    }
  };

  const handleRequestResetOtp = async (e) => {
    e.preventDefault();
    try {
      const checkRes = await fetch(`${API_URL}/auth/check-email?email=${encodeURIComponent(resetEmail)}`).then(r => r.json());
      if (!checkRes.exists) {
        showToastMsg("Користувача з такою електронною поштою не знайдено", "error");
        return;
      }

      const generatedCode = String(Math.floor(1000 + Math.random() * 9000));
      setResetOtpCode(generatedCode);

      await apiCall('/auth/send-verification-email', 'POST', {
        email: resetEmail,
        code: generatedCode
      });

      setResetOtpMode(true);
      setResetEnteredOtp('');
      showToastMsg(`Код для зміни паролю надіслано на пошту ${resetEmail}`, 'success');
    } catch (err) {
      console.error(err);
      showToastMsg(err.message || "Помилка відправки коду", "error");
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (resetEnteredOtp !== resetOtpCode) {
      showToastMsg("Невірний код підтвердження", "error");
      return;
    }

    try {
      await apiCall('/auth/reset-password', 'POST', {
        email: resetEmail,
        new_password: newPassword
      });

      showToastMsg("Пароль успішно змінено! Тепер ви можете увійти.", "success");
      setForgotPasswordMode(false);
      setResetOtpMode(false);
      setResetEnteredOtp('');
      setNewPassword('');
      setRegEmail(resetEmail);
    } catch (err) {
      console.error(err);
      showToastMsg(err.message || "Помилка при зміні паролю", "error");
    }
  };

  const handleGoogleLogin = () => {
    if (typeof window === 'undefined' || !window.google) {
      showToastMsg("Google SDK не завантажився. Будь ласка, зачекайте або оновіть сторінку.", "error");
      return;
    }
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            try {
              const userData = await apiCall('/auth/google', 'POST', {
                access_token: tokenResponse.access_token,
                role: regRole,
                org_name: regRole === 'B2B' ? regOrgName : null,
                org_address: regRole === 'B2B' ? regOrgAddr : null,
                org_description: regRole === 'B2B' ? regOrgDesc : null
              });
              setUser(userData);

              const org = await fetch(`${API_URL}/auth/my-org`, {
                headers: userData.token ? { 'Authorization': `Bearer ${userData.token}` } : { 'x-user-id': String(userData.id) }
              }).then(r => r.ok ? r.json() : null).catch(() => null);

              if (org) {
                setOrganization(org);
              } else {
                setOrganization(null);
              }

              const initialRole = regRole || userData.role;
              setCurrentRole(initialRole);

              localStorage.setItem('oneclick_user_id', String(userData.id));
              localStorage.setItem('oneclick_user_role', initialRole);
              if (userData.token) {
                localStorage.setItem('oneclick_user_token', userData.token);
              }
              showToastMsg(`Вітаємо, ${userData.name}! Вхід через Google успішний.`, 'success');
              
              if (initialRole === 'B2C') {
                navigate('/volunteer/search');
              } else {
                navigate('/coordinator/manage');
              }
            } catch (err) {
              console.error("Помилка авторизації на бекенді:", err);
            }
          }
        },
      });
      client.requestAccessToken();
    } catch (err) {
      console.error("Помилка ініціалізації Google OAuth:", err);
      showToastMsg("Не вдалося запустити вхід через Google.", "error");
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
    showToastMsg("Ви вийшли з системи", "success");
  };

  const handleOrgRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      if (user && !user.phone) {
        if (googlePhone.length !== 9) {
          showToastMsg("Введіть коректний 9-значний номер телефону (без першого нуля)", "error");
          return;
        }
        const updatedUser = await apiCall('/users/profile', 'PUT', {
          name: user.name,
          phone: `+380${googlePhone}`
        });
        setUser(updatedUser);
      }

      const orgData = await apiCall('/auth/register-org', 'POST', {
        name: regOrgName,
        description: regOrgDesc,
        address: regOrgAddr
      });
      setOrganization(orgData);

      const updatedUser = await apiCall('/auth/me');
      setUser(updatedUser);
      setCurrentRole('B2B');
      localStorage.setItem('oneclick_user_role', 'B2B');
      setIsOrgRegisterModalOpen(false);
      showToastMsg(`Організацію "${orgData.name}" успішно створено!`, 'success');
      navigate('/coordinator/manage');
      loadData(selectedDateStr, selectedFilter, searchQuery);
    } catch (err) {
      console.error(err);
      showToastMsg(err.message || "Помилка реєстрації організації", "error");
    }
  };

  const toggleRole = () => {
    if (currentRole === 'B2C' && !organization) {
      setIsOrgRegisterModalOpen(true);
      return;
    }
    const nextRole = currentRole === 'B2C' ? 'B2B' : 'B2C';
    setCurrentRole(nextRole);
    localStorage.setItem('oneclick_user_role', nextRole);
    showToastMsg(`Перехід до кабінету ${nextRole === 'B2C' ? 'Волонтера' : 'Організатора'}`, 'info');
    if (nextRole === 'B2C') {
      navigate('/volunteer/search');
    } else {
      navigate('/coordinator/manage');
    }
  };

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
      navigate('/volunteer/myshifts');
      loadData(selectedDateStr, selectedFilter, searchQuery, true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewCandidate = async (appId, status) => {
    try {
      await apiCall(`/applications/${appId}/review-candidate?status=${status}`, 'POST');
      showToastMsg(status === 'approved' ? "Кандидата підтверджено!" : "Кандидата відхилено.", "success");
      loadData(selectedDateStr, selectedFilter, searchQuery, true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmAttendance = async (appId) => {
    const code = attendanceCodes[appId];
    if (!code || !code.trim()) {
      showToastMsg("Введіть код волонтера", "error");
      return;
    }
    try {
      await apiCall('/applications/confirm-attendance', 'POST', { code });
      showToastMsg("Присутність волонтера підтверджено!", "success");
      loadData(selectedDateStr, selectedFilter, searchQuery, true);
    } catch (err) {
      console.error(err);
    }
  };

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
      loadData(selectedDateStr, selectedFilter, searchQuery, true);

      const updatedUser = await apiCall('/auth/me');
      setUser(updatedUser);
    } catch (err) {
      console.error(err);
    }
  };

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
        time: `${startTime} - ${endTime}`,
        location: formLocation,
        address: formAddress,
        description: formDescription,
        max_volunteers: 1
      });
      showToastMsg("Захід успішно створено та опубліковано!", "success");
      setFormTitle('');
      navigate('/coordinator/manage');
      setActiveB2BFilter('АКТИВНІ');
      loadData(selectedDateStr, selectedFilter, searchQuery, true);
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered shifts for B2B lists
  const filteredB2BShifts = useMemo(() => {
    return b2bShifts.filter(shift => {
      if (activeB2BFilter === "АКТИВНІ") {
        return shift.status === "open";
      } else {
        return shift.status !== "open";
      }
    });
  }, [b2bShifts, activeB2BFilter]);

  // Filtered booked shifts for B2C lists (Active vs Completed)
  const filteredB2CBookedShifts = useMemo(() => {
    return bookedShifts.filter(app => {
      if (activeB2CShiftsFilter === "АКТИВНІ") {
        return app.status === "pending" || app.status === "approved";
      } else {
        return app.status === "attended" || app.status === "reviewed" || app.status === "rejected";
      }
    });
  }, [bookedShifts, activeB2CShiftsFilter]);

  // Session Restoring Loading Screen
  if (isRestoringSession) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-[#111111] via-[#1a1a24] to-[#0e0e12] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-[#FF5522]/20 border-t-[#FF5522] animate-spin"></div>
            <div className="absolute inset-2 rounded-full bg-[#FF5522]/10 flex items-center justify-center">
              <div className="w-3.5 h-3.5 rounded-full bg-[#FF5522] animate-ping"></div>
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-2">
            <span className="text-[#FF5522]">One</span>Click
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
            Завантаження сесії...
          </p>
        </div>
      </div>
    );
  }

  // Google Login Missing Phone Flow
  if (user && !user.phone && user.role !== 'B2B') {
    const handleGooglePhoneSubmit = async (e) => {
      e.preventDefault();
      if (googlePhone.length !== 9) {
        showToastMsg("Введіть коректний 9-значний номер телефону (без першого нуля)", "error");
        return;
      }
      try {
        const updatedUser = await apiCall('/users/profile', 'PUT', {
          name: user.name,
          phone: `+380${googlePhone}`
        });
        setUser(updatedUser);
        showToastMsg("Номер телефону додано!", "success");
        navigate('/volunteer/search');
        loadData(selectedDateStr, selectedFilter, searchQuery);
      } catch (err) {
        console.error(err);
      }
    };

    return (
      <div className="w-full min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="w-full max-w-[450px] min-h-screen md:min-h-[680px] bg-[#f5f5f7] md:rounded-[40px] md:shadow-2xl overflow-hidden relative flex flex-col justify-between p-6 text-[#111111]">
          <div className="flex-1 flex flex-col items-center justify-center my-auto">
            <h1 className="text-3xl font-black tracking-tight mb-2">
              <span className="text-[#FF5522]">One</span><span className="text-gray-950">Click</span>
            </h1>
            <h2 className="text-sm font-bold text-gray-900 mb-1">Останній крок</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-8">Завершіть реєстрацію</p>

            <form onSubmit={handleGooglePhoneSubmit} className="w-full max-w-[320px] space-y-4">
              <div className="text-left">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                  Номер телефону
                </label>
                <div className="flex gap-2 items-center">
                  <span className="bg-gray-100 border border-gray-200 text-gray-500 font-extrabold rounded-2xl px-3 py-3.5 text-xs shrink-0">
                    +380
                  </span>
                  <input
                    type="text"
                    placeholder="931234567"
                    value={googlePhone}
                    onChange={(e) => setGooglePhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    required
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm transition-all"
                  />
                </div>
                <span className="text-[9px] text-gray-400 mt-1 block px-1">
                  Введіть 9 цифр (наприклад, 931234567)
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-4 mt-2 bg-[#FF5522] hover:bg-[#FF5522]/90 text-white font-extrabold rounded-full shadow-md text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
              >
                Зберегти та продовжити
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full py-3.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-extrabold rounded-full shadow-sm text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                Скасувати
              </button>
            </form>
          </div>

          <div className="text-center text-[10px] text-gray-400 mt-6 font-bold uppercase tracking-wider">
            © 2026 OneClick
          </div>
        </div>
      </div>
    );
  }

  // Auth Flow Route
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={
          <div className="w-full min-h-screen bg-[#f5f5f7] flex items-center justify-center">
            <div className="w-full max-w-[450px] min-h-screen md:min-h-[680px] bg-[#f5f5f7] md:rounded-[40px] md:shadow-2xl overflow-hidden relative flex flex-col justify-between p-6 text-[#111111]">
              <div className="flex-1 flex flex-col items-center justify-center my-auto">
                <h1 className="text-4xl font-black tracking-tight mb-2">
                  <span className="text-[#FF5522]">One</span><span className="text-gray-950">Click</span>
                </h1>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-8">Платформа волонтерства</p>

                {inviteOrgName && (
                  <div className="w-full max-w-[320px] mb-6 bg-orange-50 border border-orange-200 rounded-3xl p-4 text-left animate-fadeIn shadow-sm flex items-start gap-2.5">
                    <Info size={16} className="text-[#FF5522] shrink-0 mt-0.5" />
                    <div className="text-[10px] text-gray-700 font-semibold leading-relaxed">
                      <span className="font-extrabold text-[#FF5522]">Запрошення!</span> Вас запросили приєднатися до команди організації <span className="font-black text-gray-900 select-all">"{inviteOrgName}"</span>. Увійдіть або зареєструйтеся, щоб автоматично прийняти запрошення та отримати доступ до кабінету.
                    </div>
                  </div>
                )}

                {otpMode ? (
                  <OtpVerifyForm
                    enteredOtp={enteredOtp}
                    setEnteredOtp={setEnteredOtp}
                    otpCode={otpCode}
                    regEmail={regEmail}
                    regPhone={regPhone}
                    regRole={regRole}
                    setOtpMode={setOtpMode}
                    setOtpCode={setOtpCode}
                    handleVerifyOtp={handleVerifyOtp}
                  />
                ) : forgotPasswordMode ? (
                  <ResetPasswordForm
                    resetEmail={resetEmail}
                    setResetEmail={setResetEmail}
                    newPassword={newPassword}
                    setNewPassword={setNewPassword}
                    resetOtpCode={resetOtpCode}
                    resetEnteredOtp={resetEnteredOtp}
                    setResetEnteredOtp={setResetEnteredOtp}
                    resetOtpMode={resetOtpMode}
                    setResetOtpMode={setResetOtpMode}
                    handleResetPasswordSubmit={handleResetPasswordSubmit}
                    handleRequestResetOtp={handleRequestResetOtp}
                    setForgotPasswordMode={setForgotPasswordMode}
                  />
                ) : (
                  <AuthForm
                    regRole={regRole}
                    setRegRole={setRegRole}
                    regName={regName}
                    setRegName={setRegName}
                    regPhone={regPhone}
                    setRegPhone={setRegPhone}
                    regEmail={regEmail}
                    setRegEmail={setRegEmail}
                    regPassword={regPassword}
                    setRegPassword={setRegPassword}
                    handleLoginSubmit={handleLoginSubmit}
                    handleGoogleLogin={handleGoogleLogin}
                    setForgotPasswordMode={setForgotPasswordMode}
                  />
                )}
              </div>

              <div className="text-center text-[10px] text-gray-400 mt-6 font-bold uppercase tracking-wider">
                © 2026 OneClick
              </div>
            </div>
          </div>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Details overlay
  if (currentDetailsShift) {
    return (
      <ShiftDetailsModal
        shift={currentDetailsShift}
        onClose={() => setCurrentDetailsShift(null)}
        currentRole={currentRole}
        bookedShifts={bookedShifts}
        handleApplyShift={handleApplyShift}
      />
    );
  }

  return (
    <div className={(user && currentRole === 'B2B' && organization) ? "w-full h-screen bg-[#f5f5f7] relative overflow-hidden" : "w-full min-h-screen bg-[#f5f5f7] relative"}>

      {/* Toast Notification */}
      <Toast toast={toast} />

      {/* Main frame */}
      <div className={
        (user && currentRole === 'B2B' && organization)
          ? "w-full h-full bg-[#f5f5f7] relative text-[#111111] flex pb-0 overflow-hidden"
          : "w-full bg-[#f5f5f7] relative text-[#111111] max-w-[450px] mx-auto min-h-screen pb-[110px] overflow-x-hidden"
      }>

        <Routes>
          {/* Volunteer Routes */}
          <Route path="/volunteer/*" element={
            currentRole === 'B2C' ? (
              <div className="w-full px-4 pt-6">
                <Routes>
                  <Route path="search" element={
                    <VolunteerDashboard
                      shifts={shifts}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      b2cFilters={b2cFilters}
                      selectedFilter={selectedFilter}
                      setSelectedFilter={setSelectedFilter}
                      calendarDays={calendarDays}
                      selectedDateStr={selectedDateStr}
                      setSelectedDateStr={setSelectedDateStr}
                      setCurrentDetailsShift={setCurrentDetailsShift}
                      toggleRole={toggleRole}
                      organization={organization}
                    />
                  } />
                  <Route path="myshifts" element={
                    <BookedShiftsList
                      filteredB2CBookedShifts={filteredB2CBookedShifts}
                      activeB2CShiftsFilter={activeB2CShiftsFilter}
                      setActiveB2CShiftsFilter={setActiveB2CShiftsFilter}
                      setCurrentDetailsShift={setCurrentDetailsShift}
                      showQrCodes={showQrCodes}
                      setShowQrCodes={setShowQrCodes}
                    />
                  } />
                  <Route path="profile" element={
                    <VolunteerProfile
                      user={user}
                      organization={organization}
                      isEditingProfile={isEditingProfile}
                      setIsEditingProfile={setIsEditingProfile}
                      editName={editName}
                      setEditName={setEditName}
                      editPhone={editPhone}
                      setEditPhone={setEditPhone}
                      editEmail={editEmail}
                      setEditEmail={setEditEmail}
                      editEmailOtpCode={editEmailOtpCode}
                      setEditEmailOtpCode={setEditEmailOtpCode}
                      emailOtpMode={emailOtpMode}
                      cancelEditingProfile={cancelEditingProfile}
                      handleSaveProfile={handleSaveProfile}
                      handleAvatarUpload={handleAvatarUpload}
                      fetchVolunteerReviews={fetchVolunteerReviews}
                      startEditingProfile={startEditingProfile}
                      toggleRole={toggleRole}
                      setIsOrgRegisterModalOpen={setIsOrgRegisterModalOpen}
                      handleLeaveOrganization={handleLeaveOrganization}
                      handleSignOut={handleSignOut}
                      API_URL={API_URL}
                    />
                  } />
                  <Route path="*" element={<Navigate to="search" replace />} />
                </Routes>
                
                <Navigation
                  role="B2C"
                  activeTab={activeB2CTab}
                  setActiveTab={(tab) => navigate(`/volunteer/${tab}`)}
                />
              </div>
            ) : (
              <Navigate to="/coordinator/manage" replace />
            )
          } />

          {/* Coordinator Routes */}
          <Route path="/coordinator/*" element={
            currentRole === 'B2B' ? (
              <div className="w-full flex flex-col md:flex-row md:w-full min-h-screen md:min-h-0 md:h-full">
                {organization && (
                  <Sidebar
                    activeTab={activeB2BTab}
                    setActiveTab={(tab) => navigate(`/coordinator/${tab}`)}
                    organization={organization}
                    toggleRole={toggleRole}
                    handleSignOut={handleSignOut}
                    user={user}
                  />
                )}
                
                <div className="w-full px-4 pt-6 flex-1 overflow-y-auto md:p-8 md:pb-24 pb-[110px]">
                  {!organization ? (
                    <div className="animate-fadeIn py-6 text-left">
                      <div className="flex justify-between items-center mb-5">
                        <div>
                          <h1 className="text-xl font-black tracking-tight text-gray-900">Реєстрація організації</h1>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            Вкажіть дані вашої організації для продовження
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleOrgRegisterSubmit} className="space-y-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                        {user && !user.phone && (
                          <div>
                            <label className="block text-[10px] font-bold text-[#FF5522] uppercase tracking-widest mb-1.5 px-1">
                              Номер мобільного телефону
                            </label>
                            <div className="flex gap-2 items-center">
                              <span className="bg-gray-100 border border-gray-200 text-gray-500 font-extrabold rounded-2xl px-3 py-3.5 text-xs shrink-0">
                                +380
                              </span>
                              <input
                                type="text"
                                placeholder="931234567"
                                value={googlePhone}
                                onChange={(e) => setGooglePhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                                required
                                className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm transition-all"
                              />
                            </div>
                            <span className="text-[9px] text-gray-400 mt-1 block px-1">
                              Потрібен для зв'язку волонтерів з вами як організатором
                            </span>
                          </div>
                        )}

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                            Назва організації
                          </label>
                          <input
                            type="text"
                            placeholder="напр. Foundation Coffee"
                            value={regOrgName}
                            onChange={(e) => setRegOrgName(e.target.value)}
                            required
                            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                            Адреса / Локація офісу
                          </label>
                          <input
                            type="text"
                            placeholder="напр. вул. Канатна, 15"
                            value={regOrgAddr}
                            onChange={(e) => setRegOrgAddr(e.target.value)}
                            required
                            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                            Опис організації
                          </label>
                          <textarea
                            rows="3"
                            placeholder="Короткий опис діяльності організації..."
                            value={regOrgDesc}
                            onChange={(e) => setRegOrgDesc(e.target.value)}
                            required
                            className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm transition-all resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-4 mt-2 bg-[#FF5522] hover:bg-[#FF5522]/90 text-white font-extrabold rounded-full shadow-md text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
                        >
                          Зареєструвати компанію
                        </button>

                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full py-3.5 bg-[#FF5522]/10 hover:bg-[#FF5522]/20 text-[#FF5522] font-extrabold rounded-full shadow-sm text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                        >
                          Вийти з акаунту
                        </button>
                      </form>
                    </div>
                  ) : (
                    <>
                      <Routes>
                        <Route path="manage" element={
                          <CoordinatorShifts
                            organization={organization}
                            toggleRole={toggleRole}
                            activeB2BFilter={activeB2BFilter}
                            setActiveB2BFilter={setActiveB2BFilter}
                            filteredB2BShifts={filteredB2BShifts}
                            b2bApplications={b2bApplications}
                            setCurrentDetailsShift={setCurrentDetailsShift}
                            fetchVolunteerReviews={fetchVolunteerReviews}
                            handleReviewCandidate={handleReviewCandidate}
                            attendanceCodes={attendanceCodes}
                            setAttendanceCodes={setAttendanceCodes}
                            handleConfirmAttendance={handleConfirmAttendance}
                            ratings={ratings}
                            setRatings={setRatings}
                            reviews={reviews}
                            setReviews={setReviews}
                            handleRateVolunteer={handleRateVolunteer}
                            API_URL={API_URL}
                          />
                        } />

                        <Route path="create" element={
                          <ShiftCreateForm
                            formTitle={formTitle}
                            setFormTitle={setFormTitle}
                            formSphere={formSphere}
                            setFormSphere={setFormSphere}
                            startTime={startTime}
                            setStartTime={setStartTime}
                            endTime={endTime}
                            setEndTime={setEndTime}
                            formLocation={formLocation}
                            setFormLocation={setFormLocation}
                            selectedDateStr={selectedDateStr}
                            setSelectedDateStr={setSelectedDateStr}
                            calendarDays={calendarDays}
                            formAddress={formAddress}
                            setFormAddress={setFormAddress}
                            handleAddressBlur={handleAddressBlur}
                            showCreateMapPicker={showCreateMapPicker}
                            setShowCreateMapPicker={setShowCreateMapPicker}
                            formDescription={formDescription}
                            setFormDescription={setFormDescription}
                            handleCreateShift={handleCreateShift}
                            setTempStartHour={setTempStartHour}
                            setTempStartMin={setTempStartMin}
                            setTempEndHour={setTempEndHour}
                            setTempEndMin={setTempEndMin}
                            setIsTimePickerOpen={setIsTimePickerOpen}
                          />
                        } />

                        <Route path="profile" element={
                          <CoordinatorProfile
                            user={user}
                            organization={organization}
                            isEditingProfile={isEditingProfile}
                            setIsEditingProfile={setIsEditingProfile}
                            editName={editName}
                            setEditName={setEditName}
                            editPhone={editPhone}
                            setEditPhone={setEditPhone}
                            editEmail={editEmail}
                            setEditEmail={setEditEmail}
                            editEmailOtpCode={editEmailOtpCode}
                            setEditEmailOtpCode={setEditEmailOtpCode}
                            emailOtpMode={emailOtpMode}
                            editOrgName={editOrgName}
                            setEditOrgName={setEditOrgName}
                            editOrgAddr={editOrgAddr}
                            setEditOrgAddr={setEditOrgAddr}
                            editOrgDesc={editOrgDesc}
                            setEditOrgDesc={setEditOrgDesc}
                            handleSaveProfile={handleSaveProfile}
                            startEditingProfile={startEditingProfile}
                            cancelEditingProfile={cancelEditingProfile}
                            handleAvatarUpload={handleAvatarUpload}
                            handleGenerateInvite={handleGenerateInvite}
                            isMembersListExpanded={isMembersListExpanded}
                            setIsMembersListExpanded={setIsMembersListExpanded}
                            orgMembers={orgMembers}
                            handleRemoveMember={handleRemoveMember}
                            handleUpdateMemberRole={handleUpdateMemberRole}
                            toggleRole={toggleRole}
                            handleLeaveOrganization={handleLeaveOrganization}
                            handleSignOut={handleSignOut}
                            API_URL={API_URL}
                          />
                        } />
                        <Route path="*" element={<Navigate to="manage" replace />} />
                      </Routes>
                      
                      <Navigation
                        role="B2B"
                        activeTab={activeB2BTab}
                        setActiveTab={(tab) => navigate(`/coordinator/${tab}`)}
                      />
                    </>
                  )}
                </div>
              </div>
            ) : (
              <Navigate to="/volunteer/search" replace />
            )
          } />

          {/* Root Redirects */}
          <Route path="/" element={
            currentRole === 'B2C' ? (
              <Navigate to="/volunteer/search" replace />
            ) : (
              <Navigate to="/coordinator/manage" replace />
            )
          } />
          
          <Route path="*" element={
            currentRole === 'B2C' ? (
              <Navigate to="/volunteer/search" replace />
            ) : (
              <Navigate to="/coordinator/manage" replace />
            )
          } />
        </Routes>

      </div>

      {/* --- TIME PICKER MODAL --- */}
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

      {/* --- VOLUNTEER PROFILE / REVIEWS MODAL --- */}
      <ReviewsModal
        isOpen={isReviewsModalOpen}
        onClose={() => {
          setIsReviewsModalOpen(false);
          setSelectedVolunteerProfile(null);
        }}
        selectedVolunteerProfile={selectedVolunteerProfile}
        reviewsModalUserName={reviewsModalUserName}
        volunteerReviews={volunteerReviews}
        apiUrl={API_URL}
      />

      {/* --- REGISTER ORGANIZATION MODAL --- */}
      <OrgRegisterModal
        isOpen={isOrgRegisterModalOpen}
        onClose={() => setIsOrgRegisterModalOpen(false)}
        regOrgName={regOrgName}
        setRegOrgName={setRegOrgName}
        regOrgAddr={regOrgAddr}
        setRegOrgAddr={setRegOrgAddr}
        regOrgDesc={regOrgDesc}
        setRegOrgDesc={setRegOrgDesc}
        onSubmit={handleOrgRegisterSubmit}
      />

    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
