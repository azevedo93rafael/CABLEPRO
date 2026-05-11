
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      console.log('--- PROJECT SCHEMA ---');
      console.log(Object.keys(projects[0] || {}).join(', '));
      
      const { data: phases, error: phasesError } = await supabase
        .from('project_phases')
        .select('*')
        .limit(1);
        
      console.log('--- PHASE SCHEMA ---');
      console.log(Object.keys(phases[0] || {}).join(', '));
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

checkData();
