###
# FASE 6.1: TERRAFORM STAGING ENVIRONMENT
# Auto-Model Router: GPT-5.1 Codex (DevOps/IaC/Config)
###

environment = "staging"
aws_region  = "us-east-1"

domain_name         = "staging.retellai-mvp.com"
acm_certificate_arn = "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID"

# VPC
vpc_cidr             = "10.1.0.0/16"
public_subnet_cidrs  = ["10.1.1.0/24", "10.1.2.0/24", "10.1.3.0/24"]
private_subnet_cidrs = ["10.1.11.0/24", "10.1.12.0/24", "10.1.13.0/24"]
database_subnet_cidrs = ["10.1.21.0/24", "10.1.22.0/24", "10.1.23.0/24"]

# RDS - Staging (custo otimizado)
rds_instance_class        = "db.t3.large"  # 2 vCPU, 8 GB RAM
rds_allocated_storage     = 100
rds_max_allocated_storage = 300
rds_username              = "retell_admin"

# Redis - Staging
redis_node_type = "cache.t3.medium"  # 2 vCPU, 3.09 GB RAM
redis_num_nodes = 1

# ECS API Service - Staging
api_cpu           = 1024  # 1 vCPU
api_memory        = 2048  # 2 GB
api_desired_count = 2
api_min_capacity  = 1
api_max_capacity  = 4

# ECS Web Service - Staging
web_cpu           = 512   # 0.5 vCPU
web_memory        = 1024  # 1 GB
web_desired_count = 2
web_min_capacity  = 1
web_max_capacity  = 4

# Secrets (ARNs)
jwt_secret_arn        = "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:staging/jwt-secret-XXXXX"
retell_api_key_arn    = "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:staging/retell-api-key-XXXXX"
twilio_auth_token_arn = "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:staging/twilio-auth-token-XXXXX"

# Monitoring
sns_topic_arn = "arn:aws:sns:us-east-1:ACCOUNT_ID:retell-staging-alerts"
