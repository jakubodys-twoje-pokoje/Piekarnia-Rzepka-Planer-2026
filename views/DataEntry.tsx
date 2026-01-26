
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Save, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
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
  const [msg, setMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('locations').select('id, name').eq('status', 'aktywny');
      if (data) {
        setLocations(data);
        if (!formData.locationId && data.length > 0) {
          setFormData(f => ({ ...f, locationId: data[0].id }));
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    try {
      const { error } = await supabase.from('daily_reports').insert({
        date: formData.date,
        location_id: formData.locationId,
        user_id: user.id,
        bakery_sales: parseFloat(formData.bakerySales) || 0,
        bakery_loss: parseFloat(formData.bakeryLoss) || 0,
        pastry_sales: parseFloat(formData.pastrySales) || 0,
        pastry_loss: parseFloat(formData.pastryLoss) || 0
      });
      if (error) throw error;
      setStatus('success');
      setFormData(f => ({ ...f, bakerySales: '', bakeryLoss: '', pastrySales: '', pastryLoss: '' }));
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) {
      setStatus('error');
      setMsg(err.message);
    }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-amber-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Nowy Raport</h1>
        <p className="text-slate-500 font-medium">Uzupełnij dzisiejsze wyniki sprzedaży.</p>
      </div>

      <form onSubmit={save} className="space-y-6">
        {status === 'error' && <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl font-bold flex gap-3 items-center"><AlertCircle size={18}/> {msg}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</label>
            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border rounded-xl font-bold" required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Punkt</label>
            <select value={formData.locationId} onChange={e => setFormData({...formData, locationId: e.target.value})} className="w-full px-5 py-3 bg-slate-50 border rounded-xl font-bold" disabled={user.role !== 'admin'}>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2"><span>🍞</span> Piekarnia</h3>
            <input type="number" step="0.01" placeholder="Sprzedaż (zł)" value={formData.bakerySales} onChange={e => setFormData({...formData, bakerySales: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xl font-black outline-none focus:border-amber-500" required />
            <input type="number" step="0.01" placeholder="Strata (zł)" value={formData.bakeryLoss} onChange={e => setFormData({...formData, bakeryLoss: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xl font-black text-rose-500 outline-none focus:border-rose-500" required />
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2"><span>🍰</span> Cukiernia</h3>
            <input type="number" step="0.01" placeholder="Sprzedaż (zł)" value={formData.pastrySales} onChange={e => setFormData({...formData, pastrySales: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xl font-black outline-none focus:border-amber-500" required />
            <input type="number" step="0.01" placeholder="Strata (zł)" value={formData.pastryLoss} onChange={e => setFormData({...formData, pastryLoss: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xl font-black text-rose-500 outline-none focus:border-rose-500" required />
          </div>
        </div>

        <button type="submit" disabled={status === 'saving'} className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-3">
          {status === 'saving' ? <Loader2 className="animate-spin"/> : (status === 'success' ? <CheckCircle2 className="text-emerald-400"/> : <Save/>)}
          {status === 'saving' ? 'PRZETWARZANIE...' : 'ZAPISZ RAPORT DZIENNY'}
        </button>
      </form>
    </div>
  );
};
export default DataEntry;
