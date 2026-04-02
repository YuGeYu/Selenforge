@echo off
setlocal
chcp 65001 >nul

set "ROOT=%~dp0"
cd /d "%ROOT%"

set "MOONC=%ROOT%MulanMoonlang\moonc.exe"
if not exist "%MOONC%" (
  echo [ERROR] moonc not found: %MOONC%
  exit /b 1
)

set "MOON_PACKAGES=%ROOT%MulanMoonlang\packages"
if not exist "%MOON_PACKAGES%" (
  echo [ERROR] MoonLang 1.6 packages directory not found: %MOON_PACKAGES%
  echo [ERROR] Please upgrade the bundled MulanMoonlang runtime to v1.6.0 before building.
  exit /b 1
)

if not exist "engine\node_modules" (
  echo [INFO] Installing engine dependencies...
  call npm install --prefix engine
  if errorlevel 1 exit /b 1
)

echo [INFO] Building Moonflare runtime...
call npm run build --prefix engine
if errorlevel 1 (
  echo [ERROR] Failed to build engine.
  exit /b 1
)

if exist "dist" rmdir /s /q "dist"
mkdir "dist"
mkdir "dist\app"
mkdir "dist\vendor"

copy /y "desktop\index.html" "dist\app\index.html" >nul
copy /y "desktop\app.css" "dist\app\app.css" >nul
copy /y "desktop\app.js" "dist\app\app.js" >nul
copy /y "desktop\moon-script-tools.js" "dist\app\moon-script-tools.js" >nul
copy /y "desktop\game-template.html" "dist\app\game-template.html" >nul
copy /y "desktop\game-template.js" "dist\app\game-template.js" >nul
copy /y "engine\build\playcanvas.js" "dist\vendor\moonflare.js" >nul
copy /y "Selenforge.ico" "dist\Selenforge.ico" >nul
copy /y "Selenforge.png" "dist\Selenforge.png" >nul
copy /y "README.md" "dist\README.md" >nul

echo [INFO] Copying MulanMoonlang runtime...
xcopy "%ROOT%MulanMoonlang" "dist\MulanMoonlang" /E /I /Y >nul
if errorlevel 1 (
  echo [ERROR] Failed to copy MulanMoonlang directory.
  exit /b 1
)

for %%F in ("%ROOT%MulanMoonlang\*.dll") do (
  copy /y "%%~fF" "dist\%%~nxF" >nul
)

echo [INFO] Compiling MoonLang desktop shell...
"%MOONC%" "main.moon" -o "dist\SelenforgeEditor.exe" --icon "%ROOT%Selenforge.ico" --company "Selenforge" --description "Selenforge StarAnvil Editor" --product-name "SelenforgeEditor" --file-version "0.1.0.0"
if errorlevel 1 (
  echo [ERROR] Failed to compile SelenforgeEditor.exe.
  exit /b 1
)

echo [OK] dist\SelenforgeEditor.exe
exit /b 0
