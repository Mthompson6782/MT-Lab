"""YAML and Dictionary Parser for HBL Watchpoint Rules."""

import yaml
from typing import Any, Dict, List, Union
from seal.hbl.ast import (
    Correlation,
    EventPattern,
    FieldPredicate,
    HBLWatchpoint,
    Operator,
)
from seal.models.alerts import AlertSeverity


class HBLParser:
    """Parses declarative HBL watchpoints from YAML or dict configs."""

    @staticmethod
    def parse_dict(data: Dict[str, Any]) -> HBLWatchpoint:
        rule_id = data.get("rule_id", "HBL-GENERIC")
        name = data.get("name", "Unnamed Watchpoint")
        description = data.get("description", "")
        severity = AlertSeverity(data.get("severity", "HIGH"))
        mitre_id = data.get("mitre_ics_id", "T0855")
        mitre_name = data.get("mitre_ics_name", "Unauthorized Command Message")
        within_seconds = float(data.get("within_seconds", 30.0))
        playbook_id = data.get("playbook_id")

        # Parse sequence
        sequence: List[EventPattern] = []
        for step in data.get("sequence", []):
            label = step.get("label", "step")
            preds: List[FieldPredicate] = []
            for p in step.get("predicates", []):
                op_val = p.get("op", p.get("operator", "=="))
                preds.append(
                    FieldPredicate(
                        field=p["field"],
                        operator=Operator(op_val),
                        value=p.get("value"),
                    )
                )
            sequence.append(EventPattern(label=label, predicates=preds))

        # Parse correlations
        correlations: List[Correlation] = []
        for c in data.get("correlations", []):
            correlations.append(
                Correlation(
                    step_source_idx=c.get("step_source", c.get("step_source_idx", 0)),
                    source_field=c.get("field_source", c.get("source_field", "dest_ip")),
                    step_target_idx=c.get("step_target", c.get("step_target_idx", 1)),
                    target_field=c.get("field_target", c.get("target_field", "dest_ip")),
                )
            )

        # Parse exclusions
        exclusions: List[EventPattern] = []
        for ex in data.get("exclusions", []):
            label = ex.get("label", "exclusion")
            preds = [
                FieldPredicate(
                    field=p["field"],
                    operator=Operator(p.get("op", p.get("operator", "=="))),
                    value=p.get("value"),
                )
                for p in ex.get("predicates", [])
            ]
            exclusions.append(EventPattern(label=label, predicates=preds))

        return HBLWatchpoint(
            rule_id=rule_id,
            name=name,
            description=description,
            severity=severity,
            mitre_ics_id=mitre_id,
            mitre_ics_name=mitre_name,
            sequence=sequence,
            within_seconds=within_seconds,
            correlations=correlations,
            exclusion_patterns=exclusions,
            playbook_id=playbook_id,
        )

    @staticmethod
    def parse_yaml(yaml_str: str) -> List[HBLWatchpoint]:
        raw = yaml.safe_load(yaml_str)
        if isinstance(raw, list):
            return [HBLParser.parse_dict(item) for item in raw]
        elif isinstance(raw, dict):
            if "watchpoints" in raw:
                return [HBLParser.parse_dict(item) for item in raw["watchpoints"]]
            return [HBLParser.parse_dict(raw)]
        return []
