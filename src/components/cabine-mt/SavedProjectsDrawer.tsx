import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Folder, Clock, ChevronRight, Trash2, FolderOpen } from 'lucide-react';
import { Translation } from '../../types';
import { CabineMTProject } from '../../types/cabineMT';
import { useApp } from '../../context/AppContext';

interface SavedProjectsDrawerProps {
  t: Translation['cabineMT'];
  savedProjects: CabineMTProject[];
  onLoad: (project: CabineMTProject) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

function formatDate(isoString?: string): string {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function SavedProjectsDrawer({
  t,
  savedProjects,
  onLoad,
  onDelete,
  onClose,
}: SavedProjectsDrawerProps) {
  const { moduleTheme } = useApp();
  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="drawer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <motion.aside
        key="drawer-panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 40 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-80 bg-white dark:bg-[#141414] border-l border-black/5 dark:border-white/5 shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <FolderOpen size={16} style={{ color: moduleTheme.accent }} />
            <p className="text-[10px] font-black uppercase tracking-widest dark:text-white">
              Banco de Projetos
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
          >
            <X size={16} className="opacity-40" />
          </button>
        </div>

        {/* Project list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {savedProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
              <Folder size={40} className="opacity-10 dark:text-white" />
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest opacity-30 dark:text-white mb-1">
                  Nessun progetto salvato
                </p>
                <p className="text-[9px] opacity-20 dark:text-white">
                  Clicca SALVA nel header per salvare il progetto corrente.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {savedProjects.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group flex items-center px-4 py-3.5 hover:bg-black/2 dark:hover:bg-white/3 transition-colors"
                >
                  {/* Main clickable area */}
                  <button
                    onClick={() => { onLoad(p); onClose(); }}
                    className="flex-1 min-w-0 text-left flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${moduleTheme.accent}1A` }}>
                      <Folder size={14} style={{ color: moduleTheme.accent }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold dark:text-white truncate uppercase">
                        {p.name}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={9} className="opacity-30 dark:text-white flex-shrink-0" />
                        <p className="text-[8px] opacity-30 dark:text-white font-bold truncate">
                          {formatDate(p.lastSaved)}
                        </p>
                      </div>
                      {p.calcVersion && (
                        <p className="text-[8px] opacity-20 dark:text-white font-bold">
                          v{p.calcVersion}
                        </p>
                      )}
                    </div>
                    <ChevronRight
                      size={14}
                      className="opacity-0 group-hover:opacity-30 transition-opacity ml-1 flex-shrink-0 dark:text-white"
                    />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => onDelete(p.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all ml-1 flex-shrink-0"
                    title="Eliminar"
                  >
                    <Trash2 size={12} style={{ color: moduleTheme.accent }} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer note */}
        <div className="px-5 py-3 border-t border-black/5 dark:border-white/5">
          <p className="text-[8px] opacity-20 dark:text-white font-bold uppercase tracking-widest text-center">
            {savedProjects.length} projeto{savedProjects.length !== 1 ? 's' : ''} salvos
          </p>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
