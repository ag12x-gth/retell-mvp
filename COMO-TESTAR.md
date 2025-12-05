# 🧪 COMO TESTAR O RETELL MVP

## ✅ STATUS ATUAL

✔️ **Código fonte completo** criado  
✔️ **Banco de dados SQLite** configurado  
✔️ **Dados de exemplo** populados  
✔️ **Aplicação iniciada** em modo desenvolvimento  

---

## 🚀 OPÇÃO 1: TESTAR NO SANDBOX (AGUARDAR COMPILAÇÃO)

A aplicação está compilando agora. **Aguarde ~2-3 minutos** e então:

### 1. Verificar Health

```bash
curl http://localhost:3000/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-05T04:10:00.000Z",
  "uptime": 145.23,
  "database": "connected",
  "environment": "development"
}
```

### 2. Listar Agentes

```bash
curl http://localhost:3000/agents
```

**Retorna 2 agentes de exemplo:**
- Assistente de Vendas
- Suporte Técnico

### 3. Criar Novo Agente

```bash
curl -X POST http://localhost:3000/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Meu Primeiro Agente",
    "type": "inbound",
    "systemPrompt": "Você é um assistente prestativo",
    "voiceId": "en-US-JennyNeural",
    "firstMessage": "Olá! Como posso ajudar?"
  }'
```

### 4. Ver Chamadas

```bash
curl http://localhost:3000/calls
```

### 5. Analytics de Chamadas

```bash
curl http://localhost:3000/calls/analytics
```

### 6. Swagger UI

Abra no navegador:
```
http://localhost:3000/api
```

---

## 💻 OPÇÃO 2: TESTAR NA SUA MÁQUINA LOCAL

### Requisitos

- Node.js 18+
- npm 9+

### Setup Completo (5 minutos)

```bash
# 1. Baixar projeto
git clone [seu-repositório] retell-mvp
cd retell-mvp

# 2. Instalar dependências
npm install

# 3. Configurar banco
npx prisma generate
npx prisma migrate dev --name init

# 4. Popular dados
npx tsx prisma/seed.ts

# 5. Iniciar aplicação
npm run start:dev
```

Aguarde aparecer:

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 RETELL AI MVP - API RODANDO!                        ║
║                                                           ║
║   🌐 API:     http://localhost:3000                      ║
║   📖 Swagger: http://localhost:3000/api                  ║
║   💚 Health:  http://localhost:3000/health               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 📍 ENDPOINTS DISPONÍVEIS

### Health Check
```bash
GET /health
```

### Agents
```bash
GET    /agents          # Listar todos
GET    /agents/:id      # Buscar por ID
POST   /agents          # Criar novo
PATCH  /agents/:id      # Atualizar
DELETE /agents/:id      # Arquivar
```

### Calls
```bash
GET /calls              # Listar todas
GET /calls/:id          # Buscar por ID
GET /calls/analytics    # Métricas agregadas
```

---

## 🗃️ DADOS DE EXEMPLO JÁ CRIADOS

### Organization
- ID: `demo-org-id`
- Nome: Demo Organization
- Subdomain: demo

### Agents

**1. Assistente de Vendas**
- Tipo: inbound
- Voice: en-US-JennyNeural
- LLM: gpt-4

**2. Suporte Técnico**
- Tipo: inbound
- Voice: en-US-GuyNeural
- LLM: gpt-3.5-turbo

### Calls
- 2 chamadas de exemplo com transcrição e analytics

---

## 🔑 PRÓXIMOS PASSOS PARA INTEGRAÇÃO REAL

### 1. Configurar Credenciais (.env)

```bash
# Retell.ai
RETELL_API_KEY=key_xxxxxxxxxxxxx

# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
```

### 2. Criar Agente na Retell.ai

```bash
curl -X POST http://localhost:3000/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vendas Bot",
    "type": "inbound",
    "systemPrompt": "Você é um vendedor experiente...",
    "voiceId": "11labs-Adrian",
    "llmProvider": "openai",
    "llmModel": "gpt-4"
  }'
```

