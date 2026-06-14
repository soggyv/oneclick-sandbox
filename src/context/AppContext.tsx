'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Shift, UserShift, Transaction, Message, Language, UserRole, B2bActiveTab, WorkerTab } from '../types';

interface AppContextType {
  // Localization
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Record<string, string>;

  // Authentication
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  showDiiaLogin: boolean;
  setShowDiiaLogin: (val: boolean) => void;
  showPhoneLogin: boolean;
  setShowPhoneLogin: (val: boolean) => void;
  phoneNumber: string;
  setPhoneNumber: (val: string) => void;
  otpCode: string;
  setOtpCode: (val: string) => void;
  isOtpSent: boolean;
  setIsOtpSent: (val: boolean) => void;
  isDiiaScanning: boolean;
  setIsDiiaScanning: (val: boolean) => void;
  handleDiiaAuth: () => void;
  handlePhoneSubmit: (e: React.FormEvent) => void;
  handleOtpSubmit: (e: React.FormEvent) => void;

  // Navigation
  activeTab: WorkerTab;
  setActiveTab: (tab: WorkerTab) => void;
  selectedJob: Shift | null;
  setSelectedJob: (job: Shift | null) => void;
  showJobDetails: boolean;
  setShowJobDetails: (val: boolean) => void;
  showPhoneFrame: boolean;
  setShowPhoneFrame: (val: boolean) => void;

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  filteredShifts: Shift[];

