
import React, { useState } from 'react';
import { 
  Calendar, Download, Filter, Search, CheckCircle, 
  AlertTriangle, Edit2, Trash2, CalendarRange, ChevronDown, 
  TrendingUp, TrendingDown, ArrowRight
} from 'lucide-react';
import { LOCATIONS } from '../constants';

type ReportPeriod = 'day' | 'week' | 'month';

const AdminReports: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState<ReportPeriod>('day');
  const [isExporting, setIsExporting] = useState(false);

  // Dynamiczne nagłówki i dane w zależności od okresu
  const getPeriodLabel = () => {
    if (period === 'day') return 'Dzień: ' + selectedDate;
    if (period === 'week') return 'Tydzień: 19.01 - 25.01';
    return 'Miesiąc: Styczeń 2026';
  };

  // Mock reporting data - rozbudowany o sumy okresowe
  const reports = [
    { id: '1', point: 'JĘDRZYCHÓW', user: 'Jan Kowalski', bakerySales: period === 'day' ? 1200 : 8400, bakeryLoss: period === 'day' ? 60 : 420, pastrySales: period === 'day' ? 850 : 5950, pastryLoss: period === 'day' ? 40 : 280, verified: true },
    { id: '2', point: 'KUPIECKA', user: 'Anna Nowak', bakerySales: period === 'day' ? 950 : 6650, bakeryLoss: period === 'day' ? 32 : 224, pastrySales: period === 'day' ? 600 : 4200, pastryLoss: period === 'day' ? 15 : 105, verified: true },
    { id: '3', point: 'NIEPODLEGŁOŚCI', user: 'Piotr Brzask', bakerySales: period === 'day' ? 0 : 7200, bakeryLoss: period === 'day' ? 0 : 350, pastrySales: period === 'day' ? 0 : 5100, pastryLoss: period === 'day' ? 0 : 210, verified: period !== 'day' },
    { id: '4', point: 'FABRYCZNA', user: 'Marek Ptak', bakerySales: period === 'day' ? 2100 : 14700, bakeryLoss: period === 'day' ? 105 : 735, pastrySales: period === 'day' ? 1100 : 7700, pastryLoss: period === 'day' ? 50 : 350, verified: true },
  ];

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      alert(`Wygenerowano plik Excel (XLSX) dla okresu: ${period === 'day' ? 'dziennego' : period === 'week' ? 'tygodniowego' : 'miesięcznego'}.`);
      setIsExporting(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Analityka Zbiorcza</h1>
          <p className="text-sm text-slate-500 font-medium">Przegląd danych dla sieci Piekarnia Rzepka.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            {(['day', 'week', 'month'] as ReportPeriod[]).map((p) => (
              <button 
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest ${
                  period === p ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {p === 'day' ? 'Dzień' : p === 'week' ? 'Tydzień' : 'Miesiąc'}
              </button>
            ))}
          </div>

          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 shadow-sm"
            />
          </div>

          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 bg-amber-600 text-white px-5 py-2 rounded-xl text-xs font-black hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/10 active:scale-95 disabled:opacity-50"
          >
            <Download size={14} />
            {isExporting ? 'EKSPORTOWANIE...' : ' GENERUJ RAPORT'}
          </button>
        </div>
      </div>

      {/* Summary Cards based on period */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Obroty ({period})</p>
          <p className="text-xl font-black text-emerald-600 tracking-tight">
            {period === 'day' ? '5 571,00' : period === 'week' ? '38 997,00' : '167 130,00'} zł
          </p>
          <p className="text-[10px] font-bold text-emerald-500 mt-1 uppercase flex items-center gap-1">
            <TrendingUp size={10}/> +12% vs poprz.
          </p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Strata ({period})</p>
          <p className="text-xl font-black text-rose-600 tracking-tight">
             {period === 'day' ? '279,00' : period === 'week' ? '1 953,00' : '8 370,00'} zł
          </p>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Śr. 5.1% obrotu</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Lokalizacje</p>
          <p className="text-xl font-black text-indigo-600 tracking-tight">7 Punktów</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Wszystkie aktywne</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Lider Wyników</p>
          <p className="text-xl font-black text-amber-600 tracking-tight">FABRYCZNA</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Cel: 104.2%</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <CalendarRange size={14} />
            Wyniki zbiorcze za: <span className="text-slate-900">{getPeriodLabel()}</span>
          </span>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input type="text" placeholder="Szukaj punktu..." className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-700 outline-none w-48" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-60">Punkt</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-60">Piekarnia S/L</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-60">Cukiernia S/L</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-60">Wydajność</th>
                <th className="px-6 py-5 text-center text-[10px] font-black uppercase tracking-widest opacity-60">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest opacity-60">Detale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((report) => (
                <tr key={report.id} className={`hover:bg-slate-50/80 transition-colors group ${!report.verified ? 'bg-rose-50/10' : ''}`}>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-800 tracking-tight">{report.point}</span>
                      <span className="text-[10px] font-bold text-slate-400">{report.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-emerald-600">{report.bakerySales.toLocaleString()} zł</span>
                      <span className="text-[10px] font-bold text-rose-400">{report.bakeryLoss.toLocaleString()} zł straty</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-emerald-600">{report.pastrySales.toLocaleString()} zł</span>
                      <span className="text-[10px] font-bold text-rose-400">{report.pastryLoss.toLocaleString()} zł straty</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-black text-slate-800">92%</span>
                       <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full" style={{ width: '92%' }}></div>
                       </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    {report.verified ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md uppercase">OK</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md uppercase pulse-amber">BRAK</span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 text-slate-300 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100 rounded-xl">
                      <ArrowRight size={16} />
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

export default AdminReports;
