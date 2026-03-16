param(
  [Parameter(Mandatory = $false)]
  [ValidateSet("dev", "prod")]
  [string]$Environment,
  
  [Parameter(Mandatory = $false)]
  [ValidateSet("both", "backend", "frontend")]
  [string]$Build = "both"
)

$ErrorActionPreference = "Stop"

# ============================================================================
# STUN Build + Deploy Script (Windows)
# ============================================================================
# Usage:
#   .\deploy.ps1 -Environment dev                    # Build both, deploy dev
#   .\deploy.ps1 -Environment dev -Build backend     # Build backend only
#   .\deploy.ps1 -Environment dev -Build frontend    # Build frontend only
#
# Industry Standard Pattern (aligns with deploy.sh):
# 1. Cloud Build: gcloud builds submit for backend (if -Build backend or both)
# 2. Cloud Build: gcloud builds submit for frontend (if -Build frontend or both)
# 3. Terraform: Update Cloud Run with :latest images
# 4. Health Check: Verify deployment
# ============================================================================

function Write-Info($msg) { Write-Host "[INFO]  $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Write-Err($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }
function Write-Sec($msg) { Write-Host "`n[===] $msg" -ForegroundColor Cyan }

if (-not $Environment) {
  $Environment = Read-Host "Enter environment (dev/prod)"
}

if ($Environment -ne "dev" -and $Environment -ne "prod") {
  Write-Err "Invalid environment. Use dev or prod"
  exit 1
}

Write-Sec "Deployment: $Environment"
Write-Info "Build target: $Build"

# Paths
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$infraDir = Split-Path -Parent $scriptDir
$rootDir = Split-Path -Parent $infraDir
$envDir = Join-Path $infraDir "environments\$Environment"

# Validate GCP project
Write-Info "Checking GCP project..."
$projectId = (gcloud config get-value project 2>$null).Trim()
if ([string]::IsNullOrWhiteSpace($projectId)) {
  Write-Err "No active GCP project. Run: gcloud config set project YOUR_PROJECT_ID"
  exit 1
}
Write-Info "Project: $projectId"

# Get registry URL from Terraform
Write-Info "Reading Terraform configuration..."
Set-Location $envDir
$registryUrl = (terraform output -raw artifact_registry_url 2>$null).Trim()
if ([string]::IsNullOrWhiteSpace($registryUrl)) {
  Write-Err "Could not read artifact_registry_url from Terraform"
  exit 1
}
Write-Info "Registry: $registryUrl"

# ============================================================================
# BUILD BACKEND (Cloud Build)
# ============================================================================
$tag = (Get-Date -Format "yyyyMMddHHmmss")
$backendImage = "$registryUrl/stun-backend:$tag"
$frontendImage = "$registryUrl/stun-frontend:$tag"

Write-Info "Using image tag: $tag"

if ($Build -eq "both" -or $Build -eq "backend") {
  Write-Sec "Building Backend (Cloud Build)"
  Set-Location (Join-Path $rootDir "backend")

  Write-Info "Submitting to Cloud Build..."
  $backendStart = Get-Date
  gcloud builds submit --tag "$backendImage" --region=us-central1
  if ($LASTEXITCODE -ne 0) {
    Write-Err "Backend build failed"
    exit 1
  }
  $backendDuration = [Math]::Round(((Get-Date) - $backendStart).TotalSeconds)
  Write-Info "Build completed in ${backendDuration}s"
} else {
  $backendDuration = 0
}

# ============================================================================
# BUILD FRONTEND (Cloud Build)
# ============================================================================
if ($Build -eq "both" -or $Build -eq "frontend") {
  Write-Sec "Building Frontend (Cloud Build)"
  Set-Location (Join-Path $rootDir "web")

  # Get backend service URL from terraform outputs (or use the deployed one)
  $currentLoc = Get-Location
  Set-Location $envDir
  $backendUrl = (terraform output -raw backend_url 2>$null).Trim()
  Set-Location $currentLoc
  if ([string]::IsNullOrWhiteSpace($backendUrl)) {
    Write-Warn "Could not read backend_url from Terraform, using localhost"
    $backendUrl = "http://localhost:8080"
  }
  Write-Info "Backend URL for frontend build: $backendUrl"

  Write-Info "Submitting to Cloud Build..."
  $frontendStart = Get-Date
  gcloud builds submit --tag "$frontendImage" `
    --build-arg "NEXT_PUBLIC_API_BASE_URL=$backendUrl" `
    --build-arg "NEXT_PUBLIC_FIREBASE_PROJECT_ID=stun-489205" `
    --build-arg "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=stun-489205.firebaseapp.com" `
    --build-arg "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=stun-489205.appspot.com" `
    --region=us-central1
  if ($LASTEXITCODE -ne 0) {
    Write-Err "Frontend build failed"
    exit 1
  }
  $frontendDuration = [Math]::Round(((Get-Date) - $frontendStart).TotalSeconds)
  Write-Info "Build completed in ${frontendDuration}s"
} else {
  $frontendDuration = 0
}

# ============================================================================
# DEPLOY WITH TERRAFORM
# ============================================================================
Write-Sec "Deploying with Terraform"
Set-Location $envDir

Write-Info "Applying Terraform..."
$tfStart = Get-Date

# If only one side is being built, keep the other side at its currently deployed image.
if ($Build -eq "backend" -or $Build -eq "frontend") {
  Write-Info "Preserving image for unbuilt service from current state..."
  $stateJson = terraform show -json | ConvertFrom-Json
  
  # Navigate through child modules to find the service resources
  $backModule = $stateJson.values.root_module.child_modules | Where-Object { $_.address -eq 'module.backend' }
  $frontModule = $stateJson.values.root_module.child_modules | Where-Object { $_.address -eq 'module.frontend' }
  
  if ($Build -eq "backend" -and $frontModule) {
    $frontRes = $frontModule.resources | Where-Object { $_.type -eq 'google_cloud_run_v2_service' }
    if ($frontRes -and $frontRes.values.template.containers.length -gt 0) {
      $frontendImage = $frontRes.values.template.containers[0].image
      Write-Info "Preserving frontend image: $frontendImage"
    }
  }
  elseif ($Build -eq "frontend" -and $backModule) {
    $backRes = $backModule.resources | Where-Object { $_.type -eq 'google_cloud_run_v2_service' }
    if ($backRes -and $backRes.values.template.containers.length -gt 0) {
      $backendImage = $backRes.values.template.containers[0].image
      Write-Info "Preserving backend image: $backendImage"
    }
  }
}

$tfArgs = @(
  "apply",
  "-auto-approve",
  "-var=backend_image=$backendImage",
  "-var=frontend_image=$frontendImage"
)

terraform @tfArgs

if ($LASTEXITCODE -ne 0) {
  Write-Err "Terraform apply failed"
  exit 1
}
$tfDuration = [Math]::Round(((Get-Date) - $tfStart).TotalSeconds)
Write-Info "Terraform applied in ${tfDuration}s"

# ============================================================================
# VERIFY DEPLOYMENT
# ============================================================================
Write-Sec "Verifying Deployment"

$backendUrl = (terraform output -raw backend_url 2>$null).Trim()
$frontendUrl = (terraform output -raw frontend_url 2>$null).Trim()

if ([string]::IsNullOrWhiteSpace($backendUrl)) {
  Write-Warn "Could not retrieve service URLs"
  exit 0
}

Write-Info "Backend:  $backendUrl"
Write-Info "Frontend: $frontendUrl"

# Health check
Write-Info "Checking backend health (up to 10 attempts)..."
$healthy = $false
for ($i = 1; $i -le 10; $i++) {
  try {
    $response = Invoke-WebRequest -Uri "$backendUrl/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
      Write-Info "Health check passed!"
      $healthy = $true
      break
    }
  }
  catch {
    # Silent continue
  }
  
  if ($i -lt 10) {
    Write-Info "  Attempt $i/10..."
    Start-Sleep -Seconds 3
  }
}

if (-not $healthy) {
  Write-Warn "Backend not responding yet (may still be scaling)"
}

Write-Sec "Deployment Complete!"
Write-Host "Timings: Backend=${backendDuration}s, Frontend=${frontendDuration}s, Terraform=${tfDuration}s" -ForegroundColor Green
Write-Host "Backend:  $backendUrl/health" -ForegroundColor Cyan
Write-Host "Frontend: $frontendUrl" -ForegroundColor Cyan
