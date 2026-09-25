#!/bin/bash

echo "[*] Initializing Aegis Cyber Threat Platform..."

# Setup Python Virtual Environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "[*] Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "[*] Activating virtual environment..."
source venv/bin/activate

echo "[*] Installing backend dependencies..."
pip install -r requirements.txt -q

echo "[*] Starting Python FastAPI Backend Server on port 8000..."
# Run uvicorn in the background
python3 server.py &
BACKEND_PID=$!

echo "[*] Backend running with PID: $BACKEND_PID"
echo "[*] Waiting for backend to spin up..."
sleep 2

echo "[*] Opening the Aegis Web Platform..."
# Open the index.html file in the default web browser (macOS)
open index.html

echo "[*] Platform is live!"
echo "[*] Press CTRL+C to stop the server."

# Wait for user to press CTRL+C
wait $BACKEND_PID