  // Database / Simulated state
  shifts: Shift[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
  myShifts: UserShift[];
  setMyShifts: React.Dispatch<React.SetStateAction<UserShift[]>>;
  balance: number;
  setBalance: (val: number) => void;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;

  // Roles B2C/B2B
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  employerDeposit: number;
  setEmployerDeposit: (val: number) => void;
  b2bActiveTab: B2bActiveTab;
  setB2bActiveTab: (tab: B2bActiveTab) => void;
  employerCompany: string;
  setEmployerCompany: (comp: string) => void;

  // B2B Create Shift Form
  newShiftRole: string;
  setNewShiftRole: (val: string) => void;
  newShiftCategory: 'Склади' | 'Рітейл' | 'Кафе' | 'Кур\'єр';
  setNewShiftCategory: (cat: 'Склади' | 'Рітейл' | 'Кафе' | 'Кур\'єр') => void;
  newShiftDate: string;
  setNewShiftDate: (val: string) => void;
  newShiftTime: string;
  setNewShiftTime: (val: string) => void;
  newShiftPrice: string;
  setNewShiftPrice: (val: string) => void;
  newShiftAddress: string;
  setNewShiftAddress: (val: string) => void;
  newShiftDetails: string;
  setNewShiftDetails: (val: string) => void;
  newShiftRequirements: string;
  setNewShiftRequirements: (val: string) => void;
  newShiftResponsibilities: string;
  setNewShiftResponsibilities: (val: string) => void;
  handleCreateShift: (e: React.FormEvent) => void;
  handleApplyTemplate: (role: string, category: 'Склади' | 'Рітейл' | 'Кафе' | 'Кур\'єр', price: string, address: string) => void;

  // B2B Actions
  handleApproveApplication: (usId: string) => void;
  handleDeclineApplication: (usId: string) => void;
  handleApprovePayout: (us: UserShift) => void;

  // B2B Deposit top-up
  showTopUpModal: boolean;
  setShowTopUpModal: (val: boolean) => void;
  topUpAmount: string;
  setTopUpAmount: (val: string) => void;
  handleTopUpDepositSubmit: (e: React.FormEvent) => void;

  // Worker Actions
  handleApply: (job: Shift) => void;
  handleStartShiftSimulate: (userShift: UserShift) => void;
  handleCompleteShiftSimulate: (userShift: UserShift) => void;

  // Worker Wallet/Withdrawal
  showWithdrawModal: boolean;
  setShowWithdrawModal: (val: boolean) => void;
  withdrawAmount: string;
  setWithdrawAmount: (val: string) => void;
  withdrawCard: string;
  setWithdrawCard: (val: string) => void;
  handleWithdrawSubmit: (e: React.FormEvent) => void;

  // Worker Profile
  activeProfileSubPage: string | null;
  setActiveProfileSubPage: (page: string | null) => void;
  profileName: string;
  setProfileName: (val: string) => void;
  profilePhone: string;
  setProfilePhone: (val: string) => void;
  profileEmail: string;
  setProfileEmail: (val: string) => void;
  profileCity: string;
  setProfileCity: (val: string) => void;

  // Settings
  notificationsEnabled: boolean;
  setNotificationsEnabled: (val: boolean) => void;
  darkModeEnabled: boolean;
  setDarkModeEnabled: (val: boolean) => void;

  // Chat
  chatMessages: Message[];
  chatInput: string;
  setChatInput: (val: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;

  // Modals & Overlays
  showQRModal: boolean;
  setShowQRModal: (val: boolean) => void;
  qrModalShift: UserShift | null;
  setQrModalShift: (s: UserShift | null) => void;
  confirmCheckInSimulation: () => void;
  showSuccessOverlay: boolean;
  setShowSuccessOverlay: (val: boolean) => void;
  successOverlayMessage: string;
  setSuccessOverlayMessage: (val: string) => void;
  successOverlayTitle: string;
  setSuccessOverlayTitle: (val: string) => void;

  // Map
  showMap: boolean;
  setShowMap: (val: boolean) => void;
  mapSelectedJob: Shift | null;
  setMapSelectedJob: (s: Shift | null) => void;

  // Toast
  toastMessage: string | null;
  triggerToast: (msg: string) => void;

  // Sub-tabs
  shiftsSubTab: 'active' | 'history';
  setShiftsSubTab: (tab: 'active' | 'history') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Mock Data
const INITIAL_SHIFTS: Shift[] = [
  {
    id: '1',
    role: 'Комплектувальник',
    company: 'Rozetka',
    price: 1800,
    time: '08:00 — 20:00',
    date: '15',
    dist: '2.4 км',
    hot: true,
    type: 'Склади',
    icon: 'inventory_2',
    logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&auto=format&fit=crop&q=60',
    address: 'Одеса, вул. Середньофонтанська, 19',
    details: 'Склад №4, вхід з правого боку. Потрібно збирати інтернет-замовлення за накладними.',
    requirements: [
      'Пунктуальність та відповідальне ставлення до роботи',
      'Фізична витривалість (робота на ногах)',
      'Наявність смартфона для роботи з додатком',
      'Охайний зовнішній вигляд'
    ],
    responsibilities: [
      'Сортування та комплектування товарів згідно з накладною',
      'Сканування штрих-кодів та перевірка цілісності пакування',
      'Підготовка замовлень до відправлення кур\'єрам',
      'Підтримання порядку на робочому місці'
    ]
  },
  {
    id: '2',
    role: 'Бариста',
    company: 'Aroma Kava',
    price: 950,
    time: '09:00 — 21:00',
    date: '15',
    dist: '1.5 км',
    hot: false,
    type: 'Кафе',
    icon: 'coffee',
    logo: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=100&auto=format&fit=crop&q=60',
    address: 'Одеса, вул. Дерибасівська, 18',
    details: 'Затишна кав\'ярня в центрі міста. Досвід роботи бажаний, але не обов\'язковий.',
    requirements: [
      'Вміння спілкуватися з клієнтами',
      'Бажання вчитися та розвиватися',
      'Наявність медичної книжки'
    ],
    responsibilities: [
      'Приготування кавових напоїв та чаю',
      'Обслуговування гостей на касі',
      'Підтримання чистоти робочої зони'
    ]
  },
  {
    id: '3',
    role: 'Кур\'єр',
    company: 'Glovo',
    price: 1500,
    time: '12:00 — 22:00',
    date: '15',
    dist: '3.1 км',
    hot: true,
    type: 'Кур\'єр',
    icon: 'delivery_dining',
    logo: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=100&auto=format&fit=crop&q=60',
    address: 'Одеса, Приморський бульвар, 1',
    details: 'Вільний графік, швидка реєстрація. Потрібен власний транспорт (вело, мото або авто).',
    requirements: [
      'Власний транспорт та смартфон',
      'Вміння орієнтуватися по місту',
      'Ввічливість та швидкість'
    ],
    responsibilities: [
      'Доставка замовлень з ресторанів та магазинів',
      'Дотримання температурного режиму доставки',
      'Спілкування з клієнтами'
    ]
  },
  {
    id: '4',
    role: 'Вантажник',
    company: 'Нова Пошта',
    price: 1100,
    time: '18:00 — 02:00',
    date: '15',
    dist: '5.0 км',
    hot: false,
    type: 'Склади',
    icon: 'package_2',
    logo: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=100&auto=format&fit=crop&q=60',
    address: 'Одеса, вул. Дальницька, 23 (Термінал 1)',
    details: 'Робота на вантажному терміналі. Фізично важка праця.',
    requirements: [
      'Хороша фізична форма',
      'Відсутність шкідливих звичок',
      'Уважність та дисциплінованість'
    ],
    responsibilities: [
      'Розвантаження та завантаження автомобілів',
      'Переміщення вантажів по складу',
      'Сортування посилок по напрямках'
    ]
  },
  {
    id: '5',
    role: 'Продавець-консультант',
    company: 'АТБ-Маркет',
    price: 1150,
    time: '08:00 — 20:00',
    date: '16',
    dist: '1.2 км',
    hot: false,
    type: 'Рітейл',
    icon: 'storefront',
    logo: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100&auto=format&fit=crop&q=60',
    address: 'Одеса, вул. Преображенська, 54',
    details: 'Робота в торговому залі супермаркету. Навчаємо на місці.',
    requirements: [
      'Комунікабельність та активність',
      'Наявність медичної книжки',
      'Уважність до деталей'
    ],
    responsibilities: [
      'Викладка товару на полиці',
      'Контроль термінів придатності',
      'Консультування покупців'
    ]
  },
  {
    id: '6',
    role: 'Касир',
    company: 'Сільпо',
    price: 1250,
    time: '10:00 — 22:00',
    date: '16',
    dist: '2.0 км',
    hot: true,
    type: 'Рітейл',
    icon: 'credit_card',
    logo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&auto=format&fit=crop&q=60',
    address: 'Одеса, вул. Генуезька, 24',
    details: 'Супермаркет Сільпо. Потрібно обслуговувати покупців на касі.',
    requirements: [
      'Ввічливість та стресостійкість',
      'Досвід роботи з касою буде перевагою',
      'Наявність медичної книжки'
    ],
    responsibilities: [
      'Розрахунок покупців на касі',
      'Контроль правильності розрахунків',
      'Дотримання стандартів обслуговування'
    ]
  },
  {
    id: '7',
    role: 'Офіціант',
    company: 'Львівські Круасани',
    price: 900,
    time: '09:00 — 21:00',
    date: '17',
    dist: '0.8 км',
    hot: false,
    type: 'Кафе',
    icon: 'restaurant',
    logo: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=100&auto=format&fit=crop&q=60',
    address: 'Одеса, вул. Катерининська, 12',
    details: 'Відома мережа пекарень. Шукаємо привітного офіціанта.',
    requirements: [
      'Охайність та приємна зовнішність',
      'Вміння працювати в команді',
      'Швидкість та уважність'
    ],
    responsibilities: [
      'Прийом замовлень у гостей',
      'Подача страв та напоїв',
      'Прибирання столів'
    ]
  },
  {
    id: '8',
    role: 'Кур\'єр на електровелосипеді',
    company: 'Bolt Food',
    price: 1600,
    time: '11:00 — 21:00',
    date: '17',
    dist: '1.8 км',
    hot: true,
    type: 'Кур\'єр',
    icon: 'electric_bike',
    logo: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=100&auto=format&fit=crop&q=60',
    address: 'Одеса, вул. Буніна, 10',
    details: 'Надаємо брендований електровелосипед та екіпірування.',
    requirements: [
      'Вміння їздити на велосипеді',
      'Смартфон з інтернетом',
      'Відповідальність'
    ],
    responsibilities: [
      'Швидка доставка замовлень їжі',
      'Дбайливе поводження з велосипедом',
      'Звітність у додатку'
    ]
  },
  {
    id: '9',
    role: 'Складальник меблів',
    company: 'JYSK',
    price: 1400,
    time: '10:00 — 19:00',
    date: '18',
    dist: '4.2 км',
    hot: false,
    type: 'Склади',
    icon: 'weekend',
    logo: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=100&auto=format&fit=crop&q=60',
    address: 'Одеса, вул. Фонтанська дорога, 33',
    details: 'Допомога у збиранні та викладці меблів у торговому залі JYSK.',
    requirements: [
      'Вміння працювати з базовими інструментами',
      'Уважність до креслень',
      'Акуратність'
    ],
    responsibilities: [
      'Розпакування та перевірка деталей меблів',
      'Збирання виставкових зразків за інструкцією',
      'Розміщення меблів у залі відповідно до планограми'
    ]
  },
  {
    id: '10',
    role: 'Продавець фруктів',
    company: 'Сільпо',
    price: 1050,
    time: '08:00 — 17:00',
    date: '18',
    dist: '2.0 км',
    hot: false,
    type: 'Рітейл',
    icon: 'nutrition',
    logo: 'https://images.unsplash.com/photo-1610348725531-843dff14722a?w=100&auto=format&fit=crop&q=60',
    address: 'Одеса, вул. Генуезька, 24',
    details: 'Потрібно сортувати та викладати фрукти у відділі.',
    requirements: [
      'Охайність та працьовитість',
      'Ввічливість у спілкуванні',
      'Наявність сан книжки'
    ],
    responsibilities: [
      'Сортування свіжих фруктів та овочів',
      'Викладка на прилавок, контроль цінників',
      'Важення та консультування покупців'
    ]
  },
  {
    id: '11',
    role: 'Помічник кухаря',
    company: 'Salad Bar',
    price: 1100,
    time: '09:00 — 19:00',
    date: '19',
    dist: '1.7 км',
    hot: false,
    type: 'Кафе',
    icon: 'soup_kitchen',
    logo: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=100&auto=format&fit=crop&q=60',
    address: 'Одеса, вул. Мала Арнаутська, 45',
    details: 'Допомога кухарям на кухні у підготовці інгредієнтів.',
    requirements: [
      'Швидкість у роботі з ножем',
      'Чистоплотність та охайність',
      'Наявність медичної книжки'
    ],
    responsibilities: [
      'Миття, чищення та нарізка овочів/зелені',
      'Підготовка заготовок для страв',
      'Прибирання кухонних поверхонь та миття посуду'
    ]
  },
  {
    id: '12',
    role: 'Кур\'єр з авто',
    company: 'Нова Пошта',
    price: 2100,
    time: '08:00 — 20:00',
    date: '19',
    dist: '3.5 км',
    hot: true,
    type: 'Кур\'єр',
    icon: 'local_shipping',
    logo: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=100&auto=format&fit=crop&q=60',
    address: 'Одеса, вул. Дальницька, 23',
    details: 'Доставка посилок на власному легкову автомобілі. Паливо компенсується.',
    requirements: [
      'Власний економний автомобіль',
      'Водійське посвідчення категорії B',
      'Смартфон з навігатором'
    ],
    responsibilities: [
      'Отримання посилок на відділенні',
      'Адресна доставка клієнтам',
      'Прийом оплати та звітність'
    ]
  }
];

const INITIAL_USER_SHIFTS: UserShift[] = [
  {
    id: 'us_1',
    shiftId: '2',
    role: 'Бариста',
    company: 'Aroma Kava',
    price: 950,
    time: '09:00 — 21:00',
    date: '15',
    address: 'Одеса, вул. Дерибасівська, 18',
    status: 'confirmed',
    logo: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=100&auto=format&fit=crop&q=60'
  },
  {
    id: 'us_2',
    shiftId: '4',
    role: 'Вантажник',
    company: 'Нова Пошта',
    price: 1100,
    time: '18:00 — 02:00',
    date: '15',
    address: 'Одеса, вул. Дальницька, 23 (Термінал 1)',
    status: 'pending',
    logo: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=100&auto=format&fit=crop&q=60'
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    title: 'Зміна: Бариста Aroma Kava',
    dateStr: '12 Червня, 21:10',
    amount: 950,
    status: 'completed',
    type: 'work'
  },
  {
    id: 'tx_2',
    title: 'Вивід на картку Mono',
    dateStr: '10 Червня, 14:20',
    amount: -3000,
    status: 'completed',
    type: 'withdrawal'
  },
  {
    id: 'tx_3',
    title: 'Зміна: Комплектувальник Rozetka',
    dateStr: '08 Червня, 20:30',
    amount: 1800,
    status: 'completed',
    type: 'work'
  },
  {
    id: 'tx_4',
    title: 'Вивід на картку Privat24',
    dateStr: '05 Червня, 11:15',
    amount: -5000,
    status: 'completed',
    type: 'withdrawal'
  }
];

let idCounter = 0;
const generateId = (prefix: string): string => {
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Settings
  const [language, setLanguage] = useState<Language>('uk');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // Authentication
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDiiaLogin, setShowDiiaLogin] = useState(false);
  const [showPhoneLogin, setShowPhoneLogin] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isDiiaScanning, setIsDiiaScanning] = useState(false);

  // Navigation
  const [activeTab, setActiveTab] = useState<WorkerTab>('search');
  const [selectedJob, setSelectedJob] = useState<Shift | null>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showPhoneFrame, setShowPhoneFrame] = useState<boolean>(false);

