import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Save, 
  FileText, 
  Download, 
  Search, 
  ChevronRight, 
  Zap, 
  Sun, 
  Flame, 
  Network, 
  Layers, 
  SunMedium, 
  Camera, 
  Settings, 
  Users, 
  LayoutDashboard, 
  FolderOpen,
  ArrowLeft,
  CheckCircle2,
  FileDown,
  Info,
  ExternalLink,
  ChevronLeft,
  Check,
  Trash2,
  Globe,
  Moon,
  Keyboard,
  LogOut,
  Upload,
  Library,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { 
  Translation, 
  CapitolatoProject, 
  MaterialCategory, 
  MaterialItem, 
  TechnicalElement, 
  Language, 
  CapitolatoMetadata, 
  ComposerItem 
} from '../types';
import { MATERIAL_CATEGORIES, TRANSLATIONS } from '../constants';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { ElementLibraryView } from './ElementLibraryView';
import { TechnicalElementForm } from './TechnicalElementForm';
import { CapitolatoMetadataForm } from './CapitolatoMetadataForm';
import { DocxPreview } from './DocxPreview';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import ImageModule from 'docxtemplater-image-module-free';
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  Header, 
  Footer, 
  PageNumber, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle,
  VerticalAlign,
  ShadingType,
  ImageRun
} from 'docx';
import { saveAs } from 'file-saver';
import { UserManagement } from './UserManagement';
import { ConfirmModal } from './ConfirmModal';
import { useAuth } from '../context/AuthContext';

