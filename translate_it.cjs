const fs = require('fs');
const path = require('path');

const targetDir = 'c:/Users/Rafael Azevedo/.gemini/antigravity/scratch/CABLEPRO/src/modules/cmeGenerator';

const dict = {
  // SetupView
  'Configurar Geração': 'Configura Generazione',
  '1. Prezzario de Referência': '1. Prezzario di Riferimento',
  '2. Prezzario Alvo (Mapeamento)': '2. Prezzario Target (Mappatura)',
  'Base de dados primária onde os códigos da coluna': 'Database primario in cui i codici della colonna',
  'da sua tabela serão procurados.': 'della tua tabella saranno cercati.',
  'Onde o assistente irá procurar os novos códigos caso queira mapear para outro catálogo.': 'Dove l\'assistente cercherà i nuovi codici in caso di mappatura su un altro catalogo.',
  'Arraste o seu Excel (.xlsx) ou CSV do Revit aqui': 'Trascina qui il tuo Excel (.xlsx) o CSV di Revit',
  'ou clique para selecionar ficheiro': 'o clicca per selezionare il file',
  'Processar Documento': 'Elabora Documento',
  'A Ler Ficheiro...': 'Lettura file...',

  // ProcessingView
  'A processar elemento': 'Elaborazione elemento',
  'Encontrado no prezzario target.': 'Trovato nel prezzario target.',
  'Não encontrado. Mapeamento manual / IA necessário.': 'Non trovato. Necessaria mappatura manuale / IA.',
  'Erro ao carregar prezzarios.': 'Errore durante il caricamento dei prezzari.',

  // ProjectsView
  'Meus Projetos': 'I Miei Progetti',
  'Novo Projeto': 'Nuovo Progetto',
  'Nenhum projeto gravado.': 'Nessun progetto salvato.',
  'Comece por criar o seu primeiro computo!': 'Inizia creando il tuo primo computo!',
  'Novo Computo': 'Nuovo Computo',
  'Cancelar': 'Annulla',

  // ResultsView
  'EXPORTAR EXCEL': 'ESPORTA EXCEL',
  'A EXPORTAR...': 'ESPORTAZIONE IN CORSO...',
  'GRAVAR PROJETO': 'SALVA PROGETTO',
  'A GUARDAR...': 'SALVATAGGIO...',
  'Qual o nome deste novo projeto (computo)?': 'Qual è il nome di questo nuovo progetto (computo)?',
  'Projeto guardado com sucesso!': 'Progetto salvato con successo!',
  'Erro ao guardar projeto.': 'Errore durante il salvataggio del progetto.',
  'TUDO': 'TUTTO',
  'NÃO ECONTRADO': 'NON TROVATO',
  'Não Encontrado': 'Non Trovato',
  'Totale Generale': 'Totale Generale',
  'Por Categoria': 'Per Categoria',
  'Por Edificio': 'Per Edificio',

  // NvpBuilderModal
  'Adicionar Material': 'Aggiungi Materiale',
  'Sconto %': 'Sconto %',
  'Adicionar Mão de Obra': 'Aggiungi Manodopera',
  'Custo Total Alugueres': 'Costo Totale Noleggi',
  '% de A (Material)': '% di A (Materiale)',
  '% de E (Total de Custos)': '% di E (Totale dei Costi)',
  '% de E + F': '% di E + F',
  'Fonte / Referência': 'Fonte / Riferimento',
  'Ex: Cotação fornecedor X...': 'Es: Preventivo fornitore X...',
  'PULAR NVP': 'SALTA NVP',
  'CONFIRMAR NVP': 'CONFERMA NVP',

  // ReviewView
  'Revisão do Computo': 'Revisione del Computo',
  'Existem itens que não foram encontrados no prezzario target.': 'Ci sono elementi che non sono stati trovati nel prezzario target.',
  'Ajude a Inteligência Artificial a mapear as categorias para uso futuro.': 'Aiuta l\'Intelligenza Artificiale a mappare le categorie per uso futuro.',
  'Terminar Revisão': 'Termina Revisione',
  'Itens para Rever': 'Elementi da Revisionare',
  'APROVAR': 'APPROVA',
  'CORRIGIR': 'CORREGGI',
  'Pesquisar tarifa manualmente...': 'Cerca tariffa manualmente...',
  'Pular': 'Salta',
  'Confirmar Correção': 'Conferma Correzione',
};

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const [pt, it] of Object.entries(dict)) {
        // Use a global regex. Escape regex chars in pt just in case.
        const regex = new RegExp(pt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        content = content.replace(regex, it);
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log(`Translated in ${fullPath}`);
      }
    }
  }
}

processDir(targetDir);
