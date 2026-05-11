import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, Phase, ChecklistItem } from '../types';
import { supabase } from '../../../lib/supabase';

// ─── Template ────────────────────────────────────────────────────────────────
// This is the single source of truth for the checklist structure.
// When a project is created, these phases and items are inserted into the DB.
const TEMPLATE_PHASES: Array<{
  id: string;
  title: string;
  category: string;
  items: Array<{ id: string; label: string; tooltip: string }>;
}> = [
  {
    id: 'ph-1-1', title: '1.1 Posizione dei quadri', category: 'Distribuzione Generale',
    items: [
      { id: 'it-1-1-1', label: '1.1.1 Verifica degli ingombri', tooltip: 'Verificare che le dimensioni fisiche del quadro nel disegno corrispondano a quelle reali.' },
      { id: 'it-1-1-2', label: '1.1.2 Verifica posizione e conflitti con porte, pareti, ecc.', tooltip: 'Assicurarsi che l\'apertura delle porte non sia ostruita da elementi strutturali.' },
      { id: 'it-1-1-3', label: '1.1.3 Verifica presenza o assenza di contattore e avanquadro', tooltip: 'Controllare se è previsto un quadro di sezionamento a monte (avanquadro).' },
      { id: 'it-1-1-4', label: '1.1.4 Verifica presenza di tag sui quadri.', tooltip: 'Verificare che ogni quadro abbia la propria etichetta identificativa (es. QG, Q1).' },
      { id: 'it-1-1-5', label: '1.1.5 Schema influenza dei quadri elettrici.', tooltip: 'Controllare lo schema che indica quali aree dell\'impianto sono alimentate da ciascun quadro.' },
    ]
  },
  {
    id: 'ph-1-2', title: '1.2. Canaline e Cavidotti', category: 'Distribuzione Generale',
    items: [
      { id: 'it-1-2-1', label: '1.2.1. Verificare distribuzione canaline', tooltip: 'Controllare che i percorsi delle canaline siano ottimali e coprano tutte le utenze.' },
      { id: 'it-1-2-2', label: '1.2.2. Verificare percorso di collegamento dei quadri.', tooltip: 'Assicurarsi che i collegamenti tra quadri seguano il percorso più logico e sicuro.' },
      { id: 'it-1-2-3', label: '1.2.3. Verificare dimensione dei corrugati, cavidotti, canaline.', tooltip: 'Verificare che il dimensionamento sia idoneo per contenere tutti i circuiti con margine.' },
      { id: 'it-1-2-4', label: '1.2.4. Verificare arrivo di canaline e/o tubi sui quadri. Indicare modo di arrivo.', tooltip: 'Verificare se l\'ingresso nel quadro avviene dall\'alto, dal basso o lateralmente.' },
      { id: 'it-1-2-5', label: '1.2.5. Verificare presenza di tag sugli elementi', tooltip: 'Ogni tratto di canalina o tubo deve essere identificato secondo le specifiche.' },
      { id: 'it-1-2-6', label: '1.2.6. Fare sezione delle canaline per verificare riempimento delle dorsali (se esecutivo)', tooltip: 'Calcolare lo spazio occupato dai cavi per non superare i limiti di riempimento CEI 64-8.' },
    ]
  },
  {
    id: 'ph-1-3', title: '1.3. Scatole di derivazione', category: 'Distribuzione Generale',
    items: [
      { id: 'it-1-3-1', label: '1.3.1. Verificare distribuzione delle scatole di derivazione', tooltip: 'Controllare che le scatole siano posizionate in punti strategici e ispezionabili.' },
      { id: 'it-1-3-2', label: '1.3.2. Verificare scatola di derivazione sotto i quadri', tooltip: 'Assicurarsi della presenza di una scatola di raccolta cavi immediatamente sotto ogni quadro.' },
      { id: 'it-1-3-3', label: '1.3.3. Verificare presenza o assenza di dimensione delle scatole', tooltip: 'Verificare che la dimensione della scatola sia indicata in pianta e coerente con i cavi.' },
    ]
  },
  {
    id: 'ph-1-4', title: '1.4. Pozzetti', category: 'Distribuzione Generale',
    items: [
      { id: 'it-1-4-1', label: '1.4.1. Verificare presenza o assenza di pozzetti nel progetto', tooltip: 'Controllare se i pozzetti di ispezione sono stati previsti lungo i percorsi interrati.' },
      { id: 'it-1-4-2', label: '1.4.2. Verificare presenza o assenza tag di dimensione dei pozzetti', tooltip: 'Ogni pozzetto deve avere indicata la propria dimensione (es. 40x40, 60x60).' },
    ]
  },
  {
    id: 'ph-1-5', title: '1.5. Legenda', category: 'Distribuzione Generale',
    items: [
      { id: 'it-1-5-1', label: '1.5.1. Verificare presenza di tutti gli elementi in legenda', tooltip: 'Ogni simbolo utilizzato nelle planimetrie deve essere riportato nella legenda.' },
      { id: 'it-1-5-2', label: '1.5.2. Verificare dimensione dei simboli in legenda. Devono essere uguali alla dimensione che si vede in tavola', tooltip: 'Coerenza grafica tra i simboli usati nei grafici e quelli nel riquadro legenda.' },
      { id: 'it-1-5-3', label: '1.5.3. Verificare descrizione degli elementi: specifiche, installazione, dimensione, ecc.', tooltip: 'Le descrizioni devono essere esaustive e includere i dati tecnici del componente.' },
      { id: 'it-1-5-4', label: '1.5.4. Verificare presenza della pianta con zona dei quadri', tooltip: 'Verificare se esiste una tavola di inquadramento generale che mostra le aree per quadro.' },
      { id: 'it-1-5-5', label: '1.5.5. Verificare presenza o assenza della sezione canaline con circuiti', tooltip: 'Verificare se sono stati prodotti elaborati di dettaglio sulle sezioni tipo dei percorsi cavi.' },
      { id: 'it-1-5-6', label: '1.5.6. Verificare presenza o assenza di dettagli costruttivi negli elaborati.', tooltip: 'Assicurarsi che siano presenti dettagli su come installare i componenti.' },
    ]
  },
];

