@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist node_modules call npm i
for %%f in (index path os fs1 fs2 fs3 fs4 events program) do (
  echo.
  echo ===== node %%f.js =====
  node %%f.js
  timeout /t 1 >nul
)
echo.
echo ===== Done. For email run mail.js (see README) =====
pause
