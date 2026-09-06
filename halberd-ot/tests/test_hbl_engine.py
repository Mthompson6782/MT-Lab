"""Unit tests for Happened-Before Language (HBL) temporal analytics."""

import pytest
import time
from seal.hbl.ast import (
    Correlation,
    EventPattern,
    FieldPredicate,
    HBLWatchpoint,
    Operator,
)
from seal.hbl.engine import HBLEngine
from seal.models.alerts import AlertSeverity
from seal.models.events import IndustrialProtocol, OTEvent, PurdueLevel


@pytest.fixture
def hbl_engine():
    engine = HBLEngine()
    # Watchpoint: Recon Diagnostic (FC 8) Happened-Before Parameter Write (FC 16) within 5.0 seconds
    wp = HBLWatchpoint(
        rule_id="TEST-WP-01",
        name="Diagnostic before write",
        description="Recon probe followed by register write",
        severity=AlertSeverity.HIGH,
        within_seconds=5.0,
        sequence=[
            EventPattern(
                label="recon",
                predicates=[
                    FieldPredicate(field="protocol", operator=Operator.EQUALS, value=IndustrialProtocol.MODBUS_TCP),
                    FieldPredicate(field="function_code", operator=Operator.EQUALS, value=8),
                ],
            ),
            EventPattern(
                label="write",
                predicates=[
                    FieldPredicate(field="protocol", operator=Operator.EQUALS, value=IndustrialProtocol.MODBUS_TCP),
                    FieldPredicate(field="function_code", operator=Operator.EQUALS, value=16),
                ],
            ),
        ],
        correlations=[
            Correlation(step_source_idx=0, source_field="dest_ip", step_target_idx=1, target_field="dest_ip")
        ],
    )
    engine.register_watchpoint(wp)
    return engine


def test_hbl_temporal_sequence_success(hbl_engine):
    """Test that event A followed by event B within time window triggers an alert."""
    t0 = time.time()
    ev1 = OTEvent(
        timestamp=t0,
        source_ip="192.168.1.99",
        dest_ip="192.168.1.10",
        protocol=IndustrialProtocol.MODBUS_TCP,
        function_code=8,
    )
    ev2 = OTEvent(
        timestamp=t0 + 1.5,
        source_ip="192.168.1.99",
        dest_ip="192.168.1.10",
        protocol=IndustrialProtocol.MODBUS_TCP,
        function_code=16,
        register_address=1004,
        register_value=8.0,
    )

    alerts1 = hbl_engine.process_event(ev1)
    assert len(alerts1) == 0  # Incomplete sequence

    alerts2 = hbl_engine.process_event(ev2)
    assert len(alerts2) == 1
    alert = alerts2[0]
    assert alert.severity == AlertSeverity.HIGH
    assert len(alert.causality_chain) == 2
    assert alert.causality_chain[0]["function_code"] == 8
    assert alert.causality_chain[1]["function_code"] == 16


def test_hbl_temporal_window_expired(hbl_engine):
    """Test that event B arriving AFTER time window does NOT trigger an alert."""
    t0 = time.time()
    ev1 = OTEvent(
        timestamp=t0,
        source_ip="192.168.1.99",
        dest_ip="192.168.1.10",
        protocol=IndustrialProtocol.MODBUS_TCP,
        function_code=8,
    )
    # Event 2 arrives 8 seconds later (window is 5 seconds)
    ev2 = OTEvent(
        timestamp=t0 + 8.0,
        source_ip="192.168.1.99",
        dest_ip="192.168.1.10",
        protocol=IndustrialProtocol.MODBUS_TCP,
        function_code=16,
    )

    hbl_engine.process_event(ev1)
    alerts = hbl_engine.process_event(ev2)
    assert len(alerts) == 0


def test_hbl_correlation_mismatch(hbl_engine):
    """Test that event B targeting a different destination PLC does NOT satisfy correlation."""
    t0 = time.time()
    ev1 = OTEvent(
        timestamp=t0,
        source_ip="192.168.1.99",
        dest_ip="192.168.1.10",
        protocol=IndustrialProtocol.MODBUS_TCP,
        function_code=8,
    )
    # Targets different PLC (192.168.1.11)
    ev2 = OTEvent(
        timestamp=t0 + 1.0,
        source_ip="192.168.1.99",
        dest_ip="192.168.1.11",
        protocol=IndustrialProtocol.MODBUS_TCP,
        function_code=16,
    )

    hbl_engine.process_event(ev1)
    alerts = hbl_engine.process_event(ev2)
    assert len(alerts) == 0
