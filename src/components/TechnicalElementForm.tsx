import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, ArrowLeft, Upload, X, Eye, FileText, Zap, Sun, Flame, Network, Layers, SunMedium, Camera, Plus } from 'lucide-react';
import { TechnicalElement } from '../types';
import { MATERIAL_CATEGORIES, TRANSLATIONS } from '../constants';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

interface TechnicalElementFormProps {
  element?: TechnicalElement | null;
  onBack: () => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

function FormSection({ title, children, accentColor }: { title: string; children: React.ReactNode; accentColor: string }) {
  return (
    <div className="bg-white dark:bg-[#141414] p-10 rounded-[32px] border border-black/5 dark:border-white/5 shadow-xl shadow-black/5 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: accentColor }} />
        <h3 className="text-sm font-bold uppercase tracking-widest opacity-80">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">{children}</label>;
}

function getInputClass(accentColor: string) {
  return `w-full bg-[#F5F5F5] dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-5 py-4 focus:ring-2 focus:bg-white dark:focus:bg-white/10 transition-all text-sm`;
}

function getTextareaClass(accentColor: string) {
  return `${getInputClass(accentColor)} resize-none leading-relaxed`;
}

function getCategoryIcon(iconName: string, size = 18) {
  switch (iconName) {
    case 'Zap': return <Zap size={size} />;
    case 'Sun': return <Sun size={size} />;
    case 'Flame': return <Flame size={size} />;
    case 'Network': return <Network size={size} />;
    case 'Layers': return <Layers size={size} />;
    case 'SunMedium': return <SunMedium size={size} />;
    case 'Camera': return <Camera size={size} />;
    default: return <Plus size={size} />;
  }
}

function emptyForm(): Omit<TechnicalElement, 'id' | 'created_at' | 'updated_at'> {
  return {
    titolo: '',
    image: '',
    category_id: '',
    descrizione: '',
    caratteristiche_dimensionali: '',
    riferimenti_normativi: '',
    caratteristiche_tecniche: '',
    tipo_impiego: '',
    modalita_installazione: '',
    controlli_collaudi: '',
    documentazione: '',
    marca: '',
  };
}

export function TechnicalElementForm({ element, onBack, showToast }: TechnicalElementFormProps) {
  const { lang, moduleTheme } = useApp();
  const t = TRANSLATIONS[lang];
  const tc = t.capitolato;

  // Dynamic sections based on language
  const SECTIONS = [
    { key: 'descrizione', label: tc.technicalDescription },
    { key: 'caratteristiche_dimensionali', label: tc.dimensionalCharacteristics },
    { key: 'riferimenti_normativi', label: tc.normativeReferences },
    { key: 'caratteristiche_tecniche', label: tc.technicalCharacteristics },
    { key: 'tipo_impiego', label: tc.typeOfUse },
    { key: 'modalita_installazione', label: lang === 'pt-BR' ? 'Modalidade de Instalação' : lang === 'it' ? "Modalità di Installazione" : 'Installation Method' },
    { key: 'controlli_collaudi', label: tc.controlsAndTests },
    { key: 'documentazione', label: lang === 'pt-BR' ? 'Documentação' : lang === 'it' ? 'Documentazione' : 'Documentation' },
  ] as const;

  type SectionKey = typeof SECTIONS[number]['key'];
  const [form, setForm] = useState<ReturnType<typeof emptyForm>>(() => ({
    ...emptyForm(),
    ...(element || {}),
  }));
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>(element?.image || '');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Re-populate when editing a different element
  useEffect(() => {
    const base = emptyForm();
    setForm({ ...base, ...(element || {}) });
    setImagePreview(element?.image || '');
  }, [element?.id]);

  const updateField = (key: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingImage(true);

    // Immediate base64 preview + fallback storage
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setImagePreview(base64);
      setForm(prev => ({ ...prev, image: base64 }));
    };
    reader.readAsDataURL(file);

    try {
      const path = `technical_elements/${crypto.randomUUID()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('capitolato-assets')
        .upload(path, file, { upsert: false });

      if (!error && data) {
        const { data: urlData } = supabase.storage
          .from('capitolato-assets')
          .getPublicUrl(path);
        if (urlData?.publicUrl) {
          setForm(prev => ({ ...prev, image: urlData.publicUrl }));
          setImagePreview(urlData.publicUrl);
        }
      }
    } catch (err) {
      console.warn('Storage upload failed, using base64 fallback:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!form.titolo.trim()) {
      showToast(tc.titleRequired, 'error');
      return;
    }
    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const payload: TechnicalElement = {
        id: element?.id || crypto.randomUUID(),
        created_at: element?.created_at || now,
        updated_at: now,
        ...form,
      };

      const { error } = await supabase
        .from('technical_elements')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        // Surface the real Supabase error so we can debug table issues
        console.error('Supabase upsert error:', error);
        throw new Error(error.message || JSON.stringify(error));
      }

      showToast(tc.elementSaved, 'success');
      onBack();
    } catch (err: any) {
      console.error('Save error:', err);
      showToast('Errore: ' + (err.message || 'controlla la console per dettagli'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCategory = MATERIAL_CATEGORIES.find(c => c.id === form.category_id);

  return (
    <motion.div
      key="element-form"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full flex flex-col overflow-hidden"
    >
      {/* Sub-header toolbar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#141414] shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold opacity-50 hover:opacity-100 transition-opacity"
        >
          <ArrowLeft size={16} />
          {tc.elementsLibrary}
        </button>
        <div className="flex items-center gap-3">
           <button
            onClick={() => setShowPreview(p => !p)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all border"
            style={{ 
              backgroundColor: showPreview ? moduleTheme.accent : 'transparent',
              color: showPreview ? 'white' : undefined,
              borderColor: showPreview ? moduleTheme.accent : undefined
            }}
          >
            <Eye size={16} />
            {showPreview ? tc.hidePreview : tc.showPreview}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg disabled:opacity-50"
            style={{ 
              background: `linear-gradient(135deg, ${moduleTheme.accent}, ${moduleTheme.primary})`,
              boxShadow: `0 10px 30px ${moduleTheme.accent}40`
            }}
          >
            <Save size={16} />
            {isSaving ? tc.saving : element ? tc.editElement.toUpperCase() : tc.newElement.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Form + optional preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Form column */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6 ${showPreview ? 'w-1/2 flex-none border-r border-black/5 dark:border-white/5' : ''}`}>

          {/* ── General Information ── */}
          <FormSection title={tc.generalInformation} accentColor={moduleTheme.accent}>
            {/* Title */}
            <div className="space-y-2">
              <FieldLabel>{tc.title} *</FieldLabel>
              <input
                type="text"
                value={form.titolo}
                onChange={e => updateField('titolo', e.target.value)}
                placeholder={tc.examplePlaceholder}
                className={getInputClass(moduleTheme.accent)}
              />
            </div>

            {/* Category picker */}
            <div className="space-y-3">
              <FieldLabel>{lang === 'pt-BR' ? 'Categoria / Disciplina' : lang === 'it' ? 'Categoria / Disciplina' : 'Category / Discipline'}</FieldLabel>
              <div className="grid grid-cols-4 gap-3">
                {MATERIAL_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => updateField('category_id', form.category_id === cat.id ? '' : cat.id)}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all border text-center"
                    style={form.category_id === cat.id ? {
                      background: `linear-gradient(135deg, ${moduleTheme.accent}, ${moduleTheme.primary})`,
                      color: 'white',
                      borderColor: moduleTheme.accent,
                      boxShadow: `0 8px 24px ${moduleTheme.accent}40`
                    } : {
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      borderColor: 'transparent'
                    }}
                  >
                    {getCategoryIcon(cat.icon)}
                    <span className="text-[9px] font-bold uppercase tracking-wider leading-tight">{cat.name}</span>
                  </button>
                ))}
              </div>
              {selectedCategory && (
                <p className="text-[10px] opacity-40 ml-1">
                  {tc.selectedCategory} <span className="font-bold">{selectedCategory.name}</span>
                </p>
              )}
            </div>

            {/* Image upload */}
            <div className="space-y-3">
              <FieldLabel>{tc.imageReference}</FieldLabel>
              <div className="flex gap-6 items-start">
                <div
                  className="w-40 h-40 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 relative cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload size={24} className="text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="text-center space-y-2 opacity-30">
                  {isUploadingImage
                    ? <div className="w-6 h-6 border-4 border-[#401318] border-t-transparent rounded-full animate-spin mx-auto" />
                    : <><Upload size={24} className="mx-auto" /><p className="text-[10px] font-bold uppercase tracking-widest">{tc.upload}</p></>
                  }
                    </div>
                  )}
                </div>

                <div className="space-y-3 flex-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="flex items-center gap-2 px-5 py-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                  >
                    <Upload size={16} />
                    {isUploadingImage ? tc.uploading : tc.chooseFile}
                  </button>
                  <p className="text-[10px] opacity-30 leading-relaxed">
                    {lang === 'pt-BR' ? 'PNG, JPG ou WEBP. A imagem é convertida em base64 para exportação DOCX.' : lang === 'it' ? "PNG, JPG o WEBP. L'immagine è convertita in base64 per l'esportazione DOCX." : 'PNG, JPG or WEBP. Image is converted to base64 for DOCX export.'}
                  </p>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => { setImagePreview(''); updateField('image', ''); }}
                      className="flex items-center gap-1 text-[10px] font-bold text-red-500 hover:text-red-600 transition-colors"
                    >
                      <X size={12} />
                      {tc.removeImage}
                    </button>
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                  e.target.value = '';
                }}
              />
            </div>
          </FormSection>

          {/* ── Dynamic text sections ── */}
          {SECTIONS.map(({ key, label }) => (
            <FormSection key={key} title={label} accentColor={moduleTheme.accent}>
              <textarea
                rows={5}
                value={form[key as SectionKey] || ''}
                onChange={e => updateField(key as SectionKey, e.target.value)}
                placeholder={`Inserisci ${label.toLowerCase()}...`}
                className={getTextareaClass(moduleTheme.accent)}
              />
            </FormSection>
          ))}

          {/* ── Brand ── */}
          <FormSection title="Marca / Costruttore di Riferimento" accentColor={moduleTheme.accent}>
            <div className="space-y-2">
              <FieldLabel>Marca</FieldLabel>
              <input
                type="text"
                value={form.marca || ''}
                onChange={e => updateField('marca', e.target.value)}
                placeholder="Es. ABB, BTICINO, SCHNEIDER o equivalente approvato"
                className={getInputClass(moduleTheme.accent)}
              />
            </div>
          </FormSection>
        </div>

        {/* Preview panel */}
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-1/2 flex-none overflow-y-auto custom-scrollbar p-8 bg-[#f0f0f0] dark:bg-[#0d0d0d]"
          >
            <div className="mb-6 flex items-center gap-3">
              <FileText size={18} className="opacity-40" />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">{tc.docxStructurePreview}</span>
            </div>

            <div className="bg-white text-black shadow-2xl p-10 font-serif space-y-8 rounded-2xl text-sm">
              {/* Doc title */}
              <div className="border-b-2 border-[#C00000] pb-4">
                <h2 className="text-xl font-bold uppercase tracking-tight">
                  {form.titolo || tc.elementTitlePlaceholder}
                </h2>
                {selectedCategory && (
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">
                    {selectedCategory.name}
                  </p>
                )}
                {form.marca && <p className="text-xs text-gray-500 mt-1">{lang === 'pt-BR' ? 'Marca:' : lang === 'it' ? 'Marca:' : 'Brand:'} {form.marca}</p>}
              </div>

              {/* Image + description */}
              {(imagePreview || form.descrizione) && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{tc.graphicReference}</p>
                    <div className="aspect-square bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {imagePreview
                        ? <img src={imagePreview} alt="" className="w-full h-full object-contain" />
                        : <p className="text-[10px] text-gray-300">{tc.noImage}</p>
                      }
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{tc.technicalDescription}</p>
                    <p className="text-xs leading-relaxed text-justify italic text-gray-600">
                      {form.descrizione || '—'}
                    </p>
                  </div>
                </div>
              )}

              {/* Other sections */}
              {SECTIONS.filter(s => s.key !== 'descrizione').map(({ key, label }) =>
                form[key as SectionKey] ? (
                  <div key={key} className="space-y-1 border-t border-gray-100 pt-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
                    <p className="text-xs leading-relaxed text-gray-700 whitespace-pre-wrap">{form[key as SectionKey]}</p>
                  </div>
                ) : null
              )}

              {/* Brand footer */}
              {form.marca && (
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{tc.referenceBrandFooter}</p>
                  <p className="text-xs font-bold mt-1">{form.marca}</p>
                  <p className="text-[10px] text-gray-400">{lang === 'pt-BR' ? 'ou similar aprovado' : lang === 'it' ? "o equivalente approvato" : 'or approved equivalent'}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
