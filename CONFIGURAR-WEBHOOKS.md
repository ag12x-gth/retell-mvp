# 🔗 GUIA DE CONFIGURAÇÃO DE WEBHOOKS

## 📋 Visão Geral

Este guia ensina como configurar os webhooks do **Twilio** e **Retell.ai** para receber eventos em tempo real das chamadas.

---

## 🌐 Pré-requisito: Expor Aplicação Publicamente

### Por que precisamos?
Webhooks exigem **URLs públicas** acessíveis pela internet. `localhost` não funciona.

### Opções

#### 1️⃣ **NGROK (Recomendado para Testes)** ✅
```bash
# Instalar ngrok
brew install ngrok  # macOS
# ou baixar em https://ngrok.com/download

# Expor porta 3000
ngrok http 3000

# Copiar URL gerada:
# https://abc123.ngrok.io
```

#### 2️⃣ **Servidor em Nuvem** (Produção)
- AWS EC2
- Google Cloud Run
- Vercel (sem websockets)
- Railway
- Render

---

## 📞 CONFIGURAR TWILIO

### 1. Acessar Console Twilio
https://console.twilio.com/

### 2. Ir para Phone Numbers
**Console** → **Phone Numbers** → **Manage** → **Active Numbers**

Clique no número: `+55 33 2298-0007`

### 3. Configurar Voice & Fax

#### **Configure with:** `Webhooks, TwiML Bins, Functions, Studio`

#### **A CALL COMES IN**
```
Webhook
POST https://SUA_URL_NGROK.ngrok.io/webhooks/twilio/incoming-call
HTTP POST
```

#### **CALL STATUS CHANGES**
```
Webhook
POST https://SUA_URL_NGROK.ngrok.io/webhooks/twilio/call-status
HTTP POST
```

**Eventos capturados:**
- ✅ `initiated` - Chamada iniciada
- ✅ `ringing` - Tocando
- ✅ `in-progress` - Em andamento
- ✅ `completed` - Finalizada
- ✅ `busy` - Linha ocupada
- ✅ `no-answer` - Não atendida
- ✅ `failed` - Falhou

### 4. Salvar
Clique em **Save Configuration**

---

## 🤖 CONFIGURAR RETELL.AI

### 1. Acessar Dashboard Retell
https://dashboard.retellai.com/

Login: `admin@ag12x.com.br`

### 2. Ir para Settings → Webhooks

**Dashboard** → **Settings** → **Webhooks**

### 3. Adicionar URL
```
Webhook URL:
https://SUA_URL_NGROK.ngrok.io/webhooks/retell/call-events

Timeout: 10s
```

**Eventos capturados:**
- ✅ `call_started` - Chamada iniciada
- ✅ `call_ended` - Chamada finalizada
- ✅ `call_analyzed` - Análise concluída (transcrição, sentimento)

### 4. Salvar
Clique em **Save**

---

## 🧪 TESTAR WEBHOOKS

### 1. Iniciar Aplicação
```bash
npm run start:dev
```

### 2. Expor com ngrok
```bash
ngrok http 3000

# Copiar URL: https://abc123.ngrok.io
```

### 3. Atualizar Webhooks
- **Twilio:** Substituir `https://SUA_URL_NGROK.ngrok.io`
- **Retell.ai:** Substituir `https://SUA_URL_NGROK.ngrok.io`

### 4. Testar Evento Manual (Retell.ai)

**POST** `http://localhost:3000/webhooks/retell/call-events`

```json
{
  "event": "call_started",
  "call": {
    "call_id": "test_123",
    "agent_id": "agent_456",
    "from_number": "+5533999887766",
    "to_number": "+553322980007",
    "start_timestamp": 1733000000
  }
}
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Webhook call_started processado com sucesso"
}
```

### 5. Verificar Logs
```bash
tail -f logs/app.log

# Ou no console do servidor:
[INFO] Webhook Retell.ai recebido: call_started
[INFO] Chamada salva: test_123
```

---

## 🔐 SEGURANÇA DE WEBHOOKS

### 1. Validação de Assinatura Twilio

No arquivo `src/webhooks/twilio/twilio-webhook.guard.ts`:

```typescript
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import * as twilio from 'twilio';

@Injectable()
export class TwilioWebhookGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // Validar assinatura Twilio
    const signature = request.headers['x-twilio-signature'];
    const url = `https://${request.headers.host}${request.url}`;
    
    const isValid = twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN,
      signature,
      url,
      request.body
    );
    
    return isValid;
  }
}
```

**Usar no controller:**
```typescript
@Post('incoming-call')
@UseGuards(TwilioWebhookGuard)
async handleIncomingCall(@Body() body: any) {
  // Processar chamada
}
```

### 2. IP Whitelist (Opcional)

**IPs do Twilio:**
```
54.172.60.0/23
54.244.51.0/24
...
```

**IPs do Retell.ai:**
Consultar documentação oficial.

---

## 📊 MONITORAR WEBHOOKS

### 1. Painel Swagger
http://localhost:3000/api

Seção: `webhooks`

### 2. Logs em Tempo Real
```bash
tail -f logs/webhooks.log
```

### 3. Dashboard Twilio
https://console.twilio.com/monitor/logs/debugger

### 4. Dashboard Retell.ai
https://dashboard.retellai.com/calls

---

## 🛠️ TROUBLESHOOTING

### ❌ Webhook não é chamado

**Checklist:**
1. ✅ Aplicação rodando (`npm run start:dev`)
2. ✅ ngrok ativo (`ngrok http 3000`)
3. ✅ URL atualizada no Twilio/Retell
4. ✅ URL **com HTTPS** (não HTTP)
5. ✅ Endpoint correto (`/webhooks/...`)

**Testar manualmente:**
```bash
curl -X POST https://abc123.ngrok.io/webhooks/retell/call-events \
  -H "Content-Type: application/json" \
  -d '{"event":"call_started","call":{"call_id":"test"}}'
```

### ❌ Erro 401/403

- **Twilio:** Verificar `TWILIO_AUTH_TOKEN` no `.env`
- **Retell.ai:** Verificar `RETELL_API_KEY` no `.env`

### ❌ Timeout

- Webhook do Retell configurado para `10s`
- Certifique-se que o endpoint responde **rápido** (< 5s)

---

## 🎯 FLUXO COMPLETO

### 1️⃣ Chamada Recebida (Twilio)
```
Twilio → POST /webhooks/twilio/incoming-call
       ↓
   Salvar no DB (status: ringing)
       ↓
   Responder TwiML (conectar ao Retell.ai)
```

### 2️⃣ Chamada Iniciada (Retell.ai)
```
Retell → POST /webhooks/retell/call-events (call_started)
       ↓
   Atualizar DB (status: in-progress)
       ↓
   Notificar frontend (WebSocket/SSE)
```

### 3️⃣ Chamada Finalizada
```
Retell → POST /webhooks/retell/call-events (call_ended)
       ↓
   Atualizar DB (status: completed, duration)
       ↓
   Salvar gravação/transcrição
```

### 4️⃣ Análise Concluída
```
Retell → POST /webhooks/retell/call-events (call_analyzed)
       ↓
   Salvar análise de sentimento, palavras-chave
       ↓
   Gerar relatório
```

---

## 📚 RECURSOS

### Documentação Oficial
- **Twilio Webhooks:** https://www.twilio.com/docs/usage/webhooks
- **Retell.ai Webhooks:** https://docs.retellai.com/webhooks

### Ferramentas de Teste
- **webhook.site** - Testar payloads
- **ngrok** - Expor localhost
- **Postman** - Testar endpoints

---

## ✅ CHECKLIST FINAL

Antes de ir para produção:

- [ ] ✅ Webhooks configurados no Twilio
- [ ] ✅ Webhooks configurados no Retell.ai
- [ ] ✅ Validação de assinatura ativada
- [ ] ✅ Logs de webhook salvos
- [ ] ✅ Timeout adequado (< 10s)
- [ ] ✅ Retry strategy implementada
- [ ] ✅ Monitoramento ativo (Sentry, Datadog)
- [ ] ✅ Backups de dados ativados

---

**🎉 Webhooks prontos para receber eventos reais!**

Para configurar credenciais, consulte: `CONFIGURAR-CREDENCIAIS.md`  
Para integrar API, consulte: `GUIA-INTEGRAÇÕES.md`
