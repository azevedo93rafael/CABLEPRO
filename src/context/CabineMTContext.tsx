import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import {
  CabineMTProject,
  CabineMTInputs,
  DEFAULT_CABIN_DIMENSIONS,
  CALC_VERSION,
} from '../types/cabineMT';
import { VentilationTransformer, CabineDimensions } from '../types/cabineMTVentilation';

// ── Default state ─────────────────────────────────────────────────────────────
const DEFAULT_INPUTS: CabineMTInputs = {
  numTransformers: 1,
  powerKVA: 630,
  primaryVoltageKV: 15,
  secondaryVoltageV: 400,
  shortCircuitVoltagePct: 6,
  faultTimeS: 1,
  conductorMaterial: 'copper',
};

function newProject(name: string): CabineMTProject {
  return {
    id: crypto.randomUUID(),
    name,
    inputs: { ...DEFAULT_INPUTS },
    cabineDimensions: { ...DEFAULT_CABIN_DIMENSIONS },
    transformers: [],
    numSwitchboardColumns: 0,
    calcVersion: CALC_VERSION,
  };
}

// ── Context type ──────────────────────────────────────────────────────────────
interface CabineMTContextType {
  projects: CabineMTProject[];
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
  activeProject: CabineMTProject;
  savedProjects: CabineMTProject[];
  updateInputs: (inputs: CabineMTInputs) => void;
  updateCabineDimensions: (dims: CabineDimensions) => void;
  updateTransformers: (transformers: VentilationTransformer[]) => void;
  updateNumSwitchboardColumns: (num: number) => void;
  saveProject: (showToast: (msg: string, type: 'success' | 'error') => void, t: any) => Promise<void>;
  addNewProject: (t: any) => void;
  deleteProject: (id: string) => void;
  renameProject: (id: string, newName: string) => void;
  loadProject: (project: CabineMTProject) => void;
  deleteSavedProject: (id: string) => Promise<void>;
}

const CabineMTContext = createContext<CabineMTContextType | undefined>(undefined);

