@echo off
cd /d "%~dp0\.."
echo Starting local server on http://localhost:8000
echo.
echo Open http://localhost:8000 in your browser
echo.
echo Press Ctrl+C to stop the server
echo.
npm run start
