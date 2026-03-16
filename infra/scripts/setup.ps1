param(
  [Parameter(Mandatory = $false)]
  [ValidateSet("dev", "prod")]
  [string]$Environment
)

$ErrorActionPreference = "Stop"

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Green }
function Write-WarnMsg($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$infraDir = Split-Path -Parent $scriptDir

Write-Info "Starting Stun infrastructure setup (Windows)..."

if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
  Write-Err "gcloud CLI not found. Install from https://cloud.google.com/sdk/docs/install"
  exit 1
}

if (-not (Get-Command terraform -ErrorAction SilentlyContinue)) {
  Write-Err "Terraform not found. Install from https://developer.hashicorp.com/terraform/install"
  exit 1
}

$projectId = Read-Host "Enter your Google Cloud Project ID"
if ([string]::IsNullOrWhiteSpace($projectId)) {
  Write-Err "Project ID cannot be empty"
  exit 1
}

Write-Info "Setting active project to $projectId"
gcloud config set project $projectId | Out-Null

Write-Info "Checking Application Default Credentials (ADC) for Terraform..."
$null = gcloud auth application-default print-access-token 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-WarnMsg "ADC not found. Running: gcloud auth application-default login"
  gcloud auth application-default login
}

Write-Info "Enabling required APIs..."
gcloud services enable `
  run.googleapis.com `
  artifactregistry.googleapis.com `
  cloudbuild.googleapis.com `
  firestore.googleapis.com `
  aiplatform.googleapis.com `
  secretmanager.googleapis.com `
  iam.googleapis.com `
  cloudresourcemanager.googleapis.com | Out-Null

Write-Info "Ensuring Firestore database exists..."
$null = gcloud firestore databases describe --database="(default)" 2>$null
$firestoreExists = ($LASTEXITCODE -eq 0)

if (-not $firestoreExists) {
  gcloud firestore databases create --location=us-central1 --type=firestore-native | Out-Null
  Write-Info "Firestore database created"
} else {
  Write-WarnMsg "Firestore database already exists, skipping"
}

if (-not $Environment) {
  $choice = Read-Host "Choose environment: dev or prod"
  $Environment = $choice
}

if ($Environment -ne "dev" -and $Environment -ne "prod") {
  Write-Err "Invalid environment. Use dev or prod"
  exit 1
}

$envDir = Join-Path $infraDir "environments\$Environment"
Set-Location $envDir

if (-not (Test-Path "terraform.tfvars")) {
  Copy-Item "terraform.tfvars.example" "terraform.tfvars"
  (Get-Content "terraform.tfvars") -replace "your-project-id", $projectId -replace "your-production-project-id", $projectId | Set-Content "terraform.tfvars"
  Write-Info "Created terraform.tfvars from template"
} else {
  Write-WarnMsg "terraform.tfvars already exists, skipping"
}

Write-Info "Initializing Terraform..."
terraform init

Write-Info "Setup complete"
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. terraform plan" -ForegroundColor Cyan
Write-Host "2. terraform apply" -ForegroundColor Cyan
Write-Host "3. .\\add-secrets.ps1 $Environment" -ForegroundColor Cyan
Write-Host "4. .\\deploy.ps1 $Environment" -ForegroundColor Cyan
