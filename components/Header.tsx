
import React from 'react';
import { Menu, User, ShieldCheck } from 'lucide-react';
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
          className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors lg:hidden"
        >
          <Menu size={20} />
        </button>
        
        {isAdmin && (
          <div className="hidden sm:flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Panel Zarządzania</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pl-4">
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
