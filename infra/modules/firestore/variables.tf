variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
}

variable "location" {
  description = "Firestore location"
  type        = string
  default     = "us-central1"
}

variable "database_type" {
  description = "Database type (FIRESTORE_NATIVE or DATASTORE_MODE)"
  type        = string
  default     = "FIRESTORE_NATIVE"
}

variable "concurrency_mode" {
  description = "Concurrency mode (OPTIMISTIC, PESSIMISTIC, OPTIMISTIC_WITH_ENTITY_GROUPS)"
  type        = string
  default     = "OPTIMISTIC"
}

variable "app_engine_integration_mode" {
  description = "App Engine integration mode (ENABLED or DISABLED)"
  type        = string
  default     = "DISABLED"
}

variable "point_in_time_recovery_enablement" {
  description = "Point in time recovery (POINT_IN_TIME_RECOVERY_ENABLED or POINT_IN_TIME_RECOVERY_DISABLED)"
  type        = string
  default     = "POINT_IN_TIME_RECOVERY_DISABLED"
}

variable "delete_protection_state" {
  description = "Delete protection (DELETE_PROTECTION_ENABLED or DELETE_PROTECTION_DISABLED)"
  type        = string
  default     = "DELETE_PROTECTION_DISABLED"
}
