import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, Clock, CheckCircle, CheckCircle2, Users, Plus, Search, 
  ChevronLeft, Palette, Sun, Moon, Globe, Save, FolderOpen, X, Shield, ClipboardCheck
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';
import { TRANSLATIONS } from '../../../constants';
import { useProjectStore } from '../store/projectStore';
import { ProjectCard } from '../components/ProjectCard';
import { UserManagement } from '../../../components/UserManagement';
import { Logo } from '../../../components/Logo';
import { Language } from '../../../types';
import { ProjectDetailsView } from './ProjectDetailsView';
import { ChecklistPage } from './ChecklistPage';

interface ProjectDashboardProps {
  onSetView: (view: 'dashboard' | 'details' | 'checklist' | 'users') => void;
  view: 'dashboard' | 'details' | 'checklist' | 'users';
  onViewDetails: (id: string) => void;
  onBack: () => void;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  accentColor: string;
}

function NavItem({ icon, label, active = false, onClick, accentColor }: NavItemProps) {
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

export default function ProjectDashboard({ 
  view, 
  onSetView, 
  onViewDetails,
  onBack 
}: ProjectDashboardProps) {
  const { 
    lang, setLang, darkMode, setDarkMode, 
    activeModule, setActiveModule, 
    activeTheme, setActiveTheme, 
    moduleTheme 
  } = useApp();
  
  const { 
    projects, 
    isLoading, 
    error, 
    addProject, 
    deleteProject, 
    fetchProjects,
    setActiveProject
  } = useProjectStore();

  const { user } = useAuth();
  const t = TRANSLATIONS[lang].projectHub;

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', client: '', description: '' });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const filteredProjects = projects.filter(p => {
    const projectName = p.projectName || '';
    const clientName = p.clientName || '';
    const matchesSearch = projectName.toLowerCase().includes(search.toLowerCase()) || 
                          clientName.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || 
                          (filter === 'in_progress' && p.progress < 100) ||
                          (filter === 'completed' && p.progress === 100);
    return matchesSearch && matchesFilter;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await addProject(newProject.name, newProject.client, newProject.description);
    setIsModalOpen(false);
    setNewProject({ name: '', client: '', description: '' });
  };



  const cycleLang = () => {
    const cycle: Record<string, Language> = { 'pt-BR': 'it', 'it': 'en', 'en': 'pt-BR' };
    setLang(cycle[lang] || 'pt-BR');
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans ${darkMode ? 'dark' : ''}`}>
      {/* ── Sidebar ── */}
      <aside 
        className="w-64 flex flex-col border-r border-white/5 shrink-0 z-20 print:hidden"
        style={{ backgroundColor: darkMode ? moduleTheme.dark : moduleTheme.primary }}
      >
        <div 
          className="p-6 flex items-center gap-3 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors"
          onClick={() => onSetView('dashboard')}
        >
          <Logo className="w-10 h-10 text-white" />
          <div>
            <h1 className="text-sm font-bold tracking-wider uppercase text-white">{t.moduleTitle}</h1>
            <p className="text-[10px] opacity-60 uppercase text-white/70">{t.engineeringSystem}</p>
          </div>
        </div>

        <div className="px-4 py-3 border-b border-white/10">
          <button 
            onClick={onBack}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-[10px] font-bold uppercase tracking-widest relative overflow-hidden group"
          >
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform text-white/70" />
            <span className="text-white/90">{t.back}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          </button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-6 overflow-y-auto custom-scrollbar">
          <div>
            <p className="text-[9px] font-bold opacity-40 mb-3 tracking-widest uppercase px-2">{t.dashboard}</p>
            <div className="space-y-1">
              <NavItem 
                icon={<LayoutDashboard size={16} />} 
                label={t.allProjects} 
                active={view === 'dashboard' && filter === 'all'} 
                onClick={() => { setFilter('all'); onSetView('dashboard'); }}
                accentColor={moduleTheme.accent}
              />
              <NavItem 
                icon={<Clock size={16} />} 
                label={t.inProgress} 
                active={view === 'dashboard' && filter === 'in_progress'} 
                onClick={() => { setFilter('in_progress'); onSetView('dashboard'); }}
                accentColor={moduleTheme.accent}
              />
              <NavItem 
                icon={<CheckCircle size={16} />} 
                label={t.completed} 
                active={view === 'dashboard' && filter === 'completed'} 
                onClick={() => { setFilter('completed'); onSetView('dashboard'); }}
                accentColor={moduleTheme.accent}
              />
            </div>
          </div>

          {user?.role === 'admin' && (
            <div>
              <p className="text-[9px] font-bold opacity-40 mb-3 tracking-widest uppercase px-2">{t.userManagement}</p>
              <NavItem 
                icon={<Users size={16} />} 
                label={t.userManagement} 
                active={view === 'users'} 
                onClick={() => onSetView('users')}
                accentColor={moduleTheme.accent}
              />
            </div>
          )}
        </nav>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col bg-[#F8FAFC] dark:bg-[#0D0D0D] overflow-hidden transition-colors duration-300 relative">
        
        {/* Header */}
        <header className="h-16 bg-white dark:bg-[#141414] border-b border-black/5 dark:border-white/5 flex items-center justify-between px-8 shrink-0 z-30">
          <div className="flex items-center gap-3">
            {/* Back Button for Sub-views */}
            {(view === 'details' || view === 'checklist') && (
              <button 
                onClick={() => {
                  if (view === 'checklist') onSetView('details');
                  else onSetView('dashboard');
                }}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all mr-2 group"
                title={TRANSLATIONS[lang].projectHub.back || 'Voltar'}
              >
                <ChevronLeft size={18} className="text-black/60 dark:text-white/60 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            )}

            <div
              className="w-7 h-7 rounded flex items-center justify-center shadow-sm"
              style={{ backgroundColor: moduleTheme.accent }}
            >
              {view === 'users' ? <Users size={14} className="text-white" /> : <LayoutDashboard size={14} className="text-white" />}
            </div>
            <div>
              <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest">
                {TRANSLATIONS[lang].sidebar.projectManagement}
              </p>
              <h2 className="text-[11px] font-bold uppercase tracking-tight dark:text-white">
                {view === 'dashboard' ? t.dashboard : 
                 view === 'details' ? t.projectDetails : 
                 view === 'checklist' ? t.technicalChecklist : 
                 t.userManagement}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/20 dark:text-white/20 transition-colors" size={14} />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-black/5 dark:bg-white/5 border border-transparent focus:border-black/10 dark:focus:border-white/10 rounded-full text-[10px] outline-none transition-all w-48 dark:text-white"
              />
            </div>

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

            {/* Dark mode */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#efefef] dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition-all shadow-sm"
              title={darkMode ? TRANSLATIONS[lang].header.lightMode : TRANSLATIONS[lang].header.darkMode}
            >
              {darkMode
                ? <><Sun size={13} className="text-yellow-400" /><span className="text-[9px] font-bold uppercase tracking-wider">{TRANSLATIONS[lang].header.lightMode}</span></>
                : <><Moon size={13} className="opacity-60 dark:text-white" /><span className="text-[9px] font-bold uppercase tracking-wider">{TRANSLATIONS[lang].header.darkMode}</span></>}
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-sm"
              style={{ backgroundColor: moduleTheme.accent }}
            >
              <Plus size={14} />
              {t.newProject}
            </button>
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
          <div className="max-w-7xl mx-auto h-full">
            {view === 'users' ? (
              <div className="bg-white dark:bg-[#141414] border border-black/5 dark:border-white/10 rounded-xl overflow-hidden h-full flex flex-col shadow-xl">
                <UserManagement t={TRANSLATIONS[lang]} showToast={showToast} />
              </div>
            ) : view === 'details' ? (
              <ProjectDetailsView 
                onBack={() => onSetView('dashboard')}
                onGoToChecklist={() => onSetView('checklist')}
              />
            ) : view === 'checklist' ? (
              <ChecklistPage 
                onBack={() => onSetView('details')}
                showToast={showToast}
              />
            ) : (
              <>

                {/* Projects Grid Section */}
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                      {t.allProjects}
                    </h3>
                  </div>

                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3].map((n) => (
                        <div key={n} className="h-64 bg-black/5 dark:bg-white/5 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : filteredProjects.length === 0 ? (
                    <div className="bg-white dark:bg-[#141414] rounded-xl border border-black/5 dark:border-white/10 p-20 text-center shadow-sm flex flex-col items-center gap-6">
                      <FolderOpen size={48} className="opacity-10 dark:text-white" />
                      <div>
                        <h3 className="text-xl font-bold dark:text-white mb-2 uppercase tracking-tight">{t.noProjectsFound}</h3>
                        <p className="text-black/40 dark:text-white/40 text-xs max-w-sm">{t.searchFiltersHint}</p>
                      </div>
                      {projects.length === 0 && (
                        <button
                          onClick={() => setIsModalOpen(true)}
                          className="flex items-center gap-2 px-6 py-3 rounded-full text-white text-[11px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-md"
                          style={{ backgroundColor: moduleTheme.accent }}
                        >
                          <Plus size={16} />
                          Criar Primeiro Projeto
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                      {filteredProjects.map((project) => (
                        <ProjectCard 
                          key={project.projectId} 
                          project={project} 
                          onViewDetails={onViewDetails}
                          onDelete={deleteProject}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* ── Modal Novo Projeto ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#141414] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden border border-black/5 dark:border-white/10"
            >
              <div className="p-6 border-b border-black/5 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold dark:text-white tracking-widest uppercase">{t.createProjectTitle}</h3>
                  <p className="text-[9px] opacity-40 uppercase mt-1">Configurazione Iniziale</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X size={20} className="dark:text-white" />
                </button>
              </div>
              
              <form onSubmit={handleCreate} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest dark:text-white">{t.projectNameLabel}</label>
                  <input 
                    autoFocus
                    required
                    type="text" 
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    placeholder={t.projectNamePlaceholder}
                    className="w-full px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-lg focus:ring-2 outline-none transition-all dark:text-white text-sm"
                    style={{ borderColor: `${moduleTheme.accent}30` } as any}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest dark:text-white">{t.clientLabel}</label>
                  <input 
                    required
                    type="text" 
                    value={newProject.client}
                    onChange={(e) => setNewProject({...newProject, client: e.target.value})}
                    placeholder={t.clientPlaceholder}
                    className="w-full px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-lg focus:ring-2 outline-none transition-all dark:text-white text-sm"
                    style={{ borderColor: `${moduleTheme.accent}30` } as any}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold opacity-40 uppercase tracking-widest dark:text-white">{t.descriptionLabel}</label>
                  <textarea 
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    placeholder={t.descriptionPlaceholder}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-lg focus:ring-2 outline-none transition-all resize-none dark:text-white text-sm"
                    style={{ borderColor: `${moduleTheme.accent}30` } as any}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black/60 dark:text-white/40 rounded-lg font-bold text-[10px] tracking-widest uppercase transition-all"
                  >
                    {t.cancel}
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-3 text-white rounded-lg font-bold text-[10px] tracking-widest uppercase transition-all shadow-md"
                    style={{ backgroundColor: moduleTheme.accent }}
                  >
                    {t.create}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`fixed bottom-10 right-10 px-6 py-4 rounded-xl shadow-lg z-[200] font-bold text-[10px] uppercase tracking-widest text-white flex items-center gap-3 ${toast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}
          >
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              {toast.type === 'success' ? <CheckCircle size={12} /> : <X size={12} />}
            </div>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
