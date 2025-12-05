###
# FASE 6.1: TERRAFORM VARIABLES
# Auto-Model Router: GPT-5.1 Codex (DevOps/IaC/Terraform)
###

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (development, staging, production)"
  type        = string
  
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be development, staging, or production."
  }
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
}

variable "acm_certificate_arn" {
  description = "ARN of ACM certificate for HTTPS"
  type        = string
}

###############################################################################
# VPC Configuration
###############################################################################

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets"
  type        = list(string)
  default     = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
}

variable "database_subnet_cidrs" {
  description = "CIDR blocks for database subnets"
  type        = list(string)
  default     = ["10.0.21.0/24", "10.0.22.0/24", "10.0.23.0/24"]
}

###############################################################################
# RDS Configuration
###############################################################################

variable "rds_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.medium"
}

variable "rds_allocated_storage" {
  description = "RDS allocated storage (GB)"
  type        = number
  default     = 100
}

variable "rds_max_allocated_storage" {
  description = "RDS max allocated storage for autoscaling (GB)"
  type        = number
  default     = 500
}

variable "rds_username" {
  description = "RDS master username"
  type        = string
  default     = "retell_admin"
  sensitive   = true
}

variable "rds_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}

###############################################################################
# Redis Configuration
###############################################################################

variable "redis_node_type" {
  description = "Redis node type"
  type        = string
  default     = "cache.t3.medium"
}

variable "redis_num_nodes" {
  description = "Number of Redis cache nodes"
  type        = number
  default     = 1
}

variable "redis_auth_token" {
  description = "Redis authentication token"
  type        = string
  sensitive   = true
}

###############################################################################
# ECS API Service Configuration
###############################################################################

variable "api_cpu" {
  description = "CPU units for API container (1024 = 1 vCPU)"
  type        = number
  default     = 1024
}

variable "api_memory" {
  description = "Memory for API container (MB)"
  type        = number
  default     = 2048
}

variable "api_desired_count" {
  description = "Desired number of API tasks"
  type        = number
  default     = 2
}

variable "api_min_capacity" {
  description = "Minimum number of API tasks"
  type        = number
  default     = 2
}

variable "api_max_capacity" {
  description = "Maximum number of API tasks"
  type        = number
  default     = 10
}

###############################################################################
# ECS Web Service Configuration
###############################################################################

variable "web_cpu" {
  description = "CPU units for Web container"
  type        = number
  default     = 512
}

variable "web_memory" {
  description = "Memory for Web container (MB)"
  type        = number
  default     = 1024
}

variable "web_desired_count" {
  description = "Desired number of Web tasks"
  type        = number
  default     = 2
}

variable "web_min_capacity" {
  description = "Minimum number of Web tasks"
  type        = number
  default     = 2
}

variable "web_max_capacity" {
  description = "Maximum number of Web tasks"
  type        = number
  default     = 6
}

###############################################################################
# Secrets
###############################################################################

variable "jwt_secret_arn" {
  description = "ARN of JWT secret in AWS Secrets Manager"
  type        = string
  sensitive   = true
}

variable "retell_api_key_arn" {
  description = "ARN of Retell API key in AWS Secrets Manager"
  type        = string
  sensitive   = true
}

variable "twilio_auth_token_arn" {
  description = "ARN of Twilio auth token in AWS Secrets Manager"
  type        = string
  sensitive   = true
}

###############################################################################
# Monitoring
###############################################################################

variable "sns_topic_arn" {
  description = "SNS topic ARN for CloudWatch alarms"
  type        = string
}
