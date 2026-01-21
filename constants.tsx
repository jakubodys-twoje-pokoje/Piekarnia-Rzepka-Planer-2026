
import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Settings, 
  Target as TargetIcon, 
  Users as UsersIcon, 
  MessageSquare,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export const LOCATIONS = [
  { id: '1', name: 'JĘDRZYCHÓW' },
  { id: '2', name: 'KUPIECKA' },
  { id: '3', name: 'NIEPODLEGŁOŚCI' },
  { id: '4', name: 'FABRYCZNA' },
  { id: '5', name: 'PODGÓRNA' },
  { id: '6', name: 'ŁĘŻYCA' },
  { id: '7', name: 'PLAC POCZTOWY' }
];

export const MONTHS = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

export const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['admin', 'user'] },
  { id: 'entry', label: 'Wprowadzanie', icon: <PlusCircle size={20} />, roles: ['user'] },
  { id: 'history', label: 'Historia', icon: <History size={20} />, roles: ['user'] },
  { id: 'reports', label: 'Raporty', icon: <TrendingUp size={20} />, roles: ['admin'] },
  { id: 'budgets', label: 'Budżety', icon: <TargetIcon size={20} />, roles: ['admin'] },
  { id: 'users', label: 'Użytkownicy', icon: <UsersIcon size={20} />, roles: ['admin'] },
  { id: 'messages', label: 'Wiadomości', icon: <MessageSquare size={20} />, roles: ['admin', 'user'] },
];
