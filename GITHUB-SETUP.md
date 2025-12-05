# 🚀 Setup Completo GitHub → Replit

## 📋 Visão Geral

Este guia explica como preparar o projeto `retell-mvp` no GitHub e importá-lo automaticamente no Replit.

---

## 🔧 Passo 1: Criar Repositório GitHub

### **Opção A: Via Browser (Recomendado)**

1. Acesse: https://github.com/new
2. Preencha:
   - **Repository name**: `retell-mvp`
   - **Description**: `Sistema de chamadas telefônicas com IA usando Twilio, Retell.ai e OpenAI`
   - **Visibility**: `Private` (recomendado) ou `Public`
3. ✅ **NÃO marque**: "Add README", "Add .gitignore", "Add license" (já temos esses arquivos)
4. Clique em **Create repository**

### **Opção B: Via CLI (Avançado)**

```bash
# Instalar GitHub CLI: https://cli.github.com
gh auth login
gh repo create retell-mvp --private --source=. --remote=origin --push
```

---

## 📤 Passo 2: Push do Código para GitHub

### **2.1. Inicializar Git Localmente**

```bash
cd /caminho/para/retell-mvp
git init
git add .
git commit -m "🎉 Initial commit: Retell MVP project"
```

### **2.2. Conectar ao Repositório Remoto**

```bash
# Adicionar remote (substitua SEU-USUARIO)
git remote add origin https://github.com/SEU-USUARIO/retell-mvp.git

# Verificar remote
git remote -v
```

### **2.3. Push para GitHub**

```bash
# Branch principal (main ou master)
git branch -M main
git push -u origin main
```

### **2.4. Verificar Segurança (CRÍTICO)**

```bash
# Verificar se não commitou credenciais
git log --all --source --full-history -- "*.env"

# Se encontrar arquivos .env commitados:
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

---

## 🚀 Passo 3: Importar no Replit

### **Método 1: URL Rápida (1 clique)**

Acesse esta URL no navegador (substitua `SEU-USUARIO`):

```
https://replit.com/github.com/SEU-USUARIO/retell-mvp
```

### **Método 2: Import Guiado**

1. Acesse: https://replit.com/import
2. Clique em **GitHub**
3. Conecte sua conta GitHub (se necessário)
4. Selecione o repositório: `retell-mvp`
5. Escolha **Privacy**: `Private` (recomendado)
6. Clique em **Import**

### **Método 3: Automação Browser** (Avançado)

Execute o script de automação:

```bash
# No terminal local
node automacao-replit-import.js
```

---

## ⚙️ Passo 4: Configurar Replit Secrets

Após o import, configure as **Secrets** no Replit:

1. Abra a aba **Secrets** (ícone de cadeado 🔐)
2. Adicione cada variável (copie de `.env.replit.template`):

### **Secrets Obrigatórias**

```env
TWILIO_ACCOUNT_SID=AC801c22459d806d9f2107f255e95ac476
TWILIO_AUTH_TOKEN=b0b2466cf01177a1152ae338f8556085
TWILIO_PHONE_NUMBER=+553322980007
TWILIO_API_KEY=SKa55f97ec46ae4f399102fb5f9c2b649
TWILIO_API_SECRET=[SEU_TWILIO_API_SECRET]
RETELL_API_KEY=key_f2cfbba3bc96aec83296fc7d
RETELL_WORKSPACE_ID=org_JY55cp5S9pRJjrV
OPENAI_API_KEY=sk-proj-[SUA_CHAVE_OPENAI]
JWT_SECRET=[GERAR_ALEATORIO_64_CHARS]
```

### **Gerar JWT_SECRET**

No **Shell do Replit**:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🏃 Passo 5: Executar Setup Automático

No **Shell do Replit**:

```bash
chmod +x setup-replit.sh
./setup-replit.sh
```

**O que o script faz**:
- ✅ Instala dependências (`npm install`)
- ✅ Configura Prisma + SQLite
- ✅ Gera migrations
- ✅ Popula banco de dados
- ✅ Compila TypeScript
- ✅ Valida credenciais
- ✅ Detecta URL pública do Replit

---

## ▶️ Passo 6: Iniciar Servidor

Clique no botão verde **Run** no Replit.

**URLs geradas**:
- 🌐 **API Base**: `https://retell-mvp-production.SEU-USER.repl.co`
- 📚 **Swagger**: `https://retell-mvp-production.SEU-USER.repl.co/api`
- ❤️ **Health**: `https://retell-mvp-production.SEU-USER.repl.co/health`

