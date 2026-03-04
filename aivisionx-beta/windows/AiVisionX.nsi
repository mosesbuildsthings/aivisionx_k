; AiVisionX Windows Installer
; NSIS Script for Beta Distribution
; Requires: NSIS 3.0+

!define APP_NAME "AiVisionX"
!define APP_VERSION "0.1.0-beta"
!define APP_PUBLISHER "AiVisionX Team"
!define APP_URL "https://aivisionx.io"
!define INSTALL_DIR "$PROGRAMFILES64\AiVisionX"

; Includes
!include "MUI2.nsh"
!include "LogicLib.nsh"
!include "FileFunc.nsh"

; General Settings
Name "${APP_NAME} ${APP_VERSION}"
OutFile "AiVisionX-Setup-0.1.0-beta.exe"
InstallDir "${INSTALL_DIR}"
InstallDirRegKey HKCU "Software\AiVisionX" "InstallDir"
RequestExecutionLevel admin
SetCompressor lzma

; Interface Settings
!define MUI_ABORTWARNING
!define MUI_ICON "assets\icon.ico"
!define MUI_UNICON "assets\icon.ico"
!define MUI_WELCOMEFINISHPAGE_BITMAP "assets\installer-banner.bmp"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE.txt"
!insertmacro MUI_PAGE_COMPONENTS
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_WELCOME
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_UNPAGE_FINISH

; Languages
!insertmacro MUI_LANGUAGE "English"

; Sections
Section "AiVisionX Core (Required)" SecCore
  SectionIn RO
  
  SetOutPath "$INSTDIR"
  
  ; Main executable
  File "..\..\app\dist\AiVisionX.exe"
  
  ; Configuration
  File "config.json"
  
  ; Resources
  SetOutPath "$INSTDIR\resources"
  File /r "resources\*.*"
  
  ; Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  
  ; Registry entries
  WriteRegStr HKCU "Software\AiVisionX" "InstallDir" "$INSTDIR"
  WriteRegStr HKCU "Software\AiVisionX" "Version" "${APP_VERSION}"
  
  ; Add to PATH
  EnVar::AddValue "PATH" "$INSTDIR"
  
  ; Create Start Menu shortcuts
  CreateDirectory "$SMPROGRAMS\AiVisionX"
  CreateShortcut "$SMPROGRAMS\AiVisionX\AiVisionX.lnk" "$INSTDIR\AiVisionX.exe"
  CreateShortcut "$SMPROGRAMS\AiVisionX\Uninstall.lnk" "$INSTDIR\Uninstall.exe"
  
  ; Create desktop shortcut
  CreateShortcut "$DESKTOP\AiVisionX.lnk" "$INSTDIR\AiVisionX.exe"
  
  ; Register uninstaller
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AiVisionX" \
                   "DisplayName" "${APP_NAME}"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AiVisionX" \
                   "UninstallString" "$INSTDIR\Uninstall.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AiVisionX" \
                   "DisplayVersion" "${APP_VERSION}"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AiVisionX" \
                   "Publisher" "${APP_PUBLISHER}"
SectionEnd

Section "Start on Boot" SecStartup
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" \
                   "AiVisionX" "$INSTDIR\AiVisionX.exe --background"
SectionEnd

Section "Create System Tray Icon" SecTray
  ; Tray icon is created by the application
  ; This section is for documentation
SectionEnd

Section "Python Prototype" SecPrototype
  SetOutPath "$INSTDIR\prototype"
  File /r "..\prototype\*.*"
  
  ; Create batch file to run prototype
  FileOpen $0 "$INSTDIR\prototype\Run-AiVisionX.bat" w
  FileWrite $0 "@echo off$\n"
  FileWrite $0 "echo Starting AiVisionX Prototype...$\n"
  FileWrite $0 "python aivisionx_prototype.py$\n"
  FileWrite $0 "pause$\n"
  FileClose $0
SectionEnd

; Descriptions
!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
  !insertmacro MUI_DESCRIPTION_TEXT ${SecCore} "AiVisionX core application and resources"
  !insertmacro MUI_DESCRIPTION_TEXT ${SecStartup} "Start AiVisionX automatically when Windows boots"
  !insertmacro MUI_DESCRIPTION_TEXT ${SecTray} "Show AiVisionX icon in system tray"
  !insertmacro MUI_DESCRIPTION_TEXT ${SecPrototype} "Python prototype for testing core functionality"
!insertmacro MUI_FUNCTION_DESCRIPTION_END

; Uninstaller
Section "Uninstall"
  ; Remove files
  Delete "$INSTDIR\AiVisionX.exe"
  Delete "$INSTDIR\config.json"
  Delete "$INSTDIR\Uninstall.exe"
  
  ; Remove directories
  RMDir /r "$INSTDIR\resources"
  RMDir /r "$INSTDIR\prototype"
  RMDir "$INSTDIR"
  
  ; Remove shortcuts
  Delete "$SMPROGRAMS\AiVisionX\AiVisionX.lnk"
  Delete "$SMPROGRAMS\AiVisionX\Uninstall.lnk"
  RMDir "$SMPROGRAMS\AiVisionX"
  Delete "$DESKTOP\AiVisionX.lnk"
  
  ; Remove registry entries
  DeleteRegKey HKCU "Software\AiVisionX"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\AiVisionX"
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "AiVisionX"
  
  ; Remove from PATH
  EnVar::DeleteValue "PATH" "$INSTDIR"
SectionEnd

; Version information
VIProductVersion "0.1.0.0"
VIAddVersionKey "ProductName" "AiVisionX"
VIAddVersionKey "ProductVersion" "0.1.0-beta"
VIAddVersionKey "FileDescription" "AiVisionX - AI-Powered Desktop Assistant"
VIAddVersionKey "LegalCopyright" "© 2026 AiVisionX Team"
VIAddVersionKey "FileVersion" "0.1.0.0"
