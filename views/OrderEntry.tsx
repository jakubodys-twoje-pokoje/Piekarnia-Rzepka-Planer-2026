
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, Save, 
  Loader2, CheckCircle2, AlertTriangle, X, MapPin, Calendar
} from 'lucide-react';
import { supabase } from '../supabase';
import { UserProfile } from '../types';

const OrderEntry: React.FC<{ user: UserProfile }> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedLocation, setSelectedLocation] = useState(user.default_location_id || '');
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [{ data: invData }, { data: locData }] = await Promise.all([
        supabase.from('inventory').select('*').eq('is_active', true),
        supabase.from('locations').select('*').order('name')
      ]);
      
      const sorted = (invData || []).sort((a, b) => {
        if (a.section !== b.section) return a.section === 'Piekarnia' ? -1 : 1;
        const codeA = a.code || '';
        const codeB = b.code || '';
        if (codeA && codeB) {
          const numA = parseInt(codeA.split('/')[0]);
          const numB = parseInt(codeB.split('/')[0]);
          if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
          return codeA.localeCompare(codeB);
        }
        if (codeA) return -1;
        if (codeB) return 1;
        return a.name.localeCompare(b.name);
      });

      setInventory(sorted);
      setLocations(locData || []);
      setLoading(false);
    };
    loadData();
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

  const handlePreSubmit = () => {
    const itemsToOrder = Object.entries(quantities).filter(([_, qty]) => qty > 0);
    if (itemsToOrder.length === 0) return alert('Wpisz ilości produktów przed wysłaniem.');
    if (!selectedLocation) return alert('Wybierz punkt sprzedaży.');
    setShowConfirm(true);
  };

  const executeSubmit = async () => {
    setShowConfirm(false);
    setStatus('saving');
    try {
      const { data: order, error: orderErr } = await supabase.from('orders').insert({
        location_id: selectedLocation,
        user_id: user.id,
        order_date: orderDate,
        delivery_date: deliveryDate,
        status: 'pending'
      }).select().single();

      if (orderErr) throw orderErr;

      const itemsPayload = Object.entries(quantities)
        .filter(([_, qty]) => qty > 0)
        .map(([pid, qty]) => ({
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
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Przygotowanie arkusza zamówienia...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-32 max-w-5xl mx-auto">
      {/* Configuration Header */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-900 text-amber-500 rounded-2xl flex items-center justify-center shadow-lg"><ShoppingBag size={28}/></div>
              <div>
                 <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Składanie Zamówienia</h1>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Uzupełnij arkusz i wyślij do produkcji</p>
              </div>
           </div>
           <button 
             onClick={handlePreSubmit}
             className="w-full md:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl active:scale-95"
           >
             Zatwierdź i Wyślij
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Punkt Sprzedaży</label>
              <div className="flex items-center gap-2">
                 <MapPin size={14} className="text-amber-500" />
                 <select 
                   value={selectedLocation} 
                   onChange={e => setSelectedLocation(e.target.value)}
                   className="bg-transparent font-black text-slate-800 text-sm outline-none w-full"
                   disabled={user.role !== 'admin' && !!user.default_location_id}
                 >
                   <option value="">Wybierz punkt...</option>
                   {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                 </select>
              </div>
           </div>
           <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Data zamówienia</label>
              <div className="flex items-center gap-2 font-black text-slate-800 text-sm">
                 <Calendar size={14} className="text-slate-400" />
                 <input type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} className="bg-transparent outline-none" />
              </div>
           </div>
           <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex flex-col gap-1">
              <label className="text-[8px] font-black text-amber-600 uppercase tracking-widest font-bold">Data DOSTAWY</label>
              <div className="flex items-center gap-2 font-black text-amber-700 text-sm">
                 <Calendar size={14} />
                 <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="bg-transparent outline-none" />
              </div>
           </div>
        </div>
      </div>

      {/* Full Product List */}
      <div className="space-y-16">
        {Object.entries(categorizedItems).map(([category, items]) => (
          <div key={category} className="space-y-6">
            <div className="flex items-center gap-4 px-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm ${category.startsWith('Piekarnia') ? 'bg-amber-100 text-amber-700' : 'bg-pink-100 text-pink-700'}`}>
                {category.startsWith('Piekarnia') ? '🍞' : '🍰'}
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">{category}</h3>
              <div className="h-[1px] bg-slate-100 flex-1"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-[1.8rem] border border-slate-100 hover:border-amber-500/30 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center font-black text-slate-400 text-[10px] shrink-0">{item.code || '•'}</div>
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

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-200">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center animate-bounce">
                <AlertTriangle size={40} />
              </div>
            </div>
            
            <div className="text-center">
               <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Potwierdź wysyłkę</h3>
               <p className="text-sm font-medium text-slate-500 mt-2">Czy na pewno chcesz wysłać to zamówienie do produkcji? Po zatwierdzeniu nie będzie można go samodzielnie edytować.</p>
            </div>

            <div className="space-y-3">
               <button 
                 onClick={executeSubmit}
                 className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-amber-600 transition-all"
               >
                 TAK, WYŚLIJ ZAMÓWIENIE
               </button>
               <button 
                 onClick={() => setShowConfirm(false)}
                 className="w-full py-5 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:text-slate-900 transition-all"
               >
                 WRÓĆ DO ARKUSZA
               </button>
            </div>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-10 py-5 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl animate-in fade-in slide-in-from-bottom-8 flex items-center gap-3 border border-amber-500/50">
          <CheckCircle2 className="text-amber-500" /> Zamówienie zostało wysłane!
        </div>
      )}
    </div>
  );
};

export default OrderEntry;
