'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  Wallet,
  User,
  Briefcase,
  PlusCircle,
  CheckCircle,
  ArrowLeft,
  QrCode,
  FileText,
  MapPin,
  Clock,
  Building,
  Info,
  ChevronRight,
  TrendingUp,
  Award,
  Bell,
  SlidersHorizontal,
  LogOut,
  Settings,
  HelpCircle,
  ShieldCheck,
  TrendingDown,
  Star,
  Camera
} from 'lucide-react';

// --- TYPES ---
interface Review {
  id: string;
  workerName: string;
  rating: number;
  date: string;
  comment: string;
}

interface Shift {
  id: string;
  company: string;
  role: string;
  date: string;
  dayName: string;
  time: string;
  duration: string;
  price: number;
  address: string;
  status: 'open' | 'booked' | 'in_progress' | 'pending_approval' | 'completed';
  category: 'Кава' | 'Рітейл' | 'Склади';
  logo?: string;
  isHot?: boolean;
  details?: string;
  requirements?: string[];
  reviews?: Review[];
  hasFeedback?: boolean;
  allowFeedback?: boolean;
  workPhoto?: string;
  workComment?: string;
}

interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  status: 'completed' | 'processing';
  type: 'work' | 'withdrawal';
}

// --- INITIAL MOCK DATA ---
const INITIAL_SHIFTS: Shift[] = [
  {
    id: '1',
    company: 'Rozetka',
    role: 'Комплектувальник',
    date: '15',
    dayName: 'Пн',
    time: '08:00 — 20:00',
    duration: '12 год',
    price: 1800,
    address: 'Київ, вул. Маршала Малиновського, 12',
    status: 'open',
    category: 'Склади',
    logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&auto=format&fit=crop&q=60',
    isHot: true,
    details: 'Збір та пакування інтернет-замовлень за допомогою ТЗД (терміналу збору даних) на теплому складі.',
    requirements: ['Фізична витривалість', 'Вміння працювати зі смартфоном'],
    reviews: [
      { id: 'r1', workerName: 'Дмитро К.', rating: 5, date: '10.06.2026', comment: 'Теплий склад, чудовий бригадир. Виплатили гроші через 5 хвилин після закінчення зміни!' },
      { id: 'r2', workerName: 'Ольга С.', rating: 4, date: '08.06.2026', comment: 'Робота на ногах, трохи втомлюєшся. Але умови супер, є безкоштовна кава та чай в обід.' }
    ]
  },
  {
    id: '2',
    company: 'Aroma Kava',
    role: 'Бариста',
    date: '15',
    dayName: 'Пн',
    time: '09:00 — 21:00',
    duration: '12 год',
    price: 950,
    address: 'Київ, Хрещатик, 24',
    status: 'open',
    category: 'Кава',
    logo: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=100&auto=format&fit=crop&q=60',
    isHot: false,
    details: 'Приготування класичних кавових напоїв, робота з касою Poster, підтримання чистоти за баром.',
    requirements: ['Наявність санітарної книжки', 'Досвід роботи баристою від 6 місяців'],
    allowFeedback: false,
    reviews: [
      { id: 'r3', workerName: 'Аліна М.', rating: 5, date: '12.06.2026', comment: 'Дуже привітний менеджер та дружній колектив. Потік клієнтів великий, але час пролітає непомітно.' },
      { id: 'r4', workerName: 'Сергій П.', rating: 5, date: '05.06.2026', comment: 'Локація в самому центрі, зручно діставатися. Оплата день в день без затримок.' }
    ]
  },
  {
    id: '3',
    company: 'Glovo',
    role: 'Кур\'єр',
    date: '16',
    dayName: 'Вт',
    time: '12:00 — 22:00',
    duration: '10 год',
    price: 1500,
    address: 'Київ, Приморський бульвар, 1',
    status: 'open',
    category: 'Склади',
    isHot: true,
    details: 'Доставка замовлень з ресторанів та супермаркетів у межах району на власному транспорті.',
    requirements: ['Власний транспорт', 'Наявність смартфона'],
    reviews: [
      { id: 'r5', workerName: 'Ігор Т.', rating: 4, date: '11.06.2026', comment: 'Багато замовлень у вечірні години, робота активна. Техпідтримка відповідає оперативно.' }
    ]
  },
  {
    id: '4',
    company: 'Нова Пошта',
    role: 'Вантажник',
    date: '17',
    dayName: 'Ср',
    time: '18:00 — 02:00',
    duration: '8 год',
    price: 1100,
    address: 'Київ, вул. Броварська, 15',
    status: 'open',
    category: 'Склади',
    isHot: false,
    details: 'Розвантаження та завантаження автомобілів компанії, сортування посилок по напрямках.',
    requirements: ['Дисциплінованість', 'Хороша фізична форма'],
    reviews: [
      { id: 'r6', workerName: 'Павло Р.', rating: 4, date: '07.06.2026', comment: 'Важка фізична праця, але оплата чесна та вчасна. Склад чистий і добре освітлений.' }
    ]
  }
];

