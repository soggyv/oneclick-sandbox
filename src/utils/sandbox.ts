import { Shift } from '../types/sandbox';

export const POPULAR_ROLES = ["Бариста", "Вантажник", "Продавець", "Касир", "Офіціант", "Кур'єр", "Координатор", "Волонтер"];

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
    company: 'Rozetka',
    role: 'Комплектувальник',
    date: getRelativeDateInfo(1).date,
    dayName: getRelativeDateInfo(1).dayName,
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
      { id: 'r1', workerName: 'Дмитро К.', rating: 5, date: getRelativeDateString(-9), comment: 'Теплий склад, чудовий бригадир. Виплатили гроші через 5 хвилин після закінчення зміни!' },
      { id: 'r2', workerName: 'Ольга С.', rating: 4, date: getRelativeDateString(-11), comment: 'Робота на ногах, трохи втомлюєшся. Але умови супер, є безкоштовна кава та чай в обід.' }
    ]
  },
  {
    id: '2',
    company: 'Aroma Kava',
    role: 'Бариста',
    date: getRelativeDateInfo(1).date,
    dayName: getRelativeDateInfo(1).dayName,
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
      { id: 'r3', workerName: 'Аліна М.', rating: 5, date: getRelativeDateString(-7), comment: 'Дуже привітний менеджер та дружній колектив. Потік клієнтів великий, але час пролітає непомітно.' },
      { id: 'r4', workerName: 'Сергій П.', rating: 5, date: getRelativeDateString(-14), comment: 'Локація в самому центрі, зручно діставатися. Оплата день в день без затримок.' }
    ]
  },
  {
    id: '3',
    company: 'Glovo',
    role: 'Кур\'єр',
    date: getRelativeDateInfo(2).date,
    dayName: getRelativeDateInfo(2).dayName,
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
      { id: 'r5', workerName: 'Ігор Т.', rating: 4, date: getRelativeDateString(-8), comment: 'Багато замовлень у вечірні години, робота активна. Техпідтримка отвечает оперативно.' }
    ]
  },
  {
    id: '4',
    company: 'Нова Пошта',
    role: 'Вантажник',
    date: getRelativeDateInfo(3).date,
    dayName: getRelativeDateInfo(3).dayName,
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
      { id: 'r6', workerName: 'Павло Р.', rating: 4, date: getRelativeDateString(-12), comment: 'Важка фізична праця, але оплата чесна та вчасна. Склад чистий і добре освітлений.' }
    ]
  }
];
