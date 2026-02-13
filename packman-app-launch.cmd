@echo off
setlocal
set ROOT_DIR=%~dp0
set APP_EXE=%ROOT_DIR%packman-app\src-tauri\target\release\packman-app.exe
set APP_MSI_DIR=%ROOT_DIR%packman-app\src-tauri\target\release\bundle\msi

if exist "%APP_EXE%" (
	echo Launching Packman app binary...
	start "" "%APP_EXE%"
	exit /b 0
)

if exist "%APP_MSI_DIR%" (
	echo Opening Packman MSI bundle folder...
	start "" "%APP_MSI_DIR%"
	exit /b 0
)

echo No built app found.
echo Run: pnpm --filter packman-app run tauri:build:safe
exit /b 1
