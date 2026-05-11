
const { createClient } = require('@supabase/supabase-client');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, project_id, name, project_phases(id, title, phase_id)');

  if (error) {
    console.error('Error:', error);
  } else {
    console.log(JSON.stringify(projects, null, 2));
  }
}

checkData();
