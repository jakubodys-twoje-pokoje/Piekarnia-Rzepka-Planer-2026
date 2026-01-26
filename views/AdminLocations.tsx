
import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, Store, Loader2, X, Save } from 'lucide-react';
import { supabase } from '../supabase';

const AdminLocations: React.FC = () => {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('locations').select('*').order('name');
    if (data) setLocations(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modal.id) {
      await supabase.from('locations').update({ name: modal.name, address: modal.address }).eq('id', modal.id);
    } else {
      await supabase.from('locations').insert({ name: modal.name, address: modal.address });
    }
    setModal(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Usunąć ten punkt?')) return;
    await supabase.from('locations').delete().eq('id', id);
    load();
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-amber-500" /></div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Punkty Sprzedaży</h1>
          <p className="text-slate-500">Zarządzaj lokalizacjami w sieci Rzepka.</p>
        </div>
        <button onClick={() => setModal({ name: '', address: '' })} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl">
          <Plus size={16} /> Dodaj Punkt
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map(loc => (
          <div key={loc.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:border-amber-500 transition-all group">
            <div className="flex justify-between mb-6">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-amber-500 group-hover:text-white transition-all"><Store size={24}/></div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => setModal(loc)} className="p-2 text-slate-400 hover:text-amber-600 bg-slate-50 rounded-lg"><Edit2 size={16}/></button>
                <button onClick={() => remove(loc.id)} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 rounded-lg"><Trash2 size={16}/></button>
              </div>
            </div>
            <h3 className="text-xl font-black text-slate-800">{loc.name}</h3>
            <p className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase mt-1"><MapPin size={12} className="text-amber-500"/> {loc.address}</p>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <form onSubmit={save} className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{modal.id ? 'Edycja' : 'Nowy Punkt'}</h3>
              <button type="button" onClick={() => setModal(null)} className="p-2 hover:bg-slate-50 rounded-full"><X/></button>
            </div>
            <div className="space-y-4">
              <input placeholder="Nazwa punktu" value={modal.name} onChange={e => setModal({...modal, name: e.target.value.toUpperCase()})} className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold uppercase" required />
              <input placeholder="Adres" value={modal.address} onChange={e => setModal({...modal, address: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border rounded-2xl font-bold" required />
            </div>
            <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 flex items-center justify-center gap-2">
              <Save size={18}/> Zapisz lokalizację
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
export default AdminLocations;
