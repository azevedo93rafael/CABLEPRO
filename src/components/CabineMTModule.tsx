import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap, ArrowLeft, FileDown, Save, Plus, X, Sun, Moon, Globe, Folder
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { CabineMTProvider, useCabineMT } from '../context/CabineMTContext';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';
import { calculateCabineMT } from '../utils/cabineMTCalculations';
import { InputPanel } from './cabine-mt/InputPanel';
import { ResultsPanel } from './cabine-mt/ResultsPanel';
import { VentilationTab } from './cabine-mt/VentilationTab';
import { SavedProjectsDrawer } from './cabine-mt/SavedProjectsDrawer';
import { CabineMTReport } from './cabine-mt/CabineMTReport';
import { Toast } from './Toast';

// ── Types ─────────────────────────────────────────────────────────────────────
interface CabineMTModuleProps {
  user: { name?: string; email: string; role: string };
  onBack: () => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

// ── Tab type ──────────────────────────────────────────────────────────────────
type ActiveTab = 'grounding' | 'ventilation';

// ── Inner component (uses context) ────────────────────────────────────────────
function CabineMTModuleInner({ user, onBack, showToast }: CabineMTModuleProps) {
  const { lang, setLang, darkMode, setDarkMode, toastData } = useApp();
  const t = TRANSLATIONS[lang];
  const tMT = t.cabineMT;

  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    activeProject,
    savedProjects,
    addNewProject,
    deleteProject,
    renameProject,
    updateInputs,
    updateThermalElements,
    updateCabineDimensions,
    saveProject,
    loadProject,
    deleteSavedProject,
  } = useCabineMT();

  const [activeTab, setActiveTab] = React.useState<ActiveTab>('grounding');
  const [showDrawer, setShowDrawer] = React.useState(false);
  const [showReport, setShowReport] = React.useState(false);

  const results = useMemo(
    () => calculateCabineMT(activeProject.inputs),
    [activeProject.inputs],
  );

  const displayName = user.name || user.email.split('@')[0].toUpperCase();

  const handleExportPDF = () => setShowReport(true);

  return (
    <div className={`min-h-screen flex flex-col bg-[#f5f5f5] dark:bg-[#0a0a0a] transition-colors`}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#141414] border-b border-black/5 dark:border-white/5 px-6 py-3 flex items-center justify-between print:hidden sticky top-0 z-50"
      >
        {/* Left: back + module identity */}
        <div className="flex items-center gap-4">
          <button
            id="cmt-back-button"
            onClick={onBack}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#5a5a5a] dark:text-white/60 hover:text-[#81292C] dark:hover:text-[#81292C] transition-colors"
          >
            <ArrowLeft size={14} />
            <span className="hidden sm:inline">{tMT.back}</span>
          </button>

          <div className="w-px h-5 bg-black/10 dark:bg-white/10" />

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#401318] rounded-lg flex items-center justify-center shadow-lg shadow-[#401318]/20 flex-shrink-0">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest dark:text-white">{tMT.moduleName}</p>
              <p className="text-[8px] font-bold opacity-30 tracking-widest uppercase hidden md:block">
                Rilo Elettrico
              </p>
            </div>
          </div>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-3">
          {/* Dark mode toggle — identical to MainLayout */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#efefef] dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition-all shadow-sm"
            title={darkMode ? t.header.lightMode : t.header.darkMode}
          >
            {darkMode
              ? <Sun size={13} className="text-yellow-400" />
              : <Moon size={13} className="opacity-60 dark:text-white" />}
          </button>

          {/* Language selector — identical to MainLayout */}
          <div className="flex items-center gap-1.5 px-2 py-1.5">
            <Globe size={13} className="opacity-40 dark:text-white" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Language)}
              className="text-[10px] font-bold bg-transparent border-none outline-none cursor-pointer uppercase dark:text-white"
            >
              <option value="pt-BR" className="dark:bg-[#141414]">PT-BR</option>
              <option value="en" className="dark:bg-[#141414]">EN</option>
              <option value="it" className="dark:bg-[#141414]">IT</option>
            </select>
          </div>

          {/* Save button */}
          <button
            id="cmt-save-project"
            onClick={() => saveProject(showToast, t)}
            className="flex items-center gap-2 px-4 py-1.5 border border-black/10 dark:border-white/10 text-[10px] font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-all dark:text-white"
          >
            <Save size={13} className="text-[#81292C]" />
            {tMT.saveProject}
          </button>

