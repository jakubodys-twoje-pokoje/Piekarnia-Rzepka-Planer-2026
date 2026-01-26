
import React, { useState } from 'react';
import { UserProfile, Role } from '../types';
import { LogIn, Shield, User, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Niepoprawny e-mail lub hasło.');
        }
        throw authError;
      }

      if (authData.user) {
        let { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, role, default_location_id')
          .eq('id', authData.user.id)
          .single();

        if (profileError && profileError.code === 'PGRST116') {
          // Tworzymy profil bez kolumny email, bo rzuca błąd w schemacie
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: authData.user.id,
              role: 'user',
              default_location_id: '1'
            }])
            .select()
            .single();
            
          if (createError) throw createError;
          profileData = newProfile;
        } else if (profileError) {
          throw profileError;
        }

        if (profileData) {
          onLogin({
            id: profileData.id,
            email: authData.user.email || '',
            role: profileData.role as Role,
            default_location_id: profileData.default_location_id,
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Wystąpił nieoczekiwany błąd logowania.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-28 h-28 bg-white rounded-[2.5rem] p-1.5 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-600/20 rotate-3 overflow-hidden border-4 border-amber-600">
            <img 
              src="https://stronyjakubowe.pl/wp-content/uploads/2026/01/89358602_111589903786829_6313621308307406848_n.jpg" 
              alt="Piekarnia Rzepka Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">Piekarnia Rzepka</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">System Zarządzania Przychodami</p>
        </div>

        <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-2xl relative overflow-hidden animate-in zoom-in duration-500 delay-100">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-amber-600"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold animate-in shake duration-300">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Konto Pracownika</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="email"
                  placeholder="nazwisko@rzepka.pl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-amber-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Hasło Dostępu</label>
              <div className="relative">
                <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:border-amber-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-amber-600 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <LogIn size={20} />
                  Zaloguj do bazy
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">
          &copy; 2026 Piekarnia Rzepka &middot; v2.2.2-stable
        </p>
      </div>
    </div>
  );
};

export default Login;
