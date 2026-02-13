@echo off
setlocal
set ROOT_DIR=%~dp0

where node >nul 2>&1
if errorlevel 1 (
	echo Node.js is required to run packman-js.
	exit /b 1
)

if not exist "%ROOT_DIR%packman-cli\dist\index.js" (
	echo packman-cli is not built yet.
	echo Run: pnpm --filter packman-cli run build
	exit /b 2
)

if "%~1"=="" (
	call "%ROOT_DIR%packman-rich.cmd" interactive
	exit /b %errorlevel%
)

node "%ROOT_DIR%packman-cli\dist\index.js" %*
