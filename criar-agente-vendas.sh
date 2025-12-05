#!/bin/bash
# ========================================
# 🤖 CRIAR AGENTE DE VENDAS MODELO
# ========================================
# Script para criar agente profissional
# de vendas via API Retell.ai
# ========================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "🤖 CRIANDO AGENTE DE VENDAS MODELO"
echo "=========================================="
echo ""

# Payload do agente
AGENT_PAYLOAD='{
  "agent_name": "Assistente de Vendas BR",
  "voice_id": "11labs-Adrian",
  "language": "pt-BR",
  "response_latency": 800,
  "interruption_sensitivity": 0.5,
  "enable_backchannel": true,
  "backchannel_frequency": 0.8,
  "backchannel_words": ["sim", "entendi", "certo", "uhum"],
  "reminder_trigger_ms": 10000,
  "reminder_max_count": 2,
  "ambient_sound": "office",
  "ambient_sound_volume": 0.3,
  "llm_websocket_url": "wss://api.openai.com/v1/realtime",
  "general_prompt": "Você é um assistente de vendas profissional brasileiro. Seu nome é Ana e você trabalha para uma empresa de tecnologia.\n\nObjetivo: Qualificar leads e agendar demonstrações.\n\nComportamento:\n- Seja educada, profissional e entusiasmada\n- Fale de forma natural em português do Brasil\n- Faça perguntas abertas para entender as necessidades\n- Ouça atentamente e responda de forma personalizada\n- Seja objetiva mas não apressada\n- Use linguagem corporativa mas acessível\n\nFluxo da conversa:\n1. Cumprimente e se apresente\n2. Pergunte como pode ajudar\n3. Identifique a necessidade do cliente\n4. Apresente a solução adequada\n5. Trate objeções com empatia\n6. Proponha próximo passo (agendamento/demonstração)\n\nDicas:\n- Personalize com o nome do cliente quando souber\n- Use casos de sucesso quando apropriado\n- Seja transparente sobre limitações\n- Agradeça sempre ao final",
  "begin_message": "Olá! Aqui é a Ana, assistente de vendas. Como posso ajudar você hoje?",
  "general_tools": [],
  "states": [
    {
      "name": "descoberta",
      "state_prompt": "Fase de descoberta: Faça perguntas para entender o negócio do cliente, desafios atuais e objetivos.",
      "edges": [
        {
          "description": "Cliente demonstrou interesse",
          "destination_state_name": "apresentacao",
          "parameters": {}
        }
      ]
    },
    {
      "name": "apresentacao",
      "state_prompt": "Apresente a solução de forma alinhada às necessidades identificadas. Use exemplos práticos.",
      "edges": [
        {
          "description": "Cliente tem dúvidas ou objeções",
          "destination_state_name": "tratamento_objecoes",
          "parameters": {}
        },
        {
          "description": "Cliente está pronto para próximo passo",
          "destination_state_name": "fechamento",
          "parameters": {}
        }
      ]
    },
    {
      "name": "tratamento_objecoes",
      "state_prompt": "Ouça a objeção com empatia. Reforce os benefícios e apresente casos de sucesso. Seja consultiva, não insistente.",
      "edges": [
        {
          "description": "Objeção resolvida",
          "destination_state_name": "fechamento",
          "parameters": {}
        },
        {
          "description": "Precisa de mais informações",
          "destination_state_name": "apresentacao",
          "parameters": {}
        }
      ]
    },
    {
      "name": "fechamento",
      "state_prompt": "Proponha agendar demonstração ou próxima reunião. Confirme dados de contato. Agradeça e reforce entusiasmo.",
      "edges": []
    }
  ],
  "starting_state": "descoberta",
  "inbound_dynamic_variables_webhook_url": null,
  "post_call_analysis_data": [
    {
      "name": "interesse_nivel",
      "description": "Nível de interesse do cliente (baixo/médio/alto)",
      "type": "string"
    },
    {
      "name": "necessidade_principal",
      "description": "Principal necessidade identificada",
      "type": "string"
    },
    {
      "name": "objecoes",
      "description": "Principais objeções levantadas",
      "type": "string"
    },
    {
      "name": "proximo_passo",
      "description": "Próximo passo acordado (demo agendada, follow-up, etc)",
      "type": "string"
    },
    {
      "name": "qualificacao",
      "description": "Lead qualificado? (sim/nao/talvez)",
      "type": "string"
    }
  ],
  "pronunciation_dictionary": [
    {
      "word": "API",
      "alphabet": "ipa",
      "phoneme": "a.pi.i"
    },
    {
      "word": "CRM",
      "alphabet": "ipa",
      "phoneme": "se.ɛ.ʁe.ɛ.me"
    }
  ],
  "normalize_for_speech": true,
  "opt_out_sensitive_data_storage": false,
  "boosted_keywords": [
    "vendas",
    "demonstração",
    "agendamento",
    "interesse",
    "solução",
    "tecnologia",
    "integração",
    "automação"
  ]
}'

echo -e "${BLUE}📝 Enviando configuração do agente...${NC}"
echo ""

# Criar agente via API
RESPONSE=$(curl -s -X POST http://localhost:3000/integrations/retell/agents \
  -H "Content-Type: application/json" \
  -d "$AGENT_PAYLOAD")

echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

# Extrair agent_id
AGENT_ID=$(echo "$RESPONSE" | jq -r '.agent_id' 2>/dev/null)

if [ -z "$AGENT_ID" ] || [ "$AGENT_ID" = "null" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Não foi possível extrair agent_id da resposta${NC}"
    echo "Verifique a resposta acima para detalhes."
    exit 1
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ AGENTE CRIADO COM SUCESSO!${NC}"
echo "=========================================="
echo ""
echo -e "🤖 Nome: ${BLUE}Assistente de Vendas BR${NC}"
echo -e "🆔 Agent ID: ${YELLOW}$AGENT_ID${NC}"
echo -e "🗣️  Voice: ${BLUE}11labs-Adrian (pt-BR)${NC}"
echo -e "📋 Estados: ${BLUE}descoberta → apresentacao → tratamento_objecoes → fechamento${NC}"
echo ""
echo "=========================================="
echo "📝 SALVAR AGENT ID"
echo "=========================================="
echo ""
echo "Copie e salve o Agent ID abaixo:"
echo ""
echo -e "${YELLOW}$AGENT_ID${NC}"
echo ""
echo "Use este ID para iniciar chamadas:"
echo ""
echo "curl -X POST http://localhost:3000/integrations/retell/calls \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"agent_id\": \"$AGENT_ID\","
echo "    \"to_number\": \"+5564999526870\","
echo "    \"from_number\": \"+553322980007\""
echo "  }'"
echo ""
echo "=========================================="

# Salvar agent_id em arquivo
echo "$AGENT_ID" > /tmp/retell_agent_id.txt
echo ""
echo -e "${GREEN}✅ Agent ID salvo em: /tmp/retell_agent_id.txt${NC}"
echo ""
