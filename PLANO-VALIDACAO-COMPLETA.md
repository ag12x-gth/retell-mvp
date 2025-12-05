# 🧪 PLANO DE VALIDAÇÃO COMPLETA

## 🎯 Objetivo
Validar **100% das funcionalidades** antes do deploy em produção.

---

## 📋 FASES DE VALIDAÇÃO

### ✅ FASE 1: INFRAESTRUTURA (15 min)

#### 1.1 Servidor Local
```bash
# Iniciar servidor
npm run start:dev

# Verificar health
curl http://localhost:3000/health

# Verificar Swagger
open http://localhost:3000/api
```

**Checklist:**
- [ ] Servidor inicia sem erros
- [ ] Health check retorna `{"status":"ok"}`
- [ ] Swagger UI carrega corretamente
- [ ] Todas as rotas aparecem no Swagger

#### 1.2 Banco de Dados
```bash
# Verificar conexão
npx prisma studio

# Listar dados
curl http://localhost:3000/agents
curl http://localhost:3000/calls
```

**Checklist:**
- [ ] Prisma Studio abre
- [ ] Tabelas criadas (Agent, Call, User, Organization)
- [ ] Dados de seed existem (2 agentes, 2 calls)
- [ ] Queries funcionam

---

### ✅ FASE 2: CREDENCIAIS (10 min)

#### 2.1 Verificar `.env`
```bash
cat .env | grep -E "TWILIO|RETELL|OPENAI"
```

**Checklist:**
- [ ] `TWILIO_ACCOUNT_SID` preenchido
- [ ] `TWILIO_AUTH_TOKEN` preenchido
- [ ] `TWILIO_PHONE_NUMBER` = `+553322980007`
- [ ] `RETELL_API_KEY` = `key_f2cfbba3bc96aec83296fc7d`
- [ ] `OPENAI_API_KEY` preenchido

#### 2.2 Testar Conexões
```bash
# Testar Retell.ai
curl -X POST http://localhost:3000/config/test-retell

# Testar Twilio
curl -X POST http://localhost:3000/config/test-twilio

# Testar OpenAI
curl -X POST http://localhost:3000/config/test-openai

# Ver status geral
curl http://localhost:3000/config/status
```

**Checklist:**
- [ ] Retell.ai: `{"success":true}`
- [ ] Twilio: `{"success":true}`
- [ ] OpenAI: `{"success":true}`
- [ ] Status: Todos `"connected"`

---

### ✅ FASE 3: CRUD AGENTS (15 min)

#### 3.1 Criar Agente Local
```bash
curl -X POST http://localhost:3000/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Agente Teste Local",
    "description": "Teste de criação",
    "organizationId": 1
  }'
```

**Checklist:**
- [ ] Retorna status 201
- [ ] `id` gerado
- [ ] `createdAt` presente

#### 3.2 Listar Agentes
```bash
curl http://localhost:3000/agents
```

**Checklist:**
- [ ] Retorna array
- [ ] Pelo menos 3 agentes (2 seed + 1 criado)

#### 3.3 Buscar Agente
```bash
curl http://localhost:3000/agents/1
```

**Checklist:**
- [ ] Retorna agente específico
- [ ] Dados completos

#### 3.4 Atualizar Agente
```bash
curl -X PATCH http://localhost:3000/agents/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Agente Atualizado"}'
```

**Checklist:**
- [ ] Retorna agente atualizado
- [ ] `name` foi modificado

#### 3.5 Deletar Agente
```bash
curl -X DELETE http://localhost:3000/agents/3
```

**Checklist:**
- [ ] Retorna status 200
- [ ] Agente removido do banco

---

### ✅ FASE 4: INTEGRAÇÃO RETELL.AI (20 min)

#### 4.1 Listar Agentes Remotos
```bash
curl http://localhost:3000/integrations/retell/agents
```

**Checklist:**
- [ ] Retorna lista de agentes
- [ ] Conexão com API Retell.ai OK

#### 4.2 Criar Agente Remoto
```bash
curl -X POST http://localhost:3000/integrations/retell/agents \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "Teste API",
    "voice_id": "11labs-Adrian",
    "language": "pt-BR",
    "llm_websocket_url": "wss://api.openai.com/v1/realtime",
    "general_prompt": "Você é um assistente de teste.",
    "begin_message": "Olá!"
  }'
```

**Checklist:**
- [ ] Retorna `agent_id`
- [ ] Status 201
- [ ] Agente aparece no dashboard Retell.ai

#### 4.3 Buscar Agente Remoto
```bash
curl http://localhost:3000/integrations/retell/agents/AGENT_ID
```

**Checklist:**
- [ ] Retorna detalhes do agente
- [ ] Configuração correta

#### 4.4 Deletar Agente Remoto
```bash
curl -X DELETE http://localhost:3000/integrations/retell/agents/AGENT_ID
```

