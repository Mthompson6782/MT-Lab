"""Safe Orchestrator & Execution Engine for Effects Language (EL™)."""

import asyncio
import time
from typing import Any, Callable, Dict, List, Optional
from seal.config import config
from seal.el.attack_graph import AttackGraph, EffectAction, EffectStep, StepStatus
from seal.models.events import IndustrialProtocol, OTEvent, PurdueLevel


class ELExecutor:
    """Safely orchestrates Effects Language attack graphs with lazy precondition evaluation."""

    def __init__(
        self,
        event_dispatcher: Optional[Callable[[OTEvent], None]] = None,
        state_accessor: Optional[Callable[[], Dict[str, Any]]] = None,
    ):
        self.event_dispatcher = event_dispatcher
        self.state_accessor = state_accessor
        self.active_campaigns: Dict[str, AttackGraph] = {}

    def check_lazy_preconditions(self, step: EffectStep) -> bool:
        """Evaluate lazy preconditions against current cyber-physical plant state."""
        if not step.precondition_conditions:
            return True

        if not self.state_accessor:
            return True

        current_state = self.state_accessor()

        for tag, condition in step.precondition_conditions.items():
            if tag not in current_state:
                return False
            val = current_state[tag]
            if isinstance(condition, dict):
                for op, expected in condition.items():
                    if op == ">" and not (val > expected):
                        return False
                    if op == ">=" and not (val >= expected):
                        return False
                    if op == "<" and not (val < expected):
                        return False
                    if op == "<=" and not (val <= expected):
                        return False
                    if op == "==" and not (val == expected):
                        return False
            elif val != condition:
                return False

        return True

    async def execute_action(self, action: EffectAction) -> str:
        """Safely execute the specified action against simulator or edge target."""
        # Enforce safety guard: prevent unauthorized physical targeting
        if config.el_safe_simulation_only:
            allowed_hosts = ["127.0.0.1", "localhost", "::1"]
            if action.target_ip not in allowed_hosts:
                raise ValueError(
                    f"Safety Guard Blocked: Cannot target external IP {action.target_ip} in safe simulation mode."
                )

        # Generate corresponding OTEvent for the streaming pipeline
        event = OTEvent(
            source_ip="192.168.1.99",  # Simulated adversary / compromised engineering station
            source_port=54321,
            dest_ip=action.target_ip,
            dest_port=action.target_port,
            protocol=IndustrialProtocol.MODBUS_TCP,
            purdue_source=PurdueLevel.LEVEL_2,
            purdue_dest=PurdueLevel.LEVEL_1,
            unit_id=action.unit_id,
            function_code=action.function_code,
            function_name=f"EL_{action.action_type}",
            register_address=action.register_address,
            register_value=action.register_value,
            process_tag=action.process_tag,
            metadata={
                "effects_language": True,
                "action_type": action.action_type,
                "emulated": True,
            },
        )

        if self.event_dispatcher:
            self.event_dispatcher(event)

        return f"Executed {action.action_type} on {action.target_ip}:{action.target_port} (tag: {action.process_tag}, val: {action.register_value})"

    async def run_campaign(self, graph: AttackGraph, step_delay_seconds: float = 1.0) -> Dict[str, Any]:
        """Run an attack graph to completion, step-by-step."""
        self.active_campaigns[graph.campaign_id] = graph
        execution_start = time.time()
        log: List[str] = []

        while True:
            ready_steps = graph.get_ready_steps()
            if not ready_steps:
                # Check if all steps are completed or if we're deadlocked
                all_done = all(s.status in (StepStatus.COMPLETED, StepStatus.FAILED, StepStatus.SKIPPED) for s in graph.steps.values())
                if all_done:
                    break
                else:
                    # Waiting for preconditions or async steps
                    await asyncio.sleep(0.5)
                    if time.time() - execution_start > 30.0:  # Timeout safety
                        log.append("Campaign execution timed out waiting for preconditions.")
                        break
                    continue

            for step in ready_steps:
                step.status = StepStatus.PRECONDITION_WAIT
                if not self.check_lazy_preconditions(step):
                    log.append(f"Preconditions not met for step {step.step_id} ({step.name}), waiting...")
                    await asyncio.sleep(0.5)
                    continue

                step.status = StepStatus.RUNNING
                step.timestamp_started = time.time()
                try:
                    result = await self.execute_action(step.action)
                    step.status = StepStatus.COMPLETED
                    step.result_message = result
                    log.append(f"[SUCCESS] Step {step.step_id}: {result}")
                except Exception as ex:
                    step.status = StepStatus.FAILED
                    step.result_message = str(ex)
                    log.append(f"[FAILED] Step {step.step_id}: {str(ex)}")

                step.timestamp_finished = time.time()
                await asyncio.sleep(step_delay_seconds)

        return {
            "campaign_id": graph.campaign_id,
            "duration_seconds": time.time() - execution_start,
            "steps_total": len(graph.steps),
            "steps_completed": sum(1 for s in graph.steps.values() if s.status == StepStatus.COMPLETED),
            "log": log,
        }
