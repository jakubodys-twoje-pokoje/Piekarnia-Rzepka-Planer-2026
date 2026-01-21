
import React, { useState } from 'react';
import { 
  BarChart3, TrendingUp, Download, 
  Target, Star, Zap, Globe, MapPin, Calendar,
  ArrowUpRight, ArrowDownRight, Layers, ChevronDown, ChevronUp,
  TrendingDown, Info
} from 'lucide-react';
import { LOCATIONS } from '../constants';

interface AdminReportsAdvancedProps {
  mode: 'monthly' | 'yearly';
}

const AdminReportsAdvanced: React.FC<AdminReportsAdvancedProps> = ({ mode }) => {
  const [viewScope, setViewScope] = useState<'global' | string>('global');
  const [selectedDept, setSelectedDept] = useState<'all' | 'bakery' | 'pastry'>('all');
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const isMonthly = mode === 'monthly';
  const selectedLocationName = viewScope === 'global' ? 'Cała sieć' : LOCATIONS.find(l => l.id === viewScope)?.name;

  // Dane dla trybu rocznego
  const annualData = [
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

  // Dane dla trybu miesięcznego (dni)
  const monthlyData = Array.from({ length: 31 }, (_, i) => {
    const dailyTotal = 4500 + Math.random() * 3000;
    const bakeryPart = dailyTotal * 0.6;
    const pastryPart = dailyTotal * 0.4;
    return {
      day: i + 1,
      date: `2026-01-${(i + 1).toString().padStart(2, '0')}`,
      sales: dailyTotal,
      bakerySales: bakeryPart,
      pastrySales: pastryPart,
      bakeryLoss: bakeryPart * (0.03 + Math.random() * 0.04),
      pastryLoss: pastryPart * (0.04 + Math.random() * 0.05),
      target: 6500,
      pct: Math.floor((dailyTotal / 6500) * 100)
    };
  });

  const chartData = isMonthly ? monthlyData.map(d => ({ name: d.day.toString(), sales: d.sales, target: d.target, pct: d.pct })) : annualData;
  const maxVal = Math.max(...chartData.map(d => d.sales));

  const toggleDay = (day: number) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-amber-500 shadow-2xl">
              {isMonthly ? <Calendar size={32} /> : <Zap size={32} />}
           </div>
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
                {isMonthly ? 'Analiza miesięczna' : 'Analiza roczna'}
              </h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                {selectedLocationName} &middot; {isMonthly ? 'Styczeń 2026' : 'Rok 2026'}
              </p>
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
          <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all">
             <Download size={16} /> EKSPORT RAPORTU
          </button>
        </div>
      </div>

      {/* Wykres główny */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-1">
             <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
               <TrendingUp size={18} className="text-amber-500" />
               Dynamika przychodów
             </h3>
             <p className="text-xs font-bold text-slate-400">Podgląd trendów sprzedaży netto w czasie.</p>
          </div>
        </div>

        <div className="h-64 flex items-end justify-between gap-1 px-2 overflow-x-auto custom-scrollbar pb-2">
           {chartData.map((data, i) => (
             <div key={i} className="flex-1 min-w-[20px] flex flex-col items-center gap-4 h-full justify-end group">
               <div className="w-full relative flex items-end justify-center h-full">
                  <div 
                    className={`w-full max-w-[12px] rounded-t-lg transition-all duration-700 relative z-10 ${
                      data.pct >= 100 ? 'bg-emerald-500' : data.pct >= 90 ? 'bg-amber-400' : 'bg-rose-400'
                    }`} 
                    style={{ height: `${(data.sales / (maxVal * 1.1)) * 100}%` }}
                  ></div>
               </div>
               <span className="text-[8px] font-black text-slate-300 uppercase">{data.name}</span>
             </div>
           ))}
        </div>
      </div>

      {/* Macierz Dziennego Rozbicia (Tylko dla trybu miesięcznego) */}
      {isMonthly && (
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Layers size={18} className="text-amber-500" />
              Macierz Dziennej Sprzedaży - Styczeń 2026
            </h3>
            <div className="flex gap-4">
               <div className="flex items-center gap-2"><div className="w-2 h-2 bg-amber-500 rounded-full"></div><span className="text-[9px] font-black text-slate-400 uppercase">Piekarnia</span></div>
               <div className="flex items-center gap-2"><div className="w-2 h-2 bg-indigo-500 rounded-full"></div><span className="text-[9px] font-black text-slate-400 uppercase">Cukiernia</span></div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest opacity-50">Dzień</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest opacity-50">Suma Netto</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest opacity-50">Piekarnia</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest opacity-50">Cukiernia</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest opacity-50">Realizacja celu</th>
                  <th className="px-8 py-4 text-right text-[9px] font-black uppercase tracking-widest opacity-50">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {monthlyData.map((day) => (
                  <React.Fragment key={day.day}>
                    <tr 
                      onClick={() => toggleDay(day.day)}
                      className={`hover:bg-slate-50 transition-all cursor-pointer group ${expandedDay === day.day ? 'bg-amber-50/30' : ''}`}
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                            {day.day}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{day.date.split('-').slice(1).reverse().join('.')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-black text-slate-900 text-sm">
                        {day.sales.toLocaleString(undefined, { minimumFractionDigits: 2 })} zł
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700">{day.bakerySales.toLocaleString(undefined, { maximumFractionDigits: 0 })} zł</span>
                          <span className="text-[9px] font-black text-rose-500 uppercase">Strata: {day.bakeryLoss.toFixed(0)} zł</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-700">{day.pastrySales.toLocaleString(undefined, { maximumFractionDigits: 0 })} zł</span>
                          <span className="text-[9px] font-black text-rose-500 uppercase">Strata: {day.pastryLoss.toFixed(0)} zł</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
                            <div 
                              className={`h-full rounded-full ${day.pct >= 100 ? 'bg-emerald-500' : day.pct >= 90 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                              style={{ width: `${Math.min(day.pct, 100)}%` }}
                            ></div>
                          </div>
                          <span className={`text-[10px] font-black ${day.pct >= 100 ? 'text-emerald-600' : 'text-slate-400'}`}>{day.pct}%</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        {expandedDay === day.day ? <ChevronUp size={18} className="text-amber-600 inline" /> : <ChevronDown size={18} className="text-slate-300 inline" />}
                      </td>
                    </tr>
                    
                    {/* Expanded Row: Breakdown by Location */}
                    {expandedDay === day.day && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={6} className="px-8 py-6">
                          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-top-2 duration-300">
                            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                               <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                 <MapPin size={12} className="text-amber-500" />
                                 Rozbicie na punkty sprzedaży &middot; {day.date}
                               </p>
                            </div>
                            <table className="w-full text-[11px]">
                              <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                  <th className="px-6 py-3 font-black text-slate-400 uppercase text-left">Punkt</th>
                                  <th className="px-6 py-3 font-black text-slate-400 uppercase text-right">Piekarnia</th>
                                  <th className="px-6 py-3 font-black text-slate-400 uppercase text-right">Cukiernia</th>
                                  <th className="px-6 py-3 font-black text-slate-400 uppercase text-right">Suma Dnia</th>
                                  <th className="px-6 py-3 font-black text-slate-400 uppercase text-center">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {LOCATIONS.map(loc => {
                                  const locSales = 800 + Math.random() * 1500;
                                  return (
                                    <tr key={loc.id} className="hover:bg-slate-50 transition-colors">
                                      <td className="px-6 py-3 font-black text-slate-700">{loc.name}</td>
                                      <td className="px-6 py-3 text-right font-medium text-slate-600">{(locSales * 0.6).toFixed(2)} zł</td>
                                      <td className="px-6 py-3 text-right font-medium text-slate-600">{(locSales * 0.4).toFixed(2)} zł</td>
                                      <td className="px-6 py-3 text-right font-black text-slate-900">{locSales.toFixed(2)} zł</td>
                                      <td className="px-6 py-3 text-center">
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${locSales > 1500 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                                          {locSales > 1500 ? 'Realizacja' : 'Poniżej'}
                                        </span>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Section (For Yearly Mode) */}
      {!isMonthly && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 text-white flex flex-col">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                  <Star size={16} /> Najlepsze wyniki roczne
                </h3>
             </div>
             <div className="space-y-6 flex-1">
                {annualData.slice(0, 5).sort((a,b) => b.pct - a.pct).map((month, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/5 transition-all">
                    <div className="flex items-center gap-4">
                       <span className="text-xl font-black text-white/10">0{idx + 1}</span>
                       <div>
                          <p className="text-xs font-black uppercase tracking-tight text-white">{month.name}</p>
                          <p className="text-[9px] font-bold text-white/30 uppercase">{month.sales.toLocaleString()} zł</p>
                       </div>
                    </div>
                    <span className="text-[10px] font-black text-emerald-400">{month.pct}%</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="lg:col-span-3 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30">
               <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Szczegóły sprzedaży miesięcznej 2026</h3>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                       <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-50">Miesiąc</th>
                       <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest opacity-50">Realizacja netto</th>
                       <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest opacity-50">Plan założony</th>
                       <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest opacity-50">Wykonanie %</th>
                       <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest opacity-50">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {annualData.map((m, idx) => (
                       <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-8 py-6 font-black text-slate-800 uppercase">{m.name}</td>
                          <td className="px-6 py-6 font-bold text-slate-900">{m.sales.toLocaleString()} zł</td>
                          <td className="px-6 py-6 text-slate-400 font-medium">{m.target.toLocaleString()} zł</td>
                          <td className="px-6 py-6">
                             <span className={`font-black ${m.pct >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>{m.pct}%</span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase ${m.pct >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {m.pct >= 100 ? 'CEL OSIĄGNIĘTY' : 'PONIŻEJ CELU'}
                             </div>
                          </td>
                       </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReportsAdvanced;
