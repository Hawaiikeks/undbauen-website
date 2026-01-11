#!/usr/bin/env pwsh
# Start HTTP Server for undbauen website
Set-Location "c:\Users\LukeG\test"
Write-Host "🚀 Starting HTTP Server on http://localhost:8000" -ForegroundColor Green
Write-Host "📂 Serving from: $(Get-Location)" -ForegroundColor Cyan
Write-Host "⏹️  Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
python -m http.server 8000






