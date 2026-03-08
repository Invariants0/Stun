output "repository_id" {
  description = "The ID of the Artifact Registry repository"
  value       = google_artifact_registry_repository.container_repo.repository_id
}

output "repository_url" {
  description = "The URL of the Artifact Registry repository"
  value       = "${var.region}-docker.pkg.dev/${google_artifact_registry_repository.container_repo.project}/${google_artifact_registry_repository.container_repo.repository_id}"
}

output "location" {
  description = "The location of the repository"
  value       = google_artifact_registry_repository.container_repo.location
}