          {/* PDF export (only on grounding tab with results) */}
          {activeTab === 'grounding' && results && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              id="cmt-export-pdf"
              onClick={handleExportPDF}
              className="flex items-center gap-2 bg-[#81292C] text-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest hover:bg-[#6A2023] transition-colors print:hidden"
            >
              <FileDown size={12} />
              <span className="hidden sm:inline">{tMT.exportPDF}</span>
            </motion.button>
          )}

          {/* User badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#F5F5F5] dark:bg-white/5 border border-black/5 dark:border-white/5">
            <div className="w-4 h-4 rounded-full bg-[#81292C] flex items-center justify-center text-white text-[7px] font-black">
              {displayName.charAt(0)}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest dark:text-white/60">
              {displayName}
            </span>
          </div>
        </div>
      </motion.header>

      {/* ── Project Tabs (identical pattern to MainLayout) ──────────────────── */}
      <div className="bg-white dark:bg-[#141414] border-b border-black/5 dark:border-white/5 px-6 flex items-center gap-4 overflow-x-auto print:hidden transition-colors">
        {/* Folder button to open saved projects drawer */}
        <button
          id="cmt-open-saved-projects"
          onClick={() => setShowDrawer(true)}
          className="flex items-center gap-1.5 p-4 text-black/40 dark:text-white/40 hover:text-[#81292C] transition-colors flex-shrink-0 border-r border-black/5 dark:border-white/5 mr-2"
          title="Banco de Projetos"
        >
          <Folder size={16} />
        </button>

        {projects.map((p) => (
          <div key={p.id} className="flex items-center group flex-shrink-0">
            <div className={`relative flex items-center gap-2 transition-all ${
              activeProjectId === p.id ? 'text-[#81292C]' : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white'
            }`}>
              {activeProjectId === p.id ? (
                <input
                  type="text"
                  value={p.name}
                  onChange={(e) => renameProject(p.id, e.target.value.toUpperCase())}
                  className="bg-transparent border-none outline-none text-[10px] font-bold tracking-widest uppercase w-28 py-4"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setActiveProjectId(p.id)}
                  className="text-[10px] font-bold tracking-widest uppercase py-4"
                >
                  {p.name}
                </button>
              )}
              {activeProjectId === p.id && (
                <motion.div
                  layoutId="cmt-active-project-tab"
                  className="absolute bottom-0 left-0 w-full h-[2px] bg-[#81292C] z-10"
                />
              )}
            </div>
            {projects.length > 1 && (
              <button
                onClick={() => deleteProject(p.id)}
                className={`p-1.5 text-[#81292C] hover:bg-[#81292C]/10 rounded transition-all ${
                  activeProjectId === p.id ? 'opacity-100 mr-2' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => addNewProject(t)}
          className="p-4 text-black/40 dark:text-white/40 hover:text-[#81292C] transition-colors flex-shrink-0"
          title={tMT.newProject}
        >
          <Plus size={18} />
        </button>
      </div>

      {/* ── Tab Navigation (Grounding | Ventilation) ────────────────────────── */}
      <div className="bg-white dark:bg-[#141414] border-b border-black/5 dark:border-white/5 px-6 flex items-center gap-1 print:hidden transition-colors">
        {([
          { key: 'grounding' as const, label: tMT.groundingTab },
          { key: 'ventilation' as const, label: tMT.ventilationTab },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`relative px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${
              activeTab === key
                ? 'text-[#81292C]'
                : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white'
            }`}
          >
            {label}
            {activeTab === key && (
              <motion.div
                layoutId="cmt-active-tab"
                className="absolute bottom-0 left-0 w-full h-[2px] bg-[#81292C]"
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'grounding' ? (
            <motion.div
              key="grounding"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="flex-1 flex flex-col lg:flex-row gap-6"
            >
              {/* Input Panel */}
              <div className="w-full lg:w-[380px] flex-shrink-0">
                <div className="bg-white dark:bg-[#141414] border border-black/5 dark:border-white/5 shadow-xl shadow-black/5">
                  <div className="px-5 py-4 border-b border-black/5 dark:border-white/5">
                    <p className="text-[9px] font-black tracking-widest uppercase dark:text-white">
                      {tMT.inputParameters}
                    </p>
                  </div>
                  <div className="p-5">
                    <InputPanel
                      t={tMT}
                      inputs={activeProject.inputs}
                      onChange={(field, value) =>
                        updateInputs({ ...activeProject.inputs, [field]: value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Results Panel */}
              <div className="flex-1">
                <div className="bg-white dark:bg-[#141414] border border-black/5 dark:border-white/5 shadow-xl shadow-black/5 h-full flex flex-col">
                  <div className="px-5 py-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                    <p className="text-[9px] font-black tracking-widest uppercase dark:text-white">
                      {tMT.results}
                    </p>
                    {results && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"
                      />
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <ResultsPanel t={tMT} results={results} />
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="ventilation"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="flex-1 flex flex-col"
            >
              <VentilationTab
                t={tMT}
                lang={lang}
                projectName={activeProject.name}
                engineerName={user.name || user.email}
                elements={activeProject.thermalElements}
                dimensions={activeProject.cabineDimensions}
                onUpdateElements={updateThermalElements}
                onUpdateDimensions={updateCabineDimensions}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Print styles ────────────────────────────────────────────────────── */}
      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>

      <Toast data={toastData} />

      {/* Saved projects drawer */}
      {showDrawer && (
        <SavedProjectsDrawer
          t={tMT}
          savedProjects={savedProjects}
          onLoad={(p) => { loadProject(p); }}
          onDelete={deleteSavedProject}
          onClose={() => setShowDrawer(false)}
        />
      )}

      {/* Relazione di calcolo */}
      {showReport && results && (
        <CabineMTReport
          inputs={activeProject.inputs}
          results={results}
          t={tMT}
          projectName={activeProject.name}
          engineerName={user.name || user.email}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}

// ── Root export (wraps with provider) ────────────────────────────────────────
export function CabineMTModule(props: CabineMTModuleProps) {
  return (
    <CabineMTProvider>
      <CabineMTModuleInner {...props} />
    </CabineMTProvider>
  );
}
