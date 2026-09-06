"""Lightweight Asyncio Modbus TCP Server simulating an industrial PLC-01."""

import asyncio
import struct
from typing import Callable, Optional
from seal.ot_simulator.process_plant import WaterTreatmentPlant
from seal.models.events import IndustrialProtocol, OTEvent, PurdueLevel


class AsyncModbusServer:
    """Async Modbus TCP Server representing PLC-01 on Purdue Level 1."""

    def __init__(
        self,
        plant: WaterTreatmentPlant,
        host: str = "127.0.0.1",
        port: int = 5020,
        event_callback: Optional[Callable[[OTEvent], None]] = None,
    ):
        self.plant = plant
        self.host = host
        self.port = port
        self.event_callback = event_callback
        self.server: Optional[asyncio.Server] = None
        self.is_running = False

    async def start(self) -> None:
        """Start the Modbus TCP server."""
        self.server = await asyncio.start_server(self.handle_client, self.host, self.port)
        self.is_running = True

    async def stop(self) -> None:
        """Stop the Modbus TCP server."""
        self.is_running = False
        if self.server:
            self.server.close()
            await self.server.wait_closed()

    async def handle_client(self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter) -> None:
        client_ip, client_port = writer.get_extra_info("peername")

        while self.is_running:
            try:
                # Read 7-byte MBAP header
                header = await reader.readexactly(7)
                tx_id, proto_id, length, unit_id = struct.unpack(">HHHB", header)
                pdu_len = length - 1
                pdu = await reader.readexactly(pdu_len)
                function_code = pdu[0]

                response_pdu = b""
                reg_addr = None
                reg_val = None
                tag_name = None

                # FC 03: Read Holding Registers
                if function_code == 3:
                    start_addr, count = struct.unpack(">HH", pdu[1:5])
                    reg_addr = start_addr
                    # Map state to registers
                    state = self.plant.get_state()
                    regs = []
                    if start_addr == 1001:
                        regs.append(int(state["TANK1_LEVEL_PCT"]))
                        tag_name = "TANK1_LEVEL_PCT"
                    elif start_addr == 1002:
                        regs.append(int(state["PUMP1_RPM"]))
                        tag_name = "PUMP1_RPM"
                    elif start_addr == 1004:
                        regs.append(int(state["CHLORINE_SETPOINT_PPM"] * 10))
                        tag_name = "CHLORINE_PPM"
                    else:
                        regs.append(0)

                    reg_val = regs[0] if regs else 0
                    byte_count = len(regs) * 2
                    response_pdu = struct.pack(">BB", function_code, byte_count) + b"".join(
                        struct.pack(">H", r) for r in regs
                    )

                # FC 06: Write Single Register
                elif function_code == 6:
                    reg_addr, reg_val = struct.unpack(">HH", pdu[1:5])
                    if reg_addr == 1004:
                        self.plant.set_register(reg_addr, float(reg_val) / 10.0)
                        tag_name = "CHLORINE_PPM"
                    else:
                        self.plant.set_register(reg_addr, float(reg_val))
                    response_pdu = pdu  # Echo request as response

                # FC 16 (0x10): Write Multiple Registers
                elif function_code == 16:
                    start_addr, qty, byte_cnt = struct.unpack(">HHB", pdu[1:6])
                    val = struct.unpack(">H", pdu[6:8])[0]
                    reg_addr = start_addr
                    reg_val = val
                    if start_addr == 1004:
                        self.plant.set_register(start_addr, float(val) / 10.0)
                        tag_name = "CHLORINE_PPM"
                    else:
                        self.plant.set_register(start_addr, float(val))
                    response_pdu = struct.pack(">BHH", function_code, start_addr, qty)

                # FC 08: Diagnostic Query
                elif function_code == 8:
                    subfunction, data = struct.unpack(">HH", pdu[1:5])
                    response_pdu = pdu  # Echo diagnostic
                    reg_addr = subfunction
                    reg_val = data

                # Emit normalized event
                if self.event_callback:
                    event = OTEvent(
                        source_ip=client_ip,
                        source_port=client_port,
                        dest_ip="192.168.1.10",
                        dest_port=502,
                        protocol=IndustrialProtocol.MODBUS_TCP,
                        purdue_source=PurdueLevel.LEVEL_2,
                        purdue_dest=PurdueLevel.LEVEL_1,
                        unit_id=unit_id,
                        function_code=function_code,
                        register_address=reg_addr,
                        register_value=reg_val,
                        process_tag=tag_name,
                    )
                    self.event_callback(event)

                # Send Modbus TCP response
                resp_length = len(response_pdu) + 1
                resp_header = struct.pack(">HHHB", tx_id, proto_id, resp_length, unit_id)
                writer.write(resp_header + response_pdu)
                await writer.drain()

            except (asyncio.IncompleteReadError, ConnectionResetError):
                break
            except Exception:
                break

        writer.close()
        await writer.wait_closed()
