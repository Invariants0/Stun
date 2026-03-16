# Stun Infrastructure (GCP + Terraform)

This folder contains Infrastructure as Code for deploying Stun to Google Cloud Platform.

## What this infra provisions

- Cloud Run services for backend and frontend
- Artifact Registry repository for container images
- Firestore database
- Secret Manager secrets
- IAM service accounts and role bindings

**Note:** All deployment scripts are tested and working on **Windows PowerShell**. Linux/Bash scripts have equivalent functionality but require testing.

## Folder structure

- **environments/dev**: development environment entrypoint (Terraform variables, state)
- **environments/prod**: production environment entrypoint
- **modules/iam**: service accounts and IAM role bindings
- **modules/secrets**: Secret Manager resources
- **modules/artifact-registry**: container image repository configuration
- **modules/cloudrun**: Cloud Run service template (backend & frontend)
- **modules/firestore**: Firestore database and indexes
- **scripts**: deployment and setup helper scripts
  - `setup.ps1` - initializes environment (APIs, Firestore, terraform)
  - `add-secrets.ps1` - adds secrets to Secret Manager
  - `deploy.ps1` - builds images and deploys via terraform (main deployment script)

## Prerequisites

- Google Cloud SDK installed and authenticated
- Terraform >= 1.5.0
- Docker (optional if you use Cloud Build only, but recommended)
- Billing enabled for your GCP project
- IAM permissions to manage Cloud Run, Artifact Registry, Firestore, IAM, and Secret Manager

Quick checks:

```powershell
gcloud --version
terraform --version
gcloud auth login
gcloud auth application-default login
gcloud config set project YOUR_PROJECT_ID
```

## Windows (recommended)

Use the PowerShell scripts in this folder.

### 1) Initial setup (APIs, Firestore, tfvars, terraform init)

```powershell
cd infra/scripts
Set-ExecutionPolicy -Scope Process Bypass
.\setup.ps1 -Environment dev
```

Use prod when needed:

```powershell
.\setup.ps1 -Environment prod
```

### 2) First infrastructure setup for the environment

```powershell
cd ..\environments\dev
terraform plan
terraform apply
```

**Notes:**
- This first apply creates foundational resources: Firestore, Secret Manager, IAM roles, Artifact Registry
- Terraform outputs (artifact_registry_url, backend_url, etc.) become available after this
- These outputs are used by subsequent deploy scripts
- Repeat for prod when deploying prod

### 3) Add required secrets to Secret Manager

```powershell
cd ..\..\scripts
.\add-secrets.ps1 -Environment dev
```

Note: You will be prompted for each secret value. Required secrets:
- gemini-api-key (Vertex AI API key)
- firebase-service-account (Firebase service account JSON)
- google-client-id (OAuth client ID)
- google-client-secret (OAuth client secret)
- firebase-api-key (Firebase web config)
- firebase-messaging-sender-id (Firebase config)
- firebase-app-id (Firebase config)

### 4) Build and deploy app images + update Cloud Run

```powershell
# Deploy both backend and frontend
.\deploy.ps1 -Environment dev -Build both

# Deploy only backend (frontend unchanged)
.\deploy.ps1 -Environment dev -Build backend

# Deploy only frontend (backend unchanged)  
.\deploy.ps1 -Environment dev -Build frontend
```

This script:
- Generates unique timestamp-based image tags (e.g., `20260316183352`)
- Builds selected service images with Cloud Build
- Passes CORS-configured backend URL to frontend build as `NEXT_PUBLIC_API_BASE_URL`
- Pushes images to Artifact Registry
- Runs terraform apply with updated image tags
- Creates new Cloud Run revisions (guaranteed by unique tags)

**Important:** Each build produces a new Cloud Run revision automatically due to the unique image tag strategy.

### 5) Verify deployment

```powershell
cd ..\environments\dev
terraform output
```

Key outputs:
- `backend_url` - Backend service URL
- `frontend_url` - Frontend service URL  
- `artifact_registry_url` - Container registry URL
- `backend_service_account` - Backend Cloud Run service account
- `frontend_service_account` - Frontend Cloud Run service account

Verify services are healthy:

```powershell
# Check backend revision status
gcloud run services describe stun-backend-dev --region=us-central1 --project=stun-489205

# Check frontend revision status
gcloud run services describe stun-frontend-dev --region=us-central1 --project=stun-489205

# Check health endpoint
curl https://stun-backend-dev-ees5yh3pua-uc.a.run.app/health
```

## Linux/macOS (Bash)

Equivalent flow:

```bash
cd infra/scripts
chmod +x setup.sh add-secrets.sh deploy.sh
./setup.sh dev

cd ../environments/dev
terraform plan
terraform apply

cd ../../scripts
./add-secrets.sh dev

# Deploy both services
./deploy.sh dev both

# Or deploy single service
./deploy.sh dev backend
./deploy.sh dev frontend
```

