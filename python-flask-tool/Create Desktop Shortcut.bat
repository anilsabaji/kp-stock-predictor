@echo off
REM ==========================================================================
REM  Creates a one-click Desktop shortcut that starts the
REM  KP + Mundane Astrology NSE Stock Prediction Tool and opens it in the
REM  browser. Double-click THIS file once; afterwards just use the desktop
REM  icon named "KP Astro Stock Tool".
REM ==========================================================================
setlocal
cd /d "%~dp0"

set "TARGET=%~dp0run.bat"
set "ICON=%SystemRoot%\System32\shell32.dll,135"
set "LINKNAME=KP Astro Stock Tool"

echo Creating desktop shortcut "%LINKNAME%" ...

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$ws = New-Object -ComObject WScript.Shell;" ^
  "$desktop = [Environment]::GetFolderPath('Desktop');" ^
  "$lnk = $ws.CreateShortcut((Join-Path $desktop '%LINKNAME%.lnk'));" ^
  "$lnk.TargetPath = '%TARGET%';" ^
  "$lnk.WorkingDirectory = '%~dp0';" ^
  "$lnk.IconLocation = '%ICON%';" ^
  "$lnk.Description = 'Start the KP + Mundane Astrology NSE Stock Prediction Tool';" ^
  "$lnk.Save();"

if errorlevel 1 (
  echo.
  echo  Could not create the shortcut automatically.
  echo  You can still start the tool by double-clicking run.bat in this folder.
) else (
  echo.
  echo  Done! A "%LINKNAME%" icon is now on your Desktop.
  echo  Double-click it any time to start the tool.
)
echo.
pause
