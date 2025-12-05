#!/bin/bash

###
# FASE 6.2: SCRIPT DE ROLLBACK
# Auto-Model Router: GPT-5.1 Codex (DevOps/Bash/Rollback)
#
# Script para reverter deployment em caso de problemas
###

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validar argumentos
ENVIRONMENT=${1:-}
TARGET_TASK_DEFINITION=${2:-}

if [ -z "$ENVIRONMENT" ]; then
    log_error "Usage: ./rollback.sh <environment> [task-definition-revision]"
    log_info "Environments: staging | production"
    log_info "If task-definition-revision is not provided, will rollback to previous revision"
    exit 1
fi

log_warn "============================================"
log_warn "ROLLBACK INICIADO: $ENVIRONMENT"
log_warn "============================================"
echo ""

AWS_REGION="us-east-1"
NAME_PREFIX="retell-${ENVIRONMENT}"

# Se task definition não foi fornecida, pegar a anterior
if [ -z "$TARGET_TASK_DEFINITION" ]; then
    log_info "Getting previous task definition revision..."
    
    # Pegar revisão atual
    CURRENT_API_REVISION=$(aws ecs describe-services \
        --cluster ${NAME_PREFIX}-cluster \
        --services ${NAME_PREFIX}-api \
        --query 'services[0].taskDefinition' \
        --output text | grep -oP ':\K[0-9]+$')
    
    CURRENT_WEB_REVISION=$(aws ecs describe-services \
        --cluster ${NAME_PREFIX}-cluster \
        --services ${NAME_PREFIX}-web \
        --query 'services[0].taskDefinition' \
        --output text | grep -oP ':\K[0-9]+$')
    
    # Rollback para revisão anterior
    TARGET_API_REVISION=$((CURRENT_API_REVISION - 1))
    TARGET_WEB_REVISION=$((CURRENT_WEB_REVISION - 1))
    
    log_info "Current API revision: $CURRENT_API_REVISION -> Rolling back to: $TARGET_API_REVISION"
    log_info "Current Web revision: $CURRENT_WEB_REVISION -> Rolling back to: $TARGET_WEB_REVISION"
else
    TARGET_API_REVISION=$TARGET_TASK_DEFINITION
    TARGET_WEB_REVISION=$TARGET_TASK_DEFINITION
fi

# Confirmação
read -p "Are you sure you want to rollback to revision $TARGET_API_REVISION? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    log_warn "Rollback cancelled by user"
    exit 0
fi

# Rollback API service
log_info "Rolling back API service..."
aws ecs update-service \
    --cluster ${NAME_PREFIX}-cluster \
    --service ${NAME_PREFIX}-api \
    --task-definition ${NAME_PREFIX}-api:${TARGET_API_REVISION} \
    --force-new-deployment \
    > /dev/null

# Rollback Web service
log_info "Rolling back Web service..."
aws ecs update-service \
    --cluster ${NAME_PREFIX}-cluster \
    --service ${NAME_PREFIX}-web \
    --task-definition ${NAME_PREFIX}-web:${TARGET_WEB_REVISION} \
    --force-new-deployment \
    > /dev/null

# Aguardar stabilização
log_info "Waiting for services to stabilize..."

aws ecs wait services-stable \
    --cluster ${NAME_PREFIX}-cluster \
    --services ${NAME_PREFIX}-api ${NAME_PREFIX}-web

log_info "Rollback completed successfully!"

# Notificar Slack
if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{
            \"text\": \"⚠️ Rollback executado em *${ENVIRONMENT}*\",
            \"attachments\": [{
                \"color\": \"warning\",
                \"fields\": [
                    {\"title\": \"Environment\", \"value\": \"${ENVIRONMENT}\", \"short\": true},
                    {\"title\": \"Revision\", \"value\": \"${TARGET_API_REVISION}\", \"short\": true}
                ]
            }]
        }" \
        $SLACK_WEBHOOK_URL
fi

exit 0
