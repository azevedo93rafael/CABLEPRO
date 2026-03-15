import React from 'react';
import { motion } from 'motion/react';
import { Save, FileText, Calendar, User, MapPin, Tag, CheckCircle2 } from 'lucide-react';

interface CapitolatoMetadata {
  project_title: string;
  project_description: string;
  project_address: string;
  document_title: string;
  client: string;
  revisione: string;
  data: string;
  disciplina: string;
  eseguito: string;
  verificato: string;
  approvato: string;
}

interface CapitolatoMetadataFormProps {
  metadata: CapitolatoMetadata;
  onChange: (field: keyof CapitolatoMetadata, value: string) => void;
  onSave: () => void;
  isSaving?: boolean;
}

export const CapitolatoMetadataForm: React.FC<CapitolatoMetadataFormProps> = ({ 
  metadata, 
  onChange, 
  onSave,
  isSaving 
}) => {
  return (
    <div className="bg-white dark:bg-[#141414] p-10 rounded-[32px] border border-black/5 dark:border-white/5 shadow-xl shadow-black/5 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#401318] rounded-full" />
          <h3 className="text-sm font-bold uppercase tracking-widest opacity-80">Metadata Progetto (Template DOCX)</h3>
        </div>
        <button 
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#401318] text-white rounded-xl font-bold text-sm hover:bg-[#5a1b22] transition-all shadow-lg shadow-[#401318]/20 disabled:opacity-50"
        >
          <Save size={18} />
          {isSaving ? 'Salvataggio...' : 'SALVA METADATI'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Project Section */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-bold opacity-30 uppercase tracking-widest border-b border-black/5 dark:border-white/5 pb-2">Informazioni Progetto</h4>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">Titolo Progetto</label>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={16} />
              <input 
                type="text" 
                value={metadata.project_title}
                onChange={(e) => onChange('project_title', e.target.value)}
                placeholder="Es: Ristrutturazione Hotel Roma"
                className="w-full bg-black/5 dark:bg-white/5 border-none rounded-xl pl-12 pr-5 py-4 focus:ring-2 focus:ring-[#401318]/20 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">Descrizione Progetto</label>
            <textarea 
              rows={3}
              value={metadata.project_description}
              onChange={(e) => onChange('project_description', e.target.value)}
              placeholder="Breve descrizione dell'intervento..."
              className="w-full bg-black/5 dark:bg-white/5 border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#401318]/20 transition-all text-sm resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">Indirizzo</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={16} />
              <input 
                type="text" 
                value={metadata.project_address}
                onChange={(e) => onChange('project_address', e.target.value)}
                placeholder="Via, Civico, Città..."
                className="w-full bg-black/5 dark:bg-white/5 border-none rounded-xl pl-12 pr-5 py-4 focus:ring-2 focus:ring-[#401318]/20 transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* Document Section */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-bold opacity-30 uppercase tracking-widest border-b border-black/5 dark:border-white/5 pb-2">Dettagli Documento</h4>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">Titolo Documento</label>
            <input 
              type="text" 
              value={metadata.document_title}
              onChange={(e) => onChange('document_title', e.target.value)}
              placeholder="Es: Capitolato Tecnico Prestazionale"
              className="w-full bg-black/5 dark:bg-white/5 border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#401318]/20 transition-all text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">Cliente</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={16} />
              <input 
                type="text" 
                value={metadata.client}
                onChange={(e) => onChange('client', e.target.value)}
                placeholder="Nome del committente..."
                className="w-full bg-black/5 dark:bg-white/5 border-none rounded-xl pl-12 pr-5 py-4 focus:ring-2 focus:ring-[#401318]/20 transition-all text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">Revisione</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={16} />
                <input 
                  type="text" 
                  value={metadata.revisione}
                  onChange={(e) => onChange('revisione', e.target.value)}
                  placeholder="00"
                  className="w-full bg-black/5 dark:bg-white/5 border-none rounded-xl pl-12 pr-5 py-4 focus:ring-2 focus:ring-[#401318]/20 transition-all text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">Data</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 opacity-20" size={16} />
                <input 
                  type="date" 
                  value={metadata.data}
                  onChange={(e) => onChange('data', e.target.value)}
                  className="w-full bg-black/5 dark:bg-white/5 border-none rounded-xl pl-12 pr-5 py-4 focus:ring-2 focus:ring-[#401318]/20 transition-all text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">Disciplina</label>
            <input 
              type="text" 
              value={metadata.disciplina}
              onChange={(e) => onChange('disciplina', e.target.value)}
              placeholder="Es: ELE, MECC, ARC..."
              className="w-full bg-black/5 dark:bg-white/5 border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#401318]/20 transition-all text-sm"
            />
          </div>
        </div>

        {/* Approvals Section */}
        <div className="space-y-6">
          <h4 className="text-[10px] font-bold opacity-30 uppercase tracking-widest border-b border-black/5 dark:border-white/5 pb-2">Approvazioni e Firme</h4>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">Eseguito da</label>
            <input 
              type="text" 
              value={metadata.eseguito}
              onChange={(e) => onChange('eseguito', e.target.value)}
              placeholder="Iniziali o Firma..."
              className="w-full bg-black/5 dark:bg-white/5 border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#401318]/20 transition-all text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">Verificato da</label>
            <input 
              type="text" 
              value={metadata.verificato}
              onChange={(e) => onChange('verificato', e.target.value)}
              placeholder="Iniziali o Firma..."
              className="w-full bg-black/5 dark:bg-white/5 border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#401318]/20 transition-all text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">Approvato da</label>
            <input 
              type="text" 
              value={metadata.approvato}
              onChange={(e) => onChange('approvato', e.target.value)}
              placeholder="Iniziali o Firma..."
              className="w-full bg-black/5 dark:bg-white/5 border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#401318]/20 transition-all text-sm"
            />
          </div>

          <div className="pt-4 p-4 rounded-2xl bg-[#401318]/5 dark:bg-white/5 border border-[#401318]/10 dark:border-white/10">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-[#401318] dark:text-white/60 mt-0.5" size={16} />
              <p className="text-[10px] text-justify opacity-60 leading-relaxed font-medium">
                I campi sopra verranno inseriti automaticamente nei segnaposto correspondenti do seu template DOCX (ex: {"{{project_title}}"}). Certifique-se de que o template contém todas as chaves necessárias.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
