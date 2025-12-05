# 📞 GUIA COMPLETO: TESTE DE LIGAÇÃO REAL

## 🎯 Objetivo
Fazer **ligação de teste real** para `+55 64 99952-6870` usando um **agente de vendas modelo** criado automaticamente.

---

## ✅ PRÉ-REQUISITOS

Antes de começar, verifique:

- [x] ✅ Credenciais configuradas no `.env`
- [x] ✅ Node.js instalado (v18+)
- [x] ✅ Projeto instalado (`npm install`)
- [x] ✅ Servidor rodando (`npm run start:dev`)

---

## 🚀 MÉTODO 1: VIA DASHBOARD RETELL.AI (MAIS FÁCIL)

### Passo 1: Acessar Dashboard
https://dashboard.retellai.com/

**Login:** `admin@ag12x.com.br`  
**Workspace:** `org_JY55cp5S9pRJjrV`

### Passo 2: Criar Agente

**Navegue:** Dashboard → Agents → Create Agent

**Configuração do Agente:**

```
Nome: Ana - Assistente de Vendas BR
Voice: 11labs-Adrian (Portuguese, Brazil)
Language: pt-BR
Response Latency: 800ms
Interruption Sensitivity: Medium (0.5)
Enable Backchannel: ✅ Yes
Ambient Sound: Office (Low)
```

**General Prompt:**
```
Você é Ana, uma assistente de vendas profissional brasileira.

OBJETIVO: Qualificar leads e identificar necessidades.

FLUXO DA CONVERSA:
1. Cumprimente de forma calorosa e apresente-se
2. Pergunte o nome da pessoa
3. Pergunte: "Como posso ajudar você hoje?"
4. Ouça atentamente a necessidade
5. Faça perguntas de descoberta (negócio, desafios, objetivos)
6. Apresente solução alinhada às necessidades
7. Trate objeções com empatia
8. Proponha próximo passo (demonstração ou reunião)

TOM: Profissional, amigável, consultivo, entusiasmado

EVITE: Jargões técnicos excessivos, ser insistente, respostas genéricas
```

**Begin Message:**
```
Olá! Aqui é a Ana, assistente de vendas. Como posso ajudar você hoje?
```

**Boosted Keywords:**
```
vendas, demonstração, solução, tecnologia, integração, automação
```

**Clique:** `Create Agent`

**Copie o Agent ID** gerado (ex: `agent_abc123xyz`)

### Passo 3: Fazer Chamada

**Navegue:** Dashboard → Calls → Make a Call

**Configuração:**

```
Agent: Ana - Assistente de Vendas BR
To Number: +5564999526870
From Number: (deixe vazio para usar número Retell.ai automático)
```

**Metadata (opcional):**
```json
{
  "campaign": "teste-mvp",
  "objetivo": "validacao-sistema",
  "nome_cliente": "Teste"
}
```

**Clique:** `Start Call`

### Passo 4: Monitorar Chamada

A chamada será iniciada **imediatamente**!

**Dashboard mostrará:**
- ✅ Status: `ringing` → `in-progress` → `completed`
- ✅ Duração em tempo real
- ✅ Transcrição ao vivo

**Após finalizar:**
- ✅ Transcrição completa
- ✅ Gravação de áudio
- ✅ Análise de sentimento
- ✅ Palavras-chave detectadas

---

## 🚀 MÉTODO 2: VIA SWAGGER UI (LOCAL)

### Passo 1: Iniciar Servidor

```bash
cd ~/retell-mvp-local
npm run start:dev
```

Aguarde até ver:
```
[Nest] 12345  - Application is running on: http://[::1]:3000
```

### Passo 2: Acessar Swagger

Abra no navegador: http://localhost:3000/api

### Passo 3: Criar Agente

**Navegue:** Seção `integrations/retell`

**Endpoint:** `POST /integrations/retell/agents`

**Clique:** `Try it out`

**Body:**
```json
{
  "agent_name": "Ana - Vendas MVP",
  "voice_id": "11labs-Adrian",
  "language": "pt-BR",
  "response_latency": 1000,
  "interruption_sensitivity": 0.5,
  "enable_backchannel": true,
  "backchannel_frequency": 0.8,
  "backchannel_words": ["sim", "entendi", "certo", "uhum"],
  "ambient_sound": "office",
  "llm_websocket_url": "wss://api.openai.com/v1/realtime",
  "general_prompt": "Você é Ana, assistente de vendas brasileira profissional. Seja educada, consultiva e entusiasmada.\n\nFluxo: Cumprimente → Pergunte nome → Identifique necessidade → Apresente solução → Proponha demonstração.\n\nTom: Profissional, amigável, consultivo.",
  "begin_message": "Olá! Aqui é a Ana. Como posso ajudar você hoje?",
  "boosted_keywords": ["vendas", "demonstração", "tecnologia"]
}
```

