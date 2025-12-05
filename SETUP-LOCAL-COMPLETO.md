# 🚀 SETUP LOCAL COMPLETO - RETELL MVP

## 📋 PRÉ-REQUISITOS

Antes de começar, verifique:

```bash
# Verificar Node.js (precisa 18+)
node -v

# Verificar npm
npm -v
```

**Não tem Node.js?** Instale de: https://nodejs.org/ (baixe a versão LTS)

---

## 📦 PASSO 1: OBTER O CÓDIGO

### Opção A: Copiar do Sandbox

Todos os arquivos estão em `/home/user/retell-mvp/`

**Arquivos necessários:**
```
retell-mvp/
├── src/                    # Todo o código-fonte (11 arquivos .ts)
├── prisma/                 # Schema + seed + migrations
├── package.json
├── tsconfig.json
├── nest-cli.json
├── .env
├── INSTALL-LOCAL.sh        # Script de instalação automática
└── *.md                    # Documentação
```

### Opção B: Criar manualmente

Se preferir, posso gerar um **arquivo ZIP** ou **repositório Git**.

---

## ⚡ PASSO 2: INSTALAÇÃO AUTOMÁTICA (RECOMENDADO)

Na sua máquina, dentro da pasta `retell-mvp/`:

```bash
# Dar permissão de execução
chmod +x INSTALL-LOCAL.sh

# Executar instalação completa
./INSTALL-LOCAL.sh
```

**O script faz tudo automaticamente:**
- ✅ Verifica Node.js
- ✅ Instala dependências (npm install)
- ✅ Gera Prisma Client
- ✅ Cria banco SQLite
- ✅ Aplica migrations
- ✅ Popula dados de exemplo
- ✅ Compila TypeScript

**Tempo: 2-3 minutos**

---

## 🔧 PASSO 3: INSTALAÇÃO MANUAL (Alternativa)

Se preferir executar passo a passo:

```bash
# 1. Entrar na pasta
cd retell-mvp

# 2. Instalar dependências
npm install

# 3. Gerar Prisma Client
npx prisma generate

# 4. Criar banco e rodar migrations
npx prisma migrate dev --name init

# 5. Popular dados de exemplo
npx tsx prisma/seed.ts

# 6. (Opcional) Build da aplicação
npm run build
```

---

## 🚀 PASSO 4: INICIAR APLICAÇÃO

```bash
npm run start:dev
```

**Aguarde até ver:**

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 RETELL AI MVP - API RODANDO!                        ║
║                                                           ║
║   🌐 API:     http://localhost:3000                      ║
║   📖 Swagger: http://localhost:3000/api                  ║
║   💚 Health:  http://localhost:3000/health               ║
║                                                           ║
║   Environment: development                                ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

✅ Prisma connected to database
```

**Pronto! Aplicação rodando** 🎉

---

## 🧪 PASSO 5: TESTAR (Em outro terminal)

### Teste 1: Health Check

```bash
curl http://localhost:3000/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-05T04:30:00.000Z",
  "uptime": 12.34,
  "database": "connected",
  "environment": "development"
}
```

### Teste 2: Listar Agentes

```bash
curl http://localhost:3000/agents
```

**Retorna array com 2 agentes:**
```json
[
  {
    "id": "uuid-aqui",
    "name": "Assistente de Vendas",
    "type": "inbound",
    "status": "active",
    "voiceId": "en-US-JennyNeural",
    "llmModel": "gpt-4",
    ...
  },
  {
    "id": "uuid-aqui-2",
    "name": "Suporte Técnico",
    "type": "inbound",
    "status": "active",
    "voiceId": "en-US-GuyNeural",
    "llmModel": "gpt-3.5-turbo",
    ...
  }
]
```

### Teste 3: Criar Novo Agente

```bash
curl -X POST http://localhost:3000/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Meu Agente Teste",
    "type": "inbound",
    "systemPrompt": "Você é um assistente útil e prestativo",
    "voiceId": "en-US-JennyNeural",
    "firstMessage": "Olá! Como posso ajudar você hoje?"
  }'
```

**Retorna o agente criado com ID gerado**

### Teste 4: Ver Chamadas

```bash
curl http://localhost:3000/calls
```

**Retorna 2 chamadas de exemplo**

### Teste 5: Analytics

```bash
curl http://localhost:3000/calls/analytics
```

**Resposta:**
```json
{
  "totalCalls": 2,
  "totalDuration": 605,
  "avgDuration": 302,
  "totalCost": 0.40,
  "callsByStatus": {
    "ended": 2,
    "ongoing": 0,
    "failed": 0
  }
}
```

---

## 🌐 PASSO 6: SWAGGER UI (Navegador)

Abra no navegador:

```
http://localhost:3000/api
```

**Interface visual completa** para:
- ✅ Ver todos os endpoints
- ✅ Testar requisições
- ✅ Ver schemas de dados
- ✅ Experimentar payloads

---

## 🎯 PRÓXIMOS PASSOS

### 1. Explorar Prisma Studio (Visual DB)

```bash
npx prisma studio
```

Abre em `http://localhost:5555`

**Visualize e edite dados diretamente:**
- Organizations
- Users
- Agents
- Calls

### 2. Configurar Credenciais Reais

Edite `.env` com suas chaves:

