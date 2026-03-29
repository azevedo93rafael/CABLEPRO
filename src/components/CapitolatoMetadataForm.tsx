import React from 'react';
import { Save, FileText, Calendar, User, MapPin, Tag, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';

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

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  type?: string;
  rows?: number;
  fullWidth?: boolean;
}

const InputField = ({ label, value, onChange, placeholder, icon, type = "text", rows, fullWidth }: InputFieldProps) => (
  <div className={`space-y-2 ${fullWidth ? 'md:col-span-2' : ''}`}>
    <label className="text-[11px] font-bold uppercase tracking-wider opacity-50 ml-1 block dark:text-white/50">{label}</label>
    {rows ? (
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#F5F5F5] dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2B4A81]/30 focus:border-[#2B4A81]/30 focus:bg-white dark:focus:bg-white/10 transition-all text-sm dark:text-white placeholder:text-black/20 dark:placeholder:text-white/20 resize-none"
      />
    ) : (
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 dark:text-white/20 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-[#F5F5F5] dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#2B4A81]/30 focus:border-[#2B4A81]/30 focus:bg-white dark:focus:bg-white/10 transition-all text-sm dark:text-white placeholder:text-black/20 dark:placeholder:text-white/20 ${icon ? 'pl-12' : ''}`}
        />
      </div>
    )}
  </div>
);

export const CapitolatoMetadataForm: React.FC<CapitolatoMetadataFormProps> = ({ 
  metadata, 
  onChange, 
  onSave,
  isSaving 
}) => {
  const { lang, moduleTheme } = useApp();
  const t = TRANSLATIONS[lang];
  const tc = t.capitolato;
  
  return (
    <div className="bg-white dark:bg-[#141414] p-8 rounded-3xl border border-black/5 dark:border-white/5 shadow-lg shadow-black/5 dark:shadow-black/20 space-y-6">
      <div className="flex items-center justify-between pb-6 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
            style={{ 
              background: `linear-gradient(135deg, ${moduleTheme.accent}, ${moduleTheme.primary})`,
              boxShadow: `0 8px 24px ${moduleTheme.accent}40`
            }}>
            <FileText size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold uppercase tracking-wide dark:text-white">{tc.projectMetadata}</h3>
            <p className="text-[10px] opacity-40 uppercase tracking-wider dark:text-white/40">{tc.docxTemplate}</p>
          </div>
        </div>
        <button 
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-8 py-3 text-white rounded-xl font-bold text-xs hover:opacity-90 transition-all shadow-lg"
          style={{ 
            background: `linear-gradient(135deg, ${moduleTheme.accent}, ${moduleTheme.primary})`,
            boxShadow: `0 10px 30px ${moduleTheme.accent}40`
          }}
        >
          <Save size={16} />
          {isSaving ? tc.saving : t.preview.saveProject}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Info */}
        <div className="space-y-6 p-6 rounded-2xl bg-[#F5F5F5] dark:bg-white/5">
          <div className="flex items-center gap-2 pb-4 border-b border-black/5 dark:border-white/10">
            <div className="w-2 h-6 rounded-full" style={{ backgroundColor: moduleTheme.accent }} />
            <h4 className="text-xs font-bold uppercase tracking-wider dark:text-white">{tc.projectInfo}</h4>
          </div>
          
          <InputField 
            label={tc.projectTitleLabel}
            value={metadata.project_title}
            onChange={(v) => onChange('project_title', v)}
            placeholder={lang === 'pt-BR' ? 'Ex: Reforma Hotel Roma - Cliente ACME' : lang === 'it' ? 'Es: Ristrutturazione Hotel Roma - Committenza ACME' : 'Ex: Hotel Rome Renovation - Client ACME'}
            icon={<FileText size={16} />}
            fullWidth
          />

          <InputField 
            label={tc.description}
            value={metadata.project_description}
            onChange={(v) => onChange('project_description', v)}
            placeholder={tc.premisePlaceholder}
            rows={4}
            fullWidth
          />

          <InputField 
            label={lang === 'pt-BR' ? 'Endereço' : lang === 'it' ? 'Indirizzo' : 'Address'}
            value={metadata.project_address}
            onChange={(v) => onChange('project_address', v)}
            placeholder={lang === 'pt-BR' ? 'Rua da República, 123 - Milano (MI)' : lang === 'it' ? 'Via della Repubblica, 123 - Milano (MI)' : 'Republic Street, 123 - Milan (MI)'}
            icon={<MapPin size={16} />}
            fullWidth
          />
        </div>

        {/* Document Info */}
        <div className="space-y-6 p-6 rounded-2xl bg-[#F5F5F5] dark:bg-white/5">
          <div className="flex items-center gap-2 pb-4 border-b border-black/5 dark:border-white/10">
            <div className="w-2 h-6 rounded-full" style={{ backgroundColor: moduleTheme.accent }} />
            <h4 className="text-xs font-bold uppercase tracking-wider dark:text-white">{tc.docDetails}</h4>
          </div>
          
          <InputField 
            label={tc.docDateLabel}
            value={metadata.document_title}
            onChange={(v) => onChange('document_title', v)}
            placeholder={lang === 'pt-BR' ? 'Capitolado Técnico Prestacional - Instalações Elétricas' : lang === 'it' ? 'Capitolato Tecnico Prestazionale - Impianti Elettrici' : 'Technical Specification - Electrical Systems'}
            fullWidth
          />

          <InputField 
            label={tc.clientName}
            value={metadata.client}
            onChange={(v) => onChange('client', v)}
            placeholder={tc.clientNamePlaceholder}
            icon={<User size={16} />}
            fullWidth
          />

          <div className="grid grid-cols-2 gap-4">
            <InputField 
              label={tc.revision}
              value={metadata.revisione}
              onChange={(v) => onChange('revisione', v)}
              placeholder="00"
              icon={<Tag size={16} />}
            />
            <InputField 
              label={tc.date}
              value={metadata.data}
              onChange={(v) => onChange('data', v)}
              type="date"
            />
          </div>

          <InputField 
            label={tc.discipline}
            value={metadata.disciplina}
            onChange={(v) => onChange('disciplina', v)}
            placeholder={lang === 'pt-BR' ? 'ELÉ (Elétrico), MEC (Mecânico), ARC (Arquitetônico)' : lang === 'it' ? 'ELE (Elettrico), MEC (Meccanico), ARC (Architettonico)' : 'ELE (Electrical), MEC (Mechanical), ARC (Architectural)'}
            fullWidth
          />
        </div>

        {/* Approvals */}
        <div className="md:col-span-2 space-y-6 p-6 rounded-2xl bg-[#F5F5F5] dark:bg-white/5">
          <div className="flex items-center gap-2 pb-4 border-b border-black/5 dark:border-white/10">
            <div className="w-2 h-6 rounded-full" style={{ backgroundColor: moduleTheme.accent }} />
            <h4 className="text-xs font-bold uppercase tracking-wider dark:text-white">{tc.approvalsAndSignatures}</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InputField 
              label={tc.executedBy}
              value={metadata.eseguito}
              onChange={(v) => onChange('eseguito', v)}
              placeholder={lang === 'pt-BR' ? 'Eng. Mario Rossi' : lang === 'it' ? 'Ing. Mario Rossi' : 'Eng. Mario Rossi'}
            />

            <InputField 
              label={tc.verifiedBy}
              value={metadata.verificato}
              onChange={(v) => onChange('verificato', v)}
              placeholder={lang === 'pt-BR' ? 'Eng. Luigi Bianchi' : lang === 'it' ? 'Ing. Luigi Bianchi' : 'Eng. Luigi Bianchi'}
            />

            <InputField 
              label={tc.approvedBy}
              value={metadata.approvato}
              onChange={(v) => onChange('approvato', v)}
              placeholder={lang === 'pt-BR' ? 'Dr. Giovanni Verdi' : lang === 'it' ? 'Dott. Giovanni Verdi' : 'Dr. Giovanni Verdi'}
            />
          </div>

          <div className="pt-2">
            <div className="p-5 rounded-xl border" style={{ 
              backgroundColor: `${moduleTheme.accent}08`, 
              borderColor: `${moduleTheme.accent}20` 
            }}>
              <div className="flex items-start gap-4">
                <CheckCircle2 className="shrink-0 mt-0.5" size={20} style={{ color: moduleTheme.accent }} />
                <div>
                  <p className="text-sm font-bold mb-1 dark:text-white" style={{ color: moduleTheme.accent }}>{tc.importantNote}</p>
                  <p className="text-xs opacity-60 leading-relaxed dark:text-white/60">
                    {lang === 'pt-BR' 
                      ? 'Os campos acima serão inseridos automaticamente nos campos correspondentes do modelo DOCX. Certifique-se de que o modelo contém as chaves necessárias (ex: {{"{{project_title}}"}}, {{"{{client}}"}}, {{"{{eseguito}}"}}, etc.).'
                      : lang === 'it'
                      ? "I campi sopra verranno inseriti automaticamente nei segnaposto corrispondenti del template DOCX. Assicurati che il template contenga le chiavi necessarie (es: {\"{{project_title}}\"}, {\"{{client}}\"}, {\"{{eseguito}}\"}, ecc.)."
                      : 'The fields above will be automatically inserted into the corresponding DOCX template placeholders. Ensure the template contains the necessary keys (e.g: {{"{{project_title}}"}}, {{"{{client}}"}}, {{"{{eseguito}}"}}, etc.).'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
