# STUN Development Startup Script
# Starts Firestore emulator, backend, and frontend in parallel

Write-Host '🚀 Starting STUN Development Environment...' -ForegroundColor Cyan
Write-Host ""

# Check if Firebase CLI is installed
$firebaseInstalled = Get-Command firebase -ErrorAction SilentlyContinue
if (-not $firebaseInstalled) {
    Write-Host "❌ Firebase CLI not found. Installing..." -ForegroundColor Red
    npm install -g firebase-tools
}

# Start Firestore Emulator in background
Write-Host '📦 Starting Firestore Emulator on port 8081...' -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; firebase emulators:start --only firestore"

# Wait for emulator to start
Start-Sleep -Seconds 3

# Start Backend
Write-Host '🔧 Starting Backend on port 8080...' -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; bun run dev"

# Wait for backend to start
Start-Sleep -Seconds 2

# Start Frontend
Write-Host '🎨 Starting Frontend on port 3000...' -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd web; bun run dev"

Write-Host ""
Write-Host '✅ All services started!' -ForegroundColor Green
Write-Host ""
Write-Host '📍 Services:' -ForegroundColor Cyan
Write-Host '   Frontend:  http://localhost:3000' -ForegroundColor White
Write-Host '   Backend:   http://localhost:8080' -ForegroundColor White
Write-Host '   Firestore: http://localhost:4000 (Emulator UI)' -ForegroundColor White
Write-Host ""
Write-Host 'Press Ctrl+C to stop all services' -ForegroundColor Gray