  // Search/Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Всі');
  const [selectedDate, setSelectedDate] = useState<string>('15');

  // Database States
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [myShifts, setMyShifts] = useState<UserShift[]>(INITIAL_USER_SHIFTS);
  const [balance, setBalance] = useState<number>(12450);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  // Role B2C/B2B
  const [userRole, setUserRole] = useState<UserRole>('worker');
  const [employerDeposit, setEmployerDeposit] = useState<number>(48200);
  const [b2bActiveTab, setB2bActiveTab] = useState<B2bActiveTab>('dashboard');
  const [employerCompany, setEmployerCompany] = useState<string>('Rozetka');

  // B2B Create Shift Form
  const [newShiftRole, setNewShiftRole] = useState('');
  const [newShiftCategory, setNewShiftCategory] = useState<'Склади' | 'Рітейл' | 'Кафе' | 'Кур\'єр'>('Склади');
  const [newShiftDate, setNewShiftDate] = useState('15');
  const [newShiftTime, setNewShiftTime] = useState('08:00 — 20:00');
  const [newShiftPrice, setNewShiftPrice] = useState('1200');
  const [newShiftAddress, setNewShiftAddress] = useState('');
  const [newShiftDetails, setNewShiftDetails] = useState('');
  const [newShiftRequirements, setNewShiftRequirements] = useState('');
  const [newShiftResponsibilities, setNewShiftResponsibilities] = useState('');

