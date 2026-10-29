@echo off
rem Abre o caixa em janela propria, com impressao direta (sem janela de confirmacao).
rem Para usar de outro aparelho/servidor: Abrir Caixa.bat http://192.168.0.10:3000
set URL=%1
if "%URL%"=="" set URL=http://localhost:3000
where chrome >nul 2>nul && (start "" chrome --kiosk-printing --app=%URL% & exit /b)
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --kiosk-printing --app=%URL% & exit /b)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --kiosk-printing --app=%URL% & exit /b)
start "" msedge --kiosk-printing --app=%URL%
