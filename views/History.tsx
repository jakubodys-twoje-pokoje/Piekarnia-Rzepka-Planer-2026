
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { Calendar, ArrowRight, Loader2, MapPin } from 'lucide-react';
import { supabase } from '../supabase';

interface HistoryProps {
  user: UserProfile;
}

const HistoryView: React.FC<HistoryProps> = ({ user }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(user.default_location_id || '');

  const fetchReports = async (locationId: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('daily_reports')
        .select('*')
        .order('date', { ascending: false })
        .limit(30);

      if (locationId) {
        query = query.eq('location_id', locationId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: locData } = await supabase.from('locations').select('id, name').order('name');
      setLocations(locData || []);

      // Set initial location
      const initialLoc = user.default_location_id || (locData && locData.length > 0 ? locData[0].id : '');
      setSelectedLocation(initialLoc);
      fetchReports(initialLoc);
    };
    fetchData();
  }, []);

  const handleLocationChange = (locId: string) => {
    setSelectedLocation(locId);
    fetchReports(locId);
  };

  const getLocationName = (id: string) => locations.find(l => l.id === id)?.name || 'Nieznany punkt';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Ostatnie Raporty</h1>
          <p className="text-slate-500 font-medium">
            Podgląd dla punktu: {getLocationName(selectedLocation)}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <MapPin size={16} className="text-amber-500 ml-2" />
          <select
            value={selectedLocation}
            onChange={e => handleLocationChange(e.target.value)}
            className="bg-transparent font-black text-xs text-slate-700 uppercase tracking-widest outline-none pr-4"
          >
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[400px] relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <Loader2 className="animate-spin text-amber-500" size={32} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest opacity-50">Data</th>
                  {user.role === 'admin' && <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest opacity-50">Punkt</th>}
                  <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest opacity-50">Piekarnia (S/L)</th>
                  <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-widest opacity-50">Cukiernia (S/L)</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest opacity-50">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:text-amber-600 transition-colors">
                          <Calendar size={16} />
                        </div>
                        <span className="text-sm font-black text-slate-700">{row.date}</span>
                      </div>
                    </td>
                    {user.role === 'admin' && (
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <MapPin size={10} className="text-amber-500"/> {getLocationName(row.location_id)}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{row.bakery_sales.toLocaleString()} zł</span>
                        <span className="text-[10px] text-rose-500 font-bold">-{row.bakery_loss.toLocaleString()} zł</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{row.pastry_sales.toLocaleString()} zł</span>
                        <span className="text-[10px] text-rose-500 font-bold">-{row.pastry_loss.toLocaleString()} zł</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-right">
                      <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                        <ArrowRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="flex flex-col items-center gap-3 text-slate-300">
                        <Calendar size={48} />
                        <p className="text-xs font-black uppercase tracking-widest">Brak raportów w historii</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
