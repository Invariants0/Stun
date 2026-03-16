# Firestore database configuration
# Note: Firestore database must be created manually or via gcloud
# Terraform can only manage the default database settings

# This resource manages Firestore database configuration
# The database itself should be created via:
# gcloud firestore databases create --location=LOCATION --type=firestore-native

resource "google_firestore_database" "database" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.location
  type        = var.database_type

  concurrency_mode                   = var.concurrency_mode
  app_engine_integration_mode        = var.app_engine_integration_mode
  point_in_time_recovery_enablement  = var.point_in_time_recovery_enablement
  delete_protection_state            = var.delete_protection_state

  lifecycle {
    prevent_destroy = true
  }
}

# Firestore index for presence collection
resource "google_firestore_index" "presence_index" {
  project    = var.project_id
  database   = google_firestore_database.database.name
  collection = "board_presence"

  fields {
    field_path = "boardId"
    order      = "ASCENDING"
  }

  fields {
    field_path = "lastSeen"
    order      = "DESCENDING"
  }

  fields {
    field_path = "__name__"
    order      = "DESCENDING"
  }
}
