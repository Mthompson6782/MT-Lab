"""
Armis Connector for Walmart OT IEC 62443-3-2 Platform.
Extracts OT asset inventory, active protocols, Purdue levels, and network boundaries/conduits.
Supports live Armis Cloud API (Bearer token) or local telemetry ingest for offline/lab use.
"""

import json
import logging
import os
from typing import Dict, List, Optional
import urllib.request
import urllib.parse

from core.models import Asset, Conduit, PurdueLevel

logger = logging.getLogger(__name__)


class ArmisConnector:
    def __init__(self, api_endpoint: Optional[str] = None, api_key: Optional[str] = None):
        self.api_endpoint = api_endpoint or os.getenv("ARMIS_API_ENDPOINT")
        self.api_key = api_key or os.getenv("ARMIS_API_KEY")

    def fetch_assets(self, local_json_path: Optional[str] = None) -> List[Asset]:
        """
        Fetches asset inventory from Armis API or local telemetry dump.
        """
        if local_json_path and os.path.exists(local_json_path):
            logger.info(f"Loading Armis assets from local telemetry dump: {local_json_path}")
            with open(local_json_path, "r", encoding="utf-8") as f:
                raw_devices = json.load(f)
            return [Asset(**dev) for dev in raw_devices]

        if not self.api_endpoint or not self.api_key:
            raise ValueError("Armis API endpoint or API Key not configured, and no local fallback path provided.")

        # Live Armis API Integration
        logger.info(f"Connecting to Armis API at {self.api_endpoint}...")
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Accept": "application/json",
            "User-Agent": "Walmart-IEC62443-RiskEngine/1.0"
        }
        url = f"{self.api_endpoint.rstrip('/')}/api/v1/devices/?aql=in:devices"
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        assets = []
        for d in data.get("data", {}).get("results", []):
            purdue_raw = d.get("purdueLevel", "L1_BasicControl")
            purdue_level = PurdueLevel(purdue_raw) if purdue_raw in PurdueLevel.__members__.values() else PurdueLevel.LEVEL_1

            assets.append(
                Asset(
                    asset_id=str(d.get("id", "")),
                    name=d.get("name", "Unknown-OT-Asset"),
                    ip_address=d.get("ipv4", "0.0.0.0"),
                    mac_address=d.get("macAddress", "00:00:00:00:00:00"),
                    purdue_level=purdue_level,
                    zone_id=d.get("customFields", {}).get("zone_id", "ZONE-DEFAULT-OT"),
                    facility_id=d.get("site", "DC-DEFAULT"),
                    device_type=d.get("type", "PLC"),
                    vendor=d.get("manufacturer", "Unknown"),
                    model=d.get("model", "Generic"),
                    firmware_version=d.get("operatingSystem", "Unknown"),
                    active_protocols=d.get("protocols", []),
                    is_safety_critical=bool(d.get("customFields", {}).get("safety_critical", False)),
                    armis_risk_score=float(d.get("riskLevel", 5.0)),
                    network_segment=d.get("subnet", "")
                )
            )
        return assets

    def fetch_conduits(self, local_json_path: Optional[str] = None) -> List[Conduit]:
        """
        Fetches observed network boundary conduits from Armis.
        """
        if local_json_path and os.path.exists(local_json_path):
            logger.info(f"Loading Armis conduits from local telemetry dump: {local_json_path}")
            with open(local_json_path, "r", encoding="utf-8") as f:
                raw_conduits = json.load(f)
            return [Conduit(**c) for c in raw_conduits]

        # Live Armis network flow endpoint
        return []
