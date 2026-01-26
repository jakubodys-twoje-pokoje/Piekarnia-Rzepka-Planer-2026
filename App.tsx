
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
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserProfile(session.user.id, session.user.email || '');
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setInitializing(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserProfile(session.user.id, session.user.email || '');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('user_profile');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      // Pobieramy dane z profiles, ale nie prosimy o kolumnę email, która rzuca błąd
      const { data, error } = await supabase
        .from('profiles')
        .select('id, role, default_location_id')
        .eq('id', userId)
        .single();
      
      if (data) {
        const profile: UserProfile = {
          id: data.id,
          email: email, // E-mail bierzemy z sesji auth, nie z tabeli profiles
          role: data.role as Role,
          default_location_id: data.default_location_id,
        };
        setUser(profile);
        localStorage.setItem('user_profile', JSON.stringify(profile));
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
      setUser(null);
    }
  };

  if (initializing) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 size={40} className="animate-spin text-amber-600" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Autoryzacja systemu Rzepka...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={(u) => setUser(u)} />;
  }

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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          user={user} 
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
