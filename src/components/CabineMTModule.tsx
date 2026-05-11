import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap, ChevronLeft, FileDown, Save, Plus, X,
  Sun, Moon, Globe, Folder, LogOut,
  Layers, Wind, Keyboard, Server, Users,
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
import { UserManagement } from './UserManagement';
import { SavedProjectsDrawer } from './cabine-mt/SavedProjectsDrawer';
import { CabineMTReport } from './cabine-mt/CabineMTReport';
import { Logo } from './Logo';
import { Toast } from './Toast';

// ── Types ─────────────────────────────────────────────────────────────────────
interface CabineMTModuleProps {
  user: { name?: string; email: string; role: string };
  onBack: () => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

type ActiveTab = 'grounding' | 'ventilation' | 'users';

// ── Sidebar NavItem (identical pattern to MainLayout) ─────────────────────────
function NavItem({
  icon, label, active = false, onClick, accentColor,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  accentColor: string;
}) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-all border border-transparent hover:border-white/10"
      onClick={onClick}
    >
      <div
        className="p-2 rounded-lg transition-colors"
        style={active ? { backgroundColor: 'white', color: accentColor } : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)' }}
      >
        {icon}
      </div>
      <span className={`text-[10px] font-bold tracking-wider uppercase ${active ? 'text-white' : 'text-white/60'}`}>
        {label}
      </span>
      {active && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
    </div>
  );
}