  // B2B Finance
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');

  // Active shifts sub-tab
  const [shiftsSubTab, setShiftsSubTab] = useState<'active' | 'history'>('active');

  // Modals & Overlays
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrModalShift, setQrModalShift] = useState<UserShift | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawCard, setWithdrawCard] = useState('4441 1144 5543 4321');
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [successOverlayMessage, setSuccessOverlayMessage] = useState('');
  const [successOverlayTitle, setSuccessOverlayTitle] = useState('');

  // Map Simulation
  const [showMap, setShowMap] = useState(false);
  const [mapSelectedJob, setMapSelectedJob] = useState<Shift | null>(null);

  // Profile Sub-pages
  const [activeProfileSubPage, setActiveProfileSubPage] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('Олексій Коваленко');
  const [profilePhone, setProfilePhone] = useState('+380 67 123 45 67');
  const [profileEmail, setProfileEmail] = useState('oleksii.k@example.com');
  const [profileCity, setProfileCity] = useState('Одеса');

  // Support Chat
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { id: '1', sender: 'support', text: 'Привіт! Я твій особистий помічник OneClick. Як я можу допомогти тобі сьогодні?', timestamp: '17:30' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Dark Mode
  useEffect(() => {
    const html = document.documentElement;
    if (darkModeEnabled) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [darkModeEnabled]);

  // Autocomplete withdrawal processing
  useEffect(() => {
    const hasProcessing = transactions.some(tx => tx.status === 'processing');
    if (hasProcessing) {
      const timer = setTimeout(() => {
        setTransactions(prev =>
          prev.map(tx => tx.status === 'processing' ? { ...tx, status: 'completed' as const } : tx)
        );
        triggerToast(language === 'uk' ? 'Виведення коштів успішно виконано!' : 'Funds withdrawal completed successfully!');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [transactions, language]);

  // Translations
  const t = useMemo(() => ({
    search: language === 'uk' ? 'Пошук' : 'Search',
    shifts: language === 'uk' ? 'Зміни' : 'Shifts',
    wallet: language === 'uk' ? 'Гаманець' : 'Wallet',
    profile: language === 'uk' ? 'Профіль' : 'Profile',
    hot: language === 'uk' ? 'ГАРЯЧА' : 'HOT',
    perShift: language === 'uk' ? 'за зміну' : 'per shift',
    apply: language === 'uk' ? 'Відгукнутися' : 'Apply',
    details: language === 'uk' ? 'Деталі' : 'Details',
    startShift: language === 'uk' ? 'Почати зміну' : 'Start Shift',
    activeShifts: language === 'uk' ? 'Активні' : 'Active',
    historyShifts: language === 'uk' ? 'Історія' : 'History',
    mon: language === 'uk' ? 'Пн' : 'Mon',
    tue: language === 'uk' ? 'Вт' : 'Tue',
    wed: language === 'uk' ? 'Ср' : 'Wed',
    thu: language === 'uk' ? 'Чт' : 'Thu',
    fri: language === 'uk' ? 'Пт' : 'Fri',
  }), [language]);

  // Filter shifts based on selections
  const filteredShifts = useMemo(() => {
    return shifts.filter(s => {
      const matchesDate = s.date === selectedDate;
      const matchesCategory = selectedCategory === 'Всі' || s.type === selectedCategory;
      const matchesSearch = s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            s.address.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDate && matchesCategory && matchesSearch;
    });
  }, [shifts, selectedDate, selectedCategory, searchQuery]);

  // Handlers
  const handleDiiaAuth = () => {
    setIsDiiaScanning(true);
    setTimeout(() => {
      setIsDiiaScanning(false);
      setIsLoggedIn(true);
      setShowDiiaLogin(false);
      triggerToast(language === 'uk' ? 'Авторизовано через Дію! Вітаємо, Олексію.' : 'Authorized via Diia! Welcome, Oleksii.');
    }, 2000);
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setIsOtpSent(true);
    triggerToast(language === 'uk' ? 'Код відправлено на телефон.' : 'Verification code sent to phone.');
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length === 4) {
      setIsLoggedIn(true);
      setShowPhoneLogin(false);
      triggerToast(language === 'uk' ? 'Вхід виконано!' : 'Logged in successfully!');
    } else {
      triggerToast(language === 'uk' ? 'Невірний код' : 'Invalid code');
    }
  };

  const handleApply = (job: Shift) => {
    const alreadyApplied = myShifts.some(ms => ms.shiftId === job.id);
    if (alreadyApplied) {
      triggerToast(language === 'uk' ? 'Ви вже відгукнулися на цю зміну!' : 'You have already applied for this shift!');
      return;
    }

    const newUserShift: UserShift = {
      id: generateId('us'),
      shiftId: job.id,
      role: job.role,
      company: job.company,
      price: job.price,
      time: job.time,
      date: job.date,
      address: job.address,
      status: 'pending',
      logo: job.logo,
      icon: job.icon
    };

    setMyShifts(prev => [newUserShift, ...prev]);
    setShowJobDetails(false);
    triggerToast(language === 'uk' ? `Успішний відгук на зміну: ${job.role}` : `Successfully applied for: ${job.role}`);

    // Auto-approve in 8 seconds for real simulation
    setTimeout(() => {
      setMyShifts(prev =>
        prev.map(ms => ms.shiftId === job.id && ms.status === 'pending' ? { ...ms, status: 'confirmed' as const } : ms)
      );
      triggerToast(language === 'uk' ? `Ваш відгук на ${job.role} підтверджено!` : `Your application for ${job.role} is approved!`);
    }, 8000);
  };

  const handleStartShiftSimulate = (userShift: UserShift) => {
    setQrModalShift(userShift);
    setShowQRModal(true);
  };

  const confirmCheckInSimulation = () => {
    if (!qrModalShift) return;
    setMyShifts(prev =>
      prev.map(ms => ms.id === qrModalShift.id ? { ...ms, status: 'in_progress' as const } : ms)
    );
    setShowQRModal(false);
    triggerToast(language === 'uk' ? 'Зміну розпочато! Вдалої роботи.' : 'Shift started! Have a great work.');
  };

  const handleCompleteShiftSimulate = (userShift: UserShift) => {
    setMyShifts(prev =>
      prev.map(ms => ms.id === userShift.id ? { ...ms, status: 'completed_pending_payout' as const } : ms)
    );

    setSuccessOverlayTitle(language === 'uk' ? 'Зміну завершено!' : 'Shift Completed!');
    setSuccessOverlayMessage(language === 'uk'
      ? `Звіт про роботу надіслано компанії ${userShift.company}. Перемкніться в "Кабінет Роботодавця" за допомогою кнопки B2B вгорі, щоб затвердити виплату ${userShift.price} ₴!`
      : `Work report submitted to ${userShift.company}. Switch to the "Employer Portal" using the B2B button at the top to approve the payout of ${userShift.price} ₴!`);
    setShowSuccessOverlay(true);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      triggerToast(language === 'uk' ? 'Введіть коректну суму' : 'Enter a valid amount');
      return;
    }
    if (amount > balance) {
      triggerToast(language === 'uk' ? 'Недостатньо коштів на балансі' : 'Insufficient balance');
      return;
    }

    setBalance(balance - amount);

    const newTx: Transaction = {
      id: generateId('tx'),
      title: language === 'uk' ? `Вивід на картку *${withdrawCard.slice(-4)}` : `Withdrawal to card *${withdrawCard.slice(-4)}`,
      dateStr: language === 'uk' ? 'Сьогодні, щойно' : 'Today, just now',
      amount: -amount,
      status: 'processing',
      type: 'withdrawal'
    };

    setTransactions(prev => [newTx, ...prev]);
    setShowWithdrawModal(false);
    setWithdrawAmount('');

    setSuccessOverlayTitle(language === 'uk' ? 'Заявку прийнято' : 'Request Accepted');
    setSuccessOverlayMessage(language === 'uk'
      ? `Виплата ${amount} ₴ в обробці. Завдяки спліт-системі OneClick гроші надійдуть на карту протягом 1 хвилини.`
      : `Withdrawal of ${amount} ₴ is processing. Thanks to OneClick split payment, the money will arrive in 1 minute.`);
    setShowSuccessOverlay(true);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: Message = {
      id: generateId('msg'),
      sender: 'user',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');

    setTimeout(() => {
      const supportMsg: Message = {
        id: generateId('msg'),
        sender: 'support',
        text: language === 'uk'
          ? 'Дякуємо за повідомлення! Менеджер підтримки OneClick вже вивчає твоє питання і відповість за 1-2 хвилини.'
          : 'Thank you for the message! A OneClick support manager is already reviewing your request and will reply in 1-2 minutes.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, supportMsg]);
    }, 1500);
  };

  // B2B Handlers
  const handleApproveApplication = (usId: string) => {
    setMyShifts(prev =>
      prev.map(ms => ms.id === usId ? { ...ms, status: 'confirmed' as const } : ms)
    );
    triggerToast(language === 'uk' ? 'Заявку кандидата успішно схвалено!' : 'Candidate application approved successfully!');
  };

  const handleDeclineApplication = (usId: string) => {
    setMyShifts(prev => prev.filter(ms => ms.id !== usId));
    triggerToast(language === 'uk' ? 'Заявку кандидата відхилено' : 'Candidate application declined');
  };

  const handleApprovePayout = (us: UserShift) => {
    if (employerDeposit < us.price) {
      triggerToast(language === 'uk'
        ? 'Недостатньо коштів на депозиті компанії! Будь ласка, поповніть рахунок.'
        : 'Insufficient funds in the company deposit! Please top up.');
      return;
    }

    setEmployerDeposit(prev => prev - us.price);
    setBalance(balance + us.price);

    setMyShifts(prev =>
      prev.map(ms => ms.id === us.id ? { ...ms, status: 'completed' as const } : ms)
    );

    const newTx: Transaction = {
      id: generateId('tx'),
      title: language === 'uk' ? `Зміна: ${us.role} в ${us.company}` : `Shift: ${us.role} at ${us.company}`,
      dateStr: language === 'uk' ? 'Сьогодні, щойно' : 'Today, just now',
      amount: us.price,
      status: 'completed',
      type: 'work'
    };
    setTransactions(prev => [newTx, ...prev]);

    setSuccessOverlayTitle(language === 'uk' ? 'Виплату виконано!' : 'Payout Transferred!');
    setSuccessOverlayMessage(language === 'uk'
      ? `Виплату за зміну ${us.role} в розмірі ${us.price} ₴ успішно перераховано працівнику!`
      : `Payout for ${us.role} shift of ${us.price} ₴ has been successfully transferred to the worker!`);
    setShowSuccessOverlay(true);
  };

  const handleCreateShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShiftRole.trim() || !newShiftAddress.trim() || !newShiftPrice) {
      triggerToast(language === 'uk' ? 'Заповніть обов\'язкові поля' : 'Fill in the required fields');
      return;
    }

    const priceNum = parseInt(newShiftPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      triggerToast(language === 'uk' ? 'Введіть коректну суму оплати' : 'Enter a valid payment amount');
      return;
    }

    const newJob: Shift = {
      id: generateId('sh'),
      role: newShiftRole,
      company: employerCompany,
      price: priceNum,
      time: newShiftTime,
      date: newShiftDate,
      dist: '1.2 км',
      hot: false,
      type: newShiftCategory,
      icon: newShiftCategory === 'Кафе' ? 'coffee' : newShiftCategory === 'Рітейл' ? 'storefront' : newShiftCategory === 'Кур\'єр' ? 'delivery_dining' : 'inventory_2',
      logo: employerCompany === 'Rozetka'
        ? 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&auto=format&fit=crop&q=60'
        : 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=100&auto=format&fit=crop&q=60',
      address: newShiftAddress,
      details: newShiftDetails || (language === 'uk' ? 'Опис роботи та обов\'язків від роботодавця.' : 'Work description and duties from the employer.'),
      requirements: newShiftRequirements ? newShiftRequirements.split(',').map(r => r.trim()) : [language === 'uk' ? 'Пунктуальність' : 'Punctuality', language === 'uk' ? 'Відповідальність' : 'Responsibility'],
      responsibilities: newShiftResponsibilities ? newShiftResponsibilities.split(',').map(r => r.trim()) : [language === 'uk' ? 'Виконання доручень керівника' : 'Fulfillment of manager orders']
    };

    setShifts(prev => [newJob, ...prev]);

    setNewShiftRole('');
    setNewShiftAddress('');
    setNewShiftDetails('');
    setNewShiftRequirements('');
    setNewShiftResponsibilities('');
    setNewShiftPrice('1200');

    triggerToast(language === 'uk' ? 'Зміну успішно створено та опубліковано!' : 'Shift successfully created and published!');
    setB2bActiveTab('shifts');
  };

  const handleApplyTemplate = (role: string, category: 'Склади' | 'Рітейл' | 'Кафе' | 'Кур\'єр', price: string, address: string) => {
    setNewShiftRole(role);
    setNewShiftCategory(category);
    setNewShiftPrice(price);
    setNewShiftAddress(address);
    triggerToast(language === 'uk' ? 'Шаблон успішно застосовано!' : 'Template applied successfully!');
  };

  const handleTopUpDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) {
      triggerToast(language === 'uk' ? 'Введіть коректну суму' : 'Enter a valid amount');
      return;
    }

    setEmployerDeposit(prev => prev + amount);
    setShowTopUpModal(false);
    setTopUpAmount('');
    triggerToast(language === 'uk' ? `Депозит успішно поповнено на +${amount} ₴!` : `Deposit successfully replenished with +${amount} ₴!`);
  };

  return (
    <AppContext.Provider value={{
      language, setLanguage, t,
      isLoggedIn, setIsLoggedIn,
      showDiiaLogin, setShowDiiaLogin,
      showPhoneLogin, setShowPhoneLogin,
      phoneNumber, setPhoneNumber,
      otpCode, setOtpCode,
      isOtpSent, setIsOtpSent,
      isDiiaScanning, setIsDiiaScanning,
      handleDiiaAuth, handlePhoneSubmit, handleOtpSubmit,
      activeTab, setActiveTab,
      selectedJob, setSelectedJob,
      showJobDetails, setShowJobDetails,
      showPhoneFrame, setShowPhoneFrame,
      searchQuery, setSearchQuery,
      selectedCategory, setSelectedCategory,
      selectedDate, setSelectedDate,
      filteredShifts,
      shifts, setShifts,
      myShifts, setMyShifts,
      balance, setBalance,
      transactions, setTransactions,
      userRole, setUserRole,
      employerDeposit, setEmployerDeposit,
      b2bActiveTab, setB2bActiveTab,
      employerCompany, setEmployerCompany,
      newShiftRole, setNewShiftRole,
      newShiftCategory, setNewShiftCategory,
      newShiftDate, setNewShiftDate,
      newShiftTime, setNewShiftTime,
      newShiftPrice, setNewShiftPrice,
      newShiftAddress, setNewShiftAddress,
      newShiftDetails, setNewShiftDetails,
      newShiftRequirements, setNewShiftRequirements,
      newShiftResponsibilities, setNewShiftResponsibilities,
      handleCreateShift, handleApplyTemplate,
      handleApproveApplication, handleDeclineApplication, handleApprovePayout,
      showTopUpModal, setShowTopUpModal,
      topUpAmount, setTopUpAmount, handleTopUpDepositSubmit,
      handleApply, handleStartShiftSimulate, handleCompleteShiftSimulate,
      showWithdrawModal, setShowWithdrawModal,
      withdrawAmount, setWithdrawAmount,
      withdrawCard, setWithdrawCard, handleWithdrawSubmit,
      activeProfileSubPage, setActiveProfileSubPage,
      profileName, setProfileName,
      profilePhone, setProfilePhone,
      profileEmail, setProfileEmail,
      profileCity, setProfileCity,
      notificationsEnabled, setNotificationsEnabled,
      darkModeEnabled, setDarkModeEnabled,
      chatMessages, chatInput, setChatInput, handleSendMessage,
      showQRModal, setShowQRModal,
      qrModalShift, setQrModalShift, confirmCheckInSimulation,
      showSuccessOverlay, setShowSuccessOverlay,
      successOverlayMessage, setSuccessOverlayMessage,
      successOverlayTitle, setSuccessOverlayTitle,
      showMap, setShowMap,
      mapSelectedJob, setMapSelectedJob,
      toastMessage, triggerToast,
      shiftsSubTab, setShiftsSubTab
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
