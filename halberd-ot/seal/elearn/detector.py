"""eLEARN Baseline Deviation Detector orchestrating matrix and tag profiling."""

import time
from enum import Enum
from typing import Callable, Dict, List, Optional
from seal.elearn.matrix import OTCommunicationMatrix
from seal.elearn.profiler import TagProfiler
from seal.models.alerts import AlertSeverity, OTAlert
from seal.models.events import OTEvent


class LearnMode(str, Enum):
    LEARNING = "LEARNING"      # Profiling and training baselines without alerting
    MONITORING = "MONITORING"  # Enforcing baselines and alerting on deviations


class ELearnDetector:
    """Detects deviations from learned OT communication patterns and process envelopes."""

    def __init__(self, warmup_events: int = 100):
        self.mode = LearnMode.LEARNING
        self.warmup_events = warmup_events
        self.matrix = OTCommunicationMatrix()
        self.tag_profiler = TagProfiler()
        self.alert_callbacks: List[Callable[[OTAlert], None]] = []
        self.events_processed = 0
        self.deviations_detected = 0

    def set_mode(self, mode: LearnMode) -> None:
        self.mode = mode

    def subscribe_alerts(self, callback: Callable[[OTAlert], None]) -> None:
        self.alert_callbacks.append(callback)

    def process_event(self, event: OTEvent) -> Optional[OTAlert]:
        """Process an OT event through the eLEARN baseline engine."""
        self.events_processed += 1

        # Automatically transition from LEARNING to MONITORING once warmup threshold reached
        if self.mode == LearnMode.LEARNING and self.events_processed >= self.warmup_events:
            self.mode = LearnMode.MONITORING

        # 1. Evaluate/Update Communication Matrix
        if self.mode == LearnMode.LEARNING:
            self.matrix.record_flow(event, auto_authorize=True)
        else:
            is_auth, flow_reason = self.matrix.is_authorized(event)
            self.matrix.record_flow(event, auto_authorize=False)
            if not is_auth:
                self.deviations_detected += 1
                alert = OTAlert(
                    severity=AlertSeverity.HIGH,
                    title="[eLEARN] Unauthorized Communication Flow",
                    description=f"{flow_reason} on protocol {event.protocol.value}",
                    detector="ELEARN_PROFILER",
                    mitre_ics_id="T0855",
                    mitre_ics_name="Unauthorized Command Message",
                    assets_involved=[event.source_ip, event.dest_ip],
                    purdue_level=str(event.purdue_dest.value if hasattr(event.purdue_dest, "value") else event.purdue_dest),
                    causality_chain=[event.model_dump()],
                    confidence_score=0.92,
                )
                self._emit_alert(alert)
                return alert

        # 2. Evaluate/Update Tag Value Profile
        if event.process_tag and event.register_value is not None:
            try:
                num_val = float(event.register_value)
                if self.mode == LearnMode.LEARNING:
                    self.tag_profiler.update(event.process_tag, num_val)
                else:
                    is_anomaly, reason, z_score = self.tag_profiler.evaluate_anomaly(event.process_tag, num_val)
                    if is_anomaly:
                        self.deviations_detected += 1
                        severity = AlertSeverity.CRITICAL if "Safety Boundary" in reason else AlertSeverity.HIGH
                        alert = OTAlert(
                            severity=severity,
                            title=f"[eLEARN] Process Envelope Deviation ({event.process_tag})",
                            description=f"{reason} - Value: {num_val} {event.unit_of_measure or ''}",
                            detector="ELEARN_PROFILER",
                            mitre_ics_id="T0836",
                            mitre_ics_name="Modify Parameter",
                            assets_involved=[event.source_ip, event.dest_ip],
                            purdue_level=str(event.purdue_dest.value if hasattr(event.purdue_dest, "value") else event.purdue_dest),
                            causality_chain=[event.model_dump()],
                            confidence_score=0.96,
                        )
                        self._emit_alert(alert)
                        return alert
                    else:
                        # Continue updating baseline with normal values in monitoring mode
                        self.tag_profiler.update(event.process_tag, num_val)
            except (ValueError, TypeError):
                pass

        return None

    def _emit_alert(self, alert: OTAlert) -> None:
        for cb in self.alert_callbacks:
            try:
                cb(alert)
            except Exception:
                pass
