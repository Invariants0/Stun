# Secret Manager for sensitive configuration

# Gemini API Key
resource "google_secret_manager_secret" "gemini_api_key" {
  secret_id = "${var.environment}-gemini-api-key"

  replication {
    auto {}
  }

  labels = var.labels
}

# Firebase Service Account Key
resource "google_secret_manager_secret" "firebase_service_account" {
  secret_id = "${var.environment}-firebase-service-account"

  replication {
    auto {}
  }

  labels = var.labels
}

# Google OAuth Client ID
resource "google_secret_manager_secret" "google_client_id" {
  secret_id = "${var.environment}-google-client-id"

  replication {
    auto {}
  }

  labels = var.labels
}

# Google OAuth Client Secret
resource "google_secret_manager_secret" "google_client_secret" {
  secret_id = "${var.environment}-google-client-secret"

  replication {
    auto {}
  }

  labels = var.labels
}

# Firebase API Key (for frontend)
resource "google_secret_manager_secret" "firebase_api_key" {
  secret_id = "${var.environment}-firebase-api-key"

  replication {
    auto {}
  }

  labels = var.labels
}

# Firebase Messaging Sender ID
resource "google_secret_manager_secret" "firebase_messaging_sender_id" {
  secret_id = "${var.environment}-firebase-messaging-sender-id"

  replication {
    auto {}
  }

  labels = var.labels
}

# Firebase App ID
resource "google_secret_manager_secret" "firebase_app_id" {
  secret_id = "${var.environment}-firebase-app-id"

  replication {
    auto {}
  }

  labels = var.labels
}

# Note: Secret versions must be created manually or via separate process
# Terraform does not store secret values in state for security
