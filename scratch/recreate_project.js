import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// First check what user we can use
async function getOrCreateProject() {
  console.log('=== RECREATING PROJECT ===\n');

  // Check RLS - try to insert without auth
  const projectId = 'PRJ-2025-001';
  const projectName = 'Progetto Esecutivo - Rilo Elettrico';

  // Check if auth is needed
  const { data: authData } = await supabase.auth.getSession();
  console.log('Session:', authData.session ? `User: ${authData.session.user.email}` : 'No session');

  // Try inserting directly
  const { data: projData, error: projErr } = await supabase
    .from('projects')
    .insert([{
      project_id: projectId,
      project_name: projectName,
      client_name: 'Industrie Meccaniche S.p.A.',
      description: 'Gestione completa del sistema elettrico.',
      start_date: '2025-05-01',
      progress: 0
    }])
    .select()
    .single();

  if (projErr) {
    console.error('ERROR inserting project:', projErr.message, projErr.code);
    return;
  }

  console.log('Project created:', projData.id);

  const phases = [
    { id: 'ph-1-1', title: '1.1 Posizione dei quadri', category: 'Distribuzione Generale', items: [
      { id: 'it-1-1-1', label: '1.1.1 Verifica degli ingombri', tooltip: 'Verificare che le dimensioni fisiche del quadro corrispondano a quelle reali.' },
      { id: 'it-1-1-2', label: '1.1.2 Verifica posizione e conflitti con porte, pareti, ecc.', tooltip: 'Assicurarsi che l\'apertura delle porte non sia ostruita.' },
      { id: 'it-1-1-3', label: '1.1.3 Verifica presenza o assenza di contattore e avanquadro', tooltip: 'Controllare se è previsto un quadro di sezionamento a monte.' },
      { id: 'it-1-1-4', label: '1.1.4 Verifica presenza di tag sui quadri.', tooltip: 'Verificare che ogni quadro abbia la propria etichetta identificativa.' },
      { id: 'it-1-1-5', label: '1.1.5 Schema influenza dei quadri elettrici.', tooltip: 'Controllare lo schema che indica quali aree sono alimentate da ciascun quadro.' }
    ]},
    { id: 'ph-1-2', title: '1.2. Canaline e Cavidotti', category: 'Distribuzione Generale', items: [
      { id: 'it-1-2-1', label: '1.2.1. Verificare distribuzione canaline', tooltip: 'Controllare che i percorsi delle canaline siano ottimali.' },
      { id: 'it-1-2-2', label: '1.2.2. Verificare percorso di collegamento dei quadri.', tooltip: 'Assicurarsi che i collegamenti tra quadri seguano il percorso più logico.' },
      { id: 'it-1-2-3', label: '1.2.3. Verificare dimensione dei corrugati, cavidotti, canaline.', tooltip: 'Verificare che il dimensionamento sia idoneo.' },
      { id: 'it-1-2-4', label: '1.2.4. Verificare arrivo di canaline e/o tubi sui quadri. Indicare modo di arrivo.', tooltip: 'Verificare se l\'ingresso nel quadro avviene dall\'alto, dal basso o lateralmente.' },
      { id: 'it-1-2-5', label: '1.2.5. Verificare presenza di tag sugli elementi', tooltip: 'Ogni tratto deve essere identificato secondo le specifiche.' },
      { id: 'it-1-2-6', label: '1.2.6. Fare sezione delle canaline per verificare riempimento delle dorsali (se esecutivo)', tooltip: 'Calcolare lo spazio occupato dai cavi.' }
    ]},
    { id: 'ph-1-3', title: '1.3. Scatole di derivazione', category: 'Distribuzione Generale', items: [
      { id: 'it-1-3-1', label: '1.3.1. Verificare distribuzione delle scatole di derivazione', tooltip: 'Controllare che le scatole siano posizionate in punti strategici.' },
      { id: 'it-1-3-2', label: '1.3.2. Verificare scatola di derivazione sotto i quadri', tooltip: 'Assicurarsi della presenza di una scatola di raccolta cavi sotto ogni quadro.' },
      { id: 'it-1-3-3', label: '1.3.3. Verificare presenza o assenza di dimensione delle scatole', tooltip: 'Verificare che la dimensione della scatola sia indicata.' }
    ]},
    { id: 'ph-1-4', title: '1.4. Pozzetti', category: 'Distribuzione Generale', items: [
      { id: 'it-1-4-1', label: '1.4.1. Verificare presenza o assenza di pozzetti nel progetto', tooltip: 'Controllare se i pozzetti sono stati previsti.' },
      { id: 'it-1-4-2', label: '1.4.2. Verificare presenza o assenza tag di dimensione dei pozzetti', tooltip: 'Ogni pozzetto deve avere indicata la propria dimensione.' }
    ]},
    { id: 'ph-1-5', title: '1.5. Legenda', category: 'Distribuzione Generale', items: [
      { id: 'it-1-5-1', label: '1.5.1. Verificare presenza di tutti gli elementi in legenda', tooltip: 'Ogni simbolo deve essere correttamente riportato.' },
      { id: 'it-1-5-2', label: '1.5.2. Verificare dimensione dei simboli in legenda. Devono essere uguali alla dimensione che si vede in tavola', tooltip: 'Coerenza grafica tra i simboli e la tavola.' },
      { id: 'it-1-5-3', label: '1.5.3. Verificare descrizione degli elementi: specifiche, installazione, dimensione, ecc.', tooltip: 'Le descrizioni devono essere esaustive.' },
      { id: 'it-1-5-4', label: '1.5.4. Verificare presenza della pianta con zona dei quadri', tooltip: 'Verificare se esiste la pianta con la zona dei quadri.' },
      { id: 'it-1-5-5', label: '1.5.5. Verificare presenza o assenza della sezione canaline con circuiti', tooltip: 'Verificare se sono stati prodotti elaborati di dettaglio.' },
      { id: 'it-1-5-6', label: '1.5.6. Verificare presenza o assenza di dettagli costruttivi negli elaborati.', tooltip: 'Assicurarsi che siano presenti i dettagli costruttivi.' }
    ]}
  ];

  for (let i = 0; i < phases.length; i++) {
    const ph = phases[i];
    const { data: phData, error: phErr } = await supabase
      .from('project_phases')
      .insert([{
        project_db_id: projData.id,
        phase_id: ph.id,
        title: ph.title,
        category: ph.category,
        status: 'active',
        order_index: i
      }])
      .select()
      .single();

    if (phErr) { console.error('ERROR phase:', phErr.message); continue; }
    console.log(`Phase created: ${ph.title}`);

    const itemInserts = ph.items.map((it, idx) => ({
      phase_db_id: phData.id,
      item_id: it.id,
      label: it.label,
      tooltip: it.tooltip,
      checked: false,
      notes: '',
      order_index: idx
    }));

    const { error: itemErr } = await supabase.from('checklist_items').insert(itemInserts);
    if (itemErr) { console.error('ERROR items:', itemErr.message); }
    else { console.log(`  -> ${ph.items.length} items inserted`); }
  }

  console.log('\n=== DONE ===');
}

getOrCreateProject();