// ── Provider ──────────────────────────────────────────────────────────────────
export const CabineMTProvider = ({ children }: { children: ReactNode }) => {
  const { user, isSessionVerified } = useAuth();

  const initialProject = newProject('PROGETTO 1');
  const [projects, setProjects] = useState<CabineMTProject[]>([initialProject]);
  const [activeProjectId, setActiveProjectId] = useState(initialProject.id);
  const [savedProjects, setSavedProjects] = useState<CabineMTProject[]>([]);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) || projects[0],
    [projects, activeProjectId],
  );

  // Load saved projects from Supabase on mount
  useEffect(() => {
    if (user && isSessionVerified) {
      supabase
        .from('cabine_mt_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('last_saved', { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching MT projects:', error);
            return;
          }
          if (!data || data.length === 0) return;

          const safeParse = (str: any, fallback: any) => {
            if (!str) return fallback;
            if (typeof str === 'object') return str; // Supabase JSONB returns objects
            try { return JSON.parse(str); } catch { return fallback; }
          };

          const parsed: CabineMTProject[] = data.map((row) => ({
            id: row.id,
            name: row.name,
            inputs: safeParse(row.inputs, { ...DEFAULT_INPUTS }),
            cabineDimensions: safeParse(row.cabin_dimensions, { ...DEFAULT_CABIN_DIMENSIONS }),
            transformers: safeParse(row.thermal_elements, []), // legacy fallback mapping
            numSwitchboardColumns: row.num_switchboard_columns || 0,
            calcVersion: row.calc_version || CALC_VERSION,
            lastSaved: row.last_saved,
            notes: row.notes,
          }));

          setSavedProjects(parsed);
          // Auto-load the most recent project if user hasn't made changes
          if (
            parsed.length > 0 &&
            projects.length === 1 &&
            projects[0].name === 'PROGETTO 1' &&
            projects[0].transformers.length === 0 &&
            projects[0].numSwitchboardColumns === 0
          ) {
            setProjects([parsed[0]]);
            setActiveProjectId(parsed[0].id);
          }
        });
    } else if (!user && isSessionVerified) {
      setSavedProjects([]);
    }
  }, [user, isSessionVerified]);

  // ── Mutators ─────────────────────────────────────────────────────────────────
  const updateActiveProject = (patch: Partial<CabineMTProject>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === activeProjectId ? { ...p, ...patch } : p)),
    );
  };

  const updateInputs = (inputs: CabineMTInputs) => updateActiveProject({ inputs });
  const updateCabineDimensions = (cabineDimensions: CabineDimensions) =>
    updateActiveProject({ cabineDimensions });
  const updateTransformers = (transformers: VentilationTransformer[]) =>
    updateActiveProject({ transformers });
  const updateNumSwitchboardColumns = (numSwitchboardColumns: number) =>
    updateActiveProject({ numSwitchboardColumns });

  const saveProject = async (
    showToast: (msg: string, type: 'success' | 'error') => void,
    t: any,
  ) => {
    if (!user || !activeProject) {
      showToast(t.cabineMT.mustBeLoggedIn, 'error');
      return;
    }
    const now = new Date().toISOString();
    const updated = { ...activeProject, lastSaved: now };

    try {
      const { error } = await supabase.from('cabine_mt_projects').upsert({
        id: updated.id,
        name: updated.name,
        user_id: user.id,
        inputs: updated.inputs,
        cabin_dimensions: updated.cabineDimensions,
        thermal_elements: updated.transformers, // mapping transformers to the JSON column
        num_switchboard_columns: updated.numSwitchboardColumns,
        calc_version: updated.calcVersion,
        last_saved: now,
        notes: updated.notes ?? null,
      });

      if (!error) {
        updateActiveProject({ lastSaved: now });
        setSavedProjects((prev) => {
          const idx = prev.findIndex((p) => p.id === updated.id);
          return idx >= 0
            ? prev.map((p, i) => (i === idx ? updated : p))
            : [updated, ...prev];
        });
        showToast(t.cabineMT.projectSaved, 'success');
      } else {
        console.error('Supabase save error:', error);
        showToast(`Errore: ${error.message}`, 'error');
      }
    } catch (err: any) {
      showToast(`Errore: ${err.message}`, 'error');
    }
  };

  const addNewProject = (t: any) => {
    const name = `${t.cabineMT.newProject.toUpperCase()} ${projects.length + 1}`;
    const p = newProject(name);
    setProjects((prev) => [...prev, p]);
    setActiveProjectId(p.id);
  };

  const deleteProject = (id: string) => {
    if (projects.length <= 1) return;
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (activeProjectId === id) {
      setActiveProjectId(projects.find((p) => p.id !== id)?.id || projects[0].id);
    }
  };

  const renameProject = (id: string, newName: string) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name: newName } : p)));
  };

  const loadProject = (project: CabineMTProject) => {
    setProjects((prev) => {
      if (prev.find((p) => p.id === project.id)) {
        setActiveProjectId(project.id);
        return prev;
      }
      setActiveProjectId(project.id);
      return [...prev, project];
    });
  };

  const deleteSavedProject = async (id: string) => {
    const { error } = await supabase.from('cabine_mt_projects').delete().eq('id', id);
    if (!error) setSavedProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <CabineMTContext.Provider
      value={{
        projects,
        activeProjectId,
        setActiveProjectId,
        activeProject,
        savedProjects,
        updateInputs,
        updateCabineDimensions,
        updateTransformers,
        updateNumSwitchboardColumns,
        saveProject,
        addNewProject,
        deleteProject,
        renameProject,
        loadProject,
        deleteSavedProject,
      }}
    >
      {children}
    </CabineMTContext.Provider>
  );
};

export const useCabineMT = () => {
  const ctx = useContext(CabineMTContext);
  if (!ctx) throw new Error('useCabineMT must be used within CabineMTProvider');
  return ctx;
};
