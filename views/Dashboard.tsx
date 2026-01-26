
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { TrendingUp, TrendingDown, Target, Award, Loader2, Calendar } from 'lucide-react';
import { supabase } from '../supabase';

interface DashboardProps {
  user: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ sales: 0, loss: 0, count: 0 });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        
        let query = supabase.from('daily_reports').select('*').gte('date', first);
        if (user.role !== 'admin' && user.default_location_id) {
          query = query.eq('location_id', user.default_location_id);
        }

        const { data } = await query;
        if (data) {
          const totalSales = data.reduce((s, r) => s + (r.bakery_sales || 0) + (r.pastry_sales || 0), 0);
          const totalLoss = data.reduce((s, r) => s + (r.bakery_loss || 0) + (r.pastry_loss || 0), 0);
          setStats({ sales: totalSales, loss: totalLoss, count: data.length });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.id]);

  if (loading) return <div className="h-96 flex flex-col items-center justify-center"><Loader2 className="animate-spin text-amber-500" size={40} /></div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dzień dobry!</h1>
        <p className="text-slate-500 font-medium">Bieżący miesiąc: <span className="text-amber-600 font-black">{new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' }).format(new Date())}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4"><TrendingUp /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sprzedaż Netto</p>
          <h2 className="text-3xl font-black text-slate-900">{stats.sales.toLocaleString()} zł</h2>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4"><TrendingDown /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Straty Sumaryczne</p>
          <h2 className="text-3xl font-black text-slate-900">{stats.loss.toLocaleString()} zł</h2>
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4"><Calendar /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Raporty w systemie</p>
          <h2 className="text-3xl font-black text-slate-900">{stats.count} dni</h2>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