// ─── Store ────────────────────────────────────────────────────────────────────
interface ProjectStore {
  projects: Project[];
  activeProjectId: string | null;
  isLoading: boolean;
  error: string | null;

  fetchProjects: () => Promise<void>;
  setActiveProject: (id: string | null) => void;
  addProject: (name: string, client: string, description: string) => Promise<void>;
  initializeProjectPhases: (projectDbId: string, projectId: string) => Promise<void>;
  toggleItem: (phaseId: string, itemId: string) => Promise<void>;
  updateItemNotes: (phaseId: string, itemId: string, notes: string) => Promise<void>;
  reopenPhase: (phaseId: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,
      isLoading: false,
      error: null,

      // ─── Fetch ──────────────────────────────────────────────────────────
      fetchProjects: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from('projects')
            .select(`
              id, project_id, project_name, client_name, description, start_date, progress,
              project_phases (
                id, phase_id, title, category, status, order_index,
                checklist_items (
                  id, item_id, label, checked, notes, tooltip, order_index
                )
              )
            `)
            .order('created_at', { ascending: false });

          if (error) throw error;

          const mapped: Project[] = (data || []).map(p => ({
            projectId: p.project_id,
            projectName: p.project_name,
            clientName: p.client_name || '',
            startDate: p.start_date || '',
            description: p.description || '',
            progress: p.progress || 0,
            phases: (p.project_phases || [])
              .sort((a: any, b: any) => a.order_index - b.order_index)
              .map((ph: any): Phase => ({
                id: ph.phase_id,
                db_id: ph.id,
                title: ph.title || '',
                category: ph.category || 'Distribuzione Generale',
                status: ph.status || 'active',
                items: (ph.checklist_items || [])
                  .sort((a: any, b: any) => a.order_index - b.order_index)
                  .map((it: any): ChecklistItem => ({
                    id: it.item_id,
                    db_id: it.id,
                    text: it.label || '',
                    checked: it.checked || false,
                    notes: it.notes || '',
                    tooltip: it.tooltip || '',
                  })),
              })),
          }));

          set({ projects: mapped });
        } catch (err: any) {
          console.error('[fetchProjects] error:', err.message);
          set({ error: err.message });
        } finally {
          set({ isLoading: false });
        }
      },

      setActiveProject: (id) => set({ activeProjectId: id }),

      // ─── Add Project ─────────────────────────────────────────────────────
      addProject: async (name, client, description) => {
        set({ isLoading: true });
        try {
          const { data: userData } = await supabase.auth.getUser();
          const projectId = `PRJ-${Date.now()}`;

          const { data: proj, error: projErr } = await supabase
            .from('projects')
            .insert([{
              project_id: projectId,
              project_name: name,
              client_name: client,
              description,
              start_date: new Date().toISOString().split('T')[0],
              progress: 0,
              created_by: userData.user?.id,
            }])
            .select()
            .single();

          if (projErr) throw projErr;

          // Insert phases + items from template
          await get().initializeProjectPhases(proj.id, projectId);

          await get().fetchProjects();
          set({ activeProjectId: projectId });
        } catch (err: any) {
          console.error('[addProject] error:', err.message);
          set({ error: err.message });
        } finally {
          set({ isLoading: false });
        }
      },

      // ─── Initialize Phases (can be called for any existing project too) ──
      initializeProjectPhases: async (projectDbId, projectId) => {
        for (let i = 0; i < TEMPLATE_PHASES.length; i++) {
          const tmpl = TEMPLATE_PHASES[i];
          const { data: ph, error: phErr } = await supabase
            .from('project_phases')
            .insert([{
              project_db_id: projectDbId,
              phase_id: tmpl.id,
              title: tmpl.title,
              category: tmpl.category,
              status: 'active',
              order_index: i,
            }])
            .select()
            .single();

          if (phErr) {
            console.error(`[initPhases] phase insert error for "${tmpl.title}":`, phErr.message);
            continue;
          }

          const itemInserts = tmpl.items.map((it, idx) => ({
            phase_db_id: ph.id,
            item_id: it.id,
            label: it.label,
            tooltip: it.tooltip,
            checked: false,
            notes: '',
            order_index: idx,
          }));

          const { error: itemErr } = await supabase
            .from('checklist_items')
            .insert(itemInserts);

          if (itemErr) {
            console.error(`[initPhases] items insert error for "${tmpl.title}":`, itemErr.message);
          }
        }
      },

      // ─── Toggle Item ─────────────────────────────────────────────────────
      toggleItem: async (phaseId, itemId) => {
        const { projects } = get();
        const phase = projects.flatMap(p => p.phases).find(ph => ph.id === phaseId);
        const item = phase?.items.find(it => it.id === itemId);
        if (!item?.db_id) return;

        try {
          const { error } = await supabase
            .from('checklist_items')
            .update({ checked: !item.checked })
            .eq('id', item.db_id);
          if (error) throw error;
          await get().fetchProjects();
        } catch (err: any) {
          console.error('[toggleItem] error:', err.message);
        }
      },

      // ─── Update Notes ─────────────────────────────────────────────────────
      updateItemNotes: async (phaseId, itemId, notes) => {
        const { projects } = get();
        const phase = projects.flatMap(p => p.phases).find(ph => ph.id === phaseId);
        const item = phase?.items.find(it => it.id === itemId);
        if (!item?.db_id) return;

        try {
          const { error } = await supabase
            .from('checklist_items')
            .update({ notes })
            .eq('id', item.db_id);
          if (error) throw error;
          await get().fetchProjects();
        } catch (err: any) {
          console.error('[updateItemNotes] error:', err.message);
        }
      },

      // ─── Reopen Phase ─────────────────────────────────────────────────────
      reopenPhase: async (phaseId) => {
        const { projects } = get();
        const phase = projects.flatMap(p => p.phases).find(ph => ph.id === phaseId);
        if (!phase?.db_id) return;

        try {
          await supabase.from('project_phases').update({ status: 'active' }).eq('id', phase.db_id);
          await supabase.from('checklist_items').update({ checked: false }).eq('phase_db_id', phase.db_id);
          await get().fetchProjects();
        } catch (err: any) {
          console.error('[reopenPhase] error:', err.message);
        }
      },

      // ─── Delete Project ───────────────────────────────────────────────────
      deleteProject: async (id) => {
        try {
          const { error } = await supabase.from('projects').delete().eq('project_id', id);
          if (error) throw error;
          await get().fetchProjects();
        } catch (err: any) {
          console.error('[deleteProject] error:', err.message);
        }
      },
    }),
    {
      name: 'project-storage',
      partialize: (state) => ({ activeProjectId: state.activeProjectId }),
    }
  )
);
