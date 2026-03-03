#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-your-project-id}"
REGION="${GCP_REGION:-us-central1}"
SERVICE="stun-backend"
IMAGE="gcr.io/${PROJECT_ID}/${SERVICE}:latest"

cd "$(dirname "$0")/../backend"

docker build -t "${IMAGE}" .
docker push "${IMAGE}"

gcloud run deploy "${SERVICE}" \
  --image "${IMAGE}" \
  --platform managed \
  --region "${REGION}" \
  --allow-unauthenticated

printf "Deployed %s to Cloud Run in %s\n" "${SERVICE}" "${REGION}"
