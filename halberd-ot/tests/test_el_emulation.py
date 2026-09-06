"""Unit tests for Effects Language (EL) threat emulation engine."""

import asyncio
from seal.el.attack_graph import AttackGraph, EffectAction, EffectStep, StepStatus
from seal.el.executor import ELExecutor
from seal.models.events import OTEvent


def test_attack_graph_dependencies_and_execution():
    async def _test():
        events_dispatched = []

        def dispatch_cb(ev: OTEvent):
            events_dispatched.append(ev)

        executor = ELExecutor(
            event_dispatcher=dispatch_cb,
            state_accessor=lambda: {"TANK1_LEVEL_PCT": 75.0, "PUMP1_RPM": 1400.0},
        )

        graph = AttackGraph(
            campaign_id="TEST-CAMP-01",
            name="Test Campaign",
            description="Two-step test graph",
        )

        step1 = EffectStep(
            step_id="STEP_1",
            name="Recon Step",
            description="Step 1 description",
            technique_id="T0846",
            action=EffectAction(action_type="MODBUS_DIAGNOSTIC", target_ip="127.0.0.1", function_code=8),
        )

        step2 = EffectStep(
            step_id="STEP_2",
            name="Write Step",
            description="Step 2 description",
            technique_id="T0836",
            dependencies=["STEP_1"],
            action=EffectAction(
                action_type="MODBUS_WRITE",
                target_ip="127.0.0.1",
                function_code=16,
                register_address=1004,
                register_value=8.0,
            ),
        )

        graph.add_step(step1)
        graph.add_step(step2)

        # Initially, only STEP_1 should be ready
        ready = graph.get_ready_steps()
        assert len(ready) == 1
        assert ready[0].step_id == "STEP_1"

        # Run the full campaign
        res = await executor.run_campaign(graph, step_delay_seconds=0.05)
        assert res["steps_completed"] == 2
        assert res["steps_total"] == 2
        assert len(events_dispatched) == 2
        assert events_dispatched[0].function_code == 8
        assert events_dispatched[1].function_code == 16

    asyncio.run(_test())


def test_attack_graph_lazy_preconditions():
    # State has tank level at 20 (too low)
    executor = ELExecutor(
        state_accessor=lambda: {"TANK1_LEVEL_PCT": 20.0},
    )

    step = EffectStep(
        step_id="PRECOND_STEP",
        name="Conditional Step",
        description="Requires tank level > 50",
        precondition_conditions={"TANK1_LEVEL_PCT": {">": 50.0}},
        action=EffectAction(action_type="MODBUS_WRITE", target_ip="127.0.0.1"),
    )

    # Condition fails
    assert not executor.check_lazy_preconditions(step)

    # Update state to meet condition
    executor.state_accessor = lambda: {"TANK1_LEVEL_PCT": 65.0}
    assert executor.check_lazy_preconditions(step)