export default function OneClickApp() {
  // --- STATE ---
  const [theme, setTheme] = useState<'light' | 'dark'>('light'); // Theme switcher (light default)
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [userRole, setUserRole] = useState<'worker' | 'employer'>('worker');
  const [activeTab, setActiveTab] = useState<'feed' | 'my-shifts' | 'wallet' | 'profile'>('feed');
  const [b2bTab, setB2bTab] = useState<'dashboard' | 'create'>('dashboard');

  // Worker profile & wallet
  const [balance, setBalance] = useState<number>(0);
  const [rating] = useState<number>(5.0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Employer conceptual balance
  const [employerBalance, setEmployerBalance] = useState<number>(50000);
  const [employerFrozenBalance, setEmployerFrozenBalance] = useState<number>(0);

  // Temporary screen states
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [signedContract, setSignedContract] = useState<boolean>(false);
  const [showQRModal, setShowQRModal] = useState<string | null>(null);
  const [showScannerModal, setShowScannerModal] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<string | null>(null);
  
  // B2B Venue QR code Display
  const [showB2BQRModalId, setShowB2BQRModalId] = useState<string | null>(null);

  // B2C Work Report & Photo upload states
  const [showReportModalId, setShowReportModalId] = useState<string | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [reportComment, setReportComment] = useState<string>('');
  const [isTakingPhoto, setIsTakingPhoto] = useState<boolean>(false);
  const [simulateDeadline, setSimulateDeadline] = useState<boolean>(false);


  // B2C Feed filters
  const [selectedDate, setSelectedDate] = useState<string>('14');
  const [selectedCategory, setSelectedCategory] = useState<string>('Всі');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // B2C Profile subpage control
  const [profileSubPage, setProfileSubPage] = useState<'main' | 'personal' | 'docs' | 'help' | 'developer'>('main');

  // Form states for B2B shift publishing
  const [newRole, setNewRole] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newDate, setNewDate] = useState('14');
  const [newTime, setNewTime] = useState('08:00 — 20:00');
  const [newDuration, setNewDuration] = useState('12 год');
  const [newPrice, setNewPrice] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newDetails, setNewDetails] = useState('');
  const [newCategory, setNewCategory] = useState<'Кава' | 'Рітейл' | 'Склади'>('Кава');

  // Active / History subtab inside B2C "My Shifts"
  const [myShiftsSubTab, setMyShiftsSubTab] = useState<'active' | 'history'>('active');

  // Toast notifications
  const [toast, setToast] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // B2C Feedback states
  const [activeFeedbackShiftId, setActiveFeedbackShiftId] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState<string>('');

  const handleSubmitFeedback = (shiftId: string) => {
    if (!feedbackComment.trim()) {
      triggerToast('Будь ласка, напишіть текст відгуку!');
      return;
    }
    setShifts(prev =>
      prev.map(s => {
        if (s.id === shiftId) {
          const newReview = {
            id: `r-user-${Date.now()}`,
            workerName: 'Олексій К.',
            rating: feedbackRating,
            date: 'Сьогодні',
            comment: feedbackComment.trim()
          };
          return {
            ...s,
            hasFeedback: true,
            reviews: [newReview, ...(s.reviews || [])]
          };
        }
        return s;
      })
    );
    setActiveFeedbackShiftId(null);
    setFeedbackComment('');
    setFeedbackRating(5);
    triggerToast('Дякуємо за ваш відгук!');
  };

  const handleSimulateScan = (shiftId: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return;

    if (employerBalance < shift.price) {
      triggerToast('У роботодавця недостатньо коштів для гарантування оплати!');
      return;
    }

    setShifts(prev =>
      prev.map(s => (s.id === shiftId ? { ...s, status: 'in_progress' as const } : s))
    );
    
    // Freeze the payment amount
    setEmployerBalance(prev => prev - shift.price);
    setEmployerFrozenBalance(prev => prev + shift.price);
    
    setShowScannerModal(null);
    triggerToast('Зміну розпочато! 🔐 Кошти для оплати успішно заблоковано на сейфі.');
  };

  const handleCheckoutShift = (shiftId: string) => {
    setShifts(prev =>
      prev.map(s => (s.id === shiftId ? { ...s, status: 'pending_approval' as const } : s))
    );
    triggerToast('Чек-аут виконано! Роботодавець отримав запит на виплату. 💰');
  };

  // --- ACTIONS ---

  // B2C: Book Shift
  const handleBookShift = (shiftId: string) => {
    if (!signedContract) {
      triggerToast('Будь ласка, підпишіть договір через Дію!');
      return;
    }
    // Find if the shift is currently hot due to deadline simulation
    const actualShift = feedShifts.find(s => s.id === shiftId);
    const finalPrice = actualShift ? actualShift.price : 0;
    const isHotNow = actualShift ? actualShift.isHot : false;

    setShifts(prev =>
      prev.map(s => s.id === shiftId ? { ...s, status: 'booked' as const, price: finalPrice, isHot: isHotNow } : s)
    );
    setSelectedShift(null);
    setSignedContract(false);
    triggerToast('Зміну успішно заброньовано!');
  };

  // B2C: Cancel Shift
  const handleCancelShift = (shiftId: string, isUrgent: boolean) => {
    setShifts(prev =>
      prev.map(s => s.id === shiftId ? { ...s, status: 'open' as const } : s)
    );
    if (isUrgent) {
      setBalance(prev => prev - 250);
      setTransactions(prev => [
        {
          id: String(Date.now()),
          title: 'Штраф за термінову відмову від зміни',
          amount: -250,
          date: 'Сьогодні, щойно',
          status: 'completed',
          type: 'withdrawal'
        },
        ...prev
      ]);
      triggerToast('Термінова відмова: нараховано штраф 250 ₴!');
    } else {
      triggerToast('Зміну скасовано заздалегідь без штрафу.');
    }
    setShowCancelModal(null);
  };


  // B2B: Create Shift
  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole || !newCompany || !newPrice || !newAddress) {
      triggerToast('Заповніть всі обов\'язкові поля!');
      return;
    }
    if (!newDetails.trim()) {
      triggerToast('Введіть опис обов\'язків та завдань для смени!');
      return;
    }

    const created: Shift = {
      id: String(Date.now()),
      company: newCompany,
      role: newRole,
      date: newDate,
      dayName: newDate === '15' ? 'Пн' : newDate === '16' ? 'Вт' : newDate === '17' ? 'Ср' : 'Чт',
      time: newTime,
      duration: newDuration,
      price: Number(newPrice),
      address: newAddress,
      status: 'open',
      category: newCategory,
      details: newDetails,
      requirements: ['Охайний вигляд', 'Наявність документов']
    };

    setShifts(prev => [created, ...prev]);
    setNewRole('');
    setNewCompany('');
    setNewPrice('');
    setNewAddress('');
    setNewDetails('');
    setB2bTab('dashboard');
    triggerToast('Зміну опубліковано!');
  };

  // B2B: Approve and Complete Shift
  const handleApproveShift = (shiftId: string, price: number, roleName: string, companyName: string) => {
    setShifts(prev =>
      prev.map(s => s.id === shiftId ? { ...s, status: 'completed' as const } : s)
    );

    setEmployerFrozenBalance(prev => Math.max(0, prev - price));
    setBalance(prev => prev + price);

    setTransactions(prev => [
      {
        id: String(Date.now()),
        title: `Зміна: ${roleName} (${companyName})`,
        amount: price,
        date: 'Сьогодні, щойно',
        status: 'completed',
        type: 'work'
      },
      ...prev
    ]);
    triggerToast(`Зміну підтверджено. Заморожені кошти (${price} ₴) успішно виплачено виконавцю! 🔐💸`);
  };

  // Real-time synchronization state
  const [nowDate, setNowDate] = useState<Date>(new Date());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setNowDate(new Date());
    }, 5000); // Update every 5 seconds for real-time countdown updates
    return () => clearInterval(interval);
  }, []);

  // Helper to calculate hours remaining to shift start
  const getHoursRemaining = (shift: Shift): number => {
    const now = nowDate;
    const shiftDay = parseInt(shift.date, 10);
    const startTimeStr = shift.time.split('—')[0].trim(); // e.g. "08:00" or "09:00"
    const [hour, minute] = startTimeStr.split(':').map(Number);

    // Construct shift start datetime
    const shiftStart = new Date(now.getFullYear(), now.getMonth(), shiftDay, hour, minute, 0, 0);

    let referenceTime = now;
    if (simulateDeadline && shift.date === selectedDate) {
      // Simulation: assume current time is exactly 7:30 AM on the selected date
      referenceTime = new Date(now.getFullYear(), now.getMonth(), parseInt(selectedDate, 10), 7, 30, 0, 0);
    }

    const diffMs = shiftStart.getTime() - referenceTime.getTime();
    return diffMs / (1000 * 60 * 60);
  };

  // Helper to format remaining time nicely
  const formatRemainingTime = (hours: number): string => {
    if (hours <= 0) return 'Почалася';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h === 0) return `Залишилось ${m} хв`;
    return `Залишилось ${h} год ${m} хв`;
  };

  // --- FILTERED DATA FOR FEED ---
  const feedShifts = useMemo(() => {
    // 1. Filter shifts
    const filtered = shifts.filter(s => {
      const matchStatus = s.status === 'open';
      const matchDate = s.date === selectedDate;
      const matchCat = selectedCategory === 'Всі' || s.category === selectedCategory;
      const matchSearch = s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.address.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchDate && matchCat && matchSearch;
    });

    // 2. Map hot flag dynamically if hours remaining is <= 2
    const mapped = filtered.map(s => {
      const hours = getHoursRemaining(s);
      const isUrgent = hours > 0 && hours <= 2;
      if (isUrgent || s.isHot) {
        return {
          ...s,
          isHot: true
        };
      }
      return s;
    });

    // 3. Sort hot/urgent shifts to the top
    return [...mapped].sort((a, b) => {
      const aHours = getHoursRemaining(a);
      const bHours = getHoursRemaining(b);

      const aUrgent = aHours > 0 && aHours <= 2 ? 1 : 0;
      const bUrgent = bHours > 0 && bHours <= 2 ? 1 : 0;

      if (aUrgent !== bUrgent) {
        return bUrgent - aUrgent; // urgent shifts first
      }

      if (aUrgent && bUrgent) {
        return aHours - bHours; // sort by less time remaining first
      }

      const aHot = a.isHot ? 1 : 0;
      const bHot = b.isHot ? 1 : 0;
      return bHot - aHot;
    });
  }, [shifts, selectedDate, selectedCategory, searchQuery, simulateDeadline, nowDate]);


  return (
    <div className="h-[100dvh] md:h-auto w-screen bg-[#070913] text-[#1c1b1b] font-sans flex items-center justify-center p-0 md:p-6 transition-colors duration-300 overflow-hidden">

      {/* Global CSS animations style with modern scale, blur, and liquid blobs */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes modernFadeIn {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.97);
            filter: blur(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
        @keyframes modalScaleIn {
          from {
            opacity: 0;
            transform: scale(0.94);
            filter: blur(18px);
          }
          to {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
        }
        @keyframes floatBlob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(25px, -50px) scale(1.2);
          }
          66% {
            transform: translate(-35px, 35px) scale(0.85);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-fade-in {
          animation: modernFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-modal-in {
          animation: modalScaleIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-blob {
          animation: floatBlob 14s infinite alternate ease-in-out;
        }
        .animation-delay-2000 {
          animation-delay: 2.5s;
        }
        .animation-delay-4000 {
          animation-delay: 5s;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />

      {/* Mobile-first Mockup Frame (Darker background in light theme for better contrast) */}
      <div className={`w-full max-w-[450px] h-[100dvh] md:h-[850px] md:min-h-[850px] md:max-h-[850px] md:rounded-[42px] md:shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col relative border-none md:border-[8px] md:border-[#0f1424] transition-colors duration-300 ${theme === 'light' ? 'bg-[#eae5e0]' : 'bg-[#0b0f19]'
        }`}>

        {/* LIQUID GLASS: Background animated blobs floating behind everything */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-10 -left-10 w-64 h-64 rounded-full bg-[#FF5722]/22 dark:bg-[#FF5722]/18 blur-[50px] animate-blob"></div>
          <div className="absolute top-[280px] -right-16 w-72 h-72 rounded-full bg-blue-500/24 dark:bg-blue-600/16 blur-[55px] animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-12 -left-16 w-64 h-64 rounded-full bg-purple-500/22 dark:bg-purple-600/16 blur-[50px] animate-blob animation-delay-4000"></div>
        </div>

        {/* Toast notifications */}
        {toast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[9999] bg-[#001B3D]/75 backdrop-blur-[24px] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2 border border-white/10 text-xs font-semibold max-w-[85%] text-center animate-bounce">
            <span className="w-2 h-2 rounded-full bg-[#FF5722] inline-block"></span>
            {toast}
          </div>
        )}

        {/* --- HEADER (Liquid glass styling with lower opacity & high blur) --- */}
        <header className={`px-4 py-4 flex items-center justify-between sticky top-0 z-40 border-b transition-all duration-300 ${theme === 'light'
          ? 'bg-white/70 border-black/10 text-[#001B3D]'
          : 'bg-[#0f172a]/70 border-white/10 text-white'
          } backdrop-blur-[24px]`}>
          <div className="flex items-center gap-2 relative z-10">
            <div className="w-9 h-9 bg-gradient-to-br from-[#FF5722] to-[#e64a19] rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-[0_4px_10px_rgba(255,87,34,0.3)]">
              1C
            </div>
            <span className="font-black text-lg uppercase tracking-tight">OneClick</span>
          </div>

          <div className="flex items-center gap-2.5 relative z-10">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
              className={`p-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center border ${theme === 'light'
                ? 'bg-white/70 hover:bg-white border-black/10 text-[#001B3D]'
                : 'bg-[#1c2541]/60 hover:bg-[#252f55]/80 border-white/10 text-white'
                } backdrop-blur-[24px]`}
              title="Переключити тему"
            >
              {theme === 'light' ? (
                <svg className="w-4 h-4 text-[#FF5722]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-[#FF5722]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* B2C/B2B Switcher */}
            <button
              onClick={() => {
                setUserRole(prev => prev === 'worker' ? 'employer' : 'worker');
                setSelectedShift(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[11px] font-bold transition-all active:scale-95 border ${theme === 'light'
                ? 'bg-white/70 hover:bg-white border-black/10 text-[#001B3D]'
                : 'bg-[#1c2541]/60 hover:bg-[#252f55]/80 border-white/10 text-white'
                } backdrop-blur-[24px]`}
            >
              {userRole === 'worker' ? (
                <>
                  <Building className="w-3.5 h-3.5 text-[#FF5722]" />
                  <span>Бізнес (B2B)</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-[#FF5722]" />
                  <span>Шукач (B2C)</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* --- MAIN PAGE CONTENT (Layered relative z-10 above background liquid blobs) --- */}
        <div className="flex-1 overflow-y-auto pb-28 no-scrollbar relative z-10">

          {/* ========================================================= */}
          {/* ===================== WORKER VIEW (B2C) ================= */}
          {/* ========================================================= */}
          {userRole === 'worker' && (
            <>
              {/* 1. SHIFT FEED TAB */}
              {activeTab === 'feed' && !selectedShift && (
                <div className="animate-fade-in">

                  {/* Search and Filters Trigger */}
                  <div className="p-4 flex gap-2">
                    <div className={`rounded-full shadow-sm border flex items-center px-4 py-2.5 gap-2.5 flex-1 transition-all ${theme === 'light'
                      ? 'bg-white/70 border-[#E5E7EB]'
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
                    {[
                      { day: 'Нд', date: '14' },
                      { day: 'Пн', date: '15' },
                      { day: 'Вт', date: '16' },
                      { day: 'Ср', date: '17' },
                      { day: 'Чт', date: '18' },
                      { day: 'Пт', date: '19' }
                    ].map((d) => (
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
                              <span className="text-xl font-extrabold text-[#FF5722]">{s.price} ₴</span>
                              <p className={`text-[9px] font-bold uppercase tracking-wider ${theme === 'light' ? 'text-[#5b4039]/70' : 'text-gray-400'
                                }`}>за зміну</p>
                            </div>
                          </div>

                          <div className={`mt-4 pt-3.5 border-t flex items-center justify-between text-xs font-semibold relative z-10 ${theme === 'light' ? 'border-gray-100 text-[#001B3D]' : 'border-white/5 text-white'
                            }`}>
                            <span className={`flex items-center gap-1.5 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>
                              <Clock className="w-4 h-4 text-[#FF5722]" />
                              {s.time} ({s.duration})
                            </span>
                            {(() => {
                              const hrs = getHoursRemaining(s);
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
                        <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-50" />
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
                          <p className={`text-sm font-bold mt-0.5 ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>{selectedShift.date} Червня</p>
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
                          <p className="text-[10px] text-[#FF5722] uppercase tracking-wider font-bold">Виплата</p>
                          <p className="text-lg font-black text-[#FF5722] mt-0.5">{selectedShift.price} ₴</p>
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
                                "{rev.comment}"
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
                        ? (s.status === 'booked' || s.status === 'in_progress' || s.status === 'pending_approval')
                        : s.status === 'completed';
                      return isMatchSubTab;
                    }).length > 0 ? (
                      shifts.filter(s => {
                        const isMatchSubTab = myShiftsSubTab === 'active'
                          ? (s.status === 'booked' || s.status === 'in_progress' || s.status === 'pending_approval')
                          : s.status === 'completed';
                        return isMatchSubTab;
                      }).map((s) => {
                        const isFuture = parseInt(s.date) > 14;
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
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border ${
                                s.status === 'completed' ? 'bg-[#10B981]/8 text-[#10B981] border-[#10B981]/20' :
                                s.status === 'in_progress' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                s.status === 'pending_approval' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                'bg-[#FF9500]/8 text-[#FF9500] border-[#FF9500]/20'
                                }`}>
                                {s.status === 'completed' && 'Виплачено'}
                                {s.status === 'booked' && 'Заброньовано'}
                                {s.status === 'in_progress' && 'Працюю'}
                                {s.status === 'pending_approval' && 'На підтвердженні'}
                              </span>
                              <h4 className={`text-base font-extrabold mt-2 leading-tight ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'
                                }`}>{s.role}</h4>
                              <p className={`text-xs font-bold mt-0.5 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'
                                }`}>{s.company}</p>
                            </div>
                            <div className="text-right">
                              <span className={`text-base font-extrabold ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>{s.price} ₴</span>
                            </div>
                          </div>

                          <div className={`mt-4 pt-3.5 border-t space-y-2 text-xs font-semibold ${theme === 'light' ? 'border-gray-100 text-[#5b4039]' : 'border-white/5 text-gray-300'
                            }`}>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-[#FF5722]" />
                              <span>{s.date} Червня • {s.time} ({s.duration})</span>
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
                                  <div className={`p-3 rounded-2xl border flex items-start gap-2 text-[11px] font-bold mb-2 ${
                                    theme === 'light'
                                      ? 'bg-amber-50 border-amber-200 text-amber-855'
                                      : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                                  }`}>
                                    <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                    <span>Зміна заблокована. Ви не можете розпочати її завчасно (початок {s.date} червня).</span>
                                  </div>
                                  <button
                                    onClick={() => triggerToast(`Не можна почати зміну завчасно. Вона запланована на ${s.date} червня.`)}
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
                                className="w-full border border-red-500/35 hover:border-red-500/50 bg-red-500/5 text-red-500 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                              >
                                Відмовитись від зміни
                              </button>
                            </div>
                          )}

                          {s.status === 'in_progress' && (
                            <div className="mt-3.5 space-y-2">
                              <div className={`p-3 rounded-2xl border flex items-start gap-2 text-[11px] font-bold mb-2 animate-pulse ${
                                theme === 'light'
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
                              <div className={`p-3 rounded-2xl border flex items-start gap-2 text-[11px] font-bold ${
                                theme === 'light'
                                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                                  : 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                              }`}>
                                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <span>Зміну завершено. Очікується підтвердження та виплата від роботодавця.</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                    ) : (
                      <div className={`rounded-3xl border border-dashed p-10 text-center transition-all backdrop-blur-[12px] ${theme === 'light' ? 'bg-white/80 border-[#E5E7EB] text-[#001B3D]' : 'bg-[#1c2541]/40 border-white/10 text-gray-400'
                        }`}>
                        <Calendar className="w-8 h-8 mx-auto mb-1 opacity-55" />
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
                          onClick={() => {
                            if (balance <= 0) {
                              triggerToast('Немає коштів для виведення!');
                              return;
                            }
                            setBalance(0);
                            setTransactions(prev => [
                              { id: String(Date.now()), title: 'Вивід на картку', amount: -balance, date: 'Сьогодні, щойно', status: 'processing', type: 'withdrawal' },
                              ...prev
                            ]);
                            triggerToast('Виведення коштів успішно ініційовано!');
                          }}
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
                      <button className="text-[#FF5722] text-xs font-bold hover:underline">Фільтри</button>
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
                          <TrendingUp className="w-7 h-7 mx-auto mb-1 opacity-55" />
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

                        <div className="relative mb-3">
                          <img
                            alt="User Avatar"
                            className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover"
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                          />
                          <div className="absolute bottom-0 right-0 bg-[#10B981] text-white p-0.5 rounded-full border-2 border-white flex items-center justify-center">
                            <CheckCircle className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>

                        <h2 className={`text-lg font-bold ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Олексій Коваленко</h2>

                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border my-2 ${theme === 'light'
                          ? 'bg-blue-50 border-blue-100 text-blue-800'
                          : 'bg-blue-500/10 border-blue-500/20 text-blue-300'
                          }`}>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black italic ${theme === 'light' ? 'bg-[#001B3D] text-[#FF5722]' : 'bg-white text-[#FF5722]'}`}>Дія</span>
                          <span className="text-[10px] font-bold">Верифіковано через Дію</span>
                        </div>

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
                              <span className={`text-[10px] ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>ПІБ, телефон, адреса</span>
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`} />
                        </div>

                        <div
                          onClick={() => setProfileSubPage('docs')}
                          className={`rounded-2xl p-4 flex items-center justify-between border cursor-pointer transition-all backdrop-blur-[12px] ${theme === 'light' ? 'bg-white/85 border-[#E5E7EB] hover:bg-white' : 'bg-[#1c2541]/45 border-white/10 hover:bg-[#252f55]/60'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${theme === 'light' ? 'bg-orange-50 text-[#FF5722]' : 'bg-[#FF5722]/10 text-[#FF5722]'}`}>
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <p className={`text-xs font-bold ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Документи</p>
                              <span className={`text-[10px] ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>Паспорт, Санкнижка</span>
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`} />
                        </div>

                        <div
                          onClick={() => setProfileSubPage('help')}
                          className={`rounded-2xl p-4 flex items-center justify-between border cursor-pointer transition-all backdrop-blur-[12px] ${theme === 'light' ? 'bg-white/85 border-[#E5E7EB] hover:bg-white' : 'bg-[#1c2541]/45 border-white/10 hover:bg-[#252f55]/60'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${theme === 'light' ? 'bg-purple-50 text-purple-600' : 'bg-purple-500/10 text-purple-400'}`}>
                              <HelpCircle className="w-4 h-4" />
                            </div>
                            <div>
                              <p className={`text-xs font-bold ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Центр допомоги</p>
                              <span className={`text-[10px] ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>FAQ та підтримка</span>
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`} />
                        </div>

                        <div
                          onClick={() => setProfileSubPage('developer')}
                          className={`rounded-2xl p-4 flex items-center justify-between border cursor-pointer transition-all backdrop-blur-[12px] ${theme === 'light' ? 'bg-white/85 border-[#E5E7EB] hover:bg-white' : 'bg-[#1c2541]/45 border-white/10 hover:bg-[#252f55]/60'
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${theme === 'light' ? 'bg-red-50 text-red-500' : 'bg-red-500/10 text-red-400'}`}>
                              <Settings className="w-4 h-4" />
                            </div>
                            <div>
                              <p className={`text-xs font-bold ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Для розробника</p>
                              <span className={`text-[10px] ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>Панель симуляції та налаштувань</span>
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`} />
                        </div>
                      </nav>

                      <button
                        onClick={() => triggerToast('Вихід з акаунту в MVP обмежено.')}
                        className={`w-full border backdrop-blur-md text-red-600 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors ${theme === 'light'
                          ? 'bg-white/60 border-[#E5E7EB] hover:bg-red-50/20'
                          : 'bg-[#1c2541]/45 border-white/5 hover:bg-red-500/10'
                          }`}
                      >
                        <LogOut className="w-4 h-4" />
                        Вийти з акаунту
                      </button>
                    </div>
                  )}

                  {/* SUBPAGE: PERSONAL DATA */}
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
                          <p className={`text-[10px] uppercase font-bold tracking-wider ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>Повне Ім'я</p>
                          <p className={`text-sm font-bold mt-0.5 ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Олексій Коваленко</p>
                        </div>
                        <div className={`border-t pt-3 ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
                          <p className={`text-[10px] uppercase font-bold tracking-wider ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>Телефон</p>
                          <p className={`text-sm font-bold mt-0.5 ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>+380 67 123 45 67</p>
                        </div>
                        <div className={`border-t pt-3 ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
                          <p className={`text-[10px] uppercase font-bold tracking-wider ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>Електронна пошта</p>
                          <p className={`text-sm font-bold mt-0.5 ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>oleksii.k@example.com</p>
                        </div>
                        <div className={`border-t pt-3 ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
                          <p className={`text-[10px] uppercase font-bold tracking-wider ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>Рідне Місто</p>
                          <p className={`text-sm font-bold mt-0.5 ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Київ, Україна</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBPAGE: DOCUMENTS */}
                  {profileSubPage === 'docs' && (
                    <div className="space-y-4 animate-fade-in">
                      <button
                        onClick={() => setProfileSubPage('main')}
                        className={`flex items-center gap-1 text-xs font-bold hover:underline ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}
                      >
                        <ArrowLeft className="w-4 h-4 text-[#FF5722]" /> Назад
                      </button>

                      <h3 className={`text-base font-black uppercase tracking-tight ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Мої документи</h3>

                      <div className="space-y-3">
                        <div className={`p-4 rounded-2xl flex items-center justify-between border transition-all backdrop-blur-[16px] ${theme === 'light' ? 'bg-white/85 border-[#E5E7EB] shadow-sm' : 'bg-[#1c2541]/45 border-white/10 shadow-md'
                          }`}>
                          <div>
                            <p className={`text-xs font-bold ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Паспорт громадянина</p>
                            <p className={`text-[10px] ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>ID-карта верифікована через Дія</p>
                          </div>
                          <span className="bg-[#10B981]/8 text-[#10B981] text-[9px] font-black px-2 py-0.5 rounded border border-[#10B981]/25">
                            ВЕРИФІКОВАНО
                          </span>
                        </div>

                        <div className={`p-4 rounded-2xl flex items-center justify-between border transition-all backdrop-blur-[16px] ${theme === 'light' ? 'bg-white/85 border-[#E5E7EB] shadow-sm' : 'bg-[#1c2541]/45 border-white/10 shadow-md'
                          }`}>
                          <div>
                            <p className={`text-xs font-bold ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Індивідуальний податковий номер (ІПН)</p>
                            <p className={`text-[10px] ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>Підтверджено реєстрами</p>
                          </div>
                          <span className="bg-[#10B981]/8 text-[#10B981] text-[9px] font-black px-2 py-0.5 rounded border border-[#10B981]/25">
                            ВЕРИФІКОВАНО
                          </span>
                        </div>

                        <div className={`p-4 rounded-2xl flex items-center justify-between border transition-all backdrop-blur-[16px] ${theme === 'light' ? 'bg-white/85 border-[#E5E7EB] shadow-sm' : 'bg-[#1c2541]/45 border-white/10 shadow-md'
                          }`}>
                          <div>
                            <p className={`text-xs font-bold ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Медична книжка (Санкнижка)</p>
                            <p className={`text-[10px] ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>Дійсна до 12.2024</p>
                          </div>
                          <span className="bg-[#10B981]/8 text-[#10B981] text-[9px] font-black px-2 py-0.5 rounded border border-[#10B981]/25">
                            АКТИВНА
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBPAGE: HELP CENTER */}
                  {profileSubPage === 'help' && (
                    <div className="space-y-4 animate-fade-in">
                      <button
                        onClick={() => setProfileSubPage('main')}
                        className={`flex items-center gap-1 text-xs font-bold hover:underline ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}
                      >
                        <ArrowLeft className="w-4 h-4 text-[#FF5722]" /> Назад
                      </button>

                      <h3 className={`text-base font-black uppercase tracking-tight ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Центр допомоги</h3>

                      <div className="space-y-3">
                        <div className={`p-4 rounded-2xl border transition-all backdrop-blur-[16px] ${theme === 'light' ? 'bg-white/85 border-[#E5E7EB] shadow-sm' : 'bg-[#1c2541]/45 border-white/10 shadow-md'
                          }`}>
                          <p className={`text-xs font-bold ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Як отримати виплату за виконану зміну?</p>
                          <p className={`text-[11px] mt-1.5 leading-relaxed ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>
                            Оплата нараховується на ваш цифровий гаманець миттєво після того, як роботодавець підтвердить успішне закриття смени в B2B-дашборді. Ви можете вивести гроші на будь-картку в 1 клік.
                          </p>
                        </div>

                        <div className={`p-4 rounded-2xl border transition-all backdrop-blur-[16px] ${theme === 'light' ? 'bg-white/85 border-[#E5E7EB] shadow-sm' : 'bg-[#1c2541]/45 border-white/10 shadow-md'
                          }`}>
                          <p className={`text-xs font-bold ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Що буде, якщо я не приду на заброньовану зміну?</p>
                          <p className={`text-[11px] mt-1.5 leading-relaxed ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>
                            Невиправданий невихід негативно впливає на ваш внутрішній рейтинг. Рекомендуємо скасовувати бронювання заздалегідь або повідомляти службу підтримки.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => triggerToast('Зв\'язок з підтримкою в Телеграм активовано!')}
                        className={`w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md mt-2 hover:scale-102 active:scale-98 ${theme === 'light' ? 'bg-[#001B3D] hover:bg-[#001430] text-white' : 'bg-[#FF5722] hover:bg-[#e64a19] text-white'
                          }`}
                      >
                        <span>Зв'язатися з підтримкою</span>
                      </button>
                    </div>
                  )}

                  {/* SUBPAGE: DEVELOPER PANEL */}
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
            </>
          )}

          {/* ========================================================= */}
          {/* ==================== EMPLOYER VIEW (B2B) ================ */}
          {/* ========================================================= */}
          {userRole === 'employer' && (
            <>
              {/* Tabs for B2B portal */}
              <div className={`px-4 py-2 border-b flex gap-2 transition-colors duration-300 ${theme === 'light' ? 'bg-[#ede8e4] border-black/10' : 'bg-[#121829]/40 border-white/5'
                } backdrop-blur-md`}>
                <button
                  onClick={() => setB2bTab('dashboard')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${b2bTab === 'dashboard'
                    ? theme === 'light'
                      ? 'bg-[#001B3D] text-white border-transparent shadow-sm'
                      : 'bg-[#FF5722] text-white border-transparent shadow-[0_4px_12px_rgba(255,87,34,0.2)]'
                    : theme === 'light'
                      ? 'bg-white/60 text-[#001B3D] border-[#E5E7EB]'
                      : 'bg-[#1c2541]/50 text-white border-transparent'
                    }`}
                >
                  Дашборд
                </button>
                <button
                  onClick={() => setB2bTab('create')}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${b2bTab === 'create'
                    ? theme === 'light'
                      ? 'bg-[#001B3D] text-white border-transparent shadow-sm'
                      : 'bg-[#FF5722] text-white border-transparent shadow-[0_4px_12px_rgba(255,87,34,0.2)]'
                    : theme === 'light'
                      ? 'bg-white/60 text-[#001B3D] border-[#E5E7EB]'
                      : 'bg-[#1c2541]/50 text-white border-transparent'
                    }`}
                >
                  + Створити зміну
                </button>
              </div>

              {/* 1. B2B DASHBOARD */}
              {b2bTab === 'dashboard' && (
                <div className="p-4 space-y-4 text-left animate-fade-in">

                  {/* Employer Balance Header */}
                  <div className={`rounded-3xl p-5 border transition-all backdrop-blur-[16px] ${theme === 'light' ? 'bg-white/85 border-[#E5E7EB] shadow-sm' : 'bg-[#1c2541]/45 border-white/10 shadow-md'
                    } flex items-center justify-between`}>
                    <div>
                      <p className={`text-[10px] uppercase font-bold ${theme === 'light' ? 'text-[#5b4039]/70' : 'text-gray-400'}`}>Депозит підприємства</p>
                      <h4 className={`text-xl font-black mt-0.5 ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>{employerBalance.toLocaleString()} ₴</h4>
                    </div>
                    {employerFrozenBalance > 0 ? (
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-black text-amber-500">Заморожено (Сейф)</p>
                        <h4 className="text-sm font-black mt-0.5 text-amber-500">{employerFrozenBalance.toLocaleString()} ₴</h4>
                      </div>
                    ) : (
                      <span className="text-[9px] font-black uppercase bg-[#10B981]/8 text-[#10B981] px-2 py-1 rounded border border-[#10B981]/25">
                        АКТИВНИЙ
                      </span>
                    )}
                  </div>

                  <h3 className={`text-xs font-black uppercase tracking-wider px-1 ${theme === 'light' ? 'text-[#5b4039]/80' : 'text-gray-400'
                    }`}>Всі зміни компанії ({shifts.length})</h3>

                  <div className="space-y-4">
                    {shifts.map((s) => (
                      <div
                        key={s.id}
                        className={`rounded-3xl p-5 border transition-all backdrop-blur-[16px] ${theme === 'light'
                          ? 'bg-white/85 border-[#E5E7EB] shadow-[0_8px_30px_-6px_rgba(255,87,34,0.08)] hover:bg-white/95'
                          : 'bg-[#1c2541]/45 border-white/10 shadow-[0_8px_30px_-6px_rgba(255,87,34,0.2)] hover:bg-[#1c2541]/60'
                          } animate-fade-in`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${s.status === 'open' ? 'bg-gray-50 text-gray-600 border-[#E5E7EB]' :
                              s.status === 'booked' ? 'bg-[#FF9500]/8 text-[#FF9500] border-[#FF9500]/25' :
                                'bg-[#10B981]/8 text-[#10B981] border-[#10B981]/25'
                              }`}>
                              {s.status === 'open' && 'Вільна'}
                              {s.status === 'booked' && 'Заброньована'}
                              {s.status === 'completed' && 'Завершена / Виплачено'}
                            </span>
                            <h4 className={`text-base font-bold mt-2 leading-tight ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>{s.role}</h4>
                            <p className={`text-xs font-bold mt-0.5 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>{s.company}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-base font-black text-[#FF5722]">{s.price} ₴</span>
                          </div>
                        </div>

                        <div className={`mt-3.5 pt-3.5 border-t flex justify-between items-center text-xs font-semibold ${theme === 'light' ? 'border-gray-100 text-[#5b4039]' : 'border-white/5 text-gray-300'
                          }`}>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#FF5722]" />
                            {s.date} Чер • {s.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-[#FF5722]" />
                            {s.address.split(',')[0]}
                          </span>
                        </div>

                        {/* Approve Payout trigger */}
                        {(s.status === 'booked' || s.status === 'in_progress' || s.status === 'pending_approval') && (
                          <div className={`mt-4 pt-3.5 border-t ${theme === 'light' ? 'border-gray-100' : 'border-white/5'} flex flex-col gap-2`}>
                            <div className={`rounded-2xl p-3 flex items-start gap-2 text-[10px] font-bold ${
                              s.status === 'pending_approval'
                                ? 'bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400'
                                : 'bg-[#fff9e6] border border-[#ffe082] text-[#856404]'
                            }`}>
                              <Info className={`w-4 h-4 shrink-0 mt-0.5 ${s.status === 'pending_approval' ? 'text-green-500' : 'text-[#FF9500]'}`} />
                              <span>
                                {s.status === 'booked' && 'Виконавець забронював зміну, але ще не розпочав роботу.'}
                                {s.status === 'in_progress' && 'Виконавець зараз працює на зміні.'}
                                {s.status === 'pending_approval' && 'Виконавець завершив зміну (Чек-аут) та очікує перевірки й виплати!'}
                              </span>
                            </div>
                            
                            {s.status === 'booked' && (
                              <button
                                onClick={() => setShowB2BQRModalId(s.id)}
                                className={`w-full py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border transition-all ${
                                  theme === 'light'
                                    ? 'border-[#001B3D]/30 text-[#001B3D] hover:bg-gray-50'
                                    : 'border-white/20 text-white hover:bg-white/5'
                                }`}
                              >
                                <QrCode className="w-4 h-4" />
                                Показати QR-код закладу
                              </button>
                            )}

                            {s.status === 'pending_approval' && s.workPhoto && (
                              <div className="my-1 space-y-2 text-left">
                                <p className={`text-[10px] uppercase font-black tracking-wider ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>Надісланий фотозвіт роботи:</p>
                                <div className={`rounded-2xl border p-3 flex flex-col gap-2 ${theme === 'light' ? 'bg-[#fcf9f8] border-gray-150' : 'bg-[#121829]/50 border-white/5'}`}>
                                  <div className="relative w-full h-36 rounded-xl overflow-hidden bg-black">
                                    <img src={s.workPhoto} alt="Work Report Proof" className="w-full h-full object-cover" />
                                  </div>
                                  {s.workComment && (
                                    <p className={`text-xs italic font-semibold ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>
                                      &ldquo;{s.workComment}&rdquo;
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            {s.status === 'pending_approval' && (
                              <button
                                onClick={() => handleApproveShift(s.id, s.price, s.role, s.company)}
                                className="w-full bg-[#10B981] hover:bg-[#0ea975] text-white py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-98 shadow-sm transition-all"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Підтвердити виконання та сплатити
                              </button>
                            )}
                          </div>
                        )}

                        {s.status === 'completed' && s.reviews && s.reviews.some(r => r.workerName === 'Олексій К.') && (
                          <div className={`mt-3.5 pt-3.5 border-t ${theme === 'light' ? 'border-gray-100' : 'border-white/5'} space-y-2`}>
                            <p className={`text-[10px] uppercase font-bold tracking-wider ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>Відгук виконавця:</p>
                            {s.reviews.filter(r => r.workerName === 'Олексій К.').map((rev) => (
                              <div key={rev.id} className={`rounded-xl p-3 text-xs font-semibold ${theme === 'light' ? 'bg-[#fcf9f8]' : 'bg-[#121829]/50'}`}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className={`font-bold ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>{rev.workerName}</span>
                                  <div className="flex items-center gap-0.5 text-[#FF9500]">
                                    <Star className="w-3.5 h-3.5 fill-[#FF9500]" />
                                    <span className="text-[11px] font-black">{rev.rating}</span>
                                  </div>
                                </div>
                                <p className={theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}>{rev.comment}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. B2B CREATE SHIFT PAGE */}
              {b2bTab === 'create' && (
                <div className="p-4 text-left animate-fade-in">
                  <form onSubmit={handleCreateShift} className={`rounded-3xl p-5 border transition-all backdrop-blur-[16px] ${theme === 'light'
                    ? 'bg-white/90 border-[#E5E7EB] shadow-[0_8px_30px_-6px_rgba(255,87,34,0.08)]'
                    : 'bg-[#1c2541]/45 border-white/10 shadow-[0_8px_30px_-6px_rgba(255,87,34,0.2)]'
                    } space-y-4`}>
                    <h3 className={`text-base font-bold border-b pb-3 mb-2 ${theme === 'light' ? 'border-[#E5E7EB] text-[#001B3D]' : 'border-white/5 text-white'
                      }`}>Публікація нової зміни</h3>

                    <div>
                      <label className={`block text-[10px] font-bold uppercase mb-1 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>Професія / Роль *</label>
                      <input
                        type="text"
                        required
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        placeholder="Наприклад: Бариста"
                        className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none transition-all ${theme === 'light'
                          ? 'bg-white border-[#E5E7EB] text-[#001B3D] focus:border-[#FF5722]'
                          : 'bg-[#121829]/50 border-[#2a3454] text-white focus:bg-[#121829] focus:border-[#FF5722]'
                          }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-[10px] font-bold uppercase mb-1 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>Компанія / Заклад *</label>
                      <input
                        type="text"
                        required
                        value={newCompany}
                        onChange={(e) => setNewCompany(e.target.value)}
                        placeholder="Наприклад: Aroma Kava"
                        className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none transition-all ${theme === 'light'
                          ? 'bg-white border-[#E5E7EB] text-[#001B3D] focus:border-[#FF5722]'
                          : 'bg-[#121829]/50 border-[#2a3454] text-white focus:bg-[#121829] focus:border-[#FF5722]'
                          }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-[10px] font-bold uppercase mb-1 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>Категорія</label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value as any)}
                          className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none ${theme === 'light'
                            ? 'bg-white border-[#E5E7EB] text-[#001B3D]'
                            : 'bg-[#121829]/50 border-[#2a3454] text-white'
                            }`}
                        >
                          <option value="Кава">Кава</option>
                          <option value="Рітейл">Рітейл</option>
                          <option value="Склади">Склади</option>
                        </select>
                      </div>
                      <div>
                        <label className={`block text-[10px] font-bold uppercase mb-1 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>Оплата (₴) *</label>
                        <input
                          type="number"
                          required
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          placeholder="1200"
                          className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none ${theme === 'light'
                            ? 'bg-white border-[#E5E7EB] text-[#001B3D]'
                            : 'bg-[#121829]/50 border-[#2a3454] text-white'
                            }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-[10px] font-bold uppercase mb-1 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>Дата</label>
                        <select
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none ${theme === 'light'
                            ? 'bg-white border-[#E5E7EB] text-[#001B3D]'
                            : 'bg-[#121829]/50 border-[#2a3454] text-white'
                            }`}
                        >
                          <option value="14">14 Червня (Сьогодні)</option>
                          <option value="15">15 Червня</option>
                          <option value="16">16 Червня</option>
                          <option value="17">17 Червня</option>
                          <option value="18">18 Червня</option>
                          <option value="19">19 Червня</option>
                        </select>
                      </div>
                      <div>
                        <label className={`block text-[10px] font-bold uppercase mb-1 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>Години</label>
                        <input
                          type="text"
                          required
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          placeholder="08:00 - 17:00"
                          className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none ${theme === 'light'
                            ? 'bg-white border-[#E5E7EB] text-[#001B3D]'
                            : 'bg-[#121829]/50 border-[#2a3454] text-white'
                            }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-[10px] font-bold uppercase mb-1 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>Адреса локації *</label>
                      <input
                        type="text"
                        required
                        value={newAddress}
                        onChange={(e) => setNewAddress(e.target.value)}
                        placeholder="Київ, вул. Хрещатик, 10"
                        className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none ${theme === 'light'
                          ? 'bg-white border-[#E5E7EB] text-[#001B3D]'
                          : 'bg-[#121829]/50 border-[#2a3454] text-white'
                          }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-[10px] font-bold uppercase mb-1 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>Опис роботи / Обов'язки *</label>
                      <textarea
                        required
                        rows={3}
                        value={newDetails}
                        onChange={(e) => setNewDetails(e.target.value)}
                        placeholder="Опишіть завдання зміни (напр., викладка товару, приготування напоїв)"
                        className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none resize-none transition-all ${theme === 'light'
                          ? 'bg-white border-[#E5E7EB] text-[#001B3D] focus:border-[#FF5722]'
                          : 'bg-[#121829]/50 border-[#2a3454] text-white focus:bg-[#121829] focus:border-[#FF5722]'
                          }`}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-4 bg-[#FF5722] hover:bg-[#e64a19] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(255,87,34,0.3)] active:scale-98 transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Опублікувати зміну
                    </button>
                  </form>
                </div>
              )}
            </>
          )}

        </div>

        {/* --- PERSISTENT FLOATING BOTTOM NAVIGATION (B2C Worker only - Glassmorphic overlay) --- */}
        {userRole === 'worker' && (
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
        )}

      </div>

      {/* --- MOCK QR MODAL POPUP --- */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 bg-[#001B3D]/80 flex items-center justify-center p-6 backdrop-blur-2xl">
          <div className={`rounded-[32px] p-8 w-full max-w-sm text-center shadow-2xl relative z-10 border flex flex-col items-center animate-modal-in ${theme === 'light' ? 'bg-white/90 border-[#E5E7EB]' : 'bg-[#1c2541]/80 border-white/10'
            }`}>

            <div className="w-20 h-20 bg-[#FF5722]/10 rounded-full flex items-center justify-center mb-6">
              <QrCode className="w-10 h-10 text-[#FF5722]" />
            </div>

            <h3 className={`text-2xl font-bold mb-2 ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Чек-ін на зміну</h3>
            <p className={`text-xs font-bold leading-normal mb-8 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>
              Покажіть цей код менеджеру закладу для фіксації прибуття на роботу.
            </p>

            <div className={`p-6 rounded-3xl mb-8 border-2 border-dashed ${theme === 'light' ? 'bg-[#fcf9f8]/90 border-[#E5E7EB]' : 'bg-[#121829]/60 border-white/10'
              }`}>
              <svg className={`w-48 h-48 ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`} viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v2h-2v-2z"></path>
              </svg>
            </div>

            <button
              onClick={() => setShowQRModal(null)}
              className={`w-full py-4 rounded-2xl font-bold text-sm active:scale-95 transition-all shadow-md ${theme === 'light' ? 'bg-[#001B3D] text-white hover:bg-[#001430]' : 'bg-[#FF5722] text-white hover:bg-[#e64a19]'
                }`}
            >
              Закрити
            </button>
          </div>
        </div>
      )}

      {/* --- MOCK QR SCANNER MODAL FOR WORKER --- */}
      {showScannerModal && (() => {
        const targetShift = shifts.find(s => s.id === showScannerModal);
        return (
          <div className="fixed inset-0 z-50 bg-[#001B3D]/80 flex items-center justify-center p-6 backdrop-blur-2xl">
            <div className={`rounded-[32px] p-8 w-full max-w-sm text-center shadow-2xl relative z-10 border flex flex-col items-center animate-modal-in ${theme === 'light' ? 'bg-white/90 border-[#E5E7EB]' : 'bg-[#1c2541]/80 border-white/10'
              }`}>
              <div className="w-16 h-16 bg-[#FF5722]/10 rounded-full flex items-center justify-center mb-5">
                <Camera className="w-8 h-8 text-[#FF5722]" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Сканування QR закладу</h3>
              <p className={`text-xs font-semibold leading-normal mb-6 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>
                Наведіть камеру на QR-код, який надасть менеджер у закладі <span className="text-[#FF5722] font-black">{targetShift?.company}</span>.
              </p>

              {/* Simulated Viewfinder */}
              <div className="relative w-48 h-48 rounded-3xl overflow-hidden mb-6 border-2 border-[#FF5722]/35 bg-black">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#FF5722]/10 pointer-events-none" />
                <div className="absolute left-0 right-0 h-1 bg-[#FF5722] shadow-[0_0_8px_#FF5722] animate-bounce top-1/2" />
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-white" />
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-white" />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-white" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-white" />
                <QrCode className="w-24 h-24 text-white/15 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>

              <div className="space-y-2 w-full">
                <button
                  onClick={() => targetShift && handleSimulateScan(targetShift.id)}
                  className="w-full bg-[#10B981] hover:bg-[#0ea975] text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md"
                >
                  <CheckCircle className="w-4 h-4" />
                  Симулювати зчитування QR
                </button>
                <button
                  onClick={() => setShowScannerModal(null)}
                  className={`w-full py-3.5 rounded-2xl text-xs font-bold transition-all ${
                    theme === 'light'
                      ? 'bg-gray-100 hover:bg-gray-200 text-[#001B3D]'
                      : 'bg-white/5 hover:bg-white/10 text-white'
                  }`}
                >
                  Скасувати
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* --- B2B VENUE QR CODE POPUP --- */}
      {showB2BQRModalId && (() => {
        const targetShift = shifts.find(s => s.id === showB2BQRModalId);
        return (
          <div className="fixed inset-0 z-50 bg-[#001B3D]/80 flex items-center justify-center p-6 backdrop-blur-2xl">
            <div className={`rounded-[32px] p-8 w-full max-w-sm text-center shadow-2xl relative z-10 border flex flex-col items-center animate-modal-in ${theme === 'light' ? 'bg-white/90 border-[#E5E7EB]' : 'bg-[#1c2541]/80 border-white/10'
              }`}>
              <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                <QrCode className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>QR-код закладу</h3>
              <p className={`text-xs font-semibold leading-normal mb-8 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>
                Попросіть виконавця відсканувати цей QR-код через додаток <span className="font-bold text-[#FF5722]">OneClick</span> для початку зміни в <span className="font-bold">{targetShift?.company}</span>.
              </p>
              
              {/* Employer Venue Check-in QR */}
              <div className={`p-6 rounded-3xl mb-8 border-2 border-dashed ${theme === 'light' ? 'bg-[#fcf9f8]/90 border-[#E5E7EB]' : 'bg-[#121829]/60 border-white/10'
                }`}>
                <svg className={`w-48 h-48 ${theme === 'light' ? 'text-blue-900' : 'text-blue-400'}`} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm13-2h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v2h-2v-2zm3 3h3v2h-3v-2zm-3 0h2v2h-2v-2z"></path>
                </svg>
              </div>

              <button
                onClick={() => setShowB2BQRModalId(null)}
                className={`w-full py-4 rounded-2xl font-bold text-sm active:scale-95 transition-all shadow-md ${theme === 'light' ? 'bg-[#001B3D] text-white hover:bg-[#001430]' : 'bg-[#FF5722] text-white hover:bg-[#e64a19]'
                  }`}
              >
                Закрити
              </button>
            </div>
          </div>
        );
      })()}

      {/* --- B2C WORK REPORT & PHOTO CAPTURE MODAL --- */}
      {showReportModalId && (() => {
        const targetShift = shifts.find(s => s.id === showReportModalId);
        
        // select a mock photo based on shift category
        const getMockPhoto = (cat?: string) => {
          if (cat === 'Кава') return 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&q=80';
          if (cat === 'Склади') return 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=500&q=80';
          return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80'; // Retail
        };

        const handleSnapPhoto = () => {
          setIsTakingPhoto(true);
          setTimeout(() => {
            setCapturedPhoto(getMockPhoto(targetShift?.category));
            setIsTakingPhoto(false);
            triggerToast('Фото успішно додано до звіту! 📸');
          }, 1200); // simulate camera snap delay
        };

        const handleSendReport = () => {
          if (!capturedPhoto) {
            triggerToast('Будь ласка, додайте фото виконаної роботи!');
            return;
          }
          setShifts(prev =>
            prev.map(s =>
              s.id === showReportModalId
                ? {
                    ...s,
                    status: 'pending_approval' as const,
                    workPhoto: capturedPhoto,
                    workComment: reportComment.trim() || 'Роботу виконано успішно та вчасно.'
                  }
                : s
            )
          );
          setShowReportModalId(null);
          setCapturedPhoto(null);
          setReportComment('');
          triggerToast('Звіт надіслано! Очікуйте виплати від роботодавця. 💰');
        };

        return (
          <div className="fixed inset-0 z-50 bg-[#001B3D]/80 flex items-center justify-center p-6 backdrop-blur-2xl">
            <div className={`rounded-[32px] p-6 w-full max-w-sm text-center shadow-2xl relative z-10 border flex flex-col animate-modal-in ${theme === 'light' ? 'bg-white/95 border-[#E5E7EB]' : 'bg-[#1c2541]/90 border-white/10'
              }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-sm font-black uppercase tracking-tight ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Звіт про виконану роботу</h3>
                <button
                  onClick={() => {
                    setShowReportModalId(null);
                    setCapturedPhoto(null);
                    setReportComment('');
                  }}
                  className={`text-xs font-bold ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}
                >
                  Закрити
                </button>
              </div>

              {/* Photo Snapper Simulation */}
              <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-4 border bg-black flex flex-col items-center justify-center">
                {capturedPhoto ? (
                  <>
                    <img src={capturedPhoto} alt="Work Proof" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setCapturedPhoto(null)}
                      className="absolute bottom-2 right-2 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-xl transition-all shadow-md"
                    >
                      Перезняти
                    </button>
                  </>
                ) : isTakingPhoto ? (
                  <div className="flex flex-col items-center gap-2 text-white">
                    <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Робимо знімок...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center p-4 text-center">
                    <Camera className="w-10 h-10 text-gray-500 mb-2" />
                    <p className="text-[11px] text-gray-400 font-semibold mb-3">Зробіть фото-підтвердження виконаної роботи у закладі</p>
                    <button
                      onClick={handleSnapPhoto}
                      className="bg-[#FF5722] hover:bg-[#e64a19] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Зробити фото роботи
                    </button>
                  </div>
                )}
              </div>

              {/* Report Comment Input */}
              <div className="text-left space-y-1 mb-4">
                <label className={`text-[10px] font-black uppercase tracking-wider ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-400'}`}>Коментар до звіту (необов'язково):</label>
                <textarea
                  rows={2}
                  value={reportComment}
                  onChange={(e) => setReportComment(e.target.value)}
                  placeholder="Наприклад: роботу завершено, все прибрано, полиці заповнені..."
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-bold outline-none resize-none transition-all ${theme === 'light'
                      ? 'bg-[#fcf9f8] border-gray-200 text-[#001B3D] focus:border-[#FF5722] focus:bg-white'
                      : 'bg-[#121829]/50 border-[#2a3454] text-white focus:border-[#FF5722] focus:bg-[#121829]'
                    }`}
                />
              </div>

              <button
                onClick={handleSendReport}
                className="w-full bg-[#10B981] hover:bg-[#0ea975] text-white py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md"
              >
                <CheckCircle className="w-4 h-4" />
                Надіслати звіт та Чек-аут
              </button>
            </div>
          </div>
        );
      })()}

      {/* --- CANCELLATION MODAL POPUP --- */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-[#001B3D]/80 flex items-center justify-center p-6 backdrop-blur-2xl">
          <div className={`rounded-[32px] p-8 w-full max-w-sm text-center shadow-2xl relative z-10 border flex flex-col items-center animate-modal-in ${theme === 'light' ? 'bg-white/90 border-[#E5E7EB]' : 'bg-[#1c2541]/80 border-white/10'
            }`}>

            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-5">
              <Info className="w-8 h-8 text-red-500" />
            </div>

            <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-[#001B3D]' : 'text-white'}`}>Скасувати зміну?</h3>
            <p className={`text-xs font-semibold leading-normal mb-6 ${theme === 'light' ? 'text-[#5b4039]' : 'text-gray-300'}`}>
              Виберіть варіант скасування. Зверніть увагу, що пізня відмова порушує правила платформи та призведе до штрафу.
            </p>

            <div className="space-y-3 w-full mb-6">
              <button
                onClick={() => handleCancelShift(showCancelModal, false)}
                className={`w-full py-3.5 px-4 rounded-xl border text-xs font-bold transition-all text-left flex justify-between items-center ${theme === 'light'
                  ? 'bg-white border-[#E5E7EB] text-[#001B3D] hover:bg-gray-50'
                  : 'bg-[#121829]/50 border-white/10 text-white hover:bg-[#121829]'
                  }`}
              >
                <div>
                  <p className="font-bold">Скасувати заздалегідь</p>
                  <p className="text-[10px] font-semibold text-gray-400 mt-0.5">Більше ніж за 2 години до початку</p>
                </div>
                <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded font-black">БЕЗ ШТРАФУ</span>
              </button>

              <button
                onClick={() => handleCancelShift(showCancelModal, true)}
                className={`w-full py-3.5 px-4 rounded-xl border text-xs font-bold transition-all text-left flex justify-between items-center ${theme === 'light'
                  ? 'bg-white border-[#E5E7EB] text-[#001B3D] hover:bg-gray-50'
                  : 'bg-[#121829]/50 border-white/10 text-white hover:bg-[#121829]'
                  }`}
              >
                <div>
                  <p className="font-bold text-red-500">Термінове скасування</p>
                  <p className="text-[10px] font-semibold text-gray-400 mt-0.5">Менш ніж за 2 години до початку</p>
                </div>
                <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded font-black">ШТРАФ 250 ₴</span>
              </button>
            </div>

            <button
              onClick={() => setShowCancelModal(null)}
              className={`w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider active:scale-95 transition-all ${theme === 'light' ? 'bg-[#f0edec] text-[#001B3D]' : 'bg-[#1c2541] text-white'
                }`}
            >
              Назад
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
