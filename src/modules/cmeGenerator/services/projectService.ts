import { supabase } from '../../../lib/supabase';
import type { CmeState } from '../types';

export interface CmeProject {
  id: string;
  name: string;
  state: Partial<CmeState>;
  created_at: string;
  updated_at: string;
  user_id: string;
}

/**
 * SQL for Supabase to create the table (run this in Supabase SQL Editor):
 * 
 * create table cme_projects (
 *   id uuid default uuid_generate_v4() primary key,
 *   name text not null,
 *   state jsonb not null default '{}'::jsonb,
 *   user_id uuid references auth.users(id),
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null,
 *   updated_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * alter table cme_projects enable row level security;
 * create policy "Users can view all projects" on cme_projects for select to authenticated using (true);
 * create policy "Users can insert projects" on cme_projects for insert to authenticated with check (true);
 * create policy "Users can update all projects" on cme_projects for update to authenticated using (true);
 * create policy "Users can delete all projects" on cme_projects for delete to authenticated using (true);
 */

export async function listProjects(): Promise<CmeProject[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Utilizador não autenticado');

  const { data, error } = await supabase
    .from('cme_projects')
    .select('id, name, created_at, updated_at, user_id') // Avoid loading heavy state array for listing
    .order('updated_at', { ascending: false });

  if (error) {
    if (error.code === '42P01') {
      throw new Error('A tabela "cme_projects" não existe no Supabase. Por favor, crie-a usando o script SQL no ficheiro projectService.ts.');
    }
    throw new Error('Erro ao listar projetos: ' + error.message);
  }
  return data as CmeProject[];
}

export async function loadProject(id: string): Promise<CmeProject> {
  const { data, error } = await supabase
    .from('cme_projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error('Erro ao carregar projeto: ' + error.message);
  return data as CmeProject;
}

export async function saveProject(name: string, state: Partial<CmeState>, id?: string): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Utilizador não autenticado');

  // We need to serialize the Maps in CmeState to Arrays/Objects for JSON storage
  const serializedState = {
    elementos: state.elementos || [],
    resultados: state.resultados ? Array.from(state.resultados.entries()) : [],
    overrides: state.overrides ? Array.from(state.overrides.entries()) : [],
    rawBimOffData: state.rawBimOffData,
  };

  if (id) {
    const { error } = await supabase
      .from('cme_projects')
      .update({ name, state: serializedState, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error('Erro ao atualizar projeto: ' + error.message);
    return id;
  } else {
    const { data, error } = await supabase
      .from('cme_projects')
      .insert([{ name, state: serializedState, user_id: user.id }])
      .select('id')
      .single();
    if (error) throw new Error('Erro ao gravar novo projeto: ' + error.message);
    return data.id;
  }
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase
    .from('cme_projects')
    .delete()
    .eq('id', id);
  if (error) throw new Error('Erro ao eliminar projeto: ' + error.message);
}
