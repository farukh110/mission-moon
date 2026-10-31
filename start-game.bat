@echo off
rem Starts Mission Moon from the production build. No internet connection is needed.
cd /d "%~dp0"
if not exist ".next\BUILD_ID" (
  echo The game has not been built yet. Run "npm run build" once first.
  pause
  exit /b 1
)
start "" cmd /c "timeout /t 4 >nul & start http://localhost:3000"
call npm start
