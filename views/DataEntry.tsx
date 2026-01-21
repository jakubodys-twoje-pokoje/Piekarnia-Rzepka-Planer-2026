
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
    locationId: user.default_location_id,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    
    // Symulacja zapisu do Supabase
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
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Raport Dzienny</h1>
        <p className="text-lg text-slate-500 font-medium">Wprowadź dane sprzedaży i strat z kasy.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sekcja Wyboru: Data i Punkt */}
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
            <p className="text-xs text-slate-400 ml-1">Obsługuje również niedziele pracujące.</p>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">Punkt Sprzedaży</label>
            <select
              name="locationId"
              value={formData.locationId}
              onChange={handleInputChange}
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 focus:bg-white outline-none transition-all text-xl font-bold text-slate-800 appearance-none"
              required
            >
              {LOCATIONS.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dane Finansowe - Układ dwukolumnowy na tablecie */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Piekarnia */}
          <div className="bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                🍞
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Piekarnia</h3>
                <p className="text-sm text-slate-400 font-bold">Pieczywo i chleby</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Sprzedaż (PLN)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    name="bakerySales"
                    placeholder="0,00"
                    value={formData.bakerySales}
                    onChange={handleInputChange}
                    className="w-full pl-6 pr-14 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black text-emerald-600 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-200"
                    required
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-slate-300">zł</span>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Strata (PLN)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    name="bakeryLoss"
                    placeholder="0,00"
                    value={formData.bakeryLoss}
                    onChange={handleInputChange}
                    className="w-full pl-6 pr-14 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black text-rose-600 focus:border-rose-500 focus:bg-white outline-none transition-all placeholder:text-slate-200"
                    required
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-slate-300">zł</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cukiernia */}
          <div className="bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-pink-100 text-pink-700 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                🍰
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">Cukiernia</h3>
                <p className="text-sm text-slate-400 font-bold">Wyroby słodkie</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Sprzedaż (PLN)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    name="pastrySales"
                    placeholder="0,00"
                    value={formData.pastrySales}
                    onChange={handleInputChange}
                    className="w-full pl-6 pr-14 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black text-emerald-600 focus:border-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-200"
                    required
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-slate-300">zł</span>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Strata (PLN)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    name="pastryLoss"
                    placeholder="0,00"
                    value={formData.pastryLoss}
                    onChange={handleInputChange}
                    className="w-full pl-6 pr-14 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-2xl font-black text-rose-600 focus:border-rose-500 focus:bg-white outline-none transition-all placeholder:text-slate-200"
                    required
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-slate-300">zł</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pasek statusu i przycisk - stały na dole na tabletach dla łatwego dostępu */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-slate-200 md:relative md:bg-transparent md:border-none md:p-0 md:pt-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="hidden sm:block">
              {status === 'success' && (
                <div className="flex items-center gap-2 text-emerald-700 font-bold animate-bounce">
                  <CheckCircle2 size={24} /> Raport zapisany!
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={status === 'saving'}
              className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-12 py-6 rounded-2xl font-black text-xl shadow-2xl transition-all active:scale-95 ${
                status === 'saving' 
                  ? 'bg-slate-200 text-slate-400' 
                  : 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-600/30'
              }`}
            >
              <Save size={24} />
              {status === 'saving' ? 'PRZETWARZANIE...' : 'ZAPISZ RAPORT'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DataEntry;
