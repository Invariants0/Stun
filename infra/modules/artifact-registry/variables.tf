variable "region" {
  description = "Google Cloud region"
  type        = string
}

variable "repository_id" {
  description = "Artifact Registry repository ID"
  type        = string
}

variable "description" {
  description = "Repository description"
  type        = string
  default     = "Container images for Stun application"
}

variable "labels" {
  description = "Labels to apply to the repository"
  type        = map(string)
  default     = {}
}

variable "image_retention_days" {
  description = "Number of days to retain untagged images"
  type        = number
  default     = 30
}

variable "service_account_emails" {
  description = "Service account emails that need pull access"
  type        = list(string)
  default     = []
}
