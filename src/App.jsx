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
  Star,
  LogOut,
  Camera,
  ChevronUp,
  ChevronDown
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
  const [formSphere, setFormSphere] = useState('IT-відділ');
  const [formHours, setFormHours] = useState('09:00 - 18:00');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [tempStartHour, setTempStartHour] = useState('09');
  const [tempStartMin, setTempStartMin] = useState('00');
  const [tempEndHour, setTempEndHour] = useState('18');
  const [tempEndMin, setTempEndMin] = useState('00');
  const [formLocation, setFormLocation] = useState('Актова зала');
  const [formAddress, setFormAddress] = useState('вул. Канатна, 15');
  const [formDescription, setFormDescription] = useState('Допомога у технічному супроводі презентації.');

  // Data States
  const [shifts, setShifts] = useState([]); // Available B2C shifts
  const [bookedShifts, setBookedShifts] = useState([]); // Applied B2C shifts (applications)
  const [b2bApplications, setB2bApplications] = useState([]); // B2B applications for approval/check-in
  const [b2bShifts, setB2bShifts] = useState([]); // Organizer created shifts
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
        // B2B role: Fetch applications and created shifts
        const [apps, b2bShiftsData] = await Promise.all([
          apiCall('/applications/b2b'),
          apiCall('/shifts/b2b')
        ]);
        setB2bApplications(apps);
        setB2bShifts(b2bShiftsData);
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

  // Fetch data on parameters change
  useEffect(() => {
    loadData();
  }, [loadData]);

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
            name: regName,
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
          // If user does not exist (registration), send verification code
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
      setCurrentRole(userData.role);
      
      localStorage.setItem('oneclick_user_id', String(userData.id));
      localStorage.setItem('oneclick_user_role', userData.role);
      if (userData.token) {
        localStorage.setItem('oneclick_user_token', userData.token);
      }
      
      // Check if user already has organization
      const org = await fetch(`${API_URL}/auth/my-org`, {
        headers: userData.token ? { 'Authorization': `Bearer ${userData.token}` } : { 'x-user-id': String(userData.id) }
      }).then(r => r.json()).catch(() => null);
      
      if (org) {
        setOrganization(org);
        if (userData.role === 'B2B') {
          setCurrentRole('B2B');
          localStorage.setItem('oneclick_user_role', 'B2B');
        }
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
              setCurrentRole(userData.role);
              
              localStorage.setItem('oneclick_user_id', String(userData.id));
              localStorage.setItem('oneclick_user_role', userData.role);
              if (userData.token) {
                localStorage.setItem('oneclick_user_token', userData.token);
              }
              
              // Check if user already has organization
              const org = await fetch(`${API_URL}/auth/my-org`, {
                headers: userData.token ? { 'Authorization': `Bearer ${userData.token}` } : { 'x-user-id': String(userData.id) }
              }).then(r => r.json()).catch(() => null);
              
              if (org) {
                setOrganization(org);
                if (userData.role === 'B2B') {
                  setCurrentRole('B2B');
                  localStorage.setItem('oneclick_user_role', 'B2B');
                }
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
    if (!organization) {
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

            {otpMode ? (
              <form onSubmit={handleVerifyOtp} className="space-y-4 w-full max-w-[320px] animate-fadeIn">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 px-1">
                    Код підтвердження
                  </label>
                  <p className="text-[10px] text-gray-400 font-semibold mb-3 px-1 leading-relaxed">
                    {regRole === 'B2B' ? (
                      <>
                        Ми надіслали 4-значний код на пошту <span className="text-gray-900 font-black">{regEmail}</span> (симуляція: <span className="text-[#FF5522] font-black">{otpCode}</span>)
                      </>
                    ) : (
                      <>
                        Ми надіслали 4-значний код на номер <span className="text-gray-900 font-black">+380 {regPhone}</span> (симуляція: <span className="text-[#FF5522] font-black">{otpCode}</span>)
                      </>
                    )}
                  </p>
                  <input
                    type="text"
                    placeholder="0 0 0 0"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    required
                    className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-center text-lg font-black tracking-widest text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 mt-2 bg-[#FF5522] hover:bg-[#FF5522]/90 text-white font-extrabold rounded-full shadow-md text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
                >
                  Підтвердити код
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOtpMode(false);
                    setOtpCode('');
                    setEnteredOtp('');
                  }}
                  className="w-full py-3.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-extrabold rounded-full shadow-sm text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  Назад
                </button>
              </form>
            ) : forgotPasswordMode ? (
              resetOtpMode ? (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4 w-full max-w-[320px] animate-fadeIn">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 px-1">
                      Код відновлення
                    </label>
                    <p className="text-[10px] text-gray-400 font-semibold mb-3 px-1 leading-relaxed">
                      Ми надіслали код для зміни паролю на пошту <span className="text-gray-900 font-black">{resetEmail}</span> (симуляція: <span className="text-[#FF5522] font-black">{resetOtpCode}</span>)
                    </p>
                    <input
                      type="text"
                      placeholder="0 0 0 0"
                      value={resetEnteredOtp}
                      onChange={(e) => setResetEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      required
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-center text-lg font-black tracking-widest text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                      Новий пароль
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 mt-2 bg-[#FF5522] hover:bg-[#FF5522]/90 text-white font-extrabold rounded-full shadow-md text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
                  >
                    Змінити пароль
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setResetOtpMode(false);
                      setResetEnteredOtp('');
                      setNewPassword('');
                    }}
                    className="w-full py-3.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-extrabold rounded-full shadow-sm text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    Назад
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRequestResetOtp} className="space-y-4 w-full max-w-[320px] animate-fadeIn">
                  <h2 className="text-sm font-bold text-gray-850 mb-2 px-1 text-center font-black tracking-tight">Відновлення паролю</h2>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                      Електронна пошта
                    </label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 mt-2 bg-[#FF5522] hover:bg-[#FF5522]/90 text-white font-extrabold rounded-full shadow-md text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer"
                  >
                    Надіслати код
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasswordMode(false);
                    }}
                    className="w-full py-3.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-extrabold rounded-full shadow-sm text-xs tracking-wider uppercase transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    Назад до входу
                  </button>
                </form>
              )
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-4 w-full max-w-[320px]">
                {/* Role Toggle Tabs */}
                <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl border border-gray-200 mb-4">
                  <button
                    type="button"
                    onClick={() => setRegRole('B2C')}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-wider cursor-pointer ${
                      regRole === 'B2C'
                        ? 'bg-[#FF5522] text-white shadow-sm'
                        : 'text-gray-500 hover:text-black'
                    }`}
                  >
                    Волонтер (B2C)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('B2B')}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-wider cursor-pointer ${
                      regRole === 'B2B'
                        ? 'bg-[#FF5522] text-white shadow-sm'
                        : 'text-gray-500 hover:text-black'
                    }`}
                  >
                    Організатор (B2B)
                  </button>
                </div>

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

                {regRole === 'B2B' ? (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                        Електронна пошта
                      </label>
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        required
                        className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                        Пароль
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        required
                        className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setForgotPasswordMode(true);
                          setResetEmail(regEmail);
                        }}
                        className="text-[10px] text-[#FF5522] hover:underline font-bold mt-1.5 block px-1 cursor-pointer"
                      >
                        Забули пароль?
                      </button>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                      Телефон
                    </label>
                    <div className="flex gap-2 items-center">
                      <span className="bg-gray-100 border border-gray-200 text-gray-500 font-extrabold rounded-2xl px-3 py-3.5 text-xs shrink-0">
                        +380
                      </span>
                      <input
                        type="text"
                        placeholder="0931234567"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        required
                        className="w-full bg-white border border-gray-200 rounded-2xl px-4 py-3.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm transition-all"
                      />
                    </div>
                    <span className="text-[9px] text-gray-400 mt-1 block px-1">
                      Введіть 10 цифр (наприклад, 0931234567)
                    </span>
                  </div>
                )}

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
                <div className="flex items-center gap-2">
                  <User size={15} className="text-green-500" />
                  <span>Статус місць: <strong className="text-gray-900">{(currentDetailsShift.approved_count || 0) >= currentDetailsShift.max_volunteers ? "Зайнято" : "Вільне місце"}</strong></span>
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

          {currentRole === 'B2C' && (() => {
            const existingApp = bookedShifts.find(app => app.shift_id === currentDetailsShift.id || app.shift?.id === currentDetailsShift.id);
            if (existingApp) {
              let btnText = "Ви вже відгукнулися";
              let btnClass = "bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed";
              
              if (existingApp.status === 'pending') {
                btnText = "Заявка на розгляді";
                btnClass = "bg-orange-50 text-orange-600 border border-orange-200 cursor-not-allowed font-extrabold";
              } else if (existingApp.status === 'approved') {
                btnText = "Схвалено (Очікує зміну)";
                btnClass = "bg-blue-50 text-blue-600 border border-blue-200 cursor-not-allowed font-extrabold";
              } else if (existingApp.status === 'attended' || existingApp.status === 'reviewed') {
                btnText = "Зміна завершена";
                btnClass = "bg-green-50 text-green-600 border border-green-200 cursor-not-allowed font-extrabold";
              } else if (existingApp.status === 'rejected') {
                btnText = "Відхилено";
                btnClass = "bg-red-50 text-red-600 border border-red-200 cursor-not-allowed font-extrabold";
              }

              return (
                <div className="p-4 bg-white border-t border-gray-100">
                  <button
                    disabled
                    className={`w-full py-4 rounded-full text-sm flex items-center justify-center gap-1.5 ${btnClass}`}
                  >
                    <span>{btnText}</span>
                  </button>
                </div>
              );
            }

            // No existing application: show normal sign up flow
            if ((currentDetailsShift.approved_count || 0) >= currentDetailsShift.max_volunteers) {
              return (
                <div className="p-4 bg-white border-t border-gray-100">
                  <button
                    disabled
                    className="w-full py-4 bg-gray-250 text-gray-400 font-bold rounded-full shadow-inner text-sm cursor-not-allowed flex items-center justify-center gap-1.5 border border-gray-200"
                  >
                    <span>Вільних місць немає</span>
                  </button>
                </div>
              );
            }

            return (
              <div className="p-4 bg-white border-t border-gray-100">
                <button
                  onClick={() => handleApplyShift(currentDetailsShift)}
                  className="w-full py-4 bg-[#FF5522] hover:bg-[#FF5522]/90 text-white font-bold rounded-full shadow-md text-sm transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Відгукнутися на захід</span>
                </button>
              </div>
            );
          })()}
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
                <div className="flex gap-2 overflow-x-auto pt-2 pb-3.5 no-scrollbar">
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

                {/* Search Bar */}
                <div className="mb-4 relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Пошук за напрямком, локацією, описом..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-full pl-9 pr-4 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm placeholder:text-gray-400"
                  />
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
                        <div className="flex justify-between items-center gap-2 mb-2">
                          <span className="px-2.5 py-1 bg-gray-50 text-[9px] font-extrabold text-gray-500 rounded-full tracking-wider uppercase">
                            {shift.category}
                          </span>
                          <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full uppercase tracking-wider ${
                            (shift.approved_count || 0) >= shift.max_volunteers
                              ? 'bg-red-50 text-red-500 border border-red-100'
                              : 'bg-green-50 text-green-600 border border-green-100'
                          }`}>
                            {(shift.approved_count || 0) >= shift.max_volunteers
                              ? 'Місць немає' 
                              : 'Вільне місце'}
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
                          <div className="mt-3.5 space-y-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowQrCodes(prev => ({ ...prev, [app.id]: !prev[app.id] }));
                              }}
                              className="w-full py-2 bg-orange-50 border border-orange-100 hover:bg-orange-100/50 text-[#FF5522] font-bold text-[10px] rounded-full uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <span>{showQrCodes[app.id] ? "Приховати код підтвердження" : "Показати код підтвердження"}</span>
                            </button>

                            {showQrCodes[app.id] && (
                              <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3.5 text-center animate-fadeIn">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
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
                  {isEditingProfile ? (
                    <form onSubmit={handleSaveProfile} className="text-left space-y-4">
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-0.5">
                          Ім'я
                        </label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-white border border-gray-250 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-0.5">
                          Телефон
                        </label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-semibold text-gray-500">
                            +380
                          </span>
                          <input
                            type="text"
                            required
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            placeholder="9-значний номер"
                            className="w-full bg-white border border-gray-250 rounded-xl pl-12 pr-3.5 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          className="flex-1 py-3 bg-[#FF5522] hover:bg-[#FF5522]/90 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                        >
                          Зберегти
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="flex-1 py-3 border border-gray-300 hover:bg-gray-50 text-gray-600 font-extrabold text-[10px] rounded-full uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                        >
                          Скасувати
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <input
                        type="file"
                        id="avatar-upload-input"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                      />
                      <div 
                        onClick={() => document.getElementById('avatar-upload-input').click()}
                        className="group relative w-16 h-16 rounded-full overflow-hidden shadow-md mx-auto mb-3 cursor-pointer active:scale-95 transition-all"
                        title="Змінити фото профілю"
                      >
                        {user.avatar_url ? (
                          <img 
                            src={`${API_URL.replace('/api', '')}${user.avatar_url}`} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#FFCC00] text-black text-2xl font-black flex items-center justify-center">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'У'}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                          <Camera size={14} className="animate-pulse" />
                        </div>
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
                          <span>{user.role === 'B2B' ? 'Електронна пошта:' : 'Телефон:'}</span>
                          <span className="text-gray-950 font-bold">{user.role === 'B2B' ? user.email : user.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Статус:</span>
                          <span className="text-green-600 font-bold">Готовий допомогти</span>
                        </div>
                      </div>

                      <button
                        onClick={startEditingProfile}
                        className="w-full mt-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl border border-gray-200 transition-all active:scale-[0.98] text-[10px] uppercase tracking-wider cursor-pointer"
                      >
                        Редагувати профіль
                      </button>
                    </>
                  )}
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

                <button
                  onClick={handleSignOut}
                  className="w-full mt-3 py-4 bg-red-50 hover:bg-red-100 text-red-650 font-extrabold rounded-full border border-red-200 shadow-sm flex items-center justify-center gap-2.5 transition-all active:scale-95 text-xs uppercase tracking-wider cursor-pointer"
                >
                  <LogOut size={15} className="text-red-550" />
                  <span>Вийти з акаунту</span>
                </button>
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

                {/* View Selector: Applications vs Created Shifts */}
                <div className="flex gap-2 mb-4 border-b border-gray-150 pb-2">
                  <button
                    onClick={() => setActiveB2BSubView('applications')}
                    className={`pb-2 px-3 text-xs font-black transition-all ${
                      activeB2BSubView === 'applications'
                        ? 'border-b-2 border-[#FF5522] text-gray-900 font-sans'
                        : 'text-gray-400 hover:text-gray-650 font-sans'
                    }`}
                  >
                    Заявки волонтерів ({b2bApplications.length})
                  </button>
                  <button
                    onClick={() => setActiveB2BSubView('shifts')}
                    className={`pb-2 px-3 text-xs font-black transition-all ${
                      activeB2BSubView === 'shifts'
                        ? 'border-b-2 border-[#FF5522] text-gray-900 font-sans'
                        : 'text-gray-400 hover:text-gray-650 font-sans'
                    }`}
                  >
                    Мої заходи ({b2bShifts.length})
                  </button>
                </div>

                {activeB2BSubView === 'applications' ? (
                  <>
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
                                {app.volunteer_avatar_url ? (
                                  <img 
                                    src={`${API_URL.replace('/api', '')}${app.volunteer_avatar_url}`} 
                                    alt="Avatar" 
                                    className="w-4 h-4 rounded-full object-cover"
                                  />
                                ) : (
                                  <User size={12} className="text-gray-300" />
                                )}
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
                  </>
                ) : (
                  <div className="space-y-4">
                    {b2bShifts.length > 0 ? (
                      b2bShifts.map((shift) => (
                        <div
                          key={shift.id}
                          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden text-left"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="px-2.5 py-0.5 text-[9px] font-extrabold rounded-full bg-gray-50 text-gray-500 uppercase tracking-wider">
                              {shift.category}
                            </span>
                            <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full uppercase tracking-wider ${
                              shift.status === 'open' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {shift.status === 'open' ? 'Активний' : 'Закритий'}
                            </span>
                          </div>

                          <h3 
                            onClick={() => setCurrentDetailsShift(shift)}
                            className="font-black text-gray-950 text-base leading-snug mb-2 cursor-pointer hover:underline"
                          >
                            {shift.title}
                          </h3>

                          <div className="space-y-1 mb-3 text-[11px] text-gray-500 font-semibold">
                            <p className="flex items-center gap-1.5">
                              <Clock size={12} className="text-gray-300" />
                              <span>Час: {shift.time} ({shift.date})</span>
                            </p>
                            <p className="flex items-center gap-1.5">
                              <MapPin size={12} className="text-gray-300" />
                              <span>Локація: {shift.location}</span>
                            </p>
                            <p className="flex items-center gap-1.5">
                              <User size={12} className="text-gray-300" />
                              <span>Статус: <strong className="text-gray-800">{shift.approved_count > 0 ? "Волонтер знайдений" : "Очікує волонтера"}</strong></span>
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-3">
                          <Calendar size={20} />
                        </div>
                        <h4 className="font-bold text-gray-800 text-xs mb-1">Немає створених заходів</h4>
                        <p className="text-[10px] text-gray-400 max-w-[200px] leading-relaxed">
                          Ви ще не створили жодного заходу для волонтерів.
                        </p>
                      </div>
                    )}
                  </div>
                )}

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

                    <div 
                      onClick={() => {
                        setTempStartHour(startTime.split(':')[0] || '09');
                        setTempStartMin(startTime.split(':')[1] || '00');
                        setTempEndHour(endTime.split(':')[0] || '18');
                        setTempEndMin(endTime.split(':')[1] || '00');
                        setIsTimePickerOpen(true);
                      }}
                      className="cursor-pointer"
                    >
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1 cursor-pointer">
                        Години роботи
                      </label>
                      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3.5 shadow-sm hover:border-[#FF5522]/50 transition-colors">
                        <Clock size={14} className="text-gray-400" />
                        <span className="text-xs font-black text-gray-800">
                          {startTime} — {endTime}
                        </span>
                      </div>
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
                  {isEditingProfile ? (
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-0.5">
                          Ім'я Координатора
                        </label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-white border border-gray-250 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-0.5">
                          Назва Організації
                        </label>
                        <input
                          type="text"
                          required
                          value={editOrgName}
                          onChange={(e) => setEditOrgName(e.target.value)}
                          className="w-full bg-white border border-gray-250 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-0.5">
                          Адреса
                        </label>
                        <input
                          type="text"
                          required
                          value={editOrgAddr}
                          onChange={(e) => setEditOrgAddr(e.target.value)}
                          className="w-full bg-white border border-gray-250 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-gray-800 focus:outline-none focus:border-[#FF5522] shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-0.5">
                          Опис Організації
                        </label>
                        <textarea
                          rows="2"
                          required
                          value={editOrgDesc}
                          onChange={(e) => setEditOrgDesc(e.target.value)}
                          className="w-full bg-white border border-gray-250 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:border-[#FF5522] resize-none shadow-sm"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          className="flex-1 py-3 bg-[#FF5522] hover:bg-[#FF5522]/90 text-white font-extrabold text-[10px] rounded-full uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                        >
                          Зберегти
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="flex-1 py-3 border border-gray-300 hover:bg-gray-50 text-gray-600 font-extrabold text-[10px] rounded-full uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
                        >
                          Скасувати
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <input
                        type="file"
                        id="avatar-upload-input-b2b"
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                      />
                      <div 
                        onClick={() => document.getElementById('avatar-upload-input-b2b').click()}
                        className="group relative w-16 h-16 rounded-full overflow-hidden shadow-md mx-auto mb-4 cursor-pointer active:scale-95 transition-all text-center"
                        title="Змінити фото профілю"
                      >
                        {user.avatar_url ? (
                          <img 
                            src={`${API_URL.replace('/api', '')}${user.avatar_url}`} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#FFCC00] text-black text-2xl font-black flex items-center justify-center">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'У'}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                          <Camera size={14} className="animate-pulse" />
                        </div>
                      </div>

                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-1 text-center">
                        Організація
                      </span>
                      <h2 className="text-base font-black text-gray-900 mb-4 text-center">
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

                      <button
                        onClick={startEditingProfile}
                        className="w-full mt-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl border border-gray-200 transition-all active:scale-[0.98] text-[10px] uppercase tracking-wider cursor-pointer"
                      >
                        Редагувати профіль
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={toggleRole}
                  className="w-full py-4 bg-white hover:bg-gray-50 text-gray-800 font-bold rounded-full border border-gray-200 shadow-md flex items-center justify-center gap-2.5 transition-all active:scale-95 text-xs uppercase tracking-wider cursor-pointer"
                >
                  <User size={15} className="text-[#FF5522]" />
                  <span>Повернутися до акаунту Волонтера (B2C)</span>
                </button>

                <button
                  onClick={handleSignOut}
                  className="w-full mt-3 py-4 bg-red-50 hover:bg-red-100 text-red-650 font-bold rounded-full border border-red-200 shadow-sm flex items-center justify-center gap-2.5 transition-all active:scale-95 text-xs uppercase tracking-wider cursor-pointer"
                >
                  <LogOut size={15} className="text-red-550" />
                  <span>Вийти з акаунту</span>
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
            </>
            )}

          </div>
        )}

      </div>

      {/* --- TIME PICKER MODAL --- */}
      {isTimePickerOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-[340px] p-6 shadow-2xl animate-scaleUp text-left flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-[#FF5522]">
              <Clock size={16} />
              <h3 className="text-xs font-black uppercase tracking-wider">
                Оберіть години роботи
              </h3>
            </div>

            <div className="space-y-6">
              {/* Start Time block */}
              <div>
                <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                  Час початку зміни
                </span>
                <div className="flex items-center justify-center gap-3">
                  {/* Start Hour */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => {
                        let num = parseInt(tempStartHour, 10) || 0;
                        num = num >= 23 ? 0 : num + 1;
                        setTempStartHour(String(num).padStart(2, '0'));
                      }}
                      className="text-gray-400 hover:text-[#FF5522] p-1 transition-colors active:scale-125"
                    >
                      <ChevronUp size={18} />
                    </button>
                    <input
                      type="text"
                      maxLength={2}
                      value={tempStartHour}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, '');
                        if (clean === '') {
                          setTempStartHour('');
                          return;
                        }
                        let num = parseInt(clean, 10);
                        if (num > 23) num = 23;
                        setTempStartHour(String(num).padStart(2, '0'));
                      }}
                      onBlur={() => {
                        if (tempStartHour === '') {
                          setTempStartHour('09');
                        } else {
                          setTempStartHour(String(parseInt(tempStartHour, 10) || 0).padStart(2, '0'));
                        }
                      }}
                      className="w-16 h-14 bg-orange-50/50 text-[#FF5522] font-black text-2xl text-center rounded-2xl border border-orange-200/55 focus:outline-none focus:border-[#FF5522] focus:bg-orange-50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        let num = parseInt(tempStartHour, 10) || 0;
                        num = num <= 0 ? 23 : num - 1;
                        setTempStartHour(String(num).padStart(2, '0'));
                      }}
                      className="text-gray-400 hover:text-[#FF5522] p-1 transition-colors active:scale-125"
                    >
                      <ChevronDown size={18} />
                    </button>
                  </div>

                  <span className="text-[#FF5522] font-black text-2xl pb-6">:</span>

                  {/* Start Minute */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => {
                        let num = parseInt(tempStartMin, 10) || 0;
                        num = num >= 59 ? 0 : num + 1;
                        setTempStartMin(String(num).padStart(2, '0'));
                      }}
                      className="text-gray-400 hover:text-[#FF5522] p-1 transition-colors active:scale-125"
                    >
                      <ChevronUp size={18} />
                    </button>
                    <input
                      type="text"
                      maxLength={2}
                      value={tempStartMin}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, '');
                        if (clean === '') {
                          setTempStartMin('');
                          return;
                        }
                        let num = parseInt(clean, 10);
                        if (num > 59) num = 59;
                        setTempStartMin(String(num).padStart(2, '0'));
                      }}
                      onBlur={() => {
                        if (tempStartMin === '') {
                          setTempStartMin('00');
                        } else {
                          setTempStartMin(String(parseInt(tempStartMin, 10) || 0).padStart(2, '0'));
                        }
                      }}
                      className="w-16 h-14 bg-orange-50/50 text-[#FF5522] font-black text-2xl text-center rounded-2xl border border-orange-200/55 focus:outline-none focus:border-[#FF5522] focus:bg-orange-50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        let num = parseInt(tempStartMin, 10) || 0;
                        num = num <= 0 ? 59 : num - 1;
                        setTempStartMin(String(num).padStart(2, '0'));
                      }}
                      className="text-gray-400 hover:text-[#FF5522] p-1 transition-colors active:scale-125"
                    >
                      <ChevronDown size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* End Time block */}
              <div>
                <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                  Час закінчення зміни
                </span>
                <div className="flex items-center justify-center gap-3">
                  {/* End Hour */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => {
                        let num = parseInt(tempEndHour, 10) || 0;
                        num = num >= 23 ? 0 : num + 1;
                        setTempEndHour(String(num).padStart(2, '0'));
                      }}
                      className="text-gray-400 hover:text-[#FF5522] p-1 transition-colors active:scale-125"
                    >
                      <ChevronUp size={18} />
                    </button>
                    <input
                      type="text"
                      maxLength={2}
                      value={tempEndHour}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, '');
                        if (clean === '') {
                          setTempEndHour('');
                          return;
                        }
                        let num = parseInt(clean, 10);
                        if (num > 23) num = 23;
                        setTempEndHour(String(num).padStart(2, '0'));
                      }}
                      onBlur={() => {
                        if (tempEndHour === '') {
                          setTempEndHour('18');
                        } else {
                          setTempEndHour(String(parseInt(tempEndHour, 10) || 0).padStart(2, '0'));
                        }
                      }}
                      className="w-16 h-14 bg-orange-50/50 text-[#FF5522] font-black text-2xl text-center rounded-2xl border border-orange-200/55 focus:outline-none focus:border-[#FF5522] focus:bg-orange-50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        let num = parseInt(tempEndHour, 10) || 0;
                        num = num <= 0 ? 23 : num - 1;
                        setTempEndHour(String(num).padStart(2, '0'));
                      }}
                      className="text-gray-400 hover:text-[#FF5522] p-1 transition-colors active:scale-125"
                    >
                      <ChevronDown size={18} />
                    </button>
                  </div>

                  <span className="text-[#FF5522] font-black text-2xl pb-6">:</span>

                  {/* End Minute */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => {
                        let num = parseInt(tempEndMin, 10) || 0;
                        num = num >= 59 ? 0 : num + 1;
                        setTempEndMin(String(num).padStart(2, '0'));
                      }}
                      className="text-gray-400 hover:text-[#FF5522] p-1 transition-colors active:scale-125"
                    >
                      <ChevronUp size={18} />
                    </button>
                    <input
                      type="text"
                      maxLength={2}
                      value={tempEndMin}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/\D/g, '');
                        if (clean === '') {
                          setTempEndMin('');
                          return;
                        }
                        let num = parseInt(clean, 10);
                        if (num > 59) num = 59;
                        setTempEndMin(String(num).padStart(2, '0'));
                      }}
                      onBlur={() => {
                        if (tempEndMin === '') {
                          setTempEndMin('00');
                        } else {
                          setTempEndMin(String(parseInt(tempEndMin, 10) || 0).padStart(2, '0'));
                        }
                      }}
                      className="w-16 h-14 bg-orange-50/50 text-[#FF5522] font-black text-2xl text-center rounded-2xl border border-orange-200/55 focus:outline-none focus:border-[#FF5522] focus:bg-orange-50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        let num = parseInt(tempEndMin, 10) || 0;
                        num = num <= 0 ? 59 : num - 1;
                        setTempEndMin(String(num).padStart(2, '0'));
                      }}
                      className="text-gray-400 hover:text-[#FF5522] p-1 transition-colors active:scale-125"
                    >
                      <ChevronDown size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => setIsTimePickerOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 rounded-xl transition-all"
              >
                Скасувати
              </button>
              <button
                type="button"
                onClick={() => {
                  setStartTime(`${tempStartHour}:${tempStartMin}`);
                  setEndTime(`${tempEndHour}:${tempEndMin}`);
                  setIsTimePickerOpen(false);
                }}
                className="px-5 py-2 bg-[#FF5522] hover:bg-[#FF5522]/90 text-white font-bold text-xs rounded-xl transition-all shadow-sm active:scale-95"
              >
                Підтвердити
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- VOLUNTEER PROFILE / REVIEWS MODAL --- */}
      {isReviewsModalOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-[390px] p-6 shadow-2xl animate-scaleUp text-left relative flex flex-col max-h-[90vh]">
            
            <button
              onClick={() => {
                setIsReviewsModalOpen(false);
                setSelectedVolunteerProfile(null);
              }}
              className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-black hover:bg-gray-50 rounded-full transition-all active:scale-95"
            >
              <X size={18} />
            </button>

            {/* Volunteer Profile Header */}
            <div className="text-center pb-4 border-b border-gray-100 mb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden shadow-md mx-auto mb-3">
                {selectedVolunteerProfile?.avatar_url ? (
                  <img 
                    src={`${API_URL.replace('/api', '')}${selectedVolunteerProfile.avatar_url}`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#FFCC00] text-black text-2xl font-black flex items-center justify-center">
                    {reviewsModalUserName ? reviewsModalUserName.charAt(0).toUpperCase() : 'У'}
                  </div>
                )}
              </div>

              <h3 className="font-black text-gray-950 text-base leading-snug">
                {reviewsModalUserName}
              </h3>
              <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest mt-0.5">
                Профіль волонтера
              </p>

              {/* Rating badge */}
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-50/60 border border-yellow-100 text-yellow-700 font-black text-[10px] mt-2">
                <Star size={11} className="fill-yellow-400 text-yellow-500" />
                <span>
                  {selectedVolunteerProfile?.rating ? `${selectedVolunteerProfile.rating} / 5.0` : 'Без оцінок'}
                </span>
              </div>
            </div>

            {/* Detailed Stats & Contacts */}
            <div className="space-y-2.5 mb-4 text-xs">
              <div className="bg-gray-50/70 p-3 rounded-2xl border border-gray-100 space-y-2 text-[11px] font-semibold text-gray-600">
                <div className="flex justify-between items-center">
                  <span>Виконано змін:</span>
                  <span className="font-extrabold text-gray-900 bg-gray-250/60 px-2 py-0.5 rounded-full text-[10px]">
                    {selectedVolunteerProfile?.completed_shifts_count || 0}
                  </span>
                </div>
                
                {selectedVolunteerProfile?.phone && (
                  <div className="flex justify-between items-center">
                    <span>Телефон:</span>
                    <a 
                      href={`tel:${selectedVolunteerProfile.phone}`}
                      className="font-extrabold text-blue-600 hover:underline"
                    >
                      {selectedVolunteerProfile.phone}
                    </a>
                  </div>
                )}

                {selectedVolunteerProfile?.email && (
                  <div className="flex justify-between items-center">
                    <span>Email:</span>
                    <a 
                      href={`mailto:${selectedVolunteerProfile.email}`}
                      className="font-extrabold text-blue-600 hover:underline"
                    >
                      {selectedVolunteerProfile.email}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Coordinator Reviews Header */}
            <h4 className="font-bold text-[10px] text-gray-400 uppercase tracking-widest mb-2 px-0.5">
              Відгуки організаторів
            </h4>

            {/* Reviews List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar max-h-[200px]">
              {volunteerReviews.length > 0 ? (
                volunteerReviews.map((review) => (
                  <div key={review.id} className="bg-gray-50/60 p-3 rounded-2xl border border-gray-100">
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
                <div className="text-center py-4 bg-gray-50/40 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    Відгуків ще немає
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setIsReviewsModalOpen(false);
                setSelectedVolunteerProfile(null);
              }}
              className="w-full py-3.5 mt-4 bg-black hover:bg-black/95 text-white font-extrabold rounded-full text-xs transition-all active:scale-95 cursor-pointer"
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
