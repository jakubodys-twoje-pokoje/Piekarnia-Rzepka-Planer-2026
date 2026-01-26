
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Calendar, Globe, MapPin, Loader2, Award, Info, Percent } from 'lucide-react';
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
    bakeryLoss: 0,
    pastryLoss: 0,
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

        const bSales = filtered.reduce((acc, r) => acc + (r.bakery_sales || 0), 0);
        const pSales = filtered.reduce((acc, r) => acc + (r.pastry_sales || 0), 0);
        const bLoss = filtered.reduce((acc, r) => acc + (r.bakery_loss || 0), 0);
        const pLoss = filtered.reduce((acc, r) => acc + (r.pastry_loss || 0), 0);
        
        const totalS = bSales + pSales;
        const totalL = bLoss + pLoss;

        const rankingData = (locs || []).map(l => {
          const locReports = (reports || []).filter(r => r.location_id === l.id);
          const s = locReports.reduce((acc, r) => acc + (r.bakery_sales || 0) + (r.pastry_sales || 0), 0);
          const loss = locReports.reduce((acc, r) => acc + (r.bakery_loss || 0) + (r.pastry_loss || 0), 0);
          const efficiency = s > 0 ? ((s - loss) / s) * 100 : 0;
          return { name: l.name, efficiency, sales: s };
        }).sort((a, b) => b.efficiency - a.efficiency);

        setStats({
          totalSales: totalS,
          totalLoss: totalL,
          bakerySales: bSales,
          pastrySales: pSales,
          bakeryLoss: bLoss,
          pastryLoss: pLoss,
          lossPercent: totalS > 0 ? (totalL / totalS) * 100 : 0,
          ranking: rankingData
        });

      } catch (err) {
        console.error("Błąd pobierania analizy:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [viewScope, currentMonth, currentYear]);

  const selectedLocationName = viewScope === 'global' ? 'Cała Sieć' : locations.find(l => l.id === viewScope)?.name;

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-32 gap-6">
      <Loader2 className="animate-spin text-amber-500" size={64} />
      <div className="text-center">
        <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Generowanie Przeglądu</p>
        <p className="text-xs font-bold text-slate-400 mt-2">Analiza danych operacyjnych Rzepka...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${viewScope === 'global' ? 'bg-slate-900 text-white' : 'bg-amber-500 text-white'}`}>
            {viewScope === 'global' ? <Globe size={28} /> : <MapPin size={28} />}
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Sieci Rzepka</p>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">{selectedLocationName}</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={viewScope}
            onChange={(e) => setViewScope(e.target.value)}
            className="pl-6 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[11px] text-slate-700 uppercase tracking-widest focus:border-amber-500 outline-none appearance-none cursor-pointer shadow-inner"
          >
            <option value="global">🌍 WSZYSTKIE PUNKTY</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <div className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 shadow-xl">
            <Calendar size={14} className="text-amber-500" /> {new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' }).format(now)}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-50 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-8">
              <DollarSign size={28} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sprzedaż Netto</p>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
              {stats.totalSales.toLocaleString()} <span className="text-xl font-bold text-slate-300">zł</span>
            </h2>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-rose-50 rounded-full group-hover:scale-125 transition-transform duration-700"></div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-8">
              <TrendingDown size={28} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Wartość Strat</p>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
              {stats.totalLoss.toLocaleString()} <span className="text-xl font-bold text-slate-300">zł</span>
            </h2>
          </div>
        </div>

        <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
             <Percent size={80} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Wskaźnik Waste Ratio</h3>
              <Info size={14} className="text-white/20" />
            </div>
            <div className="flex items-end gap-3 mb-6">
              <span className="text-6xl font-black tracking-tighter">{stats.lossPercent.toFixed(1)}%</span>
              <div className={`mb-2 px-3 py-1 rounded-full text-[10px] font-black uppercase ${stats.lossPercent <= 5 ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                {stats.lossPercent <= 5 ? 'CEL OSIĄGNIĘTY' : 'LIMIT PRZEKROCZONY'}
              </div>
            </div>
            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
               <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${Math.min(stats.lossPercent * 10, 100)}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Structure */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm hover:border-amber-500/20 transition-all">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3 mb-12">
            <PieChart size={20} className="text-amber-500" /> Podział Sprzedaży
          </h3>
          <div className="space-y-10">
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-xs font-black text-slate-400 uppercase">Piekarnia (Chleby, Bułki)</span>
                <span className="text-xl font-black text-slate-900">{stats.bakerySales.toLocaleString()} zł</span>
              </div>
              <div className="h-4 bg-slate-50 rounded-full overflow-hidden p-1">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-700 shadow-md" style={{ width: `${stats.totalSales > 0 ? (stats.bakerySales / stats.totalSales) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-xs font-black text-slate-400 uppercase">Cukiernia (Ciasta, Drożdżówki)</span>
                <span className="text-xl font-black text-slate-900">{stats.pastrySales.toLocaleString()} zł</span>
              </div>
              <div className="h-4 bg-slate-50 rounded-full overflow-hidden p-1">
                <div className="h-full bg-pink-500 rounded-full transition-all duration-700 shadow-md" style={{ width: `${stats.totalSales > 0 ? (stats.pastrySales / stats.totalSales) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Loss Structure - NOWOŚĆ */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm hover:border-rose-500/20 transition-all">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3 mb-12">
            <TrendingDown size={20} className="text-rose-500" /> Struktura Strat (Waste Control)
          </h3>
          <div className="space-y-10">
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-xs font-black text-slate-400 uppercase">Straty Piekarnia</span>
                <div className="text-right">
                   <span className="text-xl font-black text-rose-600">{stats.bakeryLoss.toLocaleString()} zł</span>
                   <p className="text-[9px] font-bold text-slate-400 uppercase">{stats.bakerySales > 0 ? ((stats.bakeryLoss / stats.bakerySales) * 100).toFixed(1) : 0}% obrotu sekcji</p>
                </div>
              </div>
              <div className="h-4 bg-slate-50 rounded-full overflow-hidden p-1">
                <div className="h-full bg-rose-500 rounded-full transition-all duration-700 shadow-md" style={{ width: `${stats.totalLoss > 0 ? (stats.bakeryLoss / stats.totalLoss) * 100 : 0}%` }}></div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-xs font-black text-slate-400 uppercase">Straty Cukiernia</span>
                <div className="text-right">
                   <span className="text-xl font-black text-slate-900">{stats.pastryLoss.toLocaleString()} zł</span>
                   <p className="text-[9px] font-bold text-slate-400 uppercase">{stats.pastrySales > 0 ? ((stats.pastryLoss / stats.pastrySales) * 100).toFixed(1) : 0}% obrotu sekcji</p>
                </div>
              </div>
              <div className="h-4 bg-slate-50 rounded-full overflow-hidden p-1">
                <div className="h-full bg-slate-800 rounded-full transition-all duration-700 shadow-md" style={{ width: `${stats.totalLoss > 0 ? (stats.pastryLoss / stats.totalLoss) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ranking and Efficiency */}
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="flex items-center justify-between mb-12">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-3">
            <Award size={20} className="text-amber-500" /> Ranking Efektywności Punktów
          </h3>
          <span className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">Bieżący Miesiąc</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {stats.ranking.slice(0, 8).map((l, i) => (
             <div key={i} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between group hover:bg-white hover:shadow-xl transition-all cursor-default">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Poz. #{i+1}</span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${i === 0 ? 'bg-amber-500 text-white' : 'bg-white text-slate-900'}`}>{i+1}</div>
                  </div>
                  <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover:text-amber-600 transition-colors">{l.name}</h4>
                </div>
                <div className="mt-10">
                   <div className="flex items-end justify-between mb-2">
                     <p className="text-2xl font-black text-slate-900">{l.efficiency.toFixed(1)}%</p>
                     <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Wydajność</p>
                   </div>
                   <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${l.efficiency}%` }}></div>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default AdminReportsSimple;
