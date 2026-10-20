"""Configuration for OpenSEAL (Low-SWaP OT/ICS Cyber SEAL clone)."""

from pydantic import BaseModel, Field
from typing import Dict, Any


class OpenSEALConfig(BaseModel):
    # Edge System Identification
    node_id: str = "edgereactor-node-01"
    environment_name: str = "Water Treatment & Substation Alpha"
    purdue_level: str = "Level 2 (Supervisory)"

    # Server & API Settings
    host: str = "127.0.0.1"
    port: int = 8080
    debug: bool = False

    # Low-SWaP Resource Constraints (Edge Memory Protection)
    max_event_buffer_size: int = Field(default=5000, description="Max circular event buffer in memory")
    max_active_watchpoint_states: int = Field(default=1000, description="Max active temporal state machines")
    state_retention_seconds: float = Field(default=120.0, description="Eviction TTL for uncompleted state machines")

    # eLEARN Baseline Profiler Settings
    elearn_warmup_events: int = 100
    elearn_ewma_alpha: float = 0.2
    elearn_cusum_threshold: float = 3.5  # Standard deviations for cumulative sum drift
    elearn_min_samples: int = 20

    # OT Simulator Settings
    simulator_enabled: bool = True
    modbus_host: str = "127.0.0.1"
    modbus_port: int = 5020
    polling_interval_seconds: float = 1.0

    # Effects Language (EL) Safety Guardrails
    el_safe_simulation_only: bool = True
    el_max_concurrent_scenarios: int = 2

    # Upstream SIEM / Syslog Integration
    syslog_export_enabled: bool = False
    syslog_host: str = "127.0.0.1"
    syslog_port: int = 514


config = OpenSEALConfig()
