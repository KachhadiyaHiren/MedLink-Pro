@echo off
echo ====================================================
echo Healthcare App Rebuild and Restart Tool
echo ====================================================
echo.

echo 1. Stopping existing Healthcare App and ngrok...
:: Find and kill process listening on port 3000 or 3001
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    echo [Stop] Killing Next.js server (PID: %%a) on port 3000...
    taskkill /f /pid %%a
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING') do (
    echo [Stop] Killing Next.js server (PID: %%a) on port 3001...
    taskkill /f /pid %%a
)
:: Kill any background node wrapper instances
wmic process where "commandline like '%%run-with-timestamp.js%%'" call terminate >nul 2>&1
:: Kill ngrok
echo [Stop] Stopping ngrok background tunnel...
taskkill /f /im ngrok.exe >nul 2>&1

echo.
echo 2. Rebuilding the Next.js application to apply changes...
cd /d "C:\Users\hiren\OneDrive\Desktop\Healthcare"
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Next.js build failed. Please check the logs above for errors.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo 3. Launching background services via start_hidden.vbs...
wscript.exe start_hidden.vbs

echo.
echo ====================================================
echo SUCCESS: App rebuilt and restarted in the background!
echo Logs will be appended to: healthcare_app.log
echo Ngrok status logs: ngrok.log
echo ====================================================
echo.
pause
