# Stop All Agent-Company Processes
# Quick script to cleanly stop all running processes

Write-Host "🛑 Stopping Agent-Company..." -ForegroundColor Red

# Stop Node
Write-Host "Stopping Node.js..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# Stop Python
Write-Host "Stopping Python..." -ForegroundColor Yellow
Stop-Process -Name python -Force -ErrorAction SilentlyContinue

# Clean locks
Write-Host "Cleaning database locks..." -ForegroundColor Yellow
Remove-Item -Force "prisma\dev.db-journal" -ErrorAction SilentlyContinue
Remove-Item -Force "prisma\.shadow.db" -ErrorAction SilentlyContinue
Remove-Item -Force "prisma\dev.db-shm" -ErrorAction SilentlyContinue
Remove-Item -Force "prisma\dev.db-wal" -ErrorAction SilentlyContinue

Write-Host "✅ All processes stopped and cleaned!" -ForegroundColor Green
