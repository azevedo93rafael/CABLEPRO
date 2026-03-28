import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://poqdfjpjnrjoindalbnn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvcWRmanBqbnJqb2luZGFsYm5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyODU5NjgsImV4cCI6MjA4Nzg2MTk2OH0.q6-VSWg--VZdUqJQvhMLvBRqerDo9aezQKdM_Iln0qc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase
    .from('User')
    .select('id, email, role')
    .limit(1);
  
  if (error) {
    console.error(error);
    return;
  }
  
  console.log('Valid User Found:', data[0]);
}

run();
