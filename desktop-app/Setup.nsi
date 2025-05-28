; Include used librarys
; ============================================================

Unicode false

!addplugindir ".\NSIS_Plugins"
!addincludedir ".\NSIS_Plugins"
!include nsDialogs.nsh
!include nsProcess.nsh
!include LogicLib.nsh
!include MUI2.nsh
!include Sections.nsh
!include UAC.nsh
!include NsisMultiUser.nsh ; see http://drizin.io/NSIS-and-Windows-Installers-for-MultiUser-Current-User/ and https://github.com/Drizin/NsisMultiUser
!include NsisMultiUserLang.nsh
!include StdUtils.nsh



; Define program name and version information
; ============================================================

!define PrgName "Calculator"
!define SetupFileName "CalculatorSetup.exe"
!define RegKey "Calculator"
!define Copyright "Alexander Herzog"

OutFile "..\${SetupFileName}"

; Settings for NsisMultiUser
!define PRODUCT_NAME "${PrgName}"
!define PROGEXE "Calculator-win_x64.exe"
!define APP_NAME "${RegKey}"
!define COMPANY_NAME "${Copyright}"
!define VERSION "1.0.0.0"



; Initial settings
; ============================================================

Name "${PrgName}"
BrandingText "${PrgName}"
RequestExecutionLevel user

!insertmacro MUI_RESERVEFILE_LANGDLL

ShowInstDetails nevershow
ShowUninstDetails nevershow

!define UNINSTALL_FILENAME "Uninstall.exe"
!define MULTIUSER_INSTALLMODE_INSTDIR "${APP_NAME}"  ; suggested name of directory to install (under $PROGRAMFILES or $LOCALAPPDATA)
!define MULTIUSER_INSTALLMODE_INSTALL_REGISTRY_KEY "${APP_NAME}"  ; registry key for INSTALL info, placed under [HKLM|HKCU]\Software  (can be ${APP_NAME} or some {GUID})
!define MULTIUSER_INSTALLMODE_UNINSTALL_REGISTRY_KEY "${APP_NAME}"  ; registry key for UNINSTALL info, placed under [HKLM|HKCU]\Software\Microsoft\Windows\CurrentVersion\Uninstall  (can be ${APP_NAME} or some {GUID})
!define MULTIUSER_INSTALLMODE_DEFAULT_REGISTRY_VALUENAME "UninstallString"
!define MULTIUSER_INSTALLMODE_INSTDIR_REGISTRY_VALUENAME "InstallLocation"
!define MULTIUSER_INSTALLMODE_DISPLAYNAME "${APP_NAME}" ; this is optional... name that will be displayed in add/remove programs (default is ${APP_NAME})
!define MULTIUSER_INSTALLMODE_ALLOW_ELEVATION   ; allow requesting for elevation... if false, radiobutton will be disabled and user will have to restart installer with elevated permissions
; !define MULTIUSER_INSTALLMODE_DEFAULT_ALLUSERS  ; only available if MULTIUSER_INSTALLMODE_ALLOW_ELEVATION
!define MULTIUSER_INSTALLMODE_DEFAULT_CURRENTUSER 1



; Settings for the modern user interface (MUI)
; ============================================================

!define MUI_ICON "${NSISDIR}\Contrib\Graphics\Icons\orange-install.ico"
!define MUI_UNICON "${NSISDIR}\Contrib\Graphics\Icons\orange-uninstall.ico"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Header\orange.bmp"
!define MUI_HEADERIMAGE_UNBITMAP "${NSISDIR}\Contrib\Graphics\Header\orange-uninstall.bmp"
!define MUI_WELCOMEFINISHPAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Wizard\orange.bmp"
!define MUI_UNWELCOMEFINISHPAGE_BITMAP "${NSISDIR}\Contrib\Graphics\Wizard\orange-uninstall.bmp"
!define MUI_FINISHPAGE_TITLE_3LINES

!define MUI_ABORTWARNING
!define MUI_UNABORTWARNING
!define MUI_COMPONENTSPAGE_NODESC

!define MUI_FINISHPAGE_HEADER  "$(LANGNAME_FinishTitle)"
!define MUI_FINISHPAGE_TEXT  "$(LANGNAME_FinishText)"
!define MUI_FINISHPAGE_RUN
!define MUI_FINISHPAGE_RUN_FUNCTION ExecAppFile
!define MUI_FINISHPAGE_RUN_TEXT  "$(LANGNAME_FinishRun)"
!define MUI_COMPONENTSPAGE_TEXT_TOP "$(LANGNAME_UnSectionTopInfo)"
!define MUI_COMPONENTSPAGE_TEXT_COMPLIST "$(LANGNAME_UnSectionAction)"
!define MUI_COMPONENTSPAGE_TEXT_INSTTYPE ""

