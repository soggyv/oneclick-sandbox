export interface Shift {
  id: string;
  role: string;
  company: string;
  price: number;
  time: string;
  date: string; // '15' | '16' | '17' | '18' | '19'
  dist: string;
  hot: boolean;
  type: 'Склади' | 'Рітейл' | 'Кафе' | 'Кур\'єр';
  icon: string;
  logo?: string;
  address: string;
  details: string;
  requirements: string[];
  responsibilities: string[];
}

export interface UserShift {
  id: string;
  shiftId: string;
  role: string;
  company: string;
  price: number;
  time: string;
  date: string;
  address: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'completed_pending_payout';
  logo?: string;
  icon?: string;
}

export interface Transaction {
  id: string;
  title: string;
  dateStr: string;
  amount: number;
  status: 'completed' | 'processing' | 'failed';
  type: 'work' | 'withdrawal';
}

export interface Message {
  id: string;
  sender: 'user' | 'support';
  text: string;
  timestamp: string;
}

export type Language = 'uk' | 'en';
export type UserRole = 'worker' | 'employer';
export type B2bActiveTab = 'dashboard' | 'post-shift' | 'shifts' | 'applications' | 'checkins' | 'finance';
export type WorkerTab = 'search' | 'shifts' | 'wallet' | 'profile';
