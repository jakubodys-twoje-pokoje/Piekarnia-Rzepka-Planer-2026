
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  TrendingUp, TrendingDown, Award, 
  Target, ChevronRight, X, ArrowUpRight, ArrowDownRight,
  BellRing, Globe, MapPin, Calendar as CalendarIcon,
  MessageSquare, Info, CheckCheck, PieChart, Layers
} from 'lucide-react';
import { LOCATIONS } from '../constants';

interface DashboardProps {
  user: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [readMessages, setReadMessages] = useState<string[]>([]);
  const [selectedDayDetails, setSelectedDayDetails] = useState<any | null>(null);

  const isAdmin = user.role === 'admin';
  const locationName = isAdmin 
    ? 'Wszystkie punkty (Global)' 
    : (LOCATIONS.find(l => l.id === user.default_location_id)?.name || 'Nieznany punkt');

  // Mockowe dane kalendarza (Dla admina to suma sieci, dla usera jego punkt)
  const daysInMonth = 31;
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    date: `2026-01-${(i + 1).toString().padStart(2, '0')}`,
    status: i % 7 === 0 ? 'missed' : i % 5 === 0 ? 'warning' : 'perfect',
    bakerySales: (isAdmin ? 8500 : 1250) + Math.random() * 300,
    pastrySales: (isAdmin ? 6200 : 950) + Math.random() * 400,
    bakeryLoss: (isAdmin ? 320 : 45) + Math.random() * 20,
    pastryLoss: (isAdmin ? 240 : 30) + Math.random() * 25,
    bakeryTarget: isAdmin ? 8000 : 1200,
    pastryTarget: isAdmin ? 6000 : 1000,
    target: isAdmin ? 14000 : 2200,
  }));

  const systemMessages = [
    { id: 'm1', type: 'global', sender: 'Zarząd', title: 'Nowe zasady zwrotów', content: 'Od jutra wprowadzamy obowiązkowe zdjęcia strat powyżej 50 PLN.', time: '10:15', urgent: true },
    { id: 'm2', type: 'location', sender: 'Anna Nowak', title: 'Dostawa mąki', content: 'Auto z mąką będzie u Was o 13:00.', time: '08:45', urgent: false },
  ];

  const kpiData = [
    { 
      label: 'Sprzedaż w miesiącu', 
      total: isAdmin ? '242 950' : '42 950', 
      bakery: isAdmin ? '150 400' : '26 200',
      pastry: isAdmin ? '92 550' : '16 750',
      unit: 'zł', 
      trend: '+14%', 
      color: 'text-emerald-600', 
      icon: <TrendingUp size={22}/> 
    },
    { 
      label: 'Łączne straty', 
      total: isAdmin ? '12 420' : '1 420', 
      bakery: isAdmin ? '7 100' : '820',
      pastry: isAdmin ? '5 320' : '600',
      unit: 'zł', 
      trend: '3.3%', 
      color: 'text-rose-600', 
      icon: <TrendingDown size={22}/> 
    },
    { 
      label: 'Wykonanie planu', 
      total: '89', 
      bakery: '92',
      pastry: '84',
      unit: '%', 
      trend: 'Stan na 21.01', 
      color: 'text-amber-600', 
      icon: <Target size={22}/> 
    },
    { 
      label: 'Ranking punktu', 
      total: isAdmin ? 'Sieć OK' : 'TOP 2', 
      bakery: isAdmin ? 'Piekarnia ↑' : 'TOP 1',
      pastry: isAdmin ? 'Cukiernia ↓' : 'TOP 5',
      unit: '', 
      trend: isAdmin ? 'Global' : '↑ Awans', 
      color: 'text-indigo-600', 
      icon: <Award size={22}/> 
    },
  ];

  const markAsRead = (id: string) => setReadMessages(prev => [...prev, id]);

  return (
    <div className="space-y-8 pb-12 relative">
      {/* Modal Szczegółów Dnia */}
      {selectedDayDetails && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="p-10 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    {isAdmin ? 'Podsumowanie Sieci / Szczegóły' : 'Dziennik raportów / Szczegóły'}
                  </h3>
                  <p className="text-3xl font-black text-slate-900">{selectedDayDetails.date}</p>
                </div>
                <button onClick={() => setSelectedDayDetails(null)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-all">
                  <X size={24} />
                </button>
              </div>

              <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex items-center justify-between shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    {isAdmin ? 'Łączny przychód sieci' : 'Całkowity utarg dnia'}
                  </p>
                  <p className="text-4xl font-black">{(selectedDayDetails.bakerySales + selectedDayDetails.pastrySales).toFixed(2)} zł</p>
                </div>
                <div className="relative z-10 text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Realizacja celu</p>
                  <div className={`flex items-center justify-end gap-2 font-black text-2xl ${
                    (selectedDayDetails.bakerySales + selectedDayDetails.pastrySales) >= selectedDayDetails.target 
                    ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {((selectedDayDetails.bakerySales + selectedDayDetails.pastrySales) / selectedDayDetails.target * 100).toFixed(0)}%
                    <ArrowUpRight size={24}/>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-amber-500 text-white text-[9px] font-black uppercase rounded-lg tracking-widest">Piekarnia</span>
                    <span className="text-[10px] font-black text-amber-600">Cel: {selectedDayDetails.bakeryTarget} zł</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sprzedaż netto</p>
                    <p className="text-2xl font-black text-slate-900">{selectedDayDetails.bakerySales.toFixed(2)} zł</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-amber-100/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Straty</span>
                      <span className="text-sm font-black text-rose-500">{selectedDayDetails.bakeryLoss.toFixed(2)} zł</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Udział</span>
                      <span className="block text-sm font-black text-slate-700">
                        {(selectedDayDetails.bakerySales / (selectedDayDetails.bakerySales + selectedDayDetails.pastrySales) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-indigo-500 text-white text-[9px] font-black uppercase rounded-lg tracking-widest">Cukiernia</span>
                    <span className="text-[10px] font-black text-indigo-600">Cel: {selectedDayDetails.pastryTarget} zł</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sprzedaż netto</p>
                    <p className="text-2xl font-black text-slate-900">{selectedDayDetails.pastrySales.toFixed(2)} zł</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-indigo-100/50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Straty</span>
                      <span className="text-sm font-black text-rose-500">{selectedDayDetails.pastryLoss.toFixed(2)} zł</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-slate-400 uppercase">Udział</span>
                      <span className="block text-sm font-black text-slate-700">
                        {(selectedDayDetails.pastrySales / (selectedDayDetails.bakerySales + selectedDayDetails.pastrySales) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-2xl text-[11px] font-medium text-slate-500">
                <Info size={16} className="text-slate-400 shrink-0" />
                Dzień oznaczony jako <span className="text-emerald-600 font-bold px-1.5 py-0.5 bg-emerald-100 rounded-md">OK</span>. Dane zagregowane ze wszystkich raportów dziennych punktów sprzedaży.
              </div>

              <button onClick={() => setSelectedDayDetails(null)} className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl active:scale-[0.98]"> 
                Zamknij podgląd
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Powitanie i Nagłówek */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden relative">
         <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-full tracking-widest ${
                isAdmin ? 'bg-slate-900 text-white' : 'bg-amber-100 text-amber-700'
              }`}>
                {isAdmin ? 'Panel Administratora' : 'Sieć Piekarnia Rzepka'}
              </span>
              <span className="text-slate-300 font-bold text-[10px] uppercase tracking-widest">Styczeń 2026</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Cześć, {user.email.split('@')[0]}!</h1>
            <p className="text-slate-500 font-medium mt-1">
              {isAdmin ? 'Monitorujesz wyniki całej sieci sprzedaży.' : `Podgląd wyników dla lokalizacji ${locationName}.`}
            </p>
         </div>
         <div className="flex items-center gap-4 relative z-10 bg-slate-50 p-4 rounded-3xl border border-slate-100">
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                {isAdmin ? 'Dzienny cel sieci' : 'Twój cel na dziś'}
              </p>
              <p className="text-2xl font-black text-slate-900">
                {isAdmin ? '14 450,00' : '2 450,00'} zł
              </p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${
              isAdmin ? 'bg-slate-900 shadow-slate-900/20' : 'bg-amber-600 shadow-amber-600/20'
            }`}>
              {isAdmin ? <Layers size={20}/> : <Target size={20} />}
            </div>
         </div>
      </div>

      {/* KPI Cards with Unit Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, i) => (
          <div key={i} className="bg-white p-7 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="flex items-start justify-between mb-6">
              <div className={`p-3 rounded-2xl bg-slate-50 ${kpi.color} group-hover:scale-110 transition-transform`}>
                {kpi.icon}
              </div>
              <span className={`text-[9px] font-black px-2 py-1 rounded-lg bg-slate-50 ${kpi.color} border border-slate-100`}>
                {kpi.trend}
              </span>
            </div>
            
            <div className="mb-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{kpi.total} <span className="text-sm text-slate-400 font-medium">{kpi.unit}</span></h3>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
               <div className="flex-1">
                  <p className="text-[8px] font-black text-amber-500 uppercase tracking-tighter mb-0.5">Piekarnia</p>
                  <p className="text-[11px] font-black text-slate-700">{kpi.bakery}{kpi.unit}</p>
               </div>
               <div className="w-[1px] h-6 bg-slate-100"></div>
               <div className="flex-1">
                  <p className="text-[8px] font-black text-indigo-500 uppercase tracking-tighter mb-0.5">Cukiernia</p>
                  <p className="text-[11px] font-black text-slate-700">{kpi.pastry}{kpi.unit}</p>
               </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kalendarz Raportów */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-slate-50 opacity-10">
              <CalendarIcon size={120} />
            </div>
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                  <CalendarIcon size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {isAdmin ? 'Kalendarz Wyników Sieci' : 'Twój Dziennik - Styczeń'}
                </h2>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-sm"></div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OK</span></div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-rose-500 rounded-full shadow-sm"></div><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">BRAK</span></div>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-3 relative z-10">
              {calendarDays.map((d) => (
                <button
                  key={d.day}
                  onClick={() => setSelectedDayDetails(d)}
                  className={`aspect-square rounded-[1.25rem] border-2 flex flex-col items-center justify-center transition-all group relative ${
                    d.status === 'perfect' ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700 hover:bg-emerald-100 hover:scale-105 shadow-sm' :
                    d.status === 'warning' ? 'bg-amber-50/50 border-amber-100 text-amber-700 hover:bg-amber-100 hover:scale-105 shadow-sm' :
                    'bg-slate-50 border-slate-100 text-slate-300 hover:bg-rose-50 hover:border-rose-100 hover:text-rose-600 hover:scale-105'
                  }`}
                >
                  <span className="text-xs font-black">{d.day}</span>
                  {d.status !== 'missed' && (
                    <div className="flex gap-0.5 mt-1">
                      <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
                      <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                    </div>
                  )}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-white/20 rounded-[1.25rem] transition-opacity">
                    <ChevronRight size={14} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[3rem] p-10 text-white flex flex-col sm:flex-row items-center gap-10 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full -mr-32 -mt-32 blur-2xl group-hover:bg-amber-500/20 transition-all duration-700"></div>
             <div className="shrink-0 flex -space-x-4 relative z-10">
                {[1,2,3].map(i => (
                  <div key={i} className="w-14 h-14 rounded-2xl border-4 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-black shadow-xl">R</div>
                ))}
             </div>
             <div className="flex-1 text-center sm:text-left relative z-10">
                <p className="text-lg font-black text-amber-500 tracking-tight">
                  {isAdmin ? 'Wyniki sieci vs Budżet: 89%' : `Postęp punktu ${locationName}: 89%`}
                </p>
                <p className="text-sm text-slate-400 font-medium">
                  {isAdmin ? 'Cała sieć wypracowała 242 950 zł w tym miesiącu.' : 'Brakuje tylko 3 420 zł do bonusu za ten miesiąc.'}
                </p>
             </div>
             <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95 relative z-10">
                {isAdmin ? 'Szczegóły' : 'Sprawdź premię'}
             </button>
          </div>
        </div>

        {/* Komunikaty Wewnętrzne */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
              <BellRing size={22} className="text-amber-500" />
              Komunikaty
            </h2>
            <button className="text-[10px] font-black text-slate-400 uppercase hover:text-amber-600 tracking-[0.1em] transition-colors">Wszystkie</button>
          </div>

          <div className="space-y-5">
            {systemMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={`bg-white p-6 rounded-[2.25rem] border-2 transition-all group ${
                  readMessages.includes(msg.id) ? 'border-slate-50 opacity-60' : 'border-slate-100 hover:border-amber-200 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      msg.type === 'global' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {msg.type === 'global' ? <Globe size={16} /> : <MapPin size={16} />}
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{msg.sender}</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-300 uppercase">{msg.time}</span>
                </div>
                
                <h4 className={`text-sm font-black mb-2 flex items-center gap-2 tracking-tight ${msg.urgent && !readMessages.includes(msg.id) ? 'text-rose-600' : 'text-slate-900'}`}>
                  {msg.title}
                  {msg.urgent && !readMessages.includes(msg.id) && <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"></span>}
                </h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-5 line-clamp-2">
                  {msg.content}
                </p>

                <div className="flex items-center justify-between pt-5 border-t border-slate-50">
                   <button 
                     onClick={() => markAsRead(msg.id)}
                     className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase hover:text-emerald-500 transition-colors tracking-widest"
                   >
                     {readMessages.includes(msg.id) ? <CheckCheck size={14} className="text-emerald-500"/> : <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-200"></div>}
                     {readMessages.includes(msg.id) ? 'Przeczytane' : 'Odbierz'}
                   </button>
                   <button className="p-2.5 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                     <ChevronRight size={16} />
                   </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-50/50 p-6 rounded-[2.25rem] border border-amber-100 space-y-4 shadow-inner">
            <div className="flex items-center gap-3 text-amber-600">
               <div className="p-2 bg-white rounded-xl shadow-sm"><Info size={20} /></div>
               <p className="text-xs font-black uppercase tracking-widest">Wsparcie techniczne</p>
            </div>
            <p className="text-[11px] text-amber-900/60 font-medium leading-relaxed px-1">W razie problemów z synchronizacją raportów skontaktuj się z administratorem IT pod numerem wew. 104.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