---

## 🔗 Passo 7: Configurar Webhooks

### **7.1. Twilio Webhooks**

Acesse: https://console.twilio.com/phone-numbers/incoming

Para o número `+55 33 2298-0007`:

| Campo                | URL                                                                |
|----------------------|--------------------------------------------------------------------|
| **Webhook Incoming** | `https://SEU-REPL.repl.co/webhooks/twilio/incoming-call`          |
| **Status Callback**  | `https://SEU-REPL.repl.co/webhooks/twilio/call-status`            |

### **7.2. Retell.ai Webhooks**

Acesse: https://dashboard.retellai.com/settings/webhooks

| Campo           | URL                                                     |
|-----------------|---------------------------------------------------------|
| **Webhook URL** | `https://SEU-REPL.repl.co/webhooks/retell/call-events` |

---

## 🧪 Passo 8: Testar Sistema

### **8.1. Health Check**

```bash
curl https://SEU-REPL.repl.co/health
```

**Resposta esperada**:
```json
{"status":"ok","timestamp":"2024-12-05T18:30:00.000Z"}
```

### **8.2. Criar Agente de IA**

```bash
curl -X POST https://SEU-REPL.repl.co/integrations/retell/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vendedor AI",
    "voice": "pt-BR-AntonioNeural",
    "type": "sales"
  }'
```

### **8.3. Fazer Chamada de Teste**

```bash
curl -X POST https://SEU-REPL.repl.co/integrations/twilio/calls \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agt_xxxxx",
    "toNumber": "+5564999526870"
  }'
```

---

## 🔄 Passo 9: Sincronizar GitHub ↔ Replit

### **Commits do Replit para GitHub**

No **Shell do Replit**:

```bash
git add .
git commit -m "feat: atualização via Replit"
git push origin main
```

### **Pull de mudanças do GitHub**

```bash
git pull origin main
```

---

## 🔐 Checklist de Segurança

Antes de fazer push:

- [ ] ✅ `.env` está no `.gitignore`
- [ ] ✅ `CREDENCIAIS-COMPLETAS.md` foi removido
- [ ] ✅ Nenhuma API Key no código
- [ ] ✅ Secrets configuradas apenas no Replit UI
- [ ] ✅ `.env.example` tem apenas placeholders

---

## 📚 Estrutura do Repositório

```
retell-mvp/
├── .github/
│   ├── workflows/
│   │   └── deploy-replit.yml      # CI/CD automático
│   ├── ISSUE_TEMPLATE/
│   │   └── bug_report.md
│   └── PULL_REQUEST_TEMPLATE.md
├── .replit                         # Config Replit
├── replit.nix                      # Deps sistema (Node.js 20)
├── .env.example                    # Template de variáveis
├── .env.replit.template            # Template com instruções
├── .gitignore                      # Arquivos ignorados
├── LICENSE                         # MIT License
├── README.md                       # Documentação principal
├── GITHUB-SETUP.md                 # Este arquivo
├── CONTRIBUTING.md                 # Guia de contribuição
├── package.json
├── setup-replit.sh                 # Setup automático
├── prisma/
│   └── schema.prisma
├── src/
│   └── ...
└── ...
```

---

## ❓ Troubleshooting

### **Erro: `Permission denied (publickey)`**

```bash
# Gerar chave SSH
ssh-keygen -t ed25519 -C "seu-email@example.com"

# Adicionar ao GitHub: https://github.com/settings/keys
cat ~/.ssh/id_ed25519.pub
```

### **Erro: Replit não detecta Node.js**

Verifique se `.replit` e `replit.nix` existem:

```bash
ls -la .replit replit.nix
```

### **Erro: Secrets não carregam**

1. Feche e reabra o Repl
2. Verifique nomes exatos das secrets (case-sensitive)
3. Execute `./setup-replit.sh` novamente

---

## 🎯 Próximos Passos

- ⭐ **Star o repositório** no GitHub
- 📝 Personalizar `README.md` com seu usuário
- 🚀 Configurar **Replit Deployments** para produção
- 🔄 Configurar **UptimeRobot** para keep-alive 24/7

---

**🎉 Pronto! Projeto configurado no GitHub e rodando no Replit!**
