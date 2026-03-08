variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
}

variable "backend_service_account_id" {
  description = "Service account ID for backend"
  type        = string
  default     = "stun-backend"
}

variable "frontend_service_account_id" {
  description = "Service account ID for frontend"
  type        = string
  default     = "stun-frontend"
}
