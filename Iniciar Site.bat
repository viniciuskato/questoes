@echo off
cd /d "%~dp0"
echo Verificando servidor anterior...
powershell -NoProfile -Command "$p = Get-NetTCPConnection -LocalPort 5500 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty OwningProcess; if ($p) { Stop-Process -Id $p -Force -ErrorAction SilentlyContinue; Start-Sleep -Milliseconds 500 }"
echo Iniciando o site de Questoes...
node tools\serve.js
pause
