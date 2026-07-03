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

const API_URL = "http://localhost:8000/api";

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

export default function App() {
  // --- Centralized Core State Object ---
  const [user, setUser] = useState(null); // Current logged in user object
  const [organization, setOrganization] = useState(null); // User's organization if B2B
  const [currentRole, setCurrentRole] = useState('B2C'); // 'B2C' (volunteer) or 'B2B' (organizer)

  // Navigation Tabs
  const [activeB2CTab, setActiveB2CTab] = useState('search'); // 'search' | 'myshifts' | 'profile'
  const [activeB2BTab, setActiveB2BTab] = useState('manage'); // 'manage' | 'create' | 'profile'
  const [activeB2BFilter, setActiveB2BFilter] = useState("АКТИВНІ"); // B2B managed filter: 'АКТИВНІ' | 'ЗАКРИТІ'
  const [activeB2CShiftsFilter, setActiveB2CShiftsFilter] = useState("АКТИВНІ"); // 'АКТИВНІ' | 'ЗАВЕРШЕНІ'

  // Map Picker Refs
  const pickerMapRef = useRef(null);
  const pickerMarkerRef = useRef(null);

  // Form Inputs
  const [regName, setRegName] = useState('Дмитро');
  const [regPhone, setRegPhone] = useState('0931234567');
  const [regEmail, setRegEmail] = useState('coordinator@example.com');
  const [regPassword, setRegPassword] = useState('123456');
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
  const [regOrgName, setRegOrgName] = useState('Foundation Coffee');
  const [regOrgDesc, setRegOrgDesc] = useState('Кав\'ярня третьої хвилі, хаб студентських ініціатив');
  const [regOrgAddr, setRegOrgAddr] = useState('вул. Канатна, 15');

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

  // Data States
  const [shifts, setShifts] = useState([]); // Available B2C shifts
  const [bookedShifts, setBookedShifts] = useState([]); // Applied B2C shifts (applications)
  const [b2bApplications, setB2bApplications] = useState([]); // B2B applications for approval/check-in
  const [b2bShifts, setB2bShifts] = useState([]); // Organizer created shifts
  const [orgMembers, setOrgMembers] = useState([]); // Members of organization
  const [activeB2BSubView, setActiveB2BSubView] = useState('applications'); // 'applications' | 'shifts'

  // Attendance Code input state per application
  const [attendanceCodes, setAttendanceCodes] = useState({}); // { appId: 'code' }
  const [showQrCodes, setShowQrCodes] = useState({}); // { appId: boolean }

  // Rating & Review form state per application
  const [ratings, setRatings] = useState({}); // { appId: 5 }
  const [reviews, setReviews] = useState({}); // { appId: 'comment' }

  // Modal / Detail States
  const [toast, setToast] = useState(null);
  const [currentDetailsShift, setCurrentDetailsShift] = useState(null);
  const [volunteerReviews, setVolunteerReviews] = useState([]); // Reviews of selected volunteer
  const [selectedVolunteerProfile, setSelectedVolunteerProfile] = useState(null);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [reviewsModalUserName, setReviewsModalUserName] = useState('');
  const [isOrgRegisterModalOpen, setIsOrgRegisterModalOpen] = useState(false);
  const [inviteOrgName, setInviteOrgName] = useState(null);
  const [isMembersListExpanded, setIsMembersListExpanded] = useState(true);
  const [showCreateMapPicker, setShowCreateMapPicker] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

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

  // Search and Profile Editing States
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editOrgName, setEditOrgName] = useState('');
  const [editOrgDesc, setEditOrgDesc] = useState('');
  const [editOrgAddr, setEditOrgAddr] = useState('');

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
      if (user.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      } else {
        headers['x-user-id'] = String(user.id);
      }
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
      const [profileData, reviewsData] = await Promise.all([
        apiCall(`/users/${volunteerId}`),
        apiCall(`/users/${volunteerId}/reviews`)
      ]);
      setSelectedVolunteerProfile(profileData);
      setVolunteerReviews(reviewsData);
      setReviewsModalUserName(volunteerName);
      setIsReviewsModalOpen(true);
    } catch (err) {
      console.error("Помилка при завантаженні профілю/відгуків:", err);
    }
  };

  // Load data depending on current tab/role
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      if (currentRole === 'B2C') {
        // Fetch available shifts
        const fetchedShifts = await apiCall(`/shifts?date=${selectedDateStr}&category=${encodeURIComponent(selectedFilter)}&search=${encodeURIComponent(searchQuery)}`);
        setShifts(fetchedShifts);
        // Fetch booked shifts
        const booked = await apiCall('/applications/my');
        setBookedShifts(booked);
      } else {
        // B2B role: Fetch applications, created shifts, and members
        const [apps, b2bShiftsData, membersData] = await Promise.all([
          apiCall('/applications/b2b'),
          apiCall('/shifts/b2b'),
          apiCall('/organizations/members').catch(() => [])
        ]);
        setB2bApplications(apps);
        setB2bShifts(b2bShiftsData);
        setOrgMembers(membersData);
      }
    } catch (err) {
      console.error("Помилка завантаження даних:", err);
    }
  }, [user, currentRole, selectedDateStr, selectedFilter, searchQuery, apiCall]);

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
          setCurrentRole(storedUserRole || userData.role);

          // Fetch organization info if any
          const org = await fetch(`${API_URL}/auth/my-org`, {
            headers: reqHeaders
          }).then(r => r.json()).catch(() => null);

          if (org) {
            setOrganization(org);
          }
        } catch (err) {
          console.warn("Помилка відновлення сесії:", err);
          localStorage.removeItem('oneclick_user_id');
          localStorage.removeItem('oneclick_user_role');
          localStorage.removeItem('oneclick_user_token');
        }
      }
    };
    restoreSession();
  }, []);

  // Handle invitation links
  const handleInviteToken = useCallback(async (token, currentUser) => {
    if (!currentUser) {
      sessionStorage.setItem('pending_invite_token', token);
      return;
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
      const tokenLocal = localStorage.getItem('oneclick_user_token');
      if (tokenLocal) {
        headers['Authorization'] = `Bearer ${tokenLocal}`;
      } else {
        headers['x-user-id'] = String(currentUser.id);
      }
      
      if (currentUser.company_id) {
        if (currentUser.company_role === 'owner') {
          const confirmDeleteAndJoin = window.confirm(`Ви є власником іншої організації. Приєднання до нової автоматично видалить вашу поточну організацію та всі її дані. Ви впевнені, що хочете видалити її та приєднатися до "${orgName}"?`);
          if (!confirmDeleteAndJoin) {
            window.history.replaceState({}, document.title, window.location.pathname);
            sessionStorage.removeItem('pending_invite_token');
            return;
          }
          // Delete old organization first
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
          // Leave old organization first
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
        
        const orgRes = await fetch(`${API_URL}/auth/my-org`, { headers }).then(r => r.json()).catch(() => null);
        if (orgRes) {
          setOrganization(orgRes);
        }
        
        showToastMsg(`Ви успішно приєдналися до "${orgName}"!`, "success");
      }
      
      window.history.replaceState({}, document.title, window.location.pathname);
      sessionStorage.removeItem('pending_invite_token');
      loadData();
    } catch (err) {
      console.error(err);
      showToastMsg(err.message || "Помилка обробки запрошення", "error");
      window.history.replaceState({}, document.title, window.location.pathname);
      sessionStorage.removeItem('pending_invite_token');
    }
  }, [loadData]);

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
          });
      }
    } else {
      setInviteOrgName(null);
    }
  }, [user, handleInviteToken]);

  // Fetch data on parameters change
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Leaflet Map Picker Initialization (Odessa-bound)
  useEffect(() => {
    if (activeB2BTab === 'create' && window.L) {
      const timer = setTimeout(() => {
        const mapContainer = document.getElementById('address-picker-map');
        if (!mapContainer) return;

        // Odessa coordinates: 46.4825, 30.7233
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
    if (organization) {
      setEditOrgName(organization.name || '');
      setEditOrgDesc(organization.description || '');
      setEditOrgAddr(organization.address || '');
    }
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToastMsg("Ім'я не може бути порожнім", "error");
      return;
    }
    try {
      const updatedUser = await apiCall('/users/profile', 'PUT', {
        name: editName,
        phone: editPhone ? `+380${editPhone}` : null,
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
      showToastMsg("Профіль успішно оновлено!", "success");
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateInvite = async () => {
    try {
      const data = await apiCall('/organizations/invitations', 'POST', {
        role: 'member'
      });
      const inviteUrl = `${window.location.origin}/?invite=${data.token}`;
      await navigator.clipboard.writeText(inviteUrl);
      showToastMsg("Посилання для запрошення згенеровано та скопійовано в буфер обміну!", "success");
    } catch (err) {
      console.error(err);
      showToastMsg("Помилка генерації запрошення", "error");
    }
  };

  const handleUpdateMemberRole = async (memberId, newRole) => {
    try {
      await apiCall(`/organizations/members/${memberId}/role`, 'PUT', {
        role: newRole
      });
      showToastMsg("Роль успішно оновлено!", "success");
      loadData();
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
      loadData();
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
      showToastMsg("Ви успішно вийшли з організації", "success");
      loadData();
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
      showToastMsg("Організацію успішно видалено", "success");
      loadData();
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
    if (user) {
      if (user.token) {
        headers['Authorization'] = `Bearer ${user.token}`;
      } else {
        headers['x-user-id'] = String(user.id);
      }
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
      loadData();
    } catch (err) {
      console.error(err);
      showToastMsg(err.message || "Не вдалося завантажити фото", "error");
    }
  };


  // Handle registration/login initiation (Send OTP simulation or Direct password login)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (regRole === 'B2B') {
      try {
        // 1. Check if email exists
        const checkRes = await fetch(`${API_URL}/auth/check-email?email=${encodeURIComponent(regEmail)}`).then(r => r.json());

        if (checkRes.exists) {
          // If user exists, log them in directly
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
          }).then(r => r.json()).catch(() => null);

          if (org) {
            setOrganization(org);
            setCurrentRole('B2B');
            localStorage.setItem('oneclick_user_role', 'B2B');
          }
          showToastMsg(`Вітаємо, ${userData.name}! Вхід успішний.`, 'success');
        } else {
          // If user does not exist (registration), check if name is provided
          if (!regName || !regName.trim()) {
            showToastMsg("Будь ласка, введіть ваше ім'я для реєстрації", "error");
            return;
          }
          const generatedCode = String(Math.floor(1000 + Math.random() * 9000));

          // Send real verification email via backend SMTP
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
      if (regPhone.length !== 10) {
        showToastMsg("Введіть коректний 10-значний номер телефону", "error");
        return;
      }

      // Check if user with this phone exists
      try {
        const checkRes = await fetch(`${API_URL}/auth/check-phone?phone=${encodeURIComponent('+380' + regPhone)}`).then(r => r.json());
        if (!checkRes.exists && (!regName || !regName.trim())) {
          showToastMsg("Будь ласка, введіть ваше ім'я для реєстрації", "error");
          return;
        }
      } catch (err) {
        console.error(err);
      }

      // Simulate sending OTP code
      const generatedCode = String(Math.floor(1000 + Math.random() * 9000));
      setOtpCode(generatedCode);
      setOtpMode(true);
      setEnteredOtp('');

      // Wait a brief moment then show simulation alert
      setTimeout(() => {
        alert(`[СИМУЛЯЦІЯ SMS] Код підтвердження для входу: ${generatedCode}`);
      }, 300);
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
        role: 'B2B'
      } : {
        name: regName,
        phone: `+380${regPhone}`,
        role: regRole
      };

      const userData = await apiCall('/auth/login-or-register', 'POST', payload);
      setUser(userData);

      // Check if user already has organization
      const org = await fetch(`${API_URL}/auth/my-org`, {
        headers: userData.token ? { 'Authorization': `Bearer ${userData.token}` } : { 'x-user-id': String(userData.id) }
      }).then(r => r.json()).catch(() => null);

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
    } catch (err) {
      console.error(err);
      showToastMsg(err.message || "Помилка реєстрації", "error");
    }
  };

  // Handle Password Reset Request
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

  // Handle New Password Submission
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
      setRegEmail(resetEmail); // autofill
    } catch (err) {
      console.error(err);
      showToastMsg(err.message || "Помилка при зміні паролю", "error");
    }
  };

  // Handle Google OAuth login/registration
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

              // Check if user already has organization
              const org = await fetch(`${API_URL}/auth/my-org`, {
                headers: userData.token ? { 'Authorization': `Bearer ${userData.token}` } : { 'x-user-id': String(userData.id) }
              }).then(r => r.json()).catch(() => null);

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

  // Handle Logout
  const handleSignOut = () => {
    setUser(null);
    setOrganization(null);
    setCurrentRole('B2C');
    setActiveB2CTab('search');
    setActiveB2BTab('manage');
    localStorage.removeItem('oneclick_user_id');
    localStorage.removeItem('oneclick_user_role');
    localStorage.removeItem('oneclick_user_token');
    showToastMsg("Ви вийшли з системи", "success");
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
      localStorage.setItem('oneclick_user_role', 'B2B');
      setIsOrgRegisterModalOpen(false);
      showToastMsg(`Організацію "${orgData.name}" успішно створено!`, 'success');
    } catch (err) {
      console.error(err);
    }
  };

  // Switch role between B2C and B2B (only if they have organization)
  const toggleRole = () => {
    if (currentRole === 'B2C' && !organization) {
      setIsOrgRegisterModalOpen(true);
      return;
    }
    const nextRole = currentRole === 'B2C' ? 'B2B' : 'B2C';
    setCurrentRole(nextRole);
    localStorage.setItem('oneclick_user_role', nextRole);
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
      setActiveB2BTab('manage');
      setActiveB2BFilter('АКТИВНІ');
      loadData();
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

  // --- STAGE 1.5: GOOGLE LOGIN MISSING PHONE FLOW ---
  if (user && !user.phone && user.role !== 'B2B') {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-[#111111] via-[#1a1a24] to-[#0e0e12] flex items-center justify-center p-4">
        <div className="w-full max-w-[450px] min-h-[680px] bg-[#f5f5f7] rounded-[40px] shadow-2xl overflow-hidden relative flex flex-col justify-between border border-white/10 p-6 text-[#111111]">

          <div className="flex-1 flex flex-col items-center justify-center my-auto">
            <div className="w-20 h-20 bg-gradient-to-tr from-[#FF5522] to-[#FFCC00] rounded-2xl shadow-lg flex items-center justify-center mb-6">
              <span className="text-white text-3xl font-black tracking-tight">1C</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-1">ONECLICK</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-8">Платформа волонтерства</p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (googlePhone.length !== 10) {
                  showToastMsg("Введіть коректний 10-значний номер телефону", "error");
                  return;
                }
                try {
                  // 1. Update user profile to save phone number
                  const updatedUser = await apiCall('/users/profile', 'PUT', {
                    name: user.name,
                    phone: `+380${googlePhone}`
                  });

                  // 2. If B2B, register organization
                  if (user.role === 'B2B' || regRole === 'B2B') {
                    const orgData = await apiCall('/auth/register-org', 'POST', {
                      name: regOrgName,
                      description: regOrgDesc,
                      address: regOrgAddr
                    });
                    setOrganization(orgData);
                  }

                  setUser(updatedUser);
                  showToastMsg("Дані успішно збережено!", "success");
                } catch (err) {
                  console.error(err);
                }
              }}
              className="space-y-4 w-full max-w-[320px] animate-fadeIn text-left"
            >
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 px-1">
                  Завершення реєстрації
                </label>
                <p className="text-[10px] text-gray-400 font-semibold mb-3 px-1 leading-relaxed">
                  Будь ласка, вкажіть ваш номер телефону{(user.role === 'B2B' || regRole === 'B2B') ? " та дані організації" : ""} для завершення реєстрації у системі:
                </p>
                <div className="flex gap-2 items-center">
                  <span className="bg-gray-100 border border-gray-200 text-gray-500 font-extrabold rounded-2xl px-3 py-3.5 text-xs shrink-0">
                    +380
                  </span>
                  <input
                    type="text"
                    placeholder="0931234567"
                    value={googlePhone}
                    onChange={(e) => setGooglePhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm transition-all"
                  />
                </div>
                <span className="text-[9px] text-gray-400 mt-1 block px-1">
                  Введіть 10 цифр (наприклад, 0931234567)
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
            © 2026 OneClick. Університетський тест
          </div>
        </div>
      </div>
    );
  }

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
            © 2026 OneClick. Університетський тест
          </div>
        </div>
      </div>
    );
  }

  // --- STAGE 2: DETAILS OVERLAY ---
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

  // --- STAGE 3: MAIN APP VIEW ---
  return (
    <div className="w-full min-h-screen bg-slate-900/40 py-4 flex items-center justify-center relative">

      {/* Toast Notification */}
      <Toast toast={toast} />

      {/* Main frame */}
      <div className={`w-full bg-[#f5f5f7] relative text-[#111111] border border-gray-200 shadow-2xl transition-all duration-300 ${
        (user && currentRole === 'B2B' && organization)
          ? 'md:max-w-6xl md:rounded-[40px] md:min-h-[85vh] md:flex md:pb-0 md:overflow-hidden'
          : 'max-w-[450px] min-h-screen pb-[110px] overflow-x-hidden'
      }`}>

        {/* ------------------------------------------------------------- */}
        {/* --- B2C WORKSPACE (VOLUNTEER) --- */}
        {/* ------------------------------------------------------------- */}
        {currentRole === 'B2C' && (
          <div className="w-full px-4 pt-6">
            {/* VIEW 1: SEARCH TAB */}
            {activeB2CTab === 'search' && (
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
            )}

            {/* VIEW 2: BOOKED SHIFTS TAB */}
            {activeB2CTab === 'myshifts' && (
              <BookedShiftsList
                filteredB2CBookedShifts={filteredB2CBookedShifts}
                activeB2CShiftsFilter={activeB2CShiftsFilter}
                setActiveB2CShiftsFilter={setActiveB2CShiftsFilter}
                setCurrentDetailsShift={setCurrentDetailsShift}
                showQrCodes={showQrCodes}
                setShowQrCodes={setShowQrCodes}
              />
            )}

            {/* VIEW 3: PROFILE TAB */}
            {activeB2CTab === 'profile' && (
              <VolunteerProfile
                user={user}
                organization={organization}
                isEditingProfile={isEditingProfile}
                setIsEditingProfile={setIsEditingProfile}
                editName={editName}
                setEditName={setEditName}
                editPhone={editPhone}
                setEditPhone={setEditPhone}
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
            )}

            {/* B2C Floating Bottom Navigation */}
            <Navigation
              role="B2C"
              activeTab={activeB2CTab}
              setActiveTab={setActiveB2CTab}
            />
          </div>
        )}
        {/* ------------------------------------------------------------- */}
        {/* --- B2B WORKSPACE (ORGANIZER) --- */}
        {/* ------------------------------------------------------------- */}
        {currentRole === 'B2B' && (
          <div className="w-full flex flex-col md:flex-row md:w-full min-h-screen md:min-h-0">
            {organization && (
              <Sidebar
                activeTab={activeB2BTab}
                setActiveTab={setActiveB2BTab}
                organization={organization}
                toggleRole={toggleRole}
                handleSignOut={handleSignOut}
                user={user}
              />
            )}
            
            <div className="w-full px-4 pt-6 flex-1 md:p-8 md:overflow-y-auto md:max-h-[85vh] pb-[110px] md:pb-8">
              {!organization ? (
                <div className="animate-fadeIn py-6 text-left">
                  <div className="flex justify-between items-center mb-5">
                    <div>
                      <h1 className="text-xl font-black tracking-tight text-gray-900">Реєстрація організації</h1>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        Вкажіть дані вашої організації для продовження
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={toggleRole}
                      className="px-3.5 py-2 bg-white hover:bg-gray-50 text-[10px] font-extrabold rounded-full border border-gray-200 shadow-sm flex items-center gap-1.5 transition-all active:scale-95 text-[#FF5522] uppercase tracking-wider cursor-pointer font-sans"
                    >
                      <span>Волонтер</span>
                      <User size={12} />
                    </button>
                  </div>

                  <form onSubmit={handleOrgRegisterSubmit} className="space-y-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
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
                  {/* VIEW 1: MANAGE TAB */}
                  {activeB2BTab === 'manage' && (
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
                  )}

                  {/* VIEW 2: CREATE FORM TAB */}
                  {activeB2BTab === 'create' && (
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
                  )}

                  {/* VIEW 3: CORPORATE PROFILE TAB */}
                  {activeB2BTab === 'profile' && (
                    <CoordinatorProfile
                      user={user}
                      organization={organization}
                      isEditingProfile={isEditingProfile}
                      setIsEditingProfile={setIsEditingProfile}
                      editName={editName}
                      setEditName={setEditName}
                      editOrgName={editOrgName}
                      setEditOrgName={setEditOrgName}
                      editOrgAddr={editOrgAddr}
                      setEditOrgAddr={setEditOrgAddr}
                      editOrgDesc={editOrgDesc}
                      setEditOrgDesc={setEditOrgDesc}
                      handleSaveProfile={handleSaveProfile}
                      handleGenerateInvite={handleGenerateInvite}
                      isMembersListExpanded={isMembersListExpanded}
                      setIsMembersListExpanded={setIsMembersListExpanded}
                      orgMembers={orgMembers}
                      handleRemoveMember={handleRemoveMember}
                      toggleRole={toggleRole}
                      handleLeaveOrganization={handleLeaveOrganization}
                      handleSignOut={handleSignOut}
                      API_URL={API_URL}
                    />
                  )}

                  {/* B2B Floating Bottom Navigation */}
                  <Navigation
                    role="B2B"
                    activeTab={activeB2BTab}
                    setActiveTab={setActiveB2BTab}
                  />
                </>
              )}
            </div>
          </div>
        )}
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
