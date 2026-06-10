@echo off
echo ====================================================
echo Stopping Healthcare App background services...
echo ====================================================
echo.

echo 1. Stopping Next.js server on Port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo [Stop] Killing PID %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo 2. Stopping Next.js server on Port 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do (
    echo [Stop] Killing PID %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo 3. Terminating run-with-timestamp.js and Node wrapper instances...
wmic process where "commandline like '%%run-with-timestamp.js%%'" call terminate >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

echo 4. Stopping ngrok background tunnel...
taskkill /f /im ngrok.exe >nul 2>&1

echo.
echo ====================================================
echo SUCCESS: All healthcare app services stopped!
echo ====================================================
pause
