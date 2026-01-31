# Sistema de Gerenciamento de Aplicações Windows

Sistema completo para gerenciar status, versões e downloads de múltiplas aplicações Windows (.exe).

## 📋 Estrutura

### Aplicações Configuradas

1. **slottedaimbot** → "Valorant AimPrivate"
2. **valorant-aimbot-color** → "Valorant Aimbot Color"
3. **cs2-elevate** → "Counter Strike 2 Elevate"
4. **vgc-bypass** → "VGC Bypass"
5. **syntraspoofer** → "SyntraSpoofer"

### Estrutura de Pastas

```
downloads/
  ├── slottedaimbot/
  │   └── SlottedAimbot-v1.1.0.exe
  ├── valorant-aimbot-color/
  ├── cs2-elevate/
  ├── vgc-bypass/
  └── syntraspoofer/
```

## 🔌 API Endpoints

### GET /api/apps
Lista todas as aplicações configuradas.

**Resposta:**
```json
[
  {
    "id": "slottedaimbot",
    "name": "Valorant AimPrivate",
    "status": { ... }
  }
]
```

### GET /api/status/:appId
Retorna status de uma aplicação específica.

**Resposta:**
```json
{
  "status": "online",
  "current_version": "1.0.0",
  "min_version": "1.0.0",
  "maintenance": false,
  "message": "Aplicação está online e atualizada.",
  "download_url": "https://app-status-n3ki.onrender.com/downloads/slottedaimbot/SlottedAimbot-v1.1.0.exe",
  "release_notes": "v1.1.0 - Melhorias"
}
```

### POST /api/status/:appId
Atualiza status de uma aplicação (requer autenticação admin).

**Body:**
```json
{
  "status": "online",
  "current_version": "1.1.0",
  "min_version": "1.0.0",
  "maintenance": false,
  "message": "Nova versão disponível!",
  "release_notes": "v1.1.0 - Melhorias de performance"
}
```

### GET /downloads/:appId/:filename
Serve arquivo .exe para download (público, sem autenticação).

**Exemplo:**
```
GET /downloads/slottedaimbot/SlottedAimbot-v1.1.0.exe
```

### POST /api/upload/:appId
Upload de arquivo .exe (requer autenticação admin).

**Form Data:**
- `file`: arquivo .exe

**Resposta:**
```json
{
  "success": true,
  "filename": "SlottedAimbot-v1.1.0.exe",
  "downloadUrl": "https://app-status-n3ki.onrender.com/downloads/slottedaimbot/SlottedAimbot-v1.1.0.exe",
  "size": 5242880,
  "status": { ... }
}
```

### GET /api/apps/:appId/files
Lista arquivos disponíveis de uma aplicação (requer autenticação admin).

**Resposta:**
```json
{
  "files": [
    {
      "filename": "SlottedAimbot-v1.1.0.exe",
      "size": 5242880,
      "created": "2024-01-15T10:30:00.000Z",
      "modified": "2024-01-15T10:30:00.000Z",
      "download_url": "https://..."
    }
  ]
}
```

## 🖥️ Interface Admin

Acesse `/admin/apps` após fazer login como administrador.

**Funcionalidades:**
- ✅ Visualizar status de todas aplicações
- ✅ Editar status, versões, mensagens e release notes
- ✅ Upload de arquivos .exe
- ✅ Listar e deletar arquivos disponíveis
- ✅ Controle de manutenção (maintenance mode)

## 🔄 Auto-Update (Cliente C++)

Os clientes C++ devem implementar a seguinte lógica:

1. **Verificar atualização:**
   ```cpp
   GET /api/status/{appId}
   ```

2. **Comparar versões:**
   - Se `current_version` > versão do cliente → há atualização disponível

3. **Download automático:**
   - Baixar arquivo de `download_url`
   - Verificar integridade (opcional)

4. **Instalação:**
   - Executar arquivo .exe baixado
   - Substituir versão antiga

**Exemplo de fluxo:**
```
Cliente v1.0.0 → GET /api/status/slottedaimbot
Resposta: current_version = "1.1.0"
→ Download: https://app-status-n3ki.onrender.com/downloads/slottedaimbot/SlottedAimbot-v1.1.0.exe
→ Executar instalador
```

## ⚙️ Configuração

### Variáveis de Ambiente

```env
BASE_URL=https://app-status-n3ki.onrender.com
PORT=5001
```

### Criar Estrutura de Pastas

As pastas são criadas automaticamente ao fazer upload, mas você pode criar manualmente:

```bash
mkdir -p downloads/slottedaimbot
mkdir -p downloads/valorant-aimbot-color
mkdir -p downloads/cs2-elevate
mkdir -p downloads/vgc-bypass
mkdir -p downloads/syntraspoofer
```

## 📝 Notas Importantes

1. **Versões:** Use formato semântico (1.0.0, 1.1.0, etc.)
2. **Download URL:** Sempre URL completa (https://...)
3. **Arquivos .exe:** Apenas arquivos .exe são aceitos no upload
4. **Tamanho máximo:** 100MB por arquivo
5. **Manutenção:** Quando `maintenance: true`, clientes devem bloquear uso
6. **Versão mínima:** Clientes abaixo de `min_version` devem forçar atualização

## 🚀 Uso

1. **Iniciar servidor:**
   ```bash
   npm run dev
   ```

2. **Acessar admin:**
   - Login em `/admin/login`
   - Navegar para `/admin/apps`

3. **Gerenciar aplicações:**
   - Editar status conforme necessário
   - Fazer upload de novos arquivos .exe
   - Versões são detectadas automaticamente do nome do arquivo (ex: App-v1.2.3.exe)

4. **Clientes C++:**
   - Verificar `/api/status/{appId}` periodicamente
   - Baixar e instalar quando houver atualização

## 🔒 Segurança

- Upload e edição de status requerem autenticação admin
- Downloads são públicos (sem autenticação)
- Arquivos são validados (apenas .exe)
- Tamanho máximo de 100MB por arquivo
