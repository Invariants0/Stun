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
  description = "Backend container image URL"
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}

variable "frontend_image" {
  description = "Frontend container image URL"
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}
