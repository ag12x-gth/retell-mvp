# ⚡ Replit Quick Start - Retell MVP

## 🚀 Deploy em 5 Minutos

### **1️⃣ Criar Repl**

```
https://replit.com/~ → "+ Create Repl" → Node.js → Nome: retell-mvp-production
```

### **2️⃣ Upload Projeto**

- Arraste esta pasta para o Replit
- OU use: `git clone https://github.com/seu-repo/retell-mvp.git .`

### **3️⃣ Configurar Secrets (🔒)**

No Replit, clique em **Secrets (🔒)** e adicione:

| Key | Value (suas credenciais) |
|-----|--------------------------|
| `TWILIO_ACCOUNT_SID` | `AC801c22459d806d9f2107f255e95ac476` |
| `TWILIO_AUTH_TOKEN` | `b0b2466cf01177a1152ae338f8556085` |
| `TWILIO_PHONE_NUMBER` | `+553322980007` |
| `TWILIO_API_KEY` | `SKa55f97ec46ae4f399102fb5f9c2b649` |
| `TWILIO_API_SECRET` | (seu secret) |
| `RETELL_API_KEY` | `key_f2cfbba3bc96aec83296fc7d` |
| `RETELL_WORKSPACE_ID` | `org_JY55cp5S9pRJjrV` |
| `OPENAI_API_KEY` | `sk-proj-F_2bWvVvs33VR...` |
| `JWT_SECRET` | (gere: `openssl rand -hex 32`) |

### **4️⃣ Executar Setup**

No **Replit Shell**:

```bash
chmod +x setup-replit.sh
./setup-replit.sh
```

### **5️⃣ Iniciar**

Clique em **"Run"** (botão verde no topo)

### **6️⃣ Acessar**

- **Swagger:** `https://retell-mvp-production.yourusername.repl.co/api`
- **Health:** `https://retell-mvp-production.yourusername.repl.co/health`

---

## 🔗 **Configurar Webhooks**

Sua URL Replit: `https://retell-mvp-production.yourusername.repl.co`

### **Twilio**

https://console.twilio.com/phone-numbers/incoming

```
Webhook (A Call Comes In): 
https://retell-mvp-production.yourusername.repl.co/webhooks/twilio/incoming-call

Status Changes:
https://retell-mvp-production.yourusername.repl.co/webhooks/twilio/call-status
```

### **Retell.ai**

https://dashboard.retellai.com/settings/webhooks

```
https://retell-mvp-production.yourusername.repl.co/webhooks/retell/call-events
```

---

## 🧪 **Testar**

```bash
# Health check
curl https://retell-mvp-production.yourusername.repl.co/health

# Criar agente
curl -X POST https://retell-mvp-production.yourusername.repl.co/integrations/retell/agents \
  -H "Content-Type: application/json" \
  -d '{"name":"Vendas BR","voice_id":"11labs-James","language":"pt-BR"}'

# Fazer ligação (substitua AGENT_ID)
curl -X POST https://retell-mvp-production.yourusername.repl.co/integrations/twilio/calls \
  -H "Content-Type: application/json" \
  -d '{"to":"+5564999526870","from":"+553322980007","agent_id":"agt_xxxxx"}'
```

---

## 🔄 **Manter Ativo (Always On)**

### **Opção 1: UptimeRobot (Gratuito)**

https://uptimerobot.com

- Monitor: `https://retell-mvp-production.yourusername.repl.co/health`
- Interval: 5 minutos

### **Opção 2: Replit Hacker Plan**

- Upgrade → Habilitar "Always On"

---

## 📚 **Documentação Completa**

Consulte: **DEPLOY-REPLIT.md**

---

**Pronto em ~5 minutos!** 🎉
