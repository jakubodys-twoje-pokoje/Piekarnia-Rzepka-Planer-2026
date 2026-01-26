
import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './views/Dashboard';
import DataEntry from './views/DataEntry';
import HistoryView from './views/History';
import AdminLocations from './views/AdminLocations';
import AdminUsers from './views/AdminUsers';
import AdminReports from './views/AdminReports';
import AdminMessages from './views/AdminMessages';
import AdminBudgets from './views/AdminBudgets';
import AdminReportsSimple from './views/AdminReportsSimple';
import AdminReportsAdvanced from './views/AdminReportsAdvanced';
import OrderEntry from './views/OrderEntry';
import AdminOrders from './views/AdminOrders';
import AdminInventory from './views/AdminInventory';
import Login from './views/Login';
import { supabase } from './supabase';
import { Loader2, AlertTriangle, Database, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  const fetchProfile = async (sessionUser: any) => {
    try {
      // 1. Próba pobrania profilu
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .maybeSingle();

      if (error) {
        // Jeśli błąd 500/Recursion - to jest błąd RLS
        if (error.message.includes('recursion')) {
          throw new Error("Wykryto nieskończoną pętlę uprawnień. Uruchom skrypt naprawczy SQL v3.2 w Supabase.");
        }
        throw error;
      }

      if (data) {
        setUser({
          id: data.id,
          email: sessionUser.email,
          role: data.role,
          first_name: data.first_name,
          last_name: data.last_name,
          default_location_id: data.default_location_id
        });
      } else {
        // 2. Jeśli profil nie istnieje, stwórz go (Safe Insert)
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ id: sessionUser.id, email: sessionUser.email, role: 'user' })
          .select()
          .single();
        
        if (insertError) throw insertError;

        setUser({
          id: sessionUser.id,
          email: sessionUser.email,
          role: newProfile?.role || 'user',
          first_name: null,
          last_name: null,
          default_location_id: null
        });
      }
      setDbError(null);
    } catch (err: any) {
      console.error("Critical Profile Error:", err);
      setDbError(err.message || "Błąd komunikacji z bazą danych.");
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchProfile(session.user);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchProfile(session.user);
      else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user || dbError) setLoading(false);
  }, [user, dbError]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-900 gap-4">
      <Loader2 className="animate-spin text-amber-500" size={40} />
      <p className="text-[10px] font-black text-amber-500/50 uppercase tracking-[0.4em]">Inicjalizacja Systemu</p>
    </div>
  );

  if (dbError) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-8 text-center">
        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl">
          <Database size={40} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 uppercase mb-4 tracking-tight">Krytyczny Błąd Bazy Danych</h1>
        <div className="max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
           <p className="text-rose-500 font-bold text-sm mb-2">Szczegóły techniczne:</p>
           <code className="text-[10px] bg-slate-50 p-2 block rounded border border-slate-100 text-left overflow-auto">
             {dbError}
           </code>
        </div>
        <div className="flex gap-4">
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all">
            <RefreshCw size={16} /> Ponów próbę
          </button>
          <button onClick={() => supabase.auth.signOut()} className="px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">Wyloguj</button>
        </div>
      </div>
    );
  }

  if (!user) return <Login onLogin={() => {}} />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={user} />;
      case 'messages': return <AdminMessages user={user} />;
      case 'entry': return <DataEntry user={user} />;
      case 'history': return <HistoryView user={user} />;
      case 'locations': return <AdminLocations />;
      case 'users': return <AdminUsers />;
      case 'reports-data': return <AdminReports />;
      case 'budgets': return <AdminBudgets />;
      case 'analytics-simple': return <AdminReportsSimple />;
      case 'analytics-advanced': return <AdminReportsAdvanced />;
      case 'order-entry': return <OrderEntry user={user} />;
      case 'admin-orders': return <AdminOrders />;
      case 'admin-inventory': return <AdminInventory />;
      default: return <Dashboard user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <div className="no-print h-full">
        <Sidebar 
          isOpen={true} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          userRole={user.role} 
          onLogout={() => supabase.auth.signOut()}
        />
      </div>
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <div className="no-print shrink-0">
          <Header onToggleSidebar={() => {}} user={user} />
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar print:p-0 print:overflow-visible">
          <div className="max-w-7xl mx-auto print:max-w-none print:m-0">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default App;
