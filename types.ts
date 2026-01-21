
export type Role = 'admin' | 'user';
export type LossTargetType = 'percent' | 'amount';

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

export interface Target {
  id: string;
  location_id: string;
  month: number;
  year: number;
  bakery_daily_target: number;
  bakery_loss_target: number;
  bakery_loss_type: LossTargetType;
  pastry_daily_target: number;
  pastry_loss_target: number;
  pastry_loss_type: LossTargetType;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_location_id: string | null;
  content: string;
  created_at: string;
  is_read: boolean;
  is_urgent?: boolean;
}
