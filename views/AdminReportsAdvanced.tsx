
import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Download, Calendar, Layers, ChevronDown, ChevronUp, 
  MapPin, Loader2, Zap, BarChart3, PieChart, Activity, Target, ArrowRight, Eye
} from 'lucide-react';
import { supabase } from '../supabase';
import { MONTHS } from '../constants';

type AnalysisMode = 'monthly' | 'quarterly' | 'yearly';

const AdminReportsAdvanced: React.FC = () => {
  const [mode, setMode] = useState<AnalysisMode>('monthly');
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [viewScope, setViewScope] = useState<'global' | string>('global');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const now = new Date();
  const [selectedYear] = useState(now.getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [{ data: locData }, { data: repData }] = await Promise.all([
          supabase.from('locations').select('*').order('name'),
          supabase.from('daily_reports').select('*').gte('date', `${selectedYear}-01-01`).lte('date', `${selectedYear}-12-31`)
        ]);

        setLocations(locData || []);
        setReports(repData || []);
      } catch (err) {
        console.error("Advanced analytics error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedYear]);

  const filteredReports = useMemo(() => {
    if (viewScope === 'global') return reports;
    return reports.filter(r => r.location_id === viewScope);
  }, [reports, viewScope]);

  const monthlyData = useMemo(() => {
    const currentMonth = now.getMonth();
    const daysInMonth = new Date(selectedYear, currentMonth + 1, 0).getDate();
    
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${selectedYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayReps = filteredReports.filter(r => r.date === dateStr);
      
      const bSales = dayReps.reduce((s, r) => s + (r.bakery_sales || 0), 0);
      const pSales = dayReps.reduce((s, r) => s + (r.pastry_sales || 0), 0);
      const bLoss = dayReps.reduce((s, r) => s + (r.bakery_loss || 0), 0);
      const pLoss = dayReps.reduce((s, r) => s + (r.pastry_loss || 0), 0);

      return {
        id: dateStr,
        label: `${day}`,
        sales: bSales + pSales,
        loss: bLoss + pLoss,
        bakerySales: bSales,
        pastrySales: pSales,
        bakeryLoss: bLoss,
        pastryLoss: pLoss,
        details: dayReps
      };
    });
  }, [filteredReports, selectedYear]);

  const quarterlyData = useMemo(() => {
    return [0, 1, 2, 3].map(qIdx => {
      const startMonth = qIdx * 3;
      const endMonth = startMonth + 2;
      const qReps = filteredReports.filter(r => {
        const m = new Date(r.date).getMonth();
        return m >= startMonth && m <= endMonth;
      });

      const bSales = qReps.reduce((s, r) => s + (r.bakery_sales || 0), 0);
      const pSales = qReps.reduce((s, r) => s + (r.pastry_sales || 0), 0);
      const bLoss = qReps.reduce((s, r) => s + (r.bakery_loss || 0), 0);
      const pLoss = qReps.reduce((s, r) => s + (r.pastry_loss || 0), 0);

      const monthsBreakdown = [startMonth, startMonth + 1, startMonth + 2].map(mIdx => {
        const mReps = qReps.filter(r => new Date(r.date).getMonth() === mIdx);
        return {
          name: MONTHS[mIdx],
          sales: mReps.reduce((s, r) => s + (r.bakery_sales || 0) + (r.pastry_sales || 0), 0),
          loss: mReps.reduce((s, r) => s + (r.bakery_loss || 0) + (r.pastry_loss || 0), 0)
        };
      });

      return {
        id: `Q${qIdx + 1}`,
        label: `Kwartał ${qIdx + 1}`,
        sales: bSales + pSales,
        loss: bLoss + pLoss,
        bakerySales: bSales,
        pastrySales: pSales,
        bakeryLoss: bLoss,
        pastryLoss: pLoss,
        details: monthsBreakdown
      };
    });
  }, [filteredReports]);

  const yearlyData = useMemo(() => {
    return MONTHS.map((mName, mIdx) => {
      const mReps = filteredReports.filter(r => new Date(r.date).getMonth() === mIdx);
      const bSales = mReps.reduce((s, r) => s + (r.bakery_sales || 0), 0);
      const pSales = mReps.reduce((s, r) => s + (r.pastry_sales || 0), 0);
      const bLoss = mReps.reduce((s, r) => s + (r.bakery_loss || 0), 0);
      const pLoss = mReps.reduce((s, r) => s + (r.pastry_loss || 0), 0);

      return {
        id: mName,
        label: mName.substring(0, 3),
        sales: bSales + pSales,
        loss: bLoss + pLoss,
        bakerySales: bSales,
        pastrySales: pSales,
        bakeryLoss: bLoss,
        pastryLoss: pLoss
      };
    });
  }, [filteredReports]);

  const activeData = mode === 'monthly' ? monthlyData : mode === 'quarterly' ? quarterlyData : yearlyData;
  const totalSales = activeData.reduce((acc, d) => acc + d.sales, 0);
  const totalLoss = activeData.reduce((acc, d) => acc + d.loss, 0);
  const wasteRatio = totalSales > 0 ? (totalLoss / totalSales) * 100 : 0;

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-40 gap-6">
      <Loader2 size={64} className="animate-spin text-amber-500" />
      <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Głęboka Analiza Systemowa</p>
    </div>
  );

  return (
    <div className="space-y-10 pb-24">
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 bg-slate-900 text-amber-500 rounded-[2rem] flex items-center justify-center shadow-2xl"><Activity size={32} /></div>
           <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-2">Analizy Zaawansowane</h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{viewScope === 'global' ? 'Cała Sieć Rzepka' : locations.find(l => l.id === viewScope)?.name} &middot; Rok {selectedYear}</p>
           </div>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1">
            {(['monthly', 'quarterly', 'yearly'] as AnalysisMode[]).map(m => (
              <button key={m} onClick={() => {setMode(m); setExpandedId(null);}} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${mode === m ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                {m === 'monthly' ? 'Miesiąc' : m === 'quarterly' ? 'Kwartał' : 'Rok'}
              </button>
            ))}
          </div>
          <select value={viewScope} onChange={(e) => setViewScope(e.target.value)} className="px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest outline-none shadow-xl border-none cursor-pointer">
            <option value="global">🌍 WSZYSTKIE PUNKTY</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700"><TrendingUp size={100} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Przychód Netto</p>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">{totalSales.toLocaleString()} <span className="text-xl font-bold text-slate-300">zł</span></h2>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[9px] font-black text-emerald-600 uppercase">Trend Stabilny</span></div>
        </div>
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700"><TrendingDown size={100} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Suma Strat</p>
          <h2 className="text-5xl font-black text-rose-600 tracking-tighter mb-4">{totalLoss.toLocaleString()} <span className="text-xl font-bold text-slate-300">zł</span></h2>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500"></div><span className="text-[9px] font-black text-rose-600 uppercase">Wymaga Nadzoru</span></div>
        </div>
        <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10"><PieChart size={100} /></div>
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Waste Ratio</p>
          <h2 className="text-5xl font-black tracking-tighter mb-6">{wasteRatio.toFixed(1)}%</h2>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-amber-500" style={{ width: `${Math.min(wasteRatio * 5, 100)}%` }}></div></div>
        </div>
      </div>

      <div className="bg-white p-12 rounded-[4rem] border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-16">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3"><BarChart3 size={20} className="text-amber-500" /> Wykres Dynamiki: {mode === 'monthly' ? 'Dni Miesiąca' : mode === 'quarterly' ? 'Kwartały' : 'Miesiące'}</h3>
          <button className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl"><Download size={20} /></button>
        </div>
        <div className="h-80 flex items-end justify-between gap-2 px-4">
          {activeData.map((d, i) => {
            const maxVal = Math.max(...activeData.map(item => item.sales), 1);
            const height = (d.sales / maxVal) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 h-full group cursor-pointer">
                <div className="w-full flex flex-col items-center justify-end h-full relative">
                  <div className="absolute -top-12 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none whitespace-nowrap">{d.sales.toLocaleString()} zł</div>
                  <div className={`w-full max-w-[24px] rounded-t-xl transition-all duration-700 relative ${d.sales > 0 ? 'bg-amber-500 group-hover:bg-slate-900' : 'bg-slate-100'}`} style={{ height: `${height}%` }}>
                    <div className="absolute bottom-0 left-0 w-full bg-rose-500/30 rounded-t-xl" style={{ height: `${d.sales > 0 ? (d.loss / d.sales) * 100 : 0}%` }}></div>
                  </div>
                </div>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter group-hover:text-slate-900 transition-colors">{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
         {activeData.map((item: any) => (
           <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:border-amber-500/30 transition-all">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-900 shadow-inner">
                    {/* Zmiana: Badge pokazuje ID (np Q1) zamiast powtarzania pełnej nazwy */}
                    {mode === 'quarterly' ? item.id : item.label}
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">
                      {mode === 'monthly' ? `Dzień ${item.label}` : mode === 'yearly' ? item.id : item.label}
                    </h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      {mode === 'monthly' ? item.id : mode === 'yearly' ? 'Statystyki Miesięczne' : 'Statystyki Kwartalne'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 flex-1 lg:max-w-2xl">
                   <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Przychód Netto</p><p className="text-lg font-black text-slate-900">{item.sales.toLocaleString()} zł</p></div>
                   <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Strata Sumaryczna</p><p className="text-lg font-black text-rose-600">{item.loss.toLocaleString()} zł</p></div>
                   <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Piekarnia (Waste)</p><p className="text-lg font-black text-slate-800">{item.bakerySales > 0 ? ((item.bakeryLoss / item.bakerySales) * 100).toFixed(1) : 0}%</p></div>
                   <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Cukiernia (Waste)</p><p className="text-lg font-black text-slate-800">{item.pastrySales > 0 ? ((item.pastryLoss / item.pastrySales) * 100).toFixed(1) : 0}%</p></div>
                </div>

                {item.details && item.details.length > 0 && (
                  <button 
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)} 
                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg ${
                      expandedId === item.id ? 'bg-amber-600 text-white' : 'bg-slate-900 text-white hover:bg-amber-500'
                    }`}
                  >
                    {expandedId === item.id ? <ChevronUp size={16}/> : <Eye size={16}/>}
                    {expandedId === item.id ? 'Zamknij' : 'Szczegóły'}
                  </button>
                )}
              </div>

              {expandedId === item.id && (
                <div className="mt-8 pt-8 border-t border-slate-100 animate-in slide-in-from-top-4 duration-300">
                   {mode === 'quarterly' ? (
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {item.details.map((m: any, idx: number) => (
                          <div key={idx} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative group overflow-hidden">
                             <div className="absolute -right-4 -top-4 w-16 h-16 bg-amber-500/5 rounded-full group-hover:scale-150 transition-transform"></div>
                             <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Calendar size={12}/> {m.name}
                             </p>
                             <div className="space-y-3">
                               <div className="flex justify-between items-end">
                                 <span className="text-[8px] font-black text-slate-400 uppercase">Przychód</span>
                                 <span className="text-sm font-black text-slate-900">{m.sales.toLocaleString()} zł</span>
                               </div>
                               <div className="flex justify-between items-end">
                                 <span className="text-[8px] font-black text-slate-400 uppercase">Strata</span>
                                 <span className="text-sm font-black text-rose-600">{m.loss.toLocaleString()} zł</span>
                               </div>
                               <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                                 <span className="text-[8px] font-black text-slate-400 uppercase">Wskaźnik Waste</span>
                                 <span className="text-xs font-black text-slate-900">{m.sales > 0 ? ((m.loss / m.sales) * 100).toFixed(1) : 0}%</span>
                               </div>
                             </div>
                          </div>
                        ))}
                     </div>
                   ) : mode === 'monthly' ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {item.details.map((r: any) => (
                          <div key={r.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                             <div className="flex items-center gap-2 mb-4"><MapPin size={12} className="text-amber-500" /><span className="text-[10px] font-black text-slate-900 uppercase">{locations.find(l => l.id === r.location_id)?.name}</span></div>
                             <div className="flex justify-between text-xs font-bold text-slate-500"><span>S: {(r.bakery_sales + r.pastry_sales).toLocaleString()} zł</span><span className="text-rose-500">L: {(r.bakery_loss + r.pastry_loss).toLocaleString()} zł</span></div>
                          </div>
                        ))}
                     </div>
                   ) : null}
                </div>
              )}
           </div>
         ))}
      </div>
    </div>
  );
};

export default AdminReportsAdvanced;
