
import React, { useState, useEffect } from 'react';
import { Send, Globe, History, User, Loader2, AlertCircle, MessageSquareOff } from 'lucide-react';
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
  const [tableExists, setTableExists] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [{ data: locData }, { data: msgData, error: msgError }] = await Promise.all([
        supabase.from('locations').select('*').order('name'),
        supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(20)
      ]);

      if (msgError && msgError.code === '42P01') {
        setTableExists(false);
      } else {
        setMessages(msgData || []);
      }
      setLocations(locData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !tableExists) return;
    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          sender_id: user.id,
          recipient_location_id: recipient === 'all' ? null : recipient,
          content: content,
          is_read: false
        }]);
      if (error) throw error;
      setContent('');
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Błąd podczas wysyłania: Upewnij się, że tabela "messages" istnieje w bazie.');
    } finally {
      setSending(false);
    }
  };

  if (!tableExists && !loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-6 animate-in fade-in">
       <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center shadow-inner">
         <MessageSquareOff size={48} />
       </div>
       <div className="max-w-md">
         <h2 className="text-2xl font-black text-slate-900 uppercase">Brak modułu komunikacji</h2>
         <p className="text-slate-500 font-medium mt-2">Tabela "messages" nie została jeszcze utworzona w Twojej bazie Supabase. Skontaktuj się z administratorem, aby dodać moduł komunikatów.</p>
       </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {isAdmin && (
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-slate-800">Nowy Komunikat</h2>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Odbiorca</label>
                <select value={recipient} onChange={(e) => setRecipient(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm">
                  <option value="all">🌍 Wszyscy (Broadcast)</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Treść</label>
                <textarea rows={6} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Napisz wiadomość..." className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-medium text-sm"></textarea>
              </div>
              <button type="submit" disabled={sending} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-600 transition-all shadow-xl disabled:opacity-50">
                {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                Wyślij Komunikat
              </button>
            </form>
          </div>
        </div>
      )}

      <div className={`${isAdmin ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-6`}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Odebrane wiadomości</h2>
          <History size={18} className="text-slate-300" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-amber-500" size={32} /></div>
        ) : (
          <div className="space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400"><User size={20} /></div>
                    <div>
                      <p className="text-[10px] font-black text-slate-900 uppercase">System Rzepka</p>
                      <p className="text-[9px] font-bold text-slate-400">{new Date(msg.created_at).toLocaleString('pl-PL')}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-black uppercase text-slate-500">
                    {msg.recipient_location_id ? locations.find(l => l.id === msg.recipient_location_id)?.name : '🌍 Global'}
                  </span>
                </div>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">{msg.content}</p>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                <AlertCircle size={48} className="mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">Brak wiadomości</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
