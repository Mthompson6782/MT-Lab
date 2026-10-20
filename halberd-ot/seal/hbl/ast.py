"""Abstract Syntax Tree and Declarative Models for Happened-Before Language (HBL™)."""

from enum import Enum
from typing import Any, Callable, Dict, List, Optional, Union
from pydantic import BaseModel, Field
from seal.models.events import OTEvent
from seal.models.alerts import AlertSeverity


class Operator(str, Enum):
    EQUALS = "=="
    NOT_EQUALS = "!="
    GREATER = ">"
    GREATER_EQUAL = ">="
    LESS = "<"
    LESS_EQUAL = "<="
    IN = "in"
    NOT_IN = "not_in"
    STARTS_WITH = "startswith"
    EXISTS = "exists"


class FieldPredicate(BaseModel):
    field: str
    operator: Operator = Operator.EQUALS
    value: Any = None

    def evaluate(self, event: OTEvent) -> bool:
        """Evaluate predicate against an OT event."""
        # Check standard fields first, then metadata
        if hasattr(event, self.field):
            actual = getattr(event, self.field)
        elif self.field in event.metadata:
            actual = event.metadata[self.field]
        else:
            if self.operator == Operator.EXISTS:
                return False
            return False

        if self.operator == Operator.EXISTS:
            return actual is not None
        if self.operator == Operator.EQUALS:
            return actual == self.value
        if self.operator == Operator.NOT_EQUALS:
            return actual != self.value
        if self.operator == Operator.GREATER:
            return actual is not None and actual > self.value
        if self.operator == Operator.GREATER_EQUAL:
            return actual is not None and actual >= self.value
        if self.operator == Operator.LESS:
            return actual is not None and actual < self.value
        if self.operator == Operator.LESS_EQUAL:
            return actual is not None and actual <= self.value
        if self.operator == Operator.IN:
            return actual in self.value if self.value is not None else False
        if self.operator == Operator.NOT_IN:
            return actual not in self.value if self.value is not None else True
        if self.operator == Operator.STARTS_WITH:
            return str(actual).startswith(str(self.value))
        return False


class EventPattern(BaseModel):
    label: str  # e.g., "recon", "auth", "write_param", "plc_stop"
    predicates: List[FieldPredicate] = Field(default_factory=list)

    def matches(self, event: OTEvent) -> bool:
        """Check if event satisfies all field predicates."""
        return all(p.evaluate(event) for p in self.predicates)


class Correlation(BaseModel):
    step_source_idx: int  # index of preceding event in sequence
    source_field: str     # e.g., "dest_ip"
    step_target_idx: int  # index of succeeding event in sequence
    target_field: str     # e.g., "dest_ip"

    def satisfied(self, events: List[OTEvent]) -> bool:
        if len(events) <= max(self.step_source_idx, self.step_target_idx):
            return False
        ev_src = events[self.step_source_idx]
        ev_tgt = events[self.step_target_idx]
        val_src = getattr(ev_src, self.source_field, ev_src.metadata.get(self.source_field))
        val_tgt = getattr(ev_tgt, self.target_field, ev_tgt.metadata.get(self.target_field))
        return val_src == val_tgt


class HBLWatchpoint(BaseModel):
    rule_id: str
    name: str
    description: str
    severity: AlertSeverity = AlertSeverity.HIGH
    mitre_ics_id: str = "T0855"
    mitre_ics_name: str = "Unauthorized Command Message"
    
    # Temporal sequence: step 0 happened_before step 1 happened_before ...
    sequence: List[EventPattern] = Field(default_factory=list)
    within_seconds: float = 30.0
    
    # Inter-event attribute correlations (e.g. same destination asset)
    correlations: List[Correlation] = Field(default_factory=list)
    
    # Exclusion pattern: sequence is void if an exclusion event occurs in between
    exclusion_patterns: List[EventPattern] = Field(default_factory=list)
    
    # Linked EdgeReactor playbook ID
    playbook_id: Optional[str] = None
