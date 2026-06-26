import { Shift } from '../types/sandbox';

export const POPULAR_ROLES = ["Координатор", "Помічник", "Фотограф", "Асистент", "Куратор", "Реєстратор", "Спікер", "Волонтер"];

// Helper to get relative date and day name
export const getRelativeDateInfo = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const ukDays = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  return {
    date: String(d.getDate()),
    dayName: ukDays[d.getDay()]
  };
};

export const getRelativeDateString = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const getUkMonthGenitive = (_dateVal?: string | number): string => {
  // Return month genitive name based on current date
  const monthNames = [
    'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
    'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'
  ];
  if (_dateVal) {
    // Parameter is kept for call signature compatibility across components
  }
  return monthNames[new Date().getMonth()];
};

// Helper to calculate hours remaining to shift start
export const getHoursRemaining = (shift: Shift, selectedDate: string, simulateDeadline: boolean, nowDate: Date): number => {
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
export const formatRemainingTime = (hours: number): string => {
  if (hours <= 0) return 'Почалася';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `Залишилось ${m} хв`;
  return `Залишилось ${h} год ${m} хв`;
};

// --- INITIAL MOCK DATA ---
export const getInitialShifts = (): Shift[] => [
  {
    id: '1',
    company: 'Студрада ФІОТ',
    role: 'Помічник на хакатоні',
    date: getRelativeDateInfo(1).date,
    dayName: getRelativeDateInfo(1).dayName,
    time: '14:00 — 18:00',
    duration: '4 год',
    price: 300,
    volunteerReward: '+30 балів рейтингу',
    address: 'Київ, Колізей KPI, вул. Політехнічна, 35',
    status: 'open',
    category: 'Допомога',
    logo: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&auto=format&fit=crop&q=60',
    isHot: true,
    details: 'Допомога в організації та координації команд на хакатоні KPI Open. Зустріч гостей, чергування на локаціях.',
    requirements: ['Комунікабельність', 'Вміння працювати в команді'],
    reviews: [
      { id: 'r1', workerName: 'Дмитро К.', rating: 5, date: getRelativeDateString(-9), comment: 'Неймовірний хакатон, чудова команда організаторів. Бали нарахували одразу!' },
      { id: 'r2', workerName: 'Ольга С.', rating: 5, date: getRelativeDateString(-11), comment: 'Класний досвід волонтерства, безкоштовна піца та фірмовий мерч хакатону.' }
    ]
  },
  {
    id: '2',
    company: 'Деканат ФІОТ',
    role: 'Куратор першокурсників',
    date: getRelativeDateInfo(1).date,
    dayName: getRelativeDateInfo(1).dayName,
    time: '12:00 — 18:00',
    duration: '6 год',
    price: 500,
    volunteerReward: '+50 балів рейтингу',
    address: 'Київ, Корпус 18 KPI, пр-т Берестейський, 37',
    status: 'open',
    category: 'Кураторство',
    logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=100&auto=format&fit=crop&q=60',
    isHot: false,
    details: 'Проведення ознайомчих екскурсій корпусом та допомога першокурсникам з адаптацією в університеті.',
    requirements: ['Студент 2-4 курсу', 'Активна життєва позиція'],
    allowFeedback: false,
    reviews: [
      { id: 'r3', workerName: 'Аліна М.', rating: 5, date: getRelativeDateString(-7), comment: 'Дуже рада була допомогти першачкам! Корисна ініціатива від деканату.' },
      { id: 'r4', workerName: 'Сергій П.', rating: 5, date: getRelativeDateString(-14), comment: 'Чудові куратори, все організовано на вищому рівні.' }
    ]
  },
  {
    id: '3',
    company: 'Наукове Товариство',
    role: 'Асистент на конференції',
    date: getRelativeDateInfo(2).date,
    dayName: getRelativeDateInfo(2).dayName,
    time: '12:00 — 14:00',
    duration: '2 год',
    price: 400,
    volunteerReward: '+40 балів рейтингу',
    address: 'Київ, Бібліотека KPI, площа Знань, 1',
    status: 'open',
    category: 'Наука',
    logo: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=100&auto=format&fit=crop&q=60',
    isHot: true,
    details: 'Реєстрація учасників конференції, допомога з презентаціями, координація кава-брейків.',
    requirements: ['Відповідальність', 'Базова технічна грамотність'],
    reviews: [
      { id: 'r5', workerName: 'Ігор Т.', rating: 4, date: getRelativeDateString(-8), comment: 'Багато цікавих доповідей, вдалося сумістити волонтерство з прослуховуванням лекцій.' }
    ]
  },
  {
    id: '4',
    company: 'Медіа-центр KPI',
    role: 'Фотограф заходу',
    date: getRelativeDateInfo(3).date,
    dayName: getRelativeDateInfo(3).dayName,
    time: '18:00 — 21:00',
    duration: '3 год',
    price: 250,
    volunteerReward: '+25 балів рейтингу',
    address: 'Київ, Площа Знань, пр-т Берестейський, 37',
    status: 'open',
    category: 'Допомога',
    logo: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=100&auto=format&fit=crop&q=60',
    isHot: false,
    details: 'Репортажна зйомка виступів спікерів, лекторіїв та відвідувачів на дні відкритих дверей.',
    requirements: ['Власна фотокамера', 'Наявність портфоліо'],
    reviews: [
      { id: 'r6', workerName: 'Павло Р.', rating: 4, date: getRelativeDateString(-12), comment: 'Гарна локація для фотозйомки, дружня атмосфера.' }
    ]
  }
];
