@echo off
title IoT Case Study - localhost:5500
cd /d "%~dp0"
rem Vite 5 needs Node 18+; use nvm's Node 24 for this window without changing the global default
if exist "%LOCALAPPDATA%\nvm\v24.20.0\node.exe" set "PATH=%LOCALAPPDATA%\nvm\v24.20.0;%PATH%"
if not exist node_modules (
  echo Installing dependencies...
  call npm install
)
echo Starting at http://localhost:5500 - keep this window open.
call npm run dev
pause
