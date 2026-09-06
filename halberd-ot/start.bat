@echo off
echo ======================================================
echo  Starting HALBERD: OT/ICS Cyber Defense Environment  
echo ======================================================

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Python is required but was not found on PATH.
    pause
    exit /b 1
)

if not exist ".venv" (
    echo [*] Creating virtual environment (.venv)...
    python -m venv .venv
)

echo [*] Activating virtual environment...
call .venv\Scripts\activate.bat

echo [*] Installing dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

echo [*] Launching HALBERD EdgeReactor & Modbus Simulator...
python -m seal.cli start --host 127.0.0.1 --port 8080
pause

