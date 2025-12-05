# 📖 LEIA-ME PRIMEIRO - RETELL MVP

## 🎯 OBJETIVO

Este projeto é uma **plataforma completa de agentes de voz com IA** (estilo Retell.ai / Vapi.ai).

**Status atual:** Backend 100% funcional, pronto para teste local.

---

## ⚡ INÍCIO RÁPIDO (3 MINUTOS)

Na sua máquina, dentro desta pasta:

```bash
# 1. Instalação automática completa
chmod +x INSTALL-LOCAL.sh
./INSTALL-LOCAL.sh

# 2. Iniciar aplicação
npm run start:dev

# 3. Testar (em outro terminal)
chmod +x test-api.sh
./test-api.sh
```

**Pronto!** Se todos os testes passarem, sua API está funcionando perfeitamente.

---

## 📁 ARQUIVOS IMPORTANTES

### 🚀 Para Setup e Teste
- **`INSTALL-LOCAL.sh`** ⭐ - Script de instalação automática
- **`SETUP-LOCAL-COMPLETO.md`** ⭐ - Guia passo-a-passo detalhado
- **`test-api.sh`** - Testa todos os endpoints automaticamente

### 📚 Documentação
- **`LEIA-ME-PRIMEIRO.md`** ⭐ - Este arquivo (começar aqui)
- **`COMO-TESTAR.md`** - Guia completo de testes
- **`README-TESTE-IMEDIATO.md`** - Referência rápida
- **`QUICKSTART.md`** - Quickstart original
- **`DEPLOYMENT.md`** - Deploy em produção
- **`TESTING.md`** - Suite de testes automatizados

### 🔧 Configuração
- **`package.json`** - Dependências e scripts
- **`tsconfig.json`** - Config TypeScript
- **`nest-cli.json`** - Config NestJS
- **`.env`** - Variáveis de ambiente (SQLite configurado)

### 💾 Database
- **`prisma/schema.prisma`** - Schema do banco
- **`prisma/seed.ts`** - Dados de exemplo
- **`prisma/migrations/`** - Histórico de alterações

### 💻 Código Fonte
- **`src/main.ts`** - Bootstrap + Swagger
- **`src/app.module.ts`** - Módulo principal
- **`src/agents/`** - CRUD de Agentes
- **`src/calls/`** - CRUD de Chamadas + Analytics
- **`src/prisma/`** - Prisma Client wrapper
- **`src/health.controller.ts`** - Health check

---

## 🎯 O QUE ESTE PROJETO FAZ

### Backend Implementado ✅

1. **Gerenciamento de Agentes de IA**
   - Criar, listar, atualizar, arquivar agentes
   - Configurar voz, LLM, temperatura, comportamento
   - Multi-tenant (por organização)

2. **Gerenciamento de Chamadas**
   - Listar chamadas com detalhes
   - Transcrição e recording
   - Analytics: duração, custo, qualidade, sentiment

3. **API REST Completa**
   - Swagger UI integrado
   - Validação de dados
   - Error handling
   - Health check

4. **Database Prisma**
   - Schema completo (Organization, User, Agent, Call)
   - Migrations automáticas
   - SQLite (dev) / PostgreSQL (prod)

### Pendente (Próximas Fases) ⏳

- Integração Retell.ai (criar agentes remotamente)
- Webhooks Twilio (eventos de chamadas)
- Autenticação JWT
- WebSocket (tempo real)
- Frontend React/Next.js
- Deploy AWS/GCP

---

## 🧪 TESTES DISPONÍVEIS

### Teste Manual (Swagger UI)

```bash
# Iniciar app
npm run start:dev

# Abrir no navegador
http://localhost:3000/api
```

**Use a interface visual** para testar todos os endpoints.

### Teste Automatizado (CLI)

```bash
# Rodar bateria completa de testes
./test-api.sh
```

**Testa automaticamente:**
- ✅ Health check
- ✅ Listar agentes
- ✅ Criar agente
- ✅ Buscar agente
- ✅ Atualizar agente
- ✅ Listar chamadas
- ✅ Analytics
- ✅ Arquivar agente

### Teste Manual (curl)

```bash
# Health
curl http://localhost:3000/health

# Agentes
curl http://localhost:3000/agents

# Analytics
curl http://localhost:3000/calls/analytics
```

---

## 📊 ENDPOINTS DA API

### Health
```
GET /health - Status da aplicação e banco
```

### Agents
```
GET    /agents        - Listar todos
GET    /agents/:id    - Buscar por ID
POST   /agents        - Criar novo
PATCH  /agents/:id    - Atualizar
DELETE /agents/:id    - Arquivar
```

### Calls
```
GET /calls           - Listar todas
GET /calls/:id       - Buscar por ID
GET /calls/analytics - Métricas agregadas
```

---

## 🗃️ DADOS DE EXEMPLO (SEED)

Já criados automaticamente:

### Organization
- **ID:** demo-org-id
- **Nome:** Demo Organization

