#!/bin/bash
# Deployment script for Stun application
# Builds and deploys service images to Cloud Run with unique timestamps per build
# Usage: ./deploy.sh [dev|prod] [both|backend|frontend]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
INFRA_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get environment
if [ -z "$1" ]; then
    read -p "Enter environment (dev/prod): " ENV
else
    ENV=$1
fi

if [ "$ENV" != "dev" ] && [ "$ENV" != "prod" ]; then
    log_error "Invalid environment. Must be 'dev' or 'prod'"
    exit 1
fi

# Get build target (backend, frontend, or both)
BUILD="${2:-both}"
if [ "$BUILD" != "backend" ] && [ "$BUILD" != "frontend" ] && [ "$BUILD" != "both" ]; then
    log_error "Invalid build target. Must be 'backend', 'frontend', or 'both'"
    exit 1
fi

log_info "Deploying to $ENV environment (target: $BUILD)..."

# Get project ID
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    log_error "No project set. Run: gcloud config set project PROJECT_ID"
    exit 1
fi

log_info "Using project: $PROJECT_ID"

# Get registry URL from Terraform
cd "$INFRA_DIR/environments/$ENV"
REGISTRY_URL=$(terraform output -raw artifact_registry_url 2>/dev/null)

if [ -z "$REGISTRY_URL" ]; then
    log_error "Could not get registry URL. Has infrastructure been deployed?"
    exit 1
fi

log_info "Registry URL: $REGISTRY_URL"

# Generate unique timestamp tag
TAG=$(date +%Y%m%d%H%M%S)
BACKEND_IMAGE="$REGISTRY_URL/stun-backend:$TAG"
FRONTEND_IMAGE="$REGISTRY_URL/stun-frontend:$TAG"

log_info "Using image tag: $TAG"

# Build backend if needed
if [ "$BUILD" = "backend" ] || [ "$BUILD" = "both" ]; then
    log_info "Building backend image..."
    cd "$ROOT_DIR/backend"
    gcloud builds submit --tag "$BACKEND_IMAGE" --region=us-central1
    BUILD_BACKEND=true
else
    BUILD_BACKEND=false
fi

# Build frontend if needed
if [ "$BUILD" = "frontend" ] || [ "$BUILD" = "both" ]; then
    log_info "Building frontend image with backend URL..."
    cd "$ROOT_DIR/web"
    
    # Get backend URL for frontend build args
    BACKEND_URL=$(cd "$INFRA_DIR/environments/$ENV" && terraform output -raw backend_url 2>/dev/null)
    if [ -z "$BACKEND_URL" ]; then
        log_warn "Could not read backend_url from Terraform, using localhost"
        BACKEND_URL="http://localhost:8080"
    fi
    log_info "Backend URL for frontend build: $BACKEND_URL"
    
    gcloud builds submit --tag "$FRONTEND_IMAGE" \
        --build-arg "NEXT_PUBLIC_API_BASE_URL=$BACKEND_URL" \
        --build-arg "NEXT_PUBLIC_FIREBASE_PROJECT_ID=stun-489205" \
        --build-arg "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=stun-489205.firebaseapp.com" \
        --build-arg "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=stun-489205.appspot.com" \
        --region=us-central1
    BUILD_FRONTEND=true
else
    BUILD_FRONTEND=false
fi

# If only one service built, preserve the other's current image from state
log_info "Preparing Terraform variables..."
cd "$INFRA_DIR/environments/$ENV"

if [ "$BUILD" = "backend" ]; then
    # Read frontend's current image from state
    FRONTEND_IMAGE=$(terraform state show -json | jq -r '.values.root_module.child_modules[] | select(.address == "module.frontend") | .resources[] | select(.type == "google_cloud_run_v2_service") | .values.template.containers[0].image' 2>/dev/null || echo "")
    if [ -z "$FRONTEND_IMAGE" ]; then
        log_warn "Could not read current frontend image, using new tag"
        FRONTEND_IMAGE="$REGISTRY_URL/stun-frontend:$TAG"
    else
        log_info "Preserving frontend image: $FRONTEND_IMAGE"
    fi
elif [ "$BUILD" = "frontend" ]; then
    # Read backend's current image from state
    BACKEND_IMAGE=$(terraform state show -json | jq -r '.values.root_module.child_modules[] | select(.address == "module.backend") | .resources[] | select(.type == "google_cloud_run_v2_service") | .values.template.containers[0].image' 2>/dev/null || echo "")
    if [ -z "$BACKEND_IMAGE" ]; then
        log_warn "Could not read current backend image, using new tag"
        BACKEND_IMAGE="$REGISTRY_URL/stun-backend:$TAG"
    else
        log_info "Preserving backend image: $BACKEND_IMAGE"
    fi
fi

# Apply Terraform changes
log_info "Applying Terraform changes..."
terraform apply -auto-approve \
    -var="backend_image=$BACKEND_IMAGE" \
    -var="frontend_image=$FRONTEND_IMAGE"

# Get service URLs
BACKEND_URL=$(terraform output -raw backend_url 2>/dev/null)
FRONTEND_URL=$(terraform output -raw frontend_url 2>/dev/null)

log_info "Deployment complete!"
echo ""
log_info "Service URLs:"
echo "  Backend:  $BACKEND_URL"
echo "  Frontend: $FRONTEND_URL"
echo ""
log_info "Test backend: curl $BACKEND_URL/health"
log_info "Open frontend: $FRONTEND_URL"
