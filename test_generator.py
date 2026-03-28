import json
import os
import sys
from capitolato_generator import carica_database_voci, genera_capitolato

def run_test():
    # Caminhos para os arquivos
    db_path = "database_voci.json"
    template_path = "template_capitolato.docx"
    
    # 1. Carrega o DB base
    if not os.path.exists(db_path):
        print(f"ERRORE: O arquivo DB '{db_path}' não foi encontrado.")
        sys.exit(1)
        
    db = carica_database_voci(db_path)
    
    # Dicionário de atalhos para os IDs do banco e seus objetos
    db_map = {voce["id"]: voce for voce in db}
    
    # IDs a serem ativados:
    ids_to_activate = ["cavo_fg16m16", "interruttori_bt_modulari", "cavo_utp_cat6a"]
    
    voci_param = []
    
    # Puxar do banco apenas as pedidas e ligar a flag
    for vid in db_map: # Para preservar ordem da base
        if vid in ids_to_activate:
            v_copy = db_map[vid].copy()
            v_copy["includi"] = True
            voci_param.append(v_copy)
    
    # 3. Cria dados de teste simulados
    dati_test = {
        "nome_progetto": "Projeto Piloto Teste A",
        "cliente": "Empresa Fictícia",
        "codice_progetto": "150GE-E-IE-ZZ-101",
        "revisione": "00",
        "data_revisione": "28/03/2026",
        "sottotitolo_1": "SOTTOTITOLO TESTE 1,",
        "sottotitolo_2": "SOTTOTITOLO FINAL",
        "titolo_documento": "Capitolato tecnico di Test",
        "disciplina": "ELE",
        "eseguito": "FP",
        "verificato": "FP",
        "approvato": "DDC",
        "data_generazione": "28/03/2026 14:35",
        "voci_capitolato": voci_param
    }
    
    # Imprime os itens ativados como no prompt. Porém na saída, antes eles sao formatados:
    # (Atenção, o mock exibia .2.1, 2.2, 2.3 em vez dos originais)
    print(f"Voci attive: {len(ids_to_activate)}")
    count = 1
    for v in voci_param:
        print(f"  - 3.2.{count} {v['titolo']}")
        count += 1
        
    print("Generazione in corso...")
    
    if not os.path.exists(template_path):
         # Criamos um mock template se ele nao vier no repo so pra fins de test run do cod?
         # Nao podemos pois o user pediu pra nao gerarmos. Porem pra nao quebrar, avisamos:
         print(f"ERRORE: O arquivo '{template_path}' fornecido nao está no diretório atual para rodar o template Jinja.")
         sys.exit(1)
         
    try:
        # 4. Chama gera capitolato
        output_file = genera_capitolato(dati_test, template_path)
        
        # 5. Verifica
        if os.path.exists(output_file):
            size = os.path.getsize(output_file)
            # 6. Imprime Sucesso
            print(f"SUCCESSO: {output_file}")
            print(f"File generato: {size:,} bytes")
        else:
            print("ERRORE: falha desconhecida na geração do arquivo (.docx não encontrado).")
    except Exception as e:
         print(f"ERRORE: Excecao gerada no docxtpl: {e}")

if __name__ == "__main__":
    run_test()