**Checklist:**
- [ ] Status 200
- [ ] Agente removido do Retell.ai

---

### ✅ FASE 5: CHAMADAS (30 min)

#### 5.1 Criar Agente de Vendas
**Via Dashboard Retell.ai** (https://dashboard.retellai.com/agents/create)

**Configuração:**
- Nome: `Ana - Vendas MVP`
- Voice: `11labs-Adrian`
- Language: `pt-BR`
- Prompt: (usar do guia anterior)

**Copiar `agent_id` gerado**

#### 5.2 Iniciar Chamada Real
```bash
curl -X POST http://localhost:3000/integrations/retell/calls \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "AGENT_ID_AQUI",
    "to_number": "+5564999526870",
    "from_number": "+553322980007"
  }'
```

**Checklist:**
- [ ] Retorna `call_id`
- [ ] Status `initiated`
- [ ] Telefone toca em 10-15 segundos

#### 5.3 Atender e Conversar
**No telefone `+55 64 99952-6870`:**
- [ ] Atender chamada
- [ ] Ouvir saudação da Ana
- [ ] Conversar por 2-3 minutos
- [ ] Encerrar chamada

#### 5.4 Verificar Chamada no DB
```bash
curl http://localhost:3000/calls
```

**Checklist:**
- [ ] Chamada aparece na lista
- [ ] Status `completed`
- [ ] Duração registrada

#### 5.5 Analytics
```bash
curl http://localhost:3000/calls/analytics
```

**Checklist:**
- [ ] `totalCalls` incrementado
- [ ] `avgDuration` calculado
- [ ] Estatísticas corretas

---

### ✅ FASE 6: WEBHOOKS (25 min)

#### 6.1 Expor Aplicação (ngrok)
```bash
ngrok http 3000
```

**Copiar URL:** `https://abc123.ngrok.io`

**Checklist:**
- [ ] ngrok rodando
- [ ] URL acessível
- [ ] `curl https://abc123.ngrok.io/health` funciona

#### 6.2 Configurar Webhook Retell.ai
**Dashboard:** https://dashboard.retellai.com/settings/webhooks

**URL:** `https://abc123.ngrok.io/webhooks/retell/call-events`

**Checklist:**
- [ ] URL salva
- [ ] Timeout: 10s
- [ ] Webhook ativo

#### 6.3 Configurar Webhooks Twilio
**Console:** https://console.twilio.com/phone-numbers/incoming

**Número:** `+55 33 2298-0007`

**A CALL COMES IN:**
```
https://abc123.ngrok.io/webhooks/twilio/incoming-call
```

**CALL STATUS CHANGES:**
```
https://abc123.ngrok.io/webhooks/twilio/call-status
```

**Checklist:**
- [ ] URLs salvas
- [ ] Webhooks HTTP POST
- [ ] Configuração ativa

#### 6.4 Testar Webhook Manualmente
```bash
curl -X POST http://localhost:3000/webhooks/retell/call-events \
  -H "Content-Type: application/json" \
  -d '{
    "event": "call_started",
    "call": {
      "call_id": "test_123",
      "agent_id": "agent_test",
      "from_number": "+5533999887766",
      "to_number": "+553322980007",
      "start_timestamp": 1733000000
    }
  }'
```

**Checklist:**
- [ ] Retorna `{"success":true}`
- [ ] Evento processado
- [ ] Logs mostram evento

#### 6.5 Fazer Chamada Real (com Webhooks)
**Repetir Fase 5.2**, mas agora com webhooks configurados.

**Verificar logs:**
```bash
tail -f app.log | grep -E "webhook|event"
```

**Checklist:**
- [ ] Evento `call_started` recebido
- [ ] Evento `call_ended` recebido
- [ ] Evento `call_analyzed` recebido
- [ ] Dados salvos no DB

---

### ✅ FASE 7: CONFIGURAÇÃO DINÂMICA (10 min)

#### 7.1 Ver Configurações
```bash
curl http://localhost:3000/config
```

**Checklist:**
- [ ] Retorna todas as configs
- [ ] Credenciais mascaradas (*)

#### 7.2 Atualizar Retell
```bash
curl -X PATCH http://localhost:3000/config/retell \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "key_f2cfbba3bc96aec83296fc7d",
    "workspaceId": "org_JY55cp5S9pRJjrV"
  }'
```

**Checklist:**
- [ ] Retorna sucesso
- [ ] `.env` atualizado

#### 7.3 Testar Nova Config
```bash
curl -X POST http://localhost:3000/config/test-retell
```

**Checklist:**
- [ ] Ainda conecta
- [ ] Sem erros

---

### ✅ FASE 8: SEGURANÇA (15 min)

#### 8.1 Autenticação JWT (se implementado)
```bash
# Fazer login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@teste.com",
    "password": "senha123"
  }'

# Usar token
TOKEN="cole_token_aqui"
curl http://localhost:3000/agents \
  -H "Authorization: Bearer $TOKEN"
```

**Checklist:**
- [ ] Login retorna token
- [ ] Token válido funciona
- [ ] Sem token retorna 401

#### 8.2 Validação de Dados
```bash
# Tentar criar agente sem nome
curl -X POST http://localhost:3000/agents \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Checklist:**
- [ ] Retorna erro 400
- [ ] Mensagem de validação clara

#### 8.3 Rate Limiting (se implementado)
```bash
# Fazer múltiplas requisições rápidas
for i in {1..100}; do
  curl -s http://localhost:3000/health > /dev/null
done
```

**Checklist:**
- [ ] Sem erros até limite
- [ ] Após limite retorna 429

---

### ✅ FASE 9: PERFORMANCE (10 min)

#### 9.1 Tempo de Resposta
```bash
time curl http://localhost:3000/agents
```

**Checklist:**
- [ ] < 200ms para queries simples
- [ ] < 500ms para queries complexas

#### 9.2 Carga Concorrente
```bash
# 10 requisições simultâneas
seq 10 | xargs -P10 -I{} curl -s http://localhost:3000/agents > /dev/null
```

**Checklist:**
- [ ] Todas completam sem erro
- [ ] Sem degradação significativa

---

### ✅ FASE 10: DOCUMENTAÇÃO (5 min)

#### 10.1 Swagger Completo
**Acessar:** http://localhost:3000/api

**Checklist:**
- [ ] Todas as rotas documentadas
- [ ] Schemas corretos
- [ ] Exemplos presentes
- [ ] Responses documentadas

#### 10.2 Arquivos MD
**Verificar:**
- [ ] README.md completo
- [ ] PRONTO-PARA-TESTAR.md
- [ ] CREDENCIAIS-COMPLETAS.md
- [ ] CONFIGURAR-WEBHOOKS.md
- [ ] GUIA-INTEGRAÇÕES.md

---

## 📊 RESUMO DE VALIDAÇÃO

### Critérios de Aprovação

Para considerar o sistema **100% validado**, TODOS os itens devem passar:

#### Backend (40 pontos)
- [ ] Servidor inicia sem erros (5 pts)
- [ ] Health check funciona (5 pts)
- [ ] Banco de dados conecta (5 pts)
- [ ] CRUD completo funciona (10 pts)
- [ ] APIs REST respondem (10 pts)
- [ ] Swagger UI funcional (5 pts)

#### Integrações (30 pontos)
- [ ] Retell.ai conecta (10 pts)
- [ ] Twilio conecta (10 pts)
- [ ] OpenAI conecta (5 pts)
- [ ] Webhooks funcionam (5 pts)

#### Funcionalidades (30 pontos)
- [ ] Criar agente remoto (10 pts)
- [ ] Fazer chamada real (15 pts)
- [ ] Receber webhooks (5 pts)

**Pontuação mínima:** 90/100 (90%)  
**Ideal:** 100/100 (100%)

---

## ✅ CHECKLIST FINAL PRÉ-DEPLOY

Antes de fazer deploy em produção:

### Código
- [ ] Sem erros no console
- [ ] Sem warnings críticos
- [ ] Logs adequados
- [ ] Variáveis de ambiente seguras

### Testes
- [ ] Todos os testes unitários passam
- [ ] Testes de integração passam
- [ ] Chamada real bem-sucedida
- [ ] Webhooks validados

### Segurança
- [ ] Credenciais não commitadas
- [ ] `.env` no `.gitignore`
- [ ] Validação de inputs
- [ ] HTTPS em produção

### Performance
- [ ] Queries otimizadas
- [ ] Sem memory leaks
- [ ] Response time < 500ms
- [ ] Pronto para escalar

### Documentação
- [ ] README completo
- [ ] Swagger atualizado
- [ ] Guias de uso prontos
- [ ] Troubleshooting documentado

---

## 🚀 APÓS VALIDAÇÃO

Quando **100% validado**:

1. **✅ Commitar código**
   ```bash
   git add .
   git commit -m "Sistema validado e pronto para produção"
   git push origin main
   ```

2. **✅ Desenvolver Frontend React**
   - Dashboard
   - Gerenciamento de agentes
   - Visualização de chamadas

3. **✅ Deploy Produção**
   - Backend: Railway/AWS/GCP
   - Frontend: Vercel/Netlify
   - Configurar domínio + SSL

---

**⏱️ Tempo total estimado:** 2-3 horas  
**Complexidade:** Média  
**Pré-requisitos:** Sistema rodando localmente

**🎯 Objetivo:** Garantir sistema 100% funcional antes do deploy
