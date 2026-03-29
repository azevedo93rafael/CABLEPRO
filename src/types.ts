export type Language = 'pt-BR' | 'en' | 'it';

export interface Cable {
  id: string;
  name: string;
  size?: string; // e.g., "16mmq"
  type: 'power' | 'data' | 'evac' | 'irai';
  diameter: number; // in mm
  weight?: number; // kg/km
  indice?: number;
  INDICE?: number;
  isFavorite?: boolean;
}

export interface Structure {
  id: string;
  name?: string;
  type: 'tray' | 'conduit';
  width: number; // mm
  height: number; // mm
  fillLimit: number; // percentage (e.g., 40, 50)
  hasSeparator?: boolean;
}

export interface StandardStructure {
  id: string;
  name: string;
  type: 'tray' | 'conduit';
  width: number;
  height: number;
  fillLimit: number;
  isFavorite?: boolean;
}

export interface ProjectCable {
  id: string;
  cable: Cable;
  quantity: number;
  tag?: string;
  color?: string;
}

export interface Project {
  id: string;
  name: string;
  structure: Structure;
  projectCables: ProjectCable[];
  lastSaved?: string;
  notes?: string;
}

export interface MaterialItem {
  id: string;
  name: string;
  code: string;
  categoryId: string;
  description: string;
  technicalSpecs: Record<string, string>;
  image?: string;
  documents?: { name: string; url: string; version: string; date: string }[];
}

export interface MaterialCategory {
  id: string;
  name: string;
  icon: string;
}

