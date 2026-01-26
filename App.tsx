
import React, { useState, useEffect } from 'react';
import { UserProfile, Role } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './views/Dashboard';
import DataEntry from './views/DataEntry';
import HistoryView from './views/History';
import AdminBudgets from './views/AdminBudgets';
import AdminUsers from './views/AdminUsers';
import AdminMessages from './views/AdminMessages';
import AdminReportsSimple from './views/AdminReportsSimple';
import AdminReportsAdvanced from './views/AdminReportsAdvanced';
import AdminReports from './views/AdminReports';
import AdminLocations from './views/AdminLocations';
import Login from './views/Login';
import { supabase } from './supabase';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await syncUser(session.user.id, session.user.email || '');
      }
      setInitializing(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await syncUser(session.user.id, session.user.email || '');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setActiveTab('dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncUser = async (userId: string, email: string) => {
    try {
      // 1. Sprawdź czy profil istnieje
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const isAdmin = email.includes('admin') || profile?.role === 'admin';
      const role: Role = isAdmin ? 'admin' : 'user';

      // 2. Jeśli nie ma profilu, stwórz go
      if (!profile) {
        const { data: locations } = await supabase.from('locations').select('id').limit(1);
        const defaultLocId = locations?.[0]?.id || null;

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({ id: userId, role, default_location_id: defaultLocId })
          .select()
          .single();
        
        profile = newProfile;
      }

      setUser({
        id: userId,
        email,
        role: profile?.role || role,
        default_location_id: profile?.default_location_id
      });
    } catch (err) {
      console.error("Critical User Sync Error:", err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (initializing) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 size={40} className="animate-spin text-amber-600 mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inicjalizacja Systemu Rzepka...</p>
      </div>
    );
  }

  if (!user) return <Login onLogin={() => {}} />;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={user} />;
      case 'entry': return <DataEntry user={user} />;
      case 'history': return <HistoryView user={user} />;
      case 'budgets': return <AdminBudgets />;
      case 'users': return <AdminUsers />;
      case 'locations': return <AdminLocations />;
      case 'messages': return <AdminMessages user={user} />;
      case 'reports-simple': return <AdminReportsSimple />;
      case 'reports-monthly': return <AdminReportsAdvanced mode="monthly" />;
      case 'reports-yearly': return <AdminReportsAdvanced mode="yearly" />;
      case 'reports-data': return <AdminReports />;
      default: return <Dashboard user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        isOpen={isSidebarOpen} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        userRole={user.role} 
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default App;