interface CapitolatoModuleProps {
  user: { id: string; email: string; role: string };
  t: Translation;
  darkMode: boolean;
  onBack: () => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

export function CapitolatoModule({ user, onBack, showToast }: Omit<CapitolatoModuleProps, 't' | 'darkMode'>) {
  const { lang, setLang, darkMode, setDarkMode, moduleTheme } = useApp();
  const { setUser } = useAuth();
  const t = TRANSLATIONS[lang];
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [materials, setMaterials] = useState<TechnicalElement[]>([]);
  const [activeView, setActiveView] = useState<'dashboard' | 'editor' | 'projects' | 'users' | 'preview' | 'elements' | 'elementForm'>('dashboard');
  const [editingElement, setEditingElement] = useState<TechnicalElement | null>(null);
  const [projects, setProjects] = useState<CapitolatoProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<CapitolatoProject | null>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<TechnicalElement[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Form states for editor
  const [docTitle, setDocTitle] = useState('');
  const [docDate, setDocDate] = useState(new Date().toISOString().split('T')[0]);
  const [docIssuer, setDocIssuer] = useState(user.email);
  const [docDescription, setDocDescription] = useState('');
  const [docPremise, setDocPremise] = useState('');
  const [clientName, setClientName] = useState('');
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // New Metadata State
  const [metadata, setMetadata] = useState<CapitolatoMetadata>({
    project_title: '',
    project_description: '',
    project_address: '',
    document_title: '',
    client: '',
    revisione: '00',
    data: new Date().toISOString().split('T')[0],
    disciplina: 'ELE',
    eseguito: '',
    verificato: '',
    approvato: ''
  });

  const [documentStructure, setDocumentStructure] = useState<ComposerItem[]>([]);
  
  const sensors = [];

  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('technical_elements')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && data) {
        setMaterials(data as TechnicalElement[]);
      }
    } catch (err) {
      console.error('Error fetching technical elements:', err);
    }
  };

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('CapitolatoProject')
      .select('*')
      .eq('userId', user.id)
      .order('lastSaved', { ascending: false });

    if (!error && data) {
      const mapped = data.map((p: any) => ({
        ...p,
        selectedMaterials: typeof p.selectedMaterials === 'string' ? JSON.parse(p.selectedMaterials) : (p.selectedMaterials || []),
        metadata: typeof p.metadata === 'string' ? JSON.parse(p.metadata) : (p.metadata || null),
        ordered_elements: typeof p.ordered_elements === 'string' ? JSON.parse(p.ordered_elements) : (p.ordered_elements || [])
      }));
      setProjects(mapped);
    } else if (error) {
      console.warn('CapitolatoProject table error or missing:', error.message);
    }
  };

  const handleDeleteProjectClick = (id: string) => {
    setProjectToDelete(id);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    
    try {
      const { error } = await supabase.from('CapitolatoProject').delete().eq('id', projectToDelete).eq('userId', user.id);
      if (error) throw error;
      
      setProjects(prev => prev.filter(p => p.id !== projectToDelete));
      
      showToast(t.capitolato.projectDeleted, 'success');
    } catch (err: any) {
      console.error('Error deleting project:', err);
      showToast(t.capitolato.deleteError, 'error');
    } finally {
      setProjectToDelete(null);
    }
  };

  const loadTemplateFromUrl = async (url: string) => {
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      const filename = url.split('/').pop()?.split('_').slice(1).join('_') || 'template.docx';
      const file = new File([blob], filename, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      setTemplateFile(file);
    } catch (err) {
      console.error('Error loading template from URL:', err);
    }
  };

  const handleNewProject = () => {
    setSelectedProject(null);
    setDocTitle('');
    setDocDate(new Date().toISOString().split('T')[0]);
    setDocIssuer(user.email);
    setDocDescription('');
    setDocPremise('');
    setClientName('');
    setSelectedMaterials([]);
    setDocumentStructure([]);
    setMetadata({
      project_title: '',
      project_description: '',
      project_address: '',
      document_title: 'Capitolato Tecnico Prestazionale',
      client: '',
      revisione: '00',
      data: new Date().toISOString().split('T')[0],
      disciplina: 'ELE',
      eseguito: user.email.split('@')[0].toUpperCase(),
      verificato: '',
      approvato: ''
    });
    setTemplateFile(null);
    setActiveView('editor');
  };

  const handleSaveProject = async () => {
    if (!docTitle.trim() && !metadata.project_title.trim()) {
      showToast('Inserisci un titolo per il projeto', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const projectId = selectedProject?.id || crypto.randomUUID();
      let templateUrl = selectedProject?.template_url || '';

      // Upload template if new one is selected
      if (templateFile && (!selectedProject || templateFile.name !== (selectedProject as any).template_name)) {
        const fileExt = templateFile.name.split('.').pop();
        const filePath = `${user.id}/${projectId}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('templates')
          .upload(filePath, templateFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('templates')
          .getPublicUrl(filePath);
          
        templateUrl = publicUrl;
      }

      const projectData = {
        id: projectId,
        userId: user.id,
        title: metadata.project_title || docTitle,
        date: metadata.data || docDate,
        issuer: metadata.eseguito || docIssuer,
        description: metadata.project_description || docDescription,
        premise: docPremise,
        clientName: metadata.client || clientName,
        selectedMaterials: JSON.stringify(selectedMaterials),
        metadata: JSON.stringify(metadata),
        ordered_elements: JSON.stringify(documentStructure),
        template_url: templateUrl,
        lastSaved: new Date().toISOString()
      };

      const { error } = await supabase
        .from('CapitolatoProject')
        .upsert(projectData, { onConflict: 'id' });

      if (error) {
        throw error;
      }

      // Sync local state
      const savedProject = {
        ...projectData,
        selectedMaterials,
        metadata,
        ordered_elements: documentStructure
      };

      setSelectedProject(savedProject as any);
      showToast(t.capitolato.projectSaved, 'success');
      await fetchProjects();
    } catch (err: any) {
      console.error('Error saving project:', err);
      showToast('Errore nel salvataggio: ' + (err.message || 'Sconosciuto'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddChapter = () => {
    const newChapter: ComposerItem = {
      id: crypto.randomUUID(),
      type: 'chapter',
      title: 'NUOVO CAPITOLO',
    };
    setDocumentStructure(prev => [...prev, newChapter]);
  };

  const handleRemoveSection = (id: string) => {
    setDocumentStructure(prev => prev.filter(i => i.id !== id));
  };

  const handleDuplicateSection = (id: string) => {
    const item = documentStructure.find(i => i.id === id);
    if (!item) return;
    const newItem = { ...item, id: crypto.randomUUID() };
    setDocumentStructure(prev => {
      const idx = prev.findIndex(i => i.id === id);
      const newArr = [...prev];
      newArr.splice(idx + 1, 0, newItem);
      return newArr;
    });
  };

  const fetchImageAsBuffer = async (url: string): Promise<ArrayBuffer | null> => {
    try {
      // Try fetching with no-referrer to bypass some hotlink protections
      const response = await fetch(url, { referrerPolicy: 'no-referrer' });
      if (!response.ok) {
        // Try alternative URL if first one fails
        const altUrl = url.includes('www.') ? url.replace('www.', '') : url.replace('https://', 'https://www.');
        const altResponse = await fetch(altUrl, { referrerPolicy: 'no-referrer' });
        if (!altResponse.ok) return null;
        return await altResponse.arrayBuffer();
      }
      return await response.arrayBuffer();
    } catch (err) {
      console.error('Error fetching image:', err);
      return null;
    }
  };

  const RiloLogo = ({ size = "normal", className = "" }: { size?: "normal" | "large", className?: string }) => {
    const isLarge = size === "large";
    const width = isLarge ? 240 : 120;
    const height = isLarge ? 80 : 40;
    
    return (
      <div className={`${className} flex flex-col ${isLarge ? 'items-center' : 'items-end'} select-none`}>
        <svg width={width} height={height} viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* R */}
          <path d="M15 42V12H32C38.6274 12 44 17.3726 44 24C44 28.5 41.5 32.5 37.5 34.5L46 42H38L30.5 35H22V42H15ZM22 18V29H32C34.7614 29 37 26.7614 37 24C37 21.2386 34.7614 19 32 19H22V18Z" fill="currentColor"/>
          {/* i */}
          <rect x="52" y="12" width="6" height="6" fill="currentColor"/>
          <rect x="52" y="21" width="6" height="21" fill="currentColor"/>
          {/* L */}
          <path d="M68 12V42H88V36H74V12H68Z" fill="currentColor"/>
          {/* o */}
          <circle cx="115" cy="26" r="11" stroke="#C00000" strokeWidth="5"/>
          <rect x="103" y="42" width="24" height="5" fill="#C00000"/>
          {/* DIGITAL PLANNING */}
          <text x="15" y="58" fontFamily="Montserrat, sans-serif" fontWeight="800" fontSize="11" fill="#444" letterSpacing="4">DIGITAL PLANNING</text>
        </svg>
      </div>
    );
  };

  const generateLogoBuffer = async (isLarge = false): Promise<ArrayBuffer | null> => {
    const width = isLarge ? 600 : 300;
    const height = isLarge ? 200 : 100;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const svgString = `
      <svg width="${width}" height="${height}" viewBox="0 0 180 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 42V12H32C38.6274 12 44 17.3726 44 24C44 28.5 41.5 32.5 37.5 34.5L46 42H38L30.5 35H22V42H15ZM22 18V29H32C34.7614 29 37 26.7614 37 24C37 21.2386 34.7614 19 32 19H22V18Z" fill="#141414"/>
        <rect x="52" y="12" width="6" height="6" fill="#141414"/>
        <rect x="52" y="21" width="6" height="21" fill="#141414"/>
        <path d="M68 12V42H88V36H74V12H68Z" fill="#141414"/>
        <circle cx="115" cy="26" r="11" stroke="#C00000" stroke-width="5"/>
        <rect x="103" y="42" width="24" height="5" fill="#C00000"/>
        <text x="15" y="58" font-family="Arial, sans-serif" font-weight="800" font-size="11" fill="#444" letter-spacing="4">DIGITAL PLANNING</text>
      </svg>
    `;
    
    const img = new Image();
    const svgBase64 = btoa(unescape(encodeURIComponent(svgString)));
    const url = `data:image/svg+xml;base64,${svgBase64}`;
    
    return new Promise((resolve) => {
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            blob.arrayBuffer().then(resolve);
          } else {
            resolve(null);
          }
        }, 'image/png');
      };
      img.onerror = (e) => {
        console.error('Logo generation error:', e);
        resolve(null);
      };
      img.src = url;
    });
  };
  const generateDocxBlob = async (): Promise<Blob | null> => {
    if (!templateFile) return null;

    // Constrói lista de voci para o backend
    const voci_capitolato = documentStructure.map((item, idx) => {
      if (item.type === 'chapter') {
        return {
           includi: true,
           titolo: item.title,
        };
      } else {
        const mat = materials.find(m => m.id === item.elementId);
        // Tentar formatar características técnicas
        let parsedCarat = [{ nome: "Dettaglio", valore: mat?.caratteristiche_tecniche || "-" }];
        try {
          if (mat?.caratteristiche_tecniche && mat.caratteristiche_tecniche.trim().startsWith('[')) {
             parsedCarat = JSON.parse(mat.caratteristiche_tecniche);
          }
        } catch(e){}

        return {
          includi: true,
          titolo: mat?.titolo || item.title || 'Senza Titolo',
          riferimento_normativo: mat?.riferimenti_normativi || "",
          descrizione: mat?.descrizione || "",
          caratteristiche_tecniche: parsedCarat,
          caratteristiche_dimensionali: mat?.caratteristiche_dimensionali || "",
          tipo_impiego: mat?.tipo_impiego || "",
          documentazione: mat?.documentazione || "",
          image: mat?.image || "",
          modalita_installazione: mat?.modalita_installazione || "",
          controlli_collaudi: mat?.controlli_collaudi || "",
          marche_riferimento: mat?.marca || "o SIMILE",
        };
      }
    });

    // Mapeamento esperado pelo Python Jinja prompt
    const injectionData = {
      nome_progetto: metadata.project_title || docTitle,
      cliente: metadata.client || clientName,
      codice_progetto: metadata.project_address || "Cód",
      revisione: metadata.revisione || "00",
      data_revisione: metadata.data || docDate,
      sottotitolo_1: metadata.project_description || "",
      sottotitolo_2: docTitle,
      titolo_documento: metadata.document_title || "Capitolato Tecnico",
      disciplina: metadata.disciplina || "ELE",
      eseguito: metadata.eseguito || docIssuer,
      verificato: metadata.verificato || "",
      approvato: metadata.approvato || "",
      data_generazione: new Date().toLocaleString(),
      voci_capitolato: voci_capitolato
    };

    const formData = new FormData();
    formData.append('template', templateFile);
    formData.append('dati', JSON.stringify(injectionData));

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/generate`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
       const errBody = await response.text();
       throw new Error(`API Error: ${response.status} - ${errBody}`);
    }

    return await response.blob();
  };

  const handleGeneratePreview = async () => {
    if (!templateFile) return;
    setIsGeneratingPreview(true);
    try {
      const blob = await generateDocxBlob();
      setPreviewBlob(blob);
    } catch (err) {
      console.error("Error generating preview:", err);
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  useEffect(() => {
    if (activeView === 'preview') {
      handleGeneratePreview();
    }
  }, [activeView, selectedMaterials, metadata, templateFile]);

  const handleExportWord = async () => {
    if (!templateFile) {
      showToast('Per favore, carica un template DOCX prima de esportar.', 'error');
      return;
    }

    setIsExporting(true);
    try {
      const out = await generateDocxBlob();
      if (out) {
        saveAs(out, `Capitolato_Tecnico_${metadata.project_title || 'Senza_Titolo'}.docx`);
        showToast('Documento generato con sucesso!', 'success');
      }
    } catch (err: any) {
      console.error('Error exporting template-based DOCX:', err);
      showToast('Errore durante a geração: ' + (err.message || 'Errore imprevisto'), 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const toggleMaterial = (element: TechnicalElement) => {
    setSelectedMaterials(prev => {
      const exists = prev.some(m => m.id === element.id);
      let newSelected;
      if (exists) {
        newSelected = prev.filter(m => m.id !== element.id);
      } else {
        newSelected = [...prev, element];
      }
      
      // Keep documentStructure in sync for the export engine
      setDocumentStructure(newSelected.map(m => ({
        id: m.id,
        type: 'element',
        title: m.titolo,
        elementId: m.id
      })));
      
      return newSelected;
    });
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return <Zap size={20} />;
      case 'Sun': return <Sun size={20} />;
      case 'Flame': return <Flame size={20} />;
      case 'Network': return <Network size={20} />;
      case 'Layers': return <Layers size={20} />;
      case 'SunMedium': return <SunMedium size={20} />;
      case 'Camera': return <Camera size={20} />;
      default: return <Plus size={20} />;
    }
  };

  const filteredMaterials = (materials || []).filter(m => {
    const title = m.titolo || '';
    const brand = m.marca || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || m.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a] text-[#141414] dark:text-white overflow-hidden">
      {/* Sidebar */}
      <aside
        className="w-64 text-white flex flex-col shadow-2xl z-20 border-r border-white/5 transition-colors duration-300"
        style={{ backgroundColor: darkMode ? moduleTheme.dark : moduleTheme.primary }}
      >
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider uppercase">CAPITOLATO PRO</h1>
            <p className="text-[10px] opacity-50">SISTEMA DI INGEGNERIA</p>
          </div>
        </div>

        <div className="px-6 py-4 border-b border-white/10">
          <button 
            onClick={onBack}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-[10px] font-bold uppercase tracking-widest"
          >
            <ChevronLeft size={14} />
            {t.cabineMT.back}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold opacity-30 uppercase tracking-widest mb-4">{t.capitolato.principal}</p>
          
          <button 
            onClick={() => setActiveView('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${activeView === 'dashboard' ? 'bg-white/10' : 'hover:bg-white/5'}`}
          >
            <div className={`p-2 rounded-lg ${activeView === 'dashboard' ? 'bg-white text-white' : 'bg-white/5 text-white/60'}`} style={activeView === 'dashboard' ? { color: moduleTheme.primary } : {}}>
              <LayoutDashboard size={18} />
            </div>
            <span className={`text-[10px] font-bold tracking-wider uppercase ${activeView === 'dashboard' ? 'text-white' : 'text-white/60'}`}>{t.capitolato.dashboard}</span>
            {activeView === 'dashboard' && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>}
          </button>

          <button 
            onClick={() => setActiveView('projects')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${activeView === 'projects' ? 'bg-white/10' : 'hover:bg-white/5'}`}
          >
            <div className={`p-2 rounded-lg ${activeView === 'projects' ? 'bg-white text-white' : 'bg-white/5 text-white/60'}`} style={activeView === 'projects' ? { color: moduleTheme.primary } : {}}>
              <FolderOpen size={18} />
            </div>
            <span className={`text-[10px] font-bold tracking-wider uppercase ${activeView === 'projects' ? 'text-white' : 'text-white/60'}`}>{t.capitolato.projects}</span>
            {activeView === 'projects' && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>}
          </button>

          <button 
            onClick={() => { setEditingElement(null); setActiveView('elements'); }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${activeView === 'elements' || activeView === 'elementForm' ? 'bg-white/10' : 'hover:bg-white/5'}`}
          >
            <div className={`p-2 rounded-lg ${activeView === 'elements' || activeView === 'elementForm' ? 'bg-white text-white' : 'bg-white/5 text-white/60'}`} style={activeView === 'elements' || activeView === 'elementForm' ? { color: moduleTheme.primary } : {}}>
              <FileText size={18} />
            </div>
            <span className={`text-[10px] font-bold tracking-wider uppercase ${activeView === 'elements' || activeView === 'elementForm' ? 'text-white' : 'text-white/60'}`}>{t.capitolato.elementsLibrary}</span>
            {(activeView === 'elements' || activeView === 'elementForm') && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>}
          </button>

          {user.role === 'admin' && (
            <button 
              onClick={() => setActiveView('users')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${activeView === 'users' ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              <div className={`p-2 rounded-lg ${activeView === 'users' ? 'bg-white text-white' : 'bg-white/5 text-white/60'}`} style={activeView === 'users' ? { color: moduleTheme.primary } : {}}>
                <Users size={18} />
              </div>
              <span className={`text-[10px] font-bold tracking-wider uppercase ${activeView === 'users' ? 'text-white' : 'text-white/60'}`}>{t.capitolato.userManagementNav}</span>
              {activeView === 'users' && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>}
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden">
              <div
                className="w-full h-full flex items-center justify-center text-white font-bold uppercase"
                style={{ backgroundColor: moduleTheme.accent }}
              >
                {(user?.email?.charAt(0) || 'U').toUpperCase()}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold leading-tight uppercase truncate">{user?.email?.split('@')[0] || 'USER'}</p>
              <p className="text-[9px] opacity-50 truncate">{user?.email}</p>
            </div>
            <button 
              onClick={() => setIsShortcutsModalOpen(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
              title="Atalhos de Teclado"
            >
              <Keyboard size={16} />
            </button>
            <button 
              onClick={async () => {
                try {
                  await supabase.auth.signOut();
                } catch (e) {
                  // Ignore
                } finally {
                  setUser(null);
                  localStorage.removeItem('cablefill_user');
                }
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
              title={t.auth.logout}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white dark:bg-[#141414] border-b border-black/5 dark:border-white/5 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">{t.header.currentModule}</span>
            <h2 className="text-xl font-bold uppercase tracking-tight">
              {activeView === 'dashboard' ? t.capitolato.dashboard : 
               activeView === 'editor' ? t.capitolato.newCapitolato : 
               activeView === 'users' ? t.userManagement.title :
               activeView === 'projects' ? t.capitolato.existingProjects :
               activeView === 'elements' ? t.capitolato.technicalElementsLibrary :
               activeView === 'elementForm' ? (editingElement ? t.capitolato.editElement : t.capitolato.newElement) :
               t.capitolato.preview}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#efefef] dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition-all shadow-sm"
              title={darkMode ? t.header.lightMode : t.header.darkMode}
            >
              {darkMode ? (
                <>
                  <Sun size={14} className="text-yellow-400" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">{t.header.lightMode}</span>
                </>
              ) : (
                <>
                  <Moon size={14} className="opacity-60" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">{t.header.darkMode}</span>
                </>
              )}
            </button>
            
            <div className="flex items-center gap-2">
              <Globe size={16} className="opacity-40" />
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value as Language)}
                className="text-[10px] font-bold bg-transparent border-none outline-none cursor-pointer uppercase"
              >
                <option value="pt-BR" className="dark:bg-[#141414]">PT-BR</option>
                <option value="en" className="dark:bg-[#141414]">EN</option>
                <option value="it" className="dark:bg-[#141414]">IT</option>
              </select>
            </div>

            {activeView === 'editor' && (
              <>
                <button 
                  onClick={handleSaveProject}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-xl font-bold text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-all disabled:opacity-50"
                >
                  <Save size={18} />
                  {isSaving ? t.capitolato.saving : t.preview.saveProject}
                </button>
                <button 
                  onClick={handleExportWord}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-6 py-2.5 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg disabled:opacity-50"
                  style={{ backgroundColor: moduleTheme.accent }}
                >
                  <FileDown size={18} />
                  {isExporting ? t.capitolato.exporting : t.capitolato.exportToWord}
                </button>
              </>
            )}
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-6xl mx-auto space-y-8 p-8"
              >
                <div className="grid grid-cols-3 gap-6">
                  <button 
                    onClick={handleNewProject}
                    className="col-span-2 group p-10 rounded-[32px] text-white flex flex-col justify-between h-64 shadow-2xl relative overflow-hidden dark:bg-[#1A1A1A]/40 dark:backdrop-blur-xl dark:border-white/5 dark:hover:border-white/20 dark:hover:bg-[#1A1A1A]/60 border border-transparent hover:border-white/30 transition-all duration-500"
                    style={{ 
                      background: `linear-gradient(135deg, ${moduleTheme.primary}, ${moduleTheme.dark})`
                    }}
                  >
                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
                      <Plus size={160} />
                    </div>
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                      <Plus size={32} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold mb-2">{t.capitolato.createNewCapitolato}</h3>
                      <p className="opacity-60">{t.capitolato.startNewDocument}</p>
                    </div>
                  </button>

                  <div className="dark:bg-[#1A1A1A]/40 dark:backdrop-blur-xl p-10 rounded-[32px] dark:border-white/5 border border-black/5 flex flex-col justify-between h-64 shadow-2xl"
                    style={{ 
                      background: `linear-gradient(135deg, ${moduleTheme.primary}20, ${moduleTheme.accent}10)`
                    }}
                  >
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${moduleTheme.accent}20`, color: moduleTheme.accent }}>
                      <FolderOpen size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-1 dark:text-white" style={{ color: moduleTheme.primary }}>{projects.length}</h3>
                      <p className="text-sm font-bold uppercase tracking-widest dark:text-white/40" style={{ color: moduleTheme.primary }}>{t.capitolato.savedProjects}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold uppercase tracking-widest dark:opacity-30 dark:text-white" style={{ color: moduleTheme.primary }}>{t.capitolato.recentProjects}</h4>
                    <button onClick={() => setActiveView('projects')} className="text-sm font-bold hover:underline transition-colors dark:text-white/40 hover:text-white" style={{ color: moduleTheme.accent }}>{t.capitolato.viewAll}</button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {projects.slice(0, 3).map(p => (
                      <button 
                        key={p.id}
                        onClick={() => {
                          setSelectedProject(p);
                          setDocTitle(p.title);
                          setDocDate(p.date);
                          setDocIssuer(p.issuer);
                          setDocDescription(p.description);
                          setDocPremise(p.premise);
                          setClientName(p.clientName || '');
                          setSelectedMaterials(p.selectedMaterials || []);
                          setDocumentStructure(p.ordered_elements || []);
                          if (p.metadata) {
                            setMetadata(p.metadata);
                          }
                          if (p.template_url) {
                            loadTemplateFromUrl(p.template_url);
                          } else {
                            setTemplateFile(null);
                          }
                          setActiveView('editor');
                        }}
                        className="p-6 rounded-2xl border border-black/5 dark:border-white/5 dark:bg-[#141414] flex items-center justify-between hover:border-black/10 dark:hover:border-white/20 transition-all group"
                        style={{ backgroundColor: `${moduleTheme.primary}08` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity"
                            style={{ backgroundColor: `${moduleTheme.accent}15`, color: moduleTheme.accent }}>
                            <FileText size={24} />
                          </div>
                          <div className="text-left">
                            <h5 className="font-bold text-lg dark:text-white">{p.title}</h5>
                            <p className="text-sm dark:opacity-50" style={{ color: `${moduleTheme.primary}80` }}>{p.date} • {p.issuer}</p>
                          </div>
                        </div>
                        <ChevronRight size={20} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all dark:text-white" style={{ color: moduleTheme.accent }} />
                      </button>
                    ))}
                    {projects.length === 0 && (
                      <div className="py-12 text-center opacity-30 italic dark:text-white/30">{t.capitolato.noRecentProjects}</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'editor' && (
              <motion.div 
                key="editor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                 className="h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar"
              >
                  <div className="max-w-5xl mx-auto space-y-12 p-8">
                    {/* TOP: METADATA */}
                    <CapitolatoMetadataForm 
                      metadata={metadata}
                      onChange={(field, val) => {
                        setMetadata(prev => ({ ...prev, [field]: val }));
                        if (field === 'project_title') setDocTitle(val);
                      }}
                      onSave={handleSaveProject}
                      isSaving={isSaving}
                    />

                    {/* NEW SECTION: TEMPLATE & LAYOUT */}
                    <div className="bg-white dark:bg-[#141414] p-8 rounded-3xl border border-black/5 dark:border-white/5 shadow-lg shadow-black/5 dark:shadow-black/20 space-y-6">
                      <div className="flex items-center gap-3 pb-4 border-b border-black/5 dark:border-white/5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                          style={{ 
                            background: `linear-gradient(135deg, ${moduleTheme.accent}, ${moduleTheme.primary})`,
                            boxShadow: `0 8px 24px ${moduleTheme.accent}40`
                          }}>
                          <FileText size={20} />
                        </div>
                        <div>
                          <h3 className="text-base font-bold uppercase tracking-wide dark:text-white">Modello e Layout</h3>
                          <p className="text-[10px] opacity-40 uppercase tracking-wider dark:text-white/40">Template DOCX</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-left">
                        <div className="space-y-4">
                          <p className="text-xs opacity-60 leading-relaxed dark:text-white/60">
                            Carica um arquivo <strong>DOCX</strong> que servirá como base para o seu documento. 
                            O sistema irá injetar os dados nos campos marcados (ex: {"{{project_title}}"}).
                          </p>
                          <div className="flex items-center gap-4 p-4 rounded-xl bg-[#F5F5F5] dark:bg-white/5 border border-black/5 dark:border-white/10">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                              style={{ 
                                background: `linear-gradient(135deg, ${moduleTheme.accent}, ${moduleTheme.primary})`,
                                boxShadow: `0 8px 24px ${moduleTheme.accent}40`
                              }}>
                               <FileText size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="text-sm font-bold truncate dark:text-white">{templateFile ? templateFile.name : (selectedProject?.template_url ? 'Template Esistente' : t.capitolato.noTemplate)}</p>
                               <p className="text-[10px] opacity-40 uppercase tracking-widest dark:text-white/40">Base DOCX</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                           <input 
                             type="file" 
                             id="doc-template-upload"
                             accept=".docx"
                             onChange={(e) => {
                               const file = e.target.files?.[0];
                               if (file) setTemplateFile(file);
                             }}
                             className="hidden"
                           />
                            <label 
                              htmlFor="doc-template-upload"
                              className="flex items-center justify-center gap-3 w-full py-4 text-white rounded-xl font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-lg"
                              style={{ 
                                background: `linear-gradient(135deg, ${moduleTheme.accent}, ${moduleTheme.primary})`,
                                boxShadow: `0 10px 30px ${moduleTheme.accent}40`
                              }}
                           >
                             <Upload size={20} />
                             Scegli Modello DOCX
                           </label>
                           {selectedProject?.template_url && (
                             <p className="text-[10px] text-center opacity-40 font-bold uppercase tracking-widest dark:text-white/40">
                               <CheckCircle2 size={12} className="inline mr-1 text-green-500" /> Modello presente nel database
                             </p>
                           )}
                        </div>
                      </div>
                    </div>

                    {/* SEPARATOR */}
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-px bg-black/5 dark:bg-white/5" />
                      <h4 className="text-[10px] font-bold opacity-30 uppercase tracking-[0.3em] dark:text-white/30">Selezione Elementi</h4>
                      <div className="flex-1 h-px bg-black/5 dark:bg-white/5" />
                    </div>

                    {/* BOTTOM: ELEMENT SELECTION */}
                    <div className="bg-white dark:bg-[#141414] p-8 rounded-3xl border border-black/5 dark:border-white/5 shadow-lg shadow-black/5 dark:shadow-black/20 space-y-6">
                      <div className="flex items-center gap-4 pb-4 border-b border-black/5 dark:border-white/5">
                        <div className="relative flex-1">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 dark:text-white/30" size={18} />
                          <input 
                            type="text" 
                            placeholder="Cerca nella libreria..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#F5F5F5] dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl pl-12 pr-6 py-3 focus:ring-2 transition-all text-sm dark:text-white placeholder:text-black/20 dark:placeholder:text-white/20"
                            style={{ '--tw-ring-color': moduleTheme.accent } as React.CSSProperties}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                           {MATERIAL_CATEGORIES.map(cat => (
                             <button
                               key={cat.id}
                               onClick={() => setSelectedCategory(prev => prev === cat.id ? '' : cat.id)}
                               className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                 selectedCategory === cat.id 
                                   ? 'text-white shadow-lg' 
                                   : 'bg-[#F5F5F5] dark:bg-white/5 opacity-40 hover:opacity-100 dark:text-white/60'
                               }`}
                               style={selectedCategory === cat.id ? { 
                                 background: `linear-gradient(135deg, ${moduleTheme.accent}, ${moduleTheme.primary})`,
                                 boxShadow: `0 8px 24px ${moduleTheme.accent}40`
                               } : {}}
                               title={cat.name}
                             >
                               {getCategoryIcon(cat.icon)}
                             </button>
                           ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredMaterials?.map(element => {
                          const isSelected = selectedMaterials.some(m => m.id === element.id);
                          return (
                            <button
                              key={element.id}
                              onClick={() => toggleMaterial(element)}
                              className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                                isSelected 
                                  ? 'border-transparent shadow-inner dark:bg-white/5' 
                                  : 'bg-[#F5F5F5] dark:bg-white/5 border-black/5 dark:border-white/5 hover:border-white/20'
                              }`}
                              style={isSelected ? { 
                                background: `${moduleTheme.accent}15`,
                                borderColor: `${moduleTheme.accent}30`
                              } : {}}
                            >
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
                                isSelected 
                                  ? 'text-white border-transparent' 
                                  : 'border-black/20 dark:border-white/20'
                              }`}
                              style={isSelected ? {
                                background: `linear-gradient(135deg, ${moduleTheme.accent}, ${moduleTheme.primary})`
                              } : {}}
                              >
                                {isSelected && <Check size={14} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-bold text-sm truncate ${isSelected ? 'dark:text-white' : 'opacity-80 dark:text-white/80'}`}
                                  style={isSelected ? { color: moduleTheme.accent } : {}}
                                >
                                  {element.titolo}
                                </p>
                                <p className="text-[10px] opacity-40 font-medium uppercase tracking-widest dark:text-white/40">{element.marca || '—'}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {filteredMaterials?.length === 0 && (
                        <div className="py-20 text-center opacity-20 italic dark:text-white/30">
                          {t.capitolato.noElements}
                        </div>
                      )}
                    </div>
                  </div>


                {/* Fixed Action Button for Preview */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
                  <button 
                    onClick={() => setActiveView('preview')}
                    className="text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-wider flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl border-4 border-white/10"
                    style={{ 
                      background: `linear-gradient(135deg, ${moduleTheme.accent}, ${moduleTheme.primary})`,
                      boxShadow: `0 10px 40px ${moduleTheme.accent}40`
                    }}
                  >
                    GENERA BLUEPRINT E ESPORTA
                    <ChevronRight size={24} />
                  </button>
                </div>
              </motion.div>
             )}

            {activeView === 'preview' && (
              <motion.div 
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full flex flex-col overflow-hidden"
              >
                <div className="flex items-center justify-between px-8 py-4 border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#141414] shrink-0 sticky top-0 z-30">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setActiveView('editor')}
                      className="flex items-center gap-2 text-sm font-bold opacity-50 hover:opacity-100 transition-opacity"
                    >
                      <ArrowLeft size={16} />
                      Torna all'Editor
                    </button>
                    <div className="w-1 h-4 bg-black/10 rounded-full" />
                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-80">{t.capitolato.blueprintPreview}</h3>
                  </div>
                  <div className="flex items-center gap-4">
                     <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest hidden md:block">
                        {selectedMaterials.length} ARTICOLI SELEZIONATI
                     </p>
                     <button 
                       onClick={handleExportWord}
                       disabled={isExporting}
                       className="flex items-center gap-2 px-8 py-3 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg disabled:opacity-50"
                       style={{ 
                         background: `linear-gradient(135deg, ${moduleTheme.accent}, ${moduleTheme.primary})`,
                         boxShadow: `0 10px 30px ${moduleTheme.accent}40`
                       }}
                     >
                       {isExporting ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Download size={18} />}
                       SCARICA DOCX FINALE
                     </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[#f5f5f5] dark:bg-[#0a0a0a]">
                  <div className="max-w-5xl mx-auto h-full">
                    {!templateFile ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-6 text-center">
                        <div className="w-24 h-24 rounded-3xl flex items-center justify-center"
                          style={{ 
                            background: `${moduleTheme.accent}15`,
                            color: moduleTheme.accent
                          }}>
                           <FileText size={48} />
                        </div>
                        <div className="space-y-2 max-w-md">
                          <h3 className="text-xl font-bold opacity-80 uppercase tracking-tighter">Template DOCX non caricato</h3>
                          <p className="text-sm opacity-40 italic">
                            Per visualizzare l'anteprima reale, devi caricare un file .docx nelle impostazioni del progetto. 
                            Utilizziamo il tuo template per iniettare i dati in tempo reale.
                          </p>
                        </div>
                        <button 
                          onClick={() => setActiveView('editor')}
                          className="px-6 py-3 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all"
                          style={{ 
                            background: `linear-gradient(135deg, ${moduleTheme.accent}, ${moduleTheme.primary})`,
                            boxShadow: `0 10px 30px ${moduleTheme.accent}40`
                          }}
                        >
                          VAI ALLE IMPOSTAZIONI
                        </button>
                      </div>
                    ) : isGeneratingPreview ? (
                      <div className="h-full flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 rounded-full animate-spin border-4"
                          style={{ 
                            borderColor: `${moduleTheme.accent}20`,
                            borderTopColor: moduleTheme.accent
                          }}
                        />
                        <p className="text-sm font-bold opacity-40 animate-pulse uppercase tracking-[0.2em]">Generando anteprima reale DOCX...</p>
                      </div>
                    ) : (
                      <DocxPreview blob={previewBlob} />
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'projects' && (
              <motion.div 
                key="projects"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-6xl mx-auto space-y-6 p-8"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-white">I Tuoi Capitolati</h3>
                  <button 
                    onClick={handleNewProject}
                    className="flex items-center gap-2 px-6 py-3 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${moduleTheme.primary}, ${moduleTheme.accent})`, boxShadow: `0 10px 30px ${moduleTheme.primary}40` }}
                  >
                    <Plus size={20} />
                    NUOVO PROGETTO
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {projects.map(p => (
                    <div 
                      key={p.id}
                      className="bg-[#1A1A1A]/40 backdrop-blur-xl p-8 rounded-[32px] border border-white/5 flex items-center justify-between hover:border-white/20 hover:bg-[#1A1A1A]/60 transition-all group shadow-2xl"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6"
                          style={{ background: `linear-gradient(135deg, ${moduleTheme.accent}20, ${moduleTheme.primary}20)`, boxShadow: `0 8px 24px ${moduleTheme.accent}20`, color: moduleTheme.accent }}>
                          <FileText size={32} />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold mb-1 text-white">{p.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-white/40">
                            <span className="flex items-center gap-1"><Users size={14} /> {p.issuer}</span>
                            <span className="flex items-center gap-1"><LayoutDashboard size={14} /> {p.date}</span>
                             <span className="flex items-center gap-1"><Library size={14} /> {(p.selectedMaterials || []).length} Articoli</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => {
                             setSelectedProject(p);
                             setDocTitle(p.title);
                             setDocDate(p.date);
                             setDocIssuer(p.issuer);
                             setDocDescription(p.description);
                             setDocPremise(p.premise);
                             setClientName(p.clientName || '');
                             setSelectedMaterials(p.selectedMaterials || []);
                             setDocumentStructure(p.ordered_elements || []);
                             if (p.metadata) {
                               setMetadata(p.metadata);
                             }
                             if (p.template_url) {
                               loadTemplateFromUrl(p.template_url);
                             } else {
                               setTemplateFile(null);
                             }
                             setActiveView('editor');
                          }}
                          className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-all border border-white/10 hover:border-white/20"
                        >
                          APRI PROGETTO
                        </button>
                        <button 
                          onClick={() => handleDeleteProjectClick(p.id)}
                          className="p-3 bg-white/5 hover:bg-red-500/80 hover:text-white rounded-xl transition-all opacity-40 hover:opacity-100 text-white"
                          title="Elimina progetto"
                        >
                          <Plus size={20} className="rotate-45" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <div className="py-24 text-center space-y-4">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
                        <FolderOpen size={40} className="text-white" />
                      </div>
                      <p className="opacity-30 italic text-white/30">{t.capitolato.noProjects}</p>
                    </div>
                  )}                </div>
              </motion.div>
            )}

            {activeView === 'users' && user.role === 'admin' && (
              <motion.div 
                key="users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full flex flex-col"
              >
                <UserManagement t={t} showToast={showToast} />
              </motion.div>
            )}

            {activeView === 'elements' && (
              <ElementLibraryView
                key="elements"
                onNew={() => { setEditingElement(null); setActiveView('elementForm'); }}
                onEdit={(el) => { setEditingElement(el); setActiveView('elementForm'); }}
                showToast={showToast}
              />
            )}

            {activeView === 'elementForm' && (
              <TechnicalElementForm
                key={editingElement?.id || 'new-element'}
                element={editingElement}
                onBack={() => setActiveView('elements')}
                showToast={showToast}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      <ConfirmModal
        isOpen={!!projectToDelete}
        title="Elimina Progetto"
        message="Sei sicuro di voler eliminare questo progetto?"
        confirmText="Elimina"
        cancelText="Annulla"
        onConfirm={confirmDeleteProject}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  );
}
