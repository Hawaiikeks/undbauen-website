# Start Node.js static server (undbauen website)
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot
Write-Host "Starting local server on http://localhost:8000" -ForegroundColor Green
Write-Host ""
Write-Host "Open http://localhost:8000 in your browser" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
npm run start
