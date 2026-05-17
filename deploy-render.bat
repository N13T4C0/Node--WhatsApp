@echo off
echo === Preparando deploy a Render ===
cd /d "%~dp0"

echo.
echo [1/4] Limpiando lock de git si existe...
if exist ".git\index.lock" del /f ".git\index.lock"

echo.
echo [2/4] Quitando node_modules del historial de git...
git rm -r --cached node_modules 2>nul
echo (si aparece error aqui es normal, significa que ya estaba ignorado)

echo.
echo [3/4] Agregando cambios al commit...
git add .gitignore render.yaml server.js

echo.
echo [4/4] Haciendo commit y push a GitHub...
git commit -m "config: preparar para deploy en Render"
git push origin main

echo.
echo === LISTO! Ahora ve a render.com y conecta tu repositorio ===
echo Repositorio: https://github.com/N13T4C0/Node--WhatsApp
echo.
pause
