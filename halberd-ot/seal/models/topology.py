"""Purdue Model Asset and Conduit Topology Models."""

from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class AssetStatus(str, Enum):
    HEALTHY = "HEALTHY"
    SUSPICIOUS = "SUSPICIOUS"
    COMPROMISED = "COMPROMISED"
    OFFLINE = "OFFLINE"
    ISOLATED = "ISOLATED"


class PurdueAsset(BaseModel):
    asset_id: str
    name: str
    ip_address: str
    mac_address: Optional[str] = None
    purdue_level: int  # 0 to 5
    level_label: str   # e.g., "Level 1 - Basic Control"
    asset_type: str    # "PLC", "HMI", "EWS", "HISTORIAN", "SENSOR", "VALVE", "GATEWAY"
    status: AssetStatus = AssetStatus.HEALTHY
    vendor: Optional[str] = "Siemens / Schneider / Allen-Bradley"
    protocols: List[str] = Field(default_factory=lambda: ["MODBUS_TCP"])
    criticality: str = "HIGH"  # LOW, MEDIUM, HIGH, SAFETY_CRITICAL
    zone: str = "Zone-WaterTreatment"


class OTConduit(BaseModel):
    conduit_id: str
    source_asset_id: str
    dest_asset_id: str
    allowed_protocols: List[str] = Field(default_factory=lambda: ["MODBUS_TCP"])
    allowed_function_codes: List[int] = Field(default_factory=lambda: [3, 4, 6, 16])
    is_active: bool = True
    is_isolated: bool = False
    notes: Optional[str] = None


class PurdueTopology(BaseModel):
    assets: Dict[str, PurdueAsset] = Field(default_factory=dict)
    conduits: Dict[str, OTConduit] = Field(default_factory=dict)
