#!/usr/bin/env pwsh
# Start Node.js static server for undbauen website
Set-Location $PSScriptRoot
Write-Host "Starting HTTP Server on http://localhost:8000" -ForegroundColor Green
Write-Host "Serving from: $(Get-Location)" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
npm run start
