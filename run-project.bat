@echo off
title QuizQuake: BrainStorm Arena Launcher
color 0B

echo ======================================================================
echo          QuizQuake: BrainStorm Arena - Adaptive Testing Engine
echo ======================================================================
echo.

set PATH=C:\Users\charankumar\nodejs;%PATH%

echo [1/3] Checking Node.js and dependencies...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in PATH!
    pause
    exit /b 1
)

echo Node.js version:
node -v

echo.
echo [2/3] Installing dependencies if needed...
if not exist "server\node_modules" (
    echo Installing backend dependencies...
    cd server
    call npm install
    cd ..
)

if not exist "client\node_modules" (
    echo Installing frontend dependencies...
    cd client
    call npm install
    cd ..
)

echo.
echo [3/3] Launching Backend Server and Frontend Client...
echo.

start "QuizQuake Backend (Port 5000)" cmd /k "set PATH=C:\Users\charankumar\nodejs;%%PATH%% && cd server && npm run dev"
timeout /t 3 >nul

start "QuizQuake Frontend (Port 3000)" cmd /k "set PATH=C:\Users\charankumar\nodejs;%%PATH%% && cd client && npm run dev"
timeout /t 3 >nul

echo.
echo ======================================================================
echo Backend running on:  http://localhost:5000
echo Frontend running on: http://localhost:3000
echo ======================================================================
echo Opening browser...
start http://localhost:3000

echo.
echo Press any key to close this launcher window (servers continue running in background windows).
pause >nul
