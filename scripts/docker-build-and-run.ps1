param(
  [Parameter(Mandatory = $false)]
  [ValidateSet("build-all", "build-backend", "build-frontend", "run-backend", "run-frontend", "run-all", "stop-all")]
  [string]$Action = "build-all"
)

$ErrorActionPreference = "Stop"
$rootDir = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }
function Write-Success($msg) { Write-Host "[PASS] $msg" -ForegroundColor Cyan }

Write-Info "Docker Build & Run Manager"
Write-Info "=================================================="

# Build Backend Image
function Build-Backend {
  Write-Info "Building Backend Docker image..."
  Set-Location "$rootDir\backend"
  
  Write-Host "================================================== DOCKER BUILD LOGS ==================================================" -ForegroundColor Cyan
  & docker build -t stun-backend:local .
  Write-Host "==================================================== END DOCKER LOGS ====================================================" -ForegroundColor Cyan
  
  if ($LASTEXITCODE -eq 0) {
    Write-Success "Backend image built successfully"
    
    # Get image size using a simpler approach
    $imageInfo = & docker inspect stun-backend:local --format='{{.Size}}'
    if ($imageInfo) {
      $sizeGB = [math]::Round($imageInfo / 1GB, 2)
      Write-Info "Backend image size: $sizeGB GB"
    }
  } else {
    Write-Err "Backend build failed"
    exit 1
  }
}

# Build Frontend Image
function Build-Frontend {
  Write-Info "Building Frontend Docker image..."
  Set-Location "$rootDir\web"
  
  Write-Host "================================================== DOCKER BUILD LOGS ==================================================" -ForegroundColor Cyan
  & docker build -t stun-frontend:local .
  Write-Host "==================================================== END DOCKER LOGS ====================================================" -ForegroundColor Cyan
  
  if ($LASTEXITCODE -eq 0) {
    Write-Success "Frontend image built successfully"
    
    # Get image size using a simpler approach
    $imageInfo = & docker inspect stun-frontend:local --format='{{.Size}}'
    if ($imageInfo) {
      $sizeGB = [math]::Round($imageInfo / 1GB, 2)
      Write-Info "Frontend image size: $sizeGB GB"
    }
  } else {
    Write-Err "Frontend build failed"
    exit 1
  }
}

# Run Backend Container
function Run-Backend {
  Write-Info "Starting Backend container..."
  
  # Stop if already running
  $existing = docker ps -a --format "table {{.Names}}" | Select-String "stun-backend-local"
  if ($existing) {
    Write-Warn "Stopping existing backend container..."
    docker stop stun-backend-local 2>$null | Out-Null
    docker rm stun-backend-local 2>$null | Out-Null
  }
  
  # Run new container
  docker run -d `
    --name stun-backend-local `
    -p 8080:8080 `
    -e PORT=8080 `
    -e GCP_PROJECT_ID=stun-489205 `
    -e GEMINI_API_KEY=test-key `
    stun-backend:local
  
  if ($LASTEXITCODE -eq 0) {
    Write-Success "Backend container started on http://localhost:8080"
    Start-Sleep -Seconds 2
    
    # Test health endpoint
    try {
      $response = curl.exe http://localhost:8080/health 2>&1
      if ($response -match "status") {
        Write-Success "Backend health check passed: $response"
      }
    } catch {
      Write-Warn "Health check not yet available, give it a moment..."
    }
  } else {
    Write-Err "Backend container failed to start"
    exit 1
  }
}

# Run Frontend Container
function Run-Frontend {
  Write-Info "Starting Frontend container..."
  
  # Stop if already running
  $existing = docker ps -a --format "table {{.Names}}" | Select-String "stun-frontend-local"
  if ($existing) {
    Write-Warn "Stopping existing frontend container..."
    docker stop stun-frontend-local 2>$null | Out-Null
    docker rm stun-frontend-local 2>$null | Out-Null
  }
  
  # Run new container
  docker run -d `
    --name stun-frontend-local `
    -p 3000:3000 `
    stun-frontend:local
  
  if ($LASTEXITCODE -eq 0) {
    Write-Success "Frontend container started on http://localhost:3000"
    Start-Sleep -Seconds 3
    
    # Test frontend endpoint
    try {
      $response = curl.exe http://localhost:3000/ 2>&1 | Select-String "<!DOCTYPE" | Select-Object -First 1
      if ($response) {
        Write-Success "Frontend is responding with HTML"
      }
    } catch {
      Write-Warn "Frontend not yet available, give it a moment..."
    }
  } else {
    Write-Err "Frontend container failed to start"
    exit 1
  }
}

# Stop All Containers
function Stop-All {
  Write-Info "Stopping all Stun containers..."
  
  docker stop stun-backend-local 2>$null | Out-Null
  docker stop stun-frontend-local 2>$null | Out-Null
  docker rm stun-backend-local 2>$null | Out-Null
  docker rm stun-frontend-local 2>$null | Out-Null
  
  Write-Success "All containers stopped"
}

# Show Images and Running Containers
function Show-Status {
  Write-Info "=== Docker Images ==="
  docker images | Select-String "stun-"
  
  Write-Info ""
  Write-Info "=== Running Containers ==="
  $containers = docker ps | Select-String "stun-" 2>$null
  if ($containers) {
    Write-Info $containers
  } else {
    Write-Info "No Stun containers running"
  }
  
  Write-Info ""
  Write-Info "=== URLs ==="
  Write-Info "Backend:  http://localhost:8080/health"
  Write-Info "Frontend: http://localhost:3000"
}

# Execute Action
Write-Info "Action: $Action"
Write-Info "=================================================="

switch ($Action) {
  "build-all" {
    Build-Backend
    Build-Frontend
  }
  "build-backend" {
    Build-Backend
  }
  "build-frontend" {
    Build-Frontend
  }
  "run-backend" {
    Run-Backend
  }
  "run-frontend" {
    Run-Frontend
  }
  "run-all" {
    Run-Backend
    Run-Frontend
  }
  "stop-all" {
    Stop-All
  }
  default {
    Write-Err "Unknown action: $Action"
  }
}

Write-Info ""
Show-Status
