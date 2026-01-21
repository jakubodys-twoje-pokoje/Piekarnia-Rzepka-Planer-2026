
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  TrendingUp, TrendingDown, Award, 
  Target, ChevronRight, ChevronLeft, Calendar as CalendarIcon, 
  CheckCheck, LayoutGrid, MessageSquare, X, Info, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { LOCATIONS } from '../constants';

interface DashboardProps {
  user: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [viewMode, setViewMode] = useState<'overview' | 'calendar'>('overview');
  const [readMessages, setReadMessages] = useState<number[]>([]);
  const [selectedDayDetails, setSelectedDayDetails] = useState<any | null>(null);

  // Mock data for days
  const daysInMonth = new Date(2026, 1, 0).getDate();
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    date: `2026-01-${(i + 1).toString().padStart(2, '0')}`,
    status: i % 7 === 0 ? 'missed' : i % 5 === 0 ? 'warning' : 'perfect',
    bakerySales: 1100 + Math.random() * 500,
    pastrySales: 800 + Math.random() * 400,
    bakeryLoss: 20 + Math.random() * 40,
    pastryLoss: 15 + Math.random() * 30,
    target: 2000,
  }));

  const markAsRead = (id: number) => setReadMessages(prev => [...prev, id]);

  const kpiData = [
    { label: 'Przychód Miesiąc', value: '42 950', unit: 'zł', trend: '+14%', color: 'text-emerald-600', icon: <TrendingUp size={22}/> },
    { label: 'Strata Total', value: '1 420', unit: 'zł', trend: '3.3%', color: 'text-rose-600', icon: <TrendingDown size={22}/> },
    { label: 'Realizacja Celu', value: '89', unit: '%', trend: 'Na dzień 21.01', color: 'text-amber-600', icon: <Target size={22}/> },
    { label: 'Pozycja w Sieci', value: 'TOP 2', unit: '', trend: '↑ Awans', color: 'text-indigo-600', icon: <Award size={22}/> },
  ];

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Detale Dnia (Modal) */}
      {selectedDayDetails && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Szczegóły Raportu</h3>
                  <p className="text-2xl font-black text-slate-900">{selectedDayDetails.date}</p>
                </div>
                <button 
                  onClick={() => setSelectedDayDetails(null)}
                  className="p-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Porównanie z celem */}
              <div className="bg-slate-900 rounded-3xl p-6 text-white flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Całkowita Sprzedaż</p>
                  <p className="text-3xl font-black">{(selectedDayDetails.bakerySales + selectedDayDetails.pastrySales).toFixed(2)} zł</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vs Cel Dzienny</p>
                  <div className={`flex items-center gap-1 font-black text-lg ${
                    (selectedDayDetails.bakerySales + selectedDayDetails.pastrySales) >= selectedDayDetails.target 
                    ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {((selectedDayDetails.bakerySales + selectedDayDetails.pastrySales) / selectedDayDetails.target * 100).toFixed(1)}%
                    {(selectedDayDetails.bakerySales + selectedDayDetails.pastrySales) >= selectedDayDetails.target ? <ArrowUpRight size={20}/> : <ArrowDownRight size={20}/>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-white border-2 border-slate-50 rounded-3xl space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Piekarnia Sprzedaż</p>
                  <p className="text-xl font-black text-slate-900">{selectedDayDetails.bakerySales.toFixed(2)} zł</p>
                  <p className="text-[10px] font-bold text-rose-500">Strata: {selectedDayDetails.bakeryLoss.toFixed(2)} zł</p>
                </div>
                <div className="p-5 bg-white border-2 border-slate-50 rounded-3xl space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cukiernia Sprzedaż</p>
                  <p className="text-xl font-black text-slate-900">{selectedDayDetails.pastrySales.toFixed(2)} zł</p>
                  <p className="text-[10px] font-bold text-rose-500">Strata: {selectedDayDetails.pastryLoss.toFixed(2)} zł</p>
                </div>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${
                  selectedDayDetails.status === 'perfect' ? 'bg-emerald-100 text-emerald-600' :
                  selectedDayDetails.status === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
                }`}>
                  <Info size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">
                    {selectedDayDetails.status === 'perfect' ? 'Doskonała realizacja normy' : 
                     selectedDayDetails.status === 'warning' ? 'Zwróć uwagę na poziom strat' : 'Wynik poniżej progu opłacalności'}
                  </p>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2">
                    <div 
                      className={`h-full rounded-full ${selectedDayDetails.status === 'perfect' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(100, (selectedDayDetails.bakerySales + selectedDayDetails.pastrySales) / selectedDayDetails.target * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setSelectedDayDetails(null)}
              className="w-full py-6 bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Centrum Dowodzenia
            <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-md uppercase tracking-widest">Piekarnia</span>
          </h1>
          <p className="text-sm text-slate-500 font-medium">Lokalizacja: <span className="text-amber-600 font-bold">{LOCATIONS.find(l => l.id === user.default_location_id)?.name}</span></p>
        </div>

        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
          <button 
            onClick={() => setViewMode('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${viewMode === 'overview' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutGrid size={16} /> PODSUMOWANIE
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${viewMode === 'calendar' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <CalendarIcon size={16} /> KALENDARZ
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, idx) => (
          <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm group hover:border-amber-200 transition-all">
            <div className={`mb-3 ${kpi.color}`}>{kpi.icon}</div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-black text-slate-900 tracking-tight">{kpi.value}</span>
              <span className="text-xs font-bold text-slate-400">{kpi.unit}</span>
            </div>
            <p className={`text-[10px] font-bold mt-1 ${kpi.color}`}>{kpi.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {viewMode === 'overview' ? (
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm min-h-[400px] flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Ostatnie 7 Dni</h2>
                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-amber-500 rounded-full"></div><span className="text-[9px] font-black text-slate-400 uppercase">Sprzedaż</span></div>
                </div>
              </div>
              <div className="flex-1 flex items-end justify-between gap-3 px-2">
                {[55, 68, 42, 85, 60, 95, 48].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full justify-end group cursor-pointer" onClick={() => setSelectedDayDetails(calendarDays[i + 14])}>
                    <div className="w-full bg-slate-50 rounded-t-xl h-full relative overflow-hidden">
                       <div className="absolute bottom-0 w-full bg-amber-500/10 h-full"></div>
                       <div className="absolute bottom-0 w-full bg-amber-500 rounded-t-xl shadow-sm transition-all duration-700 group-hover:bg-amber-400" style={{ height: `${val}%` }}></div>
                       {val > 80 && <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[8px] font-black text-white">★</div>}
                    </div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">1{i+5}.01</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm min-h-[400px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Styczeń 2026</h2>
                <div className="flex gap-1.5">
                  <button className="p-1.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"><ChevronLeft size={16}/></button>
                  <button className="p-1.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"><ChevronRight size={16}/></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map(d => (
                  <div key={d} className="text-center text-[9px] font-black text-slate-300 py-1 uppercase">{d}</div>
                ))}
                {calendarDays.map(d => (
                  <button 
                    key={d.day} 
                    onClick={() => setSelectedDayDetails(d)}
                    className={`aspect-square rounded-xl p-1.5 border-2 flex flex-col justify-between transition-all hover:scale-[1.03] active:scale-95 ${
                      d.status === 'perfect' ? 'bg-emerald-50 border-emerald-100 hover:border-emerald-300' :
                      d.status === 'warning' ? 'bg-amber-50 border-amber-100 hover:border-amber-300' :
                      'bg-rose-50 border-rose-100 hover:border-rose-300'
                    }`}
                  >
                    <span className={`text-[10px] font-black ${
                      d.status === 'perfect' ? 'text-emerald-700' :
                      d.status === 'warning' ? 'text-amber-700' : 'text-rose-700'
                    }`}>{d.day}</span>
                    <div className={`h-1.5 w-full rounded-full ${d.status === 'perfect' ? 'bg-emerald-400' : d.status === 'warning' ? 'bg-amber-400' : 'bg-rose-400'}`}></div>
                  </button>
                ))}
              </div>
              <p className="mt-6 text-[9px] font-black text-slate-300 uppercase tracking-widest text-center">Wybierz dzień, aby sprawdzić wyniki szczegółowe</p>
            </div>
          )}
        </div>

        {/* Messaging Section (Unchanged for brevity, same as previous version) */}
        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-lg h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <MessageSquare size={18} className="text-amber-500" />
              Komunikaty
            </h2>
            <div className="px-2 py-0.5 bg-rose-500 rounded text-[9px] font-black text-white pulse-amber uppercase">Nowe</div>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {[
              { id: 1, title: 'Dostawa Mąki', content: 'Opóźnienie o 2h z powodu korków.', date: '10:15', urgent: true },
              { id: 2, title: 'Nowe Menu', content: 'Wprowadzamy pączki z pistacją.', date: '08:45', urgent: false },
            ].map(msg => (
              <div key={msg.id} className={`p-4 rounded-2xl transition-all border ${readMessages.includes(msg.id) ? 'bg-white/5 opacity-30' : 'bg-white/10 border-white/5'}`}>
                <div className="flex items-start justify-between mb-1.5">
                  <h4 className={`text-[11px] font-black uppercase tracking-tight ${msg.urgent ? 'text-amber-400' : 'text-white'}`}>{msg.title}</h4>
                  {!readMessages.includes(msg.id) && <button onClick={() => markAsRead(msg.id)} className="text-white/20 hover:text-emerald-400 transition-colors"><CheckCheck size={14}/></button>}
                </div>
                <p className="text-[11px] text-white/50 font-medium leading-tight mb-2">{msg.content}</p>
                <span className="text-[8px] text-white/20 font-black uppercase">{msg.date}</span>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full py-3 bg-amber-600 text-white font-black text-[10px] rounded-xl hover:bg-amber-500 transition-all uppercase tracking-widest shadow-lg shadow-amber-600/10">Archiwum</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
