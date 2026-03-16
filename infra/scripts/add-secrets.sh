#!/bin/bash
# Script to add secrets to Google Secret Manager
# This script prompts for secret values and adds them securely

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Get environment
if [ -z "$1" ]; then
    read -p "Enter environment (dev/prod): " ENV
else
    ENV=$1
fi

if [ "$ENV" != "dev" ] && [ "$ENV" != "prod" ]; then
    echo "Invalid environment. Must be 'dev' or 'prod'"
    exit 1
fi

log_info "Adding secrets for $ENV environment..."

# Gemini API Key
log_info "Adding Gemini API Key..."
read -sp "Enter Gemini API Key: " GEMINI_KEY
echo ""
echo -n "$GEMINI_KEY" | gcloud secrets versions add "$ENV-gemini-api-key" --data-file=-
log_info "Gemini API Key added!"

# Firebase Service Account
log_info "Adding Firebase Service Account..."
read -p "Enter path to Firebase service account JSON file: " FIREBASE_PATH
if [ -f "$FIREBASE_PATH" ]; then
    cat "$FIREBASE_PATH" | gcloud secrets versions add "$ENV-firebase-service-account" --data-file=-
    log_info "Firebase Service Account added!"
else
    log_warn "File not found: $FIREBASE_PATH, skipping..."
fi

# Google OAuth Client ID
log_info "Adding Google OAuth Client ID..."
read -p "Enter Google OAuth Client ID: " CLIENT_ID
echo -n "$CLIENT_ID" | gcloud secrets versions add "$ENV-google-client-id" --data-file=-
log_info "Google OAuth Client ID added!"

# Google OAuth Client Secret
log_info "Adding Google OAuth Client Secret..."
read -sp "Enter Google OAuth Client Secret: " CLIENT_SECRET
echo ""
echo -n "$CLIENT_SECRET" | gcloud secrets versions add "$ENV-google-client-secret" --data-file=-
log_info "Google OAuth Client Secret added!"

# Firebase API Key
log_info "Adding Firebase API Key..."
read -p "Enter Firebase API Key: " FIREBASE_API_KEY
echo -n "$FIREBASE_API_KEY" | gcloud secrets versions add "$ENV-firebase-api-key" --data-file=-
log_info "Firebase API Key added!"

# Firebase Messaging Sender ID
log_info "Adding Firebase Messaging Sender ID..."
read -p "Enter Firebase Messaging Sender ID: " SENDER_ID
echo -n "$SENDER_ID" | gcloud secrets versions add "$ENV-firebase-messaging-sender-id" --data-file=-
log_info "Firebase Messaging Sender ID added!"

# Firebase App ID
log_info "Adding Firebase App ID..."
read -p "Enter Firebase App ID: " APP_ID
echo -n "$APP_ID" | gcloud secrets versions add "$ENV-firebase-app-id" --data-file=-
log_info "Firebase App ID added!"

log_info "All secrets added successfully!"
log_info "You can now deploy your Cloud Run services."
