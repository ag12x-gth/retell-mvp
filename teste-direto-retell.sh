#!/bin/bash
# ========================================
# 🎯 TESTE DIRETO RETELL.AI API
# ========================================
# Testa diretamente a API do Retell.ai
# sem depender do servidor local
# ========================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Credenciais
RETELL_API_KEY="key_f2cfbba3bc96aec83296fc7d"
RETELL_API_URL="https://api.retellai.com/v2"

echo "=========================================="
echo "🎯 TESTE DIRETO API RETELL.AI"
echo "=========================================="
echo ""

# PASSO 1: Criar Agente de Vendas
echo -e "${BLUE}📝 PASSO 1: Criando Agente de Vendas...${NC}"
echo ""

AGENT_PAYLOAD=$(cat <<'EOF'
{
  "agent_name": "Assistente de Vendas BR - MVP",
  "voice_id": "11labs-Adrian",
  "language": "pt-BR",
  "response_latency": 1000,
  "interruption_sensitivity": 0.5,
  "enable_backchannel": true,
  "backchannel_frequency": 0.8,
  "backchannel_words": ["sim", "entendi", "certo"],
  "ambient_sound": "off",
  "llm_websocket_url": "wss://api.openai.com/v1/realtime",
  "general_prompt": "Você é Ana, uma assistente de vendas brasileira profissional e educada.\n\nObjetivo: Qualificar o lead e identificar necessidades.\n\nFluxo:\n1. Cumprimente de forma calorosa\n2. Se apresente e pergunte o nome da pessoa\n3. Pergunte: 'Como posso ajudar você hoje?'\n4. Ouça a necessidade\n5. Faça perguntas de descoberta\n6. Apresente solução alinhada\n7. Proponha próximo passo (demonstração ou reunião)\n\nTom: Profissional, amigável, consultivo.\nEvite: Jargões técnicos excessivos, ser insistente.",
  "begin_message": "Olá! Aqui é a Ana. Como posso ajudar você hoje?",
  "boosted_keywords": ["vendas", "demonstração", "solução", "tecnologia"]
}
EOF
)

CREATE_AGENT_RESPONSE=$(curl -s -X POST "$RETELL_API_URL/create-agent" \
  -H "Authorization: Bearer $RETELL_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$AGENT_PAYLOAD")

echo "$CREATE_AGENT_RESPONSE" | jq '.' 2>/dev/null || echo "$CREATE_AGENT_RESPONSE"
echo ""

AGENT_ID=$(echo "$CREATE_AGENT_RESPONSE" | jq -r '.agent_id' 2>/dev/null)

if [ -z "$AGENT_ID" ] || [ "$AGENT_ID" = "null" ]; then
    echo -e "${RED}❌ Erro ao criar agente${NC}"
    echo "Resposta da API:"
    echo "$CREATE_AGENT_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Agente criado: $AGENT_ID${NC}"
echo ""

# PASSO 2: Listar Agentes (Verificação)
echo -e "${BLUE}📋 PASSO 2: Listando agentes existentes...${NC}"
echo ""

LIST_RESPONSE=$(curl -s -X GET "$RETELL_API_URL/list-agents" \
  -H "Authorization: Bearer $RETELL_API_KEY")

echo "$LIST_RESPONSE" | jq '.' 2>/dev/null || echo "$LIST_RESPONSE"
echo ""

# PASSO 3: Criar Número de Telefone (se necessário)
echo -e "${BLUE}📞 PASSO 3: Verificando números Retell.ai...${NC}"
echo ""

PHONE_NUMBERS=$(curl -s -X GET "$RETELL_API_URL/list-phone-numbers" \
  -H "Authorization: Bearer $RETELL_API_KEY")

echo "$PHONE_NUMBERS" | jq '.' 2>/dev/null || echo "$PHONE_NUMBERS"
echo ""

# PASSO 4: Iniciar Chamada
echo "=========================================="
echo -e "${YELLOW}📞 PASSO 4: Iniciando Chamada de Teste${NC}"
echo "=========================================="
echo ""
echo "  🤖 Agente: Ana - Assistente de Vendas"
echo "  📱 Para: +55 64 99952-6870"
echo "  📞 De: Retell.ai (número automático)"
echo ""

