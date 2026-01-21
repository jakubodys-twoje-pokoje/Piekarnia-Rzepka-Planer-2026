
import React, { useState } from 'react';
import { Send, MapPin, Globe, History, User } from 'lucide-react';
import { LOCATIONS } from '../constants';
import { UserProfile } from '../types';

interface AdminMessagesProps {
  user: UserProfile;
}

const AdminMessages: React.FC<AdminMessagesProps> = ({ user }) => {
  const isAdmin = user.role === 'admin';
  const [recipient, setRecipient] = useState('all');
  const [message, setMessage] = useState('');

  // Mock messages
  const messages = [
    { id: '1', sender: 'Zarząd', date: '2026-01-21 08:30', recipient: 'Wszystkie punkty', content: 'Dzień dobry! Od dzisiaj zaczynamy promocję na chleb wiejski. Pamiętajcie o odpowiedniej ekspozycji!' },
    { id: '2', sender: 'Anna Nowak (Admin)', date: '2026-01-20 16:45', recipient: 'JĘDRZYCHÓW', content: 'Dostawa serników przyjedzie jutro o 7:00 zamiast o 6:00. Proszę o cierpliwość.' },
    { id: '3', sender: 'System', date: '2026-01-19 21:05', recipient: 'Wszystkie punkty', content: 'Raporty za dzień 19.01 zostały pomyślnie zarchiwizowane.' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Messaging Control (Only for Admin) */}
      {isAdmin && (
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Nowy Komunikat</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Odbiorca</label>
                <div className="relative">
                  <select 
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none font-medium appearance-none"
                  >
                    <option value="all">Wszyscy (Broadcast)</option>
                    {LOCATIONS.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                  <Globe size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Treść wiadomości</label>
                <textarea
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Napisz wiadomość do pracowników..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 outline-none resize-none font-medium"
                ></textarea>
              </div>

              <button className="w-full bg-amber-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20 active:scale-[0.98]">
                <Send size={18} />
                Wyślij Komunikat
              </button>
            </div>
          </div>

          <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 flex items-start gap-4">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0">
              <Globe size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">Komunikacja w czasie rzeczywistym</p>
              <p className="text-xs text-amber-700/80 leading-relaxed mt-1">Wiadomości wysłane jako 'Wszyscy' pojawią się natychmiast na dashboardzie każdego zalogowanego pracownika.</p>
            </div>
          </div>
        </div>
      )}

      {/* Message Feed */}
      <div className={`${isAdmin ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Historia Komunikatów</h2>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <History size={16} />
            Ostatnie 30 dni
          </div>
        </div>

        <div className="space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-200 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{msg.sender}</p>
                    <p className="text-xs text-slate-500">{msg.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-500 border border-slate-100">
                  <MapPin size={10} />
                  {msg.recipient}
                </div>
              </div>
              <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-line">
                {msg.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminMessages;
