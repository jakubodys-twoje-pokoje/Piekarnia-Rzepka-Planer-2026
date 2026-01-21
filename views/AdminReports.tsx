
import React, { useState } from 'react';
import { 
  Calendar, Download, Search, CheckCircle, 
  AlertTriangle, Edit2, Trash2, CalendarRange, 
  Globe, MapPin, X, Save, DollarSign
} from 'lucide-react';
import { LOCATIONS } from '../constants';

const AdminReports: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewScope, setViewScope] = useState<'global' | string>('global');
  const [editModal, setEditModal] = useState<any | null>(null);

  // Mock data representing database entries
  const [reports, setReports] = useState([
    { id: '1', location_id: '1', point: 'JĘDRZYCHÓW', user: 'jan.kowalski@rzepka.pl', bakerySales: 1200.50, bakeryLoss: 60.00, pastrySales: 850.00, pastryLoss: 40.00, verified: true, date: '2026-01-21' },
    { id: '2', location_id: '2', point: 'KUPIECKA', user: 'anna.nowak@rzepka.pl', bakerySales: 950.00, bakeryLoss: 32.00, pastrySales: 600.00, pastryLoss: 15.00, verified: true, date: '2026-01-21' },
    { id: '3', location_id: '4', point: 'FABRYCZNA', user: 'marek.ptak@rzepka.pl', bakerySales: 2100.00, bakeryLoss: 105.00, pastrySales: 1100.00, pastryLoss: 50.00, verified: false, date: '2026-01-21' },
    { id: '4', location_id: '5', point: 'PODGÓRNA', user: 'ewa.lis@rzepka.pl', bakerySales: 1350.20, bakeryLoss: 45.00, pastrySales: 920.00, pastryLoss: 22.50, verified: true, date: '2026-01-21' },
  ]);

  const filteredReports = viewScope === 'global' 
    ? reports 
    : reports.filter(r => r.location_id === viewScope);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setReports(prev => prev.map(r => r.id === editModal.id ? editModal : r));
    setEditModal(null);
  };

  const totalSales = filteredReports.reduce((acc, curr) => acc + curr.bakerySales + curr.pastrySales, 0);
  const totalLoss = filteredReports.reduce((acc, curr) => acc + curr.bakeryLoss + curr.pastryLoss, 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <form onSubmit={handleUpdate} className="p-10 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Edycja Raportu</h3>
                  <p className="text-2xl font-black text-slate-900">{editModal.point} &middot; {editModal.date}</p>
                </div>
                <button type="button" onClick={() => setEditModal(null)} className="p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100"><X size={24}/></button>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* Bakery Section */}
                <div className="space-y-4 p-6 bg-amber-50 rounded-3xl border border-amber-100">
                   <p className="text-xs font-black text-amber-800 uppercase flex items-center gap-2">🍞 Piekarnia</p>
                   <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Sprzedaż</label>
                        <input 
                          type="number" step="0.01" 
                          value={editModal.bakerySales}
                          onChange={e => setEditModal({...editModal, bakerySales: parseFloat(e.target.value)})}
                          className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Strata</label>
                        <input 
                          type="number" step="0.01" 
                          value={editModal.bakeryLoss}
                          onChange={e => setEditModal({...editModal, bakeryLoss: parseFloat(e.target.value)})}
                          className="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        />
                      </div>
                   </div>
                </div>

                {/* Pastry Section */}
                <div className="space-y-4 p-6 bg-pink-50 rounded-3xl border border-pink-100">
                   <p className="text-xs font-black text-pink-800 uppercase flex items-center gap-2">🍰 Cukiernia</p>
                   <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Sprzedaż</label>
                        <input 
                          type="number" step="0.01" 
                          value={editModal.pastrySales}
                          onChange={e => setEditModal({...editModal, pastrySales: parseFloat(e.target.value)})}
                          className="w-full px-4 py-3 bg-white border border-pink-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Strata</label>
                        <input 
                          type="number" step="0.01" 
                          value={editModal.pastryLoss}
                          onChange={e => setEditModal({...editModal, pastryLoss: parseFloat(e.target.value)})}
                          className="w-full px-4 py-3 bg-white border border-pink-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                        />
                      </div>
                   </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button type="submit" className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-600 transition-all shadow-xl">
                   <Save size={18} /> Zapisz Zmiany
                </button>
                <button type="button" onClick={() => setEditModal(null)} className="px-10 py-5 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Anuluj</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <div className={`p-3 rounded-2xl ${viewScope === 'global' ? 'bg-slate-900 text-white' : 'bg-amber-100 text-amber-700'}`}>
              {viewScope === 'global' ? <Globe size={24}/> : <MapPin size={24}/>}
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zarządzanie Danymi</p>
              <h2 className="text-xl font-black text-slate-900">
                {viewScope === 'global' ? 'Cała Sieć' : LOCATIONS.find(l => l.id === viewScope)?.name}
              </h2>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
           <select 
             value={viewScope}
             onChange={e => setViewScope(e.target.value)}
             className="pl-4 pr-10 py-2.5 bg-slate-50 border-none font-black text-[10px] text-slate-700 focus:ring-0 outline-none uppercase tracking-widest cursor-pointer rounded-xl"
           >
             <option value="global">🌍 WSZYSTKIE PUNKTY</option>
             {LOCATIONS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
           </select>

           <div className="relative">
             <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="pl-9 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-[10px] font-black text-slate-700 outline-none focus:ring-0 shadow-sm"/>
           </div>

           <button className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl">
             <Download size={14} /> Eksport XLS
           </button>
        </div>
      </div>

      {/* Mini Aggregates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
         <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><DollarSign size={20}/></div>
            <div>
               <p className="text-[9px] font-black text-slate-400 uppercase">Suma Sprzedaży</p>
               <p className="text-lg font-black text-slate-900">{totalSales.toLocaleString()} zł</p>
            </div>
         </div>
         <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center"><AlertTriangle size={20}/></div>
            <div>
               <p className="text-[9px] font-black text-slate-400 uppercase">Suma Strat</p>
               <p className="text-lg font-black text-slate-900">{totalLoss.toLocaleString()} zł</p>
            </div>
         </div>
         <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 lg:col-span-2">
            <div className="flex -space-x-3 overflow-hidden ml-2">
               {[1,2,3,4,5].map(i => <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-200"></div>)}
               <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-amber-500 text-[10px] font-black text-white">+2</div>
            </div>
            <div className="ml-2">
               <p className="text-[9px] font-black text-slate-400 uppercase">Aktywni Pracownicy</p>
               <p className="text-sm font-bold text-slate-700">7 Raportów oczekiwanych dzisiaj</p>
            </div>
         </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <CalendarRange size={16} className="text-amber-500" />
            Wykaz Dzienny: <span className="text-slate-900">{selectedDate}</span>
          </span>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
            <input type="text" placeholder="Szukaj maila..." className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-700 outline-none w-64 shadow-sm" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-50">Lokalizacja / Autor</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest opacity-50">Piekarnia (S / L)</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest opacity-50">Cukiernia (S / L)</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest opacity-50">Suma Dnia</th>
                <th className="px-6 py-6 text-center text-[10px] font-black uppercase tracking-widest opacity-50">Weryfikacja</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest opacity-50">Opcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.map(report => (
                <tr key={report.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-slate-800 tracking-tight">{report.point}</p>
                    <p className="text-[10px] font-bold text-slate-400">{report.user}</p>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                       <span className="text-xs font-black text-slate-900">{report.bakerySales.toLocaleString()} zł</span>
                       <span className="text-[10px] font-bold text-rose-500">{report.bakeryLoss.toLocaleString()} zł loss</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                       <span className="text-xs font-black text-slate-900">{report.pastrySales.toLocaleString()} zł</span>
                       <span className="text-[10px] font-bold text-rose-500">{report.pastryLoss.toLocaleString()} zł loss</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                       <span className="text-xs font-black text-emerald-600">{(report.bakerySales + report.pastrySales).toLocaleString()} zł</span>
                       <span className="text-[10px] font-bold text-slate-400">Total</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                      report.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {report.verified ? <CheckCircle size={10}/> : <AlertTriangle size={10}/>}
                      {report.verified ? 'Zweryfikowano' : 'Oczekuje'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditModal(report)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-amber-600 rounded-xl shadow-sm transition-all"><Edit2 size={16}/></button>
                      <button className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 rounded-xl shadow-sm transition-all"><Trash2 size={16}/></button>
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
