
export type Role = 'admin' | 'user';

// Adding missing type for loss targets used in budgeting
export type LossTargetType = 'percent' | 'amount';

export interface UserProfile {
  id: string;
  email: string;
  role: Role;
  first_name?: string | null;
  last_name?: string | null;
  default_location_id?: string | null;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  status: string;
}
