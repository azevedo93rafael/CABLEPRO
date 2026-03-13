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
  Library, 
  FolderOpen,
  ArrowLeft,
  CheckCircle2,
  FileDown,
  Info,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { Translation, CapitolatoProject, MaterialCategory, MaterialItem } from '../types';
import { MATERIAL_CATEGORIES } from '../constants';
import { supabase } from '../lib/supabase';
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

interface CapitolatoModuleProps {
  user: { id: string; email: string; role: string };
  t: Translation;
  darkMode: boolean;
  onBack: () => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

export function CapitolatoModule({ user, t, darkMode, onBack, showToast }: CapitolatoModuleProps) {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [activeView, setActiveView] = useState<'dashboard' | 'editor' | 'library' | 'projects' | 'users' | 'preview'>('dashboard');
  const [projects, setProjects] = useState<CapitolatoProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<CapitolatoProject | null>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<MaterialItem[]>([]);
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

  useEffect(() => {
    fetchProjects();
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      let { data, error } = await supabase.from('materials').select('*');
      if (error) {
        const fallback = await supabase.from('Material').select('*');
        data = fallback.data;
        error = fallback.error;
      }

      if (!error && data) {
        const mapped = data.map((m: any) => ({
          id: m.id,
          name: m.name || 'Unknown Material',
          code: m.code || '',
          categoryId: m.categoryId || m.category_id || 'cat-custom',
          description: m.description || '',
          technicalSpecs: m.technicalSpecs || m.technical_specs || {},
          image: m.image || '',
          documents: m.documents || []
        }));
        setMaterials(mapped);
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
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
        selectedMaterials: typeof p.selectedMaterials === 'string' ? JSON.parse(p.selectedMaterials) : (p.selectedMaterials || [])
      }));
      setProjects(mapped);
    } else if (error) {
      console.warn('CapitolatoProject table might not exist in Supabase yet.');
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

  const handleNewProject = () => {
    setSelectedProject(null);
    setDocTitle('');
    setDocDate(new Date().toISOString().split('T')[0]);
    setDocIssuer(user.email);
    setDocDescription('');
    setDocPremise('');
    setClientName('');
    setSelectedMaterials([]);
    setActiveView('editor');
  };

  const handleSaveProject = async () => {
    setIsSaving(true);
    try {
      const projectData = {
        id: selectedProject?.id || crypto.randomUUID(),
        userId: user.id,
        title: docTitle,
        date: docDate,
        issuer: docIssuer,
        description: docDescription,
        premise: docPremise,
        clientName: clientName,
        selectedMaterials: JSON.stringify(selectedMaterials),
        lastSaved: new Date().toISOString()
      };

      const { error } = await supabase
        .from('CapitolatoProject')
        .upsert(projectData);

      if (error) {
        console.error('Failed to save to Supabase:', error);
        showToast(t.capitolato.saveError, 'error');
        return;
      }

      showToast(t.capitolato.projectSaved, 'success');
      if (!selectedProject) setSelectedProject(projectData as any);
      fetchProjects();
    } catch (err) {
      console.error('Error saving project:', err);
    } finally {
      setIsSaving(false);
    }
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

  const handleExportWord = async () => {
    setIsExporting(true);
    try {
      const RILO_RED = "C00000";
      const LIGHT_GREY = "F2F2F2";
      const SECTION_GREY = "D9D9D9";

      const logoBuffer = await generateLogoBuffer(true);
      const smallLogoBuffer = await generateLogoBuffer(false);
      
      const logoImageRun = logoBuffer ? new ImageRun({
        data: logoBuffer,
        transformation: { width: 300, height: 100 },
      } as any) : null;

      const smallLogoImageRun = smallLogoBuffer ? new ImageRun({
        data: smallLogoBuffer,
        transformation: { width: 120, height: 40 },
      } as any) : null;

      const doc = new Document({
        styles: {
          default: {
            document: {
              run: {
                font: "Arial",
                size: 22, // 11pt
              },
            },
          },
        },
        sections: [
          // COVER PAGE
          {
            properties: {
              titlePage: true,
            },
            headers: {
              default: new Header({
                children: [
                  new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                      bottom: { color: RILO_RED, space: 1, style: BorderStyle.SINGLE, size: 12 },
                      top: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    rows: [
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [new TextRun({ text: "Rilo Digital Planning S.r.l.", size: 16, color: "A6A6A6", bold: true })],
                              }),
                            ],
                            borders: { bottom: { style: BorderStyle.NONE }, top: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: smallLogoImageRun ? [smallLogoImageRun] : [
                                  new TextRun({ text: "RiL", bold: true, size: 48, color: "000000" }),
                                  new TextRun({ text: "o", bold: true, size: 48, color: RILO_RED }),
                                ],
                                alignment: AlignmentType.RIGHT,
                              }),
                            ],
                            borders: { bottom: { style: BorderStyle.NONE }, top: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            },
            footers: {
              default: new Footer({
                children: [
                  new Paragraph({
                    border: { top: { color: RILO_RED, space: 1, style: BorderStyle.SINGLE, size: 6 } },
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200 },
                    children: [
                      new TextRun({ 
                        text: "Rilo Digital Planning S.r.l. – Via Gregorio Ricci Curbastro 29 - 00149 - Email: info@rilodp.it - www.rilodp.it",
                        size: 14,
                        color: "A6A6A6"
                      }),
                      new TextRun({ 
                        text: "\nPartita IVA 14940401004 - Iscritto Registro Imprese n. 14940401004 (Trib.Roma) - Inscritto REA Roma n. 1556752",
                        size: 14,
                        color: "A6A6A6",
                        break: 1,
                      }),
                    ],
                  }),
                ],
              }),
            },
            children: [
              new Paragraph({
                children: logoBuffer ? [new ImageRun({
                  data: logoBuffer,
                  transformation: { width: 300, height: 100 },
                } as any)] : [
                  new TextRun({ text: "RiL", bold: true, size: 120, color: "000000" }),
                  new TextRun({ text: "o", bold: true, size: 120, color: RILO_RED }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 2000, after: 3000 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: docTitle.toUpperCase(), bold: true, size: 72 }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 800 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: "Capitolato tecnico – Zone Comuni", size: 36, color: "595959" }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 1200 },
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: `Cliente: `, bold: true, size: 28 }),
                  new TextRun({ text: clientName || "Fabrica Immobiliare SGR S.p.A.", size: 28 }),
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 4000 },
              }),
              
              // Revision Table
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: ["Revisione", "Data", "Disciplina", "Eseguito", "Verificato", "Approvato"].map(header => 
                      new TableCell({
                        children: [new Paragraph({ 
                          children: [new TextRun({ text: header, bold: true, size: 16 })],
                          alignment: AlignmentType.CENTER 
                        })],
                        shading: { fill: LIGHT_GREY },
                        verticalAlign: VerticalAlign.CENTER,
                      })
                    ),
                  }),
                  new TableRow({
                    children: ["00", docDate, "ELE", "FP", "FP", "DDC"].map(val => 
                      new TableCell({
                        children: [new Paragraph({ 
                          children: [new TextRun({ text: val, size: 16 })],
                          alignment: AlignmentType.CENTER 
                        })],
                        verticalAlign: VerticalAlign.CENTER,
                      })
                    ),
                  }),
                ],
              }),
            ],
          },
          // INDEX PAGE
          {
            headers: {
              default: new Header({
                children: [
                  new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                      bottom: { color: RILO_RED, space: 1, style: BorderStyle.SINGLE, size: 12 },
                      top: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    rows: [
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [new TextRun({ text: "Rilo Digital Planning S.r.l.", size: 16, color: "A6A6A6", bold: true })],
                              }),
                            ],
                            borders: { bottom: { style: BorderStyle.NONE }, top: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: smallLogoImageRun ? [smallLogoImageRun] : [
                                  new TextRun({ text: "RiL", bold: true, size: 48, color: "000000" }),
                                  new TextRun({ text: "o", bold: true, size: 48, color: RILO_RED }),
                                ],
                                alignment: AlignmentType.RIGHT,
                              }),
                            ],
                            borders: { bottom: { style: BorderStyle.NONE }, top: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            },
            children: [
              new Paragraph({
                children: [new TextRun({ text: "INDICE GENERALE", bold: true, size: 28 })],
                alignment: AlignmentType.CENTER,
                spacing: { before: 400, after: 800 },
              }),
              new Paragraph({ text: "1. PREMESSA .......................................................................................................................................................... 3", spacing: { after: 200 } }),
              new Paragraph({ text: "2. NORMATIVA ....................................................................................................................................................... 4", spacing: { after: 200 } }),
              new Paragraph({ text: "3. CAPITOLATO TECNICO ......................................................................................................................................... 8", spacing: { after: 200 } }),
            ],
          },
          // MAIN CONTENT
          {
            headers: {
              default: new Header({
                children: [
                  new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                      bottom: { color: RILO_RED, space: 1, style: BorderStyle.SINGLE, size: 12 },
                      top: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                    rows: [
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [new TextRun({ text: "Rilo Digital Planning S.r.l.", size: 16, color: "A6A6A6", bold: true })],
                              }),
                            ],
                            borders: { bottom: { style: BorderStyle.NONE }, top: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                          }),
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: smallLogoImageRun ? [smallLogoImageRun] : [
                                  new TextRun({ text: "RiL", bold: true, size: 48, color: "000000" }),
                                  new TextRun({ text: "o", bold: true, size: 48, color: RILO_RED }),
                                ],
                                alignment: AlignmentType.RIGHT,
                              }),
                            ],
                            borders: { bottom: { style: BorderStyle.NONE }, top: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            },
            footers: {
              default: new Footer({
                children: [
                  new Paragraph({
                    border: { top: { color: RILO_RED, space: 1, style: BorderStyle.SINGLE, size: 6 } },
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200 },
                    children: [
                      new TextRun({ text: "Pag. " }),
                      new TextRun({ children: [PageNumber.CURRENT] }),
                      new TextRun({ text: " a " }),
                      new TextRun({ children: [PageNumber.TOTAL_PAGES] }),
                    ],
                  }),
                ],
              }),
            },
            children: [
              // Section 1: Premessa
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ 
                          children: [new TextRun({ text: "1. PREMESSA", bold: true, color: "FFFFFF" })],
                          spacing: { before: 100, after: 100 }
                        })],
                        shading: { fill: "9CA3AF" },
                        borders: {
                          top: { style: BorderStyle.NONE },
                          bottom: { style: BorderStyle.NONE },
                          left: { style: BorderStyle.NONE },
                          right: { style: BorderStyle.NONE },
                        },
                      }),
                    ],
                  }),
                ],
              }),
              new Paragraph({
                text: docPremise || "Il presente Capitolato Tecnico Prestazionale ha lo scopo di identificare un livello standard minimo per le apparecchiature ed i materiali da impiegare per la realizzazione dei nuovi impianti elettrici e speciali per le zone comuni, in merito alle attività oggetto di intervento.",
                alignment: AlignmentType.JUSTIFIED,
                spacing: { before: 200, after: 400 },
              }),

              // Section 2: Normativa
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ 
                          children: [new TextRun({ text: "2. NORMATIVA", bold: true, color: "FFFFFF" })],
                          spacing: { before: 100, after: 100 }
                        })],
                        shading: { fill: "9CA3AF" },
                        borders: {
                          top: { style: BorderStyle.NONE },
                          bottom: { style: BorderStyle.NONE },
                          left: { style: BorderStyle.NONE },
                          right: { style: BorderStyle.NONE },
                        },
                      }),
                    ],
                  }),
                ],
              }),
              new Paragraph({
                children: [new TextRun({ text: "2.1. NORMATIVA DI RIFERIMENTO", bold: true, color: "0070C0" })],
                spacing: { before: 200, after: 100 },
              }),
              new Paragraph({
                text: "La normativa di riferimento per la progettazione, l'esecuzione, il collaudo e la gestione degli impianti sotto elencati è costituita dalla legislazione vigente, dalle Regole Tecniche emanate dagli uffici tecnici dello Stato e della Pubblica Amministrazione, dalle norme tecniche UNI, CTI, CEI applicabili, nonché dalle prescrizioni emesse da Autorità locali ed Enti autorizzati per campi specifici.",
                alignment: AlignmentType.JUSTIFIED,
                spacing: { after: 400 },
              }),

              // Section 3: Capitolato Tecnico (Materials)
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph({ 
                          children: [new TextRun({ text: "3. CAPITOLATO TECNICO", bold: true, color: "FFFFFF" })],
                          spacing: { before: 100, after: 100 }
                        })],
                        shading: { fill: "9CA3AF" },
                        borders: {
                          top: { style: BorderStyle.NONE },
                          bottom: { style: BorderStyle.NONE },
                          left: { style: BorderStyle.NONE },
                          right: { style: BorderStyle.NONE },
                        },
                      }),
                    ],
                  }),
                ],
              }),
              
              ...(await Promise.all(selectedMaterials.map(async (mat, index) => {
                const imageBuffer = mat.image ? await fetchImageAsBuffer(mat.image) : null;
                const imageRun = imageBuffer ? new ImageRun({
                  data: imageBuffer,
                  transformation: { width: 200, height: 200 },
                } as any) : null;

                return [
                  new Paragraph({
                    children: [new TextRun({ text: `3.2.${index + 1}. ${mat.name.toUpperCase()}`, bold: true, size: 24 })],
                    spacing: { before: 400, after: 200 },
                    border: { bottom: { color: "E5E5E5", space: 1, style: BorderStyle.SINGLE, size: 6 } },
                  }),
                  
                  new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                      insideHorizontal: { style: BorderStyle.NONE },
                      insideVertical: { style: BorderStyle.NONE },
                    },
                    rows: [
                      new TableRow({
                        children: [
                          // Left Column: Image
                          new TableCell({
                            width: { size: 40, type: WidthType.PERCENTAGE },
                            children: [
                              new Paragraph({
                                children: [new TextRun({ text: t.capitolato.referenceBrandLabel, bold: true, size: 14 })],
                                spacing: { after: 100 },
                              }),
                              imageRun ? new Paragraph({ children: [imageRun], alignment: AlignmentType.CENTER }) : new Paragraph({ text: t.capitolato.imageNotAvailable, alignment: AlignmentType.CENTER }),
                            ],
                          }),
                          // Right Column: Specs and Description
                          new TableCell({
                            width: { size: 60, type: WidthType.PERCENTAGE },
                            children: [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: mat.description,
                                    italics: true,
                                    size: 18,
                                  })
                                ],
                                alignment: AlignmentType.JUSTIFIED,
                                spacing: { after: 200 },
                              }),
                              new Table({
                                width: { size: 100, type: WidthType.PERCENTAGE },
                                rows: Object.entries(mat.technicalSpecs).map(([key, value]) => 
                                  new TableRow({
                                    children: [
                                      new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: key, bold: true, size: 16 })] })],
                                        width: { size: 40, type: WidthType.PERCENTAGE },
                                        shading: { fill: LIGHT_GREY },
                                      }),
                                      new TableCell({
                                        children: [new Paragraph({ children: [new TextRun({ text: value, size: 16 })] })],
                                        width: { size: 60, type: WidthType.PERCENTAGE },
                                      }),
                                    ],
                                  })
                                ),
                              }),
                              new Paragraph({
                                children: [
                                  new TextRun({ text: t.capitolato.referenceBrandLabel, bold: true, size: 14, break: 1 }),
                                  new TextRun({ text: `\n${t.capitolato.approvedEquivalent}`, size: 14, break: 1 }),
                                ],
                                spacing: { before: 200 },
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ];
              }))).flat()
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${docTitle.replace(/\s+/g, '_')}_Capitolato_Rilo.docx`);
    } catch (err) {
      console.error('Error exporting Word:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleMaterial = (material: MaterialItem) => {
    setSelectedMaterials(prev => 
      prev.some(m => m.id === material.id) 
        ? prev.filter(m => m.id !== material.id) 
        : [...prev, material]
    );
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

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         m.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || m.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex h-screen bg-[#f5f5f5] dark:bg-[#0a0a0a] text-[#141414] dark:text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-[#401318] text-white flex flex-col shadow-2xl z-20 border-r border-white/5">
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">CAPITOLATO PRO</h1>
              <p className="text-[10px] opacity-50 font-bold uppercase tracking-widest mt-1">INGEGNERIA</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold opacity-30 uppercase tracking-widest mb-4">PRINCIPALE</p>
          
          <button 
            onClick={() => setActiveView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'dashboard' ? 'bg-white/10 shadow-lg' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </button>

          <button 
            onClick={() => setActiveView('projects')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'projects' ? 'bg-white/10 shadow-lg' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}
          >
            <FolderOpen size={20} />
            <span className="font-medium">Progetti</span>
          </button>

          <button 
            onClick={() => setActiveView('library')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'library' ? 'bg-white/10 shadow-lg' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}
          >
            <Library size={20} />
            <span className="font-medium">Libreria Materiali</span>
          </button>

          <div className="pt-8">
            <p className="px-4 text-[10px] font-bold opacity-30 uppercase tracking-widest mb-4">CONFIGURAZIONE</p>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl opacity-60 hover:opacity-100 hover:bg-white/5 transition-all">
              <Settings size={20} />
              <span className="font-medium">Impostazioni</span>
            </button>
            {user.role === 'admin' && (
              <button 
                onClick={() => setActiveView('users')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeView === 'users' ? 'bg-white/10 shadow-lg' : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}
              >
                <Users size={20} />
                <span className="font-medium">Gestione Utenti</span>
              </button>
            )}
          </div>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={onBack}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-sm font-medium"
          >
            <ArrowLeft size={18} />
            Torna al Selettore
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white dark:bg-[#141414] border-b border-black/5 dark:border-white/5 flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">MODULO</span>
            <h2 className="text-xl font-bold uppercase tracking-tight">
              {activeView === 'dashboard' ? 'Dashboard' : 
               activeView === 'editor' ? t.capitolato.newCapitolato : 
               activeView === 'library' ? t.capitolato.materialsLibrary : 
               activeView === 'users' ? t.userManagement.title :
               activeView === 'projects' ? t.capitolato.existingProjects :
               'Anteprima'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {activeView === 'editor' && (
              <>
                <button 
                  onClick={handleSaveProject}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-xl font-bold text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-all disabled:opacity-50"
                >
                  <Save size={18} />
                  {isSaving ? 'Salvataggio...' : 'SALVA PROGETTO'}
                </button>
                <button 
                  onClick={handleExportWord}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#401318] text-white rounded-xl font-bold text-sm hover:bg-[#5a1b22] transition-all shadow-lg shadow-[#401318]/20 disabled:opacity-50"
                >
                  <FileDown size={18} />
                  {isExporting ? 'Esportazione...' : 'ESPORTA IN WORD'}
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
                    className="col-span-2 group bg-[#401318] p-10 rounded-[32px] text-white flex flex-col justify-between h-64 shadow-2xl shadow-[#401318]/20 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
                      <Plus size={160} />
                    </div>
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                      <Plus size={32} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold mb-2">Crea Nuovo Capitolato</h3>
                      <p className="opacity-60">Inizia un nuovo documento tecnico da zero</p>
                    </div>
                  </button>

                  <div className="bg-white dark:bg-[#141414] p-10 rounded-[32px] border border-black/5 dark:border-white/5 flex flex-col justify-between h-64 shadow-xl shadow-black/5">
                    <div className="w-16 h-16 bg-[#401318]/5 rounded-2xl flex items-center justify-center text-[#401318]">
                      <FolderOpen size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-1">{projects.length}</h3>
                      <p className="opacity-50 text-sm font-bold uppercase tracking-widest">Progetti Salvati</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold opacity-30 uppercase tracking-widest">Progetti Recenti</h4>
                    <button onClick={() => setActiveView('projects')} className="text-sm font-bold text-[#401318] hover:underline">Vedi tutti</button>
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
                          setSelectedMaterials(JSON.parse(p.selectedMaterials as any || '[]'));
                          setActiveView('editor');
                        }}
                        className="bg-white dark:bg-[#141414] p-6 rounded-2xl border border-black/5 dark:border-white/5 flex items-center justify-between hover:border-[#401318]/30 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-xl flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                            <FileText size={24} />
                          </div>
                          <div className="text-left">
                            <h5 className="font-bold text-lg">{p.title}</h5>
                            <p className="text-sm opacity-50">{p.date} • {p.issuer}</p>
                          </div>
                        </div>
                        <ChevronRight size={20} className="opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                    {projects.length === 0 && (
                      <div className="py-12 text-center opacity-30 italic">Nessun progetto recente</div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'editor' && (
              <motion.div 
                key="editor"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-6xl mx-auto space-y-8 p-8"
              >
                {/* Document Settings */}
                <div className="bg-white dark:bg-[#141414] p-10 rounded-[32px] border border-black/5 dark:border-white/5 shadow-xl shadow-black/5 space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-[#401318] rounded-full" />
                    <h3 className="text-sm font-bold uppercase tracking-widest opacity-80">Impostazioni DocumentO</h3>
                  </div>

                  <div className="grid grid-cols-4 gap-8">
                    <div className="col-span-1 space-y-2">
                      <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">{t.capitolato.projectTitleLabel}</label>
                      <input 
                        type="text" 
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        placeholder={t.capitolato.projectTitleLabel}
                        className="w-full bg-black/5 dark:bg-white/5 border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#401318]/20 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">{t.capitolato.clientName}</label>
                      <input 
                        type="text" 
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder={t.capitolato.clientNamePlaceholder}
                        className="w-full bg-black/5 dark:bg-white/5 border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#401318]/20 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">{t.capitolato.docDateLabel}</label>
                      <input 
                        type="date" 
                        value={docDate}
                        onChange={(e) => setDocDate(e.target.value)}
                        className="w-full bg-black/5 dark:bg-white/5 border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#401318]/20 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">{t.capitolato.issuerLabel}</label>
                      <input 
                        type="text" 
                        value={docIssuer}
                        onChange={(e) => setDocIssuer(e.target.value)}
                        placeholder={t.capitolato.issuerPlaceholder}
                        className="w-full bg-black/5 dark:bg-white/5 border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#401318]/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold opacity-40 uppercase tracking-widest ml-1">{t.capitolato.premiseLabel}</label>
                    <textarea 
                      rows={4}
                      value={docPremise}
                      onChange={(e) => setDocPremise(e.target.value)}
                      placeholder={t.capitolato.premisePlaceholder}
                      className="w-full bg-black/5 dark:bg-white/5 border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#401318]/20 transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Material Selection - Table Grouped by Discipline */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-[#401318] rounded-full" />
                      <h3 className="text-sm font-bold uppercase tracking-widest opacity-80">{t.capitolato.selectItemsByDiscipline}</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={14} />
                        <input 
                          type="text" 
                          placeholder={t.capitolato.searchItems}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-black/5 dark:bg-white/5 border-none rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-[#401318]/20 transition-all"
                        />
                      </div>
                      <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">{selectedMaterials.length} {t.capitolato.selectedItems}</span>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-[#141414] border border-black/5 dark:border-white/5 rounded-[32px] overflow-hidden shadow-xl shadow-black/5">
                    <div className="max-h-[600px] overflow-y-auto overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead className="sticky top-0 z-10 bg-[#F5F5F5] dark:bg-[#1A1A1A]">
                          <tr>
                            <th className="p-4 w-12"></th>
                            <th className="p-4 text-[10px] font-bold opacity-40 uppercase tracking-widest">{t.capitolato.code}</th>
                            <th className="p-4 text-[10px] font-bold opacity-40 uppercase tracking-widest">{t.capitolato.itemDescription}</th>
                            <th className="p-4 text-[10px] font-bold opacity-40 uppercase tracking-widest">{t.capitolato.referenceBrand}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {MATERIAL_CATEGORIES.map(cat => {
                            const catMaterials = materials.filter(m => 
                              m.categoryId === cat.id && 
                              (m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.code.toLowerCase().includes(searchQuery.toLowerCase()))
                            );
                            
                            if (catMaterials.length === 0) return null;

                            return (
                              <React.Fragment key={cat.id}>
                                <tr className="bg-[#401318]/5 dark:bg-white/5">
                                  <td colSpan={4} className="p-4">
                                    <div className="flex items-center gap-2">
                                      <div className="text-[#401318] dark:text-white/80">
                                        {getCategoryIcon(cat.icon)}
                                      </div>
                                      <span className="font-black text-xs uppercase tracking-tighter">{cat.name}</span>
                                    </div>
                                  </td>
                                </tr>
                                {catMaterials.map(mat => (
                                  <tr 
                                    key={mat.id} 
                                    className={`border-b border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${selectedMaterials.some(m => m.id === mat.id) ? 'bg-[#401318]/5 dark:bg-[#401318]/20' : ''}`}
                                    onClick={() => toggleMaterial(mat)}
                                  >
                                    <td className="p-4">
                                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedMaterials.some(m => m.id === mat.id) ? 'bg-[#401318] border-[#401318] text-white' : 'border-black/20 dark:border-white/20'}`}>
                                        {selectedMaterials.some(m => m.id === mat.id) && <CheckCircle2 size={12} />}
                                      </div>
                                    </td>
                                    <td className="p-4 text-[10px] font-mono opacity-60">{mat.code}</td>
                                    <td className="p-4">
                                      <p className="text-sm font-bold">{mat.name}</p>
                                      <p className="text-[10px] opacity-40 line-clamp-1">{mat.description}</p>
                                    </td>
                                    <td className="p-4 text-[10px] font-bold opacity-60">BTICINO / ABB</td>
                                  </tr>
                                ))}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Summary Bar */}
                <div className="bg-[#401318]/5 dark:bg-white/5 p-8 rounded-[32px] flex items-center justify-between">
                  <div className="flex gap-12">
                    <div>
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">Totale Articoli</p>
                      <p className="text-3xl font-bold">{selectedMaterials.length}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mb-1">Dimensione Stimata</p>
                      <p className="text-3xl font-bold">~{Math.ceil(selectedMaterials.length * 1.5 + 2)} Pagine</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveView('preview')}
                    className="bg-[#401318] text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-[#5a1b22] transition-all shadow-xl shadow-[#401318]/20"
                  >
                    GENERA ANTEPRIMA
                    <ChevronRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {activeView === 'library' && (
              <motion.div 
                key="library"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full flex flex-col space-y-6 p-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 max-w-xl">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={20} />
                      <input 
                        type="text" 
                        placeholder="Cerca materiali per nome o codice..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-[#141414] border-black/5 dark:border-white/5 rounded-2xl pl-12 pr-6 py-4 focus:ring-2 focus:ring-[#401318]/20 transition-all shadow-sm"
                      />
                    </div>
                    <button 
                      onClick={() => setSelectedCategory(null)}
                      className={`px-6 py-4 rounded-2xl font-bold text-sm transition-all ${!selectedCategory ? 'bg-[#401318] text-white shadow-lg shadow-[#401318]/20' : 'bg-white dark:bg-[#141414] opacity-50 hover:opacity-100 border border-black/5 dark:border-white/5'}`}
                    >
                      TUTTI
                    </button>
                  </div>
                  <button 
                    onClick={() => setActiveView('editor')}
                    className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-[#141414] border border-black/5 dark:border-white/5 rounded-2xl font-bold text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-all shadow-sm"
                  >
                    <ChevronLeft size={20} />
                    TORNA ALL'EDITOR
                  </button>
                </div>

                <div className="flex gap-8 flex-1 overflow-hidden">
                  {/* Categories List */}
                  <div className="w-64 space-y-2 overflow-y-auto pr-2">
                    {MATERIAL_CATEGORIES.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all text-left ${selectedCategory === cat.id ? 'bg-[#401318] text-white shadow-lg shadow-[#401318]/20' : 'bg-white dark:bg-[#141414] opacity-60 hover:opacity-100 border border-black/5 dark:border-white/5'}`}
                      >
                        {getCategoryIcon(cat.icon)}
                        <span className="font-bold text-sm">{cat.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Materials Grid */}
                  <div className="flex-1 grid grid-cols-2 gap-6 overflow-y-auto pr-2 pb-8">
                    {filteredMaterials.map(mat => (
                      <div 
                        key={mat.id}
                        className="bg-white dark:bg-[#141414] rounded-[32px] border border-black/5 dark:border-white/5 overflow-hidden flex flex-col shadow-xl shadow-black/5 group"
                      >
                        <div className="p-8 space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#401318]/5 rounded-xl flex items-center justify-center text-[#401318]">
                                {getCategoryIcon(MATERIAL_CATEGORIES.find(c => c.id === mat.categoryId)?.icon || '')}
                              </div>
                              <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                                {MATERIAL_CATEGORIES.find(c => c.id === mat.categoryId)?.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Aggiungi al Progetto</span>
                              <button 
                                onClick={() => toggleMaterial(mat)}
                                className={`w-12 h-6 rounded-full relative transition-all ${selectedMaterials.some(m => m.id === mat.id) ? 'bg-[#401318]' : 'bg-black/10 dark:bg-white/10'}`}
                              >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${selectedMaterials.some(m => m.id === mat.id) ? 'right-1' : 'left-1'}`} />
                              </button>
                            </div>
                          </div>

                          <div>
                            <h4 className="text-2xl font-bold mb-1">{mat.name}</h4>
                            <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">{t.capitolato.productCode}: {mat.code}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-black/5 dark:border-white/5">
                            <div className="aspect-square bg-black/5 dark:bg-white/5 rounded-3xl flex items-center justify-center relative overflow-hidden">
                              {mat.image ? (
                                <img src={mat.image} alt={mat.name} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" />
                              ) : (
                                <Library size={48} className="opacity-10" />
                              )}
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Anteprima Materiale</span>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Specifiche Tecniche</p>
                              <div className="space-y-3">
                                {Object.entries(mat.technicalSpecs).slice(0, 4).map(([key, value]) => (
                                  <div key={key}>
                                    <p className="text-[9px] opacity-40 uppercase font-bold">{key}</p>
                                    <p className="text-sm font-bold">{value}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Descrizione per Capitolato</p>
                            <p className="text-sm opacity-60 italic leading-relaxed">
                              "{mat.description.length > 150 ? mat.description.substring(0, 150) + '...' : mat.description}"
                            </p>
                          </div>

                          <div className="flex gap-3 pt-6 border-t border-black/5 dark:border-white/5">
                            <button className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#401318] text-white rounded-2xl font-bold text-xs hover:bg-[#5a1b22] transition-all">
                              <Plus size={16} />
                              PERSONALIZZA PER PROGETTO
                            </button>
                            <button className="px-6 py-4 bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-2xl font-bold text-xs hover:bg-black/5 dark:hover:bg-white/5 transition-all flex items-center gap-2">
                              <FileText size={16} />
                              SCHEDA TECNICA
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
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
                  <h3 className="text-2xl font-bold">I Tuoi Capitolati</h3>
                  <button 
                    onClick={handleNewProject}
                    className="flex items-center gap-2 px-6 py-3 bg-[#401318] text-white rounded-xl font-bold text-sm hover:bg-[#5a1b22] transition-all shadow-lg shadow-[#401318]/20"
                  >
                    <Plus size={20} />
                    NUOVO PROGETTO
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {projects.map(p => (
                    <div 
                      key={p.id}
                      className="bg-white dark:bg-[#141414] p-8 rounded-[32px] border border-black/5 dark:border-white/5 flex items-center justify-between hover:border-[#401318]/30 transition-all group premium-shadow"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-[#401318]/5 rounded-2xl flex items-center justify-center text-[#401318]">
                          <FileText size={32} />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold mb-1">{p.title}</h4>
                          <div className="flex items-center gap-4 text-sm opacity-40">
                            <span className="flex items-center gap-1"><Users size={14} /> {p.issuer}</span>
                            <span className="flex items-center gap-1"><LayoutDashboard size={14} /> {p.date}</span>
                            <span className="flex items-center gap-1"><Library size={14} /> {(JSON.parse(p.selectedMaterials as any || '[]') as MaterialItem[]).length} Articoli</span>
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
                            setSelectedMaterials(JSON.parse(p.selectedMaterials as any || '[]'));
                            setActiveView('editor');
                          }}
                          className="px-6 py-3 bg-black/5 dark:bg-white/5 hover:bg-[#401318] hover:text-white rounded-xl font-bold text-sm transition-all"
                        >
                          APRI PROGETTO
                        </button>
                        <button 
                          onClick={() => handleDeleteProjectClick(p.id)}
                          className="p-3 bg-black/5 dark:bg-white/5 hover:bg-red-500 hover:text-white rounded-xl transition-all opacity-40 hover:opacity-100"
                          title="Elimina progetto"
                        >
                          <Plus size={20} className="rotate-45" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <div className="py-24 text-center space-y-4">
                      <div className="w-20 h-20 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto opacity-20">
                        <FolderOpen size={40} />
                      </div>
                      <p className="opacity-30 italic">Nessun capitolato trovato nel database.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeView === 'preview' && (
              <motion.div 
                key="preview"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-5xl mx-auto space-y-8 pb-20 px-8"
              >
                <div className="flex items-center justify-between sticky top-0 bg-[#f5f5f5] dark:bg-[#0a0a0a] py-6 z-20 -mx-8 px-8">
                  <button 
                    onClick={() => setActiveView('editor')}
                    className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#141414] border border-black/5 dark:border-white/5 rounded-xl font-bold text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-all shadow-sm"
                  >
                    <ChevronLeft size={20} />
                    TORNA ALL'EDITOR
                  </button>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleSaveProject}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#141414] border border-black/10 dark:border-white/10 rounded-xl font-bold text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                    >
                      <Save size={18} />
                      {isSaving ? 'SALVATAGGIO...' : 'SALVA'}
                    </button>
                    <button 
                      onClick={handleExportWord}
                      disabled={isExporting}
                      className="flex items-center gap-2 px-8 py-3 bg-[#401318] text-white rounded-xl font-bold text-sm hover:bg-[#5a1b22] transition-all shadow-lg"
                    >
                      <FileDown size={18} />
                      {isExporting ? 'ESPORTAZIONE...' : 'SCARICA WORD'}
                    </button>
                  </div>
                </div>

                {/* Document Preview Rendering */}
                <div className="bg-white dark:bg-white text-black shadow-2xl min-h-[1200px] p-[2cm] font-serif relative">
                  {/* Header Mockup */}
                  <div className="flex justify-between items-start border-b-2 border-[#C00000] pb-4 mb-12">
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-gray-400">Rilo Digital Planning S.r.l.</p>
                    </div>
                    <div className="text-right">
                      <RiloLogo className="text-black" />
                    </div>
                  </div>

                  {/* Title Page Content */}
                  <div className="text-center space-y-12 py-20">
                    <div className="flex justify-center">
                      <RiloLogo size="large" className="text-black" />
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-4xl font-bold uppercase tracking-tight">{docTitle || 'TITOLO DEL PROGETTO'}</h2>
                      <p className="text-xl text-gray-600">Capitolato tecnico – Zone Comuni</p>
                    </div>

                    <div className="pt-20">
                      <p className="text-lg">
                        <span className="font-bold">Cliente: </span>
                        {clientName || 'Fabrica Immobiliare SGR S.p.A.'}
                      </p>
                    </div>

                    {/* Revision Table Mockup */}
                    <div className="pt-40 max-w-2xl mx-auto">
                      <table className="w-full border-collapse border border-gray-300 text-[10px]">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-2">Revisione</th>
                            <th className="border border-gray-300 p-2">Data</th>
                            <th className="border border-gray-300 p-2">Disciplina</th>
                            <th className="border border-gray-300 p-2">Eseguito</th>
                            <th className="border border-gray-300 p-2">Verificato</th>
                            <th className="border border-gray-300 p-2">Approvato</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-300 p-2">00</td>
                            <td className="border border-gray-300 p-2">{docDate}</td>
                            <td className="border border-gray-300 p-2">ELE</td>
                            <td className="border border-gray-300 p-2">FP</td>
                            <td className="border border-gray-300 p-2">FP</td>
                            <td className="border border-gray-300 p-2">DDC</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Page Break Indicator */}
                  <div className="my-20 border-t border-dashed border-gray-300 relative">
                    <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">Interruzione di Pagina</span>
                  </div>

                  {/* Index Page Preview */}
                  <div className="space-y-8 py-10">
                    <h3 className="text-xl font-bold text-center mb-12">INDICE GENERALE</h3>
                    <div className="space-y-4 max-w-2xl mx-auto text-sm">
                      <div className="flex justify-between border-b border-dotted border-gray-300 pb-1">
                        <span>1. PREMESSA</span>
                        <span>3</span>
                      </div>
                      <div className="flex justify-between border-b border-dotted border-gray-300 pb-1">
                        <span>2. NORMATIVA</span>
                        <span>4</span>
                      </div>
                      <div className="flex justify-between border-b border-dotted border-gray-300 pb-1">
                        <span>3. CAPITOLATO TECNICO</span>
                        <span>8</span>
                      </div>
                    </div>
                  </div>

                  {/* Page Break Indicator */}
                  <div className="my-20 border-t border-dashed border-gray-300 relative">
                    <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">Interruzione di Pagina</span>
                  </div>

                  {/* Main Content Preview */}
                  <div className="space-y-12">
                    <section>
                      <div className="bg-gray-400 text-white px-4 py-2 font-bold mb-4">1. PREMESSA</div>
                      <p className="text-sm leading-relaxed text-justify">
                        {docPremise || "Il presente Capitolato Tecnico Prestazionale ha lo scopo di identificare un livello standard minimo per le apparecchiature ed i materiali da impiegare per la realizzazione dei nuovi impianti elettrici e speciali per le zone comuni, in merito alle attività oggetto di intervento."}
                      </p>
                    </section>

                    <section>
                      <div className="bg-gray-400 text-white px-4 py-2 font-bold mb-4">2. NORMATIVA</div>
                      <h3 className="text-[#0070C0] font-bold mb-2">2.1. NORMATIVA DI RIFERIMENTO</h3>
                      <p className="text-sm leading-relaxed text-justify">
                        La normativa di riferimento per la progettazione, l'esecuzione, il collaudo e la gestione degli impianti sotto elencati è costituita dalla legislazione vigente, dalle Regole Tecniche emanate dagli uffici tecnici dello Stato e della Pubblica Amministrazione, dalle norme tecniche UNI, CTI, CEI applicabili, nonché dalle prescrizioni emesse da Autorità locali ed Enti autorizzati per campi specifici.
                      </p>
                    </section>

                    <section>
                      <div className="bg-gray-400 text-white px-4 py-2 font-bold mb-6">3. CAPITOLATO TECNICO</div>
                      
                      <div className="space-y-16">
                        {selectedMaterials.map((mat, index) => {
                          return (
                            <div key={mat.id} className="space-y-6">
                              <h4 className="text-lg font-bold border-b border-gray-200 pb-2">3.2.{index + 1}. {mat.name.toUpperCase()}</h4>
                              
                              <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                  <p className="font-bold text-sm">RIFERIMENTO E DETTAGLIO GRAFICO:</p>
                                  <div className="aspect-square bg-gray-50 border border-gray-200 flex items-center justify-center rounded-lg overflow-hidden">
                                    {mat.image ? (
                                      <img src={mat.image} alt={mat.name} className="w-full h-full object-contain" />
                                    ) : (
                                      <Library size={48} className="opacity-10" />
                                    )}
                                  </div>
                                </div>
                                <div className="space-y-4">
                                  <p className="text-sm leading-relaxed text-justify italic">
                                    {mat.description}
                                  </p>
                                  <table className="w-full border-collapse border border-gray-300 text-xs">
                                    <tbody>
                                      {Object.entries(mat.technicalSpecs).map(([key, value]) => (
                                        <tr key={key}>
                                          <td className="border border-gray-300 p-2 bg-gray-100 font-bold w-1/3">{key}</td>
                                          <td className="border border-gray-300 p-2">{value}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                  <div className="pt-4">
                                    <p className="font-bold text-xs">MARCA/CHE DI RIFERIMENTO</p>
                                    <p className="text-xs">BTICINO, SCHNEIDER, ABB o simile approvato</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  </div>

                  {/* Footer Mockup */}
                  <div className="mt-20 border-t border-[#C00000] pt-4 text-center">
                    <p className="text-[8px] text-gray-400">
                      Rilo Digital Planning S.r.l. – Via Gregorio Ricci Curbastro 29 - 00149 - Email: info@rilodp.it - www.rilodp.it
                    </p>
                    <p className="text-[8px] text-gray-400">
                      Partita IVA 14940401004 - Iscritto Registro Imprese n. 14940401004 (Trib.Roma) - Inscritto REA Roma n. 1556752
                    </p>
                  </div>
                </div>
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
