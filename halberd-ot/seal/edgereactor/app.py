"""FastAPI application with WebSockets for EdgeReactor Operator Dashboard."""

import asyncio
import json
from contextlib import asynccontextmanager
from pathlib import Path
from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
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


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: subscribe manager to HALBERD system event stream
    try:
        loop = asyncio.get_running_loop()

        def sync_broadcast(msg: dict):
            asyncio.run_coroutine_threadsafe(manager.broadcast_json(msg), loop)

        system.subscribe_ui(sync_broadcast)

        # Start plant simulator and Modbus server (safely ignore socket errors in serverless/cloud environments)
        await system.start(start_simulator=True)
    except Exception as e:
        print(f"[!] Warning during EdgeReactor startup: {e}")
    yield
    # Shutdown
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

# Mount Static Files
static_dir = Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")


@app.get("/")
async def root():
    index_file = static_dir / "index.html"
    return FileResponse(str(index_file))


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
