"""
Zone & Conduit Partitioner (IEC 62443-3-2 Clause Z1 & Z3).
Partitions the System Under Consideration (SuC) into Purdue-aligned Zones and Conduits.
"""

from typing import Dict, List
from core.models import Asset, Conduit, PurdueLevel, SystemUnderConsideration, Zone


class ZonePartitioner:
    def __init__(self, facility_id: str, facility_type: str = "Distribution Center"):
        self.facility_id = facility_id
        self.facility_type = facility_type

    def build_system_under_consideration(
        self,
        name: str,
        assets: List[Asset],
        conduits: List[Conduit],
        assessment_time: str
    ) -> SystemUnderConsideration:
        """
        Organizes assets and conduits into formal IEC 62443-3-2 Zones.
        """
        zones: Dict[str, Zone] = {}

        # Default Zone mapping based on Purdue level and process
        for asset in assets:
            z_id = asset.zone_id
            if z_id not in zones:
                # Determine zone criticality based on safety-critical flags and device types
                criticality = 3
                if asset.is_safety_critical or "AMMONIA" in z_id:
                    criticality = 5
                elif "SORTER" in z_id or "ASRS" in z_id:
                    criticality = 4
                elif asset.purdue_level == PurdueLevel.LEVEL_3_5:
                    criticality = 3

                zones[z_id] = Zone(
                    zone_id=z_id,
                    name=z_id.replace("ZONE-", "").replace("-", " ").title(),
                    facility_id=self.facility_id,
                    purdue_level=asset.purdue_level,
                    target_sl=2,  # Mandatory across the board
                    zone_criticality=criticality,
                    assets=[]
                )
            zones[z_id].assets.append(asset)

        # Attach conduits to zones
        conduit_dict = {c.conduit_id: c for c in conduits}
        for c in conduits:
            if c.from_zone_id in zones:
                zones[c.from_zone_id].outbound_conduits.append(c.conduit_id)
            if c.to_zone_id in zones:
                zones[c.to_zone_id].inbound_conduits.append(c.conduit_id)

        suc = SystemUnderConsideration(
            suc_id=f"SUC-{self.facility_id}",
            name=name,
            facility_type=self.facility_type,
            location=f"Walmart Supply Chain Operations - {self.facility_id}",
            zones=zones,
            conduits=conduit_dict,
            target_security_level_global=2,
            assessment_timestamp=assessment_time,
            total_assets=len(assets),
            total_cves=sum(len(a.vulnerabilities) for a in assets)
        )
        return suc
