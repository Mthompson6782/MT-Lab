"""
Regression tests for evidence-based SL-A and control-based residual risk.
Run:  python -m unittest discover -s tests -v   (from cutlass-62443-platform/)
"""
import os
import sys
import unittest
from datetime import date

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.control_credits import ControlCreditEngine
from core.models import Asset, Conduit, PurdueLevel, SystemUnderConsideration, Vulnerability, Zone
from core.risk_engine import RiskEngine
from core.risk_matrix import RiskMatrix
from core.sl_evaluator import SecurityLevelEvaluator

SL2 = {"foundational_requirements": {
    "FR1": {"sl2_requirements": [{"id": "SR 1.1", "title": "Human user I&A"}]},
    "FR2": {"sl2_requirements": [{"id": "SR 2.1", "title": "Authorization enforcement"}]},
    "FR5": {"sl2_requirements": [{"id": "SR 5.1", "title": "Segmentation"}, {"id": "SR 5.2", "title": "Boundary protection"}]},
}}


def plc(zone="Z-L1", protocols=("Modbus-TCP",), vulns=()):
    return Asset(asset_id="A1", name="PLC-1", ip_address="10.0.0.1", mac_address="00:00:00:00:00:01",
                 purdue_level=PurdueLevel.LEVEL_1, zone_id=zone, facility_id="F1", device_type="PLC",
                 vendor="V", model="M", firmware_version="1", active_protocols=list(protocols),
                 vulnerabilities=list(vulns))


def suc_with(asset, conduits=()):
    z = Zone(zone_id=asset.zone_id, name="L1", facility_id="F1", purdue_level=PurdueLevel.LEVEL_1, assets=[asset])
    cd = {c.conduit_id: c for c in conduits}
    for c in conduits:
        if c.to_zone_id == z.zone_id:
            z.inbound_conduits.append(c.conduit_id)
    return SystemUnderConsideration(suc_id="S", name="S", facility_type="DC", location="x",
                                    zones={z.zone_id: z}, conduits=cd, assessment_timestamp="t")


class TestSLA(unittest.TestCase):
    def evaluate(self, suc, survey):
        return SecurityLevelEvaluator(survey=survey, sl2_requirements=SL2, capabilities={"components": []},
                                      as_of=date(2026, 9, 24)).evaluate_suc_security_levels(suc)

    def test_no_evidence_is_never_a_pass(self):
        suc = self.evaluate(suc_with(plc()), survey={})
        z = suc.zones["Z-L1"]
        self.assertEqual(z.fr_results["FR2"].status, "unverified")
        self.assertFalse(z.sl_verified)
        self.assertEqual(suc.sl2_compliance_percentage, 0.0)
        self.assertIn("SR 2.1 Authorization enforcement", z.survey_worklist)

    def test_attested_met_achieves_sl2(self):
        survey = {"facility_wide": {sr: {"status": "met", "attested_on": "2026-09-01"} for sr in ("SR 1.1", "SR 2.1", "SR 5.1", "SR 5.2")}}
        z = self.evaluate(suc_with(plc()), survey).zones["Z-L1"]
        self.assertEqual(z.fr_results["FR2"].sl_a, 2.0)
        self.assertTrue(z.fr_results["FR2"].verified)

    def test_expired_attestation_reverts_to_no_evidence(self):
        survey = {"facility_wide": {"SR 2.1": {"status": "met", "attested_on": "2024-01-01", "expires": "2025-01-01"}}}
        z = self.evaluate(suc_with(plc()), survey).zones["Z-L1"]
        self.assertEqual(z.fr_results["FR2"].status, "unverified")

    def test_observed_violation_overrides_attested_met(self):
        rogue = Conduit(conduit_id="C1", name="IT->L1", from_zone_id="Z-IT", to_zone_id="Z-L1",
                        traverses_dmz=False, has_firewall_inspection=False)
        survey = {"facility_wide": {"SR 5.1": {"status": "met", "attested_on": "2026-09-01"},
                                    "SR 5.2": {"status": "met", "attested_on": "2026-09-01"}}}
        z = self.evaluate(suc_with(plc(), [rogue]), survey).zones["Z-L1"]
        self.assertEqual(z.fr_results["FR5"].sl_a, 0.0)
        self.assertEqual(z.fr_results["FR5"].status, "deficient")

    def test_sl_c_caps_unless_compensated(self):
        survey = {"facility_wide": {sr: {"status": "met", "attested_on": "2026-09-01"} for sr in ("SR 1.1", "SR 2.1", "SR 5.1", "SR 5.2")}}
        caps = {"components": [{"match": {"vendor": "V", "model": "M"}, "sl_c": {"FR1": 1},
                                "compensable_by": {"FR1": ["CC-JUMPHOST-MFA"]}}]}
        ev = SecurityLevelEvaluator(survey=survey, sl2_requirements=SL2, capabilities=caps, as_of=date(2026, 9, 24))
        z = ev.evaluate_suc_security_levels(suc_with(plc())).zones["Z-L1"]
        self.assertEqual(z.fr_results["FR1"].sl_a, 1.0)
        survey["controls_implemented"] = [{"control_id": "CC-JUMPHOST-MFA", "zones": ["*"]}]
        ev = SecurityLevelEvaluator(survey=survey, sl2_requirements=SL2, capabilities=caps, as_of=date(2026, 9, 24))
        z = ev.evaluate_suc_security_levels(suc_with(plc())).zones["Z-L1"]
        self.assertEqual(z.fr_results["FR1"].sl_a, 2.0)


