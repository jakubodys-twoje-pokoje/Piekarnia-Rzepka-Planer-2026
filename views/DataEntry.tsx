
import React, { useState, useEffect } from 'react';
import { UserProfile, Location } from '../types';
import { Save, AlertCircle, CheckCircle2, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';

interface DataEntryProps {
  user: UserProfile;
}

const DataEntry: React.FC<DataEntryProps> = ({ user }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loadingLocs, setLoadingLocs] = useState(true);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    locationId: user.default_location_id || '',
    bakerySales: '',
    bakeryLoss: '',
    pastrySales: '',
    pastryLoss: '',
  });

  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocs = async () => {
      const { data } = await supabase.from('locations').select('id, name').eq('status', 'aktywny');
      if (data) {
        setLocations(data);
        if (!formData.locationId && data.length > 0) {
          setFormData(prev => ({ ...prev, locationId: data[0].id }));
        }
      }
      setLoadingLocs(false);
    };
    fetchLocs();
  }, [user.default_location_id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
      setFormData(prev => ({ ...prev, bakerySales: '', bakeryLoss: '', pastrySales: '', pastryLoss: '' }));
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message);
    }
  };

  if (loadingLocs) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-amber-500" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Nowy Raport Dzienny</h1>
        <p className="text-slate-500 font-medium">Uzupełnij wyniki sprzedaży i strat dla Twojego punktu.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {status === 'error' && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-3">
            <AlertCircle size={18} /> {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data Raportu</label>
            <input 
              type="date" name="date" value={formData.date} onChange={handleInputChange}
              className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800" required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Punkt Sprzedaży</label>
            <select 
              name="locationId" value={formData.locationId} onChange={handleInputChange}
              className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
              disabled={user.role !== 'admin'}
            >
              {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
             <div className="flex items-center gap-3">
               <span className="text-2xl">🍞</span>
               <h3 className="font-black text-slate-800 uppercase tracking-tight">Piekarnia</h3>
             </div>
             <div className="space-y-4">
               <input type="number" step="0.01" name="bakerySales" value={formData.bakerySales} onChange={handleInputChange} placeholder="Sprzedaż (zł)" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xl font-black focus:border-amber-500 outline-none" required />
               <input type="number" step="0.01" name="bakeryLoss" value={formData.bakeryLoss} onChange={handleInputChange} placeholder="Strata (zł)" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xl font-black text-rose-500 focus:border-rose-500 outline-none" required />
             </div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
             <div className="flex items-center gap-3">
               <span className="text-2xl">🍰</span>
               <h3 className="font-black text-slate-800 uppercase tracking-tight">Cukiernia</h3>
             </div>
             <div className="space-y-4">
               <input type="number" step="0.01" name="pastrySales" value={formData.pastrySales} onChange={handleInputChange} placeholder="Sprzedaż (zł)" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xl font-black focus:border-amber-500 outline-none" required />
               <input type="number" step="0.01" name="pastryLoss" value={formData.pastryLoss} onChange={handleInputChange} placeholder="Strata (zł)" className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xl font-black text-rose-500 focus:border-rose-500 outline-none" required />
             </div>
          </div>
        </div>

        <button 
          type="submit" disabled={status === 'saving'}
          className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-3"
        >
          {status === 'saving' ? <Loader2 className="animate-spin" /> : <Save />}
          ZAPISZ RAPORT DZIENNY
        </button>
      </form>
    </div>
  );
};

export default DataEntry;
