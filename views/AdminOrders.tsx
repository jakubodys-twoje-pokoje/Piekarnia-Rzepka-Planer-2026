
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Package, Printer, Loader2, 
  Table as TableIcon, List, MapPin, Info
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

  const topScrollRef = useRef<HTMLDivElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);

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

  const handleScroll = (source: 'top' | 'main') => {
    if (source === 'top' && topScrollRef.current && mainScrollRef.current) {
      mainScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    } else if (source === 'main' && topScrollRef.current && mainScrollRef.current) {
      topScrollRef.current.scrollLeft = mainScrollRef.current.scrollLeft;
    }
  };

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
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Przetwarzanie rozdzielni...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-24 max-w-[1600px] mx-auto print:p-0 print:m-0">
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 5mm; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          
          .printable-area { 
            display: block !important; 
            width: 100% !important; 
            padding: 0 !important; 
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }
          
          table { 
            width: 100% !important; 
            border-collapse: collapse !important; 
            table-layout: auto !important; 
            border: 1.5pt solid black !important;
          }
          
          th, td { 
            border: 0.5pt solid black !important; 
            padding: 2pt 1pt !important; 
            font-size: 7.5pt !important; 
            color: black !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
          }
          
          th { background: #f0f0f0 !important; }
          
          /* Usuwamy sticky w druku */
          th.sticky, td.sticky { 
            position: static !important; 
            background: white !important; 
            box-shadow: none !important;
            border-right: 0.5pt solid black !important;
          }
          
          .section-row td { 
            background: #e0e0e0 !important; 
            font-size: 8pt !important;
            text-align: center !important;
          }
          
          .print-sum-col {
            background: #eee !important;
            border-left: 1.5pt solid black !important;
          }
        }
      `}</style>

      {/* NAGŁÓWEK UI */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 no-print">
        <div className="flex items-center gap-4">
           <div className="w-14 h-14 bg-slate-900 text-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Package size={28}/>
           </div>
           <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Panel Produkcji</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Arkusze Wyjazdowe</p>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1">
             <button onClick={() => setViewMode('summary')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${viewMode === 'summary' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400'}`}>
               Zbiorczo
             </button>
             <button onClick={() => setViewMode('matrix')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${viewMode === 'matrix' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400'}`}>
               Rozdzielnia
             </button>
          </div>
          <div className="bg-slate-900 p-1.5 rounded-2xl flex items-center gap-2 pr-4 shadow-xl">
             <input type="date" value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)} className="bg-transparent text-white font-black text-xs outline-none px-3" />
             <button onClick={handlePrint} className="p-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600">
                <Printer size={18} />
             </button>
          </div>
        </div>
      </div>

      <div className="printable-area bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm print:rounded-none">
        <div className="mb-10 flex items-center justify-between print:mb-4">
           <div>
             <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none print:text-xl">DOSTAWA: {deliveryDate}</h2>
             <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.4em] mt-2 print:text-[8pt] print:mt-1">Arkusze Wyjazdowe i Produkcyjne</p>
           </div>
           <div className="no-print text-slate-400 flex items-center gap-2">
              <Info size={14} />
              <p className="text-[9px] font-bold uppercase tracking-widest">Wydruk zoptymalizowany dla orientacji poziomej (Landscape).</p>
           </div>
        </div>

        {viewMode === 'summary' ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 print:block">
            {['Piekarnia', 'Cukiernia'].map(section => (
              <div key={section} className="space-y-6 mb-12 print:mb-6">
                <div className="flex items-center gap-4 px-4 no-print">
                   <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em]">{section}</h3>
                   <div className="h-[1px] bg-slate-100 flex-1"></div>
                </div>
                
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-900 text-white print:bg-slate-200 print:text-black">
                      <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-widest print:py-2" style={{ width: '80px' }}>Kod</th>
                      <th className="px-6 py-6 text-left text-[10px] font-black uppercase tracking-widest print:py-2">Nazwa Towaru</th>
                      <th className="px-6 py-6 text-center text-[10px] font-black uppercase tracking-widest print:py-2" style={{ width: '100px' }}>Ilość</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productionSummary.filter(s => s.section === section).map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 text-center print:py-1">{item.code || '-'}</td>
                        <td className="px-6 py-4 print:py-1">{item.name}</td>
                        <td className="px-6 py-4 text-center text-xl font-black print:text-[10pt] print:py-1">{item.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ) : (
          /* MATRIX VIEW - ZOPTYMALIZOWANA POD DRUK */
          <div className="space-y-2">
            <div 
              ref={topScrollRef}
              onScroll={() => handleScroll('top')}
              className="no-print overflow-x-auto custom-scrollbar-heavy h-4 bg-slate-50 rounded-full border border-slate-100 mb-1"
            >
              <div style={{ width: `${220 + (locations.length * 120) + 100}px`, height: '1px' }}></div>
            </div>

            <div 
              ref={mainScrollRef}
              onScroll={() => handleScroll('main')}
              className="overflow-x-auto custom-scrollbar-heavy"
            >
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white print:bg-slate-200 print:text-black">
                    <th className="sticky left-0 z-20 bg-slate-900 px-6 py-8 text-left text-[10px] font-black uppercase tracking-widest print:bg-white print:text-black min-w-[180px]">Towar / Punkt</th>
                    {locations.map(l => (
                      <th key={l.id} className="px-3 py-8 text-center text-[10px] font-black uppercase tracking-widest print:print-vertical-th min-w-[100px] print:min-w-0">
                        {l.name.replace('Piekarnia ', '')}
                      </th>
                    ))}
                    <th className="sticky right-0 z-20 bg-amber-500 px-6 py-8 text-center text-[10px] font-black uppercase tracking-widest text-white print:bg-slate-200 print:text-black print:print-sum-col min-w-[80px]">SUMA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 print:divide-black">
                  {['Piekarnia', 'Cukiernia'].map(section => (
                    <React.Fragment key={section}>
                      <tr className="section-row bg-slate-100 font-black text-[11px] uppercase tracking-[0.3em] text-slate-500 print:bg-slate-300 print:text-black">
                        <td colSpan={locations.length + 2} className="px-8 py-4 print:py-1">{section}</td>
                      </tr>
                      {productionSummary.filter(s => s.section === section).map((prod, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="sticky left-0 z-10 bg-white px-6 py-4 text-[11px] font-black text-slate-800 border-r border-slate-100 print:py-1">
                             <span className="w-8 inline-block text-[9px] text-slate-300 print:text-black">{prod.code || '-'}</span>
                             <span className="uppercase">{prod.name}</span>
                          </td>
                          {locations.map(loc => {
                            const orderForLoc = orders.find(o => o.location_id === loc.id);
                            const itemInOrder = orderForLoc?.order_items.find((oi: any) => oi.inventory.name === prod.name);
                            return (
                              <td key={loc.id} className={`px-2 py-4 text-center text-lg font-black border-r border-slate-50 print:py-1 print:text-[9pt] ${itemInOrder ? 'text-slate-900 bg-amber-50/20' : 'text-slate-100 print:text-transparent'}`}>
                                {itemInOrder?.quantity || ''}
                              </td>
                            );
                          })}
                          <td className="sticky right-0 z-10 bg-amber-50/90 px-6 py-4 text-center text-xl font-black text-amber-700 print:bg-slate-100 print:text-black print:text-[10pt] print:py-1 print:print-sum-col">
                             {prod.qty}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
