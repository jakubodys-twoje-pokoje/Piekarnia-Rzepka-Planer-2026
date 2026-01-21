
import React, { useState, useEffect } from 'react';
// Added MapPin to the imports from lucide-react to fix the error on line 171
import { UserPlus, Search, Shield, User as UserIcon, RefreshCw, X, Loader2, AlertTriangle, Database, Lock, MapPin } from 'lucide-react';
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
      setError("Brak konfiguracji bazy danych (URL/Key). Sprawdź plik supabase.ts.");
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
      
      if (data?.length === 0) {
        console.warn("Pobrano 0 profili. Sprawdź czy w tabeli 'public.profiles' są rekordy oraz czy RLS nie blokuje dostępu.");
      }
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
    alert('Zapraszanie użytkowników wymaga użycia panelu Supabase Dashboard (Authentication -> Users). Po stworzeniu konta i pierwszym zalogowaniu, profil pojawi się automatycznie.');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900">Nowy Pracownik</h3>
              <button onClick={() => setShowAddModal(false)}><X size={24} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Służbowy</label>
                <input type="email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none" placeholder="pracownik@rzepka.pl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as Role})} className="px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none">
                  <option value="user">Pracownik</option>
                  <option value="admin">Administrator</option>
                </select>
                <select value={newUser.location} onChange={e => setNewUser({...newUser, location: e.target.value})} className="px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none">
                  {LOCATIONS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl">Zaproś do systemu</button>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pracownicy i konta</h1>
          <p className="text-sm text-slate-500 font-medium">Lista profili zarejestrowanych w systemie.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchUsers} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all active:rotate-180">
            <RefreshCw size={20} className={loading ? 'animate-spin text-amber-500' : ''} />
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">
            <UserPlus size={16} /> Dodaj Nowego
          </button>
        </div>
      </div>

      {error && (
        <div className="p-6 bg-rose-50 border border-rose-100 rounded-[2rem] flex items-center gap-4 text-rose-600 shadow-sm">
          <div className="p-3 bg-rose-100 rounded-2xl"><AlertTriangle size={32} /></div>
          <div>
            <p className="font-black uppercase text-[10px] tracking-widest">Błąd połączenia z backendem</p>
            <p className="text-sm font-bold">{error}</p>
            <p className="text-[10px] font-medium text-rose-400 mt-1 italic">Upewnij się, że SUPABASE_URL w pliku supabase.ts jest poprawny.</p>
          </div>
        </div>
      )}

      {!loading && users.length === 0 && !error && (
        <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-8 text-amber-800 space-y-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Lock className="text-amber-500" size={24} />
            <h3 className="text-lg font-black tracking-tight">Nie znaleziono profilów użytkowników</h3>
          </div>
          <div className="space-y-2 text-sm font-medium opacity-90">
            <p>Jeśli stworzyłeś użytkownika, a go tutaj nie widzisz, sprawdź:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Czy rekord znajduje się w tabeli <code className="bg-amber-100 px-1 rounded">public.profiles</code> (nie tylko w Authentication).</li>
              <li>Czy <strong>Row Level Security (RLS)</strong> w panelu Supabase pozwala na odczyt (SELECT).</li>
              <li>Czy dodałeś użytkownika przez interfejs aplikacji lub manualnie przypisałeś mu poprawne ID z tabeli <code className="bg-amber-100 px-1 rounded">auth.users</code>.</li>
            </ul>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[400px] relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="animate-spin text-amber-500" size={40} />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pobieranie bazy danych...</p>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest">
                <th className="px-8 py-5">Dane Konta</th>
                <th className="px-6 py-5">Poziom Dostępu</th>
                <th className="px-6 py-5">Punkt Sprzedaży</th>
                <th className="px-8 py-5 text-right">Zarządzanie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl flex items-center justify-center ${
                        u.role === 'admin' ? 'bg-amber-100 text-amber-700 shadow-inner' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {u.role === 'admin' ? <Shield size={18} /> : <UserIcon size={18} />}
                      </div>
                      <div>
                        <span className="text-sm font-black text-slate-800 block group-hover:text-amber-600 transition-colors">{u.email}</span>
                        <span className="text-[9px] font-bold text-slate-300 font-mono tracking-tighter">UID: {u.id.substring(0, 8)}...</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                      u.role === 'admin' 
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                        : 'bg-white text-slate-400 border-slate-200'
                    }`}>
                      {u.role === 'admin' ? 'Administrator' : 'Użytkownik'}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                       <MapPin size={12} className="text-amber-500" />
                       <span className="font-bold text-xs uppercase text-slate-700">
                         {LOCATIONS.find(l => l.id === u.default_location_id)?.name || 'Nieprzypisany'}
                       </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="p-2 bg-white border border-slate-100 text-slate-300 hover:text-rose-500 rounded-lg hover:shadow-sm">
                        <X size={16}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 py-4 opacity-50">
        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
           <Database size={14} /> Połączenie: {isSupabaseConfigured ? <span className="text-emerald-500">Aktywne</span> : <span className="text-rose-500">Nieprawidłowe</span>}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
