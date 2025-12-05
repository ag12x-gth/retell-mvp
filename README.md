# 🚀 Retell MVP - Sistema de Chamadas com IA

Sistema completo de **chamadas telefônicas com IA** usando **Twilio**, **Retell.ai** e **OpenAI**. Backend **NestJS** + **Prisma** + **SQLite**, pronto para deploy no **Replit** em 5 minutos.

---

## ✨ Características

- ✅ **Backend NestJS** com Swagger integrado
- ✅ **Banco de dados SQLite** via Prisma (zero config)
- ✅ **Integração Twilio** (chamadas telefônicas reais)
- ✅ **Integração Retell.ai** (agentes de IA conversacional)
- ✅ **Integração OpenAI** (GPT-4 para processamento)
- ✅ **Webhooks configurados** (Twilio + Retell.ai)
- ✅ **Scripts automatizados** para setup e testes
- ✅ **Deploy Replit** em 1 clique
- ✅ **Frontend React** (estrutura base)

---

## 🚀 Deploy no Replit (Método Recomendado)

### **Opção 1: Import Rápido (1 clique)**
```
https://replit.com/github.com/SEU-USUARIO/retell-mvp
```

### **Opção 2: Import Guiado**
1. Acesse: https://replit.com/import
2. Escolha **GitHub** → Conecte sua conta
3. Selecione este repositório: `retell-mvp`
4. Clique em **Import** → Escolha **Private**

### **Configuração Automática (Replit)**
Após o import, o Replit detecta automaticamente:
- ✅ **Linguagem**: Node.js
- ✅ **Dependências**: `package.json` → `npm install`
- ✅ **Workflow**: `./setup-replit.sh` → `npm start`

---

## 🔐 Configurar Secrets (Variáveis de Ambiente)

**No Replit**: Abra a aba **Secrets** (ícone de cadeado) e adicione:

```env
# TWILIO (https://console.twilio.com)
TWILIO_ACCOUNT_SID=AC801c22459d806d9f2107f255e95ac476
TWILIO_AUTH_TOKEN=b0b2466cf01177a1152ae338f8556085
TWILIO_PHONE_NUMBER=+553322980007
TWILIO_API_KEY=SKa55f97ec46ae4f399102fb5f9c2b649
TWILIO_API_SECRET=[SEU_API_SECRET_AQUI]

# RETELL.AI (https://dashboard.retellai.com)
RETELL_API_KEY=key_f2cfbba3bc96aec83296fc7d
RETELL_WORKSPACE_ID=org_JY55cp5S9pRJjrV

# OPENAI (https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-proj-[SUA_CHAVE_AQUI]

# JWT (Gerar: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=[GERAR_ALEATÓRIO_32_BYTES_HEX]
```

---

## 🏃 Executar Setup Automático

No **Shell do Replit**, execute:

```bash
chmod +x setup-replit.sh
./setup-replit.sh
```

**O script faz**:
1. ✅ Instala dependências (`npm install`)
2. ✅ Configura Prisma + SQLite
3. ✅ Gera schema e migração
4. ✅ Popula banco de dados
5. ✅ Compila TypeScript
6. ✅ Valida credenciais
7. ✅ Detecta URL pública do Replit

---

## ▶️ Iniciar Servidor

Clique no botão verde **Run** no Replit, ou execute:

```bash
npm start
```

**URLs disponíveis**:
- 🌐 **API**: `https://retell-mvp-production.SEU-USER.repl.co`
- 📚 **Swagger**: `https://retell-mvp-production.SEU-USER.repl.co/api`
- ❤️ **Health Check**: `https://retell-mvp-production.SEU-USER.repl.co/health`

---

## 🔗 Configurar Webhooks

### **1. Twilio Webhooks**
Acesse: https://console.twilio.com/phone-numbers/incoming

**Para o número** `+55 33 2298-0007`:
- **Webhook Incoming**: `https://SEU-REPL.repl.co/webhooks/twilio/incoming-call`
- **Status Callback**: `https://SEU-REPL.repl.co/webhooks/twilio/call-status`

### **2. Retell.ai Webhooks**
Acesse: https://dashboard.retellai.com/settings/webhooks

- **Webhook URL**: `https://SEU-REPL.repl.co/webhooks/retell/call-events`

---

## 🧪 Testar o Sistema

### **1. Health Check**
```bash
curl https://SEU-REPL.repl.co/health
```

### **2. Criar Agente de Vendas**
```bash
curl -X POST https://SEU-REPL.repl.co/integrations/retell/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vendedor AI",
    "voice": "pt-BR-AntonioNeural",
    "type": "sales"
  }'
```

