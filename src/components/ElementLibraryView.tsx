import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Edit2, Copy, Trash2, Library, Zap, Sun, Flame, Network, Layers, SunMedium, Camera } from 'lucide-react';
import { TechnicalElement } from '../types';
import { MATERIAL_CATEGORIES } from '../constants';
import { supabase } from '../lib/supabase';
import { ConfirmModal } from './ConfirmModal';

interface ElementLibraryViewProps {
  onNew: () => void;
  onEdit: (element: TechnicalElement) => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

function getCategoryIcon(iconName: string) {
  const props = { size: 14 };
  switch (iconName) {
    case 'Zap': return <Zap {...props} />;
    case 'Sun': return <Sun {...props} />;
    case 'Flame': return <Flame {...props} />;
    case 'Network': return <Network {...props} />;
    case 'Layers': return <Layers {...props} />;
    case 'SunMedium': return <SunMedium {...props} />;
    case 'Camera': return <Camera {...props} />;
    default: return null;
  }
}

export function ElementLibraryView({ onNew, onEdit, showToast }: ElementLibraryViewProps) {
  const [elements, setElements] = useState<TechnicalElement[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const fetchElements = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('technical_elements')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setElements(data as TechnicalElement[]);
    } else if (error) {
      console.warn('technical_elements error:', error.message);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchElements(); }, [fetchElements]);

  const handleDuplicate = async (el: TechnicalElement) => {
    const now = new Date().toISOString();
    const copy: TechnicalElement = { ...el, id: crypto.randomUUID(), titolo: `${el.titolo} (Copia)`, created_at: now, updated_at: now };
    const { error } = await supabase.from('technical_elements').insert(copy);
    if (error) { showToast('Errore duplicazione: ' + error.message, 'error'); }
    else { showToast('Elemento duplicato', 'success'); fetchElements(); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('technical_elements').delete().eq('id', deleteTarget);
    if (error) { showToast('Errore eliminazione: ' + error.message, 'error'); }
    else { showToast('Elemento eliminato', 'success'); setElements(prev => prev.filter(e => e.id !== deleteTarget)); }
    setDeleteTarget(null);
  };

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';

  const filtered = elements.filter(el => {
    const matchSearch = el.titolo.toLowerCase().includes(search.toLowerCase()) ||
      (el.marca || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCategory || el.category_id === filterCategory;
    return matchSearch && matchCat;
  });

  return (
    <motion.div
      key="element-library"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto space-y-6 p-8"
    >
      {/* Search + new button */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
          <input
            type="text"
            placeholder="Cerca per titolo o marca..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-[#141414] border border-black/5 dark:border-white/5 rounded-2xl pl-12 pr-6 py-4 focus:ring-2 focus:ring-[#401318]/20 transition-all shadow-sm text-sm"
          />
        </div>
        <button
          onClick={onNew}
          className="flex items-center gap-2 px-6 py-4 bg-[#401318] text-white rounded-2xl font-bold text-sm hover:bg-[#5a1b22] transition-all shadow-lg shadow-[#401318]/20"
        >
          <Plus size={18} />
          NUOVO ELEMENTO
        </button>
      </div>

      {/* Category filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilterCategory('')}
          className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${!filterCategory ? 'bg-[#401318] text-white shadow-lg shadow-[#401318]/20' : 'bg-white dark:bg-[#141414] opacity-50 hover:opacity-100 border border-black/5 dark:border-white/5'}`}
        >
          Tutti
        </button>
        {MATERIAL_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(f => f === cat.id ? '' : cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filterCategory === cat.id ? 'bg-[#401318] text-white shadow-lg shadow-[#401318]/20' : 'bg-white dark:bg-[#141414] opacity-50 hover:opacity-100 border border-black/5 dark:border-white/5'}`}
          >
            {getCategoryIcon(cat.icon)}
            {cat.name}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">{filtered.length} elementi</p>

      {/* Table */}
      <div className="bg-white dark:bg-[#141414] rounded-[32px] border border-black/5 dark:border-white/5 overflow-hidden shadow-xl shadow-black/5">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 opacity-30">
            <div className="w-8 h-8 border-4 border-[#401318] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
              <Library size={40} />
            </div>
            <p className="opacity-30 italic text-sm">
              {search || filterCategory ? 'Nessun elemento corrisponde ai filtri.' : 'Nessun elemento tecnico ancora. Clicca "Nuovo Elemento".'}
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F5F5F5] dark:bg-[#1A1A1A]">
              <tr>
                <th className="p-5 text-[10px] font-bold opacity-40 uppercase tracking-widest w-16">Img</th>
                <th className="p-5 text-[10px] font-bold opacity-40 uppercase tracking-widest">Titolo</th>
                <th className="p-5 text-[10px] font-bold opacity-40 uppercase tracking-widest">Categoria</th>
                <th className="p-5 text-[10px] font-bold opacity-40 uppercase tracking-widest">Marca</th>
                <th className="p-5 text-[10px] font-bold opacity-40 uppercase tracking-widest">Aggiornato</th>
                <th className="p-5 text-[10px] font-bold opacity-40 uppercase tracking-widest text-right">Azioni</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((el, i) => {
                  const cat = MATERIAL_CATEGORIES.find(c => c.id === el.category_id);
                  return (
                    <motion.tr
                      key={el.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-t border-black/5 dark:border-white/5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="p-4">
                        <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 overflow-hidden flex items-center justify-center">
                          {el.image
                            ? <img src={el.image} alt={el.titolo} className="w-full h-full object-cover" />
                            : <Library size={20} className="opacity-20" />
                          }
                        </div>
                      </td>
                      <td className="p-5">
                        <p className="font-bold text-sm">{el.titolo}</p>
                        {el.descrizione && (
                          <p className="text-[10px] opacity-40 line-clamp-1 mt-0.5 max-w-xs">{el.descrizione}</p>
                        )}
                      </td>
                      <td className="p-5">
                        {cat ? (
                          <div className="flex items-center gap-2">
                            <div className="text-[#401318] dark:text-white/60">{getCategoryIcon(cat.icon)}</div>
                            <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{cat.name}</span>
                          </div>
                        ) : <span className="text-[11px] opacity-30">—</span>}
                      </td>
                      <td className="p-5">
                        <span className="text-sm font-medium opacity-60">{el.marca || '—'}</span>
                      </td>
                      <td className="p-5">
                        <span className="text-[11px] font-mono opacity-40">{formatDate(el.updated_at)}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEdit(el)}
                            className="p-2.5 bg-black/5 dark:bg-white/5 hover:bg-[#401318] hover:text-white rounded-xl transition-all"
                            title="Modifica"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDuplicate(el)}
                            className="p-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all"
                            title="Duplica"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(el.id)}
                            className="p-2.5 bg-black/5 dark:bg-white/5 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                            title="Elimina"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Elimina Elemento"
        message="Sei sicuro di voler eliminare questo elemento tecnico? L'operazione è irreversibile."
        confirmText="Elimina"
        cancelText="Annulla"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  );
}
