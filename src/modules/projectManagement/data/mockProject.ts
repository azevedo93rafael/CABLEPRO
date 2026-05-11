import { Project } from '../types';

export const mockProject: Project = {
  projectId: 'PRJ-TEMPLATE',
  projectName: 'Template Progetto',
  clientName: '',
  startDate: '',
  description: '',
  progress: 0,
  phases: [
    { id: 'ph-1-1', title: '1.1 Posizione dei quadri', category: 'Distribuzione Generale', status: 'active', items: [
      { id: 'it-1-1-1', text: '1.1.1 Verifica degli ingombri', notes: '', tooltip: 'Verificare che le dimensioni fisiche del quadro elettrico nel disegno corrispondano a quelle reali.', checked: false },
      { id: 'it-1-1-2', text: '1.1.2 Verifica posizione e conflitti con porte, pareti, ecc.', notes: '', tooltip: 'Assicurarsi che l\'apertura delle porte e il passaggio non siano ostruiti.', checked: false },
      { id: 'it-1-1-3', text: '1.1.3 Verifica presenza o assenza di contattore e avanquadro', notes: '', tooltip: 'Controllare se è previsto un quadro di sezionamento a monte o contattori.', checked: false },
      { id: 'it-1-1-4', text: '1.1.4 Verifica presenza di tag sui quadri.', notes: '', tooltip: 'Verificare che ogni quadro abbia la propria etichetta identificativa.', checked: false },
      { id: 'it-1-1-5', text: '1.1.5 Schema influenza dei quadri elettrici.', notes: '', tooltip: 'Controllare la presenza dello schema che indica quali aree sono alimentate da ciascun quadro.', checked: false }
    ]},
    { id: 'ph-1-2', title: '1.2. Canaline e Cavidotti', category: 'Distribuzione Generale', status: 'active', items: [
      { id: 'it-1-2-1', text: '1.2.1. Verificare distribuzione canaline', notes: '', tooltip: 'Controllare che i percorsi delle canaline siano ottimali.', checked: false },
      { id: 'it-1-2-2', text: '1.2.2. Verificare percorso di collegamento dei quadri.', notes: '', tooltip: 'Assicurarsi che i collegamenti tra i quadri seguano il percorso più logico.', checked: false },
      { id: 'it-1-2-3', text: '1.2.3. Verificare dimensione dei corrugati, cavidotti, canaline.', notes: '', tooltip: 'Verificare che il dimensionamento sia idoneo.', checked: false },
      { id: 'it-1-2-4', text: '1.2.4. Verificare arrivo di canaline e/o tubi sui quadri. Indicare modo di arrivo.', notes: '', tooltip: 'Verificare se l\'ingresso nel quadro avviene dall\'alto, dal basso o lateralmente.', checked: false },
      { id: 'it-1-2-5', text: '1.2.5. Verificare presenza di tag sugli elementi', notes: '', tooltip: 'Ogni tratto deve essere identificato secondo le specifiche.', checked: false },
      { id: 'it-1-2-6', text: '1.2.6. Fare sezione delle canaline per verificare riempimento delle dorsali (se esecutivo)', notes: '', tooltip: 'Calcolare lo spazio occupato dai cavi.', checked: false }
    ]},
    { id: 'ph-1-3', title: '1.3. Scatole di derivazione', category: 'Distribuzione Generale', status: 'active', items: [
      { id: 'it-1-3-1', text: '1.3.1. Verificare distribuzione delle scatole di derivazione', notes: '', tooltip: 'Controllare che le scatole siano posizionate in punti strategici.', checked: false },
      { id: 'it-1-3-2', text: '1.3.2. Verificare scatola di derivazione sotto i quadri', notes: '', tooltip: 'Assicurarsi della presenza di una scatola di raccolta cavi sotto ogni quadro.', checked: false },
      { id: 'it-1-3-3', text: '1.3.3. Verificare presenza o assenza di dimensione delle scatole', notes: '', tooltip: 'Verificare que la dimensione della scatola sia indicata.', checked: false }
    ]},
    { id: 'ph-1-4', title: '1.4. Pozzetti', category: 'Distribuzione Generale', status: 'active', items: [
      { id: 'it-1-4-1', text: '1.4.1. Verificare presenza o assenza di pozzetti nel progetto', notes: '', tooltip: 'Controllare se i pozzetti sono stati previsti.', checked: false },
      { id: 'it-1-4-2', text: '1.4.2. Verificare presenza o assenza tag di dimensione dei pozzetti', notes: '', tooltip: 'Ogni pozzetto deve avere indicata la propria dimensione.', checked: false }
    ]},
    { id: 'ph-1-5', title: '1.5. Legenda', category: 'Distribuzione Generale', status: 'active', items: [
      { id: 'it-1-5-1', text: '1.5.1. Verificare presenza di tutti gli elementi in legenda', notes: '', tooltip: 'Ogni simbolo deve essere correttamente riportato.', checked: false },
      { id: 'it-1-5-2', text: '1.5.2. Verificare dimensione dei simboli in legenda. Devono essere uguali alla dimensione che si vede in tavola', notes: '', tooltip: 'Coerenza grafica tra i simboli e la tavola.', checked: false },
      { id: 'it-1-5-3', text: '1.5.3. Verificare descrizione degli elementi: specifiche, installazione, dimensione, ecc.', notes: '', tooltip: 'Le descrizioni devono essere esaustive.', checked: false },
      { id: 'it-1-5-4', text: '1.5.4. Verificare presenza della pianta con zona dei quadri', notes: '', tooltip: 'Verificare se esiste la pianta con la zona dei quadri.', checked: false },
      { id: 'it-1-5-5', text: '1.5.5. Verificare presenza o assenza della sezione canaline con circuiti', notes: '', tooltip: 'Verificare se sono stati prodotti elaborati di dettaglio.', checked: false },
      { id: 'it-1-5-6', text: '1.5.6. Verificare presenza o assenza di dettagli costruttivi negli elaborati.', notes: '', tooltip: 'Assicurarsi che siano presenti i dettagli costruttivi.', checked: false }
    ]}
  ]
};
