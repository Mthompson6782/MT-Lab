"""Alert and Incident Models for OpenSEAL."""

import time
import uuid
from enum import Enum
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field
from seal.models.playbooks import ResponsePlaybook


class AlertSeverity(str, Enum):
    INFO = "INFO"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class OTAlert(BaseModel):
    alert_id: str = Field(default_factory=lambda: f"SEAL-ALT-{str(uuid.uuid4())[:8].upper()}")
    timestamp: float = Field(default_factory=time.time)
    severity: AlertSeverity = AlertSeverity.MEDIUM
    title: str
    description: str
    detector: str  # e.g., "HBL_ENGINE", "ELEARN_PROFILER", "EL_SIMULATOR"

    # MITRE ATT&CK for ICS Mapping
    mitre_ics_id: Optional[str] = "T0855"
    mitre_ics_name: Optional[str] = "Unauthorized Command Message"

    # OT Context
    assets_involved: List[str] = Field(default_factory=list)
    purdue_level: str = "Level 1 - Basic Control"
    causality_chain: List[Dict[str, Any]] = Field(
        default_factory=list,
        description="Temporal sequence of events satisfying the Happened-Before relation"
    )
    confidence_score: float = 0.95

    # EdgeReactor Guided Response
    playbook: Optional[ResponsePlaybook] = None
    acknowledged: bool = False
    resolved: bool = False
    notes: Optional[str] = None
