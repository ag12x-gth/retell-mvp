#!/bin/bash

###
# SCRIPT DE SETUP AUTOMATIZADO - RETELL AI MVP
# Auto-Model Router: GPT-5.1 Codex (DevOps/Setup)
#
# Este script configura automaticamente todo o ambiente local
###

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Funções auxiliares
log_info() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[→]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[!]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Banner
clear
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║         RETELL AI MVP - SETUP AUTOMÁTICO LOCAL            ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# 1. Verificar pré-requisitos
log_step "Passo 1/7: Verificando pré-requisitos..."

if ! command -v docker &> /dev/null; then
    log_error "Docker não está instalado!"
    echo "Instale em: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose não está instalado!"
    echo "Instale em: https://docs.docker.com/compose/install/"
    exit 1
fi

if ! command -v node &> /dev/null; then
    log_warn "Node.js não está instalado (opcional para desenvolvimento manual)"
fi

log_info "Pré-requisitos OK"
echo ""

# 2. Configurar variáveis de ambiente
log_step "Passo 2/7: Configurando variáveis de ambiente..."

if [ ! -f .env ]; then
    log_step "Criando arquivo .env..."
    
    cat > .env << 'EOF'
# Database
POSTGRES_USER=retell
POSTGRES_PASSWORD=retell_dev_password
POSTGRES_DB=retell_dev
POSTGRES_PORT=5432

# Redis
REDIS_PASSWORD=retell_redis_password
REDIS_PORT=6379

# API
JWT_SECRET=dev_jwt_secret_change_in_production
RETELL_API_KEY=key_placeholder_get_real_key_from_retellai
RETELL_WEBHOOK_URL=http://localhost:3001

# Twilio (opcional - configure depois)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=

# Domain
DOMAIN_NAME=localhost

# pgAdmin
PGADMIN_EMAIL=admin@retell.local
PGADMIN_PASSWORD=admin
EOF

    log_info "Arquivo .env criado"
else
    log_info "Arquivo .env já existe"
fi

echo ""

# 3. Limpar ambiente anterior (se existir)
log_step "Passo 3/7: Limpando ambiente anterior..."

if [ "$(docker ps -aq -f name=retell)" ]; then
    log_warn "Removendo containers anteriores..."
    docker-compose down -v 2>/dev/null || true
fi

log_info "Ambiente limpo"
echo ""

# 4. Iniciar serviços Docker
log_step "Passo 4/7: Iniciando serviços Docker..."

log_step "Subindo Postgres e Redis..."
docker-compose up -d postgres redis

# Aguardar serviços ficarem prontos
log_step "Aguardando Postgres ficar pronto..."
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U retell &> /dev/null; then
        break
    fi
    
    if [ $i -eq 30 ]; then
        log_error "Postgres não iniciou após 30 segundos"
        exit 1
    fi
    
    sleep 1
done

log_step "Aguardando Redis ficar pronto..."
for i in {1..30}; do
    if docker-compose exec -T redis redis-cli -a retell_redis_password ping &> /dev/null; then
        break
    fi
    
    if [ $i -eq 30 ]; then
        log_error "Redis não iniciou após 30 segundos"
        exit 1
    fi
    
    sleep 1
done

log_info "Postgres e Redis prontos"
echo ""

# 5. Configurar banco de dados
log_step "Passo 5/7: Configurando banco de dados..."

log_step "Subindo API para rodar migrações..."
docker-compose up -d api

# Aguardar API construir (primeira vez demora)
log_step "Aguardando build da API (pode demorar alguns minutos na primeira vez)..."
sleep 15

# Rodar migrações
log_step "Executando migrações Prisma..."
docker-compose exec -T api npx prisma migrate deploy 2>/dev/null || {
    log_warn "Tentando criar banco de dados..."
    docker-compose exec -T api npx prisma migrate dev --name init --skip-generate 2>/dev/null || true
    docker-compose exec -T api npx prisma migrate deploy
}

