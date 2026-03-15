import React from 'react';
import { Search, Filter, Library, Plus } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { TechnicalElement, MaterialCategory, Translation } from '../types';
import { MATERIAL_CATEGORIES } from '../constants';

interface DraggableElementProps {
  element: TechnicalElement;
}

function DraggableElement({ element }: DraggableElementProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `library-${element.id}`,
    data: {
      type: 'element',
      element
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-4 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-black/5 dark:border-white/5 group hover:border-[#401318]/30 transition-all cursor-grab active:cursor-grabbing shadow-sm"
    >
      <div className="flex gap-4">
        <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 overflow-hidden flex items-center justify-center shrink-0">
          {element.image ? (
            <img src={element.image} alt={element.titolo} className="w-full h-full object-contain" />
          ) : (
            <Library size={24} className="opacity-10" />
          )}
        </div>
        <div className="overflow-hidden space-y-1">
          <h5 className="text-sm font-bold truncate leading-tight">{element.titolo || 'Senza Titolo'}</h5>
          <p className="text-[10px] opacity-40 uppercase tracking-widest font-mono">{element.marca || 'NO-BRAND'}</p>
          <div className="flex items-center gap-1.5 pt-1">
            <span className="px-1.5 py-0.5 bg-black/5 dark:bg-white/5 rounded text-[8px] font-bold opacity-50 uppercase">
              {MATERIAL_CATEGORIES.find(c => c.id === element.category_id)?.name || 'Custom'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LibraryPanelProps {
  materials: TechnicalElement[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (c: string | null) => void;
  t: Translation;
}

export function LibraryPanel({ materials, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, t }: LibraryPanelProps) {
  const filteredMaterials = materials.filter(m => {
    const title = m.titolo || '';
    const brand = m.marca || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || m.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex flex-col bg-white/50 dark:bg-black/20 backdrop-blur-sm border-r border-black/5 dark:border-white/5">
      <div className="p-6 border-b border-black/5 dark:border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold opacity-40 uppercase tracking-[0.2em]">{t.capitolato.materialsLibrary}</h3>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded-full opacity-60">
            {filteredMaterials.length}
          </span>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={16} />
          <input
            type="text"
            placeholder={t.capitolato.searchMaterials}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#141414] border border-black/5 dark:border-white/5 rounded-xl text-sm focus:outline-none focus:border-[#401318]/30 transition-all shadow-sm"
          />
        </div>

        <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar mask-fade-right">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all shrink-0 ${
              !selectedCategory 
                ? 'bg-[#401318] text-white border-transparent shadow-lg shadow-[#401318]/20' 
                : 'bg-white dark:bg-[#141414] border-black/5 dark:border-white/5 hover:border-[#401318]/20'
            }`}
          >
            TUTTI
          </button>
          {MATERIAL_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-[#401318] text-white border-transparent shadow-lg shadow-[#401318]/20' 
                  : 'bg-white dark:bg-[#141414] border-black/5 dark:border-white/5 hover:border-[#401318]/20'
              }`}
            >
              {cat.name.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {filteredMaterials.map(m => (
          <DraggableElement key={m.id} element={m} />
        ))}
        {filteredMaterials.length === 0 && (
          <div className="py-20 text-center space-y-4 opacity-20">
            <Library size={48} className="mx-auto" />
            <p className="text-sm font-medium italic">Nessun elemento trovato</p>
          </div>
        )}
      </div>
    </div>
  );
}
