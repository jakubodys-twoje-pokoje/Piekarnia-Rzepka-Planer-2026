
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, Truck, Calendar, Save, 
  Loader2, AlertCircle, CheckCircle2, ChevronRight,
  ArrowLeft, Search, PackageCheck
} from 'lucide-react';
import { supabase } from '../supabase';
import { UserProfile } from '../types';

const OrderEntry: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchInv = async () => {
      setLoading(true);
      const { data } = await supabase.from('inventory').select('*').eq('is_active', true).order('section').order('category');
      setInventory(data || []);
      setLoading(false);
    };
    fetchInv();
  }, []);

  const categorizedItems = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    inventory.forEach(item => {
      const key = `${item.section} - ${item.category}`;
      if (!grouped[key]) grouped[key] = [];
      if (item.name.toLowerCase().includes(search.toLowerCase())) {
        grouped[key].push(item);
      }
    });
    return grouped;
  }, [inventory, search]);

  const handleQtyChange = (id: string, val: string) => {
    const num = parseInt(val);
    setQuantities(prev => ({ ...prev, [id]: isNaN(num) ? 0 : num }));
  };

  const submitOrder = async () => {
    const itemsToOrder = Object.entries(quantities).filter(([_, qty]) => qty > 0);
    if (itemsToOrder.length === 0) return alert('Wpisz ilości dla wybranych produktów.');

    setStatus('saving');
    try {
      // 1. Stwórz nagłówek zamówienia
      const { data: order, error: orderErr } = await supabase.from('orders').insert({
        location_id: user.default_location_id,
        user_id: user.id,
        delivery_date: deliveryDate,
        status: 'pending'
      }).select().single();

      if (orderErr) throw orderErr;

      // 2. Wstaw pozycje
      const itemsPayload = itemsToOrder.map(([pid, qty]) => ({
        order_id: order.id,
        product_id: pid,
        quantity: qty
      }));

      const { error: itemsErr } = await supabase.from('order_items').insert(itemsPayload);
      if (itemsErr) throw itemsErr;

      setStatus('success');
      setQuantities({});
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  if (loading) return <div className="p-40 flex justify-center"><Loader2 size={48} className="animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-8 pb-24 max-w-4xl mx-auto">
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none mb-2">Nowe Zamówienie</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Punkt: {user.default_location_id || 'Zaloguj się do punktu'}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 flex flex-col items-end">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Dostawa na dzień:</span>
            <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="bg-transparent font-black text-slate-900 text-sm outline-none" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm relative sticky top-4 z-20">
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input 
            type="text" 
            placeholder="Wpisz nazwę szukanego towaru..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-40 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white focus:border-amber-500 transition-all text-sm"
          />
          <button 
            onClick={submitOrder}
            disabled={status === 'saving'}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all flex items-center gap-2"
          >
            {status === 'saving' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14}/>}
            Wyślij zamówienie
          </button>
        </div>
      </div>

      <div className="space-y-12">
        {Object.entries(categorizedItems).map(([category, items]) => (
          items.length > 0 && (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-4 ml-4">
                <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center font-black text-xs">
                  {category.charAt(0)}
                </div>
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">{category}</h3>
                <div className="h-[2px] bg-slate-100 flex-1"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map(item => (
                  <div key={item.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 hover:border-amber-500/30 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-400 group-hover:text-amber-500 transition-colors text-xs">{item.code || '•'}</div>
                      <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100 focus-within:border-amber-500 transition-all">
                      <input 
                        type="number" 
                        min="0"
                        placeholder="0"
                        value={quantities[item.id] || ''}
                        onChange={e => handleQtyChange(item.id, e.target.value)}
                        className="w-16 bg-transparent text-center font-black text-slate-900 outline-none"
                      />
                      <span className="text-[10px] font-black text-slate-300 pr-2">SZT.</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>

      {status === 'success' && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-10 py-5 rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-2xl animate-in fade-in slide-in-from-bottom-8 flex items-center gap-3">
          <CheckCircle2 /> Zamówienie wysłane pomyślnie!
        </div>
      )}
    </div>
  );
};

export default OrderEntry;
