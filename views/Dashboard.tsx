
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { TrendingUp, TrendingDown, Target, Loader2, Calendar, Award } from 'lucide-react';
import { supabase } from '../supabase';

const Dashboard: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ sales: 0, loss: 0, count: 0 });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const now = new Date();
      const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      
      let query = supabase.from('daily_reports').select('*').gte('date', first);
      if (user.role !== 'admin' && user.default_location_id) {
        query = query.eq('location_id', user.default_location_id);
      }

      const { data } = await query;
      if (data) {
        const s = data.reduce((acc, r) => acc + (r.bakery_sales || 0) + (r.pastry_sales || 0), 0);
        const l = data.reduce((acc, r) => acc + (r.bakery_loss || 0) + (r.pastry_loss || 0), 0);
        setStats({ sales: s, loss: l, count: data.length });
      }
      setLoading(false);
    };
    fetchData();
  }, [user.id, user.default_location_id]);

  const welcomeName = user.first_name || user.email.split('@')[0];

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center">
      <Loader2 className="animate-spin text-amber-500" size={40} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Pobieranie danych...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Witaj, {welcomeName}!</h1>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-amber-500" />
            <p className="text-slate-500 font-bold text-sm">Bieżący miesiąc: <span className="text-slate-900 font-black uppercase tracking-tight">{new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' }).format(new Date())}</span></p>
          </div>
        </div>
        <div className="relative z-10 flex flex-col items-end">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Status Systemu</p>
          <div className="flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-xl">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-widest">{user.role}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm group hover:border-emerald-500 transition-all cursor-default">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
            <TrendingUp size={28} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Sprzedaż Miesięczna</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
              {stats.sales.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}
            </h2>
            <span className="text-sm font-black text-slate-300">PLN</span>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm group hover:border-rose-500 transition-all cursor-default">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-inner">
            <TrendingDown size={28} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Straty Sumaryczne</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
              {stats.loss.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}
            </h2>
            <span className="text-sm font-black text-slate-300">PLN</span>
          </div>
        </div>

        <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl group hover:shadow-amber-500/10 transition-all cursor-default text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <Award size={80} />
          </div>
          <div className="w-14 h-14 bg-white/10 text-amber-500 rounded-2xl flex items-center justify-center mb-8 shadow-inner">
            <Target size={28} />
          </div>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-2">Skuteczność Operacyjna</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-black text-white tracking-tighter">
              {stats.sales > 0 ? (( (stats.sales - stats.loss) / stats.sales ) * 100).toFixed(1) : '0.0'}
            </h2>
            <span className="text-sm font-black text-white/30">%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
