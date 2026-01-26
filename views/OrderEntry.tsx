
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, Truck, Save, 
  Loader2, CheckCircle2, 
  PackageCheck, Banknote
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

  useEffect(() => {
    const fetchInv = async () => {
      setLoading(true);
      const { data } = await supabase.from('inventory').select('*').eq('is_active', true);
      
      // Zaawansowane sortowanie: Piekarnia -> Cukiernia -> Kod (numerycznie) -> Nazwa
      const sorted = (data || []).sort((a, b) => {
        // 1. Sekcja (Piekarnia przed Cukiernią)
        if (a.section !== b.section) return a.section === 'Piekarnia' ? -1 : 1;

        // 2. Kody (numerycznie jeśli to możliwe)
        const codeA = a.code || '';
        const codeB = b.code || '';
        
        if (codeA && codeB) {
          const numA = parseInt(codeA.split('/')[0]);
          const numB = parseInt(codeB.split('/')[0]);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return codeA.localeCompare(codeB);
        }
        
        // Produkty z kodem wyżej niż te bez kodu
        if (codeA) return -1;
        if (codeB) return 1;

        // 3. Alfabetycznie (głównie dla Cukierni bez kodów)
        return a.name.localeCompare(b.name);
      });

      setInventory(sorted);
      setLoading(false);
    };
    fetchInv();
  }, []);

  const categorizedItems = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    inventory.forEach(item => {
      const key = `${item.section} - ${item.category}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });
    return grouped;
  }, [inventory]);

  const handleQtyChange = (id: string, val: string) => {
    const num = parseInt(val);
    setQuantities(prev => ({ ...prev, [id]: isNaN(num) ? 0 : num }));
  };

  const submitOrder = async () => {
    const itemsToOrder = Object.entries(quantities).filter(([_, qty]) => qty > 0);
    if (itemsToOrder.length === 0) return alert('Wpisz ilości dla wybranych produktów.');

    setStatus('saving');
    try {
      const { data: order, error: orderErr } = await supabase.from('orders').insert({
        location_id: user.default_location_id,
        user_id: user.id,
        delivery_date: deliveryDate,
        status: 'pending'
      }).select().single();

      if (orderErr) throw orderErr;

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  if (loading) return (
    <div className="p-40 flex flex-col items-center justify-center gap-4">
      <Loader2 size={64} className="animate-spin text-amber-500" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ładowanie pełnej listy towarów...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-32 max-w-5xl mx-auto">
      {/* Sticky Header with Actions */}
      <div className="sticky top-4 z-[100] bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] border border-slate-200 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-900 text-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
             <ShoppingBag size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">Formularz Zamówienia</h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Status: {user.default_location_id ? 'Połączono z punktem' : 'Brak przypisania'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-3 flex-1 md:flex-none">
             <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Dostawa:</span>
             <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="bg-transparent font-black text-slate-900 text-xs outline-none" />
          </div>
          <button 
            onClick={submitOrder}
            disabled={status === 'saving'}
            className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all flex items-center gap-2 shadow-xl active:scale-95 disabled:opacity-50"
          >
            {status === 'saving' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14}/>}
            Zatwierdź i Wyślij
          </button>
        </div>
      </div>

      {/* Main List - Full View */}
      <div className="space-y-16">
        {Object.entries(categorizedItems).map(([category, items]) => (
          <div key={category} className="space-y-6">
            <div className="flex items-center gap-4 px-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${category.startsWith('Piekarnia') ? 'bg-amber-100 text-amber-700' : 'bg-pink-100 text-pink-700'}`}>
                {category.startsWith('Piekarnia') ? '🍞' : '🍰'}
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.25em]">{category}</h3>
              <div className="h-[1px] bg-slate-100 flex-1"></div>
              <span className="text-[10px] font-bold text-slate-300 uppercase">{items.length} poz.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-[1.8rem] border border-slate-100 hover:border-amber-500/30 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center font-black text-slate-400 group-hover:text-amber-500 transition-colors text-[10px] shrink-0">{item.code || '•'}</div>
                    <span className="text-[12px] font-black text-slate-700 uppercase tracking-tight truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100 focus-within:border-amber-500 transition-all shrink-0">
                    <input 
                      type="number" 
                      min="0"
                      placeholder="0"
                      value={quantities[item.id] || ''}
                      onChange={e => handleQtyChange(item.id, e.target.value)}
                      className="w-12 bg-transparent text-center font-black text-slate-900 outline-none text-sm p-1"
                    />
                    <span className="text-[8px] font-black text-slate-300 pr-2">SZT</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {status === 'success' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl animate-in fade-in slide-in-from-bottom-8 flex items-center gap-3 border border-amber-500/50">
          <CheckCircle2 className="text-amber-500" /> Zamówienie zostało wysłane do produkcji!
        </div>
      )}
    </div>
  );
};

export default OrderEntry;