**Note:** Linux bash scripts have the same functionality as Windows PowerShell scripts but have **not been tested recently**. Windows PowerShell scripts are the primary, tested deployment path. If using Linux/macOS, test thoroughly in dev environment first.

## Environment configuration

Copy the example file for each environment:

- environments/dev/terraform.tfvars.example
- environments/prod/terraform.tfvars.example

Set at minimum:
- project_id
- region
- firestore_location
- frontend_url
- backend_image
- frontend_image

For first apply, placeholder images are acceptable in dev. Then run deploy script to publish and wire real images.

Important:
- `frontend_url` is used by backend CORS and OAuth callback redirects.
- If frontend URL changes later, update `frontend_url` and re-run `terraform apply`.

## Cloud Run Revision Strategy

The deploy script uses **unique timestamp-based image tags** to guarantee new Cloud Run revisions on every build:

1. Each build gets a unique tag (format: `yyyyMMddHHmmss`)
2. Example: `stun-backend:20260316183352`
3. Terraform detects the image URL change (different tag)
4. Cloud Run automatically creates a new revision
5. Latest revision becomes ready and receives 100% traffic

**Example workflow:**
```powershell
# First deployment
.\deploy.ps1 -Environment dev -Build both
# Creates: backend:20260316180000, frontend:20260316180000
# Cloud Run revisions: backend-00001-xxx, frontend-00001-xxx

# Second deployment (10 minutes later)
.\deploy.ps1 -Environment dev -Build backend
# Builds only backend with tag: 20260316181000
# Terraform sees difference, applies update
# Cloud Run creates new backend revision: backend-00002-yyy
# Frontend remains at 20260316180000 (unchanged)
```

Benefits:
- ✅ Every build creates a new revision
- ✅ Automatic traffic switching to latest healthy revision
- ✅ Easy rollback via Cloud Run console (old revisions preserved)

## Common commands

Run plan:

```powershell
cd infra/environments/dev
terraform plan
```

If you are already in an environment directory, just run:

```powershell
terraform plan
```

Apply changes:

```powershell
terraform apply
```

Destroy environment:

```powershell
terraform destroy
```

Show current outputs:

```powershell
terraform output
```

## Notes and troubleshooting

## Notes and troubleshooting

### Deployment Issues
- If deploy script fails at terraform apply, check that both services' images exist in Artifact Registry
- Latest deployed image tag is stored in terraform state and reused for unchanged services
- Each build creates a new unique image tag (timestamp format: `yyyyMMddHHmmss`)
- New Cloud Run revisions are created only if image tag changes

### Terraform Issues
- If deploy script says it cannot read artifact_registry_url, run terraform apply once in that environment first.
- If Terraform reports "No credentials loaded", run `gcloud auth application-default login`.
- If Terraform state is corrupted, run `terraform refresh` to sync with actual GCP resources.

### Cloud Build Issues
- If Cloud Build fails on permissions, verify your account and project IAM roles.
- Check build logs: `gcloud builds log [BUILD_ID] --stream`

### Service Debugging
- Inspect service logs:

```powershell
gcloud run logs read stun-backend-dev --limit=100
gcloud run logs read stun-frontend-dev --limit=100
```

- Check service status:

```powershell
gcloud run services describe stun-backend-dev --region=us-central1
gcloud run services describe stun-frontend-dev --region=us-central1
```

- View Cloud Run revisions:

```powershell
gcloud run revisions list --service=stun-backend-dev --region=us-central1
```

### Script Testing
- **Windows PowerShell scripts:** Tested and working (primary deployment path)
- **Linux/Bash scripts:** Equivalent functionality, but not recently tested. Test thoroughly in dev before using in prod.

## Recommended deployment order

For initial setup of an environment:

1. **setup.ps1**  
   Enables required APIs, initializes Terraform, creates Firestore database

2. **terraform apply** (infrastructure)  
   Provisions: Firestore, Artifact Registry, IAM, Secret Manager, Cloud Run stubs

3. **add-secrets.ps1**  
   Populates required secrets into Secret Manager

4. **deploy.ps1** (with `-Build both`)  
   Builds backend & frontend images, deploys both services to Cloud Run

5. **Configure OAuth** (manual step)  
   Add redirect URIs to Google Cloud Console OAuth client

6. **Verify**  
   Check terraform outputs and curl `/health` endpoint

---

For subsequent deployments:

```powershell
# Deploy only backend changes
.\deploy.ps1 -Environment dev -Build backend

# Deploy only frontend changes  
.\deploy.ps1 -Environment dev -Build frontend

# Deploy both (after changes to both)
.\deploy.ps1 -Environment dev -Build both
```

Each deploy automatically creates new Cloud Run revisions with unique image tags.
