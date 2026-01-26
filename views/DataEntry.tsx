
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Save, AlertCircle, CheckCircle2, Loader2, RefreshCw, ShieldCheck, X, Key, User } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabase';
import { createClient } from '@supabase/supabase-js';

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
  
  // State for apprentice confirmation
  const [showConfirm, setShowConfirm] = useState(false);
  const [supervisorEmail, setSupervisorEmail] = useState('');
  const [supervisorPass, setSupervisorPass] = useState('');
  const [confirming, setConfirming] = useState(false);

  const loadLocations = async () => {
    setLoading(true);
    const { data } = await supabase.from('locations').select('*').eq('status', 'aktywny');
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

  const handlePreSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.locationId) {
      setStatus('error');
      setErrorMsg('Wybierz punkt sprzedaży.');
      return;
    }

    if (user.role === 'apprentice') {
      setShowConfirm(true);
    } else {
      executeSave();
    }
  };

  const handleSupervisorConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirming(true);
    setErrorMsg('');

    try {
      // Weryfikacja nadzorcy za pomocą tymczasowego klienta Supabase
      // Używamy tych samych danych URL i AnonKey co w głównym kliencie
      const tempClient = createClient(
        'https://tymakcndlzhyfvmkhjkn.supabase.co', 
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5bWFrY25kbHpoeWZ2bWtoamtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5NzI5MjcsImV4cCI6MjA4NDU0ODkyN30.e2oOyJX2fK9cOcDBkszbmrVE7Mg-PRVZPYYHKopCZmY'
      );
      
      const { data: authData, error: authError } = await tempClient.auth.signInWithPassword({
        email: supervisorEmail,
        password: supervisorPass,
      });

      if (authError || !authData.user) throw new Error("Niepoprawne dane nadzorcy.");

      // Sprawdzenie roli nadzorcy
      const { data: prof, error: profError } = await tempClient
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profError || (prof.role !== 'admin' && prof.role !== 'user')) {
        throw new Error("Tylko pracownik lub administrator może potwierdzić raport ucznia.");
      }

      // Jeśli OK, wyloguj nadzorcę z tymczasowego klienta i zapisz raport
      await tempClient.auth.signOut();
      setShowConfirm(false);
      executeSave();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setConfirming(false);
    }
  };

  const executeSave = async () => {
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
      setSupervisorEmail('');
      setSupervisorPass('');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  if (loading) return <div className="flex flex-col items-center justify-center p-20 gap-4"><Loader2 className="animate-spin text-amber-500" size={40} /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Nowy Raport</h1>
        <p className="text-slate-500 font-medium">Uzupełnij wyniki{user.role === 'apprentice' && ' (wymagane potwierdzenie nadzorcy)'}.</p>
      </div>

      {status === 'error' && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold animate-in fade-in">
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      <form onSubmit={handlePreSave} className="space-y-6">
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
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none"
              disabled={user.role !== 'admin' && !!user.default_location_id}
            >
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2"><span>🍞</span> Piekarnia</h3>
            <div className="space-y-4">
              <input type="number" step="0.01" placeholder="Sprzedaż (zł)" value={formData.bakerySales} onChange={e => setFormData({...formData, bakerySales: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-amber-500 rounded-2xl font-black text-2xl outline-none" required />
              <input type="number" step="0.01" placeholder="Strata (zł)" value={formData.bakeryLoss} onChange={e => setFormData({...formData, bakeryLoss: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl font-black text-2xl text-rose-500 outline-none" required />
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2"><span>🍰</span> Cukiernia</h3>
            <div className="space-y-4">
              <input type="number" step="0.01" placeholder="Sprzedaż (zł)" value={formData.pastrySales} onChange={e => setFormData({...formData, pastrySales: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-amber-500 rounded-2xl font-black text-2xl outline-none" required />
              <input type="number" step="0.01" placeholder="Strata (zł)" value={formData.pastryLoss} onChange={e => setFormData({...formData, pastryLoss: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl font-black text-2xl text-rose-500 outline-none" required />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={status === 'saving'} 
          className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl hover:bg-amber-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {status === 'saving' ? <Loader2 className="animate-spin" /> : (status === 'success' ? <CheckCircle2 className="text-emerald-400" /> : <Save />)}
          {status === 'saving' ? 'PRZETWARZANIE...' : (status === 'success' ? 'RAPORT ZAPISANY!' : 'ZAPISZ DANE DZIENNE')}
        </button>
      </form>

      {/* Supervisor Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 space-y-8 animate-in zoom-in">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center"><ShieldCheck size={28}/></div>
              <button onClick={() => setShowConfirm(false)} className="p-2 text-slate-400 hover:text-slate-900"><X size={24}/></button>
            </div>
            
            <div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Weryfikacja Nadzorcy</h3>
              <p className="text-sm font-medium text-slate-500 mt-2">Uczeń ({user.first_name}) musi uzyskać potwierdzenie pracownika lub admina przed zapisem.</p>
            </div>

            {errorMsg && (
              <div className="p-4 bg-rose-50 text-rose-600 text-xs font-bold rounded-2xl flex items-center gap-2">
                <AlertCircle size={16}/> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSupervisorConfirm} className="space-y-4">
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input type="email" required value={supervisorEmail} onChange={e => setSupervisorEmail(e.target.value)} placeholder="Email nadzorcy" className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" />
              </div>
              <div className="relative">
                <Key size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input type="password" required value={supervisorPass} onChange={e => setSupervisorPass(e.target.value)} placeholder="Hasło nadzorcy" className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" />
              </div>
              <button type="submit" disabled={confirming} className="w-full py-5 bg-amber-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 disabled:opacity-50">
                {confirming ? <Loader2 size={18} className="animate-spin" /> : 'POTWIERDŹ I ZAPISZ'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default DataEntry;
