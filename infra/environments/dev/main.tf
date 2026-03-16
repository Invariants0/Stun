# Development Environment Configuration

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
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# Local variables
locals {
  environment = "dev"
  labels = {
    environment = "dev"
    managed_by  = "terraform"
    application = "stun"
  }
}

# ============================================================================
# IAM - Service Accounts and Permissions
# ============================================================================

module "iam" {
  source = "../../modules/iam"

  project_id                    = var.project_id
  backend_service_account_id    = "stun-backend-dev"
  frontend_service_account_id   = "stun-frontend-dev"
}

# ============================================================================
# Secret Manager - Sensitive Configuration
# ============================================================================

module "secrets" {
  source = "../../modules/secrets"

  environment = local.environment
  labels      = local.labels
}

# ============================================================================
# Artifact Registry - Container Images
# ============================================================================

module "artifact_registry" {
  source = "../../modules/artifact-registry"

  region        = var.region
  repository_id = "stun-dev"
  description   = "Container images for Stun development environment"
  labels        = local.labels

  image_retention_days = 7

  service_account_emails = [
    module.iam.backend_service_account_email,
    module.iam.frontend_service_account_email,
  ]
}

# ============================================================================
# Firestore - Database
# ============================================================================

module "firestore" {
  source = "../../modules/firestore"

  project_id                         = var.project_id
  location                           = var.firestore_location
  database_type                      = "FIRESTORE_NATIVE"
  concurrency_mode                   = "OPTIMISTIC"
  app_engine_integration_mode        = "DISABLED"
  point_in_time_recovery_enablement  = "POINT_IN_TIME_RECOVERY_DISABLED"
  delete_protection_state            = "DELETE_PROTECTION_DISABLED"
}

# ============================================================================
# Cloud Run - Backend Service
# ============================================================================

module "backend" {
  source = "../../modules/cloudrun"

  service_name          = "stun-backend-dev"
  location              = var.region
  image                 = var.backend_image
  service_account_email = module.iam.backend_service_account_email

  port          = 8080
  min_instances = 0
  max_instances = 5
  cpu           = "1"
  memory        = "512Mi"
  timeout_seconds = 300
  concurrency   = 80

  allow_unauthenticated = true
  ingress               = "all"

  environment_variables = {
    NODE_ENV            = "production"
    GCP_PROJECT_ID      = var.project_id
    GCP_REGION          = var.region
    BOARDS_COLLECTION   = "boards"
    VERTEX_MODEL        = "gemini-2.5-flash"
    FRONTEND_URL        = var.frontend_url
  }

  secrets = {
    GEMINI_API_KEY = {
      secret_name = module.secrets.gemini_api_key_name
      version     = "latest"
    }
    FIREBASE_SERVICE_ACCOUNT_KEY = {
      secret_name = module.secrets.firebase_service_account_name
      version     = "latest"
    }
    GOOGLE_CLIENT_ID = {
      secret_name = module.secrets.google_client_id_name
      version     = "latest"
    }
    GOOGLE_CLIENT_SECRET = {
      secret_name = module.secrets.google_client_secret_name
      version     = "latest"
    }
  }

  labels = local.labels

  depends_on = [
    module.firestore,
    module.secrets,
  ]
}

# ============================================================================
# Cloud Run - Frontend Service
# ============================================================================

module "frontend" {
  source = "../../modules/cloudrun"

  service_name          = "stun-frontend-dev"
  location              = var.region
  image                 = var.frontend_image
  service_account_email = module.iam.frontend_service_account_email

  port          = 3000
  min_instances = 0
  max_instances = 5
  cpu           = "1"
  memory        = "1Gi"
  timeout_seconds = 300
  concurrency   = 80

  allow_unauthenticated = true
  ingress               = "all"
  health_check_path     = "/"

  environment_variables = {
    NEXT_PUBLIC_API_BASE_URL        = module.backend.service_url
    NEXT_PUBLIC_FIREBASE_PROJECT_ID = var.project_id
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "${var.project_id}.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "${var.project_id}.appspot.com"
  }

  secrets = {
    NEXT_PUBLIC_FIREBASE_API_KEY = {
      secret_name = module.secrets.firebase_api_key_name
      version     = "latest"
    }
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = {
      secret_name = module.secrets.firebase_messaging_sender_id_name
      version     = "latest"
    }
    NEXT_PUBLIC_FIREBASE_APP_ID = {
      secret_name = module.secrets.firebase_app_id_name
      version     = "latest"
    }
  }

  labels = local.labels

  depends_on = [
    module.backend,
  ]
}
