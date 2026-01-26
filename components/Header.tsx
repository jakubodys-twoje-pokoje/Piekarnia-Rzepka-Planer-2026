
import React from 'react';
import { Menu, Bell, Search, User, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  user: UserProfile;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, user }) => {
  const isAdmin = user.role === 'admin';
  const displayName = user.first_name && user.last_name 
    ? `${user.first_name} ${user.last_name}` 
    : user.email.split('@')[0];

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0 z-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        
        {/* Wskaźnik globalny - Widoczny TYLKO dla administratora */}
        {isAdmin && (
          <div className="hidden sm:flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Panel Zarządzania</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Szukaj w systemie..." 
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
        <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-800 leading-none">{displayName}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
              {isAdmin ? 'Administrator' : 'Pracownik'}
            </p>
          </div>
          <div className={`w-9 h-9 border rounded-full flex items-center justify-center overflow-hidden ${
            isAdmin ? 'bg-amber-100 border-amber-200 text-amber-700' : 'bg-slate-100 border-slate-200 text-slate-500'
          }`}>
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
