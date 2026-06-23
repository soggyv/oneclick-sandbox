/* eslint-disable react-hooks/preserve-manual-memoization */
import { useState, useMemo, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Shift, DisputeMessage, Transaction, UkCalendarDay, Branch } from '../types/sandbox';
import { getInitialShifts, getHoursRemaining } from '../utils/sandbox';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured =
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  supabaseAnonKey !== 'placeholder-key' &&
  !supabaseUrl.includes('your-supabase-project-id');


export function useSandbox() {
  'use no memo';
  // --- STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('Олексій Коваленко');
  const [userPhone, setUserPhone] = useState<string>('+380 67 123 45 67');
  const [userAvatar, setUserAvatar] = useState<string>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  );
  const [isDiiaVerified, setIsDiiaVerified] = useState<boolean>(false);
  const [showAgreementModal, setShowAgreementModal] = useState<boolean>(false);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [showAvatarEditModal, setShowAvatarEditModal] = useState<boolean>(false);
  const [arbitratorModalShiftId, setArbitratorModalShiftId] = useState<string | null>(null);

  // B2B Company states
  const [companyName, setCompanyName] = useState<string>('');
  const [companyDetails, setCompanyDetails] = useState<string>('');
  const [isEditingCompany, setIsEditingCompany] = useState<boolean>(false);
  const [tempCompanyName, setTempCompanyName] = useState<string>('');
  const [tempCompanyDetails, setTempCompanyDetails] = useState<string>('');

  // Auth flow screens
  const [authStep, setAuthStep] = useState<'welcome' | 'phone-input' | 'phone-verify' | 'diia-qr' | 'company-register'>('welcome');
  const [regRole, setRegRole] = useState<'worker' | 'employer'>('worker');
  const [regCompanyName, setRegCompanyName] = useState<string>('');
  const [regCompanyEdrpou, setRegCompanyEdrpou] = useState<string>('');
  const [regCompanyAddress, setRegCompanyAddress] = useState<string>('');
  const [regCompanyCategory, setRegCompanyCategory] = useState<'Кава' | 'Рітейл' | 'Склади'>('Кава');

  const [tempPhone, setTempPhone] = useState<string>('');
  const [tempName, setTempName] = useState<string>('');
  const [smsCode, setSmsCode] = useState<string>('');
  const [expectedSmsCode, setExpectedSmsCode] = useState<string>('');

  const [theme, setTheme] = useState<'light' | 'dark' | 'minimalist'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oneclick_theme');
      if (saved === 'light' || saved === 'dark' || saved === 'minimalist') {
        return saved;
      }
    }
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('oneclick_theme', theme);
  }, [theme]);
  const [shifts, setShifts] = useState<Shift[]>(() => {
    return isSupabaseConfigured ? [] : getInitialShifts();
  });
  const [userRole, setUserRole] = useState<'worker' | 'employer'>('worker');
  const [activeTab, setActiveTab] = useState<'feed' | 'my-shifts' | 'wallet' | 'profile'>('feed');
  const [b2bTab, setB2bTab] = useState<'dashboard' | 'shifts' | 'create' | 'wallet' | 'profile'>('dashboard');

  // Worker profile & wallet
  const [balance, setBalance] = useState<number>(0);
  const [rating] = useState<number>(5.0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Employer conceptual balance
  const [employerBalance, setEmployerBalance] = useState<number>(50000);
  const employerFrozenBalance = useMemo<number>(() => {
    return shifts
      .filter(s => s.status === 'booked' || s.status === 'in_progress' || s.status === 'pending_approval' || s.status === 'disputed')
      .reduce((sum, s) => sum + s.price, 0);
  }, [shifts]);

  // Temporary screen states
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [signedContract, setSignedContract] = useState<boolean>(false);
  const [showQRModal, setShowQRModal] = useState<string | null>(null);
  const [showScannerModal, setShowScannerModal] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  const [showB2BQRModalId, setShowB2BQRModalId] = useState<string | null>(null);
  const [showDisputeModalId, setShowDisputeModalId] = useState<string | null>(null);

  const [disputeReasonInput, setDisputeReasonInput] = useState<string>('Неякісно виконана робота');
  const [disputeCommentInput, setDisputeCommentInput] = useState<string>('');

  // Dispute Chat and Accordion states
  const [collapsedDisputes, setCollapsedDisputes] = useState<Record<string, boolean>>({});
  const [disputeChats, setDisputeChats] = useState<Record<string, DisputeMessage[]>>({});
  const [disputeMessageText, setDisputeMessageText] = useState<string>('');

  // B2C Work Report & Photo upload states
  const [showReportModalId, setShowReportModalId] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [reportComment, setReportComment] = useState<string>('');
  const [isTakingPhoto, setIsTakingPhoto] = useState<boolean>(false);
  const [simulateDeadline, setSimulateDeadline] = useState<boolean>(false);

  // B2C Feed filters
  const [selectedDate, setSelectedDate] = useState<string>(() => String(new Date().getDate()));
  const [selectedCategory, setSelectedCategory] = useState<string>('Всі');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // B2C Profile subpage control
  const [profileSubPage, setProfileSubPage] = useState<'main' | 'personal' | 'docs' | 'help' | 'developer' | 'theme-settings' | 'settings'>('main');

  // Form states for B2B shift publishing
  const [newRole, setNewRole] = useState('');
  const [isRoleComboOpen, setIsRoleComboOpen] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newDate, setNewDate] = useState(() => String(new Date().getDate()));
  const [newTime, setNewTime] = useState('08:00 — 20:00');
  const [newDuration, setNewDuration] = useState('12 год');
  const [newPrice, setNewPrice] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [newCategory, setNewCategory] = useState<'Кава' | 'Рітейл' | 'Склади' | 'University Event / Volunteer'>('Кава');

  // Branch & Template configuration states
  const [requiresScreening, setRequiresScreening] = useState<boolean>(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [branches, setBranches] = useState<Branch[]>([
    { id: 'b1', name: 'Aroma Kava Хрещатик', address: 'Київ, Хрещатик, 24', requiresScreening: false },
    { id: 'b2', name: 'Rozetka Малиновського', address: 'Київ, вул. Маршала Малиновського, 12', requiresScreening: true },
    { id: 'b3', name: 'Нова Пошта Броварська', address: 'Київ, вул. Броварська, 15', requiresScreening: false }
  ]);

  // Active / History subtab inside B2C "My Shifts"
  const [myShiftsSubTab, setMyShiftsSubTab] = useState<'active' | 'history'>('active');

  // Toast notifications
  const [toast, setToast] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Close Combobox on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.role-combobox-container')) {
        setIsRoleComboOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleSignOut = async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.error('Error signing out from Supabase:', e);
    }

    setIsLoggedIn(false);
    setUserName('');
    setUserPhone('');
    setUserAvatar('');
    setIsDiiaVerified(false);
    setCompanyName('');
    setCompanyDetails('');
    setUserRole('worker');
    setRegRole('worker');
    setAuthStep('welcome');
    setActiveTab('feed');
    setB2bTab('dashboard');
    setProfileSubPage('main');
    setBalance(0);
    setTransactions([]);
    setEmployerBalance(0);

    localStorage.removeItem('oneclick_auth_profile');
    localStorage.removeItem('oneclick_user_id');

    triggerToast('Ви успішно вийшли з акаунту.');

    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  // B2C Feedback states
  const [activeFeedbackShiftId, setActiveFeedbackShiftId] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>('');

  const handleSubmitFeedback = async (shiftId: string) => {
    if (!feedbackComment.trim()) {
      triggerToast('Будь ласка, напишіть текст відгуку!');
      return;
    }
    try {
      const res = await fetch('http://localhost:8000/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shift_id: shiftId,
          rating: feedbackRating,
          comment: feedbackComment.trim()
        })
      });
      if (res.ok) {
        setActiveFeedbackShiftId(null);
        setFeedbackComment('');
        setFeedbackRating(5);
        triggerToast('Дякуємо за ваш відгук!');
        fetchStateFromBackend();
      } else {
        triggerToast('Помилка при відправці відгуку');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Помилка з’єднання');
    }
  };

  const handleWithdraw = async () => {
    if (balance <= 0) {
      triggerToast('Немає коштів для виведення!');
      return;
    }
    const storedUserId = localStorage.getItem('oneclick_user_id') || 'worker-alex';
    try {
      const res = await fetch(`http://localhost:8000/users/${storedUserId}/balance?is_deposit=false`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: balance })
      });
      if (res.ok) {
        triggerToast('Виведення коштів успішно ініційовано!');
        fetchStateFromBackend();
      } else {
        triggerToast('Помилка при виведенні коштів');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Помилка з’єднання');
    }
  };

  // --- BRANCH SELECTION CHANGES ---
  const handleSelectBranch = (branchId: string) => {
    setSelectedBranchId(branchId);
    if (!branchId) return;
    const branch = branches.find(b => b.id === branchId);
    if (branch) {
      setNewAddress(branch.address);
      setRequiresScreening(branch.requiresScreening);
      triggerToast(`Філія обрана: ${branch.name}. Налаштування встановлено.`);
    }
  };



  const handleSelectShift = async (s: Shift | null) => {
    if (!s) {
      setSelectedShift(null);
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/reviews/${s.id}`);
      if (res.ok) {
        const reviewsData = await res.json();
        interface BackendReview {
          id: string;
          worker_name: string;
          rating: number;
          date: string;
          comment: string;
        }
        const mappedReviews = reviewsData.map((r: BackendReview) => ({
          id: r.id,
          workerName: r.worker_name,
          rating: r.rating,
          date: r.date,
          comment: r.comment
        }));
        setSelectedShift({ ...s, reviews: mappedReviews });
      } else {
        setSelectedShift(s);
      }
    } catch (e) {
      console.error('Error fetching reviews:', e);
      setSelectedShift(s);
    }
  };

  const handleSimulateScan = async (shiftId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/shifts/${shiftId}/checkin`, {
        method: 'POST'
      });
      if (res.ok) {
        triggerToast('Зміну розпочато! 🔐 Кошти для оплати успішно заблоковано на сейфі.');
        setShowScannerModal(null);
        fetchStateFromBackend();
      } else {
        const err = await res.json();
        triggerToast(err.detail || 'Помилка початку зміни');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Помилка з’єднання');
    }
  };

  const handleCheckoutShift = async (shiftId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/shifts/${shiftId}/checkout?photo_url=&comment=`, {
        method: 'POST'
      });
      if (res.ok) {
        triggerToast('Чек-аут виконано! Роботодавець отримав запит на виплату. 💰');
        fetchStateFromBackend();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // B2C: Book Shift
  const handleBookShift = async (shiftId: string) => {
    if (!signedContract) {
      triggerToast('Будь ласка, підпишіть договір через Дію!');
      return;
    }
    const workerId = localStorage.getItem('oneclick_user_id') || 'worker-alex';
    try {
      const res = await fetch(`http://localhost:8000/shifts/${shiftId}/book?worker_id=${workerId}`, {
        method: 'POST'
      });
      if (res.ok) {
        triggerToast('Зміну успішно заброньовано!');
        setSelectedShift(null);
        setSignedContract(false);
        fetchStateFromBackend();
      } else {
        const err = await res.json();
        triggerToast(err.detail || 'Помилка бронювання зміни');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Помилка з’єднання при бронюванні');
    }
  };

  // B2C: Cancel Shift
  const handleCancelShift = async (shiftId: string, isUrgent: boolean) => {
    try {
      const res = await fetch(`http://localhost:8000/shifts/${shiftId}/cancel?is_late=${isUrgent}`, {
        method: 'POST'
      });
      if (res.ok) {
        if (isUrgent) {
          triggerToast('Термінова відмова: нараховано штраф 250 ₴!');
        } else {
          triggerToast('Зміну скасовано заздалегідь без штрафу.');
        }
        setShowCancelModal(null);
        fetchStateFromBackend();
      } else {
        triggerToast('Помилка скасування зміни');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Помилка з’єднання при скасуванні');
    }
  };

  // B2B: Create Shift
  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    const isVolunteer = newCategory === 'University Event / Volunteer';
    const activeCompany = companyName || 'Aroma Kava';
    if (!newRole || !activeCompany || (!isVolunteer && !newPrice) || !newAddress) {
      triggerToast('Заповніть всі обов\'язкові поля!');
      return;
    }
    if (!newDetails.trim()) {
      triggerToast('Введіть опис обов\'язків та завдань для смени!');
      return;
    }

    const employerId = localStorage.getItem('oneclick_user_id') || 'employer-default';

    const body = {
      company: activeCompany,
      role: newRole,
      date: newDate,
      dayName: calendarDays.find(d => d.date === newDate)?.day || 'Пн',
      time: newTime,
      duration: newDuration,
      price: isVolunteer ? 0 : Number(newPrice || 0),
      address: newAddress,
      category: newCategory,
      details: newDetails,
      requires_screening: requiresScreening,
      template_name: null,
      latitude: null,
      longitude: null
    };

    try {
      const res = await fetch(`http://localhost:8000/shifts?employer_id=${employerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {

        setNewRole('');
        setNewPrice('');
        setNewAddress('');
        setNewDetails('');
        setRequiresScreening(false);
        setB2bTab('dashboard');
        triggerToast('Зміну опубліковано!');
        fetchStateFromBackend();
      } else {
        triggerToast('Помилка публікації зміни');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Помилка з’єднання');
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setUserAvatar(reader.result);
          setShowAvatarEditModal(false);
          triggerToast('Фото профілю оновлено! 📸');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoginSuccess = async (name: string, phone: string, isDiia: boolean) => {
    try {
      const endpoint = isDiia ? 'verify-diia' : 'verify-sms';
      const body = isDiia ? { name, phone } : { phone, name, code: '4815' };
      const res = await fetch(`http://localhost:8000/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        const userData = await res.json();
        setUserName(userData.name);
        setUserPhone(userData.phone);
        setIsDiiaVerified(userData.is_verified);
        if (userData.avatar) setUserAvatar(userData.avatar);
        setBalance(userData.balance);

        localStorage.setItem('oneclick_user_id', userData.user_id);

        if (regRole === 'employer') {
          setUserRole('employer');
          setAuthStep('company-register');
          return;
        }

        setIsLoggedIn(true);
        setUserRole('worker');

        const profileData = {
          isLoggedIn: true,
          userRole: 'worker',
          userName: userData.name,
          userPhone: userData.phone,
          userAvatar: userData.avatar,
          isDiiaVerified: userData.is_verified,
          companyName: '',
          companyDetails: ''
        };
        localStorage.setItem('oneclick_auth_profile', JSON.stringify(profileData));
        triggerToast(`Вітаємо, ${userData.name}! Вхід успішний. 🚀`);
      } else {
        const errorData = await res.json();
        triggerToast(`Помилка входу: ${errorData.detail || 'Невідома помилка'}`);
      }
    } catch (e) {
      console.error(e);
      triggerToast('Помилка з’єднання з сервером API');
    }
  };

  const handleRegisterCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regCompanyName.trim() || !regCompanyEdrpou.trim() || !regCompanyAddress.trim()) {
      triggerToast('Заповніть всі обов\'язкові поля компанії!');
      return;
    }
    if (regCompanyEdrpou.trim().length !== 8 || !/^\d+$/.test(regCompanyEdrpou)) {
      triggerToast('Код ЄДРПОУ має складатися з 8 цифр!');
      return;
    }

    try {
      const storedUserId = localStorage.getItem('oneclick_user_id') || 'employer-default';
      const res = await fetch(`http://localhost:8000/auth/register-company?user_id=${storedUserId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `company-${Date.now()}`,
          name: regCompanyName.trim(),
          edrpou: regCompanyEdrpou.trim(),
          address: regCompanyAddress.trim(),
          sphere: regCompanyCategory
        })
      });

      if (res.ok) {
        const companyData = await res.json();
        const fullDetails = `ТОВ «${companyData.name}», ЄДРПОУ ${companyData.edrpou}`;
        setCompanyName(companyData.name);
        setCompanyDetails(fullDetails);
        setNewCompany(companyData.name);
        setIsLoggedIn(true);
        setUserRole('employer');

        const profileData = {
          isLoggedIn: true,
          userRole: 'employer',
          userName,
          userPhone,
          userAvatar,
          isDiiaVerified,
          companyName: companyData.name,
          companyDetails: fullDetails
        };
        localStorage.setItem('oneclick_auth_profile', JSON.stringify(profileData));
        triggerToast(`Компанію «${companyData.name}» успішно зареєстровано! 🏢🚀`);
      } else {
        triggerToast('Помилка реєстрації компанії');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Помилка з’єднання з сервером');
    }
  };

  const handleToggleUserRole = async () => {
    const nextRole = userRole === 'worker' ? 'employer' : 'worker';
    setSelectedShift(null);

    if (nextRole === 'employer') {
      const saved = localStorage.getItem('oneclick_auth_profile');
      let hasCompany = false;
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.companyName && parsed.companyName.trim() !== '') {
            hasCompany = true;
          }
        } catch (e) {
          console.error(e);
        }
      }

      if (!hasCompany && !companyName) {
        // Force them to register company first
        setUserRole('employer');
        setRegRole('employer');
        setAuthStep('company-register');
        setIsLoggedIn(false);
        triggerToast('Будь ласка, спочатку зареєструйте компанію для входу в B2B кабінет.');
        return;
      }
    }

    // Call backend API to update user role
    const storedUserId = localStorage.getItem('oneclick_user_id');
    if (storedUserId) {
      try {
        await fetch(`http://localhost:8000/users/${storedUserId}/role?role=${nextRole}`, {
          method: 'POST'
        });
      } catch (e) {
        console.error('Error toggling user role in backend:', e);
      }
    }

    setUserRole(nextRole);
    if (nextRole === 'employer' && companyName) {
      setNewCompany(companyName);
    }

    const saved = localStorage.getItem('oneclick_auth_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.userRole = nextRole;
        localStorage.setItem('oneclick_auth_profile', JSON.stringify(parsed));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // B2B: Approve and Complete Shift
  const handleApproveShift = async (shiftId: string, price: number) => {
    const employerId = localStorage.getItem('oneclick_user_id') || 'employer-default';
    try {
      const res = await fetch(`http://localhost:8000/shifts/${shiftId}/approve?employer_id=${employerId}`, {
        method: 'POST'
      });
      if (res.ok) {
        triggerToast(`Зміну підтверджено. Заморожені кошти (${price} ₴) успішно виплачено виконавцю! 🔐💸`);
        fetchStateFromBackend();
      } else {
        triggerToast('Помилка підтвердження виплати');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Помилка з’єднання');
    }
  };

  // B2B/B2C: Clean Dispute settlement handlers
  const handleResolveDisputeClean = async (
    shiftId: string,
    resolution: 'pay_full' | 'compromise' | 'refund_full',
    decidedBy: 'employer' | 'arbitrator' = 'employer'
  ) => {
    try {
      const res = await fetch(`http://localhost:8000/disputes/${shiftId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolution: resolution,
          decided_by: decidedBy
        })
      });
      if (res.ok) {
        if (resolution === 'pay_full') {
          triggerToast(`Спір врегульовано. Виконавцю сплачено повну суму! 💸`);
        } else if (resolution === 'compromise') {
          triggerToast(`Угода досягнута! 50% повернуто вам, 50% сплачено виконавцю. 🤝`);
        } else if (resolution === 'refund_full') {
          triggerToast(`Спір вирішено скасуванням. Повну суму повернуто вам! ↩️`);
        }
        fetchDisputeChat(shiftId);
        fetchStateFromBackend();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendDisputeMessage = async (shiftId: string, sender: 'employer' | 'worker') => {
    if (!disputeMessageText.trim()) return;
    try {
      const res = await fetch(`http://localhost:8000/disputes/${shiftId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: disputeMessageText.trim(),
          sender: sender
        })
      });
      if (res.ok) {
        setDisputeMessageText('');
        fetchDisputeChat(shiftId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSummonArbitrator = async (shiftId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/disputes/${shiftId}/summon-arbitrator`, {
        method: 'POST'
      });
      if (res.ok) {
        triggerToast('⚖️ Справу передано Арбітражу OneClick. Почався аналіз фотозвіту!');
        fetchDisputeChat(shiftId);
        fetchStateFromBackend();
      } else {
        triggerToast('Помилка передачі до арбітражу');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendReport = async () => {
    if (!showReportModalId) return;
    const photoUrl = capturedPhoto || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500';
    const comment = reportComment.trim() || 'Роботу виконано в повному обсязі.';

    try {
      const res = await fetch(`http://localhost:8000/shifts/${showReportModalId}/checkout?photo_url=${encodeURIComponent(photoUrl)}&comment=${encodeURIComponent(comment)}`, {
        method: 'POST'
      });
      if (res.ok) {
        triggerToast('Чек-аут виконано! Роботодавець отримав фотозвіт та запит на виплату. 💰');
        setShowReportModalId(null);
        setCapturedPhoto(null);
        setReportComment('');
        fetchStateFromBackend();
      } else {
        triggerToast('Помилка подання звіту');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Помилка з’єднання');
    }
  };

  const handleAddBranch = (name: string, address: string, reqScreening: boolean) => {
    const newBranch = {
      id: `b-${Date.now()}`,
      name: name.trim(),
      address: address.trim(),
      requiresScreening: reqScreening
    };
    setBranches(prev => [...prev, newBranch]);
    triggerToast(`Філію "${name}" успішно додано!`);
  };

  const handleDeleteBranch = (branchId: string) => {
    setBranches(prev => {
      const filtered = prev.filter(b => b.id !== branchId);
      triggerToast('Філію видалено.');
      return filtered;
    });
  };

  const handleDeposit = async (amount: number) => {
    if (amount <= 0) {
      triggerToast('Будь ласка, введіть коректну суму!');
      return;
    }
    const storedUserId = localStorage.getItem('oneclick_user_id') || 'employer-default';
    try {
      const res = await fetch(`http://localhost:8000/users/${storedUserId}/balance?is_deposit=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      if (res.ok) {
        triggerToast('Баланс компанії успішно поповнено! 💰');
        fetchStateFromBackend();
      } else {
        triggerToast('Помилка при поповненні балансу');
      }
    } catch (e) {
      console.error(e);
      triggerToast('Помилка з’єднання');
    }
  };

  const fetchDisputeChat = async (shiftId: string) => {
    try {
      const res = await fetch(`http://localhost:8000/disputes/${shiftId}/chat`);
      if (res.ok) {
        const chatData = await res.json();
        interface BackendDisputeMessage {
          id: string;
          sender: 'system' | 'manager' | 'employer' | 'worker';
          text: string;
          timestamp: string;
        }
        setDisputeChats(prev => ({
          ...prev,
          [shiftId]: chatData.map((m: BackendDisputeMessage) => ({
            id: m.id,
            sender: m.sender,
            text: m.text,
            timestamp: m.timestamp
          }))
        }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!arbitratorModalShiftId) return;
    fetchDisputeChat(arbitratorModalShiftId);
    const interval = setInterval(() => {
      fetchDisputeChat(arbitratorModalShiftId);
    }, 2000);
    return () => clearInterval(interval);
  }, [arbitratorModalShiftId]);

  // Real-time synchronization state
  const [nowDate, setNowDate] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNowDate(new Date());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchStateFromBackend = async () => {
    try {
      // 1. Fetch shifts
      const shiftsRes = await fetch('http://localhost:8000/shifts');
      if (shiftsRes.ok) {
        const shiftsData = await shiftsRes.json();
        interface BackendShift {
          id: string;
          company: string;
          role: string;
          date: string;
          dayName: string;
          time: string;
          duration: string;
          price: number;
          address: string;
          status: 'open' | 'booked' | 'in_progress' | 'pending_approval' | 'disputed' | 'completed';
          category: Shift['category'];
          details?: string;
          work_photo?: string;
          work_comment?: string;
          dispute_reason?: string;
          dispute_comment?: string;
          dispute_status?: 'under_review' | 'pending_settlement';
          volunteer_reward?: string;
          worker_id?: string | null;
          is_hot?: boolean;
          requires_screening?: boolean;
          template_name?: string;
          latitude?: number;
          longitude?: number;
        }
        const mapped = shiftsData.map((item: BackendShift) => ({
          id: item.id,
          company: item.company,
          role: item.role,
          date: item.date,
          dayName: item.dayName,
          time: item.time,
          duration: item.duration,
          price: item.price,
          address: item.address,
          status: item.status,
          category: item.category,
          details: item.details || '',
          workPhoto: item.work_photo || undefined,
          workComment: item.work_comment || undefined,
          disputeReason: item.dispute_reason || undefined,
          disputeComment: item.dispute_comment || undefined,
          disputeStatus: item.dispute_status || undefined,
          volunteerReward: item.volunteer_reward || undefined,
          worker_id: item.worker_id || null,
          isHot: item.is_hot || false,
          requiresScreening: item.requires_screening || false,
          templateName: item.template_name || undefined,
          latitude: item.latitude || undefined,
          longitude: item.longitude || undefined,
          requirements: ['Охайний вигляд', 'Наявність документів']
        }));
        setShifts(mapped);
      }

      // 2. Fetch profile if logged in
      const storedUserId = localStorage.getItem('oneclick_user_id');
      if (storedUserId) {
        const userRes = await fetch(`http://localhost:8000/users/${storedUserId}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          setUserName(userData.name);
          setUserPhone(userData.phone);
          setUserRole(userData.role);
          setIsDiiaVerified(userData.is_verified);
          if (userData.avatar) setUserAvatar(userData.avatar);
          
          if (userData.company_name) {
            setCompanyName(userData.company_name);
          } else {
            setCompanyName('');
          }
          if (userData.company_details) {
            setCompanyDetails(userData.company_details);
          } else {
            setCompanyDetails('');
          }

          setBalance(userData.balance || 0);
          setEmployerBalance(userData.employer_balance || 0);

          // Fetch transactions
          const txRes = await fetch(`http://localhost:8000/users/${storedUserId}/transactions`);
          if (txRes.ok) {
            const txData = await txRes.json();
            interface BackendTransaction {
              id: string;
              title: string;
              amount: number;
              date: string;
              status: 'completed' | 'processing';
              type: 'work' | 'withdrawal';
            }
            setTransactions(txData.map((tx: BackendTransaction) => ({
              id: tx.id,
              title: tx.title,
              amount: tx.amount,
              date: tx.date,
              status: tx.status,
              type: tx.type
            })));
          }
        } else if (userRes.status === 404) {
          console.warn("User not found in database, logging out...");
          handleSignOut();
        }
      }
    } catch (e) {
      console.error('Error fetching state from backend:', e);
    }
  };

  // Local Session & API sync on mount
  useEffect(() => {
    const readStorage = () => {
      const saved = localStorage.getItem('oneclick_auth_profile');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.isLoggedIn) {
            setIsLoggedIn(true);
            setUserRole(parsed.userRole || 'worker');
            setUserName(parsed.userName || '');
            setUserPhone(parsed.userPhone || '');
            setUserAvatar(parsed.userAvatar || '');
            setIsDiiaVerified(parsed.isDiiaVerified || false);
            if (parsed.companyName) setCompanyName(parsed.companyName);
            if (parsed.companyDetails) setCompanyDetails(parsed.companyDetails);
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    
    window.queueMicrotask(readStorage);
    fetchStateFromBackend();
    
    // Polling interval
    const interval = setInterval(fetchStateFromBackend, 4000);
    return () => clearInterval(interval);
  }, []);

  // Helper to generate calendar days dynamically starting from today
  const calendarDays = useMemo<UkCalendarDay[]>(() => {
    const ukDays = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(nowDate.getTime());
      d.setDate(d.getDate() + i);
      days.push({
        day: ukDays[d.getDay()],
        date: String(d.getDate())
      });
    }
    return days;
  }, [nowDate]);

  // --- FILTERED DATA FOR FEED ---
  const feedShifts = useMemo(() => {
    const filtered = shifts.filter(s => {
      const matchStatus = s.status === 'open';
      const matchDate = s.date === selectedDate;
      const matchCat = selectedCategory === 'Всі' || s.category === selectedCategory;
      const matchSearch =
        s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.address.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchDate && matchCat && matchSearch;
    });

    const mapped = filtered.map(s => {
      const hours = getHoursRemaining(s, selectedDate, simulateDeadline, nowDate);
      const isUrgent = hours > 0 && hours <= 2;
      if (isUrgent || s.isHot) {
        return {
          ...s,
          isHot: true
        };
      }
      return s;
    });

    return [...mapped].sort((a, b) => {
      const aHours = getHoursRemaining(a, selectedDate, simulateDeadline, nowDate);
      const bHours = getHoursRemaining(b, selectedDate, simulateDeadline, nowDate);

      const aUrgent = aHours > 0 && aHours <= 2 ? 1 : 0;
      const bUrgent = bHours > 0 && bHours <= 2 ? 1 : 0;

      if (aUrgent !== bUrgent) {
        return bUrgent - aUrgent;
      }

      if (aUrgent && bUrgent) {
        return aHours - bHours;
      }

      const aHot = a.isHot ? 1 : 0;
      const bHot = b.isHot ? 1 : 0;
      return bHot - aHot;
    });
  }, [shifts, selectedDate, selectedCategory, searchQuery, simulateDeadline, nowDate]);

  return {
    isLoggedIn,
    setIsLoggedIn,
    userName,
    setUserName,
    userPhone,
    setUserPhone,
    userAvatar,
    setUserAvatar,
    isDiiaVerified,
    setIsDiiaVerified,
    showAgreementModal,
    setShowAgreementModal,
    agreedToTerms,
    setAgreedToTerms,
    showAvatarEditModal,
    setShowAvatarEditModal,
    arbitratorModalShiftId,
    setArbitratorModalShiftId,
    companyName,
    setCompanyName,
    companyDetails,
    setCompanyDetails,
    isEditingCompany,
    setIsEditingCompany,
    tempCompanyName,
    setTempCompanyName,
    tempCompanyDetails,
    setTempCompanyDetails,
    authStep,
    setAuthStep,
    regRole,
    setRegRole,
    regCompanyName,
    setRegCompanyName,
    regCompanyEdrpou,
    setRegCompanyEdrpou,
    regCompanyAddress,
    setRegCompanyAddress,
    regCompanyCategory,
    setRegCompanyCategory,
    tempPhone,
    setTempPhone,
    tempName,
    setTempName,
    smsCode,
    setSmsCode,
    expectedSmsCode,
    setExpectedSmsCode,
    theme,
    setTheme,
    shifts,
    setShifts,
    userRole,
    setUserRole,
    activeTab,
    setActiveTab,
    b2bTab,
    setB2bTab,
    balance,
    setBalance,
    rating,
    transactions,
    setTransactions,
    employerBalance,
    setEmployerBalance,
    employerFrozenBalance,
    selectedShift,
    setSelectedShift: handleSelectShift,
    signedContract,
    setSignedContract,
    showQRModal,
    setShowQRModal,
    showScannerModal,
    setShowScannerModal,
    showCancelModal,
    setShowCancelModal,
    showB2BQRModalId,
    setShowB2BQRModalId,
    showDisputeModalId,
    setShowDisputeModalId,
    disputeReasonInput,
    setDisputeReasonInput,
    disputeCommentInput,
    setDisputeCommentInput,
    collapsedDisputes,
    setCollapsedDisputes,
    disputeChats,
    setDisputeChats,
    disputeMessageText,
    setDisputeMessageText,
    showReportModalId,
    setShowReportModalId,
    capturedPhoto,
    setCapturedPhoto,
    reportComment,
    setReportComment,
    isTakingPhoto,
    setIsTakingPhoto,
    simulateDeadline,
    setSimulateDeadline,
    selectedDate,
    setSelectedDate,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    profileSubPage,
    setProfileSubPage,
    newRole,
    setNewRole,
    isRoleComboOpen,
    setIsRoleComboOpen,
    newCompany,
    setNewCompany,
    newDate,
    setNewDate,
    newTime,
    setNewTime,
    newDuration,
    setNewDuration,
    newPrice,
    setNewPrice,
    newAddress,
    setNewAddress,
    newDetails,
    setNewDetails,
    newCategory,
    setNewCategory,
    myShiftsSubTab,
    setMyShiftsSubTab,
    toast,
    triggerToast,
    activeFeedbackShiftId,
    setActiveFeedbackShiftId,
    feedbackRating,
    setFeedbackRating,
    feedbackComment,
    setFeedbackComment,
    nowDate,
    calendarDays,
    feedShifts,
    handleSignOut,
    handleSubmitFeedback,
    handleWithdraw,
    handleSimulateScan,
    handleCheckoutShift,
    handleBookShift,
    handleCancelShift,
    handleCreateShift,
    handleAvatarFileChange,
    handleLoginSuccess,
    handleRegisterCompanySubmit,
    handleToggleUserRole,
    handleApproveShift,
    handleResolveDisputeClean,
    handleSendDisputeMessage,
    handleSummonArbitrator,
    handleSendReport,
    
    requiresScreening,
    setRequiresScreening,
    branches,
    setBranches,
    selectedBranchId,
    setSelectedBranchId: handleSelectBranch,
    handleAddBranch,
    handleDeleteBranch,
    handleDeposit
  };
}
