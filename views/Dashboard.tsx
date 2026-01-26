
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { TrendingUp, TrendingDown, Target, Loader2, Calendar } from 'lucide-react';
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

  if (loading) return <div className="h-96 flex flex-col items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={40} /></div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Witaj, {welcomeName}!</h1>
          <p className="text-slate-500 font-medium">Bieżący miesiąc: <span className="text-amber-600 font-black uppercase">{new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' }).format(new Date())}</span></p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Twoja Rola</p>
          <span className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">{user.role}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:border-emerald-500 transition-all">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-all"><TrendingUp /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sprzedaż Netto</p>
          <h2 className="text-3xl font-black text-slate-900">{stats.sales.toLocaleString()} <span className="text-sm font-medium text-slate-400">zł</span></h2>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:border-rose-500 transition-all">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-rose-500 group-hover:text-white transition-all"><TrendingDown /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Straty Sumaryczne</p>
          <h2 className="text-3xl font-black text-slate-900">{stats.loss.toLocaleString()} <span className="text-sm font-medium text-slate-400">zł</span></h2>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm group hover:border-amber-500 transition-all">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-amber-500 group-hover:text-white transition-all"><Calendar /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Liczba Raportów</p>
          <h2 className="text-3xl font-black text-slate-900">{stats.count} <span className="text-sm font-medium text-slate-400">dni</span></h2>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
