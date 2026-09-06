"""Purdue Model Asset and Conduit Topology Manager."""

from typing import Dict
from seal.models.topology import (
    AssetStatus,
    OTConduit,
    PurdueAsset,
    PurdueTopology,
)


def create_default_plant_topology() -> PurdueTopology:
    """Creates default Purdue topology for Water Treatment & Substation Alpha."""
    assets: Dict[str, PurdueAsset] = {
        # Level 0
        "SENSOR-CHL-01": PurdueAsset(
            asset_id="SENSOR-CHL-01",
            name="In-line Residual Chlorine Analyzer",
            ip_address="192.168.1.101",
            purdue_level=0,
            level_label="Level 0 - Process Sensors",
            asset_type="SENSOR",
            status=AssetStatus.HEALTHY,
            protocols=["4-20mA / HART"],
            criticality="SAFETY_CRITICAL",
        ),
        "SENSOR-LVL-01": PurdueAsset(
            asset_id="SENSOR-LVL-01",
            name="Tank 1 Radar Level Transmitter",
            ip_address="192.168.1.102",
            purdue_level=0,
            level_label="Level 0 - Process Sensors",
            asset_type="SENSOR",
            status=AssetStatus.HEALTHY,
            protocols=["4-20mA / MODBUS_RTU"],
            criticality="HIGH",
        ),
        "VALVE-IN-01": PurdueAsset(
            asset_id="VALVE-IN-01",
            name="Raw Water Intake Actuator Valve",
            ip_address="192.168.1.103",
            purdue_level=0,
            level_label="Level 0 - Actuators",
            asset_type="VALVE",
            status=AssetStatus.HEALTHY,
            protocols=["MODBUS_RTU"],
            criticality="HIGH",
        ),

        # Level 1
        "PLC-01": PurdueAsset(
            asset_id="PLC-01",
            name="Core Process Controller (Main PLC)",
            ip_address="192.168.1.10",
            purdue_level=1,
            level_label="Level 1 - Basic Control",
            asset_type="PLC",
            status=AssetStatus.HEALTHY,
            vendor="Siemens S7-1500 / Schneider M580",
            protocols=["MODBUS_TCP", "S7COMM"],
            criticality="SAFETY_CRITICAL",
        ),
        "PLC-02": PurdueAsset(
            asset_id="PLC-02",
            name="High-Service Pump Controller",
            ip_address="192.168.1.11",
            purdue_level=1,
            level_label="Level 1 - Basic Control",
            asset_type="PLC",
            status=AssetStatus.HEALTHY,
            vendor="Schneider Modicon M340",
            protocols=["MODBUS_TCP"],
            criticality="HIGH",
        ),

        # Level 2
        "HMI-01": PurdueAsset(
            asset_id="HMI-01",
            name="Control Room Operator SCADA Station",
            ip_address="192.168.1.50",
            purdue_level=2,
            level_label="Level 2 - Supervisory HMI",
            asset_type="HMI",
            status=AssetStatus.HEALTHY,
            protocols=["MODBUS_TCP", "OPC_UA"],
            criticality="HIGH",
        ),
        "EWS-01": PurdueAsset(
            asset_id="EWS-01",
            name="Automation Engineering Workstation",
            ip_address="192.168.1.60",
            purdue_level=2,
            level_label="Level 2 - Engineering Workstation",
            asset_type="EWS",
            status=AssetStatus.HEALTHY,
            protocols=["MODBUS_TCP", "S7COMM"],
            criticality="MEDIUM",
        ),

        # Level 3
        "HIST-01": PurdueAsset(
            asset_id="HIST-01",
            name="Plant Operations Historian",
            ip_address="192.168.2.10",
            purdue_level=3,
            level_label="Level 3 - Operations Historian",
            asset_type="HISTORIAN",
            status=AssetStatus.HEALTHY,
            protocols=["OPC_UA", "HTTPS"],
            criticality="MEDIUM",
        ),

        # Level 3.5
        "FW-IDMZ": PurdueAsset(
            asset_id="FW-IDMZ",
            name="Industrial DMZ Security Gateway",
            ip_address="192.168.3.1",
            purdue_level=3,
            level_label="Level 3.5 - IDMZ Conduit",
            asset_type="GATEWAY",
            status=AssetStatus.HEALTHY,
            protocols=["IPSEC", "TLS"],
            criticality="HIGH",
        ),
    }

    conduits: Dict[str, OTConduit] = {
        "C-101": OTConduit(
            conduit_id="C-101",
            source_asset_id="HMI-01",
            dest_asset_id="PLC-01",
            allowed_protocols=["MODBUS_TCP"],
            allowed_function_codes=[3, 4],
        ),
        "C-102": OTConduit(
            conduit_id="C-102",
            source_asset_id="EWS-01",
            dest_asset_id="PLC-01",
            allowed_protocols=["MODBUS_TCP", "S7COMM"],
            allowed_function_codes=[3, 6, 16],
        ),
        "C-103": OTConduit(
            conduit_id="C-103",
            source_asset_id="PLC-01",
            dest_asset_id="HIST-01",
            allowed_protocols=["OPC_UA"],
            allowed_function_codes=[],
        ),
    }

    return PurdueTopology(assets=assets, conduits=conduits)
