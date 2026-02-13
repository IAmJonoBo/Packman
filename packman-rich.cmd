@echo off
setlocal
set ROOT_DIR=%~dp0

where python >nul 2>&1
if errorlevel 1 (
	if not exist "%ROOT_DIR%packman-py\.venv\Scripts\python.exe" (
		echo Python is required to run the Rich/Typer CLI launcher.
		echo Install Python 3 and try again.
		exit /b 1
	)
)

if exist "%ROOT_DIR%packman-py\.venv\Scripts\python.exe" (
  set PYTHON_BIN=%ROOT_DIR%packman-py\.venv\Scripts\python.exe
) else (
  set PYTHON_BIN=python
)

"%PYTHON_BIN%" -c "import typer, rich" >nul 2>&1
if errorlevel 1 (
	echo Missing Python dependencies: typer and rich.
	echo Install them with: python -m pip install typer[all] rich
	exit /b 2
)

if not exist "%ROOT_DIR%packman-py\packman_py" (
	echo packman-py sources not found under %ROOT_DIR%packman-py
	exit /b 3
)

set PYTHONPATH=%ROOT_DIR%packman-py;%PYTHONPATH%

if "%~1"=="" (
	"%PYTHON_BIN%" -m packman_py.packman interactive
) else (
	"%PYTHON_BIN%" -m packman_py.packman %*
)
