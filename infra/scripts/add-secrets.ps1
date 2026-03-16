param(
  [Parameter(Mandatory = $false)]
  [ValidateSet("dev", "prod")]
  [string]$Environment
)

$ErrorActionPreference = "Stop"

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Green }
function Write-WarnMsg($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }

if (-not $Environment) {
  $Environment = Read-Host "Enter environment (dev/prod)"
}

if ($Environment -ne "dev" -and $Environment -ne "prod") {
  throw "Invalid environment. Must be dev or prod"
}

Write-Info "Adding secrets for $Environment"

$gemini = Read-Host "Enter Gemini API Key"
$gemini | gcloud secrets versions add "$Environment-gemini-api-key" --data-file=- | Out-Null

$firebasePath = Read-Host "Enter path to Firebase service account JSON"
if (Test-Path $firebasePath) {
  Get-Content -Raw $firebasePath | gcloud secrets versions add "$Environment-firebase-service-account" --data-file=- | Out-Null
} else {
  Write-WarnMsg "File not found: $firebasePath (skipped)"
}

$clientId = Read-Host "Enter Google OAuth Client ID"
$clientId | gcloud secrets versions add "$Environment-google-client-id" --data-file=- | Out-Null

$clientSecret = Read-Host "Enter Google OAuth Client Secret"
$clientSecret | gcloud secrets versions add "$Environment-google-client-secret" --data-file=- | Out-Null

$firebaseApiKey = Read-Host "Enter Firebase API Key"
$firebaseApiKey | gcloud secrets versions add "$Environment-firebase-api-key" --data-file=- | Out-Null

$senderId = Read-Host "Enter Firebase Messaging Sender ID"
$senderId | gcloud secrets versions add "$Environment-firebase-messaging-sender-id" --data-file=- | Out-Null

$appId = Read-Host "Enter Firebase App ID"
$appId | gcloud secrets versions add "$Environment-firebase-app-id" --data-file=- | Out-Null

Write-Info "All secrets added successfully"
