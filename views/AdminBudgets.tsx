
import React, { useState, useEffect } from 'react';
import { LOCATIONS, MONTHS } from '../constants';
import { Save, Percent, Banknote, Target, TrendingDown, Loader2 } from 'lucide-react';
import { LossTargetType } from '../types';
import { supabase } from '../supabase';

const AdminBudgets: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [budgets, setBudgets] = useState<any[]>([]);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('targets')
        .select('*')
        .eq('month', selectedMonth + 1)
        .eq('year', selectedYear);

      if (error) throw error;

      const merged = LOCATIONS.map(loc => {
        const existing = data.find(d => d.location_id === loc.id);
        return existing || {
          location_id: loc.id,
          locationName: loc.name,
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

  useEffect(() => { fetchBudgets(); }, [selectedMonth, selectedYear]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payloads = budgets.map(b => ({
        location_id: b.location_id,
        month: b.month,
        year: b.year,
        bakery_daily_target: b.bakery_daily_target,
        bakery_loss_target: b.bakery_loss_target,
        bakery_loss_type: b.bakery_loss_type,
        pastry_daily_target: b.pastry_daily_target,
        pastry_loss_target: b.pastry_loss_target,
        pastry_loss_type: b.pastry_loss_type
      }));

      const { error } = await supabase
        .from('targets')
        .upsert(payloads, { onConflict: 'location_id,month,year' });

      if (error) throw error;
      alert('Budżety zapisane pomyślnie!');
    } catch (err) {
      console.error(err);
      alert('Błąd podczas zapisu budżetów.');
    } finally {
      setSaving(false);
    }
  };

  const updateBudget = (locId: string, field: string, value: any) => {
    setBudgets(prev => prev.map(b => b.location_id === locId ? { ...b, [field]: value } : b));
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 size={48} className="animate-spin text-amber-500" />
      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Pobieranie planów...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Budżetowanie</h1>
          <p className="text-base text-slate-500 font-medium">Zarządzanie celami na wybrany miesiąc.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="pl-4 pr-10 py-2.5 bg-slate-50 border-none rounded-xl font-black text-sm text-slate-700 outline-none"
          >
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-amber-600 transition-all shadow-xl disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            ZAPISZ PLANY
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                <th className="px-8 py-6 opacity-50">Punkt</th>
                <th className="px-6 py-6 text-amber-400">Piekarnia (Cel / Strata)</th>
                <th className="px-6 py-6 text-emerald-400">Cukiernia (Cel / Strata)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budgets.map(b => (
                <tr key={b.location_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-8">
                    <span className="text-lg font-black text-slate-800 tracking-tight">
                      {LOCATIONS.find(l => l.id === b.location_id)?.name}
                    </span>
                  </td>
                  
                  <td className="px-6 py-8">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                        <Target size={14} className="text-slate-400 ml-2" />
                        <input 
                          type="number" 
                          value={b.bakery_daily_target} 
                          onChange={e => updateBudget(b.location_id, 'bakery_daily_target', parseFloat(e.target.value))}
                          className="w-full bg-transparent border-none font-black text-sm text-slate-700 focus:ring-0 outline-none" 
                        />
                      </div>
                      <div className="flex items-center bg-amber-50 p-1 rounded-xl border border-amber-100">
                        <TrendingDown size={14} className="text-amber-400 ml-2" />
                        <input 
                          type="number" 
                          value={b.bakery_loss_target} 
                          onChange={e => updateBudget(b.location_id, 'bakery_loss_target', parseFloat(e.target.value))}
                          className="w-full bg-transparent border-none font-black text-sm text-amber-700 focus:ring-0 text-center outline-none" 
                        />
                        <div className="flex bg-white rounded-lg p-0.5">
                           <button onClick={() => updateBudget(b.location_id, 'bakery_loss_type', 'percent')} className={`p-1.5 rounded-md ${b.bakery_loss_type === 'percent' ? 'bg-amber-500 text-white' : 'text-slate-300'}`}><Percent size={12}/></button>
                           <button onClick={() => updateBudget(b.location_id, 'bakery_loss_type', 'amount')} className={`p-1.5 rounded-md ${b.bakery_loss_type === 'amount' ? 'bg-amber-500 text-white' : 'text-slate-300'}`}><Banknote size={12}/></button>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-8">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                        <Target size={14} className="text-slate-400 ml-2" />
                        <input 
                          type="number" 
                          value={b.pastry_daily_target} 
                          onChange={e => updateBudget(b.location_id, 'pastry_daily_target', parseFloat(e.target.value))}
                          className="w-full bg-transparent border-none font-black text-sm text-slate-700 focus:ring-0 outline-none" 
                        />
                      </div>
                      <div className="flex items-center bg-emerald-50 p-1 rounded-xl border border-emerald-100">
                        <TrendingDown size={14} className="text-emerald-400 ml-2" />
                        <input 
                          type="number" 
                          value={b.pastry_loss_target} 
                          onChange={e => updateBudget(b.location_id, 'pastry_loss_target', parseFloat(e.target.value))}
                          className="w-full bg-transparent border-none font-black text-sm text-emerald-700 focus:ring-0 text-center outline-none" 
                        />
                        <div className="flex bg-white rounded-lg p-0.5">
                           <button onClick={() => updateBudget(b.location_id, 'pastry_loss_type', 'percent')} className={`p-1.5 rounded-md ${b.pastry_loss_type === 'percent' ? 'bg-emerald-500 text-white' : 'text-slate-300'}`}><Percent size={12}/></button>
                           <button onClick={() => updateBudget(b.location_id, 'pastry_loss_type', 'amount')} className={`p-1.5 rounded-md ${b.pastry_loss_type === 'amount' ? 'bg-emerald-500 text-white' : 'text-slate-300'}`}><Banknote size={12}/></button>
                        </div>
                      </div>
                    </div>
                  </td>
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
