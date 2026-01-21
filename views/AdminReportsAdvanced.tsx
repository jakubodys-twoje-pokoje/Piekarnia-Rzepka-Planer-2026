
import React, { useState } from 'react';
import { 
  BarChart3, TrendingUp, AlertTriangle, 
  Target, Download, Filter, ArrowUpRight, 
  ArrowDownRight, Star, ChevronDown, Activity, 
  Layers, Zap, Globe, MapPin, Calendar
} from 'lucide-react';
import { LOCATIONS, MONTHS } from '../constants';

const AdminReportsAdvanced: React.FC = () => {
  const [viewScope, setViewScope] = useState<'global' | string>('global');
  const [selectedDept, setSelectedDept] = useState<'all' | 'bakery' | 'pastry'>('all');

  const selectedLocationName = viewScope === 'global' ? 'Cała Sieć' : LOCATIONS.find(l => l.id === viewScope)?.name;

  const leaderboard = LOCATIONS.map((loc, i) => ({
    ...loc,
    sales: 24000 - (i * 1200),
    loss: 4.2 + (i * 0.3),
    targetPct: 104 - (i * 2),
    trend: i % 2 === 0 ? 'up' : 'down'
  })).sort((a, b) => b.targetPct - a.targetPct);

  // Annual mock data (Monthly Performance 2026)
  const annualPerformance = [
    { name: 'Sty', sales: 165000, target: 160000, pct: 103 },
    { name: 'Lut', sales: 142000, target: 145000, pct: 98 },
    { name: 'Mar', sales: 178000, target: 170000, pct: 104 },
    { name: 'Kwi', sales: 195000, target: 180000, pct: 108 },
    { name: 'Maj', sales: 155000, target: 165000, pct: 94 },
    { name: 'Cze', sales: 170000, target: 170000, pct: 100 },
    { name: 'Lip', sales: 188000, target: 175000, pct: 107 },
    { name: 'Sie', sales: 210000, target: 190000, pct: 110 },
    { name: 'Wrz', sales: 162000, target: 165000, pct: 98 },
    { name: 'Paź', sales: 148000, target: 160000, pct: 92 },
    { name: 'Lis', sales: 175000, target: 170000, pct: 103 },
    { name: 'Gru', sales: 245000, target: 200000, pct: 122 },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Dynamic Header & Global Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-amber-500 shadow-2xl">
              <Zap size={32} />
           </div>
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Analityka Deep-Dive</h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{selectedLocationName} &middot; Progres 2026</p>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
            <select 
              value={viewScope}
              onChange={(e) => setViewScope(e.target.value)}
              className="pl-4 pr-10 py-2.5 bg-transparent border-none font-black text-[10px] text-slate-700 focus:ring-0 outline-none uppercase tracking-widest cursor-pointer"
            >
              <option value="global">🌍 CAŁA SIEĆ</option>
              {LOCATIONS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>

          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
            {['all', 'bakery', 'pastry'].map((d) => (
              <button 
                key={d}
                onClick={() => setSelectedDept(d as any)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
                  selectedDept === d ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {d === 'all' ? 'CAŁOŚĆ' : d === 'bakery' ? 'PIEKARNIA' : 'CUKIERNIA'}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl">
             <Download size={16} /> Eksport XLS
          </button>
        </div>
      </div>

      {/* Annual Performance Chart (The "Dojebany" Section) */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm p-10 overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-1">
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
               <Calendar size={18} className="text-amber-500" /> Wykonanie Planu Rocznego 2026
             </h3>
             <p className="text-xs font-bold text-slate-400">Porównanie rzeczywistej sprzedaży do założonych budżetów miesięcznych.</p>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-500 rounded-full"></div><span className="text-[10px] font-black text-slate-400 uppercase">Sprzedaż</span></div>
             <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-100 rounded-full"></div><span className="text-[10px] font-black text-slate-400 uppercase">Budżet</span></div>
          </div>
        </div>

        <div className="h-80 flex items-end justify-between gap-4 px-2">
           {annualPerformance.map((data, i) => (
             <div key={i} className="flex-1 flex flex-col items-center gap-4 h-full justify-end group cursor-pointer">
               <div className="w-full relative flex items-end justify-center h-full gap-1">
                  {/* Budget bar (background) */}
                  <div className="w-full max-w-[20px] bg-slate-50 rounded-t-lg h-full absolute bottom-0"></div>
                  {/* Sales bar */}
                  <div 
                    className={`w-full max-w-[20px] rounded-t-lg transition-all duration-1000 relative z-10 shadow-lg ${
                      data.pct >= 100 ? 'bg-amber-500 shadow-amber-500/20' : 
                      data.pct >= 95 ? 'bg-amber-400/60' : 'bg-rose-400'
                    }`} 
                    style={{ height: `${(data.sales / 250000) * 100}%` }}
                  >
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black py-1.5 px-2.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-xl">
                      {data.sales.toLocaleString()} zł ({data.pct}%)
                    </div>
                  </div>
               </div>
               <span className="text-[10px] font-black text-slate-400 uppercase">{data.name}</span>
             </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Leaderboard Point Selector */}
        <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 text-white flex flex-col">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                <Star size={16} /> Leaderboard
              </h3>
              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Wszystkie Punkty</span>
           </div>

           <div className="space-y-6 flex-1">
              {leaderboard.slice(0, 5).map((point, idx) => (
                <div 
                  key={point.id} 
                  onClick={() => setViewScope(point.id)}
                  className={`flex items-center justify-between group cursor-pointer p-2 rounded-2xl transition-all ${
                    viewScope === point.id ? 'bg-white/10 ring-1 ring-white/20 shadow-xl' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                     <span className={`text-xl font-black ${idx === 0 ? 'text-amber-500' : 'text-white/10'}`}>0{idx + 1}</span>
                     <div>
                        <p className={`text-xs font-black uppercase tracking-tight ${viewScope === point.id ? 'text-amber-500' : 'text-white'}`}>{point.name}</p>
                        <p className="text-[9px] font-bold text-white/30 uppercase">{point.sales.toLocaleString()} zł</p>
                     </div>
                  </div>
                  <div className="text-right">
                     <p className={`text-[10px] font-black ${point.targetPct > 100 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {point.targetPct}%
                     </p>
                     <p className="text-[8px] font-black text-white/20 uppercase">Cel</p>
                  </div>
                </div>
              ))}
           </div>

           <button 
             onClick={() => setViewScope('global')}
             className="mt-8 w-full py-4 border-2 border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all"
           >
             Resetuj do Globala
           </button>
        </div>

        {/* Detailed Metrics Matrix */}
        <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Szczegółowa Macierz Porównawcza</h3>
             <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase">Optymalnie</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                  <span className="text-[9px] font-black text-slate-400 uppercase">Krytycznie</span>
                </div>
             </div>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-900 text-white">
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-50">Lokalizacja</th>
                     <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest opacity-50">Sprzedaż</th>
                     <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest opacity-50">Strata %</th>
                     <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest opacity-50">Wykonanie Roku</th>
                     <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest opacity-50">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {leaderboard.map(point => (
                     <tr 
                      key={point.id} 
                      onClick={() => setViewScope(point.id)}
                      className={`cursor-pointer transition-all ${viewScope === point.id ? 'bg-amber-50/50' : 'hover:bg-slate-50'}`}
                     >
                        <td className="px-8 py-6">
                           <p className="text-sm font-black text-slate-800">{point.name}</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: LOC-{point.id}</p>
                        </td>
                        <td className="px-6 py-6">
                           <p className="text-sm font-black text-slate-900">{point.sales.toLocaleString()} zł</p>
                        </td>
                        <td className="px-6 py-6">
                           <div className="flex items-center gap-3">
                              <span className={`text-xs font-black ${point.loss > 5 ? 'text-rose-600' : 'text-emerald-600'}`}>{point.loss}%</span>
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                 <div className={`h-full rounded-full ${point.loss > 5 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${point.loss * 10}%` }}></div>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-6">
                           <div className="flex items-center gap-2">
                             <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-500 flex items-center justify-center font-black text-[10px]">
                                {point.targetPct}%
                             </div>
                             <span className="text-[9px] font-black text-slate-400 uppercase">vs Cel</span>
                           </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className={`inline-flex items-center gap-1 font-black ${point.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {point.trend === 'up' ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                              <span className="text-[10px] uppercase">{point.trend === 'up' ? '+2.4%' : '-1.1%'}</span>
                           </div>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsAdvanced;
