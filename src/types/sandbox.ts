export interface DisputeMessage {
  id: string;
  sender: 'system' | 'manager' | 'employer' | 'worker';
  text: string;
  timestamp: string;
}

export interface Review {
  id: string;
  workerName: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Shift {
  id: string;
  company: string;
  role: string;
  date: string;
  dayName: string;
  time: string;
  duration: string;
  price: number;
  address: string;
  status: 'open' | 'booked' | 'in_progress' | 'pending_approval' | 'disputed' | 'completed' | 'expired';
  category: 'Кава' | 'Рітейл' | 'Склади' | 'University Event / Volunteer';
  logo?: string;
  isHot?: boolean;
  details?: string;
  requirements?: string[];
  reviews?: Review[];
  hasFeedback?: boolean;
  allowFeedback?: boolean;
  workPhoto?: string;
  workComment?: string;
  disputeReason?: string;
  disputeComment?: string;
  disputeStatus?: 'under_review' | 'pending_settlement';
  volunteerReward?: string;
  worker_id?: string | null;
  latitude?: number;
  longitude?: number;
  requiresScreening?: boolean;
  templateName?: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  status: 'completed' | 'processing';
  type: 'work' | 'withdrawal';
}

export interface UkCalendarDay {
  day: string;
  date: string;
}

export interface B2BTemplate {
  id: string;
  name: string;
  role: string;
  company: string;
  category: Shift['category'];
  price: string;
  time: string;
  duration: string;
  address: string;
  details: string;
  requiresScreening: boolean;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  requiresScreening: boolean;
}
