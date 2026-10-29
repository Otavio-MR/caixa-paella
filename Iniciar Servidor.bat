@echo off
cd /d "%~dp0"
if not exist node_modules (
  echo Instalando pela primeira vez, aguarde...
  call npm install
)
echo.
echo Deixe esta janela aberta durante o evento.
node server.js
pause
