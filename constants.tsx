
import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Users as UsersIcon, 
  MapPin,
  ClipboardList,
  MessageSquare
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
  subItems?: MenuItem[];
}

export const MONTHS = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

// Fallback dla lokalizacji, jeśli baza nie odpowie
export const LOCATIONS = [
  { id: '1', name: 'JĘDRZYCHÓW' },
  { id: '2', name: 'KUPIECKA' },
  { id: '3', name: 'NIEPODLEGŁOŚCI' },
  { id: '4', name: 'FABRYCZNA' }
];

export const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Panel główny', icon: <LayoutDashboard size={20} />, roles: ['admin', 'user'] },
  { id: 'messages', label: 'Komunikaty', icon: <MessageSquare size={20} />, roles: ['admin', 'user'] },
  { id: 'entry', label: 'Nowy raport', icon: <PlusCircle size={20} />, roles: ['user', 'admin'] },
  { id: 'history', label: 'Historia wpisów', icon: <History size={20} />, roles: ['user', 'admin'] },
  { id: 'reports-data', label: 'Dziennik raportów', icon: <ClipboardList size={20} />, roles: ['admin'] },
  { id: 'locations', label: 'Punkty sprzedaży', icon: <MapPin size={20} />, roles: ['admin'] },
  { id: 'users', label: 'Zespół', icon: <UsersIcon size={20} />, roles: ['admin'] },
];
