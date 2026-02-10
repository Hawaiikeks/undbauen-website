@echo off
cd /d "%~dp0"
echo.
echo ========================================
echo    undbauen Website - Node.js Server
echo ========================================
echo.
echo Server URL: http://localhost:8000
echo Server Directory: %CD%
echo.
echo Press Ctrl+C to stop the server
echo.
npm run start
pause
