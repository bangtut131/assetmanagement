@echo off
setlocal
echo ==========================================
echo  DIAGNOSTIC PUSH TO GITHUB (FIX MODE)
echo ==========================================

echo [1/5] Forcing Git Initialization...
:: Always run init to ensure it is valid, even if folder exists
git init

echo [2/5] Checking Status...
git status
if %errorlevel% neq 0 (
    echo ERROR: Still not a git repository after init. Something is wrong with the folder permissions?
    pause
    exit /b
)

echo [3/5] Setting Remote Origin...
git remote remove origin 2>nul
git remote add origin https://github.com/bangtut131/assetmanagement.git

echo [4/5] Adding and Committing files...
git add .
git commit -m "Force push attempt" || echo (Commit failed or empty, continuing...)

echo [5/5] PUSHING TO GITHUB...
echo ---------------------------------------------------
git branch -M main
git push -u origin main
echo ---------------------------------------------------

if %errorlevel% neq 0 (
    color 47
    echo.
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    echo ERROR: GIT PUSH FAILED!
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    pause
    exit /b
)

color 20
echo.
echo ==========================================
echo  SUCCESS! Code pushed to GitHub.
echo ==========================================
pause
