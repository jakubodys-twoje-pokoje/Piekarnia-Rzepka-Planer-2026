import React, { useState, useEffect } from 'react';
import { MENU_ITEMS, MenuItem } from '../constants';
import { LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { Role } from '../types';

interface SidebarProps {
  isOpen: boolean;
  activeTab: string;
  onTabChange: (id: string) => void;
  userRole: Role;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeTab, onTabChange, userRole, onLogout }) => {
  // Automatyczne rozwijanie grupy, która zawiera aktywny element
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  useEffect(() => {
    const parentGroup = MENU_ITEMS.find(item => 
      item.subItems?.some(sub => sub.id === activeTab)
    );
    if (parentGroup && !expandedItems.includes(parentGroup.id)) {
      setExpandedItems(prev => [...prev, parentGroup.id]);
    }
  }, [activeTab]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredItems = MENU_ITEMS.filter(item => item.roles.includes(userRole));

  const isSubItemActive = (item: MenuItem) => {
    return item.subItems?.some(sub => sub.id === activeTab);
  };

  return (
    <div className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col ${isOpen ? 'w-64' : 'w-20'}`}>
      <div className="p-6 flex items-center gap-3 border-b border-slate-100 shrink-0">
        <div className="w-10 h-10 bg-white rounded-xl p-1.5 flex items-center justify-center overflow-hidden shrink-0 shadow-lg shadow-amber-600/10 border border-amber-500/20">
          <img 
            src="https://stronyjakubowe.pl/wp-content/uploads/2026/01/89358602_111589903786829_6313621308307406848_n.jpg" 
            alt="Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        {isOpen && <span className="font-black text-slate-800 tracking-tight uppercase text-xs">System Rzepka</span>}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredItems.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isExpanded = expandedItems.includes(item.id);
          const isActive = activeTab === item.id || isSubItemActive(item);

          return (
            <div key={item.id} className="space-y-1">
              <button
                onClick={() => hasSubItems ? toggleExpand(item.id) : onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                  isActive && !hasSubItems
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20 font-bold' 
                    : isActive && hasSubItems
                    ? 'bg-slate-900 text-white shadow-md font-bold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive ? (isActive && !hasSubItems ? 'text-white' : 'text-amber-500') : 'text-slate-400'}`}>
                    {item.icon}
                  </span>
                  {isOpen && <span className="text-[13px] tracking-tight">{item.label}</span>}
                </div>
                {isOpen && hasSubItems && (
                  <span className={`${isActive ? 'text-white/40' : 'text-slate-300'}`}>
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                )}
              </button>

              {isOpen && hasSubItems && isExpanded && (
                <div className="ml-5 mt-1 space-y-1 border-l-2 border-slate-100 pl-4 animate-in slide-in-from-top-2 duration-300">
                  {item.subItems!.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => onTabChange(sub.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] transition-all ${
                        activeTab === sub.id
                          ? 'text-amber-700 font-black bg-amber-50/50 translate-x-1'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-bold'
                      }`}
                    >
                      <span className={activeTab === sub.id ? 'text-amber-500' : 'text-slate-300'}>
                        {sub.icon}
                      </span>
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-all font-bold text-[13px]"
        >
          <LogOut size={20} />
          {isOpen && <span className="tracking-tight uppercase text-[10px] font-black">Wyloguj system</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;