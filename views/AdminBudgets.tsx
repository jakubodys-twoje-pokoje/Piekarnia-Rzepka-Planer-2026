
import React, { useState, useEffect } from 'react';
import { MONTHS } from '../constants';
import { Save, Percent, Banknote, Target, TrendingDown, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../supabase';

const AdminBudgets: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
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

      const { data: targetData, error } = await supabase
        .from('targets')
        .select('*')
        .eq('month', selectedMonth + 1)
        .eq('year', selectedYear);

      if (error) throw error;

      const merged = (locData || []).map(loc => {
        const existing = (targetData || []).find(d => d.location_id === loc.id);
        return existing ? { ...existing } : {
          location_id: loc.id,
          month: selectedMonth + 1,
          year: selectedYear,
          bakery_daily_target: 4500,
          bakery_loss_target: 5,
          bakery_loss_type: 'percent',
          pastry_daily_target: 3200,
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

  useEffect(() => { fetchData(); }, [selectedMonth, selectedYear]);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    try {
      const payloads = budgets.map(b => ({
        location_id: b.location_id,
        month: b.month,
        year: b.year,
        bakery_daily_target: parseFloat(b.bakery_daily_target) || 0,
        bakery_loss_target: parseFloat(b.bakery_loss_target) || 0,
        bakery_loss_type: b.bakery_loss_type,
        pastry_daily_target: parseFloat(b.pastry_daily_target) || 0,
        pastry_loss_target: parseFloat(b.pastry_loss_target) || 0,
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

  const updateBudgetField = (locId: string, field: string, value: any) => {
    setBudgets(prev => prev.map(b => 
      b.location_id === locId ? { ...b, [field]: value } : b
    ));
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
      <Loader2 size={64} className="animate-spin text-amber-500 mb-4" />
      <h2 className="text-xl font-black text-slate-900 uppercase">Ładowanie Celów</h2>
      <p className="text-sm font-medium text-slate-400">Pobieranie konfiguracji budżetowej dla wszystkich punktów...</p>
    </div>
  );

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Ustawienia Celów</h1>
          <p className="text-slate-500 font-medium mt-2">Zdefiniuj dzienne plany sprzedaży i limity strat.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-2">
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="pl-5 pr-10 py-3 bg-slate-50 border-none rounded-xl font-black text-[11px] text-slate-700 outline-none uppercase tracking-widest cursor-pointer"
            >
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="pl-5 pr-10 py-3 bg-slate-50 border-none rounded-xl font-black text-[11px] text-slate-700 outline-none uppercase tracking-widest cursor-pointer"
            >
              {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <button 
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 disabled:opacity-50 ${
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
              saveStatus === 'error' ? 'Błąd zapisu' : 'Zatwierdź Plany'
            )}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-10 py-8 opacity-40">Punkt Sprzedaży Rzepka</th>
                <th className="px-8 py-8 text-amber-400">Piekarnia (Plan Dzienny)</th>
                <th className="px-8 py-8 text-pink-400">Cukiernia (Plan Dzienny)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budgets.map(b => (
                <tr key={b.location_id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-10">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl shadow-inner">🏬</div>
                       <span className="text-xl font-black text-slate-900 tracking-tight">
                         {locations.find(l => l.id === b.location_id)?.name || 'Nieznany'}
                       </span>
                    </div>
                  </td>
                  
                  <td className="px-8 py-10">
                    <div className="space-y-4 max-w-[240px]">
                      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border-2 border-slate-100 focus-within:border-amber-500 transition-all shadow-sm">
                        <Target size={16} className="text-slate-300" />
                        <div className="flex-1">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Sprzedaż (zł)</p>
                          <input 
                            type="number" 
                            value={b.bakery_daily_target} 
                            onChange={e => updateBudgetField(b.location_id, 'bakery_daily_target', e.target.value)}
                            className="w-full bg-transparent border-none font-black text-lg text-slate-800 focus:ring-0 p-0 outline-none" 
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 bg-amber-50/50 p-3 rounded-2xl border-2 border-amber-100/50 focus-within:border-amber-500 transition-all">
                        <TrendingDown size={16} className="text-amber-400" />
                        <div className="flex-1">
                          <p className="text-[8px] font-black text-amber-500/60 uppercase tracking-widest mb-0.5">Cel Strat ({b.bakery_loss_type === 'percent' ? '%' : 'zł'})</p>
                          <input 
                            type="number" 
                            value={b.bakery_loss_target} 
                            onChange={e => updateBudgetField(b.location_id, 'bakery_loss_target', e.target.value)}
                            className="w-full bg-transparent border-none font-black text-lg text-amber-700 focus:ring-0 p-0 outline-none" 
                          />
                        </div>
                        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-amber-100">
                           <button onClick={() => updateBudgetField(b.location_id, 'bakery_loss_type', 'percent')} className={`p-1.5 rounded-lg transition-all ${b.bakery_loss_type === 'percent' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-300 hover:text-slate-500'}`} title="Procentowo"><Percent size={14}/></button>
                           <button onClick={() => updateBudgetField(b.location_id, 'bakery_loss_type', 'amount')} className={`p-1.5 rounded-lg transition-all ${b.bakery_loss_type === 'amount' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-300 hover:text-slate-500'}`} title="Kwotowo"><Banknote size={14}/></button>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-8 py-10">
                    <div className="space-y-4 max-w-[240px]">
                      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border-2 border-slate-100 focus-within:border-pink-500 transition-all shadow-sm">
                        <Target size={16} className="text-slate-300" />
                        <div className="flex-1">
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Sprzedaż (zł)</p>
                          <input 
                            type="number" 
                            value={b.pastry_daily_target} 
                            onChange={e => updateBudgetField(b.location_id, 'pastry_daily_target', e.target.value)}
                            className="w-full bg-transparent border-none font-black text-lg text-slate-800 focus:ring-0 p-0 outline-none" 
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 bg-pink-50/50 p-3 rounded-2xl border-2 border-pink-100/50 focus-within:border-pink-500 transition-all">
                        <TrendingDown size={16} className="text-pink-400" />
                        <div className="flex-1">
                          <p className="text-[8px] font-black text-pink-500/60 uppercase tracking-widest mb-0.5">Cel Strat ({b.pastry_loss_type === 'percent' ? '%' : 'zł'})</p>
                          <input 
                            type="number" 
                            value={b.pastry_loss_target} 
                            onChange={e => updateBudgetField(b.location_id, 'pastry_loss_target', e.target.value)}
                            className="w-full bg-transparent border-none font-black text-lg text-pink-700 focus:ring-0 p-0 outline-none" 
                          />
                        </div>
                        <div className="flex bg-white rounded-xl p-1 shadow-sm border border-pink-100">
                           <button onClick={() => updateBudgetField(b.location_id, 'pastry_loss_type', 'percent')} className={`p-1.5 rounded-lg transition-all ${b.pastry_loss_type === 'percent' ? 'bg-pink-500 text-white shadow-md' : 'text-slate-300 hover:text-slate-500'}`} title="Procentowo"><Percent size={14}/></button>
                           <button onClick={() => updateBudgetField(b.location_id, 'pastry_loss_type', 'amount')} className={`p-1.5 rounded-lg transition-all ${b.pastry_loss_type === 'amount' ? 'bg-pink-500 text-white shadow-md' : 'text-slate-300 hover:text-slate-500'}`} title="Kwotowo"><Banknote size={14}/></button>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {budgets.length === 0 && (
            <div className="py-32 flex flex-col items-center text-slate-300 gap-4">
               <Target size={64} className="opacity-20" />
               <p className="text-xs font-black uppercase tracking-[0.2em]">Brak punktów do budżetowania</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBudgets;
