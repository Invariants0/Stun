variable "service_name" {
  description = "Name of the Cloud Run service"
  type        = string
}

variable "location" {
  description = "Google Cloud region"
  type        = string
}

variable "image" {
  description = "Container image URL"
  type        = string
}

variable "service_account_email" {
  description = "Service account email for the Cloud Run service"
  type        = string
}

variable "environment_variables" {
  description = "Environment variables for the service"
  type        = map(string)
  default     = {}
}

variable "secrets" {
  description = "Secrets to mount as environment variables"
  type = map(object({
    secret_name = string
    version     = string
  }))
  default = {}
}

variable "port" {
  description = "Container port"
  type        = number
  default     = 8080
}

variable "min_instances" {
  description = "Minimum number of instances"
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 10
}

variable "cpu" {
  description = "CPU allocation (e.g., '1', '2')"
  type        = string
  default     = "1"
}

variable "memory" {
  description = "Memory allocation (e.g., '512Mi', '1Gi')"
  type        = string
  default     = "512Mi"
}

variable "timeout_seconds" {
  description = "Request timeout in seconds"
  type        = number
  default     = 300
}

variable "concurrency" {
  description = "Maximum concurrent requests per instance"
  type        = number
  default     = 80
}

variable "allow_unauthenticated" {
  description = "Allow unauthenticated access"
  type        = bool
  default     = true
}

variable "labels" {
  description = "Labels to apply to the service"
  type        = map(string)
  default     = {}
}

variable "ingress" {
  description = "Ingress settings (all, internal, internal-and-cloud-load-balancing)"
  type        = string
  default     = "all"
}

variable "vpc_connector" {
  description = "VPC connector name (optional)"
  type        = string
  default     = null
}

variable "vpc_egress" {
  description = "VPC egress settings (all-traffic, private-ranges-only)"
  type        = string
  default     = "private-ranges-only"
}

variable "health_check_path" {
  description = "HTTP path for startup and liveness probes"
  type        = string
  default     = "/health"
}

variable "startup_probe" {
  description = "Startup probe configuration"
  type = object({
    initial_delay_seconds = number
    timeout_seconds       = number
    period_seconds        = number
    failure_threshold     = number
  })
  default = {
    initial_delay_seconds = 60
    timeout_seconds       = 10
    period_seconds        = 5
    failure_threshold     = 10
  }
}

variable "liveness_probe" {
  description = "Liveness probe configuration"
  type = object({
    initial_delay_seconds = number
    timeout_seconds       = number
    period_seconds        = number
    failure_threshold     = number
  })
  default = {
    initial_delay_seconds = 15
    timeout_seconds       = 5
    period_seconds        = 10
    failure_threshold     = 3
  }
}
