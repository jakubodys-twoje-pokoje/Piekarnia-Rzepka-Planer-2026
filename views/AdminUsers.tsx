
import React, { useState } from 'react';
import { UserPlus, Search, UserCheck, MoreVertical, MapPin, X, Shield, User as UserIcon } from 'lucide-react';
import { LOCATIONS } from '../constants';
import { Role } from '../types';

const AdminUsers: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    role: 'user' as Role,
    location: '1'
  });

  const [users, setUsers] = useState([
    { id: '1', email: 'jan.kowalski@rzepka.pl', role: 'user', location: 'JĘDRZYCHÓW', status: 'active' },
    { id: '2', email: 'admin.anna@rzepka.pl', role: 'admin', location: 'Centrala', status: 'active' },
    { id: '3', email: 'marek.nowak@rzepka.pl', role: 'user', location: 'KUPIECKA', status: 'active' },
  ]);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const locationName = LOCATIONS.find(l => l.id === newUser.location)?.name || 'Nieznana';
    const createdUser = {
      id: Math.random().toString(36).substr(2, 9),
      email: newUser.email,
      role: newUser.role,
      location: locationName,
      status: 'active'
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
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Administracja</h3>
                  <p className="text-2xl font-black text-slate-900">Nowy Użytkownik</p>
                </div>
                <button type="button" onClick={() => setShowAddModal(false)} className="p-2 bg-slate-50 text-slate-400 rounded-full"><X size={24} /></button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Adres Email</label>
                  <input 
                    type="email" 
                    required
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                    placeholder="pracownik@rzepka.pl"
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 outline-none font-bold text-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Rola Systemowa</label>
                    <select 
                      value={newUser.role}
                      onChange={e => setNewUser({...newUser, role: e.target.value as Role})}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 outline-none font-bold text-slate-700 appearance-none"
                    >
                      <option value="user">Pracownik</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Punkt Domyślny</label>
                    <select 
                      value={newUser.location}
                      onChange={e => setNewUser({...newUser, location: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 outline-none font-bold text-slate-700 appearance-none"
                    >
                      {LOCATIONS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3">
                <Shield size={18} className="text-amber-600 shrink-0" />
                <p className="text-[10px] font-bold text-amber-800 leading-tight">
                  Administratorzy mają dostęp do wszystkich raportów, budżetów i ustawień całej sieci punktów.
                </p>
              </div>

              <button type="submit" className="w-full py-5 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-amber-600 transition-all shadow-xl shadow-slate-900/10">
                Utwórz Konto
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Konta Pracownicze</h1>
          <p className="text-sm text-slate-500 font-medium">Zarządzanie dostępem i rolami w systemie.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl active:scale-95"
        >
          <UserPlus size={16} />
          Dodaj Pracownika
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <div className="relative w-full max-w-sm">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input 
              type="text" 
              placeholder="Szukaj po emailu lub lokalizacji..." 
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 shadow-sm transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest opacity-60">Użytkownik</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-60">Poziom Dostępu</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-60">Lokalizacja</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest opacity-60">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest opacity-60">Opcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs ${
                        u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {u.role === 'admin' ? <Shield size={16}/> : <UserIcon size={16}/>}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 tracking-tight">{u.email}</p>
                        <p className="text-[10px] font-bold text-slate-400">UUID: {u.id.toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      u.role === 'admin' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {u.role === 'admin' ? 'Administrator' : 'Pracownik'}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin size={14} className="text-slate-300" />
                      <span className="text-xs font-bold uppercase tracking-tight">{u.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`flex items-center gap-2 text-[10px] font-black uppercase ${
                      u.status === 'active' ? 'text-emerald-500' : 'text-slate-300'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                      {u.status === 'active' ? 'Aktywny' : 'Zablokowany'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-[10px] font-black text-slate-400 hover:text-amber-600 px-3 py-1.5 border border-slate-100 rounded-lg hover:border-amber-200 transition-all uppercase tracking-widest">
                      Edytuj
                    </button>
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
