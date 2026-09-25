"""
Core Data Models for Walmart IEC 62443-3-2 Risk Assessment Platform.
Supports Armis telemetry, RUNE CVE feeds, Purdue segmentation, and SL-T 2 evaluation.
"""

from enum import Enum
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class PurdueLevel(str, Enum):
    LEVEL_0 = "L0_Process"
    LEVEL_1 = "L1_BasicControl"
    LEVEL_2 = "L2_SupervisoryControl"
    LEVEL_3 = "L3_SiteOperations"
    LEVEL_3_5 = "L3_5_OT_DMZ"
    LEVEL_4 = "L4_EnterpriseIT"
    LEVEL_5 = "L5_Cloud_Internet"


class Vulnerability(BaseModel):
    cve_id: str
    title: str
    cvss_score: float = Field(..., ge=0.0, le=10.0)
    cvss_vector: Optional[str] = None
    epss_score: Optional[float] = 0.0
    cisa_kev: bool = False
    description: str
    affected_components: List[str] = Field(default_factory=list)
    remediation_patch_available: bool = True
    exploitability_in_ot_context: str = "Medium"  # Low, Medium, High, Critical
    rune_risk_rank: Optional[str] = "High"


class Asset(BaseModel):
    asset_id: str
    name: str
    ip_address: str
    mac_address: str
    purdue_level: PurdueLevel
    zone_id: str
    facility_id: str  # e.g., "DC_6094"
    device_type: str  # e.g., "PLC", "HMI", "Robotic_Sorter", "Ammonia_Compressor"
    vendor: str       # e.g., "Rockwell Automation", "Siemens", "Dematic", "Vilter"
    model: str        # e.g., "ControlLogix 1756-L83E"
    firmware_version: str
    active_protocols: List[str] = Field(default_factory=list)  # e.g. ["CIP", "HTTP", "Modbus-TCP"]
    is_safety_critical: bool = False  # e.g. SIS, Ammonia monitoring
    vulnerabilities: List[Vulnerability] = Field(default_factory=list)
    armis_risk_score: Optional[float] = 0.0
    network_segment: Optional[str] = None


class Conduit(BaseModel):
    conduit_id: str
    name: str
    from_zone_id: str
    to_zone_id: str
    allowed_protocols: List[str] = Field(default_factory=list)
    is_encrypted: bool = False
    traverses_dmz: bool = True
    has_firewall_inspection: bool = True
    violates_policy: bool = False
    policy_violation_notes: Optional[str] = None


class SecurityLevelVector(BaseModel):
    """
    Security Level Vector across the 7 IEC 62443-3-3 Foundational Requirements.
    Target SL is 2 across the board.
    """
    fr1_iac: float = 2.0  # Identification and Authentication Control
    fr2_uc: float = 2.0   # Use Control
    fr3_si: float = 2.0   # System Integrity
    fr4_dc: float = 2.0   # Data Confidentiality
    fr5_rdf: float = 2.0  # Restricted Data Flow
    fr6_tre: float = 2.0  # Timely Response to Events
    fr7_ra: float = 2.0   # Resource Availability

    def average(self) -> float:
        vals = [self.fr1_iac, self.fr2_uc, self.fr3_si, self.fr4_dc, self.fr5_rdf, self.fr6_tre, self.fr7_ra]
        return round(sum(vals) / len(vals), 2)

    def min_level(self) -> float:
        vals = [self.fr1_iac, self.fr2_uc, self.fr3_si, self.fr4_dc, self.fr5_rdf, self.fr6_tre, self.fr7_ra]
        return min(vals)


class ThreatScenario(BaseModel):
    scenario_id: str
    title: str
    threat_actor: str
    threat_vector: str
    target_zone_id: str
    target_asset_ids: List[str]
    cve_reference: Optional[str] = None
    unmitigated_likelihood: int = Field(..., ge=1, le=5)
    unmitigated_consequence: int = Field(..., ge=1, le=5)
    unmitigated_risk_score: int = Field(..., ge=1, le=25)
    unmitigated_risk_level: str  # Low, Medium, High, Critical
    operational_impact_summary: str
    recommended_compensating_controls: List[str] = Field(default_factory=list)
    residual_likelihood: int = Field(..., ge=1, le=5)
    residual_consequence: int = Field(..., ge=1, le=5)
    residual_risk_score: int = Field(..., ge=1, le=25)
    residual_risk_level: str


class Zone(BaseModel):
    zone_id: str
    name: str
    facility_id: str
    purdue_level: PurdueLevel
    target_sl: int = 2  # Walmart standard: SL-T 2 across all zones
    achieved_sl_vector: SecurityLevelVector = Field(default_factory=SecurityLevelVector)
    overall_achieved_sl: float = 2.0
    sl_gap: float = 0.0
    assets: List[Asset] = Field(default_factory=list)
    inbound_conduits: List[str] = Field(default_factory=list)
    outbound_conduits: List[str] = Field(default_factory=list)
    threat_scenarios: List[ThreatScenario] = Field(default_factory=list)
    zone_criticality: int = Field(default=3, ge=1, le=5)


class AttackHop(BaseModel):
    step_number: int
    source_node: str
    target_node: str
    action_type: str  # "Initial Access", "Lateral Movement", "Privilege Escalation", "Control Hijack"
    vector: str
    cve_id: Optional[str] = None
    violated_sl2_barrier: str  # e.g., "FR 5.1 DMZ Bypass", "FR 3.1 Unverified Firmware"


class CyberPhysicalBlastRadius(BaseModel):
    physical_process: str
    primary_failure_mode: str
    estimated_downtime_hours: float
    hourly_financial_burn_usd: float
    total_loss_exposure_usd: float
    safety_hazard_level: str  # "None", "Recordable Floor Hazard", "Catastrophic Chemical Release"
    environmental_impact: str
    affected_supply_chain_stores: int
    cascading_upstream_impact: List[str] = Field(default_factory=list)
    cascading_downstream_impact: List[str] = Field(default_factory=list)


class AttackPath(BaseModel):
    path_id: str
    title: str
    adversary_profile: str
    entry_point: str
    target_asset: str
    target_zone: str
    hops: List[AttackHop] = Field(default_factory=list)
    likelihood_rank: str  # "High", "Critical", "Moderate"
    cisa_kev_present: bool = False
    blast_radius: CyberPhysicalBlastRadius


class SystemUnderConsideration(BaseModel):
    suc_id: str
    name: str
    facility_type: str  # e.g., "Distribution Center", "Fulfillment Center", "Cold Storage"
    location: str
    zones: Dict[str, Zone] = Field(default_factory=dict)
    conduits: Dict[str, Conduit] = Field(default_factory=dict)
    target_security_level_global: int = 2
    assessment_timestamp: str
    overall_risk_score: float = 0.0
    sl2_compliance_percentage: float = 0.0
    total_assets: int = 0
    total_cves: int = 0
    attack_paths: List[AttackPath] = Field(default_factory=list)
    total_financial_loss_exposure_usd: float = 0.0
