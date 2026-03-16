import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useProject } from '../../context/ProjectContext';
import { TRANSLATIONS } from '../../constants';
// Icons
import { 
  LayoutDashboard, Layers, CircleDot, Database, ChevronLeft, Save, Folder, LogOut, Sun, Moon, Keyboard, Plus, Zap, User as UserIcon, X, Download, FileText, Globe
} from 'lucide-react';
import { Cable, StandardStructure, Language } from '../../types';
import { Toast } from '../Toast';
import { Logo } from '../Logo';
import { ReportModal } from '../ReportModal';
import { ShortcutsModal } from '../ShortcutsModal';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

interface MainLayoutProps {
  children: React.ReactNode;
  isShortcutsModalOpen: boolean;
  setIsShortcutsModalOpen: (open: boolean) => void;
  isReportModalOpen: boolean;
  setIsReportModalOpen: (open: boolean) => void;
  customCables: Cable[];
  customStructures: StandardStructure[];
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer transition-all border border-transparent hover:border-white/10`} onClick={onClick}>
      <div className={`p-2 rounded ${active ? 'bg-white text-[#81292C]' : 'bg-white/5 text-white/60'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold tracking-wider uppercase ${active ? 'text-white' : 'text-white/60'}`}>{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>}
    </div>
  );
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  isShortcutsModalOpen, 
  setIsShortcutsModalOpen,
  isReportModalOpen,
  setIsReportModalOpen,
  customCables,
  customStructures
}) => {
  const { lang, setLang, darkMode, setDarkMode, activeTab, setActiveTab, activeModule, setActiveModule, toastData, showToast } = useApp();
  const { user, setUser } = useAuth();
  const { 
    projects, 
    activeProject, 
    activeProjectId, 
    setActiveProjectId, 
    savedProjects, 
    loadProject, 
    saveProject, 
    addNewProject, 
    deleteProject, 
    renameProject 
  } = useProject();
  
  const t = TRANSLATIONS[lang];

  if (!activeProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] dark:bg-[#0a0a0a]">
        <div className="text-sm font-bold text-[#81292C] animate-pulse">CARREGANDO PROJETO...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#efefef] dark:bg-[#0A0A0A] font-sans text-[#5a5a5a] dark:text-[#F5F5F5] transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-[#401318] dark:bg-[#000000] text-white flex flex-col border-r border-white/5 shrink-0 z-20">
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <Logo className="w-10 h-10 text-white dark:text-[#6A1B1B]" />
          <div>
            <h1 className="text-sm font-bold tracking-wider">CABLEFILL PRO</h1>
            <p className="text-[10px] opacity-50">{t.sidebar.appSubtitle}</p>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-white/10">
          <button 
            onClick={() => setActiveModule(null)}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-[10px] font-bold uppercase tracking-widest"
          >
            <ChevronLeft size={14} />
            Torna al Selettore
          </button>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-8 overflow-y-auto custom-scrollbar">
          <div>
            <p className="text-[10px] font-bold opacity-40 mb-4 tracking-widest">{t.sidebar.overview}</p>
            <div className="space-y-1">
              <NavItem 
                icon={<LayoutDashboard size={18} />} 
                label={t.sidebar.overview} 
                active={activeTab === 'dashboard'} 
                onClick={() => setActiveTab('dashboard')}
              />
              <NavItem 
                icon={<Layers size={18} />} 
                label={t.sidebar.cableTrays} 
                active={activeTab === 'trays'} 
                onClick={() => setActiveTab('trays')}
              />
              <NavItem 
                icon={<CircleDot size={18} />} 
                label={t.sidebar.conduits} 
                active={activeTab === 'conduits'} 
                onClick={() => setActiveTab('conduits')}
              />
              <NavItem 
                icon={<Zap size={18} />} 
                label={t.sidebar.cables} 
                active={activeTab === 'cables'} 
                onClick={() => setActiveTab('cables')}
              />
              {user?.role === 'admin' && (
                <NavItem 
                  icon={<UserIcon size={18} />} 
                  label={t.userManagement.title} 
                  active={activeTab === 'users'} 
                  onClick={() => setActiveTab('users')}
                />
              )}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold opacity-40 mb-4 tracking-widest">{t.sidebar.projectManagement}</p>
            <div className="space-y-1">
              <NavItem 
                icon={<Database size={18} />} 
                label={t.sidebar.database} 
                active={activeTab === 'database'} 
                onClick={() => setActiveTab('database')}
              />
            </div>
          </div>
        </nav>

        <div className="p-6 border-t border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-white/10 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
              <div className="w-full h-full flex items-center justify-center bg-[#81292C] text-white font-bold uppercase">
                {(user?.name || user?.email || 'U').charAt(0)}
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold leading-tight uppercase truncate">{user?.name || user?.email}</p>
              <p className="text-[9px] opacity-50 uppercase tracking-tighter truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsShortcutsModalOpen(true)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white flex-shrink-0"
            title="Atalhos de Teclado"
          >
            <Keyboard size={18} />
          </button>
          <button 
            onClick={async () => {
              try {
                await supabase.auth.signOut();
              } catch (e) {
                // Ignore
              } finally {
                setUser(null);
                localStorage.removeItem('cablefill_user');
              }
            }}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40 hover:text-white flex-shrink-0"
            title={t.auth.logout}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Bar */}
        <header className="h-16 bg-white dark:bg-[#141414] border-b border-black/5 dark:border-white/5 flex items-center justify-between px-8 transition-colors shrink-0">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{t.header.currentModule}</span>
            <h2 className="text-sm font-bold uppercase tracking-tight">
              {activeTab === 'dashboard' ? t.sidebar.overview : 
               activeTab === 'trays' ? t.sidebar.cableTrays : 
               activeTab === 'conduits' ? t.sidebar.conduits : 
               activeTab === 'cables' ? t.sidebar.cables : 
               activeTab === 'database' ? t.sidebar.database : 
               activeTab === 'users' ? t.userManagement.title : 
               t.sidebar.overview}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#efefef] dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition-all shadow-sm"
              title={darkMode ? t.header.lightMode : t.header.darkMode}
            >
              {darkMode ? (
                <>
                  <Sun size={14} className="text-yellow-400" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">{t.header.lightMode}</span>
                </>
              ) : (
                <>
                  <Moon size={14} className="opacity-60" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">{t.header.darkMode}</span>
                </>
              )}
            </button>
            
            <div className="flex items-center gap-2">
              <Globe size={16} className="opacity-40" />
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

            <button 
              onClick={() => saveProject(showToast, t)}
              className="px-6 py-2 border border-black/10 dark:border-white/10 rounded text-[10px] font-bold hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 transition-all flex items-center gap-2 dark:text-white"
            >
              <Save size={14} className="text-[#81292C]" />
              {t.preview.saveProject}
            </button>

            <div id="export-portal" className="flex items-center"></div>
          </div>
        </header>

        {/* Project Tabs - Always Visible */}
        <div className="bg-white dark:bg-[#141414] border-b border-black/5 dark:border-white/5 px-8 flex items-center gap-6 overflow-x-auto custom-scrollbar transition-colors shrink-0">
          <div className="flex items-center gap-2 border-r border-black/5 dark:border-white/5 pr-6 py-4 shrink-0">
            <Folder size={14} className="opacity-40" />
            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{t.sidebar.projectManagement}</span>
          </div>
          <div className="flex items-center gap-3">
            {projects.map(p => (
              <div key={p.id} className="flex items-center group">
                <div 
                  className={`px-6 py-4 transition-all relative flex items-center gap-2 ${
                    activeProjectId === p.id 
                      ? 'text-[#81292C]' 
                      : 'text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {activeProjectId === p.id ? (
                    <input 
                      type="text"
                      value={p.name}
                      onChange={(e) => renameProject(p.id, e.target.value.toUpperCase())}
                      className="bg-transparent border-none outline-none focus:ring-0 p-0 text-[10px] font-bold tracking-widest uppercase w-24"
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
                      layoutId="activeProjectTab"
                      className="absolute bottom-0 left-0 w-full h-[2px] bg-[#81292C] z-10"
                    />
                  )}
                </div>
                {projects.length > 1 && (
                  <button 
                    onClick={() => deleteProject(p.id)}
                    className={`p-1.5 text-[#81292C] transition-all rounded hover:bg-[#81292C]/10 ${
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
              className="p-4 text-black/40 dark:text-white/40 hover:text-[#81292C] transition-colors"
              title={t.preview.newProject}
            >
              <Plus size={18} />
            </button>
          </div>
        </div>

        {/* Dynamic Content */}
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>

      </main>

      <Toast data={toastData} />
      {isShortcutsModalOpen && (
        <ShortcutsModal 
          isOpen={isShortcutsModalOpen}
          onClose={() => setIsShortcutsModalOpen(false)}
          t={t}
        />
      )}
    </div>
  );
};