**Clique:** `Execute`

**Copie o `agent_id`** da resposta (ex: `agent_xyz789`)

### Passo 4: Iniciar Chamada

**Endpoint:** `POST /integrations/retell/calls`

**Clique:** `Try it out`

**Body:**
```json
{
  "agent_id": "agent_xyz789",
  "to_number": "+5564999526870",
  "from_number": "+553322980007",
  "metadata": {
    "campaign": "teste-mvp",
    "objetivo": "validacao"
  }
}
```

**Clique:** `Execute`

**Resposta esperada:**
```json
{
  "success": true,
  "call_id": "call_abc123",
  "status": "initiated",
  "from": "+553322980007",
  "to": "+5564999526870"
}
```

### Passo 5: Monitorar

**Endpoint:** `GET /calls/{call_id}`

Cole o `call_id` recebido e execute.

**Ou acesse dashboard:**
https://dashboard.retellai.com/calls

---

## 🚀 MÉTODO 3: VIA cURL (LINHA DE COMANDO)

### Passo 1: Criar Agente

```bash
curl -X POST http://localhost:3000/integrations/retell/agents \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "Ana - Vendas MVP",
    "voice_id": "11labs-Adrian",
    "language": "pt-BR",
    "llm_websocket_url": "wss://api.openai.com/v1/realtime",
    "general_prompt": "Você é Ana, assistente de vendas brasileira. Seja educada e consultiva. Cumprimente, pergunte o nome, identifique necessidade e proponha demonstração.",
    "begin_message": "Olá! Aqui é a Ana. Como posso ajudar?"
  }' | jq
```

**Copie o `agent_id`** retornado.

### Passo 2: Iniciar Chamada

```bash
curl -X POST http://localhost:3000/integrations/retell/calls \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "COLE_AGENT_ID_AQUI",
    "to_number": "+5564999526870",
    "from_number": "+553322980007"
  }' | jq
```

### Passo 3: Verificar Status

```bash
curl http://localhost:3000/calls/COLE_CALL_ID_AQUI | jq
```

---

## 📊 O QUE ESPERAR DA CHAMADA

### Durante a Chamada

**Telefone `+55 64 99952-6870` irá tocar.**

**Ao atender:**

1. **Ana diz:** "Olá! Aqui é a Ana. Como posso ajudar você hoje?"
2. **Você responde:** (exemplo) "Olá Ana, eu gostaria de saber mais sobre suas soluções"
3. **Ana pergunta:** "Qual o seu nome?" / "Me conte mais sobre sua necessidade"
4. **Conversa flui naturalmente** por 2-5 minutos
5. **Ana propõe:** Demonstração ou próximo passo

### Duração Esperada
- **Mínimo:** 1-2 minutos (chamada muito curta)
- **Ideal:** 3-5 minutos (conversa completa)
- **Máximo:** 10 minutos (conversa detalhada)

### Custo Estimado
- **Retell.ai:** ~$0.15-0.30 por minuto
- **Chamada 5 min:** ~$0.75-1.50 USD

---

## 🔍 VALIDAÇÃO PÓS-CHAMADA

### 1. Dashboard Retell.ai

**Acesse:** https://dashboard.retellai.com/calls

**Verifique:**
- ✅ Chamada aparece na lista
- ✅ Status: `completed`
- ✅ Duração correta
- ✅ Transcrição completa
- ✅ Gravação de áudio disponível

### 2. Análise de Qualidade

**Transcrição:**
- [ ] Áudio claro e compreensível
- [ ] Ana falou em português natural
- [ ] Sem erros de reconhecimento de voz
- [ ] Fluxo da conversa fez sentido

**Comportamento do Agente:**
- [ ] Cumprimentou adequadamente
- [ ] Perguntou o nome
- [ ] Identificou necessidade
- [ ] Apresentou solução
- [ ] Propôs próximo passo

**Aspectos Técnicos:**
- [ ] Sem latência perceptível (< 1s)
- [ ] Sem interrupções ou cortes
- [ ] Backchannel funcionou ("sim", "entendi")
- [ ] Encerramento natural

### 3. Dados Capturados

**Verificar no dashboard:**
- ✅ Metadata salva corretamente
- ✅ Palavras-chave detectadas
- ✅ Sentimento analisado
- ✅ Duração e status corretos

---

## ⚠️ TROUBLESHOOTING

### ❌ Chamada não é iniciada

**Causas comuns:**
1. **Saldo insuficiente** no Retell.ai
2. **Agent ID inválido**
3. **Número de telefone incorreto**
4. **Credenciais erradas**

