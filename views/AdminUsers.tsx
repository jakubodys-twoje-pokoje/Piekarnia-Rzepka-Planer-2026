
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Shield, User as UserIcon, Loader2, Save, MapPin } from 'lucide-react';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: profiles } = await supabase.from('profiles').select('*').order('email');
    const { data: locs } = await supabase.from('locations').select('*');
    if (profiles) setUsers(profiles);
    if (locs) setLocations(locs);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const update = async (id: string, field: string, value: string) => {
    await supabase.from('profiles').update({ [field]: value }).eq('id', id);
    load();
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-amber-500" /></div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black text-slate-900 uppercase">Zarządzanie Zespołem</h1>
      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-900 text-white">
            <tr className="text-[10px] font-black uppercase tracking-widest">
              <th className="px-8 py-6">E-mail</th>
              <th className="px-8 py-6">Rola</th>
              <th className="px-8 py-6">Punkt Domyślny</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-8 py-6 font-bold text-slate-700">{u.email}</td>
                <td className="px-8 py-6">
                  <select 
                    value={u.role} 
                    onChange={e => update(u.id, 'role', e.target.value)}
                    className="p-2 bg-slate-100 rounded-lg text-xs font-black uppercase outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="user">PRACOWNIK</option>
                    <option value="admin">ADMINISTRATOR</option>
                  </select>
                </td>
                <td className="px-8 py-6">
                  <select 
                    value={u.default_location_id || ''} 
                    onChange={e => update(u.id, 'default_location_id', e.target.value)}
                    className="p-2 bg-slate-100 rounded-lg text-xs font-black uppercase outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">BRAK</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminUsers;
