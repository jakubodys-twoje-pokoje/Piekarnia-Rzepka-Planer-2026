
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
import { Loader2, AlertTriangle, Database } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  const fetchProfile = async (sessionUser: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .maybeSingle();

      if (error) {
        if (error.code === 'PGRST116') {
           // To nie jest błąd, po prostu brak profilu - stworzymy go zaraz
        } else {
           throw error;
        }
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
        // Próba stworzenia profilu jeśli nie istnieje
        const { data: newProfile, error: insertError } = await supabase.from('profiles').insert({
          id: sessionUser.id,
          email: sessionUser.email,
          role: 'user'
        }).select().single();
        
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
      console.error("Database fetch error:", err);
      setDbError(err.message || "Błąd zapytania o schemat bazy danych.");
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) fetchProfile(session.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) fetchProfile(session.user);
      else setUser(null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
        <h1 className="text-2xl font-black text-slate-900 uppercase mb-4 tracking-tight">Błąd Schematu Bazy Danych</h1>
        <p className="max-w-md text-slate-500 mb-8 font-medium">
          System nie może odnaleźć wymaganych tabel. Prawdopodobnie nie uruchomiłeś skryptu SQL w Supabase Dashboard.<br/>
          <span className="text-rose-500 font-bold block mt-4">Szczegóły: {dbError}</span>
        </p>
        <div className="flex gap-4">
          <button onClick={() => window.location.reload()} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all">Odśwież</button>
          <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="px-8 py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">Otwórz Supabase</a>
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