// ── Inner component (uses context) ────────────────────────────────────────────
function CabineMTModuleInner({ user, onBack, showToast }: CabineMTModuleProps) {
  const { lang, setLang, darkMode, setDarkMode, moduleTheme, toastData } = useApp();
  const { setUser } = useAuth();
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
    updateElements,
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
  const avatarLetter = displayName.charAt(0);

  // Sidebar color (same logic as MainLayout)
  const sidebarBg = darkMode ? moduleTheme.dark : moduleTheme.primary;

  return (
    <div className="flex h-screen bg-[#efefef] dark:bg-[#0A0A0A] font-sans text-[#5a5a5a] dark:text-white transition-colors duration-300">

      {/* ══ LEFT SIDEBAR ══════════════════════════════════════════════════════ */}
      <aside
        className="w-64 text-white flex flex-col border-r border-white/5 shrink-0 z-20 transition-colors duration-300 print:hidden"
        style={{ backgroundColor: sidebarBg }}
      >
        {/* Logo + Module name */}
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <Logo className="w-10 h-10 text-white" />
          <div>
            <h1 className="text-sm font-bold tracking-wider uppercase">{tMT.moduleName}</h1>
            <p className="text-[10px] opacity-50">SISTEMA DI INGEGNERIA</p>
          </div>
        </div>

        {/* Back button */}
        <div className="px-4 py-3 border-b border-white/10">
          <button
            onClick={onBack}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-[10px] font-bold uppercase tracking-widest relative overflow-hidden group"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            {tMT.back}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-3 space-y-6 overflow-y-auto custom-scrollbar">
          <div>
            <p className="text-[9px] font-bold opacity-40 mb-3 tracking-widest uppercase px-2">
              {lang === 'pt-BR' ? 'Cálculos' : lang === 'it' ? 'Calcoli' : 'Calculations'}
            </p>
            <div className="space-y-1">
              <NavItem
                icon={<Layers size={16} />}
                label={tMT.groundingTab}
                active={activeTab === 'grounding'}
                onClick={() => setActiveTab('grounding')}
                accentColor={moduleTheme.accent}
              />
              <NavItem
                icon={<Wind size={16} />}
                label={tMT.ventilationTab}
                active={activeTab === 'ventilation'}
                onClick={() => setActiveTab('ventilation')}
                accentColor={moduleTheme.accent}
              />
              {user.role === 'admin' && (
                <NavItem
                  icon={<Users size={18} />}
                  label={TRANSLATIONS[lang].userManagement.title}
                  active={activeTab === 'users'}
                  onClick={() => setActiveTab('users')}
                  accentColor={moduleTheme.accent}
                />
              )}
            </div>
          </div>
        </nav>

        {/* User + Logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
              <div
                className="w-full h-full flex items-center justify-center text-white font-bold uppercase"
                style={{ backgroundColor: moduleTheme.accent }}
              >
                {avatarLetter}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold leading-tight uppercase truncate">{displayName}</p>
              <p className="text-[9px] opacity-50 truncate">{user.email}</p>
            </div>
            <button
              onClick={() => {
                // Shortcuts modal would go here
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
              title={t.misc.keyboardShortcuts}
            >
              <Keyboard size={16} />
            </button>
            <button
              onClick={async () => {
                const { supabase } = await import('../lib/supabase');
                try { await supabase.auth.signOut(); } catch { /* ignore */ }
                finally {
                  setUser(null);
                  localStorage.removeItem('cablefill_user');
                }
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
              title={t.auth.logout}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ══ MAIN CONTENT ══════════════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col overflow-hidden relative">

        {/* ── Top Bar ──────────────────────────────────────────────────────── */}
        <header className="h-16 bg-white dark:bg-[#141414] border-b border-black/5 dark:border-white/5 flex items-center justify-between px-8 transition-colors shrink-0 print:hidden">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded flex items-center justify-center shadow-sm"
              style={{ backgroundColor: moduleTheme.accent }}
            >
              <Zap size={14} className="text-white" />
            </div>
            <div>
              <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">
                {tMT.moduleName}
              </p>
              <h2 className="text-[11px] font-bold uppercase tracking-tight dark:text-white">
                {activeTab === 'users' ? TRANSLATIONS[lang].userManagement.title : 
                 activeTab === 'grounding' ? tMT.groundingTab : tMT.ventilationTab}
              </h2>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Dark mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#efefef] dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition-all shadow-sm"
              title={darkMode ? t.header.lightMode : t.header.darkMode}
            >
              {darkMode
                ? <><Sun size={13} className="text-yellow-400" /><span className="text-[9px] font-bold uppercase tracking-wider">{t.header.lightMode}</span></>
                : <><Moon size={13} className="opacity-60 dark:text-white" /><span className="text-[9px] font-bold uppercase tracking-wider">{t.header.darkMode}</span></>}
            </button>

            {/* Language */}
            <div className="flex items-center gap-2">
              <Globe size={14} className="opacity-40 dark:text-white" />
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

            {/* Save */}
            <button
              id="cmt-save-project"
              onClick={() => saveProject(showToast, t)}
              className="relative px-5 py-2.5 rounded-xl text-[10px] font-bold text-white active:scale-95 transition-all flex items-center gap-2 overflow-hidden group"
              style={{
                background: `linear-gradient(135deg, ${moduleTheme.primary}, ${moduleTheme.accent})`,
                boxShadow: `0 4px 15px ${moduleTheme.primary}40`,
              }}
            >
              <Save size={14} className="relative z-10" />
              <span className="relative z-10">{tMT.saveProject}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>

            {/* Export PDF — only on grounding tab with results */}
            {activeTab === 'grounding' && results && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                id="cmt-export-pdf"
                onClick={() => setShowReport(true)}
                className="relative flex items-center gap-2 text-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl overflow-hidden group shadow-lg active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${moduleTheme.primary}, ${moduleTheme.accent})`,
                  boxShadow: `0 4px 15px ${moduleTheme.primary}40`,
                }}
              >
                <FileDown size={14} className="relative z-10" />
                <span className="hidden sm:inline relative z-10">{tMT.exportPDF}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </motion.button>
            )}
          </div>
        </header>

        {/* ── Project Tabs Bar ─────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#141414] border-b border-black/5 dark:border-white/5 px-6 flex items-center gap-4 overflow-x-auto custom-scrollbar transition-colors shrink-0 print:hidden">

          {/* Folder icon label */}
          <div className="flex items-center gap-2 border-r border-black/5 dark:border-white/5 pr-4 py-4 shrink-0">
            <button
              id="cmt-open-saved-projects"
              onClick={() => setShowDrawer(true)}
              className="flex items-center gap-1.5 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
              title={t.capitolato.projects}
            >
              <Folder size={14} className="opacity-40" />
              <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest hidden sm:inline">
                {t.capitolato.projects}
              </span>
            </button>
          </div>

          {/* Project tabs */}
          <div className="flex items-center gap-2">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center group shrink-0">
                <div
                  className={`px-4 py-4 transition-all relative flex items-center gap-2 ${
                    activeProjectId === p.id
                      ? 'text-black dark:text-white'
                      : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {activeProjectId === p.id ? (
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => renameProject(p.id, e.target.value.toUpperCase())}
                      className="bg-transparent border-none outline-none text-[10px] font-bold tracking-widest uppercase w-24"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => setActiveProjectId(p.id)}
                      className="text-[10px] font-bold tracking-widest uppercase"
                    >
                      {p.name}
                    </button>
                  )}
                  {activeProjectId === p.id && (
                    <motion.div
                      layoutId="cmt-active-project-tab"
                      className="absolute bottom-0 left-0 w-full h-[2px] z-10"
                      style={{ backgroundColor: moduleTheme.accent }}
                    />
                  )}
                </div>
                {projects.length > 1 && (
                  <button
                    onClick={() => deleteProject(p.id)}
                    className={`p-1.5 rounded transition-all hover:bg-black/5 dark:hover:bg-white/5 ${
                      activeProjectId === p.id ? 'opacity-100 mr-2' : 'opacity-0 group-hover:opacity-100'
                    }`}
                    style={{ color: moduleTheme.accent }}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => addNewProject(t)}
              className="p-4 rounded-xl text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-all relative overflow-hidden group"
              style={{
                background: `linear-gradient(135deg, ${moduleTheme.primary}20, ${moduleTheme.accent}20)`,
              }}
              title={tMT.newProject}
            >
              <Plus size={16} className="relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
            </button>
          </div>
        </div>

        {/* ── Dynamic Content ───────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#f5f5f5] dark:bg-[#0a0a0a] transition-colors">
          <div className="p-6 h-full">
            <AnimatePresence mode="wait">
                  {activeTab === 'grounding' ? (
                <motion.div
                  key="grounding"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                  className="flex flex-col lg:flex-row gap-6 h-full"
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
                  <div className="flex-1 min-h-0">
                    <div className="bg-white dark:bg-[#141414] border border-black/5 dark:border-white/5 shadow-xl shadow-black/5 h-full flex flex-col overflow-hidden rounded-3xl">
                      <div className="px-5 py-4 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0">
                        <p className="text-[9px] font-black tracking-widest uppercase dark:text-white">
                          {tMT.results}
                        </p>
                        {results && (
                          <div className="flex items-center gap-2">
                            {/* Export PDF inline button for results panel too */}
                            <motion.button
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              onClick={() => setShowReport(true)}
                              className="relative flex items-center gap-2 text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl overflow-hidden group shadow-lg active:scale-95"
                              style={{
                                background: `linear-gradient(135deg, ${moduleTheme.primary}, ${moduleTheme.accent})`,
                                boxShadow: `0 4px 15px ${moduleTheme.primary}40`,
                              }}
                            >
                              <FileDown size={14} className="relative z-10" />
                              <span className="relative z-10">{tMT.exportPDF}</span>
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            </motion.button>
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: moduleTheme.accent }} />
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex-1 min-h-0 flex flex-col">
                        <ResultsPanel t={tMT} results={results} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : activeTab === 'ventilation' ? (
                <motion.div
                  key="ventilation"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                  className="flex flex-col h-full"
                >
                  <VentilationTab
                    t={tMT}
                    lang={lang}
                    projectName={activeProject.name}
                    engineerName={user.name || user.email}
                    elements={activeProject.elements}
                    dimensions={activeProject.cabineDimensions}
                    onUpdateElements={updateElements}
                    onUpdateDimensions={updateCabineDimensions}
                  />
                </motion.div>
              ) : activeTab === 'users' ? (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white dark:bg-[#141414] border border-black/5 dark:border-white/5 rounded-3xl p-8 h-full overflow-y-auto"
                >
                  <UserManagement t={TRANSLATIONS[lang]} showToast={showToast} />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      <Toast data={toastData} />

      {/* ── Saved projects drawer ─────────────────────────────────────────── */}
      {showDrawer && (
        <SavedProjectsDrawer
          t={tMT}
          savedProjects={savedProjects}
          onLoad={(p) => { loadProject(p); }}
          onDelete={deleteSavedProject}
          onClose={() => setShowDrawer(false)}
        />
      )}

      {/* ── Grounding relazione di calcolo ────────────────────────────────── */}
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

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}

// ── Wrapper with provider ─────────────────────────────────────────────────────
export function CabineMTModule(props: CabineMTModuleProps) {
  return (
    <CabineMTProvider>
      <CabineMTModuleInner {...props} />
    </CabineMTProvider>
  );
}
