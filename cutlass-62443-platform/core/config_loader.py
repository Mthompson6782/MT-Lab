"""
Loads CUTLASS policy-as-code configuration (YAML) so engines read config instead of hard-coding it.
"""

import os
from typing import Any, Dict, Optional

import yaml

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_DIR = os.path.join(BASE_DIR, "config")


def _load(path: str) -> Dict[str, Any]:
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def load_risk_matrix(path: Optional[str] = None) -> Dict[str, Any]:
    return _load(path or os.path.join(CONFIG_DIR, "risk_matrix.yaml"))


def load_sl2_requirements(path: Optional[str] = None) -> Dict[str, Any]:
    return _load(path or os.path.join(CONFIG_DIR, "standards", "iec62443_sl2_requirements.yaml"))


def load_control_catalog(path: Optional[str] = None) -> Dict[str, Any]:
    return _load(path or os.path.join(CONFIG_DIR, "control_catalog.yaml"))


def load_component_capabilities(path: Optional[str] = None) -> Dict[str, Any]:
    p = path or os.path.join(CONFIG_DIR, "component_capabilities.yaml")
    return _load(p) if os.path.exists(p) else {"components": []}


def load_site_survey(facility_id: str, path: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """Returns the survey dict, or None if no survey exists (=> every SR without telemetry is no_evidence)."""
    p = path or os.path.join(BASE_DIR, "data", "sites", facility_id, "survey.yaml")
    if not os.path.exists(p):
        return None
    data = _load(p)
    data["_path"] = p
    return data
