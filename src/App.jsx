import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
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
  Settings,
  Sun,
  Moon,
  Mail,
  Bell
} from 'lucide-react'
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from './store/useStore'

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:8000/api" : "/api");

import Toast from './components/Toast';
import TimePickerModal from './components/TimePickerModal';
import ReviewsModal from './components/ReviewsModal';
import OrgRegisterModal from './components/OrgRegisterModal';
import ShiftDetailsModal, { ShiftActionButton } from './components/ShiftDetailsModal';

import AuthForm from './components/auth/AuthForm';
import ResetPasswordForm from './components/auth/ResetPasswordForm';
import OtpVerifyForm from './components/auth/OtpVerifyForm';
import VolunteerDashboard from './components/volunteer/VolunteerDashboard';
import BookedShiftsList from './components/volunteer/BookedShiftsList';
import VolunteerProfile from './components/volunteer/VolunteerProfile';
import VolunteerSidebar from './components/volunteer/VolunteerSidebar';
import CoordinatorShifts from './components/coordinator/CoordinatorShifts';
import ShiftCreateForm from './components/coordinator/ShiftCreateForm';
import CoordinatorProfile from './components/coordinator/CoordinatorProfile';
import ShiftTemplatesList from './components/coordinator/ShiftTemplatesList';
import EditTemplateModal from './components/coordinator/EditTemplateModal';
import Navigation from './components/shared/Navigation';
import Sidebar from './components/coordinator/Sidebar';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  const {
    user, setUser, organization, setOrganization, currentRole, setCurrentRole,
    setActiveB2CTab, setActiveB2BTab,
    shifts, bookedShifts, b2bApplications, b2bShifts, orgMembers,
    shiftTemplates, createTemplate, deleteTemplate, updateTemplate, cancelApplication,
    toast, showToastMsg, logout, loadData, fetchVolunteerReviews, apiCall,
    isOrgRegisterModalOpen, setIsOrgRegisterModalOpen,
    selectedVolunteerProfile, setSelectedVolunteerProfile,
    volunteerReviews, setVolunteerReviews,
    reviewsModalUserName, setReviewsModalUserName,
    isReviewsModalOpen, setIsReviewsModalOpen,
    showSettingsPanel, setShowSettingsPanel,
    activeB2BFilter, setActiveB2BFilter,
    activeB2CShiftsFilter, setActiveB2CShiftsFilter,
    setEmailNotificationsEnabled
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

  // Email Notification Preference & Modal States ("Плашка сповіщень на пошту")
  const [emailNotifPref, setEmailNotifPref] = useState(true);
  const [showEmailNotifModal, setShowEmailNotifModal] = useState(false);
  const [isEmailNotifModalClosing, setIsEmailNotifModalClosing] = useState(false);
  const [pendingAuthTargetRole, setPendingAuthTargetRole] = useState(null);

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
  const [formMaxVolunteers, setFormMaxVolunteers] = useState(1);
  const [formTargetFaculty, setFormTargetFacultyState] = useState(() => {
    return localStorage.getItem('oneclick_last_target_faculty') || 'ALL';
  });

  const setFormTargetFaculty = (fac) => {
    setFormTargetFacultyState(fac);
    localStorage.setItem('oneclick_last_target_faculty', fac);
  };

  // Edit Template Modal States
  const [isEditTemplateModalOpen, setIsEditTemplateModalOpen] = useState(false);
  const [selectedTemplateToEdit, setSelectedTemplateToEdit] = useState(null);

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
  const [editFaculty, setEditFaculty] = useState('ФКІТ');
  const [regFaculty, setRegFaculty] = useState('ФКІТ');
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

  // 30-day rolling calendar YYYY-MM-DD
  const calendarDays = useMemo(() => {
    const days = [];
    const weekdaysShort = ['НД', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];

    for (let i = 0; i < 30; i++) {
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

  // Derive active tab directly from URL path (single source of truth, 0ms latency)
  const activeB2CTab = useMemo(() => {
    if (location.pathname.startsWith('/volunteer/')) {
      const tab = location.pathname.split('/').pop();
      if (['search', 'myshifts', 'profile'].includes(tab)) return tab;
    }
    return 'search';
  }, [location.pathname]);

  const activeB2BTab = useMemo(() => {
    if (location.pathname.startsWith('/coordinator/')) {
      const tab = location.pathname.split('/').pop();
      if (['manage', 'create', 'templates', 'profile'].includes(tab)) return tab;
    }
    return 'manage';
  }, [location.pathname]);

  // Sync role if accessing directly via URL
  useEffect(() => {
    if (location.pathname.startsWith('/volunteer/') && currentRole !== 'B2C') {
      setCurrentRole('B2C');
    } else if (location.pathname.startsWith('/coordinator/') && currentRole !== 'B2B') {
      setCurrentRole('B2B');
    }
  }, [location.pathname, currentRole, setCurrentRole]);

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
    setEditFaculty(user.faculty || 'ФКІТ');
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
      try {
        await apiCall('/users/send-email-otp', 'POST', {
          email: newEmail
        });
        setEmailOtpMode(true);
        setEditEmailOtpCode('');
        showToastMsg(`Код підтвердження надіслано на пошту ${newEmail}!`, "success");
      } catch (err) {
        console.error(err);
        showToastMsg(err.message || "Помилка при надсиланні коду", "error");
      }
      return;
    }


    try {
      const updatedUser = await apiCall('/users/profile', 'PUT', {
        name: editName,
        phone: editPhone ? `+380${editPhone}` : null,
        email: editEmail || null,
        faculty: editFaculty,
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

    if (!regEmail || !regEmail.includes('@')) {
      showToastMsg("Будь ласка, введіть коректну електронну пошту", "error");
      return;
    }

    try {
      await apiCall('/auth/send-verification-email', 'POST', {
        email: regEmail
      });

      setOtpMode(true);
      setEnteredOtp('');
      showToastMsg(`Код підтвердження надіслано на пошту ${regEmail}`, 'success');
    } catch (err) {
      if (err && err.message) {
        showToastMsg(err.message, 'error');
      } else {
        showToastMsg("Помилка підключення до сервера", 'error');
      }
    }
  };

  const handleConfirmEmailNotif = (enabled) => {
    if (isEmailNotifModalClosing) return;
    setEmailNotificationsEnabled(enabled);
    setIsEmailNotifModalClosing(true);

    setTimeout(() => {
      setShowEmailNotifModal(false);
      setIsEmailNotifModalClosing(false);
      const targetRole = pendingAuthTargetRole || currentRole || 'B2C';
      if (targetRole === 'B2C') {
        navigate('/volunteer/search');
      } else {
        navigate('/coordinator/manage');
      }
    }, 210);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        name: regName,
        email: regEmail,
        phone: regPhone ? `+380${regPhone}` : null,
        faculty: regRole === 'B2C' ? (regFaculty || 'ФКІТ') : null,
        otp_code: enteredOtp,
        role: regRole
      };

      const userData = await apiCall('/auth/login-or-register', 'POST', payload);

      const initialRole = regRole;
      localStorage.setItem('oneclick_user_id', String(userData.id));
      localStorage.setItem('oneclick_user_role', initialRole);
      if (userData.token) {
        localStorage.setItem('oneclick_user_token', userData.token);
      }

      setUser(userData);
      setCurrentRole(initialRole);

      const org = await apiCall('/auth/my-org').catch(() => null);
      if (org) {
        setOrganization(org);
      } else {
        setOrganization(null);
      }

      setEmailNotificationsEnabled(emailNotifPref);
      showToastMsg(`Вітаємо, ${userData.name || 'користувачу'}! Вхід успішний.`, 'success');
      setOtpMode(false);

      if (userData.is_new_user) {
        setPendingAuthTargetRole(initialRole);
        setShowEmailNotifModal(true);
      } else {
        if (initialRole === 'B2C') {
          navigate('/volunteer/search');
        } else {
          navigate('/coordinator/manage');
        }
      }
    } catch (err) {
      if (err && err.message) {
        showToastMsg(err.message, 'error');
      } else {
        showToastMsg("Помилка підтвердження коду", 'error');
      }
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

      await apiCall('/auth/send-verification-email', 'POST', {
        email: resetEmail
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

    try {
      await apiCall('/auth/reset-password', 'POST', {
        email: resetEmail,
        new_password: newPassword,
        otp_code: resetEnteredOtp
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
                faculty: regRole === 'B2C' ? regFaculty : null,
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

  const handleCancelShift = async (appId) => {
    await cancelApplication(appId);
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

  const handleLoadFromTemplate = (template) => {
    setFormTitle(template.title || '');
    setFormSphere(template.category || '');
    if (template.time) {
      const parts = template.time.split(' - ');
      if (parts.length === 2) {
        setStartTime(parts[0]);
        setEndTime(parts[1]);
      } else {
        setStartTime('09:00');
        setEndTime('18:00');
      }
    }
    setFormLocation(template.location || '');
    setFormAddress(template.address || '');
    setFormDescription(template.description || '');
    setFormMaxVolunteers(template.max_volunteers || 1);
    showToastMsg(`Дані завантажено з шаблону: "${template.name}"`, "success");
  };

  const handleCreateTemplate = async (templateName) => {
    try {
      await createTemplate({
        name: templateName,
        title: formTitle,
        category: formSphere,
        time: `${startTime} - ${endTime}`,
        location: formLocation,
        address: formAddress,
        description: formDescription
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUseTemplateFromList = (template) => {
    handleLoadFromTemplate(template);
    navigate('/coordinator/create');
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
        max_volunteers: formMaxVolunteers,
        target_faculty: formTargetFaculty || 'ALL'
      });
      showToastMsg("Захід успішно створено та опубліковано!", "success");
      setFormTitle('');
      setFormMaxVolunteers(1);
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
      <div className="w-full min-h-screen bg-[#f5f5f7] dark:bg-[#18181b] flex items-center justify-center">
        <div className="w-full max-w-[450px] min-h-screen md:min-h-[680px] bg-[#f5f5f7] dark:bg-[#18181b] md:rounded-[40px] md:shadow-2xl overflow-hidden relative flex flex-col justify-between p-6 text-[#111111] dark:text-gray-250">
          <div className="flex-1 flex flex-col items-center justify-center my-auto">
            <h1 className="text-3xl font-black tracking-tight mb-2">
              <span className="text-[#FF5522]">One</span><span className="text-gray-950 dark:text-gray-200">Click</span>
            </h1>
            <h2 className="text-sm font-bold text-gray-900 dark:text-zinc-200 mb-1">Останній крок</h2>
            <p className="text-xs text-gray-400 dark:text-zinc-550 font-bold uppercase tracking-wider mb-8">Завершіть реєстрацію</p>

            <form onSubmit={handleGooglePhoneSubmit} className="w-full max-w-[320px] space-y-4">
              <div className="text-left">
                <label className="block text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 px-1">
                  Номер телефону
                </label>
                <div className="flex gap-2 items-center">
                  <span className="bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 font-extrabold rounded-2xl px-3 py-3.5 text-xs shrink-0">
                    +380
                  </span>
                  <input
                    type="text"
                    placeholder="931234567"
                    value={googlePhone}
                    onChange={(e) => setGooglePhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    required
                    className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl px-4 py-3.5 text-xs font-semibold text-gray-800 dark:text-zinc-200 focus:outline-none focus:border-[#FF5522] shadow-sm transition-all"
                  />
                </div>
                <span className="text-[9px] text-gray-400 dark:text-zinc-500 mt-1 block px-1">
                  Введіть 9 цифр (наприклад, 931234567)
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-4 mt-2 bg-[#FF5522] hover:bg-[#FF5522]/90 dark:bg-orange-500 dark:hover:bg-orange-600 text-white dark:text-white font-extrabold rounded-full shadow-md text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
              >
                Зберегти та продовжити
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full py-3.5 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 dark:hover:text-white border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 font-extrabold rounded-full shadow-sm text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                Скасувати
              </button>
            </form>
          </div>

          <div className="text-center text-[10px] text-gray-400 dark:text-zinc-550 mt-6 font-bold uppercase tracking-wider">
            © 2026 OneClick
          </div>
        </div>
      </div>
    );
  }

  // Auth Flow Route
  if (!user) {
    return (
      <div className="w-full min-h-screen bg-[#f5f5f7] dark:bg-[#18181b] relative">
        <Toast toast={toast} />
        <Routes>
          <Route path="/login" element={
            <div className="w-full min-h-screen bg-[#f5f5f7] dark:bg-[#18181b] flex items-center justify-center">
              <div className="w-full max-w-[450px] min-h-screen md:min-h-[680px] bg-[#f5f5f7] dark:bg-[#18181b] md:rounded-[40px] md:shadow-2xl overflow-hidden relative flex flex-col justify-between p-6 text-[#111111] dark:text-gray-200">
                <div className="absolute top-6 right-6">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="p-2.5 bg-gray-50 border border-transparent hover:bg-gray-100 dark:bg-[#27272A] dark:border-transparent dark:hover:bg-zinc-700 text-gray-500 hover:text-gray-900 dark:text-zinc-300 dark:hover:text-zinc-100 rounded-full shadow-sm transition-all active:scale-90 cursor-pointer flex items-center justify-center"
                    title={isDark ? "Світла тема" : "Темна тема"}
                  >
                    {isDark ? <Sun size={14} className="text-[#FF5522]" /> : <Moon size={14} className="text-[#FF5522]" />}
                  </button>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center my-auto">
                  <h1 className="text-4xl font-black tracking-tight mb-2">
                    <span className="text-[#FF5522]">One</span><span className="text-gray-950 dark:text-gray-200">Click</span>
                  </h1>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider mb-8">Платформа волонтерства</p>

                  {inviteOrgName && (
                    <div className="w-full max-w-[320px] mb-6 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/30 rounded-3xl p-4 text-left animate-fadeIn shadow-sm flex items-start gap-2.5">
                      <Info size={16} className="text-[#FF5522] shrink-0 mt-0.5" />
                      <div className="text-[10px] text-gray-700 dark:text-gray-300 font-semibold leading-relaxed">
                        <span className="font-extrabold text-[#FF5522]">Запрошення!</span> Вас запросили приєднатися до команди організації <span className="font-black text-gray-900 dark:text-gray-100 select-all">"{inviteOrgName}"</span>. Увійдіть або зареєструйтеся, щоб автоматично прийняти запрошення та отримати доступ до кабінету.
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
                      emailNotifPref={emailNotifPref}
                      setEmailNotifPref={setEmailNotifPref}
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
                      regFaculty={regFaculty}
                      setRegFaculty={setRegFaculty}
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
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-[#f5f5f7] dark:bg-[#18181B] relative overflow-hidden">

      {/* Toast Notification */}
      <Toast toast={toast} />

      {/* Main frame */}
      <div className="w-full h-full bg-[#f5f5f7] dark:bg-[#18181B] relative text-[#111111] dark:text-gray-200 flex pb-0 overflow-hidden">

        <Routes>
          {/* Volunteer Routes */}
          <Route path="/volunteer/*" element={
            <div className="w-full flex flex-col md:flex-row md:w-full min-h-screen md:min-h-0 md:h-full">
              <VolunteerSidebar
                activeTab={activeB2CTab}
                setActiveTab={(tab) => {
                  setCurrentDetailsShift(null);
                  navigate(`/volunteer/${tab}`);
                }}
                user={user}
                organization={organization}
                toggleRole={toggleRole}
                handleSignOut={handleSignOut}
                isDark={isDark}
                toggleTheme={toggleTheme}
                API_URL={API_URL}
              />

              <div className="w-full max-w-[450px] md:max-w-none mx-auto md:mx-0 px-4 pt-6 flex-1 overflow-y-auto md:p-8 md:pb-24 pb-[110px]">
                {currentDetailsShift ? (
                  <ShiftDetailsModal
                    shift={currentDetailsShift}
                    onClose={() => setCurrentDetailsShift(null)}
                    currentRole={currentRole}
                    bookedShifts={bookedShifts}
                    handleApplyShift={handleApplyShift}
                    handleCancelShift={handleCancelShift}
                  />
                ) : (
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
                        isDark={isDark}
                        toggleTheme={toggleTheme}
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
                        handleCancelShift={handleCancelShift}
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
                        editFaculty={editFaculty}
                        setEditFaculty={setEditFaculty}
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
                        isDark={isDark}
                        toggleTheme={toggleTheme}
                      />
                    } />
                    <Route path="*" element={<Navigate to="search" replace />} />
                  </Routes>
                )}

                {currentDetailsShift ? (
                  <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-[418px] bg-white dark:bg-zinc-800 shadow-xl dark:shadow-black/40 rounded-3xl p-2 z-[999] border border-gray-100 dark:border-zinc-700/60">
                    <ShiftActionButton
                      shift={currentDetailsShift}
                      currentRole={currentRole}
                      bookedShifts={bookedShifts}
                      handleApplyShift={handleApplyShift}
                      handleCancelShift={handleCancelShift}
                    />
                  </div>
                ) : (
                  <Navigation
                    role="B2C"
                    activeTab={activeB2CTab}
                    setActiveTab={(tab) => {
                      setCurrentDetailsShift(null);
                      navigate(`/volunteer/${tab}`);
                    }}
                  />
                )}
              </div>
            </div>
          } />

          {/* Coordinator Routes */}
          <Route path="/coordinator/*" element={
            <div className="w-full flex flex-col md:flex-row md:w-full min-h-screen md:min-h-0 md:h-full">
              {organization && (
                <Sidebar
                  activeTab={activeB2BTab}
                  setActiveTab={(tab) => navigate(`/coordinator/${tab}`)}
                  organization={organization}
                  toggleRole={toggleRole}
                  handleSignOut={handleSignOut}
                  user={user}
                  isDark={isDark}
                  toggleTheme={toggleTheme}
                />
              )}

              <div className="w-full px-4 pt-6 flex-1 overflow-y-auto md:p-8 md:pb-24 pb-[110px]">
                {!organization ? (
                  <div className="animate-fadeIn min-h-[75vh] flex flex-col items-center justify-center py-6 px-2 sm:px-4">
                    <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-10 shadow-xl shadow-gray-200/50 dark:shadow-black/40 text-center relative overflow-hidden">
                      
                      {/* Icon Badge */}
                      <div className="w-14 h-14 mx-auto mb-4 bg-orange-500/10 dark:bg-orange-500/20 text-[#FF5522] dark:text-orange-400 rounded-2xl flex items-center justify-center border border-orange-500/20 shadow-inner">
                        <Building2 size={28} />
                      </div>

                      <h1 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900 dark:text-zinc-100 mb-1">
                        Реєстрація факультету / підрозділу
                      </h1>
                      <p className="text-xs text-gray-400 dark:text-zinc-400 font-medium mb-6 max-w-xs mx-auto">
                        Вкажіть дані вашого факультету або підрозділу для продовження
                      </p>

                      <form onSubmit={handleOrgRegisterSubmit} className="space-y-4 text-left">
                        {user && !user.phone && (
                          <div>
                            <label className="block text-[10px] font-extrabold text-[#FF5522] dark:text-orange-400 uppercase tracking-wider mb-1.5 px-1">
                              Номер мобільного телефону
                            </label>
                            <div className="flex gap-2 items-center">
                              <span className="bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-500 dark:text-zinc-400 font-extrabold rounded-2xl px-3.5 py-3.5 text-xs shrink-0">
                                +380
                              </span>
                              <input
                                type="text"
                                placeholder="931234567"
                                value={googlePhone}
                                onChange={(e) => setGooglePhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                                required
                                className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700/80 rounded-2xl px-4 py-3.5 text-xs font-semibold text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#FF5522] focus:ring-2 focus:ring-[#FF5522]/20 transition-all"
                              />
                            </div>
                            <span className="text-[9px] text-gray-400 dark:text-zinc-500 mt-1 block px-1">
                              Потрібен для зв'язку волонтерів з представником факультету
                            </span>
                          </div>
                        )}

                        <div>
                          <label className="block text-[10px] font-extrabold text-gray-400 dark:text-zinc-400 uppercase tracking-wider mb-1.5 px-1">
                            Назва факультету / підрозділу
                          </label>
                          <input
                            type="text"
                            required
                            value={regOrgName}
                            onChange={(e) => setRegOrgName(e.target.value)}
                            placeholder="напр. Факультет кібербезпеки та інформаційних технологій"
                            className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700/80 rounded-2xl px-4 py-3.5 text-xs font-semibold text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#FF5522] focus:ring-2 focus:ring-[#FF5522]/20 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-extrabold text-gray-400 dark:text-zinc-400 uppercase tracking-wider mb-1.5 px-1">
                            Локація / Кабінет
                          </label>
                          <input
                            type="text"
                            required
                            value={regOrgAddr}
                            onChange={(e) => setRegOrgAddr(e.target.value)}
                            placeholder="напр. вул. Канатна, 112 (Деканат)"
                            className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700/80 rounded-2xl px-4 py-3.5 text-xs font-semibold text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#FF5522] focus:ring-2 focus:ring-[#FF5522]/20 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-extrabold text-gray-400 dark:text-zinc-400 uppercase tracking-wider mb-1.5 px-1">
                            Опис діяльності
                          </label>
                          <textarea
                            rows={3}
                            value={regOrgDesc}
                            onChange={(e) => setRegOrgDesc(e.target.value)}
                            placeholder="Короткий опис напрямку роботи волонтерського осередку..."
                            className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700/80 rounded-2xl px-4 py-3.5 text-xs font-semibold text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-[#FF5522] focus:ring-2 focus:ring-[#FF5522]/20 transition-all resize-none"
                          />
                        </div>

                        <div className="pt-2 space-y-3">
                          <button
                            type="submit"
                            className="w-full py-4 bg-[#FF5522] hover:bg-[#e04411] text-white font-extrabold rounded-2xl shadow-lg shadow-orange-500/25 text-xs tracking-wider uppercase transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Building2 size={16} />
                            Зареєструвати факультет
                          </button>

                          <button
                            type="button"
                            onClick={handleSignOut}
                            className="w-full py-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300 font-bold rounded-2xl text-xs tracking-wider uppercase transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                          >
                            <LogOut size={15} />
                            Вийти з акаунту
                          </button>
                        </div>
                      </form>
                    </div>
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
                          isDark={isDark}
                          toggleTheme={toggleTheme}
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
                          formTargetFaculty={formTargetFaculty}
                          setFormTargetFaculty={setFormTargetFaculty}
                          handleCreateShift={handleCreateShift}
                          setTempStartHour={setTempStartHour}
                          setTempStartMin={setTempStartMin}
                          setTempEndHour={setTempEndHour}
                          setTempEndMin={setTempEndMin}
                          setIsTimePickerOpen={setIsTimePickerOpen}
                          shiftTemplates={shiftTemplates}
                          onLoadFromTemplate={handleLoadFromTemplate}
                          onCreateTemplate={handleCreateTemplate}
                          formMaxVolunteers={formMaxVolunteers}
                          setFormMaxVolunteers={setFormMaxVolunteers}
                        />
                      } />

                      <Route path="templates" element={
                        <ShiftTemplatesList
                          shiftTemplates={shiftTemplates}
                          deleteTemplate={deleteTemplate}
                          onEditTemplate={(template) => {
                            setSelectedTemplateToEdit(template);
                            setIsEditTemplateModalOpen(true);
                          }}
                          onSelectTemplate={handleUseTemplateFromList}
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
                          isDark={isDark}
                          toggleTheme={toggleTheme}
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

      {/* --- EDIT TEMPLATE MODAL --- */}
      <EditTemplateModal
        isOpen={isEditTemplateModalOpen}
        onClose={() => {
          setIsEditTemplateModalOpen(false);
          setSelectedTemplateToEdit(null);
        }}
        template={selectedTemplateToEdit}
        onSave={async (id, data) => {
          try {
            await updateTemplate(id, data);
            setIsEditTemplateModalOpen(false);
            setSelectedTemplateToEdit(null);
          } catch (err) {
            console.error(err);
          }
        }}
      />

      {/* --- EMAIL NOTIFICATIONS PREFERENCE MODAL ("Плашка сповіщень на пошту") --- */}
      {showEmailNotifModal && createPortal(
        <div
          className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md ${isEmailNotifModalClosing ? 'animate-modal-backdrop-out' : 'animate-modal-backdrop-in'}`}
          onClick={() => handleConfirmEmailNotif(emailNotifPref)}
        >
          <div
            className={`bg-white dark:bg-[#18181B] text-gray-900 dark:text-zinc-100 rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-gray-200 dark:border-zinc-800 text-left relative ${isEmailNotifModalClosing ? 'animate-modal-card-out' : 'animate-modal-card-in'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/50 text-[#FF5522] dark:text-orange-400 flex items-center justify-center mb-4 shadow-sm">
              <Mail size={24} />
            </div>

            <h3 className="font-black text-lg text-gray-900 dark:text-zinc-100 mb-1">
              Сповіщення на пошту
            </h3>
            <p className="text-xs font-bold text-[#FF5522] dark:text-orange-400 uppercase tracking-wider mb-3">
              Листи про оновлення ваших заявок
            </p>

            <p className="text-xs text-gray-600 dark:text-zinc-300 font-semibold mb-6 leading-relaxed">
              Бажаєте отримувати повідомлення про оновлення та зміну статусу вашої заявки (прийнято / відхилено) на пошту <span className="font-black text-gray-900 dark:text-zinc-100">{regEmail}</span>?
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => handleConfirmEmailNotif(true)}
                className="w-full py-3.5 bg-[#FF5522] hover:bg-[#FF5522]/90 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-extrabold text-xs rounded-2xl shadow-md uppercase tracking-wider transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Bell size={16} />
                Так, отримувати листи
              </button>

              <button
                type="button"
                onClick={() => handleConfirmEmailNotif(false)}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300 font-bold text-xs rounded-2xl transition-all cursor-pointer text-center"
              >
                Не зараз
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

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
