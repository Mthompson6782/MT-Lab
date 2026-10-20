#!/usr/bin/env bash
set -e

echo "======================================================"
echo " Starting HALBERD: OT/ICS Cyber Defense Environment   "
echo "======================================================"

if ! command -v python3 &> /dev/null; then
    echo "[!] Python 3 is required but not installed."
    exit 1
fi

if [ ! -d ".venv" ]; then
    echo "[*] Creating virtual environment (.venv)..."
    python3 -m venv .venv
fi

echo "[*] Activating virtual environment..."
source .venv/bin/activate

echo "[*] Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "[*] Launching HALBERD EdgeReactor & Modbus Simulator..."
python -m seal.cli start --host 0.0.0.0 --port 8080

