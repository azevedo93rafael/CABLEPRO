import React from 'react';
import { 
  GripVertical, 
  Trash2, 
  Copy, 
  ChevronUp, 
  ChevronDown, 
  Plus, 
  FolderPlus,
  Layout,
  Type
} from 'lucide-react';
import { 
  SortableContext, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { ComposerItem, Translation } from '../types';

interface SortableSectionProps {
  item: ComposerItem;
  index: number;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
}

function SortableSection({ item, index, onRemove, onDuplicate }: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1
  };

  const isChapter = item.type === 'chapter';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all ${
        isChapter 
          ? 'bg-[#401318]/5 border-[#401318]/10' 
          : 'bg-white dark:bg-[#141414] border-black/5 dark:border-white/5'
      } hover:border-[#401318]/30 shadow-sm`}
    >
      <button {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing p-1 opacity-20 group-hover:opacity-100 transition-opacity">
        <GripVertical size={18} />
      </button>

      <div className="flex-1 flex items-center gap-4 overflow-hidden">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border font-bold text-xs shrink-0 ${
          isChapter 
            ? 'bg-[#401318] text-white border-transparent' 
            : 'bg-black/5 dark:bg-white/5 border-black/5'
        }`}>
          {index + 1}
        </div>
        <div className="overflow-hidden">
          <div className="flex items-center gap-2">
            {isChapter ? <FolderPlus size={14} className="text-[#401318]" /> : <Type size={14} className="opacity-40" />}
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isChapter ? 'text-[#401318]' : 'opacity-40'}`}>
              {isChapter ? 'CAPITOLO' : 'ELEMENTO'}
            </span>
          </div>
          <h4 className={`font-bold truncate ${isChapter ? 'text-lg leading-tight' : 'text-sm'}`}>
            {item.title}
          </h4>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => onDuplicate(item.id)}
          className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-all text-blue-500"
          title="Duplica"
        >
          <Copy size={16} />
        </button>
        <button 
          onClick={() => onRemove(item.id)}
          className="p-2 hover:bg-red-500/10 rounded-lg transition-all text-red-500"
          title="Rimuovi"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

interface StructurePanelProps {
  structure: ComposerItem[];
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
  onAddChapter: () => void;
  t: Translation;
}

export function StructurePanel({ structure, onRemove, onDuplicate, onAddChapter, t }: StructurePanelProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'structure-drop-zone',
  });

  return (
    <div className="h-full flex flex-col bg-[#f5f5f5] dark:bg-[#0a0a0a]">
      <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold opacity-40 uppercase tracking-[0.2em]">{t.sidebar.overview}</h3>
          <p className="text-[10px] font-bold mt-1 text-blue-500 uppercase tracking-widest">Docx Structure</p>
        </div>
        <button
          onClick={onAddChapter}
          className="flex items-center gap-2 px-4 py-2 bg-[#401318] text-white rounded-xl font-bold text-[10px] hover:bg-[#5a1b22] transition-all shadow-lg shadow-[#401318]/20"
        >
          <Plus size={14} />
          NUOVO CAPITOLO
        </button>
      </div>

      <div 
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto p-8 space-y-4 custom-scrollbar transition-colors ${
          isOver ? 'bg-[#401318]/5 shadow-inner' : ''
        }`}
      >
        {structure.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-30">
            <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center border-2 border-dashed border-black/10">
              <Layout size={40} />
            </div>
            <div className="max-w-xs space-y-2">
              <p className="text-sm font-bold uppercase tracking-widest">Struttura Vuota</p>
              <p className="text-xs font-medium italic">Trascina gli elementi dalla libreria per comporre il tuo capitolato.</p>
            </div>
          </div>
        )}

        <SortableContext
          items={structure.map(i => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {structure.map((item, index) => (
            <SortableSection 
              key={item.id} 
              item={item} 
              index={index} 
              onRemove={onRemove}
              onDuplicate={onDuplicate}
            />
          ))}
        </SortableContext>

        {structure.length > 0 && isOver && (
          <div className="p-4 border-2 border-dashed border-[#401318]/30 rounded-2xl bg-[#401318]/5 flex items-center justify-center text-[10px] font-bold text-[#401318] uppercase tracking-widest">
            Rilascia qui per aggiungere
          </div>
        )}
      </div>

      <div className="p-6 bg-white dark:bg-[#0d0d0d] border-t border-black/5 dark:border-white/5">
        <div className="flex items-center gap-3 text-blue-500">
           <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
             <Plus size={16} />
           </div>
           <div>
             <p className="text-[10px] font-bold leading-tight">TIP</p>
             <p className="text-[10px] opacity-60 leading-tight">L'ordine qui sopra sarà l'ordine finale nel documento Word.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
