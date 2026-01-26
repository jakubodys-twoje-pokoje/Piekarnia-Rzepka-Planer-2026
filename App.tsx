
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
import { Loader2, Database, RefreshCw } from 'lucide-react';

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

      if (error) throw error;

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
        // Jeśli profil nie istnieje (jeszcze nie stworzony przez trigger)
        setUser({
          id: sessionUser.id,
          email: sessionUser.email,
          role: 'user',
          first_name: null,
          last_name: null,
          default_location_id: null
        });
      }
      setDbError(null);
    } catch (err: any) {
      console.error("Profile Load Error:", err);
      // Nawet jeśli profil sypie błędem RLS, dajemy dostęp podstawowy
      setUser({
        id: sessionUser.id,
        email: sessionUser.email,
        role: 'user',
        first_name: null,
        last_name: null,
        default_location_id: null
      });
    } finally {
      setLoading(false);
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

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-900 gap-4">
      <Loader2 className="animate-spin text-amber-500" size={40} />
      <p className="text-[10px] font-black text-amber-500/50 uppercase tracking-[0.4em]">Inicjalizacja Systemu</p>
    </div>
  );

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
