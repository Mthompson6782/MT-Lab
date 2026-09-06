"""OT/ICS Event and Telemetry Models."""

import time
import uuid
from enum import Enum
from typing import Any, Dict, Optional, Union
from pydantic import BaseModel, Field


class IndustrialProtocol(str, Enum):
    MODBUS_TCP = "MODBUS_TCP"
    DNP3 = "DNP3"
    S7COMM = "S7COMM"
    OPC_UA = "OPC_UA"
    ETHERNET_IP = "ETHERNET_IP"
    PROCESS_SENSOR = "PROCESS_SENSOR"
    SYSLOG = "SYSLOG"


class PurdueLevel(str, Enum):
    LEVEL_0 = "Level 0 - Process"
    LEVEL_1 = "Level 1 - Basic Control"
    LEVEL_2 = "Level 2 - Supervisory"
    LEVEL_3 = "Level 3 - Operations / Historian"
    LEVEL_3_5 = "Level 3.5 - DMZ"
    LEVEL_4_5 = "Level 4/5 - Enterprise IT"


class OTEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    timestamp: float = Field(default_factory=time.time)
    source_ip: str
    source_port: int = 0
    dest_ip: str
    dest_port: int = 502
    protocol: IndustrialProtocol = IndustrialProtocol.MODBUS_TCP
    purdue_source: PurdueLevel = PurdueLevel.LEVEL_2
    purdue_dest: PurdueLevel = PurdueLevel.LEVEL_1

    # Industrial Protocol Fields
    unit_id: Optional[int] = 1
    function_code: Optional[int] = None
    function_name: Optional[str] = None
    register_address: Optional[int] = None
    register_value: Optional[Union[int, float, list, str]] = None

    # Cyber-Physical Process Tag
    process_tag: Optional[str] = None
    unit_of_measure: Optional[str] = None

    # Status & Anomaly Flags
    status: str = "NORMAL"
    is_anomaly: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)

    def matches(self, criteria: Dict[str, Any]) -> bool:
        """Evaluate if this event satisfies filtering criteria."""
        for key, expected_val in criteria.items():
            if not hasattr(self, key):
                if key in self.metadata:
                    actual_val = self.metadata[key]
                else:
                    return False
            else:
                actual_val = getattr(self, key)

            if isinstance(expected_val, list):
                if actual_val not in expected_val:
                    return False
            elif callable(expected_val):
                if not expected_val(actual_val):
                    return False
            elif actual_val != expected_val:
                return False
        return True
