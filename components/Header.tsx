
import React from 'react';
import { Menu, Bell, Search, User } from 'lucide-react';
import { UserProfile } from '../types';
import { LOCATIONS } from '../constants';

interface HeaderProps {
  onToggleSidebar: () => void;
  user: UserProfile;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, user }) => {
  const locationName = LOCATIONS.find(l => l.id === user.default_location_id)?.name || 'Centrala';

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0 z-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          {locationName}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Szukaj..." 
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
        <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 border-2 border-white rounded-full"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{user.email.split('@')[0]}</p>
            <p className="text-xs text-slate-500 capitalize">{user.role}</p>
          </div>
          <div className="w-9 h-9 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-slate-500 overflow-hidden">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
