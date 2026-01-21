
export type Role = 'admin' | 'user';

export interface Location {
  id: string;
  name: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: Role;
  default_location_id: string;
  name?: string;
}

export interface DailyReport {
  id: string;
  date: string;
  location_id: string;
  user_id: string;
  bakery_sales: number;
  bakery_loss: number;
  pastry_sales: number;
  pastry_loss: number;
  created_at: string;
}

export interface Target {
  id: string;
  location_id: string;
  month: number;
  year: number;
  bakery_daily_target: number;
  bakery_monthly_target: number;
  pastry_daily_target: number;
  pastry_monthly_target: number;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_location_id: string | null; // null for 'All'
  content: string;
  created_at: string;
  sender_name?: string;
}

export interface DashboardStats {
  totalDailySales: number;
  totalMonthlyPerformance: number;
  topLocation: string;
}
