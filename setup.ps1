#!/usr/bin/env pwsh
# BAMS Quick Start Script for Windows

Write-Host "🚀 Starting BAMS - Business Account Management System" -ForegroundColor Cyan
Write-Host ""

# Check Docker
Write-Host "📦 Starting Docker services..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker failed. Make sure Docker Desktop is running." -ForegroundColor Red
    exit 1
}
Write-Host "✅ PostgreSQL started on port 5432" -ForegroundColor Green
Write-Host "✅ pgAdmin started on port 5050" -ForegroundColor Green
Write-Host ""

# Wait for postgres
Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Install root dependencies
Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
npm install
Write-Host ""

# Backend setup
Write-Host "🔧 Setting up backend..." -ForegroundColor Yellow
Set-Location backend
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created backend/.env" -ForegroundColor Green
}
npx prisma generate
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
Set-Location ..
Write-Host "✅ Database migrated and seeded" -ForegroundColor Green
Write-Host ""

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  Now open 4 terminal windows and run:" -ForegroundColor White
Write-Host ""
Write-Host "  Terminal 1 (Backend):    cd backend && npm run dev" -ForegroundColor Yellow
Write-Host "  Terminal 2 (Employee):   cd apps/employee-app && npm run dev" -ForegroundColor Yellow
Write-Host "  Terminal 3 (Owner):      cd apps/owner-app && npm run dev" -ForegroundColor Yellow
Write-Host "  Terminal 4 (Admin):      cd apps/admin-dashboard && npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Or run all at once:      npm run dev" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "  📱 Employee App:   http://localhost:3001" -ForegroundColor Green
Write-Host "  💼 Owner App:      http://localhost:3002" -ForegroundColor Green
Write-Host "  🖥️  Admin Panel:   http://localhost:3003" -ForegroundColor Green
Write-Host "  ⚙️  Backend API:   http://localhost:4000" -ForegroundColor Green
Write-Host "  📚 API Docs:       http://localhost:4000/api/docs" -ForegroundColor Green
Write-Host "  🗄️  pgAdmin:       http://localhost:5050" -ForegroundColor Green
Write-Host ""
Write-Host "  🔑 Admin Login:    admin@bams.com / Admin@123" -ForegroundColor Magenta
Write-Host "  🔑 Owner Login:    owner@bams.com / Owner@123" -ForegroundColor Magenta
Write-Host "  🔑 Employee 1:     employee1@bams.com / Emp@123" -ForegroundColor Magenta
