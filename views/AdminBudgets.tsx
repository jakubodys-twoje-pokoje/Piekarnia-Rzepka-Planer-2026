
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Save, Loader2, CheckCircle2, 
  AlertCircle, LayoutGrid, 
  MapPin, Landmark, Banknote,
  ArrowRightLeft
} from 'lucide-react';
import { supabase } from '../supabase';
import { MONTHS } from '../constants';

const QUARTERS = [
  { id: 1, label: 'Q1', months: [0, 1, 2] },
  { id: 2, label: 'Q2', months: [3, 4, 5] },
  { id: 3, label: 'Q3', months: [6, 7, 8] },
  { id: 4, label: 'Q4', months: [9, 10, 11] }
];

const getWeeksInMonth = (month: number, year: number) => {
  const weeks: number[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const getISOWeek = (d: Date) => {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
  };

  let current = new Date(firstDay);
  while (current <= lastDay) {
    const w = getISOWeek(current);
    if (!weeks.includes(w)) weeks.push(w);
    current.setDate(current.getDate() + 7);
  }
  const lastWeek = getISOWeek(lastDay);
  if (!weeks.includes(lastWeek)) weeks.push(lastWeek);

  return weeks.sort((a, b) => a - b);
};

const AdminBudgets: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState(QUARTERS[Math.floor(new Date().getMonth() / 3)]);
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(new Date().getMonth());
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [targets, setTargets] = useState<Record<string, any>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const activeWeeks = useMemo(() => getWeeksInMonth(selectedMonthIdx, selectedYear), [selectedMonthIdx, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: locData }, { data: targetData }] = await Promise.all([
        supabase.from('locations').select('*').order('name'),
        supabase.from('targets').select('*').eq('year', selectedYear).in('week_number', activeWeeks)
      ]);

      setLocations(locData || []);
      const targetMap: Record<string, any> = {};
      (targetData || []).forEach(t => {
        targetMap[`${t.location_id}-${t.week_number}`] = t;
      });
      setTargets(targetMap);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedMonthIdx, selectedYear, activeWeeks]);

  const handleUpdate = (locId: string, week: number, field: string, value: string) => {
    const key = `${locId}-${week}`;
    const numVal = value === '' ? 0 : parseFloat(value);
    
    setTargets(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || { location_id: locId, week_number: week, year: selectedYear }),
        [field]: numVal
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    try {
      const payloads = Object.values(targets);
      const { error } = await supabase
        .from('targets')
        .upsert(payloads, { onConflict: 'location_id,week_number,year' });

      if (error) throw error;
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error("Save error:", err);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-32 gap-6">
      <Loader2 size={64} className="animate-spin text-amber-500" />
      <h2 className="text-xl font-black text-slate-900 uppercase">Ładowanie Macierzy...</h2>
    </div>
  );

  return (
    <div className="space-y-6 pb-24 max-w-[1600px] mx-auto">
      {/* NAGŁÓWEK KONTROLNY */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          <div className="shrink-0">
            <div className="flex items-center gap-2 text-amber-600 mb-1">
              <Landmark size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">BUDŻET I CELE</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Planowanie Sieci</h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1">
              {QUARTERS.map(q => (
                <button
                  key={q.id}
                  onClick={() => {
                    setSelectedQuarter(q);
                    setSelectedMonthIdx(q.months[0]);
                  }}
                  className={`px-6 py-2.5 rounded-xl font-black text-[11px] transition-all uppercase ${
                    selectedQuarter.id === q.id ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>

            <div className="bg-slate-900 text-white p-1.5 rounded-2xl flex gap-1">
              {selectedQuarter.months.map(mIdx => (
                <button
                  key={mIdx}
                  onClick={() => setSelectedMonthIdx(mIdx)}
                  className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase transition-all ${
                    selectedMonthIdx === mIdx ? 'bg-amber-500 text-white shadow-lg' : 'text-white/40 hover:text-white'
                  }`}
                >
                  {MONTHS[mIdx]}
                </button>
              ))}
            </div>

            <button 
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50 ${
                saveStatus === 'success' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-amber-600'
              }`}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16}/>}
              Zapisz Cele
            </button>
          </div>
        </div>
      </div>

      {/* WSKAŹNIK PRZEWIJANIA GÓRNEGO */}
      <div className="bg-slate-50 px-8 py-2 rounded-full border border-slate-100 flex items-center justify-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
        <ArrowRightLeft size={14} className="text-amber-500" />
        Przesuń tabelę w poziomie, aby zobaczyć wszystkie tygodnie
        <ArrowRightLeft size={14} className="text-amber-500" />
      </div>

      {/* GŁÓWNA TABELA - ULEPSZONY SCROLL */}
      <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar-heavy p-1">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="sticky left-0 z-30 bg-slate-900 px-10 py-10 text-left border-r border-white/10 min-w-[300px]">
                  <div className="flex items-center gap-3">
                     <MapPin size={20} className="text-amber-500" />
                     <span className="text-[11px] font-black uppercase tracking-[0.2em]">Lokalizacja</span>
                  </div>
                </th>
                {activeWeeks.map(w => (
                  <th key={w} className="px-6 py-10 text-center min-w-[240px] border-r border-white/10">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] text-amber-500/60 mb-1">Tydzień ISO</p>
                    <p className="text-3xl font-black tracking-tighter">{w}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {locations.map(loc => (
                <tr key={loc.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="sticky left-0 z-20 bg-white group-hover:bg-slate-50 px-10 py-10 border-r border-slate-100 shadow-[10px_0_20px_-10px_rgba(0,0,0,0.05)]">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none mb-1.5">{loc.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{loc.address}</p>
                  </td>

                  {activeWeeks.map(w => {
                    const key = `${loc.id}-${w}`;
                    const data = targets[key] || {};
                    return (
                      <td key={w} className="p-6 border-r border-slate-100">
                        <div className="space-y-6">
                          <div className="bg-amber-50/50 p-4 rounded-3xl border border-amber-100 space-y-4 shadow-inner">
                            <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-2"><Banknote size={12}/> Piekarnia</p>
                            <div className="space-y-3">
                              <div>
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1 block ml-1">Plan Sprzedaży</label>
                                <input 
                                  type="number"
                                  value={data.bakery_daily_target || ''}
                                  onChange={e => handleUpdate(loc.id, w, 'bakery_daily_target', e.target.value)}
                                  className="w-full bg-white px-4 py-3 rounded-xl border border-amber-200 font-black text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20"
                                  placeholder="0.00"
                                />
                              </div>
                              <div>
                                <label className="text-[8px] font-black text-rose-400 uppercase tracking-wider mb-1 block ml-1">Plan Straty</label>
                                <input 
                                  type="number"
                                  value={data.bakery_loss_target || ''}
                                  onChange={e => handleUpdate(loc.id, w, 'bakery_loss_target', e.target.value)}
                                  className="w-full bg-white px-4 py-3 rounded-xl border border-rose-200 font-black text-sm text-rose-600 outline-none focus:ring-2 focus:ring-rose-500/20"
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="bg-pink-50/50 p-4 rounded-3xl border border-pink-100 space-y-4 shadow-inner">
                            <p className="text-[9px] font-black text-pink-700 uppercase tracking-widest flex items-center gap-2"><Banknote size={12}/> Cukiernia</p>
                            <div className="space-y-3">
                              <div>
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1 block ml-1">Plan Sprzedaży</label>
                                <input 
                                  type="number"
                                  value={data.pastry_daily_target || ''}
                                  onChange={e => handleUpdate(loc.id, w, 'pastry_daily_target', e.target.value)}
                                  className="w-full bg-white px-4 py-3 rounded-xl border border-pink-200 font-black text-sm text-slate-900 outline-none focus:ring-2 focus:ring-pink-500/20"
                                  placeholder="0.00"
                                />
                              </div>
                              <div>
                                <label className="text-[8px] font-black text-rose-400 uppercase tracking-wider mb-1 block ml-1">Plan Straty</label>
                                <input 
                                  type="number"
                                  value={data.pastry_loss_target || ''}
                                  onChange={e => handleUpdate(loc.id, w, 'pastry_loss_target', e.target.value)}
                                  className="w-full bg-white px-4 py-3 rounded-xl border border-rose-200 font-black text-sm text-rose-600 outline-none focus:ring-2 focus:ring-rose-500/20"
                                  placeholder="0.00"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBudgets;
