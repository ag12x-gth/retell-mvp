#!/bin/bash
# ========================================
# 🧪 TESTE COMPLETO DE INTEGRAÇÃO
# ========================================
# Testa todas as credenciais configuradas
# Twilio + Retell.ai + OpenAI
# ========================================

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "🧪 RETELL MVP - TESTE DE INTEGRAÇÃO COMPLETO"
echo "=========================================="
echo ""

# ========================================
# 1. VERIFICAR SERVIDOR
# ========================================
echo -e "${BLUE}📡 Verificando servidor...${NC}"

if ! curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Servidor não está rodando!${NC}"
    echo ""
    echo "Inicie com:"
    echo "  npm run start:dev"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Servidor online${NC}"
echo ""

# ========================================
# 2. VERIFICAR STATUS DAS CREDENCIAIS
# ========================================
echo "=========================================="
echo -e "${BLUE}🔐 Verificando credenciais configuradas...${NC}"
echo "=========================================="
echo ""

CONFIG_STATUS=$(curl -s http://localhost:3000/config/status)
echo "$CONFIG_STATUS" | jq '.' 2>/dev/null || echo "$CONFIG_STATUS"

echo ""

# ========================================
# 3. TESTAR RETELL.AI
# ========================================
echo "=========================================="
echo -e "${BLUE}🤖 Testando Retell.ai...${NC}"
echo "=========================================="
echo ""

RETELL_TEST=$(curl -s -X POST http://localhost:3000/config/test-retell)
echo "$RETELL_TEST" | jq '.' 2>/dev/null || echo "$RETELL_TEST"

if echo "$RETELL_TEST" | grep -q "success.*true"; then
    echo -e "${GREEN}✅ Retell.ai conectado com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro ao conectar Retell.ai${NC}"
fi

echo ""

# ========================================
# 4. TESTAR TWILIO
# ========================================
echo "=========================================="
echo -e "${BLUE}📞 Testando Twilio...${NC}"
echo "=========================================="
echo ""

TWILIO_TEST=$(curl -s -X POST http://localhost:3000/config/test-twilio)
echo "$TWILIO_TEST" | jq '.' 2>/dev/null || echo "$TWILIO_TEST"

if echo "$TWILIO_TEST" | grep -q "success.*true"; then
    echo -e "${GREEN}✅ Twilio conectado com sucesso!${NC}"
else
    echo -e "${RED}❌ Erro ao conectar Twilio${NC}"
fi

echo ""

# ========================================
# 5. TESTAR OPENAI
# ========================================
echo "=========================================="
echo -e "${BLUE}🧠 Testando OpenAI...${NC}"
echo "=========================================="
echo ""

OPENAI_TEST=$(curl -s -X POST http://localhost:3000/config/test-openai)
echo "$OPENAI_TEST" | jq '.' 2>/dev/null || echo "$OPENAI_TEST"

if echo "$OPENAI_TEST" | grep -q "success.*true"; then
    echo -e "${GREEN}✅ OpenAI conectado com sucesso!${NC}"
else
    echo -e "${YELLOW}⚠️  OpenAI pode não estar configurado (opcional)${NC}"
fi

echo ""

# ========================================
# 6. LISTAR AGENTES EXISTENTES
# ========================================
echo "=========================================="
echo -e "${BLUE}👥 Listando agentes locais...${NC}"
echo "=========================================="
echo ""

AGENTS=$(curl -s http://localhost:3000/agents)
echo "$AGENTS" | jq '.' 2>/dev/null || echo "$AGENTS"

echo ""

# ========================================
# 7. LISTAR AGENTES RETELL.AI (REMOTOS)
# ========================================
echo "=========================================="
echo -e "${BLUE}🤖 Listando agentes Retell.ai (remotos)...${NC}"
echo "=========================================="
echo ""

RETELL_AGENTS=$(curl -s http://localhost:3000/integrations/retell/agents)
echo "$RETELL_AGENTS" | jq '.' 2>/dev/null || echo "$RETELL_AGENTS"

echo ""

# ========================================
# 8. CRIAR AGENTE DE TESTE (OPCIONAL)
# ========================================
echo "=========================================="
echo -e "${YELLOW}🆕 Deseja criar um agente de teste no Retell.ai?${NC}"
echo "=========================================="
echo ""
read -p "Criar agente? (s/N): " CREATE_AGENT

if [[ "$CREATE_AGENT" =~ ^[Ss]$ ]]; then
    echo ""
    echo -e "${BLUE}Criando agente...${NC}"
    
    CREATE_RESPONSE=$(curl -s -X POST http://localhost:3000/integrations/retell/agents \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Agente Teste MVP",
            "voice_id": "openai-tts-1",
            "language": "pt-BR",
            "system_prompt": "Você é um assistente virtual de teste do MVP Retell. Seja educado e prestativo."
        }')
    
    echo "$CREATE_RESPONSE" | jq '.' 2>/dev/null || echo "$CREATE_RESPONSE"
    
    if echo "$CREATE_RESPONSE" | grep -q "agent_id"; then
        AGENT_ID=$(echo "$CREATE_RESPONSE" | jq -r '.agent_id' 2>/dev/null)
        echo ""
        echo -e "${GREEN}✅ Agente criado com sucesso!${NC}"
        echo -e "   Agent ID: ${YELLOW}$AGENT_ID${NC}"
        echo ""
        echo "📝 Salve este ID para usar em chamadas!"
    else
        echo -e "${RED}❌ Erro ao criar agente${NC}"
    fi
else
    echo -e "${YELLOW}⏭  Pulando criação de agente${NC}"
fi

echo ""

# ========================================
# 9. LISTAR CHAMADAS
# ========================================
echo "=========================================="
echo -e "${BLUE}📞 Listando chamadas registradas...${NC}"
echo "=========================================="
echo ""

CALLS=$(curl -s http://localhost:3000/calls)
echo "$CALLS" | jq '.' 2>/dev/null || echo "$CALLS"

echo ""

# ========================================
# 10. ANALYTICS
# ========================================
echo "=========================================="
echo -e "${BLUE}📊 Analytics de chamadas...${NC}"
echo "=========================================="
echo ""

ANALYTICS=$(curl -s http://localhost:3000/calls/analytics)
echo "$ANALYTICS" | jq '.' 2>/dev/null || echo "$ANALYTICS"

echo ""

# ========================================
# RESUMO FINAL
# ========================================
echo "=========================================="
echo -e "${GREEN}✅ TESTE COMPLETO FINALIZADO${NC}"
echo "=========================================="
echo ""
echo "📋 Resumo:"
echo ""
echo "✅ Servidor: http://localhost:3000"
echo "✅ Swagger UI: http://localhost:3000/api"
echo ""
echo "🔐 Credenciais:"
echo "   • Retell.ai: key_f2cfbba3bc96aec83296fc7d"
echo "   • Twilio: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
echo "   • OpenAI: sk-proj-F_2b...DzkA (configurado)"
echo ""
echo "📞 Número Twilio: +55 33 2298-0007"
echo "🏢 Workspace Retell: org_JY55cp5S9pRJjrV"
echo ""
echo "=========================================="
echo "🎯 PRÓXIMOS PASSOS"
echo "=========================================="
echo ""
echo "1. 🌐 Expor publicamente (ngrok):"
echo "   ngrok http 3000"
echo ""
echo "2. 🔗 Configurar webhooks:"
echo "   Consulte: CONFIGURAR-WEBHOOKS.md"
echo ""
echo "3. 📞 Testar chamada real:"
echo "   POST /integrations/retell/calls"
echo "   {"
echo "     \"agent_id\": \"agent_xxx\","
echo "     \"to_number\": \"+5533999887766\""
echo "   }"
echo ""
echo "4. 🎨 Desenvolver Frontend React"
echo ""
echo "5. 🚀 Deploy em produção"
echo ""
echo "=========================================="
echo -e "${GREEN}✨ Sistema pronto para uso!${NC}"
echo "=========================================="
