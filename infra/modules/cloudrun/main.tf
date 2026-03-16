# Cloud Run service module

locals {
  ingress_map = {
    all                                 = "INGRESS_TRAFFIC_ALL"
    internal                            = "INGRESS_TRAFFIC_INTERNAL_ONLY"
    internal-and-cloud-load-balancing   = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"
  }

  vpc_egress_map = {
    all-traffic         = "ALL_TRAFFIC"
    private-ranges-only = "PRIVATE_RANGES_ONLY"
  }
}

resource "google_cloud_run_v2_service" "service" {
  name     = var.service_name
  location = var.location
  ingress  = lookup(local.ingress_map, var.ingress, var.ingress)

  labels = var.labels

  template {
    service_account = var.service_account_email

    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }

    timeout = "${var.timeout_seconds}s"

    containers {
      image = var.image

      ports {
        container_port = var.port
      }

      resources {
        limits = {
          cpu    = var.cpu
          memory = var.memory
        }
        cpu_idle = true
        startup_cpu_boost = true
      }

      # Environment variables
      dynamic "env" {
        for_each = var.environment_variables
        content {
          name  = env.key
          value = env.value
        }
      }

      # Secrets as environment variables
      dynamic "env" {
        for_each = var.secrets
        content {
          name = env.key
          value_source {
            secret_key_ref {
              secret  = env.value.secret_name
              version = env.value.version
            }
          }
        }
      }

      # Startup probe
      startup_probe {
        http_get {
          path = var.health_check_path
          port = var.port
        }
        initial_delay_seconds = var.startup_probe.initial_delay_seconds
        timeout_seconds       = var.startup_probe.timeout_seconds
        period_seconds        = var.startup_probe.period_seconds
        failure_threshold     = var.startup_probe.failure_threshold
      }

      # Liveness probe
      liveness_probe {
        http_get {
          path = var.health_check_path
          port = var.port
        }
        initial_delay_seconds = var.liveness_probe.initial_delay_seconds
        timeout_seconds       = var.liveness_probe.timeout_seconds
        period_seconds        = var.liveness_probe.period_seconds
        failure_threshold     = var.liveness_probe.failure_threshold
      }
    }

    # VPC configuration (optional)
    dynamic "vpc_access" {
      for_each = var.vpc_connector != null ? [1] : []
      content {
        connector = var.vpc_connector
        egress    = lookup(local.vpc_egress_map, var.vpc_egress, var.vpc_egress)
      }
    }

    # Maximum concurrent requests per instance
    max_instance_request_concurrency = var.concurrency
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }
}

# IAM policy for public access (if enabled)
resource "google_cloud_run_v2_service_iam_member" "public_access" {
  count = var.allow_unauthenticated ? 1 : 0

  name     = google_cloud_run_v2_service.service.name
  location = google_cloud_run_v2_service.service.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}
