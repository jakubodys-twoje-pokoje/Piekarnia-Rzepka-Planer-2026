
import React, { useState } from 'react';
import { UserPlus, Search, UserCheck, MoreVertical, MapPin, X, Shield, User as UserIcon, RefreshCw } from 'lucide-react';
import { LOCATIONS } from '../constants';
import { Role } from '../types';

const AdminUsers: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    role: 'user' as Role,
    location: '1'
  });

  const [users, setUsers] = useState([
    { id: '1', email: 'biuro@rzepka.pl', role: 'admin', location: 'Centrala', status: 'active', lastLogin: '10 min temu' },
    { id: '2', email: 'jedrzychow@rzepka.pl', role: 'user', location: 'JĘDRZYCHÓW', status: 'active', lastLogin: 'Dziś, 06:15' },
    { id: '3', email: 'fabryczna@rzepka.pl', role: 'user', location: 'FABRYCZNA', status: 'offline', lastLogin: 'Wczoraj' },
  ]);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1000);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const locationName = LOCATIONS.find(l => l.id === newUser.location)?.name || 'Nieznana';
    const createdUser = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      email: newUser.email,
      role: newUser.role,
      location: locationName,
      status: 'active',
      lastLogin: 'Nigdy'
    };
    setUsers([createdUser, ...users]);
    setShowAddModal(false);
    setNewUser({ email: '', role: 'user', location: '1' });
  };

  return (
    <div className="space-y-6 relative">
      {/* Modal Dodawania Użytkownika */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
            <form onSubmit={handleCreateUser} className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kreator Konta</h3>
                  <p className="text-2xl font-black text-slate-900">Nowy Pracownik</p>
                </div>
                <button type="button" onClick={() => setShowAddModal(false)} className="p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-colors"><X size={24} /></button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Email Systemowy</label>
                  <input 
                    type="email" 
                    required
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                    placeholder="np. filia.kupiecka@rzepka.pl"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 outline-none font-bold text-slate-700 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Uprawnienia</label>
                    <select 
                      value={newUser.role}
                      onChange={e => setNewUser({...newUser, role: e.target.value as Role})}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                    >
                      <option value="user">Pracownik</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Punkt Sprzedaży</label>
                    <select 
                      value={newUser.location}
                      onChange={e => setNewUser({...newUser, location: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
                    >
                      {LOCATIONS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border flex gap-3 transition-colors ${
                newUser.role === 'admin' ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'
              }`}>
                {newUser.role === 'admin' ? <Shield size={18} className="text-amber-600 shrink-0" /> : <UserIcon size={18} className="text-slate-400 shrink-0" />}
                <p className={`text-[10px] font-bold leading-tight ${newUser.role === 'admin' ? 'text-amber-800' : 'text-slate-500'}`}>
                  {newUser.role === 'admin' 
                    ? 'UWAGA: Administrator widzi wyniki wszystkich punktów i może edytować budżety.' 
                    : 'Pracownik ma dostęp wyłącznie do swojego punktu sprzedaży i historii swoich wpisów.'}
                </p>
              </div>

              <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-amber-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
                Zapisz i Wyślij Zaproszenie
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Konta i Dostęp</h1>
          <p className="text-sm text-slate-500 font-medium">Zarządzasz {users.length} kontami w systemie.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSync}
            className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all hover:bg-slate-50 active:rotate-180 duration-500"
          >
            <RefreshCw size={20} className={isSyncing ? 'animate-spin text-amber-500' : ''} />
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl active:scale-95"
          >
            <UserPlus size={16} />
            Dodaj Nowego
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="relative w-full max-w-sm">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" 
              placeholder="Szukaj pracownika..." 
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/10 shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-left">
                <th className="px-8 py-5 text-[9px] font-black uppercase tracking-[0.2em] opacity-50">Tożsamość</th>
                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] opacity-50">Uprawnienia</th>
                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] opacity-50">Punkt</th>
                <th className="px-6 py-5 text-[9px] font-black uppercase tracking-[0.2em] opacity-50 text-center">Logowanie</th>
                <th className="px-8 py-5 text-right text-[9px] font-black uppercase tracking-[0.2em] opacity-50">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                        u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {u.role === 'admin' ? <Shield size={18}/> : <UserIcon size={18}/>}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 tracking-tight">{u.email}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">ID: {u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                      u.role === 'admin' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {u.role === 'admin' ? 'Admin' : 'User'}
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin size={14} className="text-amber-500" />
                      <span className="text-xs font-bold uppercase tracking-tight">{u.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6 text-center">
                    <div className="flex flex-col items-center gap-1">
                       <span className={`text-[10px] font-black uppercase ${u.status === 'active' ? 'text-emerald-500' : 'text-slate-300'}`}>
                         {u.status === 'active' ? 'Online' : 'Offline'}
                       </span>
                       <span className="text-[9px] text-slate-400 font-medium">{u.lastLogin}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-slate-400 hover:text-amber-600 bg-white border border-slate-100 rounded-lg shadow-sm transition-all">
                        <UserCheck size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-rose-600 bg-white border border-slate-100 rounded-lg shadow-sm transition-all">
                        <X size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
