
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { LOCATIONS } from '../constants';
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
    
    // Simulating authentication
    setTimeout(() => {
      const isAdmin = email.includes('admin');
      onLogin({
        id: Math.random().toString(),
        email: email || (isAdmin ? 'admin@rzepka.pl' : 'user@rzepka.pl'),
        role: isAdmin ? 'admin' : 'user',
        default_location_id: '1', // Default to JĘDRZYCHÓW
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Piekarnia Rzepka</h1>
          <p className="text-slate-500 font-medium tracking-tight">System Zarządzania Przychodami 2026</p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  placeholder="name@rzepka.pl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Hasło</label>
              <div className="relative">
                <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all font-medium"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
                <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">Zapamiętaj mnie</span>
              </label>
              <button type="button" className="text-sm font-bold text-amber-700 hover:text-amber-800">Zapomniałeś hasła?</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={20} />
                  Zaloguj się
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col gap-4">
             <div className="text-center text-xs text-slate-400">DEMO ROLES</div>
             <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setEmail('admin@rzepka.pl')}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                >
                  ADMIN ACCOUNT
                </button>
                <button 
                  onClick={() => setEmail('user@rzepka.pl')}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                >
                  USER ACCOUNT
                </button>
             </div>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-400 text-sm">
          &copy; 2026 Piekarnia Rzepka. Wszystkie prawa zastrzeżone.
        </p>
      </div>
    </div>
  );
};

export default Login;
