# Artifact Registry for container images

resource "google_artifact_registry_repository" "container_repo" {
  location      = var.region
  repository_id = var.repository_id
  description   = var.description
  format        = "DOCKER"

  labels = var.labels

  # Cleanup policy for old images
  cleanup_policy_dry_run = false
  cleanup_policies {
    id     = "delete-old-images"
    action = "DELETE"
    condition {
      tag_state  = "UNTAGGED"
      older_than = format("%ss", var.image_retention_days * 86400)
    }
  }
}

# IAM binding for Cloud Run to pull images
resource "google_artifact_registry_repository_iam_member" "cloudrun_reader" {
  count = length(var.service_account_emails)

  location   = google_artifact_registry_repository.container_repo.location
  repository = google_artifact_registry_repository.container_repo.name
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${var.service_account_emails[count.index]}"
}
