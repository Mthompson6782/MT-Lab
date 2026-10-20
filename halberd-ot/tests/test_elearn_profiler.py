"""Unit tests for eLEARN Baseline Deviation Engine."""

import pytest
from seal.elearn.detector import ELearnDetector, LearnMode
from seal.elearn.profiler import TagProfiler
from seal.models.alerts import AlertSeverity
from seal.models.events import IndustrialProtocol, OTEvent


def test_tag_profiler_welford_and_anomaly():
    profiler = TagProfiler()
    tag = "CHLORINE_PPM"

    # Feed normal baseline readings (approx 2.0 with small noise)
    normal_values = [1.98, 2.02, 2.01, 1.99, 2.00, 2.03, 1.97, 2.01, 2.00, 1.99,
                     2.02, 2.01, 2.00, 1.98, 2.02, 2.01, 1.99, 2.00, 2.02, 2.01]
    for val in normal_values:
        profiler.update(tag, val)

    prof = profiler.profiles[tag]
    assert prof.count == 20
    assert 1.99 < prof.mean < 2.02
    assert prof.std_dev < 0.05

    # Test normal reading does not trigger anomaly
    is_anomaly, reason, z = profiler.evaluate_anomaly(tag, 2.03)
    assert not is_anomaly

    # Test anomalous toxic value (8.5 ppm) triggers anomaly
    is_anomaly, reason, z = profiler.evaluate_anomaly(tag, 8.5)
    assert is_anomaly
    assert z > 3.5
    assert "Extreme Baseline Deviation" in reason


def test_elearn_detector_transition_and_unauthorized_flow():
    # Warmup threshold of 5 events
    detector = ELearnDetector(warmup_events=5)

    # Authorized flow: HMI (192.168.1.50) -> PLC (192.168.1.10) with FC 3
    for _ in range(5):
        ev = OTEvent(
            source_ip="192.168.1.50",
            dest_ip="192.168.1.10",
            protocol=IndustrialProtocol.MODBUS_TCP,
            function_code=3,
        )
        detector.process_event(ev)

    assert detector.mode == LearnMode.MONITORING

    # Legitimate event passes without alert
    legit_ev = OTEvent(
        source_ip="192.168.1.50",
        dest_ip="192.168.1.10",
        protocol=IndustrialProtocol.MODBUS_TCP,
        function_code=3,
    )
    alert = detector.process_event(legit_ev)
    assert alert is None

    # Rogue host (192.168.1.99) sends unauthorized command -> Alert
    rogue_ev = OTEvent(
        source_ip="192.168.1.99",
        dest_ip="192.168.1.10",
        protocol=IndustrialProtocol.MODBUS_TCP,
        function_code=16,
    )
    alert = detector.process_event(rogue_ev)
    assert alert is not None
    assert alert.severity == AlertSeverity.HIGH
    assert alert.mitre_ics_id == "T0855"
    assert "Rogue/Unknown Source IP" in alert.description
