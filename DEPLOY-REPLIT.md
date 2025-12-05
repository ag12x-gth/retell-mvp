# 🚀 Deploy Retell MVP no Replit

## 📋 Guia Completo de Deploy

### **Pré-requisitos**

- [ ] Conta no Replit (https://replit.com)
- [ ] Credenciais Twilio
- [ ] Credenciais Retell.ai
- [ ] Chave API OpenAI

---

## 🎯 **PASSO 1: Criar Novo Repl**

### **1.1. Acessar Replit**

```
https://replit.com/~
```

### **1.2. Criar Novo Repl**

1. Clique em **"+ Create Repl"**
2. Escolha template: **Node.js** ou **TypeScript**
3. Nome do Repl: `retell-mvp-production`
4. Clique em **"Create Repl"**

---

## 📦 **PASSO 2: Upload do Projeto**

### **Opção A: Upload via Interface**

1. No Replit, abra o painel de arquivos (à esquerda)
2. Clique nos três pontos (...) → **Upload folder**
3. Selecione a pasta do projeto local
4. Aguarde upload completo

### **Opção B: Upload via Git** (Recomendado)

```bash
# No Replit Shell
git clone https://github.com/seu-usuario/retell-mvp.git .
```

### **Opção C: Import do GitHub**

1. No Replit, clique em **"+ Create Repl"**
2. Escolha **"Import from GitHub"**
3. Cole URL do repositório
4. Clique em **"Import from GitHub"**

---

## 🔐 **PASSO 3: Configurar Secrets (Variáveis de Ambiente)**

### **3.1. Abrir Secrets**

1. No Replit, clique no ícone de **cadeado** (🔒) no menu lateral
2. OU vá em: **Tools** → **Secrets**

### **3.2. Adicionar Secrets**

Adicione as seguintes variáveis (uma por vez):

#### **Twilio**

| Key | Value | Exemplo |
|-----|-------|---------|
| `TWILIO_ACCOUNT_SID` | Seu Account SID | `AC801c22459d806d9f2107f255e95ac476` |
| `TWILIO_AUTH_TOKEN` | Seu Auth Token | `b0b2466cf01177a1152ae338f8556085` |
| `TWILIO_PHONE_NUMBER` | Seu número Twilio | `+553322980007` |
| `TWILIO_API_KEY` | Sua API Key | `SKa55f97ec46ae4f399102fb5f9c2b649` |
| `TWILIO_API_SECRET` | Seu API Secret | `your_api_secret_here` |

#### **Retell.ai**

| Key | Value | Exemplo |
|-----|-------|---------|
| `RETELL_API_KEY` | Sua API Key | `key_f2cfbba3bc96aec83296fc7d` |
| `RETELL_WORKSPACE_ID` | Seu Workspace ID | `org_JY55cp5S9pRJjrV` |

#### **OpenAI**

| Key | Value | Exemplo |
|-----|-------|---------|
| `OPENAI_API_KEY` | Sua chave API | `sk-proj-F_2bWvVvs33VR...` |

#### **Segurança**

| Key | Value | Exemplo |
|-----|-------|---------|
| `JWT_SECRET` | String aleatória forte | `gere_uma_string_aleatoria_aqui_32_chars` |

**Gerar JWT_SECRET:**
```bash
# No Replit Shell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ⚙️ **PASSO 4: Executar Setup**

### **4.1. Dar Permissão ao Script**

```bash
# No Replit Shell
chmod +x setup-replit.sh
```

### **4.2. Executar Setup**

```bash
./setup-replit.sh
```

**O que o script faz:**
- ✅ Instala dependências npm
- ✅ Configura Prisma
- ✅ Popula banco de dados (seed)
- ✅ Verifica variáveis de ambiente
- ✅ Compila TypeScript (build)
- ✅ Detecta URL do Replit automaticamente

### **4.3. Resultado Esperado**

```
============================================================
  SETUP CONCLUÍDO COM SUCESSO!
============================================================

URL do Replit: https://retell-mvp-production.yourusername.repl.co

Próximos passos:
1. Clique em 'Run' para iniciar o servidor
2. Acesse Swagger: https://retell-mvp-production.yourusername.repl.co/api
3. Configure webhooks
============================================================
```

---

## ▶️ **PASSO 5: Iniciar Servidor**

### **5.1. Clicar em "Run"**

1. No topo do Replit, clique no botão verde **"Run"**
2. Aguarde compilação e inicialização
3. Servidor iniciará na porta **3000**

### **5.2. Verificar Inicialização**

No console, você deve ver:

```
[Nest] 1234  - 12/05/2025, 10:30:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 1234  - 12/05/2025, 10:30:02 AM     LOG [InstanceLoader] AppModule dependencies initialized
...
[Nest] 1234  - 12/05/2025, 10:30:05 AM     LOG [NestApplication] Nest application successfully started
[Nest] 1234  - 12/05/2025, 10:30:05 AM     LOG Application is running on: http://0.0.0.0:3000
```

### **5.3. Acessar APIs**

O Replit expõe automaticamente a aplicação. URLs geradas:

- **Swagger UI:** `https://retell-mvp-production.yourusername.repl.co/api`
- **Health Check:** `https://retell-mvp-production.yourusername.repl.co/health`
- **API Base:** `https://retell-mvp-production.yourusername.repl.co`

**Nota:** Substitua `yourusername` pelo seu nome de usuário do Replit.

---

## 🔗 **PASSO 6: Configurar Webhooks**

### **6.1. Obter URL Pública**

Sua URL pública do Replit:
```
https://retell-mvp-production.yourusername.repl.co
```

**Encontrar no Replit:**
- Olhe no topo da janela de preview (à direita)
- OU clique no ícone de **"Open in new tab"**

### **6.2. Configurar Twilio**

1. Acesse: https://console.twilio.com/phone-numbers/incoming
2. Clique no seu número: `+55 33 2298-0007`
3. Em **"Voice & Fax"**, configure:

   **A Call Comes In:**
   ```
   Webhook: https://retell-mvp-production.yourusername.repl.co/webhooks/twilio/incoming-call
   HTTP POST
   ```

   **Status Changes:**
   ```
   Webhook: https://retell-mvp-production.yourusername.repl.co/webhooks/twilio/call-status
   HTTP POST
   ```

4. Clique em **"Save"**

### **6.3. Configurar Retell.ai**

1. Acesse: https://dashboard.retellai.com/settings/webhooks
2. Adicione webhook:

   ```
   URL: https://retell-mvp-production.yourusername.repl.co/webhooks/retell/call-events
   Events: Todos (ou selecione: call.started, call.ended, call.analyzed)
   ```

3. Clique em **"Save"**

---

## 🧪 **PASSO 7: Testar Sistema**

### **7.1. Health Check**

```bash
curl https://retell-mvp-production.yourusername.repl.co/health
```

**Resposta esperada:**
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "twilio": { "status": "up" },
    "retell": { "status": "up" }
  }
}
```

### **7.2. Criar Agente de Vendas**

```bash
curl -X POST https://retell-mvp-production.yourusername.repl.co/integrations/retell/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Assistente Vendas BR",
    "voice_id": "11labs-James",
    "language": "pt-BR"
  }'
