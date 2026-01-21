
import React from 'react';
import { UserProfile, DailyReport, Target } from '../types';
// Added MessageSquare to imports from lucide-react
import { TrendingUp, TrendingDown, DollarSign, Package, MapPin, Award, MessageSquare } from 'lucide-react';
import { LOCATIONS } from '../constants';

interface DashboardProps {
  user: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const isAdmin = user.role === 'admin';

  // Mock data for display
  const stats = [
    { label: 'Sprzedaż Dzisiaj', value: '14,090.91 zł', icon: <DollarSign size={20} />, color: 'bg-emerald-50 text-emerald-600', trend: '+12%', isUp: true },
    { label: 'Strata Dzisiaj', value: '1,240.50 zł', icon: <TrendingDown size={20} />, color: 'bg-rose-50 text-rose-600', trend: '-2%', isUp: false },
    { label: 'Wykonanie Budżetu', value: '84.2%', icon: <Award size={20} />, color: 'bg-amber-50 text-amber-600', trend: '+5.4%', isUp: true },
    { label: 'Top Lokalizacja', value: 'JĘDRZYCHÓW', icon: <MapPin size={20} />, color: 'bg-blue-50 text-blue-600' },
  ];

  const messages = [
    { id: '1', sender: 'Admin', content: 'Pamiętajcie o wpisywaniu strat przed 21:00!', time: '10 min temu' },
    { id: '2', sender: 'System', content: 'Nowe cele sprzedażowe na Luty są już dostępne.', time: '2 godz temu' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Witaj, {user.email.split('@')[0]} 👋
        </h1>
        <p className="text-slate-500">Oto podsumowanie dla punktu {LOCATIONS.find(l => l.id === user.default_location_id)?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
              {stat.trend && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.isUp ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {stat.trend}
                </span>
              )}
            </div>
            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Progress */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Wykonanie Budżetu Miesiaca</h2>
            <select className="bg-slate-50 border border-slate-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none">
              <option>Bieżący Miesiąc (Styczeń)</option>
              <option>Poprzedni Miesiąc</option>
            </select>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Piekarnia (Sprzedaż)</span>
                <span className="text-sm font-bold text-slate-900">74,200 / 130,000 zł (57%)</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: '57%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Cukiernia (Sprzedaż)</span>
                <span className="text-sm font-bold text-slate-900">124,500 / 180,000 zł (69%)</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: '69%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Piekarnia (Strata - Limit 5%)</span>
                <span className="text-sm font-bold text-slate-900">3.2%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full transition-all duration-1000" style={{ width: '64%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages / Notifications */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <MessageSquare size={20} className="text-amber-600" />
            Wiadomości od Administracji
          </h2>
          <div className="space-y-4 flex-1">
            {messages.map(msg => (
              <div key={msg.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100 relative group transition-colors hover:bg-amber-50/50">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">{msg.sender}</p>
                <p className="text-sm text-slate-700 leading-relaxed">{msg.content}</p>
                <span className="text-[10px] text-slate-400 mt-2 block">{msg.time}</span>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full py-2.5 text-slate-600 hover:text-slate-800 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            Zobacz wszystkie
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
