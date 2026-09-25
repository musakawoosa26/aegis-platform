from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import random
import time
import json
import os

app = FastAPI(title="Aegis Core Backend API")

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
import json
import os

USERS_FILE = "users.json"

# Initialize users database if it doesn't exist
if not os.path.exists(USERS_FILE):
    with open(USERS_FILE, "w") as f:
        json.dump({"admin@aegis.com": {"password": "admin123", "name": "Admin"}}, f)

def load_users():
    with open(USERS_FILE, "r") as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, "w") as f:
        json.dump(users, f)

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

@app.post("/api/auth/signup")
def signup(req: SignupRequest):
    users = load_users()
    if req.email in users:
        raise HTTPException(status_code=400, detail="Account with this email already exists.")
    
    users[req.email] = {"password": req.password, "name": req.name}
    save_users(users)
    return {"status": "success", "message": "Account created successfully.", "user": req.name}

@app.post("/api/auth/login")
def login(req: LoginRequest):
    users = load_users()
    if req.email in users and users[req.email]["password"] == req.password:
        return {"token": "aegis_secure_session_token_12345", "user": users[req.email]["name"]}
    raise HTTPException(status_code=401, detail="Invalid Credentials")

@app.get("/api/threats/alerts")
def get_alerts():
    # In production, this would pull real incidents from Elasticsearch or a SIEM.
    return {
        "alerts": [
            {"time": "Just now", "severity": "high", "vector": "DDoS attempt blocked", "ip": "185.15.2.22"},
            {"time": "2m ago", "severity": "medium", "vector": "Anomalous login behavior", "ip": "10.0.0.5"},
            {"time": "15m ago", "severity": "critical", "vector": "SQL Injection attempt", "ip": "45.22.1.9"},
        ]
    }

@app.get("/api/threats/search")
def search_threats(query: str):
    # Simulates querying a global threat intelligence feed (like VirusTotal or Crowdstrike)
    is_malicious = random.random() > 0.5
    return {
        "query": query,
        "status": "CRITICAL THREAT" if is_malicious else "CLEAN",
        "geo": "Unknown / Proxy",
        "details": "Intelligence feeds indicate this indicator is associated with active botnet scanning and exploit attempts." if is_malicious else "No malicious activity found. IP appears benign."
    }

# Fake Database for Configurations
system_configs = {
    "auto_ban": True,
    "ai_quarantine": True,
    "geo_blocking": False
}

@app.get("/api/config")
def get_config():
    return system_configs

class ConfigUpdate(BaseModel):
    key: str
    value: bool

@app.post("/api/config")
def update_config(update: ConfigUpdate):
    if update.key in system_configs:
        system_configs[update.key] = update.value
        return {"status": "success", "state": system_configs}
    raise HTTPException(status_code=400, detail="Invalid configuration key")

# Serve the frontend static files
app.mount("/static", StaticFiles(directory="."), name="static")

@app.get("/")
def serve_frontend():
    return FileResponse("index.html")

@app.get("/{file_name}")
def serve_files(file_name: str):
    if os.path.exists(file_name):
        return FileResponse(file_name)
    raise HTTPException(status_code=404, detail="File not found")

if __name__ == "__main__":
    import uvicorn
    # Starts the web server on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
