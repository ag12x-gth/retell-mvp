###
# FASE 6.1: TERRAFORM PRODUCTION ENVIRONMENT
# Auto-Model Router: GPT-5.1 Codex (DevOps/IaC/Config)
###

environment = "production"
aws_region  = "us-east-1"

domain_name         = "retellai-mvp.com"
acm_certificate_arn = "arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID"

# VPC
vpc_cidr             = "10.0.0.0/16"
public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
private_subnet_cidrs = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
database_subnet_cidrs = ["10.0.21.0/24", "10.0.22.0/24", "10.0.23.0/24"]

# RDS - Production Grade
rds_instance_class        = "db.r6g.xlarge"  # 4 vCPU, 32 GB RAM
rds_allocated_storage     = 200
rds_max_allocated_storage = 1000
rds_username              = "retell_admin"
# rds_password será fornecido via variável de ambiente ou Secrets Manager

# Redis - Production Grade
redis_node_type  = "cache.r6g.large"  # 2 vCPU, 13.07 GB RAM
redis_num_nodes  = 2  # Multi-node para HA
# redis_auth_token será fornecido via variável de ambiente

# ECS API Service - Production
api_cpu           = 2048  # 2 vCPU
api_memory        = 4096  # 4 GB
api_desired_count = 4     # Sempre 4 instâncias
api_min_capacity  = 4
api_max_capacity  = 20

# ECS Web Service - Production
web_cpu           = 1024  # 1 vCPU
web_memory        = 2048  # 2 GB
web_desired_count = 3
web_min_capacity  = 3
web_max_capacity  = 12

# Secrets (ARNs)
jwt_secret_arn        = "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:prod/jwt-secret-XXXXX"
retell_api_key_arn    = "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:prod/retell-api-key-XXXXX"
twilio_auth_token_arn = "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:prod/twilio-auth-token-XXXXX"

# Monitoring
sns_topic_arn = "arn:aws:sns:us-east-1:ACCOUNT_ID:retell-prod-alerts"