```

**Resposta esperada:**
```json
{
  "agent_id": "agt_xxxxxxxxxxxxx",
  "name": "Assistente Vendas BR",
  "status": "active"
}
```

### **7.3. Fazer Chamada de Teste**

```bash
curl -X POST https://retell-mvp-production.yourusername.repl.co/integrations/twilio/calls \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+5564999526870",
    "from": "+553322980007",
    "agent_id": "agt_xxxxxxxxxxxxx"
  }'
```

**Resposta esperada:**
```json
{
  "call_id": "CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "status": "queued",
  "to": "+5564999526870",
  "from": "+553322980007"
}
```

### **7.4. Acompanhar Chamada**

- **Dashboard Retell.ai:** https://dashboard.retellai.com/calls
- **Logs Replit:** Veja o console do Replit em tempo real

---

## 📊 **Monitoramento e Logs**

### **Logs em Tempo Real**

No Replit, os logs aparecem automaticamente no console (parte inferior).

### **Logs Persistentes**

Logs são salvos em:
```
logs/app.log
logs/error.log
```

**Ver logs:**
```bash
# No Replit Shell
tail -f logs/app.log
```

---

## 🔄 **Manter Repl Ativo (Always On)**

Por padrão, Repls gratuitos dormem após inatividade.

### **Opção 1: Replit Hacker Plan** (Pago)

- Upgrade para Hacker Plan
- Habilitar **"Always On"** nas configurações do Repl

### **Opção 2: UptimeRobot** (Gratuito)

1. Crie conta em: https://uptimerobot.com
2. Adicione monitor:
   - Type: **HTTP(s)**
   - URL: `https://retell-mvp-production.yourusername.repl.co/health`
   - Monitoring Interval: **5 minutes**
