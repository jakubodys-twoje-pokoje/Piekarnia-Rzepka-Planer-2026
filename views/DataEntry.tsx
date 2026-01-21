
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { LOCATIONS } from '../constants';
import { Save, AlertCircle, CheckCircle2, Calendar as CalendarIcon } from 'lucide-react';

interface DataEntryProps {
  user: UserProfile;
}

const DataEntry: React.FC<DataEntryProps> = ({ user }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    locationId: user.default_location_id || '1',
    bakerySales: '',
    bakeryLoss: '',
    pastrySales: '',
    pastryLoss: '',
  });

  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    
    // Symulacja zapisu do bazy danych (latencja sieciowa)
    setTimeout(() => {
      setStatus('success');
      setFormData(prev => ({
        ...prev,
        bakerySales: '',
        bakeryLoss: '',
        pastrySales: '',
        pastryLoss: '',
      }));
      setTimeout(() => setStatus('idle'), 3000);
    }, 1200);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Nowy Raport Dzienny</h1>
        <p className="text-lg text-slate-500 font-medium">Wprowadź utargi i straty z dzisiejszej zmiany.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">
              <CalendarIcon size={16} className="text-amber-600" />
              Data Raportu
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 focus:bg-white outline-none transition-all text-xl font-bold text-slate-800"
              required
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Punkt Sprzedaży</label>
            <select
              name="locationId"
              value={formData.locationId}
              onChange={handleInputChange}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 focus:bg-white outline-none transition-all text-xl font-bold text-slate-800 appearance-none cursor-pointer"
              required
            >
              {LOCATIONS.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Piekarnia Card */}
          <div className="bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-sm space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🍞</div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Piekarnia</h3>
            </div>
            <div className="space-y-6 relative z-10">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Sprzedaż (PLN)</label>
                <input
                  type="number" step="0.01" name="bakerySales" value={formData.bakerySales} onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black text-slate-900 focus:border-amber-500 focus:bg-white outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Strata (PLN)</label>
                <input
                  type="number" step="0.01" name="bakeryLoss" value={formData.bakeryLoss} onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black text-rose-500 focus:border-rose-500 focus:bg-white outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Cukiernia Card */}
          <div className="bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-sm space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700 opacity-50"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🍰</div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Cukiernia</h3>
            </div>
            <div className="space-y-6 relative z-10">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Sprzedaż (PLN)</label>
                <input
                  type="number" step="0.01" name="pastrySales" value={formData.pastrySales} onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black text-slate-900 focus:border-indigo-500 focus:bg-white outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Strata (PLN)</label>
                <input
                  type="number" step="0.01" name="pastryLoss" value={formData.pastryLoss} onChange={handleInputChange}
                  placeholder="0.00"
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black text-rose-500 focus:border-rose-500 focus:bg-white outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4">
          {status === 'success' && (
            <div className="flex items-center gap-2 text-emerald-600 font-black uppercase text-xs tracking-widest animate-bounce">
              <CheckCircle2 size={20} /> Raport zapisany pomyślnie
            </div>
          )}
          <button
            type="submit"
            disabled={status === 'saving'}
            className={`flex items-center justify-center gap-3 px-12 py-6 rounded-2xl font-black text-xl shadow-2xl transition-all active:scale-95 ${
              status === 'saving' 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-slate-900 text-white hover:bg-amber-600 shadow-slate-900/20'
            }`}
          >
            <Save size={24} />
            {status === 'saving' ? 'PRZETWARZANIE...' : 'ZAPISZ RAPORT'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DataEntry;
