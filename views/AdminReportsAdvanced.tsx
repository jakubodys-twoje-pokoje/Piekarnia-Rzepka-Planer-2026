
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Download, Calendar, Layers, ChevronDown, ChevronUp, MapPin, Loader2, Zap
} from 'lucide-react';
// Correct: removed non-existent LOCATIONS import from '../constants'
import { supabase } from '../supabase';

interface AdminReportsAdvancedProps {
  mode: 'monthly' | 'yearly';
}

const AdminReportsAdvanced: React.FC<AdminReportsAdvancedProps> = ({ mode }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [viewScope, setViewScope] = useState<'global' | string>('global');
  // Added locations state to store data from database
  const [locations, setLocations] = useState<any[]>([]);

  const isMonthly = mode === 'monthly';
  // Correct: use the locations state instead of a constant
  const selectedLocationName = viewScope === 'global' ? 'Cała sieć' : locations.find(l => l.id === viewScope)?.name;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const now = new Date();
      
      try {
        // Fetch locations to populate names and dropdown
        const { data: locData } = await supabase.from('locations').select('*').order('name');
        setLocations(locData || []);

        let query = supabase.from('daily_reports').select('*');
        
        if (isMonthly) {
          const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
          const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
          query = query.gte('date', first).lte('date', last);
        } else {
          const first = `${now.getFullYear()}-01-01`;
          const last = `${now.getFullYear()}-12-31`;
          query = query.gte('date', first).lte('date', last);
        }

        if (viewScope !== 'global') {
          query = query.eq('location_id', viewScope);
        }

        const { data: reports, error } = await query;
        if (error) throw error;

        if (isMonthly) {
          // Grupowanie po dniach
          const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
          const monthData = Array.from({ length: daysInMonth }, (_, i) => {
            const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${(i + 1).toString().padStart(2, '0')}`;
            const dayReports = (reports || []).filter(r => r.date === dateStr);
            const sales = dayReports.reduce((s, r) => s + r.bakery_sales + r.pastry_sales, 0);
            return {
              name: (i + 1).toString(),
              date: dateStr,
              sales,
              bakerySales: dayReports.reduce((s, r) => s + r.bakery_sales, 0),
              pastrySales: dayReports.reduce((s, r) => s + r.pastry_sales, 0),
              bakeryLoss: dayReports.reduce((s, r) => s + r.bakery_loss, 0),
              pastryLoss: dayReports.reduce((s, r) => s + r.pastry_loss, 0),
              target: 6500,
              pct: sales > 0 ? Math.floor((sales / 6500) * 100) : 0,
              reports: dayReports
            };
          });
          setData(monthData);
        } else {
          // Grupowanie po miesiącach
          const months = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
          const yearlyData = months.map((m, i) => {
            const monthReports = (reports || []).filter(r => new Date(r.date).getMonth() === i);
            const sales = monthReports.reduce((s, r) => s + r.bakery_sales + r.pastry_sales, 0);
            return {
              name: m,
              sales,
              target: 180000,
              pct: sales > 0 ? Math.floor((sales / 180000) * 100) : 0
            };
          });
          setData(yearlyData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mode, viewScope, isMonthly]);

  const maxVal = Math.max(...data.map(d => d.sales), 1);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 size={48} className="animate-spin text-amber-500" />
      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Generowanie analizy...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
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
                {selectedLocationName} &middot; {isMonthly ? 'Bieżący Miesiąc' : 'Bieżący Rok'}
              </p>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={viewScope}
            onChange={(e) => setViewScope(e.target.value)}
            className="px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black text-[10px] text-slate-700 uppercase tracking-widest outline-none shadow-sm"
          >
            <option value="global">🌍 CAŁA SIEĆ</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl">
             <Download size={16} /> EKSPORT
          </button>
        </div>
      </div>

      {/* Wykres */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm p-10">
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-10">
          <TrendingUp size={18} className="text-amber-500" /> Dynamika przychodów
        </h3>
        <div className="h-64 flex items-end justify-between gap-1 overflow-x-auto pb-4 custom-scrollbar">
           {data.map((d, i) => (
             <div key={i} className="flex-1 min-w-[20px] flex flex-col items-center gap-4 h-full justify-end group">
               <div className="w-full relative flex items-end justify-center h-full">
                  <div 
                    className={`w-full max-w-[12px] rounded-t-lg transition-all duration-700 ${
                      d.pct >= 100 ? 'bg-emerald-500' : d.pct >= 90 ? 'bg-amber-400' : 'bg-rose-400'
                    }`} 
                    style={{ height: `${(d.sales / (maxVal * 1.1)) * 100}%` }}
                  ></div>
               </div>
               <span className="text-[8px] font-black text-slate-300 uppercase">{d.name}</span>
             </div>
           ))}
        </div>
      </div>

      {/* Macierz Dziennego Rozbicia */}
      {isMonthly && (
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-slate-50/30">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Layers size={18} className="text-amber-500" /> Macierz sprzedaży dziennej
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest">
                  <th className="px-8 py-5">Dzień</th>
                  <th className="px-6 py-5">Suma Netto</th>
                  <th className="px-6 py-5">Piekarnia</th>
                  <th className="px-6 py-5">Cukiernia</th>
                  <th className="px-8 py-5 text-right">Szczegóły</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((day) => (
                  <React.Fragment key={day.date}>
                    <tr 
                      onClick={() => day.reports.length > 0 && setExpandedDay(expandedDay === day.date ? null : day.date)}
                      className={`hover:bg-slate-50 transition-all cursor-pointer ${expandedDay === day.date ? 'bg-amber-50' : ''}`}
                    >
                      <td className="px-8 py-5">
                        <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500">{day.name}</span>
                      </td>
                      <td className="px-6 py-5 font-black text-slate-900 text-sm">{day.sales.toLocaleString()} zł</td>
                      <td className="px-6 py-5 text-xs font-bold text-slate-600">{day.bakerySales.toLocaleString()} zł</td>
                      <td className="px-6 py-5 text-xs font-bold text-slate-600">{day.pastrySales.toLocaleString()} zł</td>
                      <td className="px-8 py-5 text-right">
                        {day.reports.length > 0 && (expandedDay === day.date ? <ChevronUp size={18} /> : <ChevronDown size={18} />)}
                      </td>
                    </tr>
                    {expandedDay === day.date && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={5} className="p-6">
                           <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-inner">
                              <table className="w-full text-[11px]">
                                <thead className="bg-slate-50">
                                  <tr>
                                    <th className="px-6 py-3 font-black text-slate-400 uppercase text-left">Punkt</th>
                                    <th className="px-6 py-3 font-black text-slate-400 uppercase text-right">Piekarnia</th>
                                    <th className="px-6 py-3 font-black text-slate-400 uppercase text-right">Cukiernia</th>
                                    <th className="px-6 py-3 font-black text-slate-400 uppercase text-right">Razem</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                  {day.reports.map((r: any) => (
                                    <tr key={r.id}>
                                      <td className="px-6 py-3 font-black text-slate-700">{locations.find(l => l.id === r.location_id)?.name}</td>
                                      <td className="px-6 py-3 text-right text-slate-600">{r.bakery_sales.toLocaleString()} zł</td>
                                      <td className="px-6 py-3 text-right text-slate-600">{r.pastry_sales.toLocaleString()} zł</td>
                                      <td className="px-6 py-3 text-right font-black text-slate-900">{(r.bakery_sales + r.pastry_sales).toLocaleString()} zł</td>
                                    </tr>
                                  ))}
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
    </div>
  );
};

export default AdminReportsAdvanced;
