
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { 
  TrendingUp, TrendingDown, Award, 
  Target, ChevronRight, X, ArrowUpRight,
  BellRing, Globe, MapPin, Calendar as CalendarIcon,
  CheckCheck, Layers, Loader2
} from 'lucide-react';
import { LOCATIONS } from '../constants';
import { supabase } from '../supabase';

interface DashboardProps {
  user: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    monthlySales: 0,
    monthlyBakery: 0,
    monthlyPastry: 0,
    monthlyLoss: 0,
    bakeryLoss: 0,
    pastryLoss: 0,
    planExecution: 0
  });
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedDayDetails, setSelectedDayDetails] = useState<any | null>(null);

  const isAdmin = user.role === 'admin';
  const locationName = isAdmin 
    ? 'Wszystkie punkty (Global)' 
    : (LOCATIONS.find(l => l.id === user.default_location_id)?.name || 'Nieznany punkt');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      try {
        // 1. Pobierz raporty z bieżącego miesiąca
        let query = supabase.from('daily_reports').select('*').gte('date', firstDay).lte('date', lastDay);
        if (!isAdmin) query = query.eq('location_id', user.default_location_id);
        
        const { data: reports, error: reportsError } = await query;
        if (reportsError) throw reportsError;

        // 2. Oblicz statystyki
        const totals = (reports || []).reduce((acc, curr) => ({
          sales: acc.sales + curr.bakery_sales + curr.pastry_sales,
          bakery: acc.bakery + curr.bakery_sales,
          pastry: acc.pastry + curr.pastry_sales,
          loss: acc.loss + curr.bakery_loss + curr.pastry_loss,
          bakeryLoss: acc.bakeryLoss + curr.bakery_loss,
          pastryLoss: acc.pastryLoss + curr.pastry_loss,
        }), { sales: 0, bakery: 0, pastry: 0, loss: 0, bakeryLoss: 0, pastryLoss: 0 });

        setStats({
          monthlySales: totals.sales,
          monthlyBakery: totals.bakery,
          monthlyPastry: totals.pastry,
          monthlyLoss: totals.loss,
          bakeryLoss: totals.bakeryLoss,
          pastryLoss: totals.pastryLoss,
          planExecution: 89 // W prawdziwym systemie pobierane z tabeli targets
        });

        // 3. Przygotuj dane kalendarza
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const cal = Array.from({ length: daysInMonth }, (_, i) => {
          const d = (i + 1).toString().padStart(2, '0');
          const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${d}`;
          const dayReports = (reports || []).filter(r => r.date === dateStr);
          
          return {
            day: i + 1,
            date: dateStr,
            status: dayReports.length > 0 ? 'perfect' : 'missed',
            bakerySales: dayReports.reduce((s, r) => s + r.bakery_sales, 0),
            pastrySales: dayReports.reduce((s, r) => s + r.pastry_sales, 0),
            bakeryLoss: dayReports.reduce((s, r) => s + r.bakery_loss, 0),
            pastryLoss: dayReports.reduce((s, r) => s + r.pastry_loss, 0),
            target: isAdmin ? 14000 : 2200,
            bakeryTarget: isAdmin ? 8000 : 1200,
            pastryTarget: isAdmin ? 6000 : 1000
          };
        });
        setCalendarData(cal);

        // 4. Pobierz wiadomości
        const { data: msgs } = await supabase
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
        setMessages(msgs || []);

      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id, isAdmin, user.default_location_id]);

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 size={48} className="animate-spin text-amber-500" />
      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Synchronizacja Dashboardu...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-12 relative">
      {/* Modal Szczegółów Dnia */}
      {selectedDayDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="p-10 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Szczegóły Raportów</h3>
                  <p className="text-3xl font-black text-slate-900">{selectedDayDetails.date}</p>
                </div>
                <button onClick={() => setSelectedDayDetails(null)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex items-center justify-between shadow-2xl">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Suma utargów</p>
                  <p className="text-4xl font-black">{(selectedDayDetails.bakerySales + selectedDayDetails.pastrySales).toFixed(2)} zł</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cel dnia</p>
                  <p className="text-2xl font-black text-amber-400">{selectedDayDetails.target} zł</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                  <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Piekarnia</span>
                  <p className="text-xl font-black text-slate-900">{selectedDayDetails.bakerySales.toFixed(2)} zł</p>
                  <p className="text-[10px] font-bold text-rose-500 uppercase mt-2">Strata: {selectedDayDetails.bakeryLoss.toFixed(2)} zł</p>
                </div>
                <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                  <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Cukiernia</span>
                  <p className="text-xl font-black text-slate-900">{selectedDayDetails.pastrySales.toFixed(2)} zł</p>
                  <p className="text-[10px] font-bold text-rose-500 uppercase mt-2">Strata: {selectedDayDetails.pastryLoss.toFixed(2)} zł</p>
                </div>
              </div>

              <button onClick={() => setSelectedDayDetails(null)} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all">
                Zamknij podgląd
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Powitanie i Nagłówek */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-full tracking-widest ${
                isAdmin ? 'bg-slate-900 text-white' : 'bg-amber-100 text-amber-700'
              }`}>
                {isAdmin ? 'Panel Administratora' : 'Sieć Piekarnia Rzepka'}
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Cześć, {user.email.split('@')[0]}!</h1>
            <p className="text-slate-500 font-medium mt-1">
              {isAdmin ? 'Monitorujesz wyniki całej sieci sprzedaży.' : `Podgląd wyników dla lokalizacji ${locationName}.`}
            </p>
         </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Sprzedaż Netto', value: stats.monthlySales.toLocaleString(), unit: 'zł', bakery: stats.monthlyBakery, pastry: stats.monthlyPastry, icon: <TrendingUp />, color: 'text-emerald-600' },
          { label: 'Łączne Straty', value: stats.monthlyLoss.toLocaleString(), unit: 'zł', bakery: stats.bakeryLoss, pastry: stats.pastryLoss, icon: <TrendingDown />, color: 'text-rose-600' },
          { label: 'Wykonanie Planu', value: stats.planExecution, unit: '%', bakery: 92, pastry: 84, icon: <Target />, color: 'text-amber-600' },
          { label: 'Ranking Sieci', value: isAdmin ? 'Aktywna' : 'TOP 3', unit: '', bakery: '↑', pastry: '↓', icon: <Award />, color: 'text-indigo-600' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-7 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className={`p-3 w-fit rounded-2xl bg-slate-50 ${kpi.color} mb-6`}>{kpi.icon}</div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">{kpi.value} <span className="text-sm text-slate-400 font-medium">{kpi.unit}</span></h3>
            <div className="flex items-center gap-3 pt-4 mt-4 border-t border-slate-50">
               <div className="flex-1">
                  <p className="text-[8px] font-black text-amber-500 uppercase mb-0.5">Piekarnia</p>
                  <p className="text-[11px] font-black text-slate-700">{typeof kpi.bakery === 'number' ? kpi.bakery.toLocaleString() : kpi.bakery} {kpi.unit}</p>
               </div>
               <div className="flex-1">
                  <p className="text-[8px] font-black text-indigo-500 uppercase mb-0.5">Cukiernia</p>
                  <p className="text-[11px] font-black text-slate-700">{typeof kpi.pastry === 'number' ? kpi.pastry.toLocaleString() : kpi.pastry} {kpi.unit}</p>
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kalendarz */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <CalendarIcon className="text-amber-500" />
                Obecność raportów
              </h2>
            </div>
            <div className="grid grid-cols-7 gap-3">
              {calendarData.map((d) => (
                <button
                  key={d.day}
                  onClick={() => d.status === 'perfect' && setSelectedDayDetails(d)}
                  className={`aspect-square rounded-[1.25rem] border-2 flex flex-col items-center justify-center transition-all ${
                    d.status === 'perfect' ? 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:scale-105' : 'bg-slate-50 border-slate-100 text-slate-300'
                  }`}
                >
                  <span className="text-xs font-black">{d.day}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Komunikaty */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3"><BellRing className="text-amber-500" /> Komunikaty</h2>
          </div>
          <div className="space-y-4">
            {messages.length > 0 ? messages.map((msg) => (
              <div key={msg.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{new Date(msg.created_at).toLocaleDateString()}</p>
                <h4 className="text-sm font-black text-slate-900 mb-1">{msg.content.substring(0, 30)}...</h4>
                <p className="text-xs text-slate-500 line-clamp-2">{msg.content}</p>
              </div>
            )) : (
              <p className="text-xs text-slate-400 font-bold uppercase text-center py-10">Brak nowych komunikatów</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
