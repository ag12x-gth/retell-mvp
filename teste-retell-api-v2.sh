#!/bin/bash
# ========================================
# 🎯 TESTE API RETELL.AI (CORRIGIDO)
# ========================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

RETELL_API_KEY="key_f2cfbba3bc96aec83296fc7d"
API_BASE="https://api.retellai.com"

echo "=========================================="
echo "🎯 TESTE API RETELL.AI"
echo "=========================================="
echo ""

# PASSO 1: Listar agentes existentes
echo -e "${BLUE}📋 PASSO 1: Listando agentes existentes...${NC}"
echo ""

LIST_AGENTS=$(curl -s -X GET "${API_BASE}/list-agents" \
  -H "Authorization: Bearer ${RETELL_API_KEY}")

echo "$LIST_AGENTS" | jq '.' 2>/dev/null || echo "$LIST_AGENTS"
echo ""

# Verificar se já existe algum agente
AGENT_COUNT=$(echo "$LIST_AGENTS" | jq -r 'length' 2>/dev/null || echo "0")

if [ "$AGENT_COUNT" = "0" ] || [ -z "$AGENT_COUNT" ]; then
    echo -e "${YELLOW}⚠️  Nenhum agente encontrado. Criando novo agente...${NC}"
    
    # Criar agente
    echo ""
    echo -e "${BLUE}📝 PASSO 2: Criando Agente de Vendas...${NC}"
    
    AGENT_PAYLOAD='{
      "agent_name": "Ana - Vendas MVP",
      "voice_id": "11labs-Adrian",
      "language": "pt-BR",
      "llm_websocket_url": "wss://api.openai.com/v1/realtime",
      "general_prompt": "Você é Ana, assistente de vendas profissional brasileira. Seja educada, objetiva e consultiva. Cumprimente, pergunte o nome, identifique a necessidade e proponha demonstração.",
      "begin_message": "Olá! Aqui é a Ana. Como posso ajudar você hoje?"
    }'
    
    CREATE_RESPONSE=$(curl -s -X POST "${API_BASE}/create-agent" \
      -H "Authorization: Bearer ${RETELL_API_KEY}" \
      -H "Content-Type: application/json" \
      -d "$AGENT_PAYLOAD")
    
    echo "$CREATE_RESPONSE" | jq '.' 2>/dev/null || echo "$CREATE_RESPONSE"
    
    AGENT_ID=$(echo "$CREATE_RESPONSE" | jq -r '.agent_id' 2>/dev/null)
else
    echo -e "${GREEN}✅ ${AGENT_COUNT} agente(s) encontrado(s)${NC}"
    # Usar primeiro agente
    AGENT_ID=$(echo "$LIST_AGENTS" | jq -r '.[0].agent_id' 2>/dev/null)
fi

echo ""
echo -e "${GREEN}🤖 Usando Agent ID: $AGENT_ID${NC}"
echo ""

# PASSO 3: Iniciar Chamada
echo "=========================================="
echo -e "${YELLOW}📞 PASSO 3: Iniciando Chamada...${NC}"
echo "=========================================="
echo ""
echo "  📱 Para: +55 64 99952-6870"
echo "  🤖 Agente: $AGENT_ID"
echo ""

CALL_PAYLOAD="{
  \"agent_id\": \"$AGENT_ID\",
  \"to_number\": \"+5564999526870\",
  \"metadata\": {
    \"teste\": \"mvp\",
    \"data\": \"$(date +%Y-%m-%d)\"
  }
}"

CREATE_CALL=$(curl -s -X POST "${API_BASE}/create-phone-call" \
  -H "Authorization: Bearer ${RETELL_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "$CALL_PAYLOAD")

echo "$CREATE_CALL" | jq '.' 2>/dev/null || echo "$CREATE_CALL"
echo ""

CALL_ID=$(echo "$CREATE_CALL" | jq -r '.call_id' 2>/dev/null)

if [ -z "$CALL_ID" ] || [ "$CALL_ID" = "null" ]; then
    echo -e "${RED}❌ Erro ao criar chamada${NC}"
    echo ""
    echo "Detalhes:"
    echo "$CREATE_CALL"
    exit 1
fi

echo "=========================================="
echo -e "${GREEN}✅ CHAMADA INICIADA!${NC}"
echo "=========================================="
echo ""
echo -e "📞 Call ID: ${YELLOW}$CALL_ID${NC}"
echo -e "🤖 Agent: ${YELLOW}$AGENT_ID${NC}"
echo ""
echo "Dashboard: https://dashboard.retellai.com/calls"
echo ""
echo "Aguardando 15 segundos..."
sleep 15

echo ""
echo "📊 Status:"
GET_CALL=$(curl -s -X GET "${API_BASE}/get-call/${CALL_ID}" \
  -H "Authorization: Bearer ${RETELL_API_KEY}")

echo "$GET_CALL" | jq '.' 2>/dev/null || echo "$GET_CALL"
echo ""

echo "$CALL_ID" > /tmp/retell_call_id.txt
echo "$AGENT_ID" > /tmp/retell_agent_id.txt

echo -e "${GREEN}✅ IDs salvos em /tmp/retell_*.txt${NC}"
