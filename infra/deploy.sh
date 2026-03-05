#!/usr/bin/env bash
set -euo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-your-project-id}"
REGION="${GCP_REGION:-us-central1}"
SERVICE="stun-backend"
IMAGE="gcr.io/${PROJECT_ID}/${SERVICE}:latest"
GEMINI_API_KEY="${GEMINI_API_KEY:-}"
SERVICE_ACCOUNT="${SERVICE_ACCOUNT:-}"

cd "$(dirname "$0")/../backend"

echo "Building Docker image..."
docker build -t "${IMAGE}" .

echo "Pushing image to Container Registry..."
docker push "${IMAGE}"

echo "Deploying to Cloud Run..."

DEPLOY_ARGS=(
  --image "${IMAGE}"
  --platform managed
  --region "${REGION}"
  --allow-unauthenticated
  --memory 512Mi
  --cpu 1
  --max-instances 10
  --set-env-vars "GCP_PROJECT_ID=${PROJECT_ID},GCP_REGION=${REGION},VERTEX_MODEL=gemini-2.0-flash-exp,BOARDS_COLLECTION=boards"
)

if [ -n "${GEMINI_API_KEY}" ]; then
  DEPLOY_ARGS+=(--set-env-vars "GEMINI_API_KEY=${GEMINI_API_KEY}")
fi

if [ -n "${SERVICE_ACCOUNT}" ]; then
  DEPLOY_ARGS+=(--service-account "${SERVICE_ACCOUNT}")
fi

gcloud run deploy "${SERVICE}" "${DEPLOY_ARGS[@]}"

printf "\n✅ Deployed %s to Cloud Run in %s\n" "${SERVICE}" "${REGION}"
printf "Service URL: https://%s-%s.run.app\n" "${SERVICE}" "${REGION}"
