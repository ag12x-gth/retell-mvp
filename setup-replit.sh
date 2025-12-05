#!/bin/bash

# ============================================================
# RETELL MVP - Setup Automático Replit
# ============================================================

echo "============================================================"
echo "  RETELL MVP - Setup Replit"
echo "============================================================"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para log
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# ============================================================
# 1. Verificar Node.js
# ============================================================

log_info "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    log_error "Node.js não encontrado!"
    exit 1
fi

NODE_VERSION=$(node --version)
log_info "Node.js: $NODE_VERSION"
echo ""

# ============================================================
# 2. Instalar dependências
# ============================================================

log_info "Instalando dependências npm..."
npm install --legacy-peer-deps --production=false

if [ $? -ne 0 ]; then
    log_error "Falha ao instalar dependências"
    exit 1
fi

log_info "Dependências instaladas!"
echo ""

# ============================================================
# 3. Configurar Prisma
# ============================================================

log_info "Configurando Prisma..."

# Gerar Prisma Client
npx prisma generate

if [ $? -ne 0 ]; then
    log_warn "Aviso ao gerar Prisma Client"
fi

# Executar migrations
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    log_warn "Tentando criar migrations..."
    npx prisma migrate dev --name init
fi

# Seed do banco de dados
log_info "Populando banco de dados..."
npx prisma db seed

log_info "Prisma configurado!"
echo ""

# ============================================================
# 4. Verificar variáveis de ambiente
# ============================================================

log_info "Verificando variáveis de ambiente..."

MISSING_VARS=()

# Verificar Twilio
if [ -z "$TWILIO_ACCOUNT_SID" ]; then
    MISSING_VARS+=("TWILIO_ACCOUNT_SID")
fi

if [ -z "$TWILIO_AUTH_TOKEN" ]; then
    MISSING_VARS+=("TWILIO_AUTH_TOKEN")
fi

if [ -z "$TWILIO_PHONE_NUMBER" ]; then
    MISSING_VARS+=("TWILIO_PHONE_NUMBER")
fi

# Verificar Retell.ai
if [ -z "$RETELL_API_KEY" ]; then
    MISSING_VARS+=("RETELL_API_KEY")
fi

# Verificar OpenAI
if [ -z "$OPENAI_API_KEY" ]; then
    MISSING_VARS+=("OPENAI_API_KEY")
fi

# Verificar JWT
if [ -z "$JWT_SECRET" ]; then
    MISSING_VARS+=("JWT_SECRET")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    log_warn "Variáveis faltando (configure no Replit Secrets):"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo ""
    log_warn "Acesse: Secrets (🔒) no menu lateral do Replit"
    echo ""
else
    log_info "Todas as variáveis configuradas!"
    echo ""
fi

# ============================================================
# 5. Build do projeto
# ============================================================

log_info "Compilando TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    log_error "Falha ao compilar projeto"
    exit 1
fi

log_info "Build concluído!"
echo ""

# ============================================================
# 6. Obter URL do Replit
# ============================================================

if [ -n "$REPL_SLUG" ] && [ -n "$REPL_OWNER" ]; then
    REPLIT_URL="https://${REPL_SLUG}.${REPL_OWNER}.repl.co"
    log_info "URL do Replit: $REPLIT_URL"
    echo ""
    
    # Atualizar WEBHOOK_BASE_URL
    export WEBHOOK_BASE_URL="$REPLIT_URL"
    log_info "WEBHOOK_BASE_URL configurado automaticamente"
    echo ""
fi

# ============================================================
# Setup Concluído
# ============================================================

echo "============================================================"
echo -e "${GREEN}  SETUP CONCLUÍDO COM SUCESSO!${NC}"
echo "============================================================"
echo ""
echo "Próximos passos:"
echo ""
echo "1. Configure as variáveis no Replit Secrets (🔒):"
echo "   - TWILIO_ACCOUNT_SID"
echo "   - TWILIO_AUTH_TOKEN"
echo "   - TWILIO_PHONE_NUMBER"
echo "   - RETELL_API_KEY"
echo "   - OPENAI_API_KEY"
echo "   - JWT_SECRET"
echo ""
echo "2. Clique em 'Run' para iniciar o servidor"
echo ""
echo "3. Acesse APIs:"
echo "   - Swagger: $REPLIT_URL/api"
echo "   - Health:  $REPLIT_URL/health"
echo ""
echo "4. Configure webhooks:"
echo "   - Twilio:    $REPLIT_URL/webhooks/twilio/incoming-call"
echo "   - Retell.ai: $REPLIT_URL/webhooks/retell/call-events"
echo ""
echo "============================================================"
