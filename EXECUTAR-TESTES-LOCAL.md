# 🧪 GUIA DE TESTES COMPLETO - EXECUTAR LOCALMENTE

> **IMPORTANTE**: Execute estes testes na **sua máquina local** para validação completa antes do deploy.

---

## ⚡ INÍCIO RÁPIDO

```bash
# 1. Copiar projeto
cp -r /home/user/retell-mvp ~/retell-mvp-local
cd ~/retell-mvp-local

# 2. Instalar
npm install
npx prisma generate
npx prisma migrate dev --name init

# 3. Iniciar servidor
npm run start:dev

# 4. Em outro terminal, executar testes
./TESTE-COMPLETO.sh
```

---

## 📞 TESTE DE LIGAÇÃO REAL

### **Passo 1: Criar Agente de Vendas**

```bash
./criar-agente-vendas.sh
```

**Resultado esperado:**
```json
{
  "success": true,
  "agent_id": "agent_abc123xyz",
  "name": "Assistente Vendas BR",
  "voice_id": "11labs-Adrian",
  "language": "pt-BR"
}
```

**Copie o `agent_id` retornado!**

---

### **Passo 2: Fazer Ligação de Teste**

```bash
./fazer-ligacao.sh agent_abc123xyz
```

Ou se o agent_id foi salvo automaticamente:

```bash
./fazer-ligacao.sh
```

**Ligação será feita para:** `+55 64 99952-6870`

**Resultado esperado:**
```json
{
  "success": true,
  "call_id": "call_def456uvw",
  "status": "initiated",
  "from": "+553322980007",
  "to": "+5564999526870"
}
```

---

### **Passo 3: Monitorar Chamada em Tempo Real**

**Dashboard Retell.ai:**
https://dashboard.retellai.com/calls

**API Local:**
```bash
# Substituir CALL_ID pelo retornado
curl http://localhost:3000/calls/CALL_ID
```

**Logs do servidor:**
```bash
tail -f app.log
```

---

## ✅ CHECKLIST DE VALIDAÇÃO COMPLETA

### **1. Servidor** ✅
- [ ] Servidor inicia sem erros
- [ ] Health check responde
- [ ] Swagger UI acessível em http://localhost:3000/api
- [ ] Logs sem erros críticos

### **2. Credenciais** ✅
- [ ] Retell.ai conectado (`POST /config/test-retell`)
- [ ] Twilio conectado (`POST /config/test-twilio`)
- [ ] OpenAI conectado (`POST /config/test-openai`)
- [ ] Status geral OK (`GET /config/status`)

### **3. Banco de Dados** ✅
- [ ] Prisma Client gerado
- [ ] Migrações aplicadas
- [ ] Seed executado (2 agentes, 2 calls)
- [ ] Queries funcionando

### **4. API Endpoints** ✅
- [ ] `GET /agents` - Lista agentes locais
- [ ] `POST /agents` - Cria agente local
- [ ] `GET /calls` - Lista chamadas
- [ ] `GET /calls/analytics` - Mostra estatísticas
- [ ] `GET /integrations/retell/agents` - Lista agentes remotos
- [ ] `POST /integrations/retell/agents` - Cria agente remoto

### **5. Integração Retell.ai** ✅
- [ ] Criar agente via API
- [ ] Listar agentes existentes
- [ ] Buscar agente por ID
- [ ] Deletar agente
- [ ] Iniciar chamada

### **6. Teste de Chamada Real** ✅
- [ ] Agente de vendas criado
- [ ] Chamada iniciada com sucesso
- [ ] Telefone tocou
- [ ] Agente respondeu corretamente
- [ ] Conversa fluiu naturalmente
- [ ] Chamada finalizada corretamente

### **7. Webhooks** ⏳
- [ ] ngrok rodando
- [ ] Webhook Retell.ai configurado
- [ ] Webhook Twilio configurado
- [ ] Evento `call_started` recebido
- [ ] Evento `call_ended` recebido
- [ ] Evento `call_analyzed` recebido

### **8. Pós-Chamada** ✅
- [ ] Transcrição disponível
- [ ] Análise de sentimento gerada
- [ ] Dados de qualificação salvos
- [ ] Gravação de áudio disponível
- [ ] Métricas atualizadas

---

## 🔗 CONFIGURAR WEBHOOKS (10 MINUTOS)

### **1. Instalar ngrok**

```bash
# macOS
brew install ngrok

# ou baixar em: https://ngrok.com/download
```

### **2. Expor aplicação**

```bash
ngrok http 3000

# Copiar URL gerada:
# https://abc123.ngrok.io
```

### **3. Configurar Twilio**

**Acessar:** https://console.twilio.com/phone-numbers/incoming

**Número:** `+55 33 2298-0007`

**A CALL COMES IN:**
```
POST https://abc123.ngrok.io/webhooks/twilio/incoming-call
```

**CALL STATUS CHANGES:**
```
POST https://abc123.ngrok.io/webhooks/twilio/call-status
```

### **4. Configurar Retell.ai**

**Acessar:** https://dashboard.retellai.com/settings/webhooks

**Webhook URL:**
```
https://abc123.ngrok.io/webhooks/retell/call-events
```

