"""HBL Streaming Analytics & Watchpoint Evaluation Engine."""

import collections
import time
from typing import Any, Callable, Dict, List, Optional
from seal.hbl.ast import HBLWatchpoint
from seal.hbl.state_machine import HBLStateTracker
from seal.models.alerts import OTAlert
from seal.models.events import OTEvent


class HBLEngine:
    """Core streaming engine that evaluates Happened-Before Language rules in real time."""

    def __init__(self, max_event_history: int = 5000):
        self.watchpoints: Dict[str, HBLWatchpoint] = {}
        self.state_tracker = HBLStateTracker()
        self.event_buffer = collections.deque(maxlen=max_event_history)
        self.alert_callbacks: List[Callable[[OTAlert], None]] = []
        self.generated_alerts: List[OTAlert] = []

        # Diagnostics & Metrics
        self.events_processed = 0
        self.alerts_emitted = 0
        self.start_time = time.time()

    def register_watchpoint(self, watchpoint: HBLWatchpoint) -> None:
        """Register a new HBL watchpoint rule."""
        self.watchpoints[watchpoint.rule_id] = watchpoint

    def unregister_watchpoint(self, rule_id: str) -> bool:
        """Remove a watchpoint rule."""
        if rule_id in self.watchpoints:
            del self.watchpoints[rule_id]
            if rule_id in self.state_tracker.active_traces:
                del self.state_tracker.active_traces[rule_id]
            return True
        return False

    def subscribe_alerts(self, callback: Callable[[OTAlert], None]) -> None:
        """Subscribe a listener (e.g. WebSocket dispatcher, SIEM exporter) to emitted alerts."""
        self.alert_callbacks.append(callback)

    def process_event(self, event: OTEvent) -> List[OTAlert]:
        """Ingest a single OTEvent and evaluate across all active HBL watchpoints."""
        self.events_processed += 1
        self.event_buffer.append(event)
        new_alerts: List[OTAlert] = []

        for rule_id, wp in self.watchpoints.items():
            completed_chains = self.state_tracker.process_event(wp, event)

            for chain in completed_chains:
                # Build alert with the exact causality trace
                alert = OTAlert(
                    severity=wp.severity,
                    title=f"[HBL] {wp.name}",
                    description=wp.description or f"Triggered by watchpoint {wp.rule_id}",
                    detector="HBL_TEMPORAL_ENGINE",
                    mitre_ics_id=wp.mitre_ics_id,
                    mitre_ics_name=wp.mitre_ics_name,
                    assets_involved=list({ev.dest_ip for ev in chain} | {ev.source_ip for ev in chain}),
                    purdue_level=chain[-1].purdue_dest.value if hasattr(chain[-1].purdue_dest, "value") else str(chain[-1].purdue_dest),
                    causality_chain=[ev.model_dump() for ev in chain],
                    confidence_score=0.98,
                )
                self.alerts_emitted += 1
                self.generated_alerts.append(alert)
                new_alerts.append(alert)

                # Notify subscribers
                for cb in self.alert_callbacks:
                    try:
                        cb(alert)
                    except Exception:
                        pass

        return new_alerts

    def get_stats(self) -> Dict[str, Any]:
        """Return runtime diagnostic metrics."""
        return {
            "uptime_seconds": time.time() - self.start_time,
            "events_processed": self.events_processed,
            "alerts_emitted": self.alerts_emitted,
            "registered_watchpoints": len(self.watchpoints),
            "buffered_events": len(self.event_buffer),
        }
