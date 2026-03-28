import json
from pathlib import Path
from docxtpl import DocxTemplate

def carica_database_voci(path: str) -> list[dict]:
    """Carrega o banco de voci padrão de um arquivo JSON."""
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)

def valida_dati(dati: dict) -> tuple[bool, list[str]]:
    """Valida o dicionário de entrada para os dados obrigatórios."""
    erros = []
    campos_obrigatorios = ["nome_progetto", "cliente", "codice_progetto", "voci_capitolato"]

    for campo in campos_obrigatorios:
        if campo not in dati:
            erros.append(f"Campo obrigatório '{campo}' ausente.")
    
    # Validar que voci_capitolato é uma lista (se existir)
    if "voci_capitolato" in dati:
        if not isinstance(dati["voci_capitolato"], list):
            erros.append("O campo 'voci_capitolato' deve ser uma lista.")

    sucesso = len(erros) == 0
    return sucesso, erros

def genera_capitolato(dati: dict, template_path: str) -> str:
    """Gera o documento Capitolato a partir do template fornecido e dos dados providos."""
    # 1. Validar estrutura base (simples)
    sucesso_validacao, erros = valida_dati(dati)
    if not sucesso_validacao:
        raise ValueError(f"Dados informados inválidos: {', '.join(erros)}")

    # 2. Carregar Template
    if not Path(template_path).exists():
         raise FileNotFoundError(f"Template '{template_path}' não encontrado.")
    
    doc = DocxTemplate(template_path)

    # 3. Processar Voci (filtrar e renumerar os inlcusi)
    voci_ativas = []
    numero_base_sequencia = 1
    
    for voce in dati.get("voci_capitolato", []):
        if voce.get("includi", False):
            # Cópia profunda da voce para evitar alterar o original da referência,
            # embora em Python isso seja apenas raso por default. O dict copy basta na verdade.
            nova_voce = voce.copy()
            # Renumerar
            nova_voce["numero_ordine"] = f"3.2.{numero_base_sequencia}"
            numero_base_sequencia += 1
            
            # Garantir a string obrigatória ao final do marchio di riferimento.
            marcas = nova_voce.get("marche_riferimento", "")
            if marcas and not marcas.lower().endswith("o simile") and not marcas.lower().endswith("o simile approvato"):
                 if "simile" not in marcas.lower():
                     nova_voce["marche_riferimento"] = marcas + " o SIMILE"
            
            # Tratamento de Imagem para docxtpl InlineImage
            img_data = nova_voce.get("image", "")
            nova_voce["inline_image"] = ""
            if img_data:
                try:
                    import io
                    from docxtpl import InlineImage
                    from docx.shared import Mm
                    import urllib.request
                    
                    if img_data.startswith("http"):
                        req = urllib.request.Request(img_data, headers={'User-Agent': 'Mozilla/5.0'})
                        with urllib.request.urlopen(req, timeout=5) as response:
                            img_stream = io.BytesIO(response.read())
                        nova_voce["inline_image"] = InlineImage(doc, img_stream, width=Mm(60))
                    elif img_data.startswith("data:image"):
                        import base64
                        header, encoded = img_data.split(",", 1)
                        img_stream = io.BytesIO(base64.b64decode(encoded))
                        nova_voce["inline_image"] = InlineImage(doc, img_stream, width=Mm(60))
                except Exception as e:
                    print(f"Errore download image: {e}")
            
            voci_ativas.append(nova_voce)

    # Atualiza dados no dicionário context para o formato filtrado
    context = dati.copy()
    context["voci_capitolato"] = voci_ativas
    
    # Garantir a existência do campo codice_file conforme regado.
    if "codice_file" not in context:
        codice_file = f"{context['codice_progetto']}-CT-ZZ-{str(context.get('revisione', '00')).zfill(2)}"
        context["codice_file"] = codice_file

    # 4. Renderizar Variables no DocxTemplate.
    doc.render(context)
    
    # 5. Salvar output gerado com o nome específico.
    nome_output = f"{context['codice_progetto']}_Rev{str(context.get('revisione', '00')).zfill(2)}.docx"
    doc.save(nome_output)
    
    return nome_output

if __name__ == "__main__":
    pass
