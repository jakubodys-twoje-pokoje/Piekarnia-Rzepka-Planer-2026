
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { LogIn, Shield, User } from 'lucide-react';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Symulacja autoryzacji: Każdy mail ze słowem 'admin' dostaje uprawnienia admina
    setTimeout(() => {
      const isAdmin = email.toLowerCase().includes('admin');
      onLogin({
        id: Math.random().toString(36).substr(2, 9),
        email: email || (isAdmin ? 'admin@rzepka.pl' : 'pracownik@rzepka.pl'),
        role: isAdmin ? 'admin' : 'user',
        default_location_id: '1',
      });
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-6 shadow-xl shadow-amber-600/30">
            R
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Piekarnia Rzepka</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">System Zarządzania Przychodami</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Służbowy</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="email"
                  placeholder="nazwisko@rzepka.pl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 outline-none transition-all font-bold text-slate-700"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hasło</label>
              <div className="relative">
                <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-amber-500 outline-none transition-all font-bold text-slate-700"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-600 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={18} />
                  Wejdź do systemu
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
             <div className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">Konta Testowe</div>
             <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setEmail('admin@rzepka.pl')}
                  className="px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-[10px] font-black text-slate-500 hover:bg-amber-500 hover:text-white hover:border-amber-500 transition-all uppercase"
                >
                  Admin
                </button>
                <button 
                  onClick={() => setEmail('pracownik@rzepka.pl')}
                  className="px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-[10px] font-black text-slate-500 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all uppercase"
                >
                  Pracownik
                </button>
             </div>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          &copy; 2026 Piekarnia Rzepka &middot; V2.0.4
        </p>
      </div>
    </div>
  );
};

export default Login;
