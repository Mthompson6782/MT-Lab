"""Serverless function entrypoint for Vercel Edge / Serverless deployment."""

import os
import sys
import traceback
from pathlib import Path
from typing import Any, Dict
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add project root to sys.path so seal can be resolved
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

app = FastAPI(
    title="HALBERD EdgeReactor API",
    version="1.0.0",
    description="Happened-Before Analytics & Logic Baseline for Edge Response & Defense",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
@app.get("/api")
@app.get("/health")
@app.get("/api/health")
def health_check() -> Dict[str, Any]:
    return {
        "status": "healthy",
        "service": "HALBERD EdgeReactor API",
        "engine": "HALBERD",
        "version": "1.0.0",
        "platform": "Vercel Serverless",
    }


# Safely include full router
import_error = None
try:
    from seal.edgereactor.router import router

    app.include_router(router)
except Exception as e:
    import_error = {"error": str(e), "traceback": traceback.format_exc()}


@app.get("/api/diag")
def diagnostics() -> Dict[str, Any]:
    return {
        "status": "online",
        "import_error": import_error,
        "sys_path": sys.path,
        "cwd": os.getcwd(),
        "files_in_root": os.listdir(str(root_dir)) if root_dir.exists() else [],
    }

