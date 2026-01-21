
import React from 'react';
import { MENU_ITEMS } from '../constants';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Role } from '../types';

interface SidebarProps {
  isOpen: boolean;
  activeTab: string;
  onTabChange: (id: string) => void;
  userRole: Role;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeTab, onTabChange, userRole, onLogout }) => {
  const filteredItems = MENU_ITEMS.filter(item => item.roles.includes(userRole));

  return (
    <div className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0">
          R
        </div>
        {isOpen && <span className="font-bold text-slate-800 tracking-tight">Rzepka Admin</span>}
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              activeTab === item.id 
                ? 'bg-amber-50 text-amber-700 font-medium' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <span className={activeTab === item.id ? 'text-amber-600' : 'text-slate-400'}>
              {item.icon}
            </span>
            {isOpen && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut size={20} />
          {isOpen && <span className="font-medium">Wyloguj</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
