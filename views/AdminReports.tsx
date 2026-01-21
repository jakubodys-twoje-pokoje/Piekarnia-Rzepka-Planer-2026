
import React, { useState } from 'react';
import { Calendar, Download, Filter, Search, CheckCircle, AlertTriangle, Edit2, Trash2 } from 'lucide-react';
import { LOCATIONS } from '../constants';

const AdminReports: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Mock reporting data
  const reports = [
    { id: '1', point: 'JĘDRZYCHÓW', user: 'Jan Kowalski', bakerySales: 1200.00, bakeryLoss: 60.00, pastrySales: 850.00, pastryLoss: 40.00, verified: true },
    { id: '2', point: 'KUPIECKA', user: 'Anna Nowak', bakerySales: 0.00, bakeryLoss: 0.00, pastrySales: 0.00, pastryLoss: 0.00, verified: false },
    { id: '3', point: 'NIEPODLEGŁOŚCI', user: 'System', bakerySales: 1450.00, bakeryLoss: 12.00, pastrySales: 700.00, pastryLoss: 10.00, verified: true },
    { id: '4', point: 'FABRYCZNA', user: 'Marek Ptak', bakerySales: 2100.50, bakeryLoss: 105.00, pastrySales: 1100.00, pastryLoss: 50.00, verified: true },
    { id: '5', point: 'PODGÓRNA', user: 'Braki', bakerySales: 0.00, bakeryLoss: 0.00, pastrySales: 0.00, pastryLoss: 0.00, verified: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Podgląd Raportów Dziennych</h1>
          <p className="text-slate-500">Weryfikuj i edytuj dane wprowadzone przez pracowników.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <button className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-200 transition-all">
            <Download size={18} />
            Eksportuj CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-700 uppercase">Łączna Sprzedaż</p>
            <p className="text-xl font-bold text-emerald-900">4,750.50 zł</p>
          </div>
          <CheckCircle className="text-emerald-500" size={24} />
        </div>
        <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-rose-700 uppercase">Łączna Strata</p>
            <p className="text-xl font-bold text-rose-900">177.00 zł</p>
          </div>
          <AlertTriangle className="text-rose-500" size={24} />
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase">Status Punktów</p>
            <p className="text-xl font-bold text-amber-900">3 / 7 Wprowadzone</p>
          </div>
          <Filter className="text-amber-500" size={24} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Punkt</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Pracownik</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Piekarnia (S/L)</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Cukiernia (S/L)</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((report) => (
                <tr key={report.id} className={`hover:bg-slate-50/80 transition-colors ${!report.verified ? 'bg-rose-50/20' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-slate-800">{report.point}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-500">{report.user}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-bold">
                      <span className="text-emerald-600">{report.bakerySales} zł</span>
                      <span className="text-slate-300 mx-2">/</span>
                      <span className="text-rose-600">{report.bakeryLoss} zł</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="text-sm font-bold">
                      <span className="text-emerald-600">{report.pastrySales} zł</span>
                      <span className="text-slate-300 mx-2">/</span>
                      <span className="text-rose-600">{report.pastryLoss} zł</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {report.verified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                        <CheckCircle size={10} /> OK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full uppercase animate-pulse">
                        <AlertTriangle size={10} /> Brak danych
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-slate-100">
                        <Trash2 size={16} />
                      </button>
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

export default AdminReports;
