"""MITRE ATT&CK for ICS Taxonomy Catalog and Helpers."""

from typing import Dict
from pydantic import BaseModel


class MITREICSTechnique(BaseModel):
    technique_id: str
    name: str
    tactic: str
    description: str
    reference_url: str


ICS_CATALOG: Dict[str, MITREICSTechnique] = {
    "T0855": MITREICSTechnique(
        technique_id="T0855",
        name="Unauthorized Command Message",
        tactic="Execution",
        description="Adversaries may send unauthorized command messages to control devices, initiating actions or altering states.",
        reference_url="https://attack.mitre.org/techniques/T0855/",
    ),
    "T0836": MITREICSTechnique(
        technique_id="T0836",
        name="Modify Parameter",
        tactic="Impair Process Control",
        description="Adversaries may modify system parameters (setpoints, thresholds, alarms) to alter physical processes.",
        reference_url="https://attack.mitre.org/techniques/T0836/",
    ),
    "T0814": MITREICSTechnique(
        technique_id="T0814",
        name="Denial of Service",
        tactic="Inhibit Response Function",
        description="Adversaries may flood control networks or services to prevent telemetry or operator intervention.",
        reference_url="https://attack.mitre.org/techniques/T0814/",
    ),
    "T0803": MITREICSTechnique(
        technique_id="T0803",
        name="Block Command Message",
        tactic="Inhibit Response Function",
        description="Adversaries may block legitimate command messages sent between control stations and field controllers.",
        reference_url="https://attack.mitre.org/techniques/T0803/",
    ),
    "T0888": MITREICSTechnique(
        technique_id="T0888",
        name="Loss of Safety",
        tactic="Impact",
        description="Adversaries may compromise safety instrumented systems (SIS) or bypass physical interlocks.",
        reference_url="https://attack.mitre.org/techniques/T0888/",
    ),
    "T0843": MITREICSTechnique(
        technique_id="T0843",
        name="Program Download",
        tactic="Persistence / Lateral Movement",
        description="Adversaries may download new ladder logic or control programs to a PLC.",
        reference_url="https://attack.mitre.org/techniques/T0843/",
    ),
    "T0846": MITREICSTechnique(
        technique_id="T0846",
        name="Remote System Discovery",
        tactic="Discovery",
        description="Adversaries may attempt to discover other systems and PLCs on the OT network.",
        reference_url="https://attack.mitre.org/techniques/T0846/",
    ),
}
