
import React from 'react';
import { UserPlus, Search, UserCheck, MoreVertical, MapPin } from 'lucide-react';
import { LOCATIONS } from '../constants';

const AdminUsers: React.FC = () => {
  const users = [
    { id: '1', email: 'jan.kowalski@rzepka.pl', role: 'user', location: 'JĘDRZYCHÓW', status: 'active' },
    { id: '2', email: 'admin.anna@rzepka.pl', role: 'admin', location: 'Centrala', status: 'active' },
    { id: '3', email: 'marek.nowak@rzepka.pl', role: 'user', location: 'KUPIECKA', status: 'active' },
    { id: '4', email: 'beata.wilk@rzepka.pl', role: 'user', location: 'FABRYCZNA', status: 'inactive' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Zarządzanie Użytkownikami</h1>
          <p className="text-slate-500">Dodawaj, edytuj i usuwaj dostęp dla pracowników.</p>
        </div>
        <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">
          <UserPlus size={18} />
          Dodaj Pracownika
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Szukaj użytkownika..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-500 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Pracownik</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Rola</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Lokalizacja</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                        {u.email.substring(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{u.email}</p>
                        <p className="text-xs text-slate-400">ID: {u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin size={14} className="text-slate-400" />
                      <span className="text-sm font-medium">{u.location}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`flex items-center gap-1.5 text-xs font-bold ${
                      u.status === 'active' ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                      {u.status === 'active' ? 'Aktywny' : 'Dezaktywowany'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="text-slate-400 hover:text-amber-600 px-2 py-1 font-bold text-xs">
                      EDYTUJ
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