!define MUI_UNABORTWARNING_TEXT "$(LANGNAME_UnAbortWarning)"

!insertmacro MULTIUSER_PAGE_INSTALLMODE
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MULTIUSER_UNPAGE_INSTALLMODE
!insertmacro MUI_UNPAGE_INSTFILES

Function ExecAppFile
  UserInfo::getAccountType
  Pop $0
  StrCmp $0 "Admin" ExecAdminMode
  Exec "$INSTDIR\${PROGEXE}"
  Goto ExecDone
  ExecAdminMode:
  !insertmacro UAC_AsUser_ExecShell "" "$INSTDIR\${PROGEXE}" "" "" ""
  ExecDone:
FunctionEnd



; Main settings for different languages
; ============================================================

!insertmacro MUI_LANGUAGE "English"
!insertmacro MUI_LANGUAGE "German"

LangString LANGNAME_FinishTitle ${LANG_GERMAN} "Installation des Rechners abgeschlossen"
LangString LANGNAME_FinishText ${LANG_GERMAN} "Der Rechner wurde auf Ihrem Computer installiert.$\r$\n$\r$\nKlicken Sie auf Fertig stellen, um dieses Installationsprogramm zu schließen."
LangString LANGNAME_FinishRun ${LANG_GERMAN} "Rechner jetzt starten"
LangString LANGNAME_LinkUninstall ${LANG_GERMAN} "Rechner deinstallieren"
LangString LANGNAME_UninstallWarning ${LANG_GERMAN} "Das Installationsverzeichnis enthält Dateien, die nicht vom Rechner stammen. Soll das Verzeichnis dennoch vollständig gelöscht werden?"
LangString LANGNAME_UninstallTitle ${LANG_GERMAN} "${PrgName} deinstallieren"
LangString LANGNAME_UnSectionTopInfo ${LANG_GERMAN} "Sie können das Programm deinstallieren oder lediglich die Konfiguration auf den Auslieferungszustand zurücksetzen."
LangString LANGNAME_UnSectionAction ${LANG_GERMAN} "Aktion:"
LangString LANGNAME_UnSectionReset ${LANG_GERMAN} "Konfiguration zurücksetzen (Programm nicht deinstallieren)"
LangString LANGNAME_UnSectionUninstall ${LANG_GERMAN} "Programm deinstallieren"
LangString LANGNAME_UnAbortWarning ${LANG_GERMAN} "Wollen Sie das Service- und Deinstallationsprogramm wirklich abbrechen?"
LangString LANGNAME_SimulatorCfg ${LANG_GERMAN} "<?xml version=$\"1.0$\" encoding=$\"UTF-8$\" standalone=$\"no$\"?><Setup><Language>de</Language></Setup>"

LangString LANGNAME_FinishTitle ${LANG_ENGLISH} "Installation of calculator completed"
LangString LANGNAME_FinishText ${LANG_ENGLISH} "The calculator was installed on your computer.$\r$\n$\r$\nClick Finish to close this installer."
LangString LANGNAME_FinishRun ${LANG_ENGLISH} "Run calculator now"
LangString LANGNAME_LinkUninstall ${LANG_ENGLISH} "Uninstall calculator"
LangString LANGNAME_UninstallWarning ${LANG_ENGLISH} "The installation folder contains files which are not installed with calculator. Do you want to delete this folder anyway?"
LangString LANGNAME_UninstallTitle ${LANG_ENGLISH} "Uninstall ${PrgName}"
LangString LANGNAME_UnSectionTopInfo ${LANG_ENGLISH} "You can uninstall the program or just reset the configuration to the initial state."
LangString LANGNAME_UnSectionAction ${LANG_ENGLISH} "Action:"
LangString LANGNAME_UnSectionReset ${LANG_ENGLISH} "Reset configuration (do not uninstall program)"
LangString LANGNAME_UnSectionUninstall ${LANG_ENGLISH} "Uninstall program"
LangString LANGNAME_UnAbortWarning ${LANG_ENGLISH} "Do you really want to quit the service and uninstallation program?"
LangString LANGNAME_SimulatorCfg ${LANG_ENGLISH} "<?xml version=$\"1.0$\" encoding=$\"UTF-8$\" standalone=$\"no$\"?><Setup><Language>en</Language></Setup>"

!insertmacro MULTIUSER_LANGUAGE_INIT