### Agents (2)
1. **Assistente de Vendas** (GPT-4, voz feminina)
2. **Suporte Técnico** (GPT-3.5, voz masculina)

### Calls (2)
- Call 1: 185s, qualidade 4.5/5
- Call 2: 420s, qualidade 4.8/5

---

## 🔑 CONFIGURAÇÃO DE CREDENCIAIS

Para usar integrações reais, edite `.env`:

```bash
# Retell.ai
RETELL_API_KEY=key_sua_chave_aqui

# Twilio
TWILIO_ACCOUNT_SID=ACsua_sid_aqui
TWILIO_AUTH_TOKEN=seu_token_aqui
TWILIO_PHONE_NUMBER=+5511999999999

# OpenAI
OPENAI_API_KEY=sk-sua_chave_aqui
```

**Sem credenciais?** Tudo funciona localmente, só não conecta com serviços externos.

---

## 🛠️ COMANDOS PRINCIPAIS

### Iniciar
```bash
npm run start:dev      # Modo desenvolvimento (hot reload)
npm run start:prod     # Modo produção
npm run start:debug    # Com debugger
```

### Database
```bash
npx prisma studio      # UI visual do banco
npx prisma generate    # Regenerar Prisma Client
npx tsx prisma/seed.ts # Repopular dados
```

### Testes
```bash
npm test               # Testes unitários
npm run test:e2e       # Testes end-to-end
npm run test:cov       # Coverage
./test-api.sh          # Teste completo da API
```

### Build
```bash
npm run build          # Compilar TypeScript
npm run lint           # Linter
npm run format         # Formatter
```

---

## 🚨 TROUBLESHOOTING RÁPIDO

### "Porta 3000 em uso"
```bash
lsof -ti:3000 | xargs kill -9
```

### "Prisma Client not found"
```bash
npx prisma generate
```

### "Module not found"
```bash
npm install
```

### Resetar banco
```bash
rm dev.db
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
```

---

## 📈 PRÓXIMOS PASSOS

### 1. Testar Local ✅
```bash
./INSTALL-LOCAL.sh
npm run start:dev
./test-api.sh
```

### 2. Explorar Swagger UI
```
http://localhost:3000/api
```

### 3. Ver Banco de Dados
```bash
npx prisma studio
```

### 4. Integrar Retell.ai
- Configurar API key
- Criar agente via API
- Receber webhooks

### 5. Desenvolver Frontend
- React/Next.js
- Consumir esta API
- Dashboard de analytics

### 6. Deploy Produção
- AWS/GCP/Vercel
- PostgreSQL
- Variáveis de ambiente

---

## 📚 RECURSOS ADICIONAIS

### Documentação Oficial
- NestJS: https://docs.nestjs.com/
- Prisma: https://www.prisma.io/docs/
- Retell.ai: https://docs.retellai.com/
- Twilio: https://www.twilio.com/docs/

### Stack Tecnológico
- **Backend:** NestJS + TypeScript
- **Database:** Prisma ORM + SQLite/PostgreSQL
- **API Docs:** Swagger/OpenAPI
- **Validation:** class-validator
- **Testing:** Jest + Supertest

---

## ✅ CHECKLIST DE SUCESSO

Marque conforme avançar:

- [ ] Node.js 18+ instalado
- [ ] Código baixado/copiado
- [ ] `./INSTALL-LOCAL.sh` executado
- [ ] `npm run start:dev` rodando
- [ ] Aplicação iniciou sem erros
- [ ] `./test-api.sh` passou todos os testes
- [ ] Swagger UI funcionando
- [ ] Criou um agente via POST
- [ ] Viu analytics no Prisma Studio
- [ ] Entendeu a estrutura do código

**10/10 marcados?** 🎉 **PARABÉNS! Você dominou o setup local!**

---

## 🎯 RESUMO EXECUTIVO

### O que foi entregue
✅ **Backend NestJS completo** (11 arquivos TypeScript)  
✅ **Database Prisma** com schema e seed  
✅ **API REST** com Swagger docs  
✅ **CRUD Agents** totalmente funcional  
✅ **CRUD Calls** com analytics  
✅ **Scripts de setup** automatizados  
✅ **Documentação completa** (7 arquivos .md)  

### Como usar
1. Execute `./INSTALL-LOCAL.sh`
2. Rode `npm run start:dev`
3. Teste com `./test-api.sh`
4. Explore `http://localhost:3000/api`

### Próximo nível
- Integrar Retell.ai
- Adicionar auth JWT
- Criar frontend
- Deploy produção

---

## 🎉 PRONTO PARA COMEÇAR!

**Comece agora:**

```bash
./INSTALL-LOCAL.sh
```

**Precisa de ajuda?** Consulte:
- `SETUP-LOCAL-COMPLETO.md` - Guia detalhado
- `COMO-TESTAR.md` - Testes específicos
- Troubleshooting acima

**Boa sorte!** 🚀
