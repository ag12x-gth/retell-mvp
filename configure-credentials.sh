#!/bin/bash
# ========================================
# 🔐 RETELL MVP - CONFIGURAÇÃO AUTOMÁTICA
# ========================================
# Script para configurar credenciais reais
# Extraídas das imagens fornecidas
# ========================================

set -e

echo "🔐 =========================================="
echo "   RETELL MVP - CONFIGURAÇÃO DE CREDENCIAIS"
echo "=========================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ========================================
# 1. VERIFICAR AMBIENTE
# ========================================
echo "📋 Verificando ambiente..."

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: Execute este script na raiz do projeto!${NC}"
    exit 1
fi

# ========================================
# 2. BACKUP DO .env ATUAL (SE EXISTIR)
# ========================================
if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env existente detectado${NC}"
    BACKUP_FILE=".env.backup-$(date +%Y%m%d-%H%M%S)"
    cp .env "$BACKUP_FILE"
    echo -e "${GREEN}✅ Backup criado: $BACKUP_FILE${NC}"
fi

# ========================================
# 3. COPIAR CREDENCIAIS REAIS
# ========================================
echo ""
echo "📝 Configurando credenciais reais..."

if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Erro: Arquivo .env.production não encontrado!${NC}"
    exit 1
fi

cp .env.production .env
echo -e "${GREEN}✅ Credenciais copiadas de .env.production${NC}"

# ========================================
# 4. SOLICITAR CHAVE OPENAI (OPCIONAL)
# ========================================
echo ""
echo -e "${YELLOW}🧠 OPENAI API KEY${NC}"
echo "A chave OpenAI é opcional, mas necessária para LLM em agentes."
echo ""
read -p "Deseja adicionar sua chave OpenAI agora? (s/N): " ADD_OPENAI

if [[ "$ADD_OPENAI" =~ ^[Ss]$ ]]; then
    echo ""
    read -p "Cole sua chave OpenAI (sk-...): " OPENAI_KEY
    
    if [[ "$OPENAI_KEY" =~ ^sk- ]]; then
        # Substituir no .env
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|OPENAI_API_KEY=\"sk-COLE_SUA_CHAVE_OPENAI_AQUI\"|OPENAI_API_KEY=\"$OPENAI_KEY\"|g" .env
        else
            # Linux
            sed -i "s|OPENAI_API_KEY=\"sk-COLE_SUA_CHAVE_OPENAI_AQUI\"|OPENAI_API_KEY=\"$OPENAI_KEY\"|g" .env
        fi
        echo -e "${GREEN}✅ Chave OpenAI configurada!${NC}"
    else
        echo -e "${YELLOW}⚠️  Chave inválida. Você pode editar .env manualmente depois.${NC}"
    fi
else
    echo -e "${YELLOW}⏭  Pulando OpenAI. Edite .env manualmente se precisar.${NC}"
fi

# ========================================
# 5. RESUMO DAS CREDENCIAIS
# ========================================
echo ""
echo "=========================================="
echo "✅ CREDENCIAIS CONFIGURADAS"
echo "=========================================="
echo ""
echo "📞 TWILIO"
echo "   Account SID: AC801c22459d806d9f2107f255e95ac476"
echo "   Phone Number: +55 33 2298-0007"
echo ""
echo "🤖 RETELL.AI"
echo "   API Key: key_f2cfbba3bc96aec83296fc7d"
echo "   Workspace: org_JY55cp5S9pRJjrV"
echo ""
echo "🧠 OPENAI"
grep "OPENAI_API_KEY" .env | cut -d'=' -f2 | sed 's/"//g'
echo ""

# ========================================
# 6. TESTAR CONEXÕES
# ========================================
echo "=========================================="
echo "🧪 Deseja testar as conexões agora?"
echo "=========================================="
echo "Isso vai:"
echo "  1. Iniciar o servidor (npm run start:dev)"
echo "  2. Testar endpoint /config/status"
echo "  3. Testar /config/test-retell"
echo "  4. Testar /config/test-twilio"
echo ""
read -p "Continuar? (s/N): " RUN_TESTS

if [[ "$RUN_TESTS" =~ ^[Ss]$ ]]; then
    echo ""
    echo "🚀 Iniciando servidor..."
    npm run start:dev > /dev/null 2>&1 &
    SERVER_PID=$!
    
    echo "⏳ Aguardando compilação (30s)..."
    sleep 30
    
    echo ""
    echo "📊 Testando /config/status..."
    curl -s http://localhost:3000/config/status | head -20
    
    echo ""
    echo ""
    echo "🤖 Testando Retell.ai..."
    curl -s -X POST http://localhost:3000/config/test-retell | head -20
    
    echo ""
    echo ""
    echo "📞 Testando Twilio..."
    curl -s -X POST http://localhost:3000/config/test-twilio | head -20
    
    echo ""
    echo ""
    echo -e "${GREEN}✅ Testes concluídos!${NC}"
    echo "Servidor rodando em PID $SERVER_PID"
    echo "Para parar: kill $SERVER_PID"
else
    echo ""
    echo -e "${YELLOW}⏭  Testes pulados. Inicie manualmente:${NC}"
    echo "   npm run start:dev"
fi

# ========================================
# 7. PRÓXIMOS PASSOS
# ========================================
echo ""
echo "=========================================="
echo "🎯 PRÓXIMOS PASSOS"
echo "=========================================="
echo ""
echo "1. ✅ Credenciais configuradas (.env)"
echo ""
echo "2. 🌐 Expor aplicação publicamente (ngrok):"
echo "   ngrok http 3000"
echo "   Copiar URL: https://xxxx.ngrok.io"
echo ""
echo "3. 🔗 Configurar Webhooks:"
echo "   • Retell.ai Dashboard:"
echo "     https://xxxx.ngrok.io/webhooks/retell/call-events"
echo ""
echo "   • Twilio Console:"
echo "     https://xxxx.ngrok.io/webhooks/twilio/call-status"
echo "     https://xxxx.ngrok.io/webhooks/twilio/incoming-call"
echo ""
echo "4. 🧪 Testar chamada real:"
echo "   POST http://localhost:3000/integrations/retell/calls"
echo ""
echo "5. 📖 Consultar guias:"
echo "   • GUIA-INTEGRAÇÕES.md"
echo "   • CONFIGURAR-WEBHOOKS.md"
echo ""
echo "=========================================="
echo -e "${GREEN}✅ Configuração concluída!${NC}"
echo "=========================================="
