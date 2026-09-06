"""RESTful API routes for EdgeReactor Operator Dashboard."""

from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from seal.core import system
from seal.models.alerts import OTAlert
from seal.models.topology import AssetStatus


router = APIRouter(prefix="/api")


class EmulationRequest(BaseModel):
    campaign_type: str  # "chemical_overdose" or "false_data_injection"


class StepCompletionRequest(BaseModel):
    completed: bool
    notes: str = ""


@router.get("/status")
def get_status() -> Dict[str, Any]:
    stats = system.hbl.get_stats()
    return {
        "node_id": system.config.node_id,
        "environment": system.config.environment_name,
        "purdue_level": system.config.purdue_level,
        "uptime_seconds": stats["uptime_seconds"],
        "events_processed": stats["events_processed"],
        "alerts_count": len(system.alert_history),
        "active_watchpoints": stats["registered_watchpoints"],
        "simulator_running": system.sensor_stream.is_running,
    }


@router.get("/topology")
def get_topology() -> Dict[str, Any]:
    return system.topology.model_dump()


@router.get("/telemetry")
def get_telemetry() -> Dict[str, Any]:
    return system.plant.get_state()


@router.get("/alerts")
def get_alerts() -> List[Dict[str, Any]]:
    return [a.model_dump() for a in reversed(system.alert_history)]


@router.post("/alerts/{alert_id}/ack")
def acknowledge_alert(alert_id: str) -> Dict[str, Any]:
    for alert in system.alert_history:
        if alert.alert_id == alert_id:
            alert.acknowledged = True
            return {"status": "success", "alert_id": alert_id}
    raise HTTPException(status_code=404, detail="Alert not found")


@router.post("/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: str) -> Dict[str, Any]:
    for alert in system.alert_history:
        if alert.alert_id == alert_id:
            alert.resolved = True
            # Reset asset statuses to HEALTHY
            for ip in alert.assets_involved:
                for asset in system.topology.assets.values():
                    if asset.ip_address == ip:
                        asset.status = AssetStatus.HEALTHY
            return {"status": "success", "alert_id": alert_id}
    raise HTTPException(status_code=404, detail="Alert not found")


@router.get("/playbooks")
def get_playbooks() -> Dict[str, Any]:
    return {k: pb.model_dump() for k, pb in system.playbooks.items()}


@router.post("/playbooks/{playbook_id}/step/{step_id}/toggle")
def toggle_playbook_step(playbook_id: str, step_id: int, req: StepCompletionRequest) -> Dict[str, Any]:
    if playbook_id not in system.playbooks:
        raise HTTPException(status_code=404, detail="Playbook not found")
    pb = system.playbooks[playbook_id]
    for step in pb.steps:
        if step.step_id == step_id:
            step.completed = req.completed
            step.operator_notes = req.notes
            return {"status": "success", "step_id": step_id, "completed": step.completed}
    raise HTTPException(status_code=404, detail="Step not found")


@router.get("/watchpoints")
def get_watchpoints() -> List[Dict[str, Any]]:
    return [wp.model_dump() for wp in system.hbl.watchpoints.values()]


@router.post("/emulate")
async def trigger_emulation(req: EmulationRequest) -> Dict[str, Any]:
    try:
        res = await system.trigger_emulation(req.campaign_type)
        return {"status": "success", "result": res}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