**Resposta esperada**:
```json
{
  "id": "agt_xxxxxxxxxxxxx",
  "name": "Vendedor AI",
  "status": "active"
}
```

### **3. Fazer Chamada de Teste**
```bash
curl -X POST https://SEU-REPL.repl.co/integrations/twilio/calls \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agt_xxxxxxxxxxxxx",
    "toNumber": "+5564999526870"
  }'
```

---

## 🛠️ Estrutura do Projeto

```
retell-mvp/
├── .replit                    # Config automática Replit
├── replit.nix                 # Deps sistema (Node.js 20)
├── setup-replit.sh            # Setup automático
├── package.json               # Deps Node.js
├── prisma/
│   └── schema.prisma          # Schema banco SQLite
├── src/
│   ├── app.module.ts          # Módulo principal NestJS
│   ├── integrations/          # Twilio, Retell, OpenAI
│   ├── webhooks/              # Endpoints webhooks
│   └── main.ts                # Entry point
├── DEPLOY-REPLIT.md           # Guia completo deploy
├── REPLIT-QUICKSTART.md       # Quick start
└── README.md                  # Este arquivo
```

---

## 📦 Dependências Principais

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/swagger": "^7.0.0",
    "@prisma/client": "^5.0.0",
    "twilio": "^5.0.0"
  }
}
```

---

## 🌐 Credenciais Pré-Configuradas

### **Twilio**
- 📞 **Número**: `+55 33 2298-0007`
- 🆔 **Account SID**: `AC801c22459d806d9f2107f255e95ac476`
- 🔐 **Dashboard**: https://console.twilio.com

### **Retell.ai**
- 🏢 **Workspace**: `org_JY55cp5S9pRJjrV`
- 🔐 **Dashboard**: https://dashboard.retellai.com

### **OpenAI**
- 🔐 **Dashboard**: https://platform.openai.com/api-keys

---

## 🔄 Manter Repl Ativo 24/7

**Use UptimeRobot** (https://uptimerobot.com):
1. Criar monitor **HTTP(s)**
2. URL: `https://SEU-REPL.repl.co/health`
3. Intervalo: **5 minutos**
4. ✅ Repl nunca hiberna

---

## 📊 Limites Free Tier

| Serviço    | Limite Free                      | Upgrade                  |
|------------|----------------------------------|--------------------------|
| Replit     | 1 Repl privado sempre ativo      | Replit Hacker ($7/mês)   |
| Twilio     | $15 créditos teste               | Pay-as-you-go            |
| Retell.ai  | 10 minutos/mês                   | $0.10/min                |
| OpenAI     | $5 créditos iniciais             | Pay-as-you-go            |

---

## 🐛 Troubleshooting

### **Erro: `EADDRINUSE` (porta 3000 ocupada)**
```bash
killall node
npm start
```

### **Erro: Prisma não conecta**
```bash
npx prisma generate
npx prisma migrate dev
```

### **Webhooks não recebem eventos**
- ✅ Verificar URL pública do Replit
- ✅ Confirmar configuração no Twilio/Retell.ai
- ✅ Testar endpoint: `curl https://SEU-REPL.repl.co/webhooks/twilio/incoming-call`

---

## 📚 Documentação Completa

- 📖 [DEPLOY-REPLIT.md](./DEPLOY-REPLIT.md) - Guia visual completo
- ⚡ [REPLIT-QUICKSTART.md](./REPLIT-QUICKSTART.md) - Setup rápido
- 🔧 [CONFIGURAR-CREDENCIAIS.md](./CONFIGURAR-CREDENCIAIS.md) - Obter API Keys
- 🔗 [CONFIGURAR-WEBHOOKS.md](./CONFIGURAR-WEBHOOKS.md) - Setup webhooks

---

## 🚀 Deploy em Produção

### **Opção 1: Replit Deployments**
```bash
replit deployments create
```

### **Opção 2: Railway**
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

---

## 📄 Licença

MIT License - Veja [LICENSE](./LICENSE)

---

## 💬 Suporte

- 🐛 **Issues**: https://github.com/SEU-USUARIO/retell-mvp/issues
- 💬 **Discussões**: https://github.com/SEU-USUARIO/retell-mvp/discussions
- 📧 **Email**: seu-email@example.com

---

## ⭐ Star o Projeto!

Se este projeto foi útil, deixe uma ⭐ no GitHub!

---

**Desenvolvido com ❤️ usando Twilio, Retell.ai e OpenAI**
