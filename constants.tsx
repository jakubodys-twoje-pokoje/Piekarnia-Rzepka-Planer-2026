
import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Target as TargetIcon, 
  Users as UsersIcon, 
  MessageSquare,
  TrendingUp,
  BarChart3,
  MapPin,
  Database,
  CalendarDays,
  CalendarRange,
  Settings,
  ClipboardList,
  Activity,
  BellRing
} from 'lucide-react';

export const LOCATIONS = [
  { id: '1', name: 'JĘDRZYCHÓW', address: 'ul. Diamentowa 2', status: 'aktywny' },
  { id: '2', name: 'KUPIECKA', address: 'ul. Kupiecka 15', status: 'aktywny' },
  { id: '3', name: 'NIEPODLEGŁOŚCI', address: 'al. Niepodległości 22', status: 'aktywny' },
  { id: '4', name: 'FABRYCZNA', address: 'ul. Fabryczna 4', status: 'aktywny' },
  { id: '5', name: 'PODGÓRNA', address: 'ul. Podgórna 12', status: 'aktywny' },
  { id: '6', name: 'ŁĘŻYCA', address: 'ul. Odrzańska 1', status: 'aktywny' },
  { id: '7', name: 'PLAC POCZTOWY', address: 'Plac Pocztowy 5', status: 'aktywny' }
];

export const MONTHS = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  roles: string[];
  subItems?: { id: string; label: string; icon: React.ReactNode }[];
}

export const MENU_ITEMS: MenuItem[] = [
  { id: 'dashboard', label: 'Panel główny', icon: <LayoutDashboard size={20} />, roles: ['admin', 'user'] },
  
  { id: 'entry', label: 'Nowy raport', icon: <PlusCircle size={20} />, roles: ['user'] },
  { id: 'history', label: 'Archiwum wpisów', icon: <History size={20} />, roles: ['user'] },

  { 
    id: 'analytics-group', 
    label: 'Analityka i Wyniki', 
    icon: <BarChart3 size={20} />, 
    roles: ['admin'],
    subItems: [
      { id: 'reports-simple', label: 'Stan sieci (Live)', icon: <Activity size={16} /> },
      { id: 'reports-monthly', label: 'Analiza miesięczna', icon: <CalendarDays size={16} /> },
      { id: 'reports-yearly', label: 'Analiza roczna', icon: <CalendarRange size={16} /> },
    ]
  },
  { 
    id: 'ops-group', 
    label: 'Zarządzanie Dane', 
    icon: <Database size={20} />, 
    roles: ['admin'],
    subItems: [
      { id: 'reports-data', label: 'Dziennik raportów', icon: <ClipboardList size={16} /> },
      { id: 'budgets', label: 'Plany sprzedaży', icon: <TargetIcon size={16} /> },
    ]
  },
  { 
    id: 'config-group', 
    label: 'Ustawienia Sieci', 
    icon: <Settings size={20} />, 
    roles: ['admin'],
    subItems: [
      { id: 'locations', label: 'Punkty sprzedaży', icon: <MapPin size={16} /> },
      { id: 'users', label: 'Pracownicy i konta', icon: <UsersIcon size={16} /> },
    ]
  },
  { 
    id: 'comm-group', 
    label: 'Komunikacja', 
    icon: <BellRing size={20} />, 
    roles: ['admin', 'user'],
    subItems: [
      { id: 'messages', label: 'Wiadomości i ogłoszenia', icon: <MessageSquare size={16} /> },
    ]
  },
];
