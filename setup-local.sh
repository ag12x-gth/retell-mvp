#!/bin/bash

# 🚀 Setup Automatizado - Retell MVP
# Configura ambiente local completo para teste

set -e

echo "🔧 SETUP RETELL MVP - INICIANDO..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar Node.js e npm
echo -e "\n${YELLOW}[1/8]${NC} Verificando Node.js e npm..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado. Instalando...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
echo -e "${GREEN}✅ Node $(node -v) | npm $(npm -v)${NC}"

# 2. Verificar Docker e Docker Compose
echo -e "\n${YELLOW}[2/8]${NC} Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker não encontrado. Por favor instale: https://docs.docker.com/engine/install/${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker $(docker --version)${NC}"

# 3. Criar arquivo .env se não existir
echo -e "\n${YELLOW}[3/8]${NC} Configurando variáveis de ambiente..."
if [ ! -f .env ]; then
    cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://retell_user:retell_password_secure@localhost:5432/retell_db?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=retell_redis_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRATION=7d

# Retell.ai
RETELL_API_KEY=your_retell_api_key_here

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# App
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# Logs
LOG_LEVEL=debug
EOF
    echo -e "${GREEN}✅ Arquivo .env criado${NC}"
else
    echo -e "${GREEN}✅ Arquivo .env já existe${NC}"
fi

# 4. Instalar dependências
echo -e "\n${YELLOW}[4/8]${NC} Instalando dependências npm..."
npm install --quiet
echo -e "${GREEN}✅ Dependências instaladas${NC}"

# 5. Iniciar serviços Docker
echo -e "\n${YELLOW}[5/8]${NC} Iniciando PostgreSQL e Redis..."
docker-compose up -d postgres redis
sleep 5
echo -e "${GREEN}✅ PostgreSQL e Redis rodando${NC}"

# 6. Executar migrations
echo -e "\n${YELLOW}[6/8]${NC} Executando migrations do banco..."
npx prisma generate
npx prisma migrate deploy
echo -e "${GREEN}✅ Database schema aplicado${NC}"

# 7. Seed inicial (opcional)
echo -e "\n${YELLOW}[7/8]${NC} Populando dados iniciais..."
npx prisma db seed 2>/dev/null || echo -e "${YELLOW}⚠️  Seed opcional não configurado (OK)${NC}"

# 8. Iniciar aplicação
echo -e "\n${YELLOW}[8/8]${NC} Iniciando aplicação NestJS..."
npm run start:dev &
APP_PID=$!
sleep 8

# Verificar se a aplicação está rodando
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✅ SETUP CONCLUÍDO COM SUCESSO!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "\n📋 SERVIÇOS ATIVOS:"
    echo -e "   🌐 API:        http://localhost:3000"
    echo -e "   📊 Health:     http://localhost:3000/health"
    echo -e "   📖 Swagger:    http://localhost:3000/api"
    echo -e "   🗄️  PostgreSQL: localhost:5432"
    echo -e "   🔴 Redis:      localhost:6379"
    echo -e "\n🧪 TESTAR AGORA:"
    echo -e "   curl http://localhost:3000/health"
    echo -e "   curl http://localhost:3000/api/agents"
    echo -e "\n📝 PRÓXIMOS PASSOS:"
    echo -e "   1. Configure credenciais em .env (Twilio, Retell, OpenAI)"
    echo -e "   2. Acesse Swagger UI: http://localhost:3000/api"
    echo -e "   3. Crie um agente via API"
    echo -e "   4. Configure Twilio webhook"
    echo -e "   5. Faça uma chamada teste!"
    echo -e "\n🛑 PARAR TUDO:"
    echo -e "   docker-compose down"
    echo -e "   pkill -f 'nest start'"
else
    echo -e "\n${RED}❌ Aplicação não iniciou corretamente${NC}"
    echo -e "${YELLOW}Verifique logs: npm run start:dev${NC}"
    exit 1
fi
