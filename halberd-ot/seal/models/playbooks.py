"""Operator Response Playbooks for EdgeReactor (Non-Disruptive OT Response)."""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class ActionImpact(str, Enum):
    ZERO_DISRUPTION = "ZERO_DISRUPTION"      # Passive or verifying, no process impact
    MINIMAL_DISRUPTION = "MINIMAL_DISRUPTION" # Read-only locking, conduit isolation without trip
    POTENTIAL_TRIP = "POTENTIAL_TRIP"         # Extreme caution: may trip process loop


class PlaybookStep(BaseModel):
    step_id: int
    title: str
    action_type: str  # e.g., PHYSICAL_VERIFICATION, CONDUIT_ISOLATION, PLC_KEYSWITCH_LOCK, PROCESS_OVERRIDE
    description: str
    impact: ActionImpact = ActionImpact.ZERO_DISRUPTION
    safety_warning: Optional[str] = None
    verification_check: str
    completed: bool = False
    operator_notes: Optional[str] = None


class ResponsePlaybook(BaseModel):
    playbook_id: str
    name: str
    description: str
    target_asset: str
    mitre_ics_technique: str
    steps: List[PlaybookStep] = Field(default_factory=list)
    recommended_recovery_action: str
    non_disruption_guarantee: str = "This playbook preserves plant safety and avoids automated trip of running physical processes."
