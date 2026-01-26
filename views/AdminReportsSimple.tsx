
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Calendar, Globe, MapPin, ChevronRight, Loader2, Award } from 'lucide-react';
import { supabase } from '../supabase';

const AdminReportsSimple: React.FC = () => {
  const [viewScope, setViewScope] = useState<'global' | string>('global');
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalLoss: 0,
    bakerySales: 0,
    pastrySales: 0,
    lossPercent: 0,
    ranking: [] as any[]
  });

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: locs } = await supabase.from('locations').select('*').order('name');
        setLocations(locs || []);

        const firstDay = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0];
        const lastDay = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

        let query = supabase.from('daily_reports').select('*').gte('date', firstDay).lte('date', lastDay);
        
        const { data: reports } = await query;
        const filtered = viewScope === 'global' ? (reports || []) : (reports || []).filter(r => r.location_id === viewScope);

        const bSales = filtered.reduce((acc, r) => acc + r.bakery_sales, 0);
        const pSales = filtered.reduce((acc, r) => acc + r.pastry_sales, 0);
        const bLoss = filtered.reduce((acc, r) => acc + r.bakery_loss, 0);
        const pLoss = filtered.reduce((acc, r) => acc + r.pastry_loss, 0);
        
        const totalS = bSales + pSales;
        const totalL = bLoss + pLoss;

        // Ranking wydajności (tylko w widoku globalnym ma sens)
        const rankingData = (locs || []).map(l => {
          const locReports = (reports || []).filter(r => r.location_id === l.id);
          const s = locReports.reduce((acc, r) => acc + r.bakery_sales + r.pastry_sales, 0);
          const loss = locReports.reduce((acc, r) => acc + r.bakery_loss + r.pastry_loss, 0);
          // Efficiency = (Sales - Loss) / Sales
          const efficiency = s > 0 ? ((s - loss) / s) * 100 : 0;
          return { name: l.name, efficiency, sales: s };
        }).sort((a, b) => b.efficiency - a.efficiency);

        setStats({
          totalSales: totalS,
          totalLoss: totalL,
          bakerySales: bSales,
          pastrySales: pSales,
          lossPercent: totalS > 0 ? (totalL / totalS) * 100 : 0,
          ranking: rankingData
        });

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [viewScope]);

  const selectedLocationName = viewScope === 'global' ? 'Cała Sieć' : locations.find(l => l.id === viewScope)?.name;

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="animate-spin text-amber-500" size={48} />
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Przeliczanie statystyk...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header Selector */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${viewScope === 'global' ? 'bg-slate-900 text-white' : 'bg-amber-500 text-white'}`}>
            {viewScope === 'global' ? <Globe size={28} /> : <MapPin size={28} />}
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aktywny Zakres Analizy</p>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">{selectedLocationName}</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={viewScope}
            onChange={(e) => setViewScope(e.target.value)}
            className="pl-6 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[11px] text-slate-700 uppercase tracking-widest focus:border-amber-500 outline-none appearance-none cursor-pointer shadow-inner"
          >
            <option value="global">🌍 WIDOK GLOBALNY</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <div className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 shadow-xl">
            <Calendar size={14} className="text-amber-500" /> {new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' }).format(now)}
          </div>
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
              <DollarSign size={28} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Przychód Netto (Suma)</p>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
              {stats.totalSales.toLocaleString()} <span className="text-xl font-bold text-slate-300">zł</span>
            </h2>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-rose-50 rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
              <TrendingDown size={28} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Wartość Strat (Suma)</p>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
              {stats.totalLoss.toLocaleString()} <span className="text-xl font-bold text-slate-300">zł</span>
            </h2>
          </div>
        </div>

        <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl text-white flex flex-col justify-center">
          <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-4">Wskaźnik Strat (Avg)</h3>
          <div className="flex items-end gap-3 mb-6">
            <span className="text-6xl font-black tracking-tighter">{stats.lossPercent.toFixed(1)}%</span>
            <div className={`mb-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${stats.lossPercent <= 5 ? 'bg-emerald-500' : 'bg-rose-500'}`}>
              {stats.lossPercent <= 5 ? 'W NORMIE' : 'POWYŻEJ NORMY'}
            </div>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
             <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${Math.min(stats.lossPercent * 10, 100)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Secondary Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Performance Ranking */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
              <Award size={20} className="text-amber-500" /> Ranking Efektywności
            </h3>
            <span className="text-[9px] font-black text-slate-400 uppercase bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100">Top Wyniki</span>
          </div>
          
          <div className="space-y-4">
            {stats.ranking.slice(0, 5).map((l, i) => (
              <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:bg-white hover:shadow-xl hover:border-amber-100 transition-all cursor-pointer">
                <div className="flex items-center gap-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm ${i === 0 ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white text-slate-400'}`}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{l.name}</p>
                    <p className="text-[10px] font-bold text-slate-400">Obrót: {l.sales.toLocaleString()} zł</p>
                  </div>
                </div>
                <div className="text-right">
                   <p className="text-lg font-black text-slate-900 leading-none">{l.efficiency.toFixed(1)}%</p>
                   <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1">Efektywność</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Structure */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-12">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
              <PieChart size={20} className="text-amber-500" /> Struktura Sprzedaży
            </h3>
          </div>

          <div className="space-y-12">
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-xl">🍞</div>
                   <div>
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Piekarnia</p>
                     <p className="text-3xl font-black text-slate-900">{stats.bakerySales.toLocaleString()} <span className="text-sm">zł</span></p>
                   </div>
                </div>
                <span className="text-2xl font-black text-amber-500">{stats.totalSales > 0 ? Math.round((stats.bakerySales / stats.totalSales) * 100) : 0}%</span>
              </div>
              <div className="w-full h-5 bg-slate-50 rounded-full overflow-hidden p-1">
                <div className="bg-amber-500 h-full rounded-full shadow-lg shadow-amber-500/20 transition-all duration-1000" style={{ width: `${stats.totalSales > 0 ? (stats.bakerySales / stats.totalSales) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center text-xl">🍰</div>
                   <div>
                     <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Cukiernia</p>
                     <p className="text-3xl font-black text-slate-900">{stats.pastrySales.toLocaleString()} <span className="text-sm">zł</span></p>
                   </div>
                </div>
                <span className="text-2xl font-black text-pink-500">{stats.totalSales > 0 ? Math.round((stats.pastrySales / stats.totalSales) * 100) : 0}%</span>
              </div>
              <div className="w-full h-5 bg-slate-50 rounded-full overflow-hidden p-1">
                <div className="bg-pink-500 h-full rounded-full shadow-lg shadow-pink-500/20 transition-all duration-1000" style={{ width: `${stats.totalSales > 0 ? (stats.pastrySales / stats.totalSales) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsSimple;
