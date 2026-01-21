
import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Shield, User as UserIcon, RefreshCw, X, 
  Loader2, AlertTriangle, Database, Lock, MapPin, 
  Trash2, Mail, BadgeCheck, AlertCircle 
} from 'lucide-react';
import { LOCATIONS } from '../constants';
import { Role } from '../types';
import { supabase, isSupabaseConfigured } from '../supabase';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', role: 'user' as Role, location: '1' });

  const fetchUsers = async () => {
    if (!isSupabaseConfigured) {
      // Mock data for demo mode
      setUsers([
        { id: '1', email: 'admin@rzepka.pl', role: 'admin', default_location_id: '1' },
        { id: '2', email: 'jedrzychow@rzepka.pl', role: 'user', default_location_id: '1' },
        { id: '3', email: 'kupiecka@rzepka.pl', role: 'user', default_location_id: '2' },
      ]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('profiles')
        .select('*')
        .order('role', { ascending: true });
        
      if (supabaseError) throw supabaseError;
      setUsers(data || []);
    } catch (err: any) {
      console.error("Fetch users error:", err);
      setError(err.message || 'Wystąpił problem z połączeniem z bazą danych.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('W systemie produkcyjnym użyj panelu Supabase (Auth -> Users). Tryb Demo pozwala tylko na podgląd.');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8 pb-20">
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 animate-in zoom-in duration-200 border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Nowy Profil</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Pracownika</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-amber-500 font-bold" placeholder="nazwisko@rzepka.pl" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rola</label>
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as Role})} className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm">
                    <option value="user">Użytkownik</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Punkt</label>
                  <select value={newUser.location} onChange={e => setNewUser({...newUser, location: e.target.value})} className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm">
                    {LOCATIONS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:bg-amber-600 transition-all">
                Stwórz profil
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
             <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest rounded-full">Bezpieczeństwo</span>
           </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Zarządzanie Zespołem</h1>
          <p className="text-slate-500 font-medium mt-1">Lista aktywnych kont i ich uprawnień w systemie.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchUsers} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm active:rotate-180">
            <RefreshCw size={20} className={loading ? 'animate-spin text-amber-500' : ''} />
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-amber-600 transition-all">
            <UserPlus size={18} /> Dodaj Członka
          </button>
        </div>
      </div>

      {!isSupabaseConfigured && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-[2.5rem] p-8 flex items-center gap-6 shadow-sm">
           <div className="w-16 h-16 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600 shadow-inner shrink-0">
              <AlertCircle size={32} />
           </div>
           <div>
              <h3 className="text-lg font-black text-amber-900 uppercase tracking-tight">Tryb Demonstracyjny</h3>
              <p className="text-sm font-medium text-amber-800/80 leading-relaxed max-w-2xl">
                Dane które widzisz poniżej są danymi przykładowymi. Aby zobaczyć użytkowników z Twojej bazy Supabase, 
                musisz poprawnie skonfigurować połączenie w pliku <code className="bg-amber-200/50 px-1 rounded font-bold">supabase.ts</code>.
              </p>
           </div>
        </div>
      )}

      {error && (
        <div className="p-8 bg-rose-50 border-2 border-rose-100 rounded-[2.5rem] flex items-center gap-6 text-rose-600 shadow-sm animate-pulse">
          <AlertTriangle size={32} className="shrink-0" />
          <div>
            <p className="font-black uppercase text-[10px] tracking-widest mb-1">Błąd Połączenia</p>
            <p className="text-sm font-bold">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px] relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-amber-600" size={48} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wczytywanie bazy użytkowników...</p>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-10 py-7 text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Profil Pracownika</th>
                <th className="px-8 py-7 text-[10px] font-black uppercase tracking-[0.2em] opacity-50 text-center">Rola</th>
                <th className="px-8 py-7 text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Lokalizacja</th>
                <th className="px-10 py-7 text-[10px] font-black uppercase tracking-[0.2em] opacity-50 text-right">Zarządzanie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                        u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {u.role === 'admin' ? <Shield size={22} /> : <UserIcon size={22} />}
                      </div>
                      <div>
                        <span className="text-base font-black text-slate-800 block group-hover:text-amber-600 transition-colors">{u.email}</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <BadgeCheck size={12} className="text-emerald-500" />
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Konto Zweryfikowane</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8 text-center">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${
                      u.role === 'admin' 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                        : 'bg-white text-slate-400 border-slate-100'
                    }`}>
                      {u.role === 'admin' ? 'ADMIN' : 'USER'}
                    </span>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-2">
                       <MapPin size={16} className="text-amber-500" />
                       <span className="font-bold text-sm text-slate-700">
                         {LOCATIONS.find(l => l.id === u.default_location_id)?.name || 'Centrala'}
                       </span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                      <button className="p-3 bg-white border border-slate-200 text-slate-300 hover:text-rose-500 rounded-xl hover:shadow-md transition-all">
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && !loading && !error && (
            <div className="py-32 flex flex-col items-center justify-center text-slate-300">
              <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4">
                <UserIcon size={40} className="opacity-20" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest">Brak profili w bazie danych</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-8 py-6 opacity-30">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
           <Database size={14} /> Status Połączenia: {isSupabaseConfigured ? <span className="text-emerald-500">Live</span> : <span className="text-amber-500">Demo</span>}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
