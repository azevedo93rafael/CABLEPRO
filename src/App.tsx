import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useApp } from './context/AppContext';
import { useProject } from './context/ProjectContext';
import { useDatabase } from './hooks/useDatabase';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardView } from './components/views/DashboardView';
import { StructureManagement } from './components/views/StructureManagement';
import { CableManagement } from './components/views/CableManagement';
import { DatabaseView } from './components/views/DatabaseView';
import { UserManagement } from './components/UserManagement';
import { CapitolatoModule } from './components/CapitolatoModule';
import { CabineMTModule } from './components/CabineMTModule';
import { ChecklistPage } from './modules/projectManagement/pages/ChecklistPage';
import ProjectDashboard from './modules/projectManagement/pages/ProjectDashboard';
import { ProjectDetailsView } from './modules/projectManagement/pages/ProjectDetailsView';
import { useProjectStore } from './modules/projectManagement/store/projectStore';
import { TRANSLATIONS } from './constants';

import { supabase } from './lib/supabase';
import { Toast } from './components/Toast';
import { Login } from './components/Login';
import { ModuleSelector } from './components/ModuleSelector';
import { ShortcutsModal } from './components/ShortcutsModal';

export default function App() {
  const { user, setUser, isSessionVerified } = useAuth();
  const { lang, setLang, darkMode, activeTab, activeModule, setActiveModule, toastData, showToast } = useApp();
  const { customCables, customStructures } = useDatabase();
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Project Management sub-navigation
  const [pmView, setPmView] = useState<'dashboard' | 'details' | 'checklist' | 'users'>('dashboard');
  const { setActiveProject } = useProjectStore();

  if (!isSessionVerified) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Render Login UI if missing user
  if (!user) {
    return <Login t={TRANSLATIONS[lang]} onLogin={(u) => {
      setUser(u);
      localStorage.setItem('cablepro_user', JSON.stringify(u));
    }} />;
  }

  // Module Selector logic
  if (!activeModule) {
    const ALL_MODULES = ['cablefill', 'capitolato', 'cabine-mt', 'project-management'];
    const allowedModules = user.role === 'admin' ? ALL_MODULES : (user.accessible_modules || []);
    return <ModuleSelector onSelect={setActiveModule} t={TRANSLATIONS[lang]} lang={lang} setLang={setLang} allowedModules={allowedModules} />;
  }

  // Capitolato has its own full-screen layout – render it outside MainLayout
  if (activeModule === 'capitolato') {
    return (
      <CapitolatoModule 
        key="capitolato"
        user={user as any} 
        onBack={() => setActiveModule(null)} 
        showToast={showToast} 
      />
    );
  }

  // Cabine MT has its own full-screen layout – render it outside MainLayout
  if (activeModule === 'cabine-mt') {
    return (
      <CabineMTModule
        key="cabine-mt"
        user={user as any}
        onBack={() => setActiveModule(null)}
        showToast={showToast}
      />
    );
  }

  // Project Management module
  if (activeModule === 'project-management') {
    return (
      <ProjectDashboard 
        view={pmView}
        onSetView={(v) => setPmView(v)}
        onViewDetails={(id) => {
          setActiveProject(id);
          setPmView('details');
        }}
        onBack={() => setActiveModule(null)}
      />
    );
  }

  return (
    <MainLayout
      isShortcutsModalOpen={isShortcutsModalOpen}
      setIsShortcutsModalOpen={setIsShortcutsModalOpen}
      isReportModalOpen={isReportModalOpen}
      setIsReportModalOpen={setIsReportModalOpen}
      customCables={customCables}
      customStructures={customStructures}
    >
      {activeModule === 'cablefill' && (
        <>
          {activeTab === 'dashboard' && <DashboardView key="dashboard" />}
          {activeTab === 'trays' && <StructureManagement key="trays" type="tray" />}
          {activeTab === 'conduits' && <StructureManagement key="conduits" type="conduit" />}
          {activeTab === 'cables' && <CableManagement key="cables" />}
          {activeTab === 'database' && <DatabaseView key="database" />}
          {activeTab === 'users' && user.role === 'admin' && <UserManagement key="users" t={TRANSLATIONS[lang]} showToast={showToast} />}
        </>
      )}
    </MainLayout>
  );
}