# Seed do banco
log_step "Populando banco com dados iniciais..."
docker-compose exec -T api npx prisma db seed 2>/dev/null || {
    log_warn "Seed script não encontrado - banco estará vazio"
}

log_info "Banco de dados configurado"
echo ""

# 6. Subir aplicação completa
log_step "Passo 6/7: Iniciando aplicação completa..."

docker-compose up -d

log_step "Aguardando serviços ficarem saudáveis..."
sleep 10

log_info "Aplicação iniciada"
echo ""

# 7. Validar instalação
log_step "Passo 7/7: Validando instalação..."

# Verificar API
log_step "Verificando API..."
for i in {1..20}; do
    if curl -f -s http://localhost:3001/health > /dev/null 2>&1; then
        log_info "API respondendo em http://localhost:3001"
        break
    fi
    
    if [ $i -eq 20 ]; then
        log_warn "API não respondeu após 20 tentativas"
    fi
    
    sleep 2
done

# Verificar Web
log_step "Verificando Frontend..."
for i in {1..20}; do
    if curl -f -s http://localhost:3000 > /dev/null 2>&1; then
        log_info "Frontend respondendo em http://localhost:3000"
        break
    fi
    
    if [ $i -eq 20 ]; then
        log_warn "Frontend não respondeu após 20 tentativas"
    fi
    
    sleep 2
done

echo ""

# Sumário final
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║              🎉 SETUP CONCLUÍDO COM SUCESSO! 🎉           ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

echo -e "${BLUE}📱 URLs da Aplicação:${NC}"
echo "  • Frontend:       http://localhost:3000"
echo "  • API:            http://localhost:3001"
echo "  • API Health:     http://localhost:3001/health"
echo "  • pgAdmin:        http://localhost:5050"
echo "  • Redis Commander: http://localhost:8081 (se iniciado)"
echo ""

echo -e "${BLUE}🔑 Credenciais:${NC}"
echo "  • pgAdmin:"
echo "    - Email:    admin@retell.local"
echo "    - Senha:    admin"
echo ""

echo -e "${BLUE}🗄️  Banco de Dados:${NC}"
echo "  • Host:     localhost"
echo "  • Port:     5432"
echo "  • Database: retell_dev"
echo "  • User:     retell"
echo "  • Password: retell_dev_password"
echo ""

echo -e "${BLUE}📊 Ver Logs:${NC}"
echo "  • Todos:    docker-compose logs -f"
echo "  • API:      docker-compose logs -f api"
echo "  • Web:      docker-compose logs -f web"
echo ""

echo -e "${BLUE}🛠️  Comandos Úteis:${NC}"
echo "  • Parar tudo:        docker-compose down"
echo "  • Reiniciar API:     docker-compose restart api"
echo "  • Ver containers:    docker-compose ps"
echo "  • Prisma Studio:     docker-compose exec api npx prisma studio"
echo ""

echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
echo "  1. Configure uma API Key real da Retell AI em .env"
echo "     Obtenha em: https://beta.retellai.com/"
echo ""
echo "  2. Para chamadas telefônicas, configure Twilio:"
echo "     - TWILIO_ACCOUNT_SID"
echo "     - TWILIO_AUTH_TOKEN"
echo ""
echo "  3. Após alterar .env, reinicie: docker-compose restart"
echo ""

echo -e "${GREEN}🚀 Próximos passos:${NC}"
echo "  1. Abra http://localhost:3000 no navegador"
echo "  2. Crie sua conta"
echo "  3. Crie seu primeiro agente de voz AI!"
echo "  4. Leia QUICKSTART.md para mais detalhes"
echo ""

# Oferecer abrir browser
read -p "Deseja abrir o frontend no navegador agora? (y/n): " OPEN_BROWSER

if [[ "$OPEN_BROWSER" =~ ^[Yy]$ ]]; then
    if command -v xdg-open &> /dev/null; then
        xdg-open http://localhost:3000
    elif command -v open &> /dev/null; then
        open http://localhost:3000
    else
        log_info "Abra manualmente: http://localhost:3000"
    fi
fi

exit 0
