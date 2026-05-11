
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const newPhases = [
  { id: 'ph-1-1', title: '1.1 Posizione dei quadri', category: 'Distribuzione Generale', items: [
    { id: 'it-1-1-1', text: '1.1.1 Verifica degli ingombri', tooltip: 'Verificare che le dimensioni fisiche del quadro elettrico nel disegno corrispondano a quelle reali.' },
    { id: 'it-1-1-2', text: '1.1.2 Verifica posizione e conflitti con porte, pareti, ecc.', tooltip: 'Assicurarsi che l\'apertura delle porte e il passaggio non siano ostruiti.' },
    { id: 'it-1-1-3', text: '1.1.3 Verifica presenza o assenza di contattore e avanquadro', tooltip: 'Controllare se è previsto un quadro di sezionamento a monte o contattori.' },
    { id: 'it-1-1-4', text: '1.1.4 Verifica presenza di tag sui quadri.', tooltip: 'Verificare che ogni quadro abbia la propria etichetta identificativa.' },
    { id: 'it-1-1-5', text: '1.1.5 Schema influenza dei quadri elettrici.', tooltip: 'Controllare la presenza dello schema che indica quali aree sono alimentate da ciascun quadro.' }
  ]},
  { id: 'ph-1-2', title: '1.2. Canaline e Cavidotti', category: 'Distribuzione Generale', items: [
    { id: 'it-1-2-1', text: '1.2.1. Verificare distribuzione canaline', tooltip: 'Controllare che i percorsi delle canaline siano ottimali.' },
    { id: 'it-1-2-2', text: '1.2.2. Verificare percorso di collegamento dei quadri.', tooltip: 'Assicurarsi che i collegamenti tra i quadri seguano il percorso più logico.' },
    { id: 'it-1-2-3', text: '1.2.3. Verificare dimensione dei corrugati, cavidotti, canaline.', tooltip: 'Verificare che il dimensionamento sia idoneo.' },
    { id: 'it-1-2-4', text: '1.2.4. Verificare arrivo di canaline e/o tubi sui quadri. Indicare modo di arrivo.', tooltip: 'Verificare se l\'ingresso nel quadro avviene dall\'alto, dal basso o lateralmente.' },
    { id: 'it-1-2-5', text: '1.2.5. Verificare presenza di tag sugli elementi', tooltip: 'Ogni tratto deve essere identificato secondo le specifiche.' },
    { id: 'it-1-2-6', text: '1.2.6. Fare sezione delle canaline per verificare riempimento delle dorsali (se esecutivo)', tooltip: 'Calcolare lo spazio occupato dai cavi.' }
  ]},
  { id: 'ph-1-3', title: '1.3. Scatole di derivazione', category: 'Distribuzione Generale', items: [
    { id: 'it-1-3-1', text: '1.3.1. Verificare distribuzione delle scatole di derivazione', tooltip: 'Controllare che le scatole siano posizionate in punti strategici.' },
    { id: 'it-1-3-2', text: '1.3.2. Verificare scatola di derivazione sotto i quadri', tooltip: 'Assicurarsi della presenza di una scatola di raccolta cavi sotto ogni quadro.' },
    { id: 'it-1-3-3', text: '1.3.3. Verificare presenza o assenza di dimensione delle scatole', tooltip: 'Verificare che la dimensione della scatola sia indicata.' }
  ]},
  { id: 'ph-1-4', title: '1.4. Pozzetti', category: 'Distribuzione Generale', items: [
    { id: 'it-1-4-1', text: '1.4.1. Verificare presenza o assenza di pozzetti nel projeto', tooltip: 'Controllare se i pozzetti sono stati previsti.' },
    { id: 'it-1-4-2', text: '1.4.2. Verificare presenza o assenza tag di dimensione dei pozzetti', tooltip: 'Ogni pozzetto deve avere indicata la propria dimensione.' }
  ]},
  { id: 'ph-1-5', title: '1.5. Legenda', category: 'Distribuzione Generale', items: [
    { id: 'it-1-5-1', text: '1.5.1. Verificare presenza di tutti gli elementi in legenda', tooltip: 'Ogni simbolo deve essere correttamente riportato.' },
    { id: 'it-1-5-2', text: '1.5.2. Verificare dimensione dei simboli in legenda. Devono essere uguali alla dimensione che si vede in tavola', tooltip: 'Coerenza grafica tra i simboli e la tavola.' },
    { id: 'it-1-5-3', text: '1.5.3. Verificare descrizione degli elementi: specifiche, installazione, dimensione, ecc.', tooltip: 'Le descrizioni devono essere esaustive.' },
    { id: 'it-1-5-4', text: '1.5.4. Verificare presenza della pianta con zona dei quadri', tooltip: 'Verificare se esiste la pianta con la zona dei quadri.' },
    { id: 'it-1-5-5', text: '1.5.5. Verificare presenza o assenza della sezione canaline con circuiti', tooltip: 'Verificare se sono stati prodotti elaborati di dettaglio.' },
    { id: 'it-1-5-6', text: '1.5.6. Verificare presenza o assenza di dettagli costruttivi negli elaborati.', tooltip: 'Assicurarsi che siano presenti i dettagli costruttivi.' }
  ]}
];

async function fixData() {
  try {
    // 1. Get projects
    const { data: projects, error: pError } = await supabase.from('projects').select('id, project_id');
    if (pError) throw pError;

    for (const project of projects) {
      console.log(`Checking project ${project.project_id}...`);
      
      // Check if it has "Distribuzione Generale" phases
      const { data: phases, error: phError } = await supabase
        .from('project_phases')
        .select('id, title, phase_id')
        .eq('project_db_id', project.id)
        .eq('category', 'Distribuzione Generale');
        
      if (phError) throw phError;

      if (phases.length === 0) {
        console.log(`Project ${project.project_id} has no Distribuzione Generale phases. Initializing...`);
        // We should insert them, but let's first try to fix existing ones if any
      } else {
        // Update labels for existing phases
        for (const mPhase of newPhases) {
          const dbPhase = phases.find(p => p.phase_id === mPhase.id || p.title.toLowerCase().includes(mPhase.title.toLowerCase().replace(/^[\d.]+\s*/, '')));
          if (dbPhase) {
            console.log(`Updating phase ${dbPhase.title} -> ${mPhase.title}`);
            await supabase.from('project_phases').update({ title: mPhase.title }).eq('id', dbPhase.id);
            
            // Update items
            const { data: dbItems } = await supabase.from('checklist_items').select('id, label, item_id').eq('phase_db_id', dbPhase.id);
            if (dbItems) {
              for (let i = 0; i < mPhase.items.length; i++) {
                const mItem = mPhase.items[i];
                const dbItem = dbItems.find(it => it.item_id === mItem.id || it.label.toLowerCase().includes(mItem.text.toLowerCase().replace(/^[\d.]+\s*/, '')));
                
                if (dbItem) {
                  console.log(`  Updating item ${dbItem.label} -> ${mItem.text}`);
                  await supabase.from('checklist_items').update({ label: mItem.text, tooltip: mItem.tooltip }).eq('id', dbItem.id);
                } else if (dbItems.length < mPhase.items.length) {
                   // Missing item, could insert here
                }
              }
            }
          }
        }
      }
    }
    console.log('Fix complete!');
  } catch (err) {
    console.error('Error fixing data:', err);
  }
}

fixData();