export interface CapitolatoMetadata {
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

export interface CapitolatoProject {
  id: string;
  title: string;
  date: string;
  issuer: string;
  description: string;
  premise: string;
  clientName?: string;
  selectedMaterials: TechnicalElement[];
  ordered_elements?: ComposerItem[];
  metadata?: CapitolatoMetadata;
  template_url?: string;
  lastSaved?: string;
}

export type ComposerItemType = 'element' | 'chapter';

export interface ComposerItem {
  id: string;
  type: ComposerItemType;
  title: string;
  metadata?: any; // For elements: elementId, for chapters: empty
  elementId?: string; // If type is element
  children?: ComposerItem[]; // For nested chapters if needed, or flat structure
}

export interface TechnicalElement {
  id: string;
  titolo: string;
  image?: string;           // URL from storage or base64
  category_id?: string;     // maps to MATERIAL_CATEGORIES id
  descrizione?: string;
  caratteristiche_dimensionali?: string;
  riferimenti_normativi?: string;
  caratteristiche_tecniche?: string;
  tipo_impiego?: string;
  modalita_installazione?: string;
  controlli_collaudi?: string;
  documentazione?: string;
  marca?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Translation {
  title: string;
  nav: {
    dashboard: string;
    trays: string;
    conduits: string;
    cables: string;
    admin: string;
    users: string;
    newProject: string;
  };
  sidebar: {
    overview: string;
    cableTrays: string;
    conduits: string;
    cables: string;
    database: string;
    vault: string;
    documentation: string;
    projectManagement: string;
    appSubtitle: string;
    userTitle: string;
  };
  header: {
    currentModule: string;
    searchPlaceholder: string;
    lightMode: string;
    darkMode: string;
    export: string;
    exportPdf: string;
    exportCsv: string;
    generatingPdf: string;
  };
  input: {
    parameters: string;
    structureName: string;
    structureType: string;
    dimensions: string;
    fillLimit: string;
    addCable: string;
    calculate: string;
    width: string;
    height: string;
    quantity: string;
    standardSize: string;
    customSize: string;
    diameter: string;
    size: string;
    tagPlaceholder: string;
    editTag: string;
    hasSeparator: string;
    mixedSystemsWarning: string;
    conduitMixedWarning: string;
    separatorRequiredWarning: string;
    clearAll: string;
    cableAdded: string;
    cableRemoved: string;
    allCablesRemoved: string;
    searchCables: string;
    favorites: string;
    notes: string;
    notesPlaceholder: string;
  };
  results: {
    utilization: string;
    status: string;
    pass: string;
    fail: string;
    totalArea: string;
    usedArea: string;
    numberOfTrays: string;
    autoScaled: string;
    deltaMax: string;
    allow: string;
  };
  preview: {
    structuralPreview: string;
    crossSection: string;
    isometric: string;
    cableSchedule: string;
    noTag: string;
    noCables: string;
    noSavedProjects: string;
    structure: string;
    limit: string;
    utilization: string;
    reset: string;
    newProject: string;
    deleteProject: string;
    project: string;
    saveProject: string;
    savedProjects: string;
    loadProject: string;
    lastSaved: string;
    mustBeLoggedIn: string;
    saveError: string;
    unexpectedError: string;
    pdfExportError: string;
    zoomIn: string;
    zoomOut: string;
    fitToScreen: string;
    shortcuts: string;
    dashboard: string;
  };
  management: {
    addNew: string;
    name: string;
    width: string;
    height: string;
    diameter: string;
    weight: string;
    type: string;
    category: string;
    power: string;
    specialSystems: string;
    actions: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    existingModels: string;
    existingCables: string;
    saveSuccess?: string;
    deleteSuccess?: string;
    confirmDelete?: string;
  };
  auth: {
    login: string;
    register: string;
    username: string;
    password: string;
    signIn: string;
    signUp: string;
    needAccount: string;
    haveAccount: string;
    adminPanel: string;
    logout: string;
    pendingApproval: string;
    connectionError: string;
    email: string;
    name: string;
    systemName: string;
    passwordRequired: string;
  };
  userManagement: {
    title: string;
    users: string;
    approve: string;
    delete: string;
    status: string;
    approved: string;
    pending: string;
    role: string;
    confirmDelete: string;
    createError: string;
    fetchError: string;
    approveError: string;
    updateError: string;
    deleteError: string;
    unknownError: string;
    userCreated: string;
    userApproved: string;
    userDeleted: string;
    changesSaved: string;
    newUser: string;
    searchPlaceholder: string;
    allRoles: string;
    createNewUser: string;
    nameLabel: string;
    emailLabel: string;
    passwordLabel: string;
    passwordRequired: string;
    accessLevel: string;
    accessibleModules: string;
    cancel: string;
    creating: string;
    createUser: string;
    nameHeader: string;
    emailHeader: string;
    levelHeader: string;
    modulesHeader: string;
    statusHeader: string;
    actionsHeader: string;
    noUsersFound: string;
    adjustFilters: string;
    dbColumns: string;
    masterAdminDeleteError: string;
  };
  report: {
    title: string;
    crossSection: string;
    scale: string;
    parameters: string;
    totalArea: string;
    usedArea: string;
    reserveFactor: string;
    formula: string;
    finalResult: string;
    occupancyRate: string;
    approved: string;
    rejected: string;
    cableManifest: string;
    total: string;
    units: string;
    specification: string;
    dimension: string;
    tag: string;
    qty: string;
    printPDF: string;
    projectId: string;
    client: string;
    engineer: string;
    emissionDate: string;
    digitalSignature: string;
    verificationHash: string;
    generatedAt: string;
  };
  selector: {
    chooseModule: string;
    cableFillDesc: string;
    capitolatoDesc: string;
    enter: string;
  };
  capitolato: {
    newCapitolato: string;
    docSettings: string;
    projectTitle: string;
    docDate: string;
    issuer: string;
    premise: string;
    selectCategories: string;
    totalItems: string;
    estimatedPages: string;
    generatePreview: string;
    exportWord: string;
    materialsLibrary: string;
    existingProjects: string;
    noProjects: string;
    productCode: string;
    technicalSpecs: string;
    description: string;
    relatedDocs: string;
    personalize: string;
    technicalSheet: string;
    projectTitleLabel: string;
    clientName: string;
    clientNamePlaceholder: string;
    docDateLabel: string;
    issuerLabel: string;
    issuerPlaceholder: string;
    premiseLabel: string;
    premisePlaceholder: string;
    selectItemsByDiscipline: string;
    searchItems: string;
    selectedItems: string;
    code: string;
    itemDescription: string;
    referenceBrand: string;
    pages: string;
    searchMaterials: string;
    items: string;
    revision: string;
    date: string;
    discipline: string;
    executed: string;
    verified: string;
    approved: string;
    categories: {
      power: string;
      lighting: string;
      fire: string;
      data: string;
      trays: string;
      solar: string;
      cctv: string;
      custom: string;
    };
    projectDeleted: string;
    deleteError: string;
    saveError: string;
    projectSaved: string;
    noRecentProjects: string;
    noElements: string;
    noTemplate: string;
    imageNotAvailable: string;
    referenceBrandLabel: string;
    approvedEquivalent: string;
    // New UI translations
    principal: string;
    dashboard: string;
    projects: string;
    elementsLibrary: string;
    userManagementNav: string;
    savedProjects: string;
    recentProjects: string;
    viewAll: string;
    technicalElementsLibrary: string;
    editElement: string;
    newElement: string;
    preview: string;
    exportToWord: string;
    exporting: string;
    saving: string;
    blueprintPreview: string;
    createNewCapitolato: string;
    startNewDocument: string;
    // ElementLibrary translations
    searchElements: string;
    all: string;
    elementsCount: string;
    element_singular: string;
    element_plural: string;
    noElementsMatchFilters: string;
    noElementsYet: string;
    img: string;
    title: string;
    category: string;
    brand: string;
    updated: string;
    actions: string;
    edit: string;
    duplicate: string;
    delete: string;
    deleteElementTitle: string;
    deleteElementMessage: string;
    duplicateError: string;
    elementDuplicated: string;
    deleteErrorElement: string;
    elementDeleted: string;
    // TechnicalElementForm translations
    technicalDescription: string;
    dimensionalCharacteristics: string;
    normativeReferences: string;
    technicalCharacteristics: string;
    typeOfUse: string;
    controlsAndTests: string;
    titleRequired: string;
    elementSaved: string;
    hidePreview: string;
    showPreview: string;
    generalInformation: string;
    examplePlaceholder: string;
    selectedCategory: string;
    imageReference: string;
    upload: string;
    uploading: string;
    chooseFile: string;
    removeImage: string;
    docxStructurePreview: string;
    elementTitlePlaceholder: string;
    graphicReference: string;
    noImage: string;
    referenceBrandFooter: string;
    // CapitolatoMetadataForm translations
    projectMetadata: string;
    docxTemplate: string;
    projectInfo: string;
    docDetails: string;
    approvalsAndSignatures: string;
    executedBy: string;
    verifiedBy: string;
    approvedBy: string;
    importantNote: string;
    templateKeysInfo: string;
  };
  misc: {
    techNotes: string;
    occupancyDist: string;
    keyboardShortcuts: string;
    increaseProductivity: string;
    reportPreview: string;
    widthShort: string;
    heightShort: string;
    threeDPreview: string;
    threeDControls: string;
    addCablesPrompt: string;
    understood: string;
    saveProjectShortcut: string;
    newProjectShortcut: string;
    closeModalsShortcut: string;
  };
  cableTypes: {
    power: string;
    data: string;
    evac: string;
    irai: string;
  };
  cabineMT: {
    /** Module metadata */
    moduleName: string;
    moduleDesc: string;
    /** Section headers */
    inputParameters: string;
    results: string;
    /** Input labels */
    numTransformers: string;
    powerKVA: string;
    primaryVoltageKV: string;
    secondaryVoltageV: string;
    shortCircuitVoltagePct: string;
    shortCircuitVoltageDefault: string;
    faultTimeS: string;
    conductorMaterial: string;
    copper: string;
    aluminum: string;
    /** Result labels */
    totalPower: string;
    shortCircuitCurrent: string;
    earthingCable: string;
    collectorBusbar: string;
    equipotentialBandella: string;
    calculatedSection: string;
    normalizedSection: string;
    normativeReference: string;
    kFactor: string;
    /** Units */
    unitA: string;
    unitMM2: string;
    unitKVA: string;
    unitKV: string;
    unitV: string;
    unitS: string;
    unitPct: string;
    unitW: string;
    unitKW: string;
    unitM: string;
    unitM3: string;
    unitM3h: string;
    unitBTU: string;
    /** Actions */
    exportPDF: string;
    back: string;
    calculating: string;
    noResults: string;
    fillInputs: string;
    /** Validation */
    mustBePositive: string;
    invalidInput: string;
    mustBeInteger: string;
    /** Project management */
    saveProject: string;
    newProject: string;
    projectSaved: string;
    mustBeLoggedIn: string;
    /** Tab navigation */
    groundingTab: string;
    ventilationTab: string;
    /** Ventilation */
    addElement: string;
    thermalElements: string;
    chooseElementType: string;
    transformer: string;
    switchboardMT: string;
    switchboardBT: string;
    cabineDimensions: string;
    cabineHeight: string;
    cabineWidth: string;
    cabineLength: string;
    efficiency: string;
    dissipatedPower: string;
    nominalCurrent: string;
    nominalCurrentOptional: string;
    totalHeat: string;
    btuRequired: string;
    airflowRequired: string;
    cabineVolume: string;
    noElements: string;
    addFirstElement: string;
    elementLabel: string;
    quantity: string;
    editElement: string;
    removeElement: string;
    addElementTitle: string;
    ventilationResults: string;
    thermalBreakdown: string;
    deltaT: string;
    confirm: string;
    cancel: string;
    savedProjects: string;
    noSavedProjects: string;
    clickSaveHint: string;
    transformerSection: string;
    protectionSection: string;
    conductorSection: string;
  };
}

