#!/bin/bash
# ========================================
# 🧪 VALIDAÇÃO COMPLETA - EXECUTAR LOCAL
# ========================================
# Script para validar TUDO antes de usar
# Execute na sua máquina local!
# ========================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║       🧪 RETELL MVP - VALIDAÇÃO COMPLETA LOCAL 🧪           ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

PASSED=0
FAILED=0

# ========================================
# HELPER: Test function
# ========================================
test_check() {
    local name="$1"
    local condition="$2"
    
    echo -n "  $name ... "
    
    if eval "$condition" > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌${NC}"
        ((FAILED++))
        return 1
    fi
}

# ========================================
# 1. PRÉ-REQUISITOS DO SISTEMA
# ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  PRÉ-REQUISITOS DO SISTEMA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Node.js versão
NODE_VERSION=$(node -v 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1)
if [ ! -z "$NODE_VERSION" ] && [ "$NODE_VERSION" -ge 18 ]; then
    echo -e "  Node.js $(node -v) ${GREEN}✅${NC}"
    ((PASSED++))
else
    echo -e "  Node.js versão ${RED}❌ (necessário >= 18)${NC}"
    ((FAILED++))
fi

# npm
if command -v npm > /dev/null 2>&1; then
    echo -e "  npm $(npm -v) ${GREEN}✅${NC}"
    ((PASSED++))
else
    echo -e "  npm ${RED}❌${NC}"
    ((FAILED++))
fi

# git (opcional)
if command -v git > /dev/null 2>&1; then
    echo -e "  git $(git --version | cut -d' ' -f3) ${GREEN}✅${NC}"
    ((PASSED++))
else
    echo -e "  git ${YELLOW}⚠️  (opcional)${NC}"
fi

echo ""

# ========================================
# 2. ESTRUTURA DO PROJETO
# ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  ESTRUTURA DO PROJETO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_check "package.json" "[ -f package.json ]"
test_check ".env configurado" "[ -f .env ] && [ -s .env ]"
test_check "src/ existe" "[ -d src ]"
test_check "prisma/ existe" "[ -d prisma ]"
test_check "prisma/schema.prisma" "[ -f prisma/schema.prisma ]"
test_check "Scripts .sh" "[ -f criar-agente-vendas.sh ]"

echo ""

# ========================================
# 3. CREDENCIAIS
# ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  CREDENCIAIS CONFIGURADAS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_check "TWILIO_ACCOUNT_SID" "grep -q 'TWILIO_ACCOUNT_SID=' .env"
test_check "TWILIO_AUTH_TOKEN" "grep -q 'TWILIO_AUTH_TOKEN=' .env"
test_check "TWILIO_PHONE_NUMBER" "grep -q 'TWILIO_PHONE_NUMBER=' .env"
test_check "RETELL_API_KEY" "grep -q 'RETELL_API_KEY=' .env"
test_check "RETELL_WORKSPACE_ID" "grep -q 'RETELL_WORKSPACE_ID=' .env"
test_check "OPENAI_API_KEY" "grep -q 'OPENAI_API_KEY=' .env"

echo ""

# Mostrar valores (mascarados)
echo -e "${BLUE}📋 Credenciais encontradas:${NC}"
echo ""
cat .env | grep -E "^(TWILIO_|RETELL_|OPENAI_)" | while read line; do
    key=$(echo "$line" | cut -d'=' -f1)
    value=$(echo "$line" | cut -d'=' -f2 | cut -c1-10)
    echo "  $key = $value..."
done
echo ""

# ========================================
# 4. DEPENDÊNCIAS
# ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  DEPENDÊNCIAS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d node_modules ]; then
    echo -e "  node_modules/ ${GREEN}✅ ($(ls node_modules | wc -l) pacotes)${NC}"
    ((PASSED++))
else
    echo -e "  node_modules/ ${YELLOW}⚠️  Execute: npm install${NC}"
fi

