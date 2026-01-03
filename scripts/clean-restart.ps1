# Clean Restart Script for Agent-Company
# Stops all processes, cleans database locks, and restarts fresh

Write-Host "🧹 Agent-Company Clean Restart Script" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop all Node.js processes
Write-Host "1️⃣ Stopping all Node.js processes..." -ForegroundColor Yellow
try {
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Node processes stopped" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️ No Node processes to stop" -ForegroundColor Gray
}

# Step 2: Stop all Python processes
Write-Host "2️⃣ Stopping all Python processes..." -ForegroundColor Yellow
try {
    Stop-Process -Name python -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Python processes stopped" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️ No Python processes to stop" -ForegroundColor Gray
}

# Step 3: Wait for processes to fully terminate
Write-Host "3️⃣ Waiting for processes to terminate..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Write-Host "   ✅ Processes terminated" -ForegroundColor Green

# Step 4: Clean database locks
Write-Host "4️⃣ Cleaning database locks..." -ForegroundColor Yellow
$dbFiles = @(
    "prisma\dev.db-journal",
    "prisma\.shadow.db",
    "prisma\dev.db-shm",
    "prisma\dev.db-wal"
)

foreach ($file in $dbFiles) {
    if (Test-Path $file) {
        Remove-Item -Force $file -ErrorAction SilentlyContinue
        Write-Host "   🗑️ Removed $file" -ForegroundColor Gray
    }
}
Write-Host "   ✅ Database locks cleaned" -ForegroundColor Green

# Step 5: Check if ports are free
Write-Host "5️⃣ Checking ports..." -ForegroundColor Yellow
$backendPort = 3001
$dashboardPort = 5173

$backendInUse = Get-NetTCPConnection -LocalPort $backendPort -ErrorAction SilentlyContinue
$dashboardInUse = Get-NetTCPConnection -LocalPort $dashboardPort -ErrorAction SilentlyContinue

if ($backendInUse) {
    Write-Host "   ⚠️ Port $backendPort still in use, waiting..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
} else {
    Write-Host "   ✅ Port $backendPort is free" -ForegroundColor Green
}

if ($dashboardInUse) {
    Write-Host "   ⚠️ Port $dashboardPort still in use, waiting..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
} else {
    Write-Host "   ✅ Port $dashboardPort is free" -ForegroundColor Green
}

# Step 6: Start Backend
Write-Host ""
Write-Host "6️⃣ Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; node src/server.js"
Write-Host "   ✅ Backend starting on port $backendPort" -ForegroundColor Green

# Step 7: Wait for backend to initialize
Write-Host "7️⃣ Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
Write-Host "   ✅ Backend should be ready" -ForegroundColor Green

# Step 8: Start Dashboard
Write-Host "8️⃣ Starting Dashboard..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\apps\dashboard'; npm run dev"
Write-Host "   ✅ Dashboard starting on port $dashboardPort" -ForegroundColor Green

# Done
Write-Host ""
Write-Host "✅ Clean restart complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Dashboard: http://localhost:$dashboardPort" -ForegroundColor Cyan
Write-Host "🔌 Backend:   http://localhost:$backendPort" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
