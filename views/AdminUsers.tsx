
import React, { useState, useEffect } from 'react';
import { 
  UserPlus, Shield, User as UserIcon, RefreshCw, X, 
  Loader2, AlertTriangle, Database, Lock, MapPin, 
  Trash2, Mail, BadgeCheck, AlertCircle, ExternalLink
} from 'lucide-react';
import { LOCATIONS } from '../constants';
import { Role } from '../types';
import { supabase, isSupabaseConfigured } from '../supabase';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('profiles')
        .select('id, role, default_location_id')
        .order('role', { ascending: true });
        
      if (supabaseError) throw supabaseError;
      setUsers(data || []);
    } catch (err: any) {
      console.error("Fetch users error:", err);
      setError(err.message || 'Wystąpił problem z połączeniem.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div className="space-y-8 pb-20">
      {/* Modal Informacyjny */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 animate-in zoom-in duration-200 border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Zarządzanie kontami</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={40} />
              </div>
              <p className="text-sm font-bold text-slate-600 leading-relaxed">
                Ze względów bezpieczeństwa, tworzenie nowych kont e-mail odbywa się bezpośrednio w panelu sterowania <span className="text-amber-600">Supabase Auth</span>.
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Po dodaniu maila w panelu, profil pracownika zostanie automatycznie utworzony przy jego pierwszym logowaniu.
              </div>
              <a 
                href="https://supabase.com/dashboard/project/tymakcndlzhyfvmkhjkn/auth/users" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
              >
                Otwórz Panel Autoryzacji <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Zarządzanie Zespołem</h1>
          <p className="text-slate-500 font-medium mt-1">Lista aktywnych dostępów do systemu Revenue Manager.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchUsers} className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm active:rotate-180">
            <RefreshCw size={20} className={loading ? 'animate-spin text-amber-500' : ''} />
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-amber-600 transition-all">
            <UserPlus size={18} /> Zarządzaj Kontami
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px] relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <Loader2 className="animate-spin text-amber-600" size={48} />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-10 py-7 text-[10px] font-black uppercase tracking-widest opacity-50">Pracownik (ID Systemowe)</th>
                <th className="px-8 py-7 text-[10px] font-black uppercase tracking-widest opacity-50 text-center">Uprawnienia</th>
                <th className="px-8 py-7 text-[10px] font-black uppercase tracking-widest opacity-50">Punkt Sprzedaży</th>
                <th className="px-10 py-7 text-right text-[10px] font-black uppercase tracking-widest opacity-50">Logowanie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const location = LOCATIONS.find(l => l.id === u.default_location_id);
                return (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                          u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {u.role === 'admin' ? <Shield size={22} /> : <UserIcon size={22} />}
                        </div>
                        <div>
                          <span className="text-base font-black text-slate-800 block">Konto {u.id.substring(0, 8)}</span>
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Baza: Rzepka Production</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8 text-center">
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${
                        u.role === 'admin' ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-100'
                      }`}>
                        {u.role === 'admin' ? 'ADMINISTRATOR' : 'PRACOWNIK'}
                      </span>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-2">
                         <MapPin size={16} className="text-amber-500" />
                         <span className="font-bold text-sm text-slate-700">
                           {location?.name || 'Centrala'}
                         </span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                       <div className="flex items-center justify-end gap-2 text-emerald-500">
                          <BadgeCheck size={18} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Aktywny</span>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex items-start gap-4">
         <AlertCircle className="text-amber-600 shrink-0" size={24} />
         <div className="space-y-1">
            <p className="text-xs font-black text-amber-900 uppercase tracking-widest">Ważna informacja</p>
            <p className="text-sm text-amber-700 font-medium leading-relaxed">
              Logowanie odbywa się przy użyciu adresów e-mail w domenie <span className="font-bold">@rzepka.pl</span>. 
              Zmiany haseł lub usuwanie kont musi być przeprowadzane przez administratora IT w panelu głównym Supabase.
            </p>
         </div>
      </div>
    </div>
  );
};

export default AdminUsers;
