# ⚡ EXECUTAR AGORA - GUIA RÁPIDO

## 🎯 O QUE FAZER

Você tem **3 tarefas principais**:

1. ✅ **Testar ligação** para `+55 64 99952-6870`
2. ✅ **Validar funcionalidades** (100%)
3. ✅ **Aprovar para deploy**

---

## 🚀 AÇÃO IMEDIATA (10 MINUTOS)

### **NO SEU COMPUTADOR LOCAL:**

```bash
# 1. Copiar projeto do sandbox
cp -r /home/user/retell-mvp ~/retell-mvp-teste
cd ~/retell-mvp-teste

# 2. Instalar (se ainda não fez)
npm install
npx prisma generate
npx prisma migrate dev --name init
npx tsx prisma/seed.ts

# 3. Iniciar servidor
npm run start:dev
```

Aguarde ver: `Application is running on: http://[::1]:3000`

---

## 📞 FAZER LIGAÇÃO DE TESTE

### **OPÇÃO 1: Dashboard Retell.ai (MAIS FÁCIL)** ⭐

#### Passo 1: Login
https://dashboard.retellai.com/

**Email:** `admin@ag12x.com.br`

#### Passo 2: Criar Agente

**Menu:** Agents → Create Agent

**Configuração Rápida:**
- **Name:** `Ana - Vendas MVP`
- **Voice:** `11labs-Adrian` (Portuguese, Brazil)
- **Language:** `pt-BR`
- **General Prompt:**
  ```
  Você é Ana, assistente de vendas brasileira profissional.
  Cumprimente, pergunte o nome, identifique necessidade e proponha demonstração.
  ```
- **Begin Message:** `Olá! Aqui é a Ana. Como posso ajudar?`

**Clicar:** Create Agent → **Copiar Agent ID**

#### Passo 3: Fazer Chamada

**Menu:** Calls → Make a Call

- **Agent:** Ana - Vendas MVP
- **To Number:** `+5564999526870`
- **From:** (deixar vazio)

**Clicar:** Start Call

#### Passo 4: Atender Telefone

O número `+55 64 99952-6870` irá **tocar em 10-15 segundos**.

**Atender e conversar por 2-3 minutos** com a Ana.

#### Passo 5: Verificar Resultado

**Dashboard** mostrará:
- ✅ Transcrição completa
- ✅ Gravação de áudio
- ✅ Análise de sentimento
- ✅ Duração e status

---

### **OPÇÃO 2: Swagger UI (Local)**

#### Passo 1: Abrir Swagger
http://localhost:3000/api

#### Passo 2: Criar Agente

**Seção:** `integrations/retell`  
**Endpoint:** `POST /integrations/retell/agents`

**Clicar:** Try it out

**Body:**
```json
{
  "agent_name": "Ana - Vendas",
  "voice_id": "11labs-Adrian",
  "language": "pt-BR",
  "llm_websocket_url": "wss://api.openai.com/v1/realtime",
  "general_prompt": "Você é Ana, assistente de vendas profissional. Cumprimente, pergunte nome, descubra necessidade, apresente solução.",
  "begin_message": "Olá! Aqui é a Ana. Como posso ajudar?"
}
```

**Execute** → Copiar `agent_id` da resposta

#### Passo 3: Iniciar Chamada

**Endpoint:** `POST /integrations/retell/calls`

**Body:**
```json
{
  "agent_id": "COLE_AGENT_ID_AQUI",
  "to_number": "+5564999526870",
  "from_number": "+553322980007"
}
```

**Execute** → Telefone irá tocar!

---

## ✅ VALIDAÇÃO RÁPIDA (5 MINUTOS)

### 1. Testar Credenciais

```bash
# No terminal
curl -X POST http://localhost:3000/config/test-retell
curl -X POST http://localhost:3000/config/test-twilio
curl -X POST http://localhost:3000/config/test-openai
```

**Esperado:** Todos retornam `{"success":true}`

### 2. Testar CRUD

```bash
# Listar agentes
curl http://localhost:3000/agents

# Listar chamadas
curl http://localhost:3000/calls

# Analytics
curl http://localhost:3000/calls/analytics
```

**Esperado:** Arrays com dados

### 3. Verificar Chamada no DB

```bash
curl http://localhost:3000/calls | jq
```

**Esperado:** Sua chamada aparece na lista com status `completed`

---

## 🎯 CHECKLIST DE VALIDAÇÃO