class TestResidual(unittest.TestCase):
    VULN = Vulnerability(cve_id="CVE-TEST-0001", title="t", cvss_score=9.8, cisa_kev=True, description="d",
                         cvss_vector="CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H")

    def scenario(self, survey):
        rogue = Conduit(conduit_id="C1", name="IT->L1", from_zone_id="Z-IT", to_zone_id="Z-L1",
                        traverses_dmz=False, has_firewall_inspection=False, violates_policy=True)
        suc = suc_with(plc(vulns=[self.VULN]), [rogue])
        return RiskEngine(survey=survey).evaluate_suc_risk(suc).zones["Z-L1"].threat_scenarios[0]

    def test_no_implemented_controls_means_residual_equals_inherent(self):
        s = self.scenario(survey={})
        self.assertEqual(s.residual_likelihood, s.unmitigated_likelihood)
        self.assertEqual(s.residual_risk_level, s.unmitigated_risk_level)
        self.assertLessEqual(s.projected_residual_likelihood, s.residual_likelihood)

    def test_detective_control_earns_no_credit(self):
        s = self.scenario(survey={"controls_implemented": [{"control_id": "CC-ARMIS-ALERT", "zones": ["*"]}]})
        self.assertEqual(s.residual_likelihood, s.unmitigated_likelihood)

    def test_partial_coverage_is_limited_by_weakest_action(self):
        # DPI covers logic_download only; network_exploit is uncovered -> no action-stage credit
        s = self.scenario(survey={"controls_implemented": [{"control_id": "CC-DPI-WRITE-BLOCK", "zones": ["*"]}]})
        self.assertEqual(s.residual_likelihood, s.unmitigated_likelihood)

    def test_access_stage_control_reduces_likelihood(self):
        s = self.scenario(survey={"controls_implemented": [{"control_id": "CC-DMZ-ENFORCE", "zones": ["*"]}]})
        self.assertEqual(s.residual_likelihood, max(1, s.unmitigated_likelihood - 2))
        self.assertEqual(s.residual_consequence, s.unmitigated_consequence)  # cyber controls never lower C


class TestMatrix(unittest.TestCase):
    def test_tolerable_is_moderate(self):
        m = RiskMatrix()
        self.assertTrue(m.is_tolerable("Moderate"))
        self.assertFalse(m.is_tolerable("High"))
        self.assertEqual(m.level(5, 1), "Moderate")
        self.assertEqual(m.level(5, 5), "Critical")
        self.assertTrue(m.needs_detailed_assessment("High"))


if __name__ == "__main__":
    unittest.main()
