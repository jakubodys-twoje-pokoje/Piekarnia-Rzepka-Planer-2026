
import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, Store, Loader2, X, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../supabase';

const AdminLocations: React.FC = () => {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('locations').select('*').order('name');
      if (error) throw error;
      setLocations(data || []);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Błąd bazy: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (modal.id) {
        await supabase.from('locations').update({ name: modal.name, address: modal.address }).eq('id', modal.id);
      } else {
        await supabase.from('locations').insert({ name: modal.name, address: modal.address });
      }
      setModal(null);
      load();
    } catch (err: any) {
      alert("Błąd zapisu: " + err.message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Usunąć ten punkt? Spowoduje to usunięcie wszystkich powiązanych raportów!')) return;
    try {
      const { error } = await supabase.from('locations').delete().eq('id', id);
      if (error) throw error;
      load();
    } catch (err: any) {
      alert("Błąd usuwania: " + err.message);
    }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-amber-500" size={40} /></div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Punkty Sprzedaży</h1>
          <p className="text-slate-500 font-medium">Zarządzaj siecią lokalizacji Rzepka.</p>
        </div>
        <button onClick={() => setModal({ name: '', address: '' })} className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl">
          <Plus size={16} /> Dodaj Punkt
        </button>
      </div>

      {error && (
        <div className="p-6 bg-rose-50 border border-rose-100 rounded-[2rem] flex items-center gap-4 text-rose-600 font-bold">
          <AlertCircle size={24} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map(loc => (
          <div key={loc.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:border-amber-500 transition-all group relative">
            <div className="flex justify-between mb-6">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-inner"><Store size={28}/></div>
              <div className="flex gap-2">
                <button onClick={() => setModal(loc)} className="p-2.5 text-slate-400 hover:text-amber-600 bg-slate-50 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 transition-all shadow-sm"><Edit2 size={16}/></button>
                <button onClick={() => remove(loc.id)} className="p-2.5 text-slate-400 hover:text-rose-600 bg-slate-50 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 transition-all shadow-sm"><Trash2 size={16}/></button>
              </div>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">{loc.name}</h3>
            <p className="text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-widest"><MapPin size={14} className="text-amber-500"/> {loc.address}</p>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <form onSubmit={save} className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{modal.id ? 'Edytuj Punkt' : 'Nowy Punkt'}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ustawienia lokalizacji</p>
              </div>
              <button type="button" onClick={() => setModal(null)} className="p-3 hover:bg-slate-50 rounded-full transition-colors"><X/></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nazwa</label>
                <input placeholder="np. JĘDRZYCHÓW" value={modal.name} onChange={e => setModal({...modal, name: e.target.value.toUpperCase()})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-lg focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adres</label>
                <input placeholder="np. ul. Diamentowa 2" value={modal.address} onChange={e => setModal({...modal, address: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none" required />
              </div>
            </div>
            <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-amber-600 transition-all shadow-xl flex items-center justify-center gap-2">
              <Save size={18}/> ZAPISZ PUNKT RZEPKA
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
export default AdminLocations;
