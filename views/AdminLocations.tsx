
import React, { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, Search, Store, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { LOCATIONS } from '../constants';

const AdminLocations: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [locations, setLocations] = useState(LOCATIONS.map(l => ({
    ...l,
    dailyAvg: Math.floor(1500 + Math.random() * 2000),
    staffCount: Math.floor(2 + Math.random() * 4)
  })));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sieć Sprzedaży</h1>
          <p className="text-sm text-slate-500 font-medium">Zarządzanie punktami i lokalizacjami Piekarni Rzepka.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl active:scale-95"
        >
          <Plus size={16} />
          Dodaj Nowy Punkt
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((loc) => (
          <div key={loc.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 hover:border-amber-500 transition-all group">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-amber-500 group-hover:text-white transition-all">
                <Store size={28} />
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-amber-600 bg-slate-50 rounded-xl transition-all"><Edit2 size={16}/></button>
                <button className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 rounded-xl transition-all"><Trash2 size={16}/></button>
              </div>
            </div>
            
            <div className="space-y-1 mb-6">
              <h3 className="text-xl font-black text-slate-800 tracking-tight">{loc.name}</h3>
              <p className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                <MapPin size={12} className="text-amber-500" />
                {loc.address}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 p-3 rounded-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Śr. Przychód</p>
                <p className="text-sm font-black text-slate-800">{loc.dailyAvg} zł <span className="text-[10px] text-emerald-500">↑</span></p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pracownicy</p>
                <p className="text-sm font-black text-slate-800">{loc.staffCount} osoby</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-500">
                <CheckCircle2 size={12} /> Aktywny
              </span>
              <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-amber-600 flex items-center gap-1 transition-all">
                Statystyki <ArrowUpRight size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminLocations;