### ✅ Backend
- [ ] Servidor iniciou sem erros
- [ ] Health check funciona: `curl http://localhost:3000/health`
- [ ] Swagger UI abre: http://localhost:3000/api
- [ ] CRUD de agentes funciona
- [ ] CRUD de chamadas funciona

### ✅ Credenciais
- [ ] Retell.ai conecta
- [ ] Twilio conecta
- [ ] OpenAI conecta

### ✅ Funcionalidades Críticas
- [ ] ✅ **Criar agente no Retell.ai**
- [ ] ✅ **Fazer chamada real para +55 64 99952-6870**
- [ ] ✅ **Conversa funciona (áudio claro, latência baixa)**
- [ ] ✅ **Transcrição gerada**
- [ ] ✅ **Dados salvos no banco**

### ✅ Webhooks (Opcional para MVP)
- [ ] ngrok rodando
- [ ] Webhooks configurados
- [ ] Eventos recebidos

---

## 📊 RESULTADO ESPERADO

### ✅ CHAMADA BEM-SUCEDIDA

**Se tudo funcionou:**
1. Telefone tocou
2. Ana se apresentou em português
3. Conversa fluiu naturalmente
4. Sem travamentos ou latência alta
5. Transcrição correta no dashboard
6. Gravação de áudio disponível

**Duração ideal:** 2-5 minutos  
**Custo:** ~$0.50-1.50 USD

---

## ❌ SE HOUVER PROBLEMAS

### Servidor não inicia
```bash
# Reinstalar
rm -rf node_modules package-lock.json
npm install
npx prisma generate
```

### Credenciais não conectam
```bash
# Verificar .env
cat .env | grep -E "RETELL|TWILIO|OPENAI"

# Reconfigurar
./configure-credentials.sh
```

### Chamada não completa
**Verificar:**
1. Saldo na conta Retell.ai
2. Agent ID correto
3. Número de telefone válido
4. Dashboard Retell.ai para erros

---

## 🎯 APÓS VALIDAÇÃO

### ✅ SE TUDO FUNCIONOU (100%)

**Próximos passos:**

1. **✅ Marcar como VALIDADO**
   ```bash
   echo "✅ SISTEMA 100% VALIDADO" > STATUS-VALIDACAO.txt
   echo "Data: $(date)" >> STATUS-VALIDACAO.txt
   echo "Chamada teste: Sucesso" >> STATUS-VALIDACAO.txt
   ```

2. **✅ Commitar código**
   ```bash
   git add .
   git commit -m "Sistema validado - chamada real bem-sucedida"
   git push
   ```

3. **✅ Solicitar Frontend React**
   "Pode criar o Frontend React agora! Sistema validado 100%."

4. **✅ Preparar Deploy**
   Escolher plataforma: Railway, AWS, GCP, Vercel

---

### ⚠️ SE ALGO FALHOU

**Me avise com detalhes:**
- Qual passo falhou?
- Qual mensagem de erro?
- Screenshot do dashboard (se houver)

**Vou corrigir imediatamente!**

---

## 💬 PERGUNTAS RÁPIDAS

### "Quantos testes devo fazer?"
**Resposta:** 1 chamada bem-sucedida já valida o sistema.

### "Preciso configurar webhooks agora?"
**Resposta:** Não é obrigatório para MVP. Pode fazer depois.

### "Quanto custa cada chamada?"
**Resposta:** ~$0.15-0.30/minuto no Retell.ai.

### "Posso usar outro número de telefone?"
**Resposta:** Sim! Apenas ajuste no payload da chamada.

### "E se eu não tiver saldo no Retell.ai?"
**Resposta:** Adicione créditos em https://dashboard.retellai.com/billing

---

## ⏱️ TEMPO ESTIMADO

| Tarefa | Tempo |
|--------|-------|
| Iniciar servidor | 2 min |
| Criar agente | 3 min |
| Fazer chamada | 5 min |
| Validar | 3 min |
| **TOTAL** | **13 min** |

---

## 🎉 RESUMO EXECUTIVO

**Você precisa:**
1. Abrir dashboard Retell.ai
2. Criar agente "Ana - Vendas"
3. Fazer chamada para +55 64 99952-6870
4. Atender e conversar 2-3 min
5. Verificar transcrição no dashboard
6. Confirmar: "Validado 100%"

**Após isso:**
- Frontend React (automático)
- Deploy em produção (Railway/Vercel)

---

**⚡ AÇÃO AGORA:** Executar Opção 1 (Dashboard) ou Opção 2 (Swagger)

**🎯 Meta:** Chamada bem-sucedida em 15 minutos

**💬 Depois:** "Sistema validado! Pode criar o frontend."
