
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Download, Search, CheckCircle, 
  AlertTriangle, Edit2, Trash2, CalendarRange, 
  Globe, MapPin, X, Save, DollarSign, RefreshCw, Filter
} from 'lucide-react';
import { LOCATIONS } from '../constants';
import { supabase } from '../supabase';

const AdminReports: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewScope, setViewScope] = useState<'global' | string>('global');
  const [editModal, setEditModal] = useState<any | null>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('daily_reports')
        .select(`*`) // Usunięto profiles(email)
        .eq('date', selectedDate);

      if (viewScope !== 'global') {
        query = query.eq('location_id', viewScope);
      }

      const { data, error } = await query;

      if (error) throw error;

      const enrichedData = data.map(report => ({
        ...report,
        location_name: LOCATIONS.find(l => l.id === report.location_id)?.name || 'Nieznany',
        user_email: 'Pracownik #' + report.user_id.substring(0, 5) // Fallback zamiast e-maila
      }));

      setReports(enrichedData);
    } catch (err: any) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [selectedDate, viewScope]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('daily_reports')
        .update({
          bakery_sales: editModal.bakery_sales,
          bakery_loss: editModal.bakery_loss,
          pastry_sales: editModal.pastry_sales,
          pastry_loss: editModal.pastry_loss,
          verified: true
        })
        .eq('id', editModal.id);

      if (error) throw error;

      setReports(prev => prev.map(r => r.id === editModal.id ? { ...editModal, verified: true } : r));
      setEditModal(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten raport?')) return;
    try {
      const { error } = await supabase.from('daily_reports').delete().eq('id', id);
      if (error) throw error;
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {editModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <form onSubmit={handleUpdate} className="p-10 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Korekta danych</h3>
                  <p className="text-2xl font-black text-slate-900">{editModal.location_name} &middot; {editModal.date}</p>
                </div>
                <button type="button" onClick={() => setEditModal(null)} className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-all"><X size={24}/></button>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4 p-6 bg-amber-50/50 rounded-3xl border border-amber-100">
                   <p className="text-xs font-black text-amber-700 uppercase tracking-widest flex items-center gap-2">🍞 Piekarnia</p>
                   <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Sprzedaż</label>
                        <input type="number" step="0.01" value={editModal.bakery_sales} onChange={e => setEditModal({...editModal, bakery_sales: parseFloat(e.target.value)})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:border-amber-500 outline-none" />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Strata</label>
                        <input type="number" step="0.01" value={editModal.bakery_loss} onChange={e => setEditModal({...editModal, bakery_loss: parseFloat(e.target.value)})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:border-amber-500 outline-none" />
                      </div>
                   </div>
                </div>

                <div className="space-y-4 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                   <p className="text-xs font-black text-indigo-700 uppercase tracking-widest flex items-center gap-2">🍰 Cukiernia</p>
                   <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Sprzedaż</label>
                        <input type="number" step="0.01" value={editModal.pastry_sales} onChange={e => setEditModal({...editModal, pastry_sales: parseFloat(e.target.value)})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:border-indigo-500 outline-none" />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Strata</label>
                        <input type="number" step="0.01" value={editModal.pastry_loss} onChange={e => setEditModal({...editModal, pastry_loss: parseFloat(e.target.value)})} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:border-indigo-500 outline-none" />
                      </div>
                   </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button type="submit" className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl">
                   Zatwierdź zmiany
                </button>
                <button type="button" onClick={() => setEditModal(null)} className="px-8 py-5 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Anuluj</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${viewScope === 'global' ? 'bg-slate-900 text-white' : 'bg-amber-100 text-amber-700'}`}>
              {viewScope === 'global' ? <Globe size={28}/> : <MapPin size={28}/>}
           </div>
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Dziennik raportów</p>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {viewScope === 'global' ? 'Pełne zestawienie sieci' : LOCATIONS.find(l => l.id === viewScope)?.name}
              </h2>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
           <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
             <Filter size={16} className="ml-3 text-slate-400" />
             <select value={viewScope} onChange={e => setViewScope(e.target.value)} className="bg-transparent border-none font-black text-[10px] text-slate-700 focus:ring-0 outline-none uppercase tracking-widest cursor-pointer pr-8">
               <option value="global">Wszystkie punkty</option>
               {LOCATIONS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
             </select>
           </div>
           <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20"/>
           <button onClick={fetchReports} className="p-3.5 bg-slate-900 text-white hover:bg-amber-600 rounded-2xl transition-all shadow-lg active:scale-95">
             <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px] relative">
        {loading ? (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-4">
               <div className="w-12 h-12 border-4 border-slate-100 border-t-amber-500 rounded-full animate-spin"></div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pobieranie danych...</p>
            </div>
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest opacity-50">Lokalizacja</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest opacity-50">Piekarnia (S/L)</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest opacity-50">Cukiernia (S/L)</th>
                <th className="px-6 py-6 text-[10px] font-black uppercase tracking-widest opacity-50">Suma Dnia</th>
                <th className="px-6 py-6 text-center text-[10px] font-black uppercase tracking-widest opacity-50">Weryfikacja</th>
                <th className="px-8 py-6 text-right text-[10px] font-black uppercase tracking-widest opacity-50">Opcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map(report => (
                <tr key={report.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-7">
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{report.location_name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{report.user_email}</p>
                  </td>
                  <td className="px-6 py-7">
                    <div className="flex flex-col">
                       <span className="text-sm font-black text-slate-900">{report.bakery_sales.toLocaleString(undefined, { minimumFractionDigits: 2 })} zł</span>
                       <span className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter">Strata: {report.bakery_loss.toFixed(2)} zł</span>
                    </div>
                  </td>
                  <td className="px-6 py-7">
                    <div className="flex flex-col">
                       <span className="text-sm font-black text-slate-900">{report.pastry_sales.toLocaleString(undefined, { minimumFractionDigits: 2 })} zł</span>
                       <span className="text-[10px] font-bold text-rose-500 uppercase tracking-tighter">Strata: {report.pastry_loss.toFixed(2)} zł</span>
                    </div>
                  </td>
                  <td className="px-6 py-7">
                     <span className="text-base font-black text-emerald-600">{(report.bakery_sales + report.pastry_sales).toLocaleString(undefined, { minimumFractionDigits: 2 })} zł</span>
                  </td>
                  <td className="px-6 py-7 text-center">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      report.verified ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {report.verified ? <CheckCircle size={12}/> : <div className="w-2 h-2 bg-amber-500 rounded-full"></div>}
                      {report.verified ? 'Zweryfikowano' : 'Oczekuje'}
                    </div>
                  </td>
                  <td className="px-8 py-7 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button onClick={() => setEditModal(report)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-amber-600 rounded-xl transition-all shadow-sm"><Edit2 size={16}/></button>
                      <button onClick={() => handleDelete(report.id)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 rounded-xl transition-all shadow-sm"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reports.length === 0 && !loading && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-300">
               <AlertTriangle size={48} className="mb-4" />
               <p className="text-xs font-black uppercase tracking-widest">Brak raportów</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