**Solução:**
```bash
# Verificar credenciais
curl -X POST http://localhost:3000/config/test-retell

# Listar agentes
curl http://localhost:3000/integrations/retell/agents
```

### ❌ Telefone não toca

**Possíveis causas:**
1. Número incorreto (verificar formato: `+5564999526870`)
2. Operadora bloqueou chamada
3. Retell.ai não tem permissão para o país

**Solução:**
- Verificar no dashboard se chamada foi iniciada
- Testar com número alternativo

### ❌ Áudio ruim ou latência alta

**Causas:**
1. Conexão de internet instável
2. Servidor sobrecarregado
3. Latência configurada muito baixa

**Solução:**
- Aumentar `response_latency` para 1200-1500ms
- Verificar conexão de internet
- Testar em horário diferente

### ❌ Transcrição incorreta

**Causas:**
1. Áudio com ruído
2. Sotaque não reconhecido
3. Palavras muito técnicas

**Solução:**
- Falar mais devagar e articulado
- Adicionar palavras no `pronunciation_dictionary`
- Usar `boosted_keywords`

---

## 📈 MÉTRICAS DE SUCESSO

### ✅ Chamada BEM-SUCEDIDA se:

1. **Conexão:**
   - Telefone tocou
   - Chamada foi atendida
   - Áudio claro em ambos os lados

2. **Conversa:**
   - Ana se apresentou corretamente
   - Fluxo natural (cumprimento → descoberta → apresentação → fechamento)
   - Respondeu perguntas adequadamente
   - Sem loops ou repetições

3. **Dados:**
   - Transcrição completa e correta
   - Metadata capturada
   - Gravação disponível
   - Análise gerada

4. **Experiência:**
   - Natural e profissional
   - Latência baixa (< 1s)
   - Sem interrupções técnicas

---

## 🎯 PRÓXIMOS PASSOS APÓS TESTE

### Se o teste foi bem-sucedido:

1. **✅ Validar funcionalidades** (webhooks, analytics, etc)
2. **✅ Desenvolver Frontend React**
3. **✅ Preparar Deploy em Produção**

### Se houver problemas:

1. **Analisar logs** do servidor
2. **Verificar dashboard** Retell.ai para erros
3. **Ajustar configurações** do agente
4. **Refazer teste** com correções

---

## 📞 EXEMPLO COMPLETO DE TESTE

### Script Automatizado

```bash
#!/bin/bash
# Teste completo em 1 comando

# 1. Criar agente
AGENT_RESPONSE=$(curl -s -X POST http://localhost:3000/integrations/retell/agents \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "Ana - Vendas",
    "voice_id": "11labs-Adrian",
    "language": "pt-BR",
    "llm_websocket_url": "wss://api.openai.com/v1/realtime",
    "general_prompt": "Você é Ana, assistente de vendas brasileira profissional. Cumprimente, descubra necessidade, apresente solução, proponha demo.",
    "begin_message": "Olá! Aqui é a Ana. Como posso ajudar?"
  }')

AGENT_ID=$(echo "$AGENT_RESPONSE" | jq -r '.agent_id')
echo "✅ Agente criado: $AGENT_ID"

# 2. Iniciar chamada
CALL_RESPONSE=$(curl -s -X POST http://localhost:3000/integrations/retell/calls \
  -H "Content-Type: application/json" \
  -d "{
    \"agent_id\": \"$AGENT_ID\",
    \"to_number\": \"+5564999526870\",
    \"from_number\": \"+553322980007\"
  }")

CALL_ID=$(echo "$CALL_RESPONSE" | jq -r '.call_id')
echo "✅ Chamada iniciada: $CALL_ID"
echo "📞 Telefone tocando em +55 64 99952-6870..."
echo "Dashboard: https://dashboard.retellai.com/calls/$CALL_ID"
```

Salve como `teste-ligacao-completo.sh` e execute:
```bash
chmod +x teste-ligacao-completo.sh
./teste-ligacao-completo.sh
```

---

## ✅ CHECKLIST FINAL

Antes de considerar o teste completo:

- [ ] ✅ Agente criado com sucesso
- [ ] ✅ Chamada iniciada
- [ ] ✅ Telefone tocou
- [ ] ✅ Chamada atendida
- [ ] ✅ Conversa fluiu naturalmente
- [ ] ✅ Sem problemas técnicos
- [ ] ✅ Transcrição correta
- [ ] ✅ Gravação disponível
- [ ] ✅ Dados capturados
- [ ] ✅ Dashboard atualizado

---

**🎉 Após completar este teste, o sistema estará validado e pronto para produção!**

**Próximo:** Frontend React + Deploy