; Version data in installer exe (has to be placed after language init)
VIProductVersion "1.0.0.0"
VIAddVersionKey /LANG=${LANG_ENGLISH} "ProductName" "${PrgName}"
VIAddVersionKey /LANG=${LANG_ENGLISH} "FileDescription" "${PrgName} Setup"
VIAddVersionKey /LANG=${LANG_ENGLISH} "LegalCopyright" "${Copyright}"
VIAddVersionKey /LANG=${LANG_ENGLISH} "CompanyName" "${Copyright}"
VIAddVersionKey /LANG=${LANG_ENGLISH} "FileVersion" "${VERSION}.100"
VIAddVersionKey /LANG=${LANG_ENGLISH} "ProductVersion" "${VERSION}.100"
VIAddVersionKey /LANG=${LANG_ENGLISH} "InternalName" "${SetupFileName}"
VIAddVersionKey /LANG=${LANG_GERMAN} "ProductName" "${PrgName}"
VIAddVersionKey /LANG=${LANG_GERMAN} "FileDescription" "${PrgName} Setup"
VIAddVersionKey /LANG=${LANG_GERMAN} "LegalCopyright" "${Copyright}"
VIAddVersionKey /LANG=${LANG_GERMAN} "CompanyName" "${Copyright}"
VIAddVersionKey /LANG=${LANG_GERMAN} "FileVersion" "${VERSION}.100"
VIAddVersionKey /LANG=${LANG_GERMAN} "ProductVersion" "${VERSION}.100"
VIAddVersionKey /LANG=${LANG_GERMAN} "InternalName" "${SetupFileName}"

UninstallCaption "$(LANGNAME_UninstallTitle)"



; Definition of install / uninstallation sections
; ============================================================

Section "Install" Inst
  SetOverwrite try
  
  SetOutPath "$INSTDIR"

  File "..\dist\Calculator\Calculator-win_x64.exe"
  File "..\dist\Calculator\resources.neu"
  File "..\docs\favicon.ico"
  WriteUninstaller "Uninstall.exe"
  
  CreateShortCut "$SMPROGRAMS\${PrgName}.lnk" "$INSTDIR\${PROGEXE}" "" "$INSTDIR\favicon.ico"
  
  !insertmacro MULTIUSER_RegistryAddInstallInfo
  !insertmacro MULTIUSER_RegistryAddInstallSizeInfo
  
  IfSilent 0 notSilent
  UserInfo::getAccountType
  Pop $0
  StrCmp $0 "Admin" notSilent
  Exec "$INSTDIR\${PROGEXE}"
  notSilent:
SectionEnd



Section "un.Uninstall" uninst
  SetDetailsPrint none

  Delete "$INSTDIR\Calculator-win_x64.exe"
  Delete "$INSTDIR\resources.neu"
  Delete "$INSTDIR\favicon.ico"
  Delete "$INSTDIR\Uninstall.exe"
  
  Push "$INSTDIR"
  Call un.isEmptyDir
  Pop $0
  StrCmp $0 1 RemoveInstDir
  MessageBox MB_YESNO $(LANGNAME_UninstallWarning) IDYES RemoveInstDir IDNO RemoveInstDirDone
  RemoveInstDir:
  RmDir /r $INSTDIR
  RemoveInstDirDone:
    
  !insertmacro MULTIUSER_RegistryRemoveInstallInfo
  
  UserInfo::getAccountType
  Pop $0
  StrCmp $0 "Admin" 0 notAdmin  
  DeleteRegKey HKLM "SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\Calculator"
  DeleteRegKey HKLM "SOFTWARE\WOW6432Node\Calculator"
  SetShellVarContext all ; for the following delete
  notAdmin:
  
  Delete "$SMPROGRAMS\${PrgName}.lnk"
  
  SetAutoClose true
SectionEnd




; Additional functions
; ============================================================

Function .onInit  
  !insertmacro MULTIUSER_INIT
  !insertmacro MUI_LANGDLL_DISPLAY
FunctionEnd



Function un.isEmptyDir
  ; Stack ->                    ; Stack: <directory>
  Exch $0                       ; Stack: $0
  Push $1                       ; Stack: $1, $0
  FindFirst $0 $1 "$0\*.*"
  strcmp $1 "." 0 _notempty
    FindNext $0 $1
    strcmp $1 ".." 0 _notempty
      ClearErrors
      FindNext $0 $1
      IfErrors 0 _notempty
        FindClose $0
        Pop $1                  ; Stack: $0
        StrCpy $0 1
        Exch $0                 ; Stack: 1 (true)
        goto _end
     _notempty:
       FindClose $0
       Pop $1                   ; Stack: $0
       StrCpy $0 0
       Exch $0                  ; Stack: 0 (false)
  _end:
FunctionEnd
