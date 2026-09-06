"""Cyclic polling and telemetry stream generator simulating SCADA/HMI polling."""

import asyncio
from typing import Callable, Optional
from seal.ot_simulator.process_plant import WaterTreatmentPlant
from seal.models.events import IndustrialProtocol, OTEvent, PurdueLevel


class SensorStreamGenerator:
    """Generates cyclic SCADA polling traffic and streams process telemetry into OpenSEAL."""

    def __init__(
        self,
        plant: WaterTreatmentPlant,
        event_callback: Callable[[OTEvent], None],
        interval_seconds: float = 1.0,
    ):
        self.plant = plant
        self.event_callback = event_callback
        self.interval_seconds = interval_seconds
        self.is_running = False
        self._task: Optional[asyncio.Task] = None

    async def start(self) -> None:
        self.is_running = True
        self._task = asyncio.create_task(self._poll_loop())

    async def stop(self) -> None:
        self.is_running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass

    async def _poll_loop(self) -> None:
        while self.is_running:
            # 1. Step plant physics
            self.plant.step(dt=self.interval_seconds)
            state = self.plant.get_state()

            # 2. Emit polling events for key tags
            tags_to_emit = [
                ("TANK1_LEVEL_PCT", 1001, "%"),
                ("PUMP1_RPM", 1002, "RPM"),
                ("CHLORINE_PPM", 1004, "PPM"),
                ("LINE_PRESSURE_PSI", 1005, "PSI"),
            ]

            for tag_name, reg_addr, unit in tags_to_emit:
                val = state.get(tag_name, 0.0)
                event = OTEvent(
                    source_ip="192.168.1.50",  # HMI-01
                    source_port=50201,
                    dest_ip="192.168.1.10",    # PLC-01
                    dest_port=502,
                    protocol=IndustrialProtocol.MODBUS_TCP,
                    purdue_source=PurdueLevel.LEVEL_2,
                    purdue_dest=PurdueLevel.LEVEL_1,
                    function_code=3,  # FC 03 Read Holding Registers
                    function_name="Read Holding Registers",
                    register_address=reg_addr,
                    register_value=val,
                    process_tag=tag_name,
                    unit_of_measure=unit,
                )
                self.event_callback(event)

            await asyncio.sleep(self.interval_seconds)
