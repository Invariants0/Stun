#!/bin/bash
# Stun Infrastructure Setup Script
# This script automates the initial setup of Google Cloud infrastructure

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main setup
main() {
    log_info "Starting Stun infrastructure setup..."
    
    # Check prerequisites
    log_info "Checking prerequisites..."
    
    if ! command_exists gcloud; then
        log_error "gcloud CLI not found. Please install: https://cloud.google.com/sdk/docs/install"
        exit 1
    fi
    
    if ! command_exists terraform; then
        log_error "Terraform not found. Please install: https://www.terraform.io/downloads"
        exit 1
    fi
    
    log_info "Prerequisites check passed!"
    
    # Get project ID
    read -p "Enter your Google Cloud Project ID: " PROJECT_ID
    
    if [ -z "$PROJECT_ID" ]; then
        log_error "Project ID cannot be empty"
        exit 1
    fi
    
    # Set project
    log_info "Setting project to $PROJECT_ID..."
    gcloud config set project "$PROJECT_ID"

    # Ensure Application Default Credentials are available for Terraform
    log_info "Checking Application Default Credentials (ADC) for Terraform..."
    if ! gcloud auth application-default print-access-token >/dev/null 2>&1; then
        log_warn "ADC not found. Running: gcloud auth application-default login"
        gcloud auth application-default login
    fi
    
    # Enable APIs
    log_info "Enabling required APIs (this may take a few minutes)..."
    gcloud services enable \
        run.googleapis.com \
        artifactregistry.googleapis.com \
        cloudbuild.googleapis.com \
        firestore.googleapis.com \
        aiplatform.googleapis.com \
        secretmanager.googleapis.com \
        iam.googleapis.com \
        cloudresourcemanager.googleapis.com
    
    log_info "APIs enabled successfully!"
    
    # Create Firestore database
    log_info "Creating Firestore database..."
    if gcloud firestore databases describe --database="(default)" >/dev/null 2>&1; then
        log_warn "Firestore database already exists, skipping..."
    else
        gcloud firestore databases create \
            --location=us-central1 \
            --type=firestore-native
        log_info "Firestore database created!"
    fi
    
    # Choose environment
    echo ""
    log_info "Choose environment to set up:"
    echo "1) Development"
    echo "2) Production"
    read -p "Enter choice (1 or 2): " ENV_CHOICE
    
    case $ENV_CHOICE in
        1)
            ENV="dev"
            ;;
        2)
            ENV="prod"
            ;;
        *)
            log_error "Invalid choice"
            exit 1
            ;;
    esac
    
    # Navigate to environment directory
    cd "$INFRA_DIR/environments/$ENV"
    
    # Create terraform.tfvars if it doesn't exist
    if [ ! -f terraform.tfvars ]; then
        log_info "Creating terraform.tfvars from example..."
        cp terraform.tfvars.example terraform.tfvars
        
        # Update project_id in terraform.tfvars
        sed -i.bak "s/your-project-id/$PROJECT_ID/g" terraform.tfvars
        rm -f terraform.tfvars.bak
        
        log_info "terraform.tfvars created. Please review and update if needed."
    else
        log_warn "terraform.tfvars already exists, skipping..."
    fi
    
    # Initialize Terraform
    log_info "Initializing Terraform..."
    terraform init
    
    log_info "Setup complete!"
    echo ""
    log_info "Next steps:"
    echo "1. Review and update terraform.tfvars if needed"
    echo "2. Run 'terraform plan' to review changes"
    echo "3. Run 'terraform apply' to create infrastructure"
    echo "4. Add secrets to Secret Manager (see DEPLOYMENT_GUIDE.md)"
    echo "5. Build and push container images"
    echo ""
    log_info "For detailed instructions, see: DEPLOY.md"
}

# Run main function
main
