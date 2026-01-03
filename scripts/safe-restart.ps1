# Safe Restart Script - Ensures port is free before starting
# Prevents "port already in use" errors

param(
    [int]$Port = 3001,
    [int]$MaxRetries = 10
)

Write-Host "Safe Restart - Agent Company Backend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Find and kill process using port 3001
Write-Host "1 Checking port $Port..." -ForegroundColor Yellow
$processOnPort = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processOnPort) {
    Write-Host "   Port $Port is in use by PID: $processOnPort" -ForegroundColor Yellow
    Write-Host "   Stopping process..." -ForegroundColor Yellow
    
    try {
        Stop-Process -Id $processOnPort -Force -ErrorAction Stop
        Write-Host "   Process stopped" -ForegroundColor Green
    } catch {
        Write-Host "   Failed to stop process: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   Port $Port is free" -ForegroundColor Green
}

# Step 2: Stop all Python agents
Write-Host "2 Stopping Python agents..." -ForegroundColor Yellow
Stop-Process -Name python -Force -ErrorAction SilentlyContinue
Write-Host "   Python processes stopped" -ForegroundColor Green

# Step 3: Clean database locks
Write-Host "3 Cleaning database locks..." -ForegroundColor Yellow
$dbFiles = @(
    "prisma\dev.db-journal",
    "prisma\.shadow.db",
    "prisma\dev.db-shm",
    "prisma\dev.db-wal"
)

foreach ($file in $dbFiles) {
    if (Test-Path $file) {
        Remove-Item -Force $file -ErrorAction SilentlyContinue
    }
}
Write-Host "   Database locks cleaned" -ForegroundColor Green

# Step 4: Wait for port to be completely free
Write-Host "4 Waiting for port to be free..." -ForegroundColor Yellow
$retries = 0
while ($retries -lt $MaxRetries) {
    Start-Sleep -Seconds 1
    $stillInUse = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    
    if (-not $stillInUse) {
        Write-Host "   Port $Port is now free" -ForegroundColor Green
        break
    }
    
    $retries++
    Write-Host "   Waiting... ($retries/$MaxRetries)" -ForegroundColor Gray
}

if ($retries -eq $MaxRetries) {
    Write-Host "   Port $Port is still in use after $MaxRetries seconds!" -ForegroundColor Red
    Write-Host "   Manual intervention required." -ForegroundColor Red
    exit 1
}

# Step 5: Start backend
Write-Host ""
Write-Host "5 Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; node src/server.js"
Write-Host "   Backend starting on port $Port" -ForegroundColor Green

Write-Host ""
Write-Host "Safe restart complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Backend: http://localhost:$Port" -ForegroundColor Cyan
Write-Host ""
