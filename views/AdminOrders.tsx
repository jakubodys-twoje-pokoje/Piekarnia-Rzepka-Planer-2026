
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, Truck, Calendar, Printer, Loader2, 
  LayoutGrid, Download, MapPin, ClipboardList,
  Filter, ArrowRight, Table as TableIcon, List
} from 'lucide-react';
import { supabase } from '../supabase';

const AdminOrders: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [viewMode, setViewMode] = useState<'summary' | 'matrix'>('summary');

  const fetchData = async () => {
    setLoading(true);
    const [{ data: oData }, { data: lData }] = await Promise.all([
      supabase.from('orders').select('*, order_items(*, inventory(*)), locations(name)').eq('delivery_date', deliveryDate),
      supabase.from('locations').select('*').order('name')
    ]);
    setOrders(oData || []);
    setLocations(lData || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [deliveryDate]);

  // Sumowanie produktów dla całej produkcji
  const productionSummary = useMemo(() => {
    const summary: Record<string, { name: string, code: string, qty: number, section: string, category: string }> = {};
    orders.forEach(order => {
      order.order_items.forEach((item: any) => {
        const inv = item.inventory;
        if (!summary[item.product_id]) {
          summary[item.product_id] = { 
            name: inv.name, 
            code: inv.code, 
            qty: 0, 
            section: inv.section, 
            category: inv.category 
          };
        }
        summary[item.product_id].qty += item.quantity;
      });
    });
    return Object.values(summary).sort((a, b) => a.section.localeCompare(b.section) || a.category.localeCompare(b.category));
  }, [orders]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="p-40 flex justify-center"><Loader2 size={48} className="animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-8 pb-24">
      <style>{`
        @media print {
          body * { visibility: hidden; background: white !important; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { position: absolute; left: 0; top: 0; width: 100%; font-size: 10pt; }
          .no-print { display: none !important; }
          .printable-area table { border-collapse: collapse; width: 100%; border: 1px solid black; }
          .printable-area th, .printable-area td { border: 1px solid black; padding: 4px; text-align: left; }
          .printable-area h1 { margin-bottom: 10px; font-size: 16pt; font-weight: bold; }
        }
      `}</style>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 no-print">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-slate-900 text-amber-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <Package size={28}/>
           </div>
           <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Plan Produkcji</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Podsumowanie zamówień sieci Rzepka</p>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1">
             <button onClick={() => setViewMode('summary')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${viewMode === 'summary' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400'}`}>
               <List size={14} className="inline mr-2" /> Zbiorczo
             </button>
             <button onClick={() => setViewMode('matrix')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${viewMode === 'matrix' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400'}`}>
               <TableIcon size={14} className="inline mr-2" /> Matrix
             </button>
          </div>
          <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="px-5 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-xs outline-none shadow-xl border-none cursor-pointer" />
          <button onClick={handlePrint} className="p-4 bg-amber-500 text-white rounded-2xl hover:bg-amber-600 transition-all shadow-xl">
             <Printer size={20} />
          </button>
        </div>
      </div>

      {/* Printable Area */}
      <div className="printable-area space-y-8">
        <h1 className="hidden print:block text-center uppercase mb-6">Plan Produkcji Rzepka - Dostawa {deliveryDate}</h1>

        {viewMode === 'summary' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Piekarnia Summary */}
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-8 border-b border-slate-100 pb-4 flex items-center gap-3">
                 <span className="text-2xl">🍞</span> Produkcja Piekarnia
               </h3>
               <div className="space-y-1">
                 {productionSummary.filter(s => s.section === 'Piekarnia').map((item, idx) => (
                   <div key={idx} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0 group">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-300 group-hover:text-amber-500 w-8">{item.code || '-'}</span>
                        <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.name}</span>
                      </div>
                      <span className="text-xl font-black text-slate-900 group-hover:text-amber-600">{item.qty} <span className="text-[10px] font-bold text-slate-300">SZT.</span></span>
                   </div>
                 ))}
               </div>
            </div>

            {/* Cukiernia Summary */}
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-8 border-b border-slate-100 pb-4 flex items-center gap-3">
                 <span className="text-2xl">🍰</span> Produkcja Cukiernia
               </h3>
               <div className="space-y-1">
                 {productionSummary.filter(s => s.section === 'Cukiernia').map((item, idx) => (
                   <div key={idx} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0 group">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-300 group-hover:text-amber-500 w-8">{item.code || '-'}</span>
                        <span className="text-sm font-black text-slate-800 uppercase tracking-tight">{item.name}</span>
                      </div>
                      <span className="text-xl font-black text-slate-900 group-hover:text-pink-600">{item.qty} <span className="text-[10px] font-bold text-slate-300">SZT.</span></span>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-4 py-6 text-left text-[9px] font-black uppercase sticky left-0 z-10 bg-slate-900">Towar / Punkt</th>
                  {locations.map(l => (
                    <th key={l.id} className="px-3 py-6 text-center text-[8px] font-black uppercase tracking-widest border-l border-white/5">{l.name.replace('Piekarnia ', '')}</th>
                  ))}
                  <th className="px-4 py-6 text-center text-[9px] font-black uppercase bg-amber-500 text-white">SUMA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productionSummary.map((prod, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-4 py-4 text-xs font-black text-slate-800 sticky left-0 bg-white group-hover:bg-slate-50 border-r border-slate-100 flex items-center gap-2">
                      <span className="text-[8px] text-slate-300 font-bold w-4">{prod.code}</span>
                      <span className="uppercase truncate max-w-[150px]">{prod.name}</span>
                    </td>
                    {locations.map(loc => {
                      const orderForLoc = orders.find(o => o.location_id === loc.id);
                      const itemInOrder = orderForLoc?.order_items.find((oi: any) => oi.inventory.name === prod.name);
                      return (
                        <td key={loc.id} className={`px-2 py-4 text-center text-sm font-black border-l border-slate-50 ${itemInOrder ? 'text-slate-900' : 'text-slate-200'}`}>
                          {itemInOrder?.quantity || '-'}
                        </td>
                      );
                    })}
                    <td className="px-4 py-4 text-center text-base font-black bg-amber-50/50 text-amber-700">{prod.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="no-print bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="flex items-center gap-4">
           <Truck className="text-amber-500" size={40} />
           <div>
             <h4 className="text-xl font-black uppercase tracking-tight">Gotowość do wysyłki</h4>
             <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Wydrukuj listę i przekaż na piecownię</p>
           </div>
         </div>
         <button onClick={handlePrint} className="px-10 py-5 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all">Generuj arkusz A4</button>
      </div>
    </div>
  );
};

export default AdminOrders;