CALL_PAYLOAD=$(cat <<EOF
{
  "agent_id": "$AGENT_ID",
  "to_number": "+5564999526870",
  "metadata": {
    "campaign": "teste-mvp",
    "objetivo": "validacao-completa",
    "data": "$(date +%Y-%m-%d)",
    "hora": "$(date +%H:%M:%S)"
  },
  "retell_llm_dynamic_variables": {
    "customer_name": "Cliente Teste",
    "product": "Sistema Voice AI MVP"
  }
}
EOF
)

echo -e "${YELLOW}⏳ Iniciando chamada...${NC}"
echo ""

CALL_RESPONSE=$(curl -s -X POST "$RETELL_API_URL/create-phone-call" \
  -H "Authorization: Bearer $RETELL_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$CALL_PAYLOAD")

echo "$CALL_RESPONSE" | jq '.' 2>/dev/null || echo "$CALL_RESPONSE"
echo ""

CALL_ID=$(echo "$CALL_RESPONSE" | jq -r '.call_id' 2>/dev/null)

if [ -z "$CALL_ID" ] || [ "$CALL_ID" = "null" ]; then
    echo -e "${RED}❌ Erro ao iniciar chamada${NC}"
    echo ""
    echo "Possíveis causas:"
    echo "  1. Saldo insuficiente no Retell.ai"
    echo "  2. Número de destino inválido"
    echo "  3. Agente não configurado corretamente"
    echo "  4. Limitações do workspace"
    echo ""
    echo "Resposta da API:"
    echo "$CALL_RESPONSE"
    exit 1
fi

echo "=========================================="
echo -e "${GREEN}✅ CHAMADA INICIADA COM SUCESSO!${NC}"
echo "=========================================="
echo ""
echo -e "📞 Call ID: ${YELLOW}$CALL_ID${NC}"
echo -e "🤖 Agent ID: ${YELLOW}$AGENT_ID${NC}"
echo -e "📱 Destino: ${BLUE}+55 64 99952-6870${NC}"
echo ""
echo "=========================================="
echo "📊 MONITORAMENTO"
echo "=========================================="
echo ""
echo "1. Dashboard Retell.ai:"
echo "   https://dashboard.retellai.com/calls"
echo ""
echo "2. Detalhes da chamada:"
echo "   https://dashboard.retellai.com/calls/$CALL_ID"
echo ""
echo "3. Verificar status (aguarde 10s):"
echo "   curl -s -X GET \"$RETELL_API_URL/get-call/$CALL_ID\" \\"
echo "     -H \"Authorization: Bearer $RETELL_API_KEY\" | jq"
echo ""
echo "=========================================="
echo -e "${BLUE}⏳ AGUARDANDO CHAMADA...${NC}"
echo "=========================================="
echo ""
echo "A chamada está sendo realizada AGORA!"
echo ""
echo "Duração estimada: 2-5 minutos"
echo ""
echo "Após finalizar, você receberá:"
echo "  ✅ Transcrição completa"
echo "  ✅ Análise de sentimento"
echo "  ✅ Gravação de áudio"
echo "  ✅ Dados de qualificação"
echo ""

# Salvar IDs
echo "$AGENT_ID" > /tmp/retell_agent_id.txt
echo "$CALL_ID" > /tmp/retell_call_id.txt

echo -e "${GREEN}✅ IDs salvos em /tmp/retell_*.txt${NC}"
echo ""

# Aguardar e verificar status
echo "Aguardando 15 segundos para verificar status..."
sleep 15

echo ""
echo "📊 Status da chamada:"
echo ""

STATUS_RESPONSE=$(curl -s -X GET "$RETELL_API_URL/get-call/$CALL_ID" \
  -H "Authorization: Bearer $RETELL_API_KEY")

echo "$STATUS_RESPONSE" | jq '.' 2>/dev/null || echo "$STATUS_RESPONSE"
echo ""

echo "=========================================="
echo -e "${GREEN}🎉 TESTE COMPLETO!${NC}"
echo "=========================================="
echo ""
echo "Próximos passos:"
echo "  1. Atenda o telefone +55 64 99952-6870"
echo "  2. Converse com a Ana (agente de vendas)"
echo "  3. Aguarde finalização (2-5 min)"
echo "  4. Acesse dashboard para ver resultados"
echo ""
echo "Para ver resultado final:"
echo "  curl -s -X GET \"$RETELL_API_URL/get-call/$CALL_ID\" \\"
echo "    -H \"Authorization: Bearer $RETELL_API_KEY\" | jq"
echo ""
