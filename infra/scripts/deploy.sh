#!/bin/bash
# Deployment script for Stun application
# Builds and deploys both backend and frontend to Cloud Run

set -e

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

log_info "Deploying to $ENV environment..."

# Get project ID
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
    log_error "No project set. Run: gcloud config set project PROJECT_ID"
    exit 1
fi

log_info "Using project: $PROJECT_ID"

# Get registry URL from Terraform
cd "environments/$ENV"
REGISTRY_URL=$(terraform output -raw artifact_registry_url 2>/dev/null)

if [ -z "$REGISTRY_URL" ]; then
    log_error "Could not get registry URL. Has infrastructure been deployed?"
    exit 1
fi

log_info "Registry URL: $REGISTRY_URL"

# Build and push backend
log_info "Building backend image..."
cd ../../../backend
gcloud builds submit --tag "$REGISTRY_URL/stun-backend:latest"

# Build and push frontend
log_info "Building frontend image..."
cd ../web
gcloud builds submit --tag "$REGISTRY_URL/stun-frontend:latest"

# Update Terraform variables
log_info "Updating Cloud Run services..."
cd ../infra/environments/$ENV

# Update terraform.tfvars
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|backend_image.*|backend_image  = \"$REGISTRY_URL/stun-backend:latest\"|" terraform.tfvars
    sed -i '' "s|frontend_image.*|frontend_image = \"$REGISTRY_URL/stun-frontend:latest\"|" terraform.tfvars
else
    sed -i "s|backend_image.*|backend_image  = \"$REGISTRY_URL/stun-backend:latest\"|" terraform.tfvars
    sed -i "s|frontend_image.*|frontend_image = \"$REGISTRY_URL/stun-frontend:latest\"|" terraform.tfvars
fi

# Apply Terraform changes
terraform apply -auto-approve

# Get service URLs
BACKEND_URL=$(terraform output -raw backend_url)
FRONTEND_URL=$(terraform output -raw frontend_url)

log_info "Deployment complete!"
echo ""
log_info "Service URLs:"
echo "  Backend:  $BACKEND_URL"
echo "  Frontend: $FRONTEND_URL"
echo ""
log_info "Test backend: curl $BACKEND_URL/health"
log_info "Open frontend: open $FRONTEND_URL"
