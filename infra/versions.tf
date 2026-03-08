terraform {
  required_version = ">= 1.5.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }

  # Optional: Configure remote state backend
  # Uncomment and configure for team collaboration
  # backend "gcs" {
  #   bucket = "your-terraform-state-bucket"
  #   prefix = "stun/state"
  # }
}
