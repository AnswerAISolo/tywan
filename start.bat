@echo off
chcp 65001 >nul 2>&1
title tywan - Install and Launch

echo.
echo  ==========================================
echo    tywan v0.1.0
echo  ==========================================
echo.

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Python not found. Please install Python 3.10+
    echo          https://www.python.org/downloads/
    pause
    exit /b 1
)

echo  [INFO] Python found:
python --version

:: Install dependencies
echo.
echo  [INFO] Installing dependencies...
pip install -r requirements.txt -q --disable-pip-version-check
if %errorlevel% neq 0 (
    echo  [WARN] Some packages failed to install, retrying with --user...
    pip install -r requirements.txt -q --user --disable-pip-version-check
)

echo.
echo  [OK] Installation complete!
echo.
echo  ------------------------------------------
echo  First time setup:
echo    1. Right-click tray icon - Open Settings
echo    2. Or edit: %%APPDATA%%\tywan\config.json
echo  ------------------------------------------
echo.

:: Launch
echo  [INFO] Starting tywan...
echo.
python main.py

pause
