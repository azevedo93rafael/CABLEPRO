import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Edit2, Copy, Trash2, Library, Zap, Sun, Flame, Network, Layers, SunMedium, Camera } from 'lucide-react';
import { TechnicalElement } from '../types';
import { MATERIAL_CATEGORIES, TRANSLATIONS } from '../constants';
import { supabase } from '../lib/supabase';
import { ConfirmModal } from './ConfirmModal';
import { useApp } from '../context/AppContext';

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
  const { lang, moduleTheme } = useApp();
  const t = TRANSLATIONS[lang];
  const tc = t.capitolato;

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
    if (error) { showToast(tc.duplicateError + error.message, 'error'); }
    else { showToast(tc.elementDuplicated, 'success'); fetchElements(); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from('technical_elements').delete().eq('id', deleteTarget);
    if (error) { showToast(tc.deleteErrorElement + error.message, 'error'); }
    else { showToast(tc.elementDeleted, 'success'); setElements(prev => prev.filter(e => e.id !== deleteTarget)); }
    setDeleteTarget(null);
  };

  const formatDate = (iso?: string) => {
    const locale = lang === 'pt-BR' ? 'pt-BR' : lang === 'it' ? 'it-IT' : 'en-US';
    return iso ? new Date(iso).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
  };

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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 dark:opacity-50" size={18} />
          <input
            type="text"
            placeholder={tc.searchElements}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#F5F5F5] dark:bg-[#141414] border border-black/5 dark:border-white/10 rounded-xl pl-12 pr-6 py-4 focus:ring-2 focus:bg-white dark:focus:bg-white/10 transition-all shadow-sm text-sm"
            style={{ '--tw-ring-color': moduleTheme.accent } as React.CSSProperties}
          />
        </div>
        <button
          onClick={onNew}
          className="flex items-center gap-2 px-6 py-4 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg"
          style={{ 
            background: `linear-gradient(135deg, ${moduleTheme.accent}, ${moduleTheme.primary})`,
            boxShadow: `0 10px 30px ${moduleTheme.accent}40`
          }}
        >
          <Plus size={18} />
          {tc.newElement}
        </button>
      </div>

      {/* Category filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setFilterCategory('')}
          className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
            !filterCategory 
              ? 'text-white shadow-lg' 
              : 'bg-white dark:bg-[#141414] opacity-50 hover:opacity-100 border border-black/5 dark:border-white/5'
          }`}
          style={!filterCategory ? { 
            background: `linear-gradient(135deg, ${moduleTheme.accent}, ${moduleTheme.primary})`,
            boxShadow: `0 8px 24px ${moduleTheme.accent}40`
          } : {}}
        >
          {tc.all}
        </button>
        {MATERIAL_CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(f => f === cat.id ? '' : cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
              filterCategory === cat.id 
                ? 'text-white shadow-lg' 
                : 'bg-white dark:bg-[#141414] opacity-50 hover:opacity-100 border border-black/5 dark:border-white/5'
            }`}
            style={filterCategory === cat.id ? { 
              background: `linear-gradient(135deg, ${moduleTheme.accent}, ${moduleTheme.primary})`,
              boxShadow: `0 8px 24px ${moduleTheme.accent}40`
            } : {}}
          >
            {getCategoryIcon(cat.icon)}
            {cat.name}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-[10px] font-bold uppercase tracking-widest dark:opacity-30" style={{ color: moduleTheme.primary }}>{filtered.length} {tc.elementsCount}</p>

      {/* Table */}
      <div className="bg-white dark:bg-[#141414] rounded-3xl border border-black/5 dark:border-white/5 overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="flex items-center justify-center py-24 opacity-30">
            <div className="w-8 h-8 rounded-full animate-spin border-4"
              style={{ 
                borderColor: `${moduleTheme.accent}20`,
                borderTopColor: moduleTheme.accent
              }}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto opacity-20"
              style={{ backgroundColor: `${moduleTheme.accent}20`, color: moduleTheme.accent }}>
              <Library size={40} />
            </div>
            <p className="opacity-30 italic text-sm">
              {search || filterCategory ? tc.noElementsMatchFilters : tc.noElementsYet}
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead style={{ backgroundColor: `${moduleTheme.primary}08` }}>
              <tr>
                <th className="p-5 text-[10px] font-bold uppercase tracking-widest w-16" style={{ color: `${moduleTheme.primary}80` }}>{tc.img}</th>
                <th className="p-5 text-[10px] font-bold uppercase tracking-widest" style={{ color: `${moduleTheme.primary}80` }}>{tc.title}</th>
                <th className="p-5 text-[10px] font-bold uppercase tracking-widest" style={{ color: `${moduleTheme.primary}80` }}>{tc.category}</th>
                <th className="p-5 text-[10px] font-bold uppercase tracking-widest" style={{ color: `${moduleTheme.primary}80` }}>{tc.brand}</th>
                <th className="p-5 text-[10px] font-bold uppercase tracking-widest" style={{ color: `${moduleTheme.primary}80` }}>{tc.updated}</th>
                <th className="p-5 text-[10px] font-bold uppercase tracking-widest text-right" style={{ color: `${moduleTheme.primary}80` }}>{tc.actions}</th>
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
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden"
                          style={{ backgroundColor: `${moduleTheme.accent}10` }}>
                          {el.image
                            ? <img src={el.image} alt={el.titolo} className="w-full h-full object-cover" />
                            : <Library size={20} style={{ color: moduleTheme.accent }} className="opacity-40" />
                          }
                        </div>
                      </td>
                      <td className="p-5">
                        <p className="font-bold text-sm dark:text-white">{el.titolo}</p>
                        {el.descrizione && (
                          <p className="text-[10px] opacity-40 line-clamp-1 mt-0.5 max-w-xs dark:text-white/40">{el.descrizione}</p>
                        )}
                      </td>
                      <td className="p-5">
                        {cat ? (
                          <div className="flex items-center gap-2">
                            <div style={{ color: moduleTheme.accent }}>{getCategoryIcon(cat.icon)}</div>
                            <span className="text-[10px] font-bold opacity-60 uppercase tracking-widest dark:text-white/60">{cat.name}</span>
                          </div>
                        ) : <span className="text-[11px] opacity-30">—</span>}
                      </td>
                      <td className="p-5">
                        <span className="text-sm font-medium opacity-60 dark:text-white/60">{el.marca || '—'}</span>
                      </td>
                      <td className="p-5">
                        <span className="text-[11px] font-mono opacity-40 dark:text-white/40">{formatDate(el.updated_at)}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEdit(el)}
                            className="p-2.5 rounded-xl transition-all hover:text-white"
                            style={{ 
                              backgroundColor: `${moduleTheme.accent}15`,
                              color: moduleTheme.accent
                            }}
                            title={tc.edit}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDuplicate(el)}
                            className="p-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl transition-all"
                            title={tc.duplicate}
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(el.id)}
                            className="p-2.5 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-xl transition-all text-red-500"
                            title={tc.delete}
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
        title={tc.deleteElementTitle}
        message={tc.deleteElementMessage}
        confirmText={tc.delete}
        cancelText={t.management.cancel}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </motion.div>
  );
}
