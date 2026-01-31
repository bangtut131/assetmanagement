@echo off
echo ==========================================
echo   Starting ProAsset Application...
echo ==========================================

:: Open the browser immediately (it might take a few seconds for the server to be ready)
start "" "http://localhost:3000"

:: Start the Next.js development server
npm run dev

pause