if [ -d node_modules/.prisma ]; then
    echo -e "  Prisma Client ${GREEN}✅${NC}"
    ((PASSED++))
else
    echo -e "  Prisma Client ${YELLOW}⚠️  Execute: npx prisma generate${NC}"
fi

echo ""

# ========================================
# 5. BANCO DE DADOS
# ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  BANCO DE DADOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f prisma/dev.db ]; then
    echo -e "  dev.db ${GREEN}✅ ($(du -h prisma/dev.db | cut -f1))${NC}"
    ((PASSED++))
else
    echo -e "  dev.db ${YELLOW}⚠️  Execute: npx prisma migrate dev${NC}"
fi

if [ -d prisma/migrations ]; then
    MIGRATIONS=$(ls prisma/migrations 2>/dev/null | wc -l)
    echo -e "  Migrações ${GREEN}✅ ($MIGRATIONS aplicadas)${NC}"
    ((PASSED++))
else
    echo -e "  Migrações ${YELLOW}⚠️  Execute: npx prisma migrate dev${NC}"
fi

echo ""

# ========================================
# 6. SCRIPTS EXECUTÁVEIS
# ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  SCRIPTS EXECUTÁVEIS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_check "criar-agente-vendas.sh" "[ -x criar-agente-vendas.sh ]"
test_check "fazer-ligacao.sh" "[ -x fazer-ligacao.sh ]"
test_check "TESTE-COMPLETO.sh" "[ -x TESTE-COMPLETO.sh ] || [ -f TESTE-COMPLETO.sh ]"

echo ""

# ========================================
# 7. DOCUMENTAÇÃO
# ========================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7️⃣  DOCUMENTAÇÃO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

test_check "README.md" "[ -f README.md ]"
test_check "EXECUTAR-AGORA.md" "[ -f EXECUTAR-AGORA.md ]"
test_check "INDICE-COMPLETO.md" "[ -f INDICE-COMPLETO.md ]"
test_check "DEPLOY-PRODUCAO.md" "[ -f DEPLOY-PRODUCAO.md ]"

DOCS=$(find . -name "*.md" 2>/dev/null | wc -l)
echo -e "  Total de docs: ${GREEN}$DOCS arquivos .md${NC}"

echo ""

# ========================================
# RESUMO FINAL
# ========================================
TOTAL=$((PASSED + FAILED))
SUCCESS_RATE=$((PASSED * 100 / TOTAL))

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMO DA VALIDAÇÃO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "  ${GREEN}✅ Passou: $PASSED${NC}"
echo -e "  ${RED}❌ Falhou: $FAILED${NC}"
echo -e "  📈 Taxa de sucesso: ${BLUE}$SUCCESS_RATE%${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${GREEN}🎉 PROJETO 100% VALIDADO!${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Próximos passos:"
    echo ""
    echo "1. Iniciar servidor:"
    echo "   ${BLUE}npm run start:dev${NC}"
    echo ""
    echo "2. Criar agente de vendas:"
    echo "   ${BLUE}./criar-agente-vendas.sh${NC}"
    echo ""
    echo "3. Fazer ligação de teste:"
    echo "   ${BLUE}./fazer-ligacao.sh${NC}"
    echo ""
    echo "4. Acessar Swagger:"
    echo "   ${BLUE}http://localhost:3000/api${NC}"
    echo ""
    exit 0
else
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${YELLOW}⚠️  ALGUNS ITENS PRECISAM DE ATENÇÃO${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    if [ ! -d node_modules ]; then
        echo -e "${YELLOW}→ Execute: npm install${NC}"
    fi
    
    if [ ! -d node_modules/.prisma ]; then
        echo -e "${YELLOW}→ Execute: npx prisma generate${NC}"
    fi
    
    if [ ! -f prisma/dev.db ]; then
        echo -e "${YELLOW}→ Execute: npx prisma migrate dev --name init${NC}"
    fi
    
    echo ""
    exit 1
fi
