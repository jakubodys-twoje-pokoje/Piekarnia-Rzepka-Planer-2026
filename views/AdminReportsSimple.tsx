
import React, { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Calendar, Globe, MapPin, ChevronRight } from 'lucide-react';
import { LOCATIONS, MONTHS } from '../constants';

const AdminReportsSimple: React.FC = () => {
  const [viewScope, setViewScope] = useState<'global' | string>('global');

  const selectedLocationName = viewScope === 'global' ? 'Cała Sieć' : LOCATIONS.find(l => l.id === viewScope)?.name;

  // Mock annual data
  const annualProgress = [
    { m: 'St', p: 102 }, { m: 'Lu', p: 98 }, { m: 'Ma', p: 105 }, { m: 'Kw', p: 110 },
    { m: 'Ma', p: 92 }, { m: 'Cz', p: 101 }, { m: 'Li', p: 108 }, { m: 'Si', p: 115 },
    { m: 'Wr', p: 95 }, { m: 'Pa', p: 88 }, { m: 'Li', p: 104 }, { m: 'Gr', p: 120 }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Global Filter Bar */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${viewScope === 'global' ? 'bg-slate-900 text-white' : 'bg-amber-100 text-amber-700'}`}>
            {viewScope === 'global' ? <Globe size={24} /> : <MapPin size={24} />}
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktywny Zakres</p>
            <h2 className="text-xl font-black text-slate-900">{selectedLocationName}</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select 
            value={viewScope}
            onChange={(e) => setViewScope(e.target.value)}
            className="pl-6 pr-12 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl font-black text-xs text-slate-700 focus:border-amber-500 outline-none appearance-none cursor-pointer"
          >
            <option value="global">🌍 WIDOK CAŁEJ SIECI</option>
            <optgroup label="PUNKTY SPRZEDAŻY">
              {LOCATIONS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </optgroup>
          </select>
          <div className="h-10 w-[2px] bg-slate-100 mx-2 hidden md:block"></div>
          <div className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest">
            <Calendar size={14} /> Styczeń 2026
          </div>
        </div>
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <DollarSign size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Przychód Netto</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
              {viewScope === 'global' ? '167 420' : '24 150'} <span className="text-xl">zł</span>
            </h2>
            <p className="text-xs font-bold text-emerald-500 mt-4 flex items-center gap-1">
              <TrendingUp size={14} /> +12.4% vs ubiegły m-c
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
              <TrendingDown size={24} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Wartość Strat</p>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
              {viewScope === 'global' ? '8 350' : '1 120'} <span className="text-xl">zł</span>
            </h2>
            <p className="text-xs font-bold text-slate-400 mt-4">
              Stanowi 4.9% obrotu (Cel: 5.0%)
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col justify-center">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Realizacja Celu Rocznego</h3>
          <div className="grid grid-cols-6 gap-2">
             {annualProgress.map((ap, i) => (
               <div key={i} className="flex flex-col items-center gap-1">
                  <div className={`w-full h-8 rounded-md flex items-center justify-center text-[8px] font-black ${
                    ap.p >= 100 ? 'bg-emerald-500 text-white' : 
                    ap.p >= 95 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {ap.p}%
                  </div>
                  <span className="text-[7px] font-black text-slate-300 uppercase">{ap.m}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-amber-500/20 transition-all duration-1000"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="mb-auto">
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Wyniki Rankingu</p>
              <h3 className="text-4xl font-black tracking-tighter leading-none mb-4">Ranking<br/>Wydajności</h3>
              <p className="text-sm font-medium text-white/40 max-w-xs">System automatycznie ocenia punkty na podstawie stosunku sprzedaży do strat.</p>
            </div>
            
            <div className="mt-12 space-y-4">
              {LOCATIONS.slice(0, 3).map((l, i) => (
                <div key={l.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-black text-amber-500">#{i+1}</span>
                    <span className="text-sm font-black uppercase tracking-tight">{l.name}</span>
                  </div>
                  <ChevronRight size={18} className="text-white/20" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <PieChart size={20} className="text-amber-600" />
              Struktura Sprzedaży
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase bg-slate-50 px-3 py-1 rounded-full">Bieżący Miesiąc</span>
          </div>

          <div className="flex-1 space-y-10">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Piekarnia</p>
                  <p className="text-2xl font-black text-slate-900">{viewScope === 'global' ? '103 800' : '14 970'} zł</p>
                </div>
                <span className="text-lg font-black text-emerald-500">62%</span>
              </div>
              <div className="w-full h-4 bg-slate-50 rounded-full overflow-hidden p-1">
                <div className="bg-amber-500 h-full rounded-full shadow-lg shadow-amber-500/20" style={{ width: '62%' }}></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Cukiernia</p>
                  <p className="text-2xl font-black text-slate-900">{viewScope === 'global' ? '63 620' : '9 180'} zł</p>
                </div>
                <span className="text-lg font-black text-pink-500">38%</span>
              </div>
              <div className="w-full h-4 bg-slate-50 rounded-full overflow-hidden p-1">
                <div className="bg-pink-500 h-full rounded-full shadow-lg shadow-pink-500/20" style={{ width: '38%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsSimple;
