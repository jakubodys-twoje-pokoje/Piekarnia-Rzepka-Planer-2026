
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
import Login from './views/Login';
import { supabase } from './supabase';
import { Loader2, AlertTriangle } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);

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
        // Jeśli profil nie istnieje, tworzymy go w locie
        const { data: newProfile } = await supabase.from('profiles').insert({
          id: sessionUser.id,
          email: sessionUser.email,
          role: 'user'
        }).select().single();
        
        setUser({
          id: sessionUser.id,
          email: sessionUser.email,
          role: newProfile?.role || 'user',
          first_name: null,
          last_name: null,
          default_location_id: null
        });
      }
      setDbError(false);
    } catch (err) {
      console.error("Database fetch error:", err);
      setDbError(true);
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
    <div className="h-screen flex items-center justify-center bg-slate-900">
      <Loader2 className="animate-spin text-amber-500" size={40} />
    </div>
  );

  if (dbError && user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-50 p-8 text-center">
        <AlertTriangle size={64} className="text-rose-500 mb-6" />
        <h1 className="text-2xl font-black text-slate-900 uppercase mb-4">Błąd połączenia z bazą</h1>
        <p className="max-w-md text-slate-500 mb-8 font-medium">System nie może pobrać Twojego profilu. Upewnij się, że tabele w Supabase zostały poprawnie utworzone skryptem SQL.</p>
        <button onClick={() => window.location.reload()} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all">Odśwież System</button>
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
      default: return <Dashboard user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        isOpen={true} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        userRole={user.role} 
        onLogout={() => supabase.auth.signOut()}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onToggleSidebar={() => {}} user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
};

export default App;
