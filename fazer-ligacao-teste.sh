#!/bin/bash
# ========================================
# 📞 FAZER LIGAÇÃO DE TESTE
# ========================================
# Script para iniciar chamada real
# Número: +55 64 99952-6870
# ========================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "📞 INICIANDO LIGAÇÃO DE TESTE"
echo "=========================================="
echo ""

# Verificar se agent_id foi fornecido
if [ -z "$1" ]; then
    # Tentar ler de arquivo
    if [ -f "/tmp/retell_agent_id.txt" ]; then
        AGENT_ID=$(cat /tmp/retell_agent_id.txt)
        echo -e "${BLUE}🤖 Agent ID lido do arquivo: $AGENT_ID${NC}"
    else
        echo -e "${RED}❌ Erro: Agent ID não fornecido!${NC}"
        echo ""
        echo "Uso:"
        echo "  $0 <agent_id>"
        echo ""
        echo "Ou crie o agente primeiro:"
        echo "  ./criar-agente-vendas.sh"
        exit 1
    fi
else
    AGENT_ID="$1"
fi

echo ""
echo "📋 Informações da chamada:"
echo "  • Agent ID: $AGENT_ID"
echo "  • Para: +55 64 99952-6870"
echo "  • De: +55 33 2298-0007"
echo ""

# Payload da chamada
CALL_PAYLOAD="{
  \"agent_id\": \"$AGENT_ID\",
  \"to_number\": \"+5564999526870\",
  \"from_number\": \"+553322980007\",
  \"metadata\": {
    \"campaign\": \"teste-mvp\",
    \"objetivo\": \"validacao-sistema\",
    \"data\": \"$(date +%Y-%m-%d)\",
    \"hora\": \"$(date +%H:%M:%S)\"
  },
  \"retell_llm_dynamic_variables\": {
    \"customer_name\": \"Cliente Teste\",
    \"product\": \"Sistema Voice AI\"
  }
}"

echo -e "${YELLOW}⏳ Iniciando chamada via API Retell.ai...${NC}"
echo ""

# Fazer chamada
RESPONSE=$(curl -s -X POST http://localhost:3000/integrations/retell/calls \
  -H "Content-Type: application/json" \
  -d "$CALL_PAYLOAD")

echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Extrair call_id
CALL_ID=$(echo "$RESPONSE" | jq -r '.call_id' 2>/dev/null)

if [ -z "$CALL_ID" ] || [ "$CALL_ID" = "null" ]; then
    echo ""
    echo -e "${RED}❌ ERRO AO INICIAR CHAMADA${NC}"
    echo ""
    echo "Possíveis causas:"
    echo "  1. Agent ID inválido"
    echo "  2. Credenciais Retell.ai incorretas"
    echo "  3. Número de telefone inválido"
    echo "  4. Saldo insuficiente no Retell.ai"
    echo ""
    echo "Verifique a resposta acima para detalhes."
    exit 1
fi

echo "=========================================="
echo -e "${GREEN}✅ CHAMADA INICIADA COM SUCESSO!${NC}"
echo "=========================================="
echo ""
echo -e "📞 Call ID: ${YELLOW}$CALL_ID${NC}"
echo -e "📱 Destino: ${BLUE}+55 64 99952-6870${NC}"
echo -e "🤖 Agente: ${BLUE}Assistente de Vendas BR${NC}"
echo ""
echo "=========================================="
echo "📊 MONITORAR CHAMADA"
echo "=========================================="
echo ""
echo "1. Dashboard Retell.ai:"
echo "   https://dashboard.retellai.com/calls/$CALL_ID"
echo ""
echo "2. API Local:"
echo "   curl http://localhost:3000/calls/$CALL_ID"
echo ""
echo "3. Logs do servidor:"
echo "   tail -f app.log"
echo ""
echo "=========================================="
echo -e "${BLUE}⏳ Aguardando chamada ser atendida...${NC}"
echo "=========================================="
echo ""
echo "A chamada está sendo realizada agora!"
echo "Duração estimada: 2-5 minutos"
echo ""
echo "Após finalizar, verifique:"
echo "  • Transcrição completa"
echo "  • Análise de sentimento"
echo "  • Dados de qualificação"
echo "  • Gravação de áudio"
echo ""

# Salvar call_id
echo "$CALL_ID" > /tmp/retell_call_id.txt
echo -e "${GREEN}✅ Call ID salvo em: /tmp/retell_call_id.txt${NC}"
echo ""

# Aguardar alguns segundos e buscar status
sleep 10

echo "📊 Status atual da chamada:"
echo ""
curl -s http://localhost:3000/calls/$CALL_ID | jq '.' 2>/dev/null || echo "Chamada em andamento..."
echo ""

echo "=========================================="
echo -e "${GREEN}🎉 Ligação em andamento!${NC}"
echo "=========================================="