3. UptimeRobot fará ping a cada 5 minutos, mantendo Repl ativo

### **Opção 3: Cron-job.org** (Gratuito)

1. Crie conta em: https://cron-job.org
2. Crie cronjob:
   - URL: `https://retell-mvp-production.yourusername.repl.co/health`
   - Schedule: Cada 5 minutos
3. Manterá Repl ativo

---

## 🐛 **Troubleshooting**

### **Erro: "Cannot find module"**

```bash
# Reinstalar dependências
npm install --legacy-peer-deps
```

### **Erro: "Prisma Client not generated"**

```bash
npx prisma generate
npx prisma migrate deploy
```

### **Erro: "Port 3000 already in use"**

No Replit, isso é gerenciado automaticamente. Se persistir:
```bash
# Parar processos antigos
pkill -f node
# Clicar em "Run" novamente
```

### **Webhook não funciona**

1. Verificar URL pública no Replit (deve ser HTTPS)
2. Testar manualmente:
   ```bash
   curl -X POST https://your-repl.repl.co/webhooks/twilio/incoming-call \
     -H "Content-Type: application/x-www-form-urlencoded"
   ```
3. Verificar logs no console

### **Variáveis de ambiente não carregadas**

1. Verificar se Secrets foram adicionados corretamente (🔒)
2. Reiniciar Repl (Stop → Run)
3. Verificar no código:
   ```bash
   # No Replit Shell
   node -e "console.log(process.env.TWILIO_ACCOUNT_SID)"
   ```

---

## 🚀 **Otimizações de Produção**

### **1. Habilitar Cache**

No arquivo `src/main.ts`, descomente:
```typescript
app.enableCors({
  origin: true,
  credentials: true,
});
```

### **2. Configurar Rate Limiting**

Já está configurado no projeto. Ajuste em `src/common/guards/throttler.guard.ts` se necessário.

### **3. Monitoramento**

- Use Replit Analytics (disponível no painel)
- Configure logs estruturados para análise

---

## 📋 **Checklist de Deploy**

- [ ] Repl criado no Replit
- [ ] Projeto uploaded
- [ ] Secrets configurados (Twilio, Retell.ai, OpenAI, JWT)
- [ ] `setup-replit.sh` executado com sucesso
- [ ] Servidor iniciado (botão "Run")
- [ ] Health check OK (`/health`)
- [ ] Swagger acessível (`/api`)
- [ ] Webhooks Twilio configurados
- [ ] Webhooks Retell.ai configurados
- [ ] Agente de vendas criado
- [ ] Chamada de teste realizada
- [ ] UptimeRobot ou Always On habilitado
- [ ] Logs funcionando

---

## 🎉 **Deploy Completo!**

Seu sistema Retell MVP está rodando em produção no Replit!

**URLs importantes:**
- API: `https://retell-mvp-production.yourusername.repl.co`
- Swagger: `https://retell-mvp-production.yourusername.repl.co/api`
- Health: `https://retell-mvp-production.yourusername.repl.co/health`

**Dashboards:**
- Twilio: https://console.twilio.com
- Retell.ai: https://dashboard.retellai.com
- Replit: https://replit.com/@yourusername/retell-mvp-production

---

**Última atualização:** 2025-12-05  
**Versão:** 1.0.0 - Replit Production Ready
