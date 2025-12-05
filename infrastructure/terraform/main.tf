###
# FASE 6.1: INFRAESTRUTURA AWS - TERRAFORM MAIN
# Auto-Model Router: GPT-5.1 Codex (DevOps/IaC/Terraform)
# 
# Configuração principal da infraestrutura AWS para Retell AI MVP
###

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend S3 para state remoto
  backend "s3" {
    bucket         = "retell-mvp-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "retell-mvp-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Retell-AI-MVP"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# Locals
locals {
  name_prefix = "retell-${var.environment}"
  
  common_tags = {
    Project     = "Retell-AI-MVP"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }

  azs = slice(data.aws_availability_zones.available.names, 0, 3)
}

###############################################################################
# VPC & NETWORKING
###############################################################################

module "vpc" {
  source = "./modules/vpc"

  name_prefix = local.name_prefix
  cidr        = var.vpc_cidr
  azs         = local.azs

  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  database_subnet_cidrs = var.database_subnet_cidrs

  enable_nat_gateway   = true
  single_nat_gateway   = var.environment != "production"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = local.common_tags
}

###############################################################################
# SECURITY GROUPS
###############################################################################

module "security_groups" {
  source = "./modules/security-groups"

  name_prefix = local.name_prefix
  vpc_id      = module.vpc.vpc_id

  tags = local.common_tags
}

###############################################################################
# RDS - POSTGRESQL
###############################################################################

module "rds" {
  source = "./modules/rds"

  identifier     = "${local.name_prefix}-postgres"
  engine_version = "15.4"
  instance_class = var.rds_instance_class

  allocated_storage     = var.rds_allocated_storage
  max_allocated_storage = var.rds_max_allocated_storage
  storage_encrypted     = true

  database_name = "retell"
  username      = var.rds_username
  password      = var.rds_password # Usar AWS Secrets Manager em produção

  vpc_security_group_ids = [module.security_groups.rds_sg_id]
  db_subnet_group_name   = module.vpc.database_subnet_group_name

  backup_retention_period = var.environment == "production" ? 30 : 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "mon:04:00-mon:05:00"

  multi_az               = var.environment == "production"
  deletion_protection    = var.environment == "production"
  skip_final_snapshot    = var.environment != "production"
  final_snapshot_identifier = var.environment == "production" ? "${local.name_prefix}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  performance_insights_enabled    = true

  tags = local.common_tags
}

###############################################################################
# ELASTICACHE - REDIS
###############################################################################

module "redis" {
  source = "./modules/elasticache"

  cluster_id           = "${local.name_prefix}-redis"
  engine_version       = "7.0"
  node_type            = var.redis_node_type
  num_cache_nodes      = var.redis_num_nodes
  parameter_group_name = "default.redis7"

  subnet_group_name      = module.vpc.elasticache_subnet_group_name
  security_group_ids     = [module.security_groups.redis_sg_id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                 = var.redis_auth_token

  snapshot_retention_limit = var.environment == "production" ? 5 : 1
  snapshot_window         = "03:00-05:00"
  maintenance_window      = "mon:05:00-mon:07:00"

  tags = local.common_tags
}

###############################################################################
# ECS CLUSTER
###############################################################################

module "ecs" {
  source = "./modules/ecs"

  cluster_name = "${local.name_prefix}-cluster"

  # Container Insights
  container_insights = var.environment == "production"

  tags = local.common_tags
}

###############################################################################
# ECR - DOCKER REGISTRY
###############################################################################

module "ecr" {
  source = "./modules/ecr"

  repositories = [
    {
      name = "${local.name_prefix}/api"
      scan_on_push = true
    },
    {
      name = "${local.name_prefix}/web"
      scan_on_push = true
    }
  ]

  lifecycle_policy = {
    untagged_image_days = 7
    tagged_image_count  = 10
  }

  tags = local.common_tags
}

###############################################################################
# APPLICATION LOAD BALANCER
###############################################################################

module "alb" {
  source = "./modules/alb"

  name_prefix = local.name_prefix
  vpc_id      = module.vpc.vpc_id
  subnets     = module.vpc.public_subnet_ids

  security_groups = [module.security_groups.alb_sg_id]

  enable_deletion_protection = var.environment == "production"
  enable_http2              = true

  # SSL Certificate (assumindo ACM certificate já existe)
  certificate_arn = var.acm_certificate_arn

  tags = local.common_tags
}

###############################################################################
# ECS SERVICES
###############################################################################

# API Service
module "ecs_service_api" {
  source = "./modules/ecs-service"

  name         = "${local.name_prefix}-api"
  cluster_id   = module.ecs.cluster_id
  vpc_id       = module.vpc.vpc_id
  subnets      = module.vpc.private_subnet_ids

  # Task Definition
  container_name  = "api"
  container_image = "${module.ecr.repository_urls["${local.name_prefix}/api"]}:latest"
  container_port  = 3000
  cpu             = var.api_cpu
  memory          = var.api_memory

  # Environment Variables
  environment_variables = {
    NODE_ENV     = var.environment
    PORT         = "3000"
    DATABASE_URL = "postgresql://${var.rds_username}:${var.rds_password}@${module.rds.endpoint}/${module.rds.database_name}"
    REDIS_URL    = "redis://:${var.redis_auth_token}@${module.redis.endpoint}:6379"
  }

  # Secrets (from AWS Secrets Manager)
  secrets = {
    JWT_SECRET       = var.jwt_secret_arn
    RETELL_API_KEY   = var.retell_api_key_arn
    TWILIO_AUTH_TOKEN = var.twilio_auth_token_arn
  }

  # Service Configuration
  desired_count = var.api_desired_count
  min_capacity  = var.api_min_capacity
  max_capacity  = var.api_max_capacity

  # Auto Scaling
  autoscaling_cpu_target    = 70
  autoscaling_memory_target = 80

  # Health Check
  health_check = {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }

  # Load Balancer
  target_group_arn = module.alb.api_target_group_arn
  security_groups  = [module.security_groups.ecs_api_sg_id]

  tags = local.common_tags
}

# Web Service
module "ecs_service_web" {
  source = "./modules/ecs-service"

  name         = "${local.name_prefix}-web"
  cluster_id   = module.ecs.cluster_id
  vpc_id       = module.vpc.vpc_id
  subnets      = module.vpc.private_subnet_ids

  # Task Definition
  container_name  = "web"
  container_image = "${module.ecr.repository_urls["${local.name_prefix}/web"]}:latest"
  container_port  = 3000
  cpu             = var.web_cpu
  memory          = var.web_memory

  # Environment Variables
  environment_variables = {
    NODE_ENV            = var.environment
    NEXT_PUBLIC_API_URL = "https://api.${var.domain_name}"
  }

  # Service Configuration
  desired_count = var.web_desired_count
  min_capacity  = var.web_min_capacity
  max_capacity  = var.web_max_capacity

  # Auto Scaling
  autoscaling_cpu_target = 70

  # Health Check
  health_check = {
    path                = "/api/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200"
  }

  # Load Balancer
  target_group_arn = module.alb.web_target_group_arn
  security_groups  = [module.security_groups.ecs_web_sg_id]

  tags = local.common_tags
}

###############################################################################
# S3 - STORAGE
###############################################################################

module "s3" {
  source = "./modules/s3"

  buckets = [
    {
      name = "${local.name_prefix}-recordings"
      versioning = true
      lifecycle_rules = [
        {
          id      = "archive-old-recordings"
          enabled = true
          transition_days = 90
          storage_class   = "GLACIER"
        }
      ]
    },
    {
      name = "${local.name_prefix}-backups"
      versioning = true
      lifecycle_rules = [
        {
          id      = "expire-old-backups"
          enabled = true
          expiration_days = 90
        }
      ]
    }
  ]

  tags = local.common_tags
}

###############################################################################
# CLOUDWATCH - MONITORING
###############################################################################

module "cloudwatch" {
  source = "./modules/cloudwatch"

  name_prefix = local.name_prefix

  # Log Groups
  log_groups = [
    {
      name              = "/ecs/${local.name_prefix}/api"
      retention_in_days = var.environment == "production" ? 30 : 7
    },
    {
      name              = "/ecs/${local.name_prefix}/web"
      retention_in_days = var.environment == "production" ? 30 : 7
    }
  ]

  # Alarms
  alarms = [
    {
      name                = "${local.name_prefix}-api-cpu-high"
      comparison_operator = "GreaterThanThreshold"
      evaluation_periods  = 2
      metric_name         = "CPUUtilization"
      namespace           = "AWS/ECS"
      period              = 300
      statistic           = "Average"
      threshold           = 80
      alarm_description   = "API CPU usage is too high"
      alarm_actions       = [var.sns_topic_arn]
    },
    {
      name                = "${local.name_prefix}-rds-cpu-high"
      comparison_operator = "GreaterThanThreshold"
      evaluation_periods  = 2
      metric_name         = "CPUUtilization"
      namespace           = "AWS/RDS"
      period              = 300
      statistic           = "Average"
      threshold           = 80
      alarm_description   = "RDS CPU usage is too high"
      alarm_actions       = [var.sns_topic_arn]
    }
  ]

  tags = local.common_tags
}

###############################################################################
# OUTPUTS
###############################################################################

output "vpc_id" {
  value = module.vpc.vpc_id
}

output "alb_dns_name" {
  value = module.alb.dns_name
}

output "rds_endpoint" {
  value = module.rds.endpoint
}

output "redis_endpoint" {
  value = module.redis.endpoint
}

output "ecr_repository_urls" {
  value = module.ecr.repository_urls
}

output "ecs_cluster_name" {
  value = module.ecs.cluster_name
}
