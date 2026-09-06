"""OT Communication Matrix: learns authorized node pairings and protocol function codes."""

from typing import Any, Dict, Set, Tuple
from pydantic import BaseModel, Field
from seal.models.events import OTEvent


class CommunicationFlow(BaseModel):
    source_ip: str
    dest_ip: str
    protocol: str
    function_code: int
    count: int = 0
    first_seen: float = 0.0
    last_seen: float = 0.0


class OTCommunicationMatrix:
    """Tracks and enforces valid communication channels across Purdue zones."""

    def __init__(self):
        # Set of authorized (source_ip, dest_ip, protocol, function_code) tuples
        self.authorized_flows: Set[Tuple[str, str, str, int]] = set()
        self.flow_stats: Dict[Tuple[str, str, str, int], CommunicationFlow] = {}
        self.known_ips: Set[str] = set()

    def record_flow(self, event: OTEvent, auto_authorize: bool = False) -> None:
        """Record an observed flow in the communication matrix."""
        fc = event.function_code if event.function_code is not None else -1
        flow_key = (event.source_ip, event.dest_ip, event.protocol.value, fc)

        self.known_ips.add(event.source_ip)
        self.known_ips.add(event.dest_ip)

        if flow_key not in self.flow_stats:
            self.flow_stats[flow_key] = CommunicationFlow(
                source_ip=event.source_ip,
                dest_ip=event.dest_ip,
                protocol=event.protocol.value,
                function_code=fc,
                count=1,
                first_seen=event.timestamp,
                last_seen=event.timestamp,
            )
        else:
            flow = self.flow_stats[flow_key]
            flow.count += 1
            flow.last_seen = event.timestamp

        if auto_authorize:
            self.authorized_flows.add(flow_key)

    def is_authorized(self, event: OTEvent) -> Tuple[bool, str]:
        """Check if an observed event complies with the authorized communication matrix."""
        fc = event.function_code if event.function_code is not None else -1
        flow_key = (event.source_ip, event.dest_ip, event.protocol.value, fc)

        if flow_key in self.authorized_flows:
            return True, "Authorized flow"

        # Check if source or destination is completely unknown
        if event.source_ip not in self.known_ips:
            return False, f"Rogue/Unknown Source IP: {event.source_ip}"
        if event.dest_ip not in self.known_ips:
            return False, f"Unknown Destination IP: {event.dest_ip}"

        # Check if pairing is authorized with different function code
        pair_flows = [k for k in self.authorized_flows if k[0] == event.source_ip and k[1] == event.dest_ip]
        if pair_flows:
            allowed_fcs = [k[3] for k in pair_flows]
            return False, f"Unauthorized Function Code {fc} (allowed: {allowed_fcs})"

        return False, f"Unauthorized Conduit: {event.source_ip} -> {event.dest_ip} ({event.protocol.value})"
