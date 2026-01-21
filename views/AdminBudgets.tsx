
import React, { useState } from 'react';
import { LOCATIONS, MONTHS } from '../constants';
import { Save, Plus, Trash2, Edit2, Target } from 'lucide-react';

const AdminBudgets: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('Styczeń');
  
  // Mock data for budgets
  const [budgets, setBudgets] = useState(LOCATIONS.map(loc => ({
    id: loc.id,
    locationName: loc.name,
    bakeryDaily: 5909.09,
    bakeryMonthly: 130000.00,
    pastryDaily: 8181.82,
    pastryMonthly: 180000.00,
  })));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Menadżer Budżetów</h1>
          <p className="text-slate-500">Zarządzaj celami sprzedażowymi dla wszystkich punktów.</p>
        </div>
        <div className="flex items-center gap-3">
           <select 
             value={selectedMonth}
             onChange={(e) => setSelectedMonth(e.target.value)}
             className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20"
           >
             {MONTHS.map(m => <option key={m}>{m} 2026</option>)}
           </select>
           <button className="flex items-center gap-2 bg-amber-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20">
             <Save size={18} />
             Zapisz Zmiany
           </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th rowSpan={2} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Punkt Sprzedaży</th>
                <th colSpan={2} className="px-6 py-4 text-center text-xs font-bold text-amber-700 uppercase tracking-wider border-l border-slate-200 bg-amber-50/30">Piekarnia (Cel)</th>
                <th colSpan={2} className="px-6 py-4 text-center text-xs font-bold text-emerald-700 uppercase tracking-wider border-l border-slate-200 bg-emerald-50/30">Cukiernia (Cel)</th>
                <th rowSpan={2} className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Akcje</th>
              </tr>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-2 text-center text-[10px] font-bold text-slate-400 uppercase border-l border-slate-200">Dzienny</th>
                <th className="px-6 py-2 text-center text-[10px] font-bold text-slate-400 uppercase border-l border-slate-100">Miesięczny</th>
                <th className="px-6 py-2 text-center text-[10px] font-bold text-slate-400 uppercase border-l border-slate-200">Dzienny</th>
                <th className="px-6 py-2 text-center text-[10px] font-bold text-slate-400 uppercase border-l border-slate-100">Miesięczny</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budgets.map((budget) => (
                <tr key={budget.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-slate-800">{budget.locationName}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap border-l border-slate-100">
                    <input 
                      type="number" 
                      className="w-24 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-amber-500/20"
                      defaultValue={budget.bakeryDaily}
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap border-l border-slate-100">
                    <input 
                      type="number" 
                      className="w-32 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-amber-500/20"
                      defaultValue={budget.bakeryMonthly}
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap border-l border-slate-100">
                    <input 
                      type="number" 
                      className="w-24 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-emerald-500/20"
                      defaultValue={budget.pastryDaily}
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap border-l border-slate-100">
                    <input 
                      type="number" 
                      className="w-32 px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-emerald-500/20"
                      defaultValue={budget.pastryMonthly}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="p-2 text-slate-400 hover:text-amber-600">
                      <Edit2 size={16} />
                    </button>
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
