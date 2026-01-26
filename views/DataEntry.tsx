
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Save, AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '../supabase';

const DataEntry: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    locationId: user.default_location_id || '',
    bakerySales: '', bakeryLoss: '', pastrySales: '', pastryLoss: '',
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const loadLocations = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('locations').select('*').eq('status', 'aktywny');
    if (data && data.length > 0) {
      setLocations(data);
      if (!formData.locationId) {
        const defaultLoc = data.find(l => l.id === user.default_location_id) || data[0];
        setFormData(f => ({ ...f, locationId: defaultLoc.id }));
      }
    }
    setLoading(false);
  };

  useEffect(() => { loadLocations(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.locationId) {
      setStatus('error');
      setErrorMsg('Wybierz punkt sprzedaży.');
      return;
    }

    setStatus('saving');
    const { error } = await supabase.from('daily_reports').upsert({
      date: formData.date,
      location_id: formData.locationId,
      user_id: user.id,
      bakery_sales: Number(formData.bakerySales) || 0,
      bakery_loss: Number(formData.bakeryLoss) || 0,
      pastry_sales: Number(formData.pastrySales) || 0,
      pastry_loss: Number(formData.pastryLoss) || 0
    }, { onConflict: 'date,location_id' });

    if (error) {
      console.error(error);
      setStatus('error');
      setErrorMsg(error.message);
    } else {
      setStatus('success');
      setFormData(f => ({ ...f, bakerySales: '', bakeryLoss: '', pastrySales: '', pastryLoss: '' }));
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="animate-spin text-amber-500" size={40} />
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Wczytywanie lokalizacji...</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Nowy Raport</h1>
        <p className="text-slate-500 font-medium">Uzupełnij wyniki dla wybranego punktu.</p>
      </div>

      {status === 'error' && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      <form onSubmit={save} className="space-y-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Punkt Sprzedaży</label>
            <select 
              value={formData.locationId} 
              onChange={e => setFormData({...formData, locationId: e.target.value})} 
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-amber-500/20"
              disabled={user.role !== 'admin' && !!user.default_location_id}
            >
              {locations.length === 0 && <option value="">Brak punktów w bazie</option>}
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2"><span>🍞</span> Piekarnia</h3>
            <div className="space-y-4">
              <input type="number" step="0.01" placeholder="Sprzedaż (zł)" value={formData.bakerySales} onChange={e => setFormData({...formData, bakerySales: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-amber-500 rounded-2xl font-black text-2xl outline-none transition-all" required />
              <input type="number" step="0.01" placeholder="Strata (zł)" value={formData.bakeryLoss} onChange={e => setFormData({...formData, bakeryLoss: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl font-black text-2xl text-rose-500 outline-none transition-all" required />
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2"><span>🍰</span> Cukiernia</h3>
            <div className="space-y-4">
              <input type="number" step="0.01" placeholder="Sprzedaż (zł)" value={formData.pastrySales} onChange={e => setFormData({...formData, pastrySales: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-amber-500 rounded-2xl font-black text-2xl outline-none transition-all" required />
              <input type="number" step="0.01" placeholder="Strata (zł)" value={formData.pastryLoss} onChange={e => setFormData({...formData, pastryLoss: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl font-black text-2xl text-rose-500 outline-none transition-all" required />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={status === 'saving'} 
          className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
        >
          {status === 'saving' ? <Loader2 className="animate-spin" /> : (status === 'success' ? <CheckCircle2 className="text-emerald-400" /> : <Save />)}
          {status === 'saving' ? 'PRZETWARZANIE...' : (status === 'success' ? 'RAPORT ZAPISANY!' : 'ZAPISZ DANE DZIENNE')}
        </button>
      </form>
      
      {locations.length === 0 && (
        <button onClick={loadLocations} className="w-full flex items-center justify-center gap-2 text-xs font-black text-amber-600 uppercase tracking-widest hover:text-amber-700">
          <RefreshCw size={14} /> Odśwież listę punktów
        </button>
      )}
    </div>
  );
};
export default DataEntry;