```bash
# Retell.ai
RETELL_API_KEY=key_real_aqui

# Twilio
TWILIO_ACCOUNT_SID=ACreal_aqui
TWILIO_AUTH_TOKEN=token_real
TWILIO_PHONE_NUMBER=+5511999999999

# OpenAI
OPENAI_API_KEY=sk-real_aqui
```

### 3. Testar Integração Retell.ai

Após configurar as chaves, o sistema está pronto para:

1. **Criar agente na Retell.ai automaticamente**
2. **Receber webhooks de chamadas**
3. **Processar transcrições em tempo real**

### 4. Desenvolver Frontend

O backend está **100% pronto** para receber requisições do frontend React/Next.js.

---

## 📊 ESTRUTURA DO BANCO (SQLite)

### Organization
```sql
id, name, subdomain, apiKey, settings, createdAt, updatedAt
```

### User
```sql
id, email, name, passwordHash, role, organizationId, createdAt, updatedAt
```

### Agent
```sql
id, name, type, status, systemPrompt, firstMessage, voiceId,
llmProvider, llmModel, temperature, maxTokens, interruptSens,
responseDelay, organizationId, retellAgentId, config,
createdAt, updatedAt
```

### Call
```sql
id, agentId, organizationId, retellCallId, direction,
fromNumber, toNumber, status, startedAt, endedAt, duration,
transcript, recordingUrl, disconnectReason, metadata,
qualityScore, sentimentScore, latencyMs, interruptionsCount, cost
```

---

## 🛠️ COMANDOS ÚTEIS

### Desenvolvimento
```bash
npm run start:dev     # Modo watch (hot reload)
npm run start:debug   # Com debugger
npm run start:prod    # Produção (após build)
```

### Database
```bash
npx prisma studio     # UI visual
npx prisma generate   # Regenerar client
npx prisma migrate dev --name nome  # Nova migration
npx tsx prisma/seed.ts  # Repopular dados
```

### Limpeza
```bash
# Resetar banco completamente
rm dev.db
npx prisma migrate dev --name init
npx tsx prisma/seed.ts

# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

---

## 🐛 TROUBLESHOOTING

### Erro: "Porta 3000 em uso"

```bash
# Descobrir qual processo está usando
lsof -ti:3000

# Matar processo
lsof -ti:3000 | xargs kill -9

# OU mudar porta no .env
PORT=3001
```

### Erro: "Prisma Client não encontrado"

```bash
npx prisma generate
```

### Erro: "Cannot find module '@nestjs/core'"

```bash
npm install
```

### Erro de compilação TypeScript

```bash
# Limpar build
rm -rf dist
npm run build
```

### Banco corrompido

```bash
rm dev.db
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
```

---

## ✅ CHECKLIST DE SUCESSO

Marque quando concluir:

- [ ] Node.js 18+ instalado
- [ ] Código copiado para máquina local
- [ ] `npm install` executado
- [ ] `npx prisma generate` executado
- [ ] `npx prisma migrate dev` executado
- [ ] `npx tsx prisma/seed.ts` executado
- [ ] `npm run start:dev` executado
- [ ] Aplicação iniciou sem erros
- [ ] `curl http://localhost:3000/health` retornou OK
- [ ] `curl http://localhost:3000/agents` retornou 2 agentes
- [ ] Swagger UI abriu no navegador
- [ ] Consegui criar um agente via POST
- [ ] Consegui ver analytics de chamadas

**Se todos marcados: 🎉 TESTE LOCAL CONCLUÍDO COM SUCESSO!**

---

## 📞 TESTE COMPLETO - FLUXO E2E

### 1. Criar Agente
```bash
curl -X POST http://localhost:3000/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bot E2E Test",
    "type": "inbound",
    "systemPrompt": "Assistente de teste",
    "voiceId": "en-US-JennyNeural"
  }' | jq '.id'
```

Copie o ID retornado.

### 2. Buscar Agente
```bash
curl http://localhost:3000/agents/[ID]
```

### 3. Atualizar Agente
```bash
curl -X PATCH http://localhost:3000/agents/[ID] \
  -H "Content-Type: application/json" \
  -d '{"name": "Bot Atualizado"}'
```

### 4. Listar Novamente
```bash
curl http://localhost:3000/agents
```

Deve aparecer com nome atualizado.

### 5. Arquivar Agente
```bash
curl -X DELETE http://localhost:3000/agents/[ID]
```

### 6. Verificar Status
```bash
curl http://localhost:3000/agents/[ID]
```

Status deve ser "archived".

**✅ CRUD Completo testado!**

---

## 🎓 PRÓXIMOS APRENDIZADOS

Depois de testar local, explore:

1. **Adicionar autenticação JWT** (módulo auth/ está pronto)
2. **Integrar Retell.ai API** (criar agentes remotamente)
3. **Configurar webhooks Twilio** (receber eventos de chamadas)
4. **Adicionar WebSocket** (updates em tempo real)
5. **Criar frontend React** (consumir esta API)
6. **Deploy em produção** (AWS, GCP ou Vercel)

---

## 📚 DOCUMENTAÇÃO ADICIONAL

- **COMO-TESTAR.md** - Guia detalhado de testes
- **README-TESTE-IMEDIATO.md** - Referência rápida
- **QUICKSTART.md** - Quickstart original
- **DEPLOYMENT.md** - Deploy em produção
- **TESTING.md** - Suite de testes automatizados

---

**🚀 BOM TESTE! Qualquer problema, consulte o Troubleshooting acima.**
