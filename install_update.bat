@echo off
echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo Error installing dependencies.
    pause
    exit /b %errorlevel%
)
echo.
echo Dependencies installed successfully.
echo.
echo Please restart your Next.js server now (npm run dev).
pause
