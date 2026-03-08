# Production Environment Outputs

output "backend_url" {
  description = "URL of the backend Cloud Run service"
  value       = module.backend.service_url
}

output "frontend_url" {
  description = "URL of the frontend Cloud Run service"
  value       = module.frontend.service_url
}

output "artifact_registry_url" {
  description = "URL of the Artifact Registry repository"
  value       = module.artifact_registry.repository_url
}

output "firestore_database" {
  description = "Firestore database name"
  value       = module.firestore.database_name
}

output "backend_service_account" {
  description = "Backend service account email"
  value       = module.iam.backend_service_account_email
}

output "frontend_service_account" {
  description = "Frontend service account email"
  value       = module.iam.frontend_service_account_email
}

# Secret IDs for reference
output "secrets" {
  description = "Secret Manager secret IDs"
  value = {
    gemini_api_key              = module.secrets.gemini_api_key_secret_id
    firebase_service_account    = module.secrets.firebase_service_account_secret_id
    google_client_id            = module.secrets.google_client_id_secret_id
    google_client_secret        = module.secrets.google_client_secret_secret_id
    firebase_api_key            = module.secrets.firebase_api_key_secret_id
    firebase_messaging_sender_id = module.secrets.firebase_messaging_sender_id_secret_id
    firebase_app_id             = module.secrets.firebase_app_id_secret_id
  }
}

# Production deployment information
output "deployment_info" {
  description = "Production deployment information"
  value = <<-EOT
    
    ========================================
    Stun Production Environment Deployed!
    ========================================
    
    Frontend URL: ${module.frontend.service_url}
    Backend URL:  ${module.backend.service_url}
    
    Production Features:
    - Point-in-time recovery: ENABLED
    - Delete protection: ENABLED
    - Min instances: 1 (warm start)
    - Max instances: 20
    - Enhanced resources: 2 CPU, 1-2Gi RAM
    
    Monitoring:
    - Cloud Run logs: https://console.cloud.google.com/run
    - Firestore: https://console.cloud.google.com/firestore
    - Secret Manager: https://console.cloud.google.com/security/secret-manager
    
    ========================================
  EOT
}
