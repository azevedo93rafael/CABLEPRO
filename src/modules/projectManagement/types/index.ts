export interface ChecklistItem {
  id: string;
  db_id?: string;
  text: string;
  checked: boolean;
  notes?: string;
  tooltip?: string;
  details?: string[];
}

export type PhaseStatus = 'completed' | 'active';

export interface Phase {
  id: string;
  db_id?: string;
  title: string;
  category?: string;
  status: PhaseStatus;
  items: ChecklistItem[];
}

export interface Project {
  projectId: string;
  projectName: string;
  clientName: string;
  startDate: string;
  description: string;
  progress: number;
  phases: Phase[];
}
