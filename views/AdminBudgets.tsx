
import React, { useState } from 'react';
import { LOCATIONS, MONTHS } from '../constants';
import { Save, Percent, Banknote, Target, TrendingDown } from 'lucide-react';
import { LossTargetType } from '../types';

const AdminBudgets: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('Styczeń');
  const [budgets, setBudgets] = useState(LOCATIONS.map(loc => ({
    id: loc.id,
    locationName: loc.name,
    bakeryLossType: 'percent' as LossTargetType,
    pastryLossType: 'percent' as LossTargetType,
    bakeryTarget: 4500,
    pastryTarget: 3200,
    bakeryLoss: 5,
    pastryLoss: 5,
  })));

  const toggleType = (id: string, field: 'bakery' | 'pastry') => {
    setBudgets(prev => prev.map(b => {
      if (b.id === id) {
        const key = field === 'bakery' ? 'bakeryLossType' : 'pastryLossType';
        return { ...b, [key]: b[key] === 'percent' ? 'amount' : 'percent' };
      }
      return b;
    }));
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Budżetowanie</h1>
          <p className="text-base text-slate-500 font-medium">Cele sprzedażowe i limity strat.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="pl-4 pr-10 py-2.5 bg-slate-50 border-none rounded-xl font-black text-sm text-slate-700 focus:ring-0 outline-none"
          >
            {MONTHS.map(m => <option key={m}>{m} 2026</option>)}
          </select>
          <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-sm hover:bg-amber-600 transition-all shadow-xl active:scale-95">
            <Save size={18} /> ZAPISZ
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-8 py-6 font-black uppercase text-[10px] tracking-widest opacity-50">Punkt</th>
                <th className="px-6 py-6 font-black uppercase text-[10px] tracking-widest text-amber-400">Piekarnia (Cel / Strata)</th>
                <th className="px-6 py-6 font-black uppercase text-[10px] tracking-widest text-emerald-400">Cukiernia (Cel / Strata)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budgets.map(b => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-8">
                    <span className="text-lg font-black text-slate-800 tracking-tight">{b.locationName}</span>
                  </td>
                  
                  {/* Piekarnia Cell */}
                  <td className="px-6 py-8">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                        <Target size={14} className="text-slate-400 ml-2" />
                        <input type="number" defaultValue={b.bakeryTarget} className="w-full bg-transparent border-none font-black text-sm text-slate-700 focus:ring-0" />
                        <span className="text-[10px] font-black text-slate-300 pr-2">PLN</span>
                      </div>
                      <div className="flex items-center bg-amber-50 p-1 rounded-xl border border-amber-100">
                        <TrendingDown size={14} className="text-amber-400 ml-2" />
                        <input type="number" defaultValue={b.bakeryLoss} className="w-full bg-transparent border-none font-black text-sm text-amber-700 focus:ring-0 text-center" />
                        <div className="flex bg-white rounded-lg p-0.5 shadow-sm">
                           <button onClick={() => toggleType(b.id, 'bakery')} className={`p-1.5 rounded-md transition-all ${b.bakeryLossType === 'percent' ? 'bg-amber-500 text-white' : 'text-slate-300'}`}><Percent size={12}/></button>
                           <button onClick={() => toggleType(b.id, 'bakery')} className={`p-1.5 rounded-md transition-all ${b.bakeryLossType === 'amount' ? 'bg-amber-500 text-white' : 'text-slate-300'}`}><Banknote size={12}/></button>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Cukiernia Cell */}
                  <td className="px-6 py-8">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                        <Target size={14} className="text-slate-400 ml-2" />
                        <input type="number" defaultValue={b.pastryTarget} className="w-full bg-transparent border-none font-black text-sm text-slate-700 focus:ring-0" />
                        <span className="text-[10px] font-black text-slate-300 pr-2">PLN</span>
                      </div>
                      <div className="flex items-center bg-emerald-50 p-1 rounded-xl border border-emerald-100">
                        <TrendingDown size={14} className="text-emerald-400 ml-2" />
                        <input type="number" defaultValue={b.pastryLoss} className="w-full bg-transparent border-none font-black text-sm text-emerald-700 focus:ring-0 text-center" />
                        <div className="flex bg-white rounded-lg p-0.5 shadow-sm">
                           <button onClick={() => toggleType(b.id, 'pastry')} className={`p-1.5 rounded-md transition-all ${b.pastryLossType === 'percent' ? 'bg-emerald-500 text-white' : 'text-slate-300'}`}><Percent size={12}/></button>
                           <button onClick={() => toggleType(b.id, 'pastry')} className={`p-1.5 rounded-md transition-all ${b.pastryLossType === 'amount' ? 'bg-emerald-500 text-white' : 'text-slate-300'}`}><Banknote size={12}/></button>
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
