"""State Machine and Causality Tracker for Happened-Before Language."""

import time
from typing import Dict, List, Optional
from seal.hbl.ast import HBLWatchpoint
from seal.models.events import OTEvent


class WatchpointTrace:
    """Tracks an in-flight sequence of events matching a watchpoint."""

    def __init__(self, watchpoint: HBLWatchpoint, initial_event: OTEvent):
        self.watchpoint = watchpoint
        self.matched_events: List[OTEvent] = [initial_event]
        self.start_timestamp: float = initial_event.timestamp
        self.current_step: int = 0
        self.is_complete: bool = False
        self.is_invalidated: bool = False

    @property
    def next_step_idx(self) -> int:
        return self.current_step + 1

    def is_expired(self, current_time: float) -> bool:
        return (current_time - self.start_timestamp) > self.watchpoint.within_seconds

    def check_advance(self, event: OTEvent) -> bool:
        """Attempt to advance the state machine with an incoming event."""
        if self.is_complete or self.is_invalidated:
            return False

        # Check temporal window expiration
        if event.timestamp - self.start_timestamp > self.watchpoint.within_seconds:
            self.is_invalidated = True
            return False

        # Check exclusions (events that abort this attack sequence)
        for excl in self.watchpoint.exclusion_patterns:
            if excl.matches(event):
                self.is_invalidated = True
                return False

        target_step_idx = self.next_step_idx
        if target_step_idx >= len(self.watchpoint.sequence):
            return False

        target_pattern = self.watchpoint.sequence[target_step_idx]

        # 1. Does this event match the pattern for the next step?
        if not target_pattern.matches(event):
            return False

        # 2. Check correlations with previous events in the trace
        test_events = self.matched_events + [event]
        for corr in self.watchpoint.correlations:
            if corr.step_target_idx == target_step_idx:
                if not corr.satisfied(test_events):
                    return False

        # Success: advance state
        self.matched_events.append(event)
        self.current_step = target_step_idx

        if len(self.matched_events) == len(self.watchpoint.sequence):
            self.is_complete = True

        return True


class HBLStateTracker:
    """Manages active in-flight traces for registered watchpoints with low-SWaP memory pruning."""

    def __init__(self, max_traces_per_rule: int = 500):
        self.max_traces_per_rule = max_traces_per_rule
        # rule_id -> list of active traces
        self.active_traces: Dict[str, List[WatchpointTrace]] = {}

    def process_event(self, watchpoint: HBLWatchpoint, event: OTEvent) -> List[List[OTEvent]]:
        """
        Process an incoming event against a watchpoint.
        Returns a list of completed causality chains (lists of matched OTEvents).
        """
        rule_id = watchpoint.rule_id
        if rule_id not in self.active_traces:
            self.active_traces[rule_id] = []

        traces = self.active_traces[rule_id]
        completed_chains: List[List[OTEvent]] = []
        surviving_traces: List[WatchpointTrace] = []

        now = event.timestamp

        # 1. Evaluate event against existing in-flight traces
        for trace in traces:
            if trace.is_expired(now) or trace.is_invalidated:
                continue

            advanced = trace.check_advance(event)
            if advanced and trace.is_complete:
                completed_chains.append(list(trace.matched_events))
            elif not trace.is_invalidated:
                surviving_traces.append(trace)

        # 2. Check if this event can initiate a brand new trace (Step 0 match)
        if len(watchpoint.sequence) > 0 and watchpoint.sequence[0].matches(event):
            # Single-step watchpoint case
            if len(watchpoint.sequence) == 1:
                completed_chains.append([event])
            else:
                if len(surviving_traces) < self.max_traces_per_rule:
                    new_trace = WatchpointTrace(watchpoint, event)
                    surviving_traces.append(new_trace)

        # Update trace list with active surviving traces
        self.active_traces[rule_id] = surviving_traces

        return completed_chains

    def purge_expired(self, current_time: float) -> int:
        """Periodic low-SWaP cleanup of stale state machines."""
        total_purged = 0
        for rule_id, traces in self.active_traces.items():
            before_count = len(traces)
            self.active_traces[rule_id] = [
                t for t in traces if not t.is_expired(current_time) and not t.is_invalidated
            ]
            total_purged += (before_count - len(self.active_traces[rule_id]))
        return total_purged
