import React from 'react';
import { Settings, FileText, Info } from 'lucide-react';
import { CapitolatoMetadataForm } from './CapitolatoMetadataForm';
import { CapitolatoMetadata, Translation } from '../types';

interface SettingsPanelProps {
  metadata: CapitolatoMetadata;
  onChange: (field: keyof CapitolatoMetadata, value: string) => void;
  onSave: () => void;
  isSaving: boolean;
  t: Translation;
  templateFile: File | null;
  onTemplateUpload: (file: File) => void;
}

export function SettingsPanel({ 
  metadata, 
  onChange, 
  onSave, 
  isSaving, 
  t, 
  templateFile,
  onTemplateUpload
}: SettingsPanelProps) {
  return (
    <div className="h-full flex flex-col bg-white/50 dark:bg-black/20 backdrop-blur-sm border-l border-black/5 dark:border-white/5 overflow-hidden">
      <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold opacity-40 uppercase tracking-[0.2em]">{t.capitolato.docSettings}</h3>
          <p className="text-[10px] font-bold mt-1 text-blue-500 uppercase tracking-widest">Metadata & Cover</p>
        </div>
        <Settings size={18} className="opacity-20" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar pb-20">
        {/* Template Upload Status (Brief) */}
        <div className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm space-y-4">
           <div className="flex items-center justify-between">
             <h4 className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Capitolo Template</h4>
             <span className={`w-2 h-2 rounded-full ${templateFile ? 'bg-green-500' : 'bg-red-400'}`}></span>
           </div>
           
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-black/5 dark:bg-white/5 rounded-xl flex items-center justify-center opacity-40">
               <FileText size={20} />
             </div>
             <div className="overflow-hidden">
               <p className="text-xs font-bold truncate">{templateFile ? templateFile.name : 'Nessun Modello'}</p>
               <p className="text-[10px] opacity-40 uppercase tracking-widest">DOCX BASIS</p>
             </div>
           </div>

           <label className="block">
             <span className="sr-only">Carica Modello</span>
             <input 
               type="file" 
               accept=".docx"
               onChange={(e) => {
                 const file = e.target.files?.[0];
                 if (file) onTemplateUpload(file);
               }}
               className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:bg-[#401318] file:text-white hover:file:bg-[#5a1b22] file:cursor-pointer"
             />
           </label>
        </div>

        <CapitolatoMetadataForm 
          metadata={metadata} 
          onChange={onChange} 
          onSave={onSave}
          isSaving={isSaving}
        />

        <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-2xl flex items-start gap-4">
          <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Info</p>
            <p className="text-[10px] opacity-60 leading-relaxed italic">
              I dati in questo pannello popolerão a capa e as informações gerais do documento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
