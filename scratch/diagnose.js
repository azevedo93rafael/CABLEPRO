import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
  console.log('=== DIAGNOSTICO ===\n');

  const { data: projects, error: pErr } = await supabase
    .from('projects')
    .select('id, project_id, project_name');

  if (pErr) { console.error('ERRO ao buscar projetos:', pErr.message); return; }
  console.log(`Projetos encontrados: ${projects.length}`);
  projects.forEach(p => console.log(` - ${p.project_id} | ${p.project_name} | db_id=${p.id}`));

  if (projects.length === 0) { console.log('\nNenhum projeto no banco!'); return; }

  for (const proj of projects) {
    const { data: phases, error: phErr } = await supabase
      .from('project_phases')
      .select('id, phase_id, title, category')
      .eq('project_db_id', proj.id);

    if (phErr) { console.error('ERRO fases:', phErr.message); continue; }
    console.log(`\nProjeto "${proj.project_name}" tem ${phases.length} fases:`);
    phases.forEach(ph => console.log(`  - [${ph.phase_id}] "${ph.title}" cat="${ph.category}"`));

    if (phases.length > 0) {
      const { data: items, error: iErr } = await supabase
        .from('checklist_items')
        .select('id, item_id, label')
        .eq('phase_db_id', phases[0].id)
        .limit(5);
      if (!iErr) {
        console.log(`  Primeiros itens da fase "${phases[0].title}":`);
        items.forEach(it => console.log(`    - [${it.item_id}] "${it.label}"`));
      }
    }
  }
}

diagnose();
