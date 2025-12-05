#!/bin/bash

# 🚀 INSTALAÇÃO AUTOMÁTICA RETELL MVP - LOCAL
# Execute este script na sua máquina para setup completo

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║       🚀 RETELL MVP - INSTALAÇÃO LOCAL AUTOMÁTICA         ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar Node.js
echo -e "${BLUE}[1/7]${NC} Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado!${NC}"
    echo "Por favor instale Node.js 18+ de: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js versão $NODE_VERSION detectada. Precisa ser 18+${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) | npm $(npm -v)${NC}"

# Instalar dependências
echo -e "\n${BLUE}[2/7]${NC} Instalando dependências npm..."
npm install --loglevel=error
echo -e "${GREEN}✅ Dependências instaladas${NC}"

# Gerar Prisma Client
echo -e "\n${BLUE}[3/7]${NC} Gerando Prisma Client..."
npx prisma generate > /dev/null 2>&1
echo -e "${GREEN}✅ Prisma Client gerado${NC}"

# Criar banco e rodar migrations
echo -e "\n${BLUE}[4/7]${NC} Criando banco de dados SQLite..."
npx prisma migrate dev --name init > /dev/null 2>&1
echo -e "${GREEN}✅ Banco criado e migrations aplicadas${NC}"

# Popular dados de exemplo
echo -e "\n${BLUE}[5/7]${NC} Populando dados de exemplo..."
npx tsx prisma/seed.ts > /dev/null 2>&1
echo -e "${GREEN}✅ Dados de exemplo criados:${NC}"
echo "   - 1 Organization (demo-org-id)"
echo "   - 1 User (admin@demo.com)"
echo "   - 2 Agents (Vendas + Suporte)"
echo "   - 2 Calls com analytics"

# Build da aplicação
echo -e "\n${BLUE}[6/7]${NC} Compilando aplicação TypeScript..."
npm run build > /dev/null 2>&1
echo -e "${GREEN}✅ Build concluído${NC}"

# Verificar porta 3000
echo -e "\n${BLUE}[7/7]${NC} Verificando porta 3000..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠️  Porta 3000 em uso. Use PORT=3001 ou mate o processo:${NC}"
    echo "   lsof -ti:3000 | xargs kill -9"
else
    echo -e "${GREEN}✅ Porta 3000 disponível${NC}"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║              ✅ INSTALAÇÃO CONCLUÍDA!                      ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}🎯 PRÓXIMOS PASSOS:${NC}"
echo ""
echo -e "${YELLOW}1. Iniciar aplicação em modo desenvolvimento:${NC}"
echo "   npm run start:dev"
echo ""
echo -e "${YELLOW}2. Aguardar até ver:${NC}"
echo "   🚀 RETELL AI MVP - API RODANDO!"
echo "   🌐 API:     http://localhost:3000"
echo "   📖 Swagger: http://localhost:3000/api"
echo ""
echo -e "${YELLOW}3. Testar endpoints (em outro terminal):${NC}"
echo "   curl http://localhost:3000/health"
echo "   curl http://localhost:3000/agents"
echo "   curl http://localhost:3000/calls/analytics"
echo ""
echo -e "${YELLOW}4. Abrir Swagger UI no navegador:${NC}"
echo "   http://localhost:3000/api"
echo ""
echo -e "${BLUE}📚 DOCUMENTAÇÃO COMPLETA:${NC}"
echo "   - COMO-TESTAR.md            (Guia de testes)"
echo "   - README-TESTE-IMEDIATO.md  (Referência rápida)"
echo ""
echo -e "${GREEN}🎉 Tudo pronto para testar!${NC}"
echo ""
