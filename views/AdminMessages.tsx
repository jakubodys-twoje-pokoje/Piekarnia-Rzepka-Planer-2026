
import React, { useState, useEffect, useMemo } from 'react';
import { Send, Globe, History, User, Loader2, MessageSquare, CheckCircle, Mail, ShieldAlert, Archive } from 'lucide-react';
import { UserProfile } from '../types';
import { supabase } from '../supabase';

interface AdminMessagesProps {
  user: UserProfile;
}

const AdminMessages: React.FC<AdminMessagesProps> = ({ user }) => {
  const isAdmin = user.role === 'admin';
  const [recipient, setRecipient] = useState('all');
  const [content, setContent] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [viewTab, setViewTab] = useState<'unread' | 'history'>('unread');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: locData }, { data: msgData }] = await Promise.all([
        supabase.from('locations').select('*').order('name'),
        supabase.from('messages').select('*, profiles(first_name, last_name, role)').order('created_at', { ascending: false })
      ]);

      setLocations(locData || []);
      setMessages(msgData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Filtrowanie wiadomości na podstawie uprawnień i statusu
  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      const isForMe = isAdmin 
        ? msg.to_admin 
        : (msg.recipient_location_id === null || msg.recipient_location_id === user.default_location_id) && !msg.to_admin;
      
      const statusMatch = viewTab === 'unread' ? !msg.is_read : msg.is_read;
      
      // Jeśli jestem wysyłającym, zawsze widzę w historii
      const sentByMe = msg.sender_id === user.id;

      if (viewTab === 'history') {
        return (isForMe && msg.is_read) || sentByMe;
      }
      return isForMe && !msg.is_read && !sentByMe;
    });
  }, [messages, viewTab, user.id, user.default_location_id, isAdmin]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      const payload = {
        sender_id: user.id,
        recipient_location_id: isAdmin ? (recipient === 'all' ? null : recipient) : null,
        to_admin: !isAdmin,
        content: content,
        is_read: false
      };
      
      const { error } = await supabase.from('messages').insert([payload]);
      if (error) throw error;
      
      setContent('');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Błąd wysyłania wiadomości.');
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (msgId: string) => {
    try {
      const { error } = await supabase.from('messages').update({ is_read: true }).eq('id', msgId);
      if (error) throw error;
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, is_read: true } : m));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      {/* Formularz Wysyłania */}
      <div className="lg:col-span-1">
        <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm sticky top-8">
          <div className="flex items-center gap-3 mb-8">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isAdmin ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
              <Mail size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Nowa Wiadomość</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isAdmin ? 'Komunikat Sieciowy' : 'Kontakt z Zarządem'}</p>
            </div>
          </div>

          <form onSubmit={handleSend} className="space-y-6">
            {isAdmin ? (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adresat</label>
                <select value={recipient} onChange={(e) => setRecipient(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm">
                  <option value="all">🌍 CAŁA SIEĆ (Broadcast)</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Odbiorca</p>
                 <p className="text-sm font-black text-slate-700">🏢 BIURO / ZARZĄD RZEPKA</p>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Treść komunikatu</label>
              <textarea rows={5} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Wpisz treść..." className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-medium text-sm focus:border-amber-500 transition-all"></textarea>
            </div>

            <button type="submit" disabled={sending || !content.trim()} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-amber-600 transition-all shadow-xl disabled:opacity-30">
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {isAdmin ? 'PUBLIKUJ KOMUNIKAT' : 'WYŚLIJ DO BIURA'}
            </button>
          </form>
        </div>
      </div>

      {/* Lista Wiadomości */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-200">
           <div className="flex gap-2">
             <button onClick={() => setViewTab('unread')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewTab === 'unread' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                Nieprzeczytane
             </button>
             <button onClick={() => setViewTab('history')} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewTab === 'history' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                Archiwum / Historia
             </button>
           </div>
           <button onClick={fetchData} className="p-2 text-slate-300 hover:text-slate-900"><History size={18}/></button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-500" size={32} /></div>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map(msg => (
              <div key={msg.id} className={`bg-white p-8 rounded-[3rem] border shadow-sm transition-all group ${!msg.is_read ? 'border-amber-500/30 ring-4 ring-amber-500/5' : 'border-slate-100'}`}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${msg.profiles?.role === 'admin' ? 'bg-slate-900' : 'bg-amber-500'}`}>
                      {msg.profiles?.role === 'admin' ? <ShieldAlert size={24} /> : <User size={24} />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                        {msg.profiles?.first_name ? `${msg.profiles.first_name} ${msg.profiles.last_name}` : 'Nadawca Systemowy'}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{new Date(msg.created_at).toLocaleString('pl-PL')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {msg.to_admin && <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[8px] font-black uppercase rounded-full border border-rose-100 tracking-widest">Wiadomość do Biura</span>}
                    {!msg.is_read && msg.sender_id !== user.id && (
                      <button 
                        onClick={() => markAsRead(msg.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                      >
                        <CheckCircle size={14} /> Potwierdź odbiór
                      </button>
                    )}
                    {msg.recipient_location_id && (
                       <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[8px] font-black uppercase rounded-full border border-slate-100 tracking-widest">
                         Lokalizacja: {locations.find(l => l.id === msg.recipient_location_id)?.name}
                       </span>
                    )}
                  </div>
                </div>
                
                <div className="relative pl-6 border-l-4 border-slate-100 py-2">
                  <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>

                {msg.sender_id === user.id && (
                  <div className="mt-6 flex items-center gap-2 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                    <Archive size={12} /> Twoja wysłana wiadomość
                  </div>
                )}
              </div>
            ))}
            
            {filteredMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3.5rem] border border-dashed border-slate-200">
                <MessageSquare size={48} className="text-slate-100 mb-4" />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-300">Brak wiadomości w tej sekcji</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
