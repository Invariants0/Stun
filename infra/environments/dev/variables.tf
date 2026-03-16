variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
}

variable "region" {
  description = "Google Cloud region for Cloud Run services"
  type        = string
  default     = "us-central1"
}

variable "firestore_location" {
  description = "Firestore database location"
  type        = string
  default     = "us-central1"
}

variable "backend_image" {
  description = "Backend container image URL (required - must be provided by deployment script)"
  type        = string
}

variable "frontend_image" {
  description = "Frontend container image URL (required - must be provided by deployment script)"
  type        = string
}

variable "frontend_url" {
  description = "Public frontend URL used by backend for CORS and auth redirects"
  type        = string
  default     = "https://stun-frontend-dev-ees5yh3pua-uc.a.run.app"
}
