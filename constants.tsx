
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
  Database
} from 'lucide-react';

export const LOCATIONS = [
  { id: '1', name: 'JĘDRZYCHÓW', address: 'ul. Diamentowa 2', status: 'active' },
  { id: '2', name: 'KUPIECKA', address: 'ul. Kupiecka 15', status: 'active' },
  { id: '3', name: 'NIEPODLEGŁOŚCI', address: 'al. Niepodległości 22', status: 'active' },
  { id: '4', name: 'FABRYCZNA', address: 'ul. Fabryczna 4', status: 'active' },
  { id: '5', name: 'PODGÓRNA', address: 'ul. Podgórna 12', status: 'active' },
  { id: '6', name: 'ŁĘŻYCA', address: 'ul. Odrzańska 1', status: 'active' },
  { id: '7', name: 'PLAC POCZTOWY', address: 'Plac Pocztowy 5', status: 'active' }
];

export const MONTHS = [
  'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
  'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
];

export const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['admin', 'user'] },
  { id: 'entry', label: 'Wprowadzanie', icon: <PlusCircle size={20} />, roles: ['user'] },
  { id: 'history', label: 'Historia', icon: <History size={20} />, roles: ['user'] },
  { id: 'reports-simple', label: 'Raport Szybki', icon: <TrendingUp size={20} />, roles: ['admin'] },
  { id: 'reports-advanced', label: 'Analityka PRO', icon: <BarChart3 size={20} />, roles: ['admin'] },
  { id: 'reports-data', label: 'Baza Raportów', icon: <Database size={20} />, roles: ['admin'] },
  { id: 'budgets', label: 'Budżety', icon: <TargetIcon size={20} />, roles: ['admin'] },
  { id: 'locations', label: 'Punkty', icon: <MapPin size={20} />, roles: ['admin'] },
  { id: 'users', label: 'Użytkownicy', icon: <UsersIcon size={20} />, roles: ['admin'] },
  { id: 'messages', label: 'Wiadomości', icon: <MessageSquare size={20} />, roles: ['admin', 'user'] },
];
