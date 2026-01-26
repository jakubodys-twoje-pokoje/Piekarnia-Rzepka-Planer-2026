
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  Shield, User as UserIcon, Loader2, Save, MapPin, 
  UserPlus, X, Key, Mail, AlertCircle, Trash2, Edit2, CheckCircle2 
} from 'lucide-react';
import { LOCATIONS } from '../constants';
import { Role } from '../types';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<any | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('email');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('processing');
    setErrorMsg('');

    try {
      if (modal.isNew) {
        // 1. Tworzenie użytkownika w Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: modal.email,
          password: modal.password,
        });

        if (authError) throw authError;

        if (authData.user) {
          // 2. Aktualizacja profilu (rola i lokalizacja)
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              role: modal.role,
              default_location_id: modal.default_location_id === 'none' ? null : modal.default_location_id,
              email: modal.email
            })
            .eq('id', authData.user.id);

          if (profileError) throw profileError;
        }
      } else {
        // Edycja istniejącego użytkownika
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            role: modal.role,
            default_location_id: modal.default_location_id === 'none' ? null : modal.default_location_id
          })
          .eq('id', modal.id);

        if (updateError) throw updateError;
      }

      setStatus('success');
      setTimeout(() => {
        setModal(null);
        setStatus('idle');
        fetchUsers();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć profil tego pracownika? Uwaga: usunięcie konta z systemu logowania musi zostać wykonane w panelu Supabase Auth.')) return;
    
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      fetchUsers();
    } catch (err: any) {
      alert("Błąd: " + err.message);
    }
  };

  if (loading && users.length === 0) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="animate-spin text-amber-500" size={40} />
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Wczytywanie listy zespołu...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Zespół Rzepka</h1>
          <p className="text-slate-500 font-medium">Zarządzaj dostępem pracowników do systemu.</p>
        </div>
        <button 
          onClick={() => setModal({ isNew: true, email: '', password: '', role: 'user', default_location_id: 'none' })}
          className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl active:scale-95"
        >
          <UserPlus size={18} /> Dodaj Pracownika
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((u) => (
          <div key={u.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'}`}>
                {u.role === 'admin' ? <Shield size={28} /> : <UserIcon size={28} />}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setModal({ ...u, isNew: false, default_location_id: u.default_location_id || 'none' })}
                  className="p-2.5 bg-slate-50 text-slate-400 hover:text-amber-600 rounded-xl transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(u.id)}
                  className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="space-y-1 mb-6">
              <h3 className="text-lg font-black text-slate-800 break-all">{u.email}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Shield size={12} className={u.role === 'admin' ? 'text-amber-500' : 'text-slate-300'} />
                Rola: {u.role === 'admin' ? 'Administrator' : 'Pracownik'}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Punkt Domyślny</p>
              <div className="flex items-center gap-2 text-slate-700 font-bold text-sm bg-slate-50 px-4 py-2 rounded-xl">
                <MapPin size={14} className="text-amber-500" />
                {LOCATIONS.find(l => l.id === u.default_location_id)?.name || 'Nieprzypisany'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zarządzanie kontem</h3>
                  <p className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                    {modal.isNew ? 'Nowy Pracownik' : 'Edycja Profilu'}
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setModal(null)}
                  className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-full transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              {status === 'error' && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold">
                  <AlertCircle size={18} /> {errorMsg}
                </div>
              )}

              <div className="space-y-5">
                {modal.isNew && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Mail size={12} /> Email służbowy
                      </label>
                      <input 
                        type="email" 
                        required
                        value={modal.email}
                        onChange={e => setModal({...modal, email: e.target.value})}
                        placeholder="nazwisko@rzepka.pl"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Key size={12} /> Hasło startowe
                      </label>
                      <input 
                        type="password" 
                        required
                        value={modal.password}
                        onChange={e => setModal({...modal, password: e.target.value})}
                        placeholder="••••••••"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
                      />
                    </div>
                  </>
                )}

                {!modal.isNew && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Edytowany profil</p>
                    <p className="text-sm font-black text-slate-700">{modal.email}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rola</label>
                    <select 
                      value={modal.role}
                      onChange={e => setModal({...modal, role: e.target.value})}
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs uppercase outline-none focus:ring-2 focus:ring-amber-500/20"
                    >
                      <option value="user">Pracownik</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Punkt</label>
                    <select 
                      value={modal.default_location_id}
                      onChange={e => setModal({...modal, default_location_id: e.target.value})}
                      className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs uppercase outline-none focus:ring-2 focus:ring-amber-500/20"
                    >
                      <option value="none">Brak (Global)</option>
                      {LOCATIONS.map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={status === 'processing'}
                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-amber-600 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
              >
                {status === 'processing' ? <Loader2 size={18} className="animate-spin" /> : (status === 'success' ? <CheckCircle2 className="text-emerald-400" /> : <Save size={18} />)}
                {status === 'processing' ? 'PRZETWARZANIE...' : (status === 'success' ? 'GOTOWE!' : 'ZAPISZ PRACOWNIKA')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
