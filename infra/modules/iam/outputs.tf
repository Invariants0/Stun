output "backend_service_account_email" {
  description = "Email of the backend service account"
  value       = google_service_account.backend.email
}

output "frontend_service_account_email" {
  description = "Email of the frontend service account"
  value       = google_service_account.frontend.email
}

output "backend_service_account_id" {
  description = "ID of the backend service account"
  value       = google_service_account.backend.account_id
}

output "frontend_service_account_id" {
  description = "ID of the frontend service account"
  value       = google_service_account.frontend.account_id
}
