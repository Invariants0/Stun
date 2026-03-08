output "gemini_api_key_secret_id" {
  description = "Secret Manager ID for Gemini API key"
  value       = google_secret_manager_secret.gemini_api_key.secret_id
}

output "firebase_service_account_secret_id" {
  description = "Secret Manager ID for Firebase service account"
  value       = google_secret_manager_secret.firebase_service_account.secret_id
}

output "google_client_id_secret_id" {
  description = "Secret Manager ID for Google OAuth client ID"
  value       = google_secret_manager_secret.google_client_id.secret_id
}

output "google_client_secret_secret_id" {
  description = "Secret Manager ID for Google OAuth client secret"
  value       = google_secret_manager_secret.google_client_secret.secret_id
}

output "firebase_api_key_secret_id" {
  description = "Secret Manager ID for Firebase API key"
  value       = google_secret_manager_secret.firebase_api_key.secret_id
}

output "firebase_messaging_sender_id_secret_id" {
  description = "Secret Manager ID for Firebase messaging sender ID"
  value       = google_secret_manager_secret.firebase_messaging_sender_id.secret_id
}

output "firebase_app_id_secret_id" {
  description = "Secret Manager ID for Firebase app ID"
  value       = google_secret_manager_secret.firebase_app_id.secret_id
}

# Full secret names for Cloud Run environment variables
output "gemini_api_key_name" {
  description = "Full secret name for Gemini API key"
  value       = google_secret_manager_secret.gemini_api_key.name
}

output "firebase_service_account_name" {
  description = "Full secret name for Firebase service account"
  value       = google_secret_manager_secret.firebase_service_account.name
}

output "google_client_id_name" {
  description = "Full secret name for Google OAuth client ID"
  value       = google_secret_manager_secret.google_client_id.name
}

output "google_client_secret_name" {
  description = "Full secret name for Google OAuth client secret"
  value       = google_secret_manager_secret.google_client_secret.name
}

output "firebase_api_key_name" {
  description = "Full secret name for Firebase API key"
  value       = google_secret_manager_secret.firebase_api_key.name
}

output "firebase_messaging_sender_id_name" {
  description = "Full secret name for Firebase messaging sender ID"
  value       = google_secret_manager_secret.firebase_messaging_sender_id.name
}

output "firebase_app_id_name" {
  description = "Full secret name for Firebase app ID"
  value       = google_secret_manager_secret.firebase_app_id.name
}
