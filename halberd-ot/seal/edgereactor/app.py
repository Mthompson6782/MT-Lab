"""FastAPI application with WebSockets for EdgeReactor Operator Dashboard."""

import asyncio
import json
import os
import sys
from contextlib import asynccontextmanager
from pathlib import Path
from typing import List

# Ensure package root is on sys.path in cloud/serverless environments
pkg_root = Path(__file__).resolve().parent.parent.parent
if str(pkg_root) not in sys.path:
    sys.path.insert(0, str(pkg_root))

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from seal.core import system
from seal.edgereactor.router import router


class WebSocketConnectionManager:
    """Manages connected operator console WebSockets."""

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast_json(self, data: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(data)
            except Exception:
                self.disconnect(connection)


manager = WebSocketConnectionManager()
is_serverless = bool(os.getenv("VERCEL") or os.getenv("AWS_LAMBDA_FUNCTION_NAME") or os.getenv("LAMBDA_TASK_ROOT"))


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Only start background simulator and Modbus TCP listener in persistent environments (not Serverless)
    if not is_serverless:
        try:
            loop = asyncio.get_running_loop()

            def sync_broadcast(msg: dict):
                asyncio.run_coroutine_threadsafe(manager.broadcast_json(msg), loop)

            system.subscribe_ui(sync_broadcast)

            # Start plant simulator and Modbus server
            await system.start(start_simulator=True)
        except Exception as e:
            print(f"[!] Warning during EdgeReactor startup: {e}")
    else:
        # In serverless environment, step plant physics once for baseline telemetry
        try:
            system.plant.step(dt=1.0)
        except Exception:
            pass

    yield

    if not is_serverless:
        try:
            await system.stop()
        except Exception:
            pass


app = FastAPI(
    title="EdgeReactor™ - HALBERD OT Interface",
    version="1.0.0",
    description="Tactical Edge Operator Console for Happened-Before Analytics & Logic Baseline for Edge Response & Defense",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include REST API router
app.include_router(router)

# Mount Static Files safely if directory exists
static_dir = Path(__file__).parent / "static"
if static_dir.exists():
    try:
        app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")
    except Exception as e:
        print(f"[!] Warning mounting static directory: {e}")

public_static = Path(__file__).resolve().parent.parent.parent / "public" / "static"
if public_static.exists() and "/static" not in [r.path for r in app.routes if hasattr(r, "path")]:
    try:
        app.mount("/static", StaticFiles(directory=str(public_static)), name="public_static")
    except Exception as e:
        print(f"[!] Warning mounting public/static directory: {e}")


@app.get("/", response_class=HTMLResponse)
async def root():
    candidates = [
        static_dir / "index.html",
        Path(__file__).resolve().parent.parent.parent / "public" / "index.html",
        Path(__file__).resolve().parent.parent.parent / "public" / "static" / "index.html",
    ]
    for c in candidates:
        if c.exists():
            try:
                return HTMLResponse(content=c.read_text(encoding="utf-8"))
            except Exception:
                pass
    return HTMLResponse(
        content="""<!DOCTYPE html><html><head><title>HALBERD EdgeReactor</title></head>
<body style='background:#020617;color:#f8fafc;font-family:sans-serif;padding:40px;'>
<h1 style='color:#38bdf8;'>HALBERD EdgeReactor™ is Active</h1>
<p>Happened-Before Analytics & Logic Baseline for Edge Response & Defense</p>
<p>API Status: <a href='/api/status' style='color:#38bdf8;'>/api/status</a> | Health: <a href='/api/health' style='color:#38bdf8;'>/api/health</a></p>
</body></html>"""
    )


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial state dump upon connection
        init_payload = {
            "type": "INIT_STATE",
            "status": {
                "node_id": system.config.node_id,
                "environment": system.config.environment_name,
                "purdue_level": system.config.purdue_level,
            },
            "topology": system.topology.model_dump(),
            "telemetry": system.plant.get_state(),
            "alerts": [a.model_dump() for a in system.alert_history],
            "playbooks": {k: pb.model_dump() for k, pb in system.playbooks.items()},
        }
        await websocket.send_json(init_payload)

        while True:
            # Keep socket alive and listen for operator heartbeats or actions
            data = await websocket.receive_text()
            try:
                parsed = json.loads(data)
                if parsed.get("action") == "PING":
                    await websocket.send_json({"type": "PONG"})
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
