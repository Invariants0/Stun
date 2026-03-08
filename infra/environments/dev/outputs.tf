# Development Environment Outputs

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

# Deployment instructions
output "deployment_instructions" {
  description = "Next steps for deployment"
  value = <<-EOT
    
    ========================================
    Stun Development Environment Deployed!
    ========================================
    
    Frontend URL: ${module.frontend.service_url}
    Backend URL:  ${module.backend.service_url}
    
    Next Steps:
    
    1. Add secret values to Secret Manager:
       gcloud secrets versions add ${module.secrets.gemini_api_key_secret_id} --data-file=-
       gcloud secrets versions add ${module.secrets.firebase_service_account_secret_id} --data-file=-
       gcloud secrets versions add ${module.secrets.google_client_id_secret_id} --data-file=-
       gcloud secrets versions add ${module.secrets.google_client_secret_secret_id} --data-file=-
       gcloud secrets versions add ${module.secrets.firebase_api_key_secret_id} --data-file=-
       gcloud secrets versions add ${module.secrets.firebase_messaging_sender_id_secret_id} --data-file=-
       gcloud secrets versions add ${module.secrets.firebase_app_id_secret_id} --data-file=-
    
    2. Build and push container images:
       cd backend
       gcloud builds submit --tag ${module.artifact_registry.repository_url}/stun-backend:latest
       
       cd ../web
       gcloud builds submit --tag ${module.artifact_registry.repository_url}/stun-frontend:latest
    
    3. Update Cloud Run services with new images:
       terraform apply -var="backend_image=${module.artifact_registry.repository_url}/stun-backend:latest" \
                       -var="frontend_image=${module.artifact_registry.repository_url}/stun-frontend:latest"
    
    4. Test the deployment:
       curl ${module.backend.service_url}/health
       open ${module.frontend.service_url}
    
    ========================================
  EOT
}
