
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Package, Printer, Loader2, 
  Table as TableIcon, List
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

    return Object.values(summary).sort((a, b) => {
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
  }, [orders]);

  const handlePrint = () => window.print();

  if (loading) return (
    <div className="p-40 flex flex-col items-center justify-center gap-4">
      <Loader2 size={64} className="animate-spin text-amber-500" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Generowanie arkuszy...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-24">
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          body { background: white !important; font-family: sans-serif; }
          .no-print { display: none !important; }
          .printable-area { display: block !important; width: 100%; color: black !important; }
          
          table { width: 100%; border-collapse: collapse; table-layout: fixed; }
          th, td { 
            border: 1px solid black !important; 
            padding: 4px 2px; 
            font-size: 8pt; 
            overflow: hidden;
            word-wrap: break-word;
          }
          th { background: #eee !important; font-weight: bold; text-transform: uppercase; }
          .section-row { background: #ddd !important; font-weight: bold; }
          h1 { font-size: 14pt; margin-bottom: 5mm; text-align: center; font-weight: bold; text-transform: uppercase; }
          .sum-cell { font-weight: bold; background: #f9f9f9 !important; }
        }
      `}</style>

      {/* UI Controls */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 no-print">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-slate-900 text-amber-500 rounded-2xl flex items-center justify-center">
              <Package size={28}/>
           </div>
           <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Produkcja i Rozdzielnia</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Wybierz datę dostawy i tryb widoku</p>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-2xl flex gap-1">
             <button onClick={() => setViewMode('summary')} className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${viewMode === 'summary' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400'}`}>
               Zbiorczo
             </button>
             <button onClick={() => setViewMode('matrix')} className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${viewMode === 'matrix' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400'}`}>
               Arkusz Rozdzielni
             </button>
          </div>
          <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="px-5 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs outline-none" />
          <button onClick={handlePrint} className="p-4 bg-amber-500 text-white rounded-2xl hover:bg-amber-600 shadow-xl">
             <Printer size={20} />
          </button>
        </div>
      </div>

      <div className="printable-area bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
        <h1>PLAN PRODUKCJI - DOSTAWA: {deliveryDate}</h1>

        {viewMode === 'summary' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:block">
            {['Piekarnia', 'Cukiernia'].map(section => (
              <div key={section} className="mb-8">
                <table className="print:mb-10">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>KOD</th>
                      <th>NAZWA TOWARU ({section.toUpperCase()})</th>
                      <th style={{ width: '60px' }}>SUMA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productionSummary.filter(s => s.section === section).map((item, idx) => (
                      <tr key={idx}>
                        <td className="text-center font-bold">{item.code || '-'}</td>
                        <td className="font-bold">{item.name}</td>
                        <td className="text-center text-base font-bold">{item.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '150px' }}>TOWAR / PUNKT</th>
                  {locations.map(l => (
                    <th key={l.id}>{l.name.replace('Piekarnia ', '').substring(0, 10)}</th>
                  ))}
                  <th style={{ width: '50px' }}>SUMA</th>
                </tr>
              </thead>
              <tbody>
                {['Piekarnia', 'Cukiernia'].map(section => (
                  <React.Fragment key={section}>
                    <tr className="section-row">
                      <td colSpan={locations.length + 2}>{section.toUpperCase()}</td>
                    </tr>
                    {productionSummary.filter(s => s.section === section).map((prod, idx) => (
                      <tr key={idx}>
                        <td className="font-bold text-[7pt]">
                          {prod.code ? `[${prod.code}] ` : ''}{prod.name}
                        </td>
                        {locations.map(loc => {
                          const orderForLoc = orders.find(o => o.location_id === loc.id);
                          const itemInOrder = orderForLoc?.order_items.find((oi: any) => oi.inventory.name === prod.name);
                          return (
                            <td key={loc.id} className="text-center font-bold">
                              {itemInOrder?.quantity || ''}
                            </td>
                          );
                        })}
                        <td className="text-center font-bold bg-slate-50">{prod.qty}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
