import React, { useState, useEffect } from 'react';
import { Upload, Trash2, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { uploadTemplate, getTemplateMeta, deleteTemplate, type TemplateMetadata } from '../services/templateService';
import type { UserProfile } from '../../../context/AuthContext';

interface Props {
  user: UserProfile;
}

export function CmeSettingsPage({ user }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [templateMeta, setTemplateMeta] = useState<TemplateMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplate();
  }, []);

  async function loadTemplate() {
    try {
      const meta = await getTemplateMeta(user.id);
      setTemplateMeta(meta);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      const meta = await uploadTemplate(file, user.id);
      setTemplateMeta(meta);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar o template.');
    } finally {
      setIsUploading(false);
      // clear input
      e.target.value = '';
    }
  }

  async function handleDelete() {
    if (!confirm('Tem a certeza que deseja remover o template base?')) return;
    try {
      await deleteTemplate(user.id);
      setTemplateMeta(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao remover template.');
    }
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Configurações do CME</h1>
          <p className="text-white/60 text-sm mt-1">
            Faça a gestão dos prezzarios e do template base de exportação.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex gap-3 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Panel A: Template */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E94560]/20 flex items-center justify-center text-[#E94560]">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight">Template Base (Excel)</h2>
                <p className="text-xs text-white/40">Ficheiro usado para a exportação final</p>
              </div>
            </div>

            {templateMeta ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-emerald-400" />
                    <div>
                      <p className="text-sm font-medium">{templateMeta.fileName}</p>
                      <p className="text-xs text-white/40">
                        Carregado em {new Date(templateMeta.uploadedAt).toLocaleDateString('pt-PT')} • 
                        {(templateMeta.sizeBytes / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-white/40 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                    title="Remover template"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <p className="text-xs text-blue-300">
                    <strong>Estrutura:</strong> WBSs1, WBSs2, WBSs3, WBSt, Tariffa, Descrizione, UM, Quantità, PU, Totale.
                    <br />O sistema irá usar este ficheiro para preservar a formatação ao exportar.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="p-8 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/30">
                  <Upload size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium">Nenhum template carregado</p>
                  <p className="text-xs text-white/40 mt-1 max-w-[250px]">
                    Faça upload do ficheiro .xlsx que será usado como base para os computos.
                  </p>
                </div>
                <label className="relative overflow-hidden px-4 py-2 mt-2 bg-white/10 hover:bg-white/20 text-sm font-medium rounded-lg cursor-pointer transition-colors">
                  {isUploading ? 'A carregar...' : 'Selecionar .xlsx'}
                  <input
                    type="file"
                    accept=".xlsx"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Panel B: Prezzario (will point to SetupView logic later, or keep it simple here) */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
             <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0F3460]/40 flex items-center justify-center text-blue-400">
                <BarChart2 size={20} />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight">Prezzarios</h2>
                <p className="text-xs text-white/40">Gerido no passo "Carregamento"</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-white/60">
                A gestão dos prezzarios é feita directamente no ecrã de <strong>Carregamento</strong> (Passo 1), onde pode fazer upload de novos ficheiros .xlsx ou .csv e seleccionar qual usar.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
