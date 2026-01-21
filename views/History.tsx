
import React from 'react';
import { UserProfile } from '../types';
import { LOCATIONS } from '../constants';
import { Calendar, ArrowRight } from 'lucide-react';

interface HistoryProps {
  user: UserProfile;
}

const HistoryView: React.FC<HistoryProps> = ({ user }) => {
  // Mock data for history
  const history = [
    { id: '1', date: '2026-01-20', bakerySales: 1200.00, bakeryLoss: 60.00, pastrySales: 850.00, pastryLoss: 40.00 },
    { id: '2', date: '2026-01-19', bakerySales: 1150.50, bakeryLoss: 45.00, pastrySales: 790.00, pastryLoss: 35.00 },
    { id: '3', date: '2026-01-18', bakerySales: 1300.00, bakeryLoss: 70.00, pastrySales: 920.00, pastryLoss: 55.00 },
    { id: '4', date: '2026-01-17', bakerySales: 1050.00, bakeryLoss: 30.00, pastrySales: 650.00, pastryLoss: 25.00 },
    { id: '5', date: '2026-01-16', bakerySales: 1400.00, bakeryLoss: 85.00, pastrySales: 1100.00, pastryLoss: 60.00 },
    { id: '6', date: '2026-01-15', bakerySales: 1100.00, bakeryLoss: 50.00, pastrySales: 800.00, pastryLoss: 45.00 },
    { id: '7', date: '2026-01-14', bakerySales: 1250.00, bakeryLoss: 65.00, pastrySales: 870.00, pastryLoss: 40.00 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Historia Wpisów</h1>
          <p className="text-slate-500">Ostatnie 7 raportów dla punktu {LOCATIONS.find(l => l.id === user.default_location_id)?.name}.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Piekarnia - Sprzedaż</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Piekarnia - Strata</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cukiernia - Sprzedaż</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cukiernia - Strata</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                        <Calendar size={16} />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{row.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-emerald-600">{row.bakerySales.toLocaleString()} zł</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-rose-600">{row.bakeryLoss.toLocaleString()} zł</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-emerald-600">{row.pastrySales.toLocaleString()} zł</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-rose-600">{row.pastryLoss.toLocaleString()} zł</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="text-slate-400 hover:text-amber-600 transition-colors">
                      <ArrowRight size={18} />
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

export default HistoryView;
