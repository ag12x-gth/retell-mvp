#!/bin/bash

###
# FASE 6.2: SCRIPT DE DEPLOY
# Auto-Model Router: GPT-5.1 Codex (DevOps/Bash/Deploy)
#
# Script automatizado para deploy da aplicação em ambientes AWS
###

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funções auxiliares
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
if [ -z "$ENVIRONMENT" ]; then
    log_error "Usage: ./deploy.sh <environment>"
    log_info "Environments: staging | production"
    exit 1
fi

if [[ ! "$ENVIRONMENT" =~ ^(staging|production)$ ]]; then
    log_error "Invalid environment: $ENVIRONMENT"
    log_info "Valid environments: staging, production"
    exit 1
fi

log_info "Starting deployment to $ENVIRONMENT..."

# Configurações
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
NAME_PREFIX="retell-${ENVIRONMENT}"

API_REPO="${ECR_REGISTRY}/${NAME_PREFIX}/api"
WEB_REPO="${ECR_REGISTRY}/${NAME_PREFIX}/web"

# Git commit hash para tag
GIT_SHA=$(git rev-parse --short HEAD)
IMAGE_TAG="${GIT_SHA}-$(date +%s)"

log_info "Configuration:"
echo "  - Environment: $ENVIRONMENT"
echo "  - AWS Region: $AWS_REGION"
echo "  - AWS Account: $AWS_ACCOUNT_ID"
echo "  - Image Tag: $IMAGE_TAG"
echo ""

# 1. Validar pré-requisitos
log_info "Step 1/8: Validating prerequisites..."

if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed"
    exit 1
fi

if ! command -v aws &> /dev/null; then
    log_error "AWS CLI is not installed"
    exit 1
fi

# Verificar credenciais AWS
if ! aws sts get-caller-identity &> /dev/null; then
    log_error "AWS credentials not configured"
    exit 1
fi

log_info "Prerequisites OK"

# 2. Login no ECR
log_info "Step 2/8: Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin $ECR_REGISTRY

# 3. Build da imagem API
log_info "Step 3/8: Building API Docker image..."
docker build \
    -t ${NAME_PREFIX}-api:latest \
    -t ${NAME_PREFIX}-api:${IMAGE_TAG} \
    -t ${API_REPO}:latest \
    -t ${API_REPO}:${IMAGE_TAG} \
    -f apps/api/Dockerfile \
    .

# 4. Build da imagem Web
log_info "Step 4/8: Building Web Docker image..."
docker build \
    -t ${NAME_PREFIX}-web:latest \
    -t ${NAME_PREFIX}-web:${IMAGE_TAG} \
    -t ${WEB_REPO}:latest \
    -t ${WEB_REPO}:${IMAGE_TAG} \
    --build-arg NEXT_PUBLIC_API_URL="https://api.${DOMAIN_NAME}" \
    -f apps/web/Dockerfile \
    .

# 5. Push das imagens para ECR
log_info "Step 5/8: Pushing images to ECR..."
docker push ${API_REPO}:latest
docker push ${API_REPO}:${IMAGE_TAG}
docker push ${WEB_REPO}:latest
docker push ${WEB_REPO}:${IMAGE_TAG}

# 6. Executar migrações do banco de dados
log_info "Step 6/8: Running database migrations..."

# Criar task temporária para rodar migrações
MIGRATION_TASK=$(aws ecs run-task \
    --cluster ${NAME_PREFIX}-cluster \
    --task-definition ${NAME_PREFIX}-migrations \
    --launch-type FARGATE \
    --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=DISABLED}" \
    --query 'tasks[0].taskArn' \
    --output text)

log_info "Waiting for migrations to complete (Task: ${MIGRATION_TASK})..."

# Aguardar conclusão
aws ecs wait tasks-stopped \
    --cluster ${NAME_PREFIX}-cluster \
    --tasks ${MIGRATION_TASK}