O sistema irá:
1. Criar agente localmente
2. Registrar na Retell.ai via API
3. Retornar `retellAgentId` para uso

### 3. Configurar Webhook Twilio

No painel Twilio, configure:

**URL:** `https://seu-dominio.com/webhooks/twilio/call-status`

**Events:**
- Call Initiated
- Call Answered
- Call Ended

### 4. Fazer Chamada Teste

1. Ligue para seu número Twilio
2. Agente de IA atenderá automaticamente
3. Transcrição e analytics são salvos em tempo real

---

## 🧪 TESTES AUTOMATIZADOS

```bash
# Testes unitários
npm test

# Testes E2E
npm run test:e2e

# Coverage
npm run test:cov
```

---

## 📊 MONITORAMENTO

### Ver Logs em Tempo Real

```bash
tail -f /home/user/retell-mvp/app.log
```

### Inspecionar Banco SQLite

```bash
npx prisma studio
```

Abre interface visual em `http://localhost:5555`

---

## 🐛 TROUBLESHOOTING

### Porta 3000 já em uso

```bash
# Matar processo
pkill -f 'nest start'

# Ou mudar porta no .env
PORT=3001
```

### Prisma Client não gerado

```bash
npx prisma generate
```

### Banco zerado

```bash
rm dev.db
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
```

---

## 📦 ESTRUTURA DO PROJETO

```
retell-mvp/
├── prisma/
│   ├── schema.prisma      # Modelo do banco
│   ├── seed.ts            # Dados de exemplo
│   └── migrations/        # Histórico de alterações
├── src/
│   ├── main.ts           # Bootstrap da aplicação
│   ├── app.module.ts     # Módulo principal
│   ├── health.controller.ts
│   ├── agents/           # Módulo de Agentes
│   │   ├── agents.module.ts
│   │   ├── agents.controller.ts
│   │   ├── agents.service.ts
│   │   └── dto/
│   ├── calls/            # Módulo de Chamadas
│   │   ├── calls.module.ts
│   │   ├── calls.controller.ts
│   │   └── calls.service.ts
│   └── prisma/           # Serviço Prisma
│       ├── prisma.module.ts
│       └── prisma.service.ts
├── .env                  # Variáveis de ambiente
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## ✨ FEATURES IMPLEMENTADAS

✅ **Backend NestJS** completo  
✅ **Prisma ORM** com SQLite  
✅ **Swagger UI** (/api)  
✅ **CRUD Agentes** completo  
✅ **CRUD Calls** com analytics  
✅ **Health Check** endpoint  
✅ **Validação de DTOs**  
✅ **Multi-tenant** (via organizationId)  
✅ **Dados de exemplo** (seed)  

---

## 🎯 FEATURES PENDENTES (Próximas Fases)

- [ ] Autenticação JWT
- [ ] Integração Retell.ai (registro de agentes)
- [ ] Webhooks Twilio (call events)
- [ ] WebSocket (chamadas em tempo real)
- [ ] Frontend React/Next.js
- [ ] Testes E2E
- [ ] Deploy (AWS/GCP/Vercel)

---

## 💡 DICAS

1. **Use Swagger UI** para explorar a API visualmente
2. **Monitore logs** com `tail -f app.log` durante chamadas
3. **Use Prisma Studio** para inspecionar dados
4. **Teste primeiro com Postman** antes de integrar frontend
5. **Configure webhooks locais** com ngrok para desenvolvimento

---

## 📞 TESTE RÁPIDO - CRIAR E LISTAR AGENTE

```bash
# Criar
curl -X POST http://localhost:3000/agents \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","type":"inbound","systemPrompt":"Olá","voiceId":"voice-1"}'

# Listar
curl http://localhost:3000/agents

# Buscar específico (use ID retornado acima)
curl http://localhost:3000/agents/[ID]
```

---

**🎉 PRONTO PARA TESTAR!**

Aguarde a compilação terminar no sandbox OU rode na sua máquina local seguindo os passos acima.
