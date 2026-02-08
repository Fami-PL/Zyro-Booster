@echo off
title Zyro-Booster
echo ======================================
echo    Zyro-Booster for Windows
echo ======================================

:: Check if node_modules exists
if not exist node_modules (
    echo [INFO] First run detected. Installing dependencies...
    call npm install
)

:: Check if dist exists (built project)
if not exist dist (
    echo [INFO] Building project...
    call npm run build
)

echo [INFO] Starting Zyro-Booster...
call npm start

if %errorlevel% neq 0 (
    echo [ERROR] Something went wrong. Make sure Node.js is installed.
    pause
)
