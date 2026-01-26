
import React, { useState, useEffect } from 'react';
/* Added MapPin to the lucide-react imports */
import { Save, Percent, Banknote, Target, TrendingDown, Loader2, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';
import { supabase } from '../supabase';

// Helper do pobierania numeru tygodnia ISO
const getISOWeek = (date: Date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

const AdminBudgets: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState(getISOWeek(new Date()));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: locData } = await supabase.from('locations').select('*').order('name');
      setLocations(locData || []);

      // Pobieramy cele (re-używamy tabeli targets, używając "month" jako numeru tygodnia dla uproszczenia bazy lub dedykowanego pola jeśli istnieje)
      // W wersji profesjonalnej sprawdzamy czy mamy kolumnę "week", jeśli nie - używamy month jako week_number tymczasowo
      const { data: targetData, error } = await supabase
        .from('targets')
        .select('*')
        .eq('month', selectedWeek) // Mapujemy wybranego tygodnia
        .eq('year', selectedYear);

      if (error) throw error;

      const merged = (locData || []).map(loc => {
        const existing = (targetData || []).find(d => d.location_id === loc.id);
        return existing ? { ...existing } : {
          location_id: loc.id,
          month: selectedWeek,
          year: selectedYear,
          bakery_daily_target: 0,
          bakery_loss_target: 5,
          bakery_loss_type: 'percent',
          pastry_daily_target: 0,
          pastry_loss_target: 5,
          pastry_loss_type: 'percent'
        };
      });

      setBudgets(merged);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedWeek, selectedYear]);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    try {
      const payloads = budgets.map(b => ({
        location_id: b.location_id,
        month: b.month,
        year: b.year,
        bakery_daily_target: Number(b.bakery_daily_target),
        bakery_loss_target: Number(b.bakery_loss_target),
        bakery_loss_type: b.bakery_loss_type,
        pastry_daily_target: Number(b.pastry_daily_target),
        pastry_loss_target: Number(b.pastry_loss_target),
        pastry_loss_type: b.pastry_loss_type
      }));

      const { error } = await supabase
        .from('targets')
        .upsert(payloads, { onConflict: 'location_id,month,year' });

      if (error) throw error;
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (locId: string, field: string, value: any) => {
    setBudgets(prev => prev.map(b => 
      b.location_id === locId ? { ...b, [field]: value } : b
    ));
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-32 gap-6 text-center">
      <Loader2 size={64} className="animate-spin text-amber-500 mb-4" />
      <h2 className="text-xl font-black text-slate-900 uppercase tracking-widest">Planowanie Tygodnia</h2>
      <p className="text-xs font-bold text-slate-400">Pobieranie celów dla wszystkich punktów Rzepka...</p>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      {/* Week Selector Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3 text-amber-600 mb-1">
             <Calendar size={18} />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Zarządzanie Budżetami</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">Cele Tygodniowe</h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-slate-50 p-2 rounded-2xl flex items-center gap-4 border border-slate-100 shadow-inner">
             <button 
              onClick={() => setSelectedWeek(prev => prev > 1 ? prev - 1 : 52)}
              className="p-3 bg-white rounded-xl text-slate-400 hover:text-slate-900 shadow-sm transition-all active:scale-90"
             >
                <ChevronLeft size={20} />
             </button>
             <div className="text-center min-w-[120px]">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Tydzień ISO</p>
                <p className="text-lg font-black text-slate-900">{selectedWeek} <span className="text-xs text-slate-400">/ {selectedYear}</span></p>
             </div>
             <button 
              onClick={() => setSelectedWeek(prev => prev < 52 ? prev + 1 : 1)}
              className="p-3 bg-white rounded-xl text-slate-400 hover:text-slate-900 shadow-sm transition-all active:scale-90"
             >
                <ChevronRight size={20} />
             </button>
          </div>

          <button 
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 disabled:opacity-50 ${
              saveStatus === 'success' ? 'bg-emerald-600 text-white' : 
              saveStatus === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-white hover:bg-amber-600'
            }`}
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : (
              saveStatus === 'success' ? <CheckCircle2 size={18} /> : 
              saveStatus === 'error' ? <AlertCircle size={18} /> : <Save size={18} />
            )}
            {saving ? 'Zapisywanie...' : (
              saveStatus === 'success' ? 'Zapisano!' : 
              saveStatus === 'error' ? 'Błąd' : 'Zapisz Cele Tygodnia'
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {budgets.map(b => (
          <div key={b.location_id} className="bg-white p-8 rounded-[3.5rem] border border-slate-200 shadow-sm hover:border-amber-500/30 transition-all grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Lokalizacja */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-5">
                 <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-2xl shadow-xl shadow-slate-900/10">🏬</div>
                 <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">
                      {locations.find(l => l.id === b.location_id)?.name || 'Punkt'}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                      <MapPin size={10} className="text-amber-500" /> Stały punkt sprzedaży
                    </p>
                 </div>
              </div>
            </div>

            {/* Piekarnia */}
            <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-amber-50/50 rounded-3xl border border-amber-100 flex flex-col justify-center">
                <label className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                   <Target size={12} /> Plan Piekarnia (zł)
                </label>
                <input 
                  type="number" 
                  value={b.bakery_daily_target} 
                  onChange={e => updateField(b.location_id, 'bakery_daily_target', e.target.value)}
                  className="w-full bg-transparent border-none font-black text-2xl text-slate-900 focus:ring-0 p-0 outline-none placeholder:text-slate-200"
                  placeholder="0.00"
                />
              </div>
              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <TrendingDown size={12} /> Strata
                   </label>
                   <div className="flex bg-white rounded-lg p-0.5 shadow-sm border border-slate-100">
                      <button onClick={() => updateField(b.location_id, 'bakery_loss_type', 'percent')} className={`p-1 rounded-md text-[8px] font-black transition-all ${b.bakery_loss_type === 'percent' ? 'bg-amber-500 text-white' : 'text-slate-300'}`}>%</button>
                      <button onClick={() => updateField(b.location_id, 'bakery_loss_type', 'amount')} className={`p-1 rounded-md text-[8px] font-black transition-all ${b.bakery_loss_type === 'amount' ? 'bg-amber-500 text-white' : 'text-slate-300'}`}>zł</button>
                   </div>
                </div>
                <input 
                  type="number" 
                  value={b.bakery_loss_target} 
                  onChange={e => updateField(b.location_id, 'bakery_loss_target', e.target.value)}
                  className="w-full bg-transparent border-none font-black text-xl text-slate-700 focus:ring-0 p-0 outline-none"
                />
              </div>
            </div>

            {/* Cukiernia */}
            <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-pink-50/50 rounded-3xl border border-pink-100 flex flex-col justify-center">
                <label className="text-[9px] font-black text-pink-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                   <Target size={12} /> Plan Cukiernia (zł)
                </label>
                <input 
                  type="number" 
                  value={b.pastry_daily_target} 
                  onChange={e => updateField(b.location_id, 'pastry_daily_target', e.target.value)}
                  className="w-full bg-transparent border-none font-black text-2xl text-slate-900 focus:ring-0 p-0 outline-none placeholder:text-slate-200"
                  placeholder="0.00"
                />
              </div>
              <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <TrendingDown size={12} /> Strata
                   </label>
                   <div className="flex bg-white rounded-lg p-0.5 shadow-sm border border-slate-100">
                      <button onClick={() => updateField(b.location_id, 'pastry_loss_type', 'percent')} className={`p-1 rounded-md text-[8px] font-black transition-all ${b.pastry_loss_type === 'percent' ? 'bg-pink-500 text-white' : 'text-slate-300'}`}>%</button>
                      <button onClick={() => updateField(b.location_id, 'pastry_loss_type', 'amount')} className={`p-1 rounded-md text-[8px] font-black transition-all ${b.pastry_loss_type === 'amount' ? 'bg-pink-500 text-white' : 'text-slate-300'}`}>zł</button>
                   </div>
                </div>
                <input 
                  type="number" 
                  value={b.pastry_loss_target} 
                  onChange={e => updateField(b.location_id, 'pastry_loss_target', e.target.value)}
                  className="w-full bg-transparent border-none font-black text-xl text-slate-700 focus:ring-0 p-0 outline-none"
                />
              </div>
            </div>

            <div className="lg:col-span-1 flex justify-center">
               <div className={`w-3 h-3 rounded-full ${b.bakery_daily_target > 0 ? 'bg-emerald-500 pulse-amber' : 'bg-slate-200'}`}></div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminBudgets;