**Timeout:** `10s`

### **5. Testar Webhooks**

```bash
# Evento manual de teste
curl -X POST http://localhost:3000/webhooks/retell/call-events \
  -H "Content-Type: application/json" \
  -d '{
    "event": "call_started",
    "call": {
      "call_id": "test_123",
      "agent_id": "agent_456",
      "from_number": "+5564999526870",
      "to_number": "+553322980007",
      "start_timestamp": 1733000000
    }
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Webhook call_started processado com sucesso"
}
```

---

## 📊 VALIDAR MÉTRICAS

### **Analytics Endpoint**

```bash
curl http://localhost:3000/calls/analytics | jq
```

**Deve mostrar:**
- Total de chamadas
- Duração média
- Taxa de sucesso
- Chamadas por status
- Chamadas por agente

---

## 🧪 TESTES AUTOMATIZADOS

### **Script de Validação Completa**

```bash
chmod +x TESTE-COMPLETO.sh
./TESTE-COMPLETO.sh
```

**O que testa:**
1. ✅ Servidor online
2. ✅ Credenciais (Retell, Twilio, OpenAI)
3. ✅ Todos os endpoints principais
4. ✅ Integração Retell.ai
5. ✅ Criação de agente
6. ✅ Banco de dados

**Resultado esperado:**
```
========================================
🎉 TODOS OS TESTES PASSARAM!
========================================

Taxa de sucesso: 100%

Sistema validado e pronto para:
  ✅ Fazer ligação de teste
  ✅ Deploy em produção
```

---

## 🎯 FLUXO COMPLETO DE TESTE

### **Cenário: Validação End-to-End**

```bash
# 1. Iniciar servidor
npm run start:dev

# 2. Aguardar compilação (30s)
sleep 30

# 3. Validar credenciais
curl -X POST http://localhost:3000/config/test-retell
curl -X POST http://localhost:3000/config/test-twilio
curl -X POST http://localhost:3000/config/test-openai

# 4. Criar agente
./criar-agente-vendas.sh
# Anotar agent_id retornado

# 5. Configurar webhooks com ngrok
ngrok http 3000
# Configurar nos painéis Twilio/Retell

# 6. Fazer chamada de teste
./fazer-ligacao.sh agent_abc123

# 7. Monitorar em tempo real
# Dashboard: https://dashboard.retellai.com/calls
# Logs: tail -f app.log

# 8. Após chamada, verificar dados
curl http://localhost:3000/calls/CALL_ID

# 9. Ver analytics
curl http://localhost:3000/calls/analytics
```

---

## ❌ TROUBLESHOOTING

### **Servidor não inicia**

```bash
# Verificar Node.js
node -v  # Deve ser >= 18

# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install

# Regenerar Prisma
npx prisma generate
npx prisma migrate dev
```

### **Credenciais falham**

```bash
# Verificar .env
cat .env | grep -E "TWILIO|RETELL|OPENAI"

# Testar manualmente
curl -X POST http://localhost:3000/config/test-retell -v
```

### **Chamada não conecta**

**Possíveis causas:**
1. Agent ID inválido
2. Número de telefone errado
3. Saldo insuficiente no Retell.ai
4. Credenciais Twilio incorretas

**Verificar:**
```bash
# Dashboard Twilio
https://console.twilio.com/monitor/logs/debugger

# Dashboard Retell.ai
https://dashboard.retellai.com/calls

# Logs locais
tail -f app.log
```

### **Webhook não recebe eventos**

```bash
# Verificar ngrok rodando
curl https://abc123.ngrok.io/health

# Testar webhook manualmente
curl -X POST http://localhost:3000/webhooks/retell/call-events \
  -H "Content-Type: application/json" \
  -d '{"event":"call_started","call":{"call_id":"test"}}'
```

---

## 📈 MÉTRICAS DE SUCESSO

**Sistema validado quando:**

- ✅ **100% dos testes** passam (`TESTE-COMPLETO.sh`)
- ✅ **Ligação real** completa com sucesso
- ✅ **Transcrição** gerada corretamente
- ✅ **Webhooks** recebendo eventos
- ✅ **Analytics** mostrando dados corretos
- ✅ **Zero erros** nos logs

---

## 🚀 APÓS VALIDAÇÃO

**Sistema pronto para:**

1. ✅ **Desenvolvimento do Frontend React**
2. ✅ **Deploy em produção**
3. ✅ **Uso comercial**

---

## 📞 CONTATOS DE TESTE

| Número | Descrição |
|--------|-----------|
| `+5564999526870` | Número de teste principal |
| `+553322980007` | Número Twilio (origem) |

---

## 🔒 SEGURANÇA

**Antes do deploy:**

- [ ] Trocar `.env` por variáveis de ambiente
- [ ] Habilitar rate limiting
- [ ] Configurar CORS adequadamente
- [ ] Ativar validação de webhook signatures
- [ ] Implementar logs de auditoria
- [ ] Configurar SSL/HTTPS
- [ ] Backup automático do banco

---

**🎯 Execute estes testes localmente e valide 100% antes do deploy!**

**Última atualização:** 2025-12-05  
**Status:** Pronto para execução local
