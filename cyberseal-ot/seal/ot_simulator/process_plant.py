"""Physics-based simulation of a municipal water treatment plant."""

import math
import random
import time
from typing import Dict, Any


class WaterTreatmentPlant:
    """
    Simulates continuous physical dynamics of a water treatment plant:
    - Raw water intake pump & valve
    - Aeration & retention storage tank
    - Automated chlorine dosing subsystem
    - High-service distribution pump & line pressure
    """

    def __init__(self):
        # State variables
        self.tank_level_pct: float = 65.0       # 0% to 100%
        self.pump1_rpm: float = 1450.0          # Normal operating: 1200 - 1800 RPM
        self.intake_flow_gpm: float = 850.0     # Gallons per minute
        self.chlorine_setpoint_ppm: float = 2.0 # Normal target: 1.5 - 2.5 PPM
        self.chlorine_actual_ppm: float = 2.05  # Measured residual
        self.line_pressure_psi: float = 54.0    # Normal: 45 - 65 PSI
        self.valve1_intake_open: bool = True    # Digital coil
        self.emergency_shutdown: bool = False

        self.last_update_time = time.time()

    def step(self, dt: float = 1.0) -> None:
        """Advance physical simulation by dt seconds with realistic physics and sensor noise."""
        if self.emergency_shutdown or not self.valve1_intake_open:
            inflow = 0.0
            self.intake_flow_gpm = max(0.0, self.intake_flow_gpm - 150.0 * dt)
        else:
            inflow = (self.pump1_rpm / 1500.0) * 850.0
            self.intake_flow_gpm = inflow + random.uniform(-10.0, 10.0)

        outflow = 830.0 + random.uniform(-15.0, 15.0)  # Municipal demand
        net_flow = (inflow - outflow) / 1000.0  # scaled volume change

        self.tank_level_pct = max(0.0, min(100.0, self.tank_level_pct + net_flow * dt))

        # Chlorine dosing dynamics: converges toward setpoint with chemical dispersion delay
        dosing_delta = (self.chlorine_setpoint_ppm - self.chlorine_actual_ppm) * (0.15 * dt)
        noise = random.uniform(-0.02, 0.02)
        self.chlorine_actual_ppm = max(0.0, self.chlorine_actual_ppm + dosing_delta + noise)

        # Line pressure dynamics dependent on pump RPM
        target_pressure = 55.0 * (self.pump1_rpm / 1500.0) if self.pump1_rpm > 100 else 0.0
        self.line_pressure_psi = target_pressure + random.uniform(-1.0, 1.0)

        self.last_update_time = time.time()

    def get_state(self) -> Dict[str, Any]:
        """Return dict of current physical states."""
        return {
            "TANK1_LEVEL_PCT": round(self.tank_level_pct, 2),
            "PUMP1_RPM": round(self.pump1_rpm, 1),
            "INTAKE_FLOW_GPM": round(self.intake_flow_gpm, 1),
            "CHLORINE_SETPOINT_PPM": round(self.chlorine_setpoint_ppm, 2),
            "CHLORINE_PPM": round(self.chlorine_actual_ppm, 2),
            "LINE_PRESSURE_PSI": round(self.line_pressure_psi, 1),
            "VALVE1_INTAKE_STATE": 1 if self.valve1_intake_open else 0,
            "EMERGENCY_SHUTDOWN": 1 if self.emergency_shutdown else 0,
        }

    def set_register(self, register_address: int, value: float) -> bool:
        """Handle incoming Modbus write command to alter physical control states."""
        if register_address == 1001:
            self.tank_level_pct = max(0.0, min(100.0, value))
            return True
        elif register_address == 1002:
            self.pump1_rpm = max(0.0, value)
            return True
        elif register_address == 1004:
            self.chlorine_setpoint_ppm = max(0.0, value)
            return True
        elif register_address == 2001:
            self.valve1_intake_open = bool(value)
            return True
        return False
