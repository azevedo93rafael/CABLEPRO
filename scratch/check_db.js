
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

async function checkData() {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, project_id, name, project_phases(id, title, phase_id, checklist_items(id, label))');

    if (error) {
      console.error('Error fetching data:', error);
    } else {
      console.log('--- DB PROJECTS ---');
      console.log(JSON.stringify(projects, null, 2));
      console.log('------------------');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkData();
