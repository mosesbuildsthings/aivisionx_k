@echo off
REM AiVisionX Windows Beta Installer
REM Run this script to install AiVisionX on Windows

title AiVisionX Beta Installer
cls

echo.
echo  ================================================
echo   AiVisionX Beta Installer v0.1.0
echo  ================================================
echo.

REM Check for admin privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo  [!] This installer requires administrator privileges.
    echo  [!] Please right-click and select "Run as administrator"
    echo.
    pause
    exit /b 1
)

REM Check Windows version
for /f "tokens=4-5 delims=. " %%i in ('ver') do set VERSION=%%i.%%j
if "%version%" LSS "10.0" (
    echo  [!] AiVisionX requires Windows 10 or later.
    echo  [!] Your version: %version%
    echo.
    pause
    exit /b 1
)

echo  [+] Windows version check passed
echo.

REM Check for Python (for prototype)
python --version >nul 2>&1
if %errorLevel% equ 0 (
    echo  [+] Python detected
    for /f "tokens=*" %%a in ('python --version') do set PYTHON_VERSION=%%a
    echo      %PYTHON_VERSION%
) else (
    echo  [!] Python not found. Prototype features will be disabled.
    echo      Download from: https://python.org/downloads
)
echo.

REM Create installation directory
set INSTALL_DIR=%PROGRAMFILES%\AiVisionX
set CONFIG_DIR=%LOCALAPPDATA%\AiVisionX

echo  [+] Creating installation directory...
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"
if not exist "%CONFIG_DIR%" mkdir "%CONFIG_DIR%"
if not exist "%CONFIG_DIR%\captures" mkdir "%CONFIG_DIR%\captures"
if not exist "%CONFIG_DIR%\logs" mkdir "%CONFIG_DIR%\logs"

REM Copy files
echo  [+] Installing AiVisionX files...
xcopy /E /I /Y "bin\*" "%INSTALL_DIR%\bin\" >nul
xcopy /E /I /Y "resources\*" "%INSTALL_DIR%\resources\" >nul
copy /Y "config.json" "%INSTALL_DIR%\" >nul
copy /Y "AiVisionX.exe" "%INSTALL_DIR%\" >nul

REM Copy prototype if Python is available
if %errorLevel% equ 0 (
    echo  [+] Installing Python prototype...
    xcopy /E /I /Y "prototype\*" "%INSTALL_DIR%\prototype\" >nul
)

REM Create Start Menu shortcut
echo  [+] Creating shortcuts...
set STARTMENU=%PROGRAMDATA%\Microsoft\Windows\Start Menu\Programs\AiVisionX
if not exist "%STARTMENU%" mkdir "%STARTMENU%"

powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%STARTMENU%\AiVisionX.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\AiVisionX.exe'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.IconLocation = '%INSTALL_DIR%\resources\icon.ico'; $Shortcut.Save()"
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%STARTMENU%\Uninstall AiVisionX.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\uninstall.bat'; $Shortcut.IconLocation = '%SystemRoot%\System32\shell32.dll,31'; $Shortcut.Save()"

REM Create desktop shortcut
powershell -Command "$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%PUBLIC%\Desktop\AiVisionX.lnk'); $Shortcut.TargetPath = '%INSTALL_DIR%\AiVisionX.exe'; $Shortcut.WorkingDirectory = '%INSTALL_DIR%'; $Shortcut.IconLocation = '%INSTALL_DIR%\resources\icon.ico'; $Shortcut.Save()"

REM Register in registry
echo  [+] Registering application...
reg add "HKLM\SOFTWARE\AiVisionX" /v "InstallDir" /t REG_SZ /d "%INSTALL_DIR%" /f >nul
reg add "HKLM\SOFTWARE\AiVisionX" /v "Version" /t REG_SZ /d "0.1.0-beta" /f >nul
reg add "HKLM\SOFTWARE\AiVisionX" /v "ConfigDir" /t REG_SZ /d "%CONFIG_DIR%" /f >nul

REM Add to uninstall registry
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\AiVisionX" /v "DisplayName" /t REG_SZ /d "AiVisionX" /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\AiVisionX" /v "DisplayVersion" /t REG_SZ /d "0.1.0-beta" /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\AiVisionX" /v "Publisher" /t REG_SZ /d "AiVisionX Team" /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\AiVisionX" /v "InstallLocation" /t REG_SZ /d "%INSTALL_DIR%" /f >nul
reg add "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\AiVisionX" /v "UninstallString" /t REG_SZ /d "\"%INSTALL_DIR%\uninstall.bat\"" /f >nul

REM Create uninstaller
echo  [+] Creating uninstaller...
(
echo @echo off
echo echo Uninstalling AiVisionX...
echo taskkill /F /IM AiVisionX.exe ^>nul 2^>^&1
echo timeout /t 2 ^>nul
echo rmdir /S /Q "%INSTALL_DIR%"
echo rmdir /S /Q "%CONFIG_DIR%"
echo reg delete "HKLM\SOFTWARE\AiVisionX" /f ^>nul 2^>^&1
echo reg delete "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\AiVisionX" /f ^>nul 2^>^&1
echo del "%PUBLIC%\Desktop\AiVisionX.lnk" ^>nul 2^>^&1
echo rmdir /S /Q "%STARTMENU%" ^>nul 2^>^&1
echo echo AiVisionX has been uninstalled.
echo pause
) > "%INSTALL_DIR%\uninstall.bat"

echo.
echo  ================================================
echo   Installation Complete!
echo  ================================================
echo.
echo  Installation Directory: %INSTALL_DIR%
echo  Configuration Directory: %CONFIG_DIR%
echo.
echo  Getting Started:
echo   1. Launch AiVisionX from the Start Menu
echo   2. Or run: "%INSTALL_DIR%\AiVisionX.exe"
echo   3. Press Ctrl+Space to activate the overlay
echo.
echo  Documentation: https://docs.aivisionx.io
echo  Support: support@aivisionx.io
echo.

REM Ask to start now
set /p START_NOW="Start AiVisionX now? (Y/N): "
if /I "%START_NOW%"=="Y" (
    start "" "%INSTALL_DIR%\AiVisionX.exe"
)

echo.
pause