# Verificar status
MIGRATION_EXIT_CODE=$(aws ecs describe-tasks \
    --cluster ${NAME_PREFIX}-cluster \
    --tasks ${MIGRATION_TASK} \
    --query 'tasks[0].containers[0].exitCode' \
    --output text)

if [ "$MIGRATION_EXIT_CODE" != "0" ]; then
    log_error "Database migrations failed with exit code: $MIGRATION_EXIT_CODE"
    exit 1
fi

log_info "Database migrations completed successfully"

# 7. Atualizar serviços ECS
log_info "Step 7/8: Updating ECS services..."

# Atualizar serviço API
log_info "Updating API service..."
aws ecs update-service \
    --cluster ${NAME_PREFIX}-cluster \
    --service ${NAME_PREFIX}-api \
    --force-new-deployment \
    --desired-count $([ "$ENVIRONMENT" == "production" ] && echo 4 || echo 2) \
    > /dev/null

# Atualizar serviço Web
log_info "Updating Web service..."
aws ecs update-service \
    --cluster ${NAME_PREFIX}-cluster \
    --service ${NAME_PREFIX}-web \
    --force-new-deployment \
    --desired-count $([ "$ENVIRONMENT" == "production" ] && echo 3 || echo 2) \
    > /dev/null

# 8. Aguardar deployments e validar health
log_info "Step 8/8: Waiting for deployments to stabilize..."

# Aguardar API service
log_info "Waiting for API service..."
aws ecs wait services-stable \
    --cluster ${NAME_PREFIX}-cluster \
    --services ${NAME_PREFIX}-api

# Aguardar Web service
log_info "Waiting for Web service..."
aws ecs wait services-stable \
    --cluster ${NAME_PREFIX}-cluster \
    --services ${NAME_PREFIX}-web

# Validar health checks
log_info "Validating health checks..."

API_URL="https://api.${DOMAIN_NAME}/health"
WEB_URL="https://app.${DOMAIN_NAME}/api/health"

# Retry health check API (max 10 tentativas)
for i in {1..10}; do
    if curl -f -s -o /dev/null "$API_URL"; then
        log_info "API health check passed"
        break
    fi
    
    if [ $i -eq 10 ]; then
        log_error "API health check failed after 10 attempts"
        exit 1
    fi
    
    log_warn "API health check failed, retrying in 10s... (attempt $i/10)"
    sleep 10
done

# Retry health check Web
for i in {1..10}; do
    if curl -f -s -o /dev/null "$WEB_URL"; then
        log_info "Web health check passed"
        break
    fi
    
    if [ $i -eq 10 ]; then
        log_error "Web health check failed after 10 attempts"
        exit 1
    fi
    
    log_warn "Web health check failed, retrying in 10s... (attempt $i/10)"
    sleep 10
done

# Deployment bem-sucedido
echo ""
log_info "============================================"
log_info "Deployment to $ENVIRONMENT completed successfully!"
log_info "============================================"
echo ""
log_info "URLs:"
echo "  - API: https://api.${DOMAIN_NAME}"
echo "  - Web: https://app.${DOMAIN_NAME}"
echo ""
log_info "Deployment Details:"
echo "  - Image Tag: $IMAGE_TAG"
echo "  - Git SHA: $GIT_SHA"
echo "  - Timestamp: $(date)"
echo ""

# Enviar notificação para Slack (opcional)
if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{
            \"text\": \"✅ Deployment to *${ENVIRONMENT}* completed successfully!\",
            \"attachments\": [{
                \"color\": \"good\",
                \"fields\": [
                    {\"title\": \"Environment\", \"value\": \"${ENVIRONMENT}\", \"short\": true},
                    {\"title\": \"Image Tag\", \"value\": \"${IMAGE_TAG}\", \"short\": true},
                    {\"title\": \"Git SHA\", \"value\": \"${GIT_SHA}\", \"short\": true},
                    {\"title\": \"Deployed By\", \"value\": \"$(whoami)\", \"short\": true}
                ]
            }]
        }" \
        $SLACK_WEBHOOK_URL
fi

exit 0
