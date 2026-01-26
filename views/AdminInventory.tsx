
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, 
  Loader2, X, Save, CheckCircle2 
} from 'lucide-react';
import { supabase } from '../supabase';

const SECTIONS = [
  { id: 'Piekarnia', icon: '🍞' },
  { id: 'Cukiernia', icon: '🍰' }
];

const CATEGORIES = {
  'Piekarnia': ['Chleby', 'Bułki', 'Bagietki', 'Kanapki', 'Wyroby Słodkie', 'Inne'],
  'Cukiernia': ['Pączki', 'Ciasta', 'Kostki', 'Ciastka & Desery', 'Inne']
};

const AdminInventory: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterSection, setFilterSection] = useState('All');
  const [modal, setModal] = useState<any | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('inventory').select('*');
    
    // Ujednolicone sortowanie dla całej aplikacji
    const sorted = (data || []).sort((a, b) => {
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

    setItems(sorted);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    const { error } = await supabase.from('inventory').upsert({
      id: modal.id,
      name: modal.name,
      code: modal.code,
      section: modal.section,
      category: modal.category,
      is_active: true
    });

    if (!error) {
      setStatus('success');
      setTimeout(() => {
        setModal(null);
        setStatus('idle');
        load();
      }, 1000);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Usunąć ten produkt z bazy?')) return;
    await supabase.from('inventory').delete().eq('id', id);
    load();
  };

  const filteredItems = items.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.code?.includes(search);
    const matchesSection = filterSection === 'All' || i.section === filterSection;
    return matchesSearch && matchesSection;
  });

  if (loading) return <div className="p-40 flex justify-center"><Loader2 size={48} className="animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Baza Towarów</h1>
          <p className="text-slate-500 font-medium">Zarządzaj asortymentem w ujednoliconej kolejności.</p>
        </div>
        <button 
          onClick={() => setModal({ name: '', code: '', section: 'Piekarnia', category: 'Chleby' })}
          className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all shadow-xl"
        >
          <Plus size={18} /> Dodaj nowy towar
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Szybkie szukanie w bazie..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white focus:border-amber-500 transition-all"
          />
        </div>
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
          {['All', 'Piekarnia', 'Cukiernia'].map(s => (
            <button key={s} onClick={() => setFilterSection(s)} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filterSection === s ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400'}`}>
              {s === 'All' ? 'Wszystko' : s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-900 border border-slate-100">{item.code || '-'}</div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.name}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.section} &middot; {item.category}</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => setModal(item)} className="p-2 text-slate-300 hover:text-amber-600"><Edit2 size={14}/></button>
                <button onClick={() => remove(item.id)} className="p-2 text-slate-300 hover:text-rose-600"><Trash2 size={14}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 space-y-8 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">{modal.id ? 'Edycja Towaru' : 'Nowy Towar'}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Ustawienia inwentarza</p>
              </div>
              <button type="button" onClick={() => setModal(null)} className="p-2 hover:bg-slate-50 rounded-full"><X/></button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nazwa towaru</label>
                <input required value={modal.name} onChange={e => setModal({...modal, name: e.target.value.toUpperCase()})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Kod (np. 1/2, 92)</label>
                <input value={modal.code} onChange={e => setModal({...modal, code: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Dział</label>
                  <select value={modal.section} onChange={e => setModal({...modal, section: e.target.value, category: CATEGORIES[e.target.value as keyof typeof CATEGORIES][0]})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[10px] uppercase outline-none">
                    {SECTIONS.map(s => <option key={s.id} value={s.id}>{s.icon} {s.id}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Kategoria</label>
                  <select value={modal.category} onChange={e => setModal({...modal, category: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[10px] uppercase outline-none">
                    {CATEGORIES[modal.section as keyof typeof CATEGORIES].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 shadow-xl transition-all flex items-center justify-center gap-2">
              {status === 'saving' ? <Loader2 size={18} className="animate-spin" /> : (status === 'success' ? <CheckCircle2 size={18} /> : <Save size={18}/>)}
              Zapisz zmiany
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
