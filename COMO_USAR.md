# 🚀 Como Executar o Projeto

## 📋 Opções de Execução

### Opção 1: Executar Tudo de Uma Vez (Recomendado) ✨

Execute o frontend E backend simultaneamente em um único comando:

```bash
npm run dev
```

Isso vai:
- ✅ Iniciar o backend na porta 5000
- ✅ Iniciar o frontend na porta 3000
- ✅ Mostrar logs de ambos lado a lado
- ✅ Parar tudo com `Ctrl + C`

### Opção 2: Executar Separadamente

**Terminal 1 - Backend:**
```bash
npm run start:backend
# ou
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run start:frontend
# ou
npm start
```

### Opção 3: Scripts Individuais

**Apenas Frontend:**
```bash
npm start
```

**Apenas Backend:**
```bash
cd server
npm run dev
```

---

## 🎯 Scripts Disponíveis

| Script | O que faz |
|--------|-----------|
| `npm run dev` | **Inicia TUDO** (backend + frontend) ✨ |
| `npm start` | Inicia apenas o frontend |
| `npm run start:frontend` | Inicia apenas o frontend |
| `npm run start:backend` | Inicia apenas o backend |

---

## ⚙️ Portas

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000

---

## 🔧 Dependências

Se for a primeira vez executando, instale as dependências:

```bash
# Na raiz do projeto
npm install

# No servidor
cd server
npm install
```

---

**💡 Dica:** Use `npm run dev` para desenvolvimento - é mais prático!

