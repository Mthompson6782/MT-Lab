"""End-to-end integration test for OpenSEAL (MITRE Cyber SEAL clone)."""

import asyncio
from seal.core import system
from seal.models.alerts import AlertSeverity
from seal.models.events import IndustrialProtocol, OTEvent, PurdueLevel
from seal.models.topology import AssetStatus


def test_full_detection_emulation_and_playbook_lifecycle():
    async def _test():
        # 1. Start system services without external sockets for fast deterministic testing
        await system.start(start_simulator=False)

        # 2. Feed legitimate baseline traffic (HMI polling PLC-01)
        for _ in range(15):
            system.plant.step(0.1)
            state = system.plant.get_state()
            ev = OTEvent(
                source_ip="192.168.1.50",
                dest_ip="192.168.1.10",
                protocol=IndustrialProtocol.MODBUS_TCP,
                purdue_source=PurdueLevel.LEVEL_2,
                purdue_dest=PurdueLevel.LEVEL_1,
                function_code=3,
                process_tag="CHLORINE_PPM",
                register_value=state["CHLORINE_PPM"],
            )
            system.dispatch_event(ev)

        initial_alerts_count = len(system.alert_history)

        # 3. Trigger Effects Language threat emulation: Chemical Dosing Attack
        res = await system.trigger_emulation("chemical_overdose")
        assert res["steps_completed"] == 3
        assert res["steps_total"] == 3

        # 4. Assert alerts were generated
        new_alerts = [a for a in system.alert_history[initial_alerts_count:]]
        assert len(new_alerts) > 0

        # 5. Verify HBL or eLEARN detection details
        toxic_alert = next((a for a in new_alerts if a.mitre_ics_id in ("T0836", "T0888")), None)
        assert toxic_alert is not None, "Expected an alert for parameter modification or loss of safety"
        assert toxic_alert.severity in (AlertSeverity.HIGH, AlertSeverity.CRITICAL)

        # 6. Verify Operator Playbook linkage
        assert toxic_alert.playbook is not None, "Expected response playbook attached to alert"
        assert toxic_alert.playbook.playbook_id == "PB-ICS-SETPOINT-01"
        assert len(toxic_alert.playbook.steps) >= 4

        # 7. Verify Purdue topology asset status was flagged
        plc_asset = system.topology.assets["PLC-01"]
        assert plc_asset.status == AssetStatus.COMPROMISED

        await system.stop()

    asyncio.run(_test())
