@echo off
cd /d "c:\Users\LukeG\test"
echo.
echo ========================================
echo    undbauen Website - HTTP Server
echo ========================================
echo.
echo Server URL: http://localhost:8000
echo Server Directory: %CD%
echo.
echo Press Ctrl+C to stop the server
echo.
python -m http.server 8000
pause




