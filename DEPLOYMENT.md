# 🚀 GUIA DE DEPLOYMENT - RETELL AI MVP

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Infraestrutura AWS](#infraestrutura-aws)
3. [Setup Inicial](#setup-inicial)
4. [Deploy de Aplicação](#deploy-de-aplicação)
5. [Monitoramento](#monitoramento)
6. [Rollback](#rollback)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

### Arquitetura de Deploy

```
┌─────────────────────────────────────────────────────────────┐
│                         INTERNET                             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │   Application Load    │
            │      Balancer (ALB)   │
            │  - HTTPS Termination  │
            │  - SSL Certificate    │
            └───────┬───────┬───────┘
                    │       │
        ┌───────────┘       └───────────┐
        ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│  ECS Service:    │          │  ECS Service:    │
│      API         │          │      Web         │
│  - Auto Scaling  │          │  - Auto Scaling  │
│  - 2-10 Tasks    │          │  - 2-6 Tasks     │
└─────┬────────────┘          └──────────────────┘
      │
      ├──────────┬──────────────────┐
      ▼          ▼                  ▼
┌─────────┐ ┌────────┐      ┌─────────────┐
│   RDS   │ │ Redis  │      │     S3      │
│Postgres │ │ElastiCache│   │  Storage    │
│ Multi-AZ│ │         │      │ (Recordings)│
└─────────┘ └────────┘      └─────────────┘
```

### Ambientes

| Ambiente | URL | Propósito |
|----------|-----|-----------|
| **Development** | Local | Desenvolvimento local |
| **Staging** | staging.retellai-mvp.com | Testes de integração |
| **Production** | app.retellai-mvp.com | Produção |

---

## ☁️ Infraestrutura AWS

### Componentes Principais

#### 1. VPC & Networking
- **VPC CIDR:** 10.0.0.0/16
- **Public Subnets:** 3 AZs para ALB
- **Private Subnets:** 3 AZs para ECS Tasks
- **Database Subnets:** 3 AZs para RDS

#### 2. Compute (ECS)
- **Cluster:** Fargate Spot + Fargate
- **API Service:** 2-10 tasks (auto-scaling)
- **Web Service:** 2-6 tasks (auto-scaling)

#### 3. Database (RDS PostgreSQL)
- **Produção:** db.r6g.xlarge, Multi-AZ
- **Staging:** db.t3.large, Single-AZ
- **Backup:** 30 dias (prod), 7 dias (staging)

#### 4. Cache (ElastiCache Redis)
- **Produção:** cache.r6g.large, 2 nodes
- **Staging:** cache.t3.medium, 1 node
- **Encryption:** At-rest + In-transit

#### 5. Storage (S3)
- **Recordings:** Lifecycle policy (90d → Glacier)
- **Backups:** Lifecycle policy (90d expiration)

#### 6. Monitoring
- **CloudWatch Logs:** 30d retention
- **CloudWatch Alarms:** CPU, Memory, Latency
- **Container Insights:** Habilitado em produção

---

## ⚙️ Setup Inicial

### 1. Pré-requisitos

Instalar ferramentas:

```bash
# AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Terraform
wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
unzip terraform_1.6.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# Docker
sudo apt-get update
sudo apt-get install docker.io
```

### 2. Configurar AWS Credentials

```bash
aws configure

# Output:
# AWS Access Key ID: YOUR_ACCESS_KEY
# AWS Secret Access Key: YOUR_SECRET_KEY
# Default region: us-east-1
# Default output format: json
```

### 3. Criar Secrets no AWS Secrets Manager

```bash
# JWT Secret
aws secretsmanager create-secret \
    --name prod/jwt-secret \
    --secret-string "your-super-secret-jwt-key"

# Retell API Key
aws secretsmanager create-secret \
    --name prod/retell-api-key \
    --secret-string "your-retell-api-key"

# Twilio Auth Token
aws secretsmanager create-secret \
    --name prod/twilio-auth-token \
    --secret-string "your-twilio-auth-token"
```

### 4. Provisionar Infraestrutura com Terraform

```bash
cd infrastructure/terraform

# Inicializar Terraform
terraform init

# Planejar (preview)
terraform plan -var-file=environments/production.tfvars

# Aplicar (criar recursos)
terraform apply -var-file=environments/production.tfvars
```

**Tempo estimado:** 15-20 minutos

### 5. Registrar Domínio e Configurar DNS

```bash
# Obter DNS do ALB
terraform output alb_dns_name

# Criar registros CNAME:
# api.retellai-mvp.com   -> alb-xxx.us-east-1.elb.amazonaws.com
# app.retellai-mvp.com   -> alb-xxx.us-east-1.elb.amazonaws.com
```

---

## 🚀 Deploy de Aplicação

### Deploy Automático (Recomendado)

```bash
# Tornar script executável
chmod +x scripts/deploy.sh

# Deploy para staging
./scripts/deploy.sh staging

# Deploy para production
./scripts/deploy.sh production
```

### Deploy Manual

#### 1. Build das Imagens Docker

```bash
# Login no ECR
aws ecr get-login-password --region us-east-1 | \
    docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build API
docker build -t retell-prod/api:latest -f apps/api/Dockerfile .

# Build Web
docker build -t retell-prod/web:latest -f apps/web/Dockerfile .
```

#### 2. Push para ECR

```bash
# Tag das imagens
docker tag retell-prod/api:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/retell-prod/api:latest
docker tag retell-prod/web:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/retell-prod/web:latest

# Push
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/retell-prod/api:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/retell-prod/web:latest
```

#### 3. Executar Migrações

```bash
# Criar task de migração
aws ecs run-task \
    --cluster retell-prod-cluster \
    --task-definition retell-prod-migrations \
    --launch-type FARGATE

# Aguardar conclusão
aws ecs wait tasks-stopped --cluster retell-prod-cluster --tasks TASK_ARN
```

#### 4. Atualizar Serviços ECS

```bash
# Atualizar API
aws ecs update-service \
    --cluster retell-prod-cluster \
    --service retell-prod-api \
    --force-new-deployment

# Atualizar Web
aws ecs update-service \
    --cluster retell-prod-cluster \
    --service retell-prod-web \
    --force-new-deployment
```

---

## 📊 Monitoramento

### CloudWatch Dashboards

Acessar: AWS Console → CloudWatch → Dashboards

**Métricas Principais:**
- API Latency P95
- API Error Rate
- ECS CPU/Memory Utilization
- RDS Connections
- Redis Hit Rate

### Logs

```bash
# Ver logs da API
aws logs tail /ecs/retell-prod/api --follow

# Ver logs do Web
aws logs tail /ecs/retell-prod/web --follow
```

### Alarms Configurados

| Alarm | Threshold | Action |
|-------|-----------|--------|
| API CPU High | > 80% por 10min | SNS Alert |
| RDS CPU High | > 80% por 10min | SNS Alert |
| ALB 5xx Errors | > 5 em 5min | SNS Alert |
| API Latency High | P95 > 1s | SNS Alert |

---

## ⏮️ Rollback

### Rollback Automático

```bash
chmod +x scripts/rollback.sh

# Rollback para revisão anterior
./scripts/rollback.sh production

# Rollback para revisão específica
./scripts/rollback.sh production 42
```

### Rollback Manual

```bash
# Listar task definitions
aws ecs list-task-definitions \
    --family-prefix retell-prod-api \
    --sort DESC

# Atualizar para revisão anterior
aws ecs update-service \
    --cluster retell-prod-cluster \
    --service retell-prod-api \
    --task-definition retell-prod-api:41
```

---

## 🔧 Troubleshooting

### Problema: Tasks não iniciam

**Diagnóstico:**
```bash
# Ver eventos do serviço
aws ecs describe-services \
    --cluster retell-prod-cluster \
    --services retell-prod-api \
    --query 'services[0].events[0:5]'

# Ver logs de tasks paradas
aws ecs describe-tasks \
    --cluster retell-prod-cluster \
    --tasks TASK_ARN
```

**Possíveis causas:**
- Imagem Docker não encontrada
- Secrets não configurados
- Limites de CPU/Memory insuficientes

---

### Problema: Health checks falhando

**Diagnóstico:**
```bash
# Verificar target group health
aws elbv2 describe-target-health \
    --target-group-arn TARGET_GROUP_ARN
```

**Possíveis causas:**
- Rota /health não respondendo
- Timeout muito curto
- Security group bloqueando tráfego

---

### Problema: Alto custo AWS

**Otimizações:**
1. Usar Fargate Spot (70% desconto)
2. Reduzir retention de logs (30d → 7d)
3. Lifecycle policy para S3 (mover para Glacier)
4. Reserved Instances para RDS

**Custos estimados (produção):**
- ECS Fargate: ~$150/mês
- RDS: ~$300/mês
- ElastiCache: ~$80/mês
- ALB: ~$30/mês
- S3 + Transfer: ~$20/mês
- **Total: ~$580/mês**

---

## 📞 Suporte

**Problemas de deployment:**
- Slack: #devops
- Email: devops@retell-mvp.com

**Documentação adicional:**
- [AWS ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/)
- [Terraform AWS Modules](https://registry.terraform.io/namespaces/terraform-aws-modules)
