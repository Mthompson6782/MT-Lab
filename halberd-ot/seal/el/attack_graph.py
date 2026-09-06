"""Attack Graph and EffectStep definitions for Effects Language (EL™)."""

from enum import Enum
from typing import Any, Callable, Dict, List, Optional
import networkx as nx
from pydantic import BaseModel, Field
from seal.el.mitre_ics import ICS_CATALOG


class StepStatus(str, Enum):
    PENDING = "PENDING"
    PRECONDITION_WAIT = "PRECONDITION_WAIT"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"


class EffectAction(BaseModel):
    action_type: str  # "MODBUS_WRITE", "MODBUS_DIAGNOSTIC", "INJECT_TELEMETRY", "DISRUPT_CONDUIT"
    target_ip: str = "127.0.0.1"
    target_port: int = 5020
    unit_id: int = 1
    function_code: int = 16
    register_address: Optional[int] = None
    register_value: Optional[Any] = None
    process_tag: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class EffectStep(BaseModel):
    step_id: str
    name: str
    description: str
    technique_id: str = "T0855"
    dependencies: List[str] = Field(default_factory=list)
    precondition_conditions: Dict[str, Any] = Field(
        default_factory=dict,
        description="Lazy precondition evaluation criteria (e.g. minimum tank level, active connection)"
    )
    action: EffectAction
    status: StepStatus = StepStatus.PENDING
    result_message: Optional[str] = None
    timestamp_started: Optional[float] = None
    timestamp_finished: Optional[float] = None

    @property
    def technique_name(self) -> str:
        if self.technique_id in ICS_CATALOG:
            return ICS_CATALOG[self.technique_id].name
        return "Unknown ICS Technique"


class AttackGraph:
    """Directed Acyclic Graph (DAG) coordinating multi-stage adversary campaign emulation."""

    def __init__(self, campaign_id: str, name: str, description: str):
        self.campaign_id = campaign_id
        self.name = name
        self.description = description
        self.graph = nx.DiGraph()
        self.steps: Dict[str, EffectStep] = {}

    def add_step(self, step: EffectStep) -> None:
        self.steps[step.step_id] = step
        self.graph.add_node(step.step_id, step=step)
        for dep in step.dependencies:
            self.graph.add_edge(dep, step.step_id)

    def get_ready_steps(self) -> List[EffectStep]:
        """Return steps whose dependencies have completed and are ready for execution."""
        ready = []
        for step_id, step in self.steps.items():
            if step.status == StepStatus.PENDING:
                # Check all predecessor steps
                predecessors = list(self.graph.predecessors(step_id))
                if all(self.steps[p].status == StepStatus.COMPLETED for p in predecessors):
                    ready.append(step)
        return ready

    def to_dict(self) -> Dict[str, Any]:
        """Serialize attack graph for EdgeReactor GUI visualizer."""
        nodes = []
        for step_id, step in self.steps.items():
            nodes.append({
                "id": step.step_id,
                "name": step.name,
                "description": step.description,
                "technique_id": step.technique_id,
                "technique_name": step.technique_name,
                "status": step.status.value,
                "action": step.action.model_dump(),
                "result": step.result_message,
            })
        edges = []
        for u, v in self.graph.edges():
            edges.append({"from": u, "to": v})

        return {
            "campaign_id": self.campaign_id,
            "name": self.name,
            "description": self.description,
            "nodes": nodes,
            "edges": edges,
        }
