
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { 
  Shield, User as UserIcon, Loader2, Save, MapPin, GraduationCap,
  UserPlus, X, Key, Mail, AlertCircle, Trash2, Edit2, CheckCircle2 
} from 'lucide-react';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<any | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: profData }, { data: locData }] = await Promise.all([
        supabase.from('profiles').select('*').order('email'),
        supabase.from('locations').select('*').order('name')
      ]);
      
      setUsers(profData || []);
      setLocations(locData || []);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('processing');
    setErrorMsg('');

    try {
      const locationIdValue = modal.default_location_id === 'none' ? null : modal.default_location_id;

      if (modal.isNew) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: modal.email,
          password: modal.password,
        });

        if (authError) {
          if (authError.message.includes("Email rate limit exceeded")) {
             throw new Error("Limit wysyłek e-mail przekroczony. Supabase pozwala na max 3 nowych użytkowników na godzinę. Spróbuj później.");
          }
          throw authError;
        }

        if (authData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: authData.user.id,
              email: modal.email,
              role: modal.role,
              first_name: modal.first_name,
              last_name: modal.last_name,
              default_location_id: locationIdValue,
            }, { onConflict: 'id' });

          if (profileError) throw profileError;
        }
      } else {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            role: modal.role,
            first_name: modal.first_name,
            last_name: modal.last_name,
            default_location_id: locationIdValue
          })
          .eq('id', modal.id);

        if (updateError) throw updateError;
      }

      setStatus('success');
      setTimeout(() => {
        setModal(null);
        setStatus('idle');
        fetchData();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Usunąć profil?')) return;
    try {
      await supabase.from('profiles').delete().eq('id', id);
      fetchData();
    } catch (err: any) {
      alert("Błąd: " + err.message);
    }
  };

  if (loading && users.length === 0) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-amber-500" size={40} /></div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Zespół Rzepka</h1>
          <p className="text-slate-500 font-medium">Zarządzaj dostępem pracowników i uczniów.</p>
        </div>
        <button 
          onClick={() => setModal({ isNew: true, email: '', password: '', first_name: '', last_name: '', role: 'user', default_location_id: 'none' })}
          className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl"
        >
          <UserPlus size={18} /> Dodaj Członka
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((u) => (
          <div key={u.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${u.role === 'admin' ? 'bg-amber-100 text-amber-700' : (u.role === 'apprentice' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400')}`}>
                {u.role === 'admin' ? <Shield size={28} /> : (u.role === 'apprentice' ? <GraduationCap size={28} /> : <UserIcon size={28} />)}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity no-print">
                <button onClick={() => setModal({ ...u, isNew: false, default_location_id: u.default_location_id || 'none' })} className="p-2.5 bg-slate-50 text-slate-400 hover:text-amber-600 rounded-xl transition-all"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(u.id)} className="p-2.5 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all"><Trash2 size={16} /></button>
              </div>
            </div>
            
            <div className="space-y-1 mb-6">
              <h3 className="text-lg font-black text-slate-800 break-all leading-tight">
                {u.first_name && u.last_name ? `${u.first_name} ${u.last_name}` : u.email?.split('@')[0]}
              </h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Mail size={10} /> {u.email}</p>
            </div>

            <div className="pt-4 border-t border-slate-50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Punkt Domyślny</p>
              <div className="flex items-center gap-2 text-slate-700 font-bold text-sm bg-slate-50 px-4 py-2 rounded-xl">
                <MapPin size={14} className="text-amber-500" />
                {locations.find(l => l.id === u.default_location_id)?.name || 'Nieprzypisany'}
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
                  <p className="text-2xl font-black text-slate-900 uppercase tracking-tight">{modal.isNew ? 'Nowy Członek' : 'Edycja Danych'}</p>
                </div>
                <button type="button" onClick={() => setModal(null)} className="p-3 bg-slate-50 text-slate-400 rounded-full hover:text-slate-900"><X size={24} /></button>
              </div>

              {status === 'error' && <div className="p-4 bg-rose-50 text-rose-600 text-xs font-bold rounded-2xl flex items-center gap-2"><AlertCircle size={16}/> {errorMsg}</div>}

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" required value={modal.first_name || ''} onChange={e => setModal({...modal, first_name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white" placeholder="Imię" />
                  <input type="text" required value={modal.last_name || ''} onChange={e => setModal({...modal, last_name: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white" placeholder="Nazwisko" />
                </div>

                {modal.isNew && (
                  <>
                    <input type="email" required value={modal.email} onChange={e => setModal({...modal, email: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white" placeholder="Email" />
                    <input type="password" required value={modal.password} onChange={e => setModal({...modal, password: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white" placeholder="Hasło (min. 6 znaków)" />
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <select value={modal.role} onChange={e => setModal({...modal, role: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs uppercase outline-none focus:bg-white">
                    <option value="user">Pracownik</option>
                    <option value="apprentice">Uczeń</option>
                    <option value="admin">Administrator</option>
                  </select>
                  <select value={modal.default_location_id} onChange={e => setModal({...modal, default_location_id: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xs uppercase outline-none focus:bg-white">
                    <option value="none">Bez punktu</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" disabled={status === 'processing'} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">
                {status === 'processing' ? <Loader2 size={18} className="animate-spin" /> : (status === 'success' ? <CheckCircle2 className="text-emerald-400" /> : <Save size={18} />)}
                ZAPISZ ZMIANY
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
