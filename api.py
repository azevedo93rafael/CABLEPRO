from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import json
import uuid
import asyncer
from capitolato_generator import genera_capitolato

app = FastAPI()

# Configuração de CORS para permitir que o Vite consuma a porta
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Na prod, alinhe para o domain do host.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = os.path.join(os.getcwd(), "tmp_capitolato")
os.makedirs(TEMP_DIR, exist_ok=True)

@app.post("/api/generate")
async def generate_document(
    template: UploadFile = File(...),
    dati: str = Form(...)  # Recebe JSON como payload no Form de dados.
):
    try:
        dados = json.loads(dati)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro ao parsear 'dati' JSON: {e}")
        
    temp_folder = os.path.join(TEMP_DIR, str(uuid.uuid4()))
    os.makedirs(temp_folder, exist_ok=True)
    
    template_path = os.path.join(temp_folder, template.filename or "template.docx")
    
    # Salva template temporario recebido do frontend
    with open(template_path, "wb") as f:
        content = await template.read()
        f.write(content)
        
    try:
        # Gerar o arquivo. Precisamos garantir que salva na temp_folder.
        # Ajustamos o cwd/args internamente no generator. Mas passamos para render localmente.
        original_cwd = os.getcwd()
        os.chdir(temp_folder) # Garante output gerado no temp dir.
        
        output_filename = genera_capitolato(dados, template_path)
        output_full_path = os.path.join(temp_folder, output_filename)
        
        os.chdir(original_cwd) # Restaura logo apôs termino
        
        return FileResponse(
             path=output_full_path, 
             filename=output_filename,
             media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document',
             # Em producao, seria bom ter FileResponse(background=BackgroundTask(remove_folder, temp_folder))
        )
    except Exception as e:
        # Retornar CWD ao safe mode em caso de throw (e ignorar race conditions por enquanto, em api basica).
        try: os.chdir(os.path.dirname(TEMP_DIR)) 
        except: pass
        raise HTTPException(status_code=500, detail=f"Erro na geraçao do documento: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
