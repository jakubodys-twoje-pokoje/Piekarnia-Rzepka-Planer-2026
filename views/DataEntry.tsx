
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { LOCATIONS } from '../constants';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';

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
    
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      // Reset form sales but keep date/location
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
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Wprowadź Raport Dzienny</h1>
          <p className="text-slate-500">Uzupełnij dane sprzedażowe dla wybranego punktu.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-xl border border-slate-100">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Data raportu</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Punkt sprzedaży</label>
              <select
                name="locationId"
                value={formData.locationId}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                required
              >
                {LOCATIONS.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Bakery Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center">
                  🍞
                </div>
                <h3 className="font-bold text-slate-800">Sekcja: Piekarnia</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Sprzedaż (PLN)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="bakerySales"
                    placeholder="0.00"
                    value={formData.bakerySales}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Strata (PLN)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="bakeryLoss"
                    placeholder="0.00"
                    value={formData.bakeryLoss}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Pastry Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center">
                  🍰
                </div>
                <h3 className="font-bold text-slate-800">Sekcja: Cukiernia</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Sprzedaż (PLN)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="pastrySales"
                    placeholder="0.00"
                    value={formData.pastrySales}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Strata (PLN)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="pastryLoss"
                    placeholder="0.00"
                    value={formData.pastryLoss}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status === 'success' && (
              <span className="flex items-center gap-1.5 text-emerald-600 text-sm font-bold bg-emerald-50 px-3 py-1 rounded-full">
                <CheckCircle2 size={16} /> Dane zapisane pomyślnie
              </span>
            )}
            {status === 'error' && (
              <span className="flex items-center gap-1.5 text-rose-600 text-sm font-bold bg-rose-50 px-3 py-1 rounded-full">
                <AlertCircle size={16} /> Wystąpił błąd przy zapisie
              </span>
            )}
          </div>
          <button
            type="submit"
            disabled={status === 'saving'}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 ${
              status === 'saving' ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-600/20'
            }`}
          >
            <Save size={20} />
            {status === 'saving' ? 'Zapisywanie...' : 'Zapisz raport'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DataEntry;
