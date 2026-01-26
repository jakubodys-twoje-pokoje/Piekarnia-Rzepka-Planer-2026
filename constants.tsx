
import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Users as UsersIcon, 
  MapPin,
  ClipboardList,
  MessageSquare,
  BarChart3,
  Target,
  PieChart,
  Zap
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

export const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Panel główny', icon: <LayoutDashboard size={20} />, roles: ['admin', 'user', 'apprentice'] },
  { id: 'messages', label: 'Komunikaty', icon: <MessageSquare size={20} />, roles: ['admin', 'user', 'apprentice'] },
  { id: 'entry', label: 'Nowy raport', icon: <PlusCircle size={20} />, roles: ['user', 'admin', 'apprentice'] },
  { id: 'history', label: 'Historia wpisów', icon: <History size={20} />, roles: ['user', 'admin', 'apprentice'] },
  { 
    id: 'analytics', 
    label: 'Analizy', 
    icon: <BarChart3 size={20} />, 
    roles: ['admin'],
    subItems: [
      { id: 'analytics-simple', label: 'Przegląd', icon: <PieChart size={16} />, roles: ['admin'] },
      { id: 'analytics-advanced', label: 'Zaawansowane', icon: <Zap size={16} />, roles: ['admin'] },
    ]
  },
  { id: 'budgets', label: 'Budżetowanie', icon: <Target size={20} />, roles: ['admin'] },
  { id: 'reports-data', label: 'Dziennik raportów', icon: <ClipboardList size={20} />, roles: ['admin'] },
  { id: 'locations', label: 'Punkty sprzedaży', icon: <MapPin size={20} />, roles: ['admin'] },
  { id: 'users', label: 'Zespół', icon: <UsersIcon size={20} />, roles: ['admin'] },
];
