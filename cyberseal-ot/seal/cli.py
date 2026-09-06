"""OpenSEAL Command Line Interface (CLI)."""

import argparse
import asyncio
import sys
import uvicorn
from seal.config import config
from seal.core import system


def main():
    parser = argparse.ArgumentParser(
        prog="openseal",
        description="OpenSEAL: Cyber Streaming Effects and Analytic Languages (MITRE Cyber SEAL / iolite clone)",
    )
    subparsers = parser.add_subparsers(dest="command", help="Available subcommands")

    # Start command
    start_parser = subparsers.add_parser("start", help="Start OpenSEAL EdgeReactor daemon and OT simulator")
    start_parser.add_argument("--host", default=config.host, help="Bind host (default: 127.0.0.1)")
    start_parser.add_argument("--port", type=int, default=config.port, help="Bind port (default: 8080)")
    start_parser.add_argument("--no-sim", action="store_true", help="Disable virtual plant simulator")

    # Emulate command
    emulate_parser = subparsers.add_parser("emulate", help="Execute Effects Language (EL) threat emulation")
    emulate_parser.add_argument(
        "--scenario",
        choices=["chemical_overdose", "false_data_injection"],
        default="chemical_overdose",
        help="Emulation scenario name",
    )

    # Rules command
    subparsers.add_parser("rules", help="List registered Happened-Before Language (HBL) watchpoints")

    # Playbooks command
    subparsers.add_parser("playbooks", help="List loaded EdgeReactor operator response playbooks")

    args = parser.parse_args()

    if args.command == "start" or args.command is None:
        host = getattr(args, "host", config.host)
        port = getattr(args, "port", config.port)
        print(f"\n==================================================================")
        print(f"  OpenSEAL - MITRE Cyber SEAL™ / iolite secure Clone")
        print(f"  Streaming Effects and Analytic Languages for OT/ICS Edge")
        print(f"==================================================================")
        print(f"  [+] Node ID:           {config.node_id}")
        print(f"  [+] Environment:       {config.environment_name}")
        print(f"  [+] EdgeReactor GUI:   http://{host}:{port}")
        print(f"  [+] Modbus PLC Port:   {config.modbus_port} (TCP)")
        print(f"  [+] AIC Triad:         Safety & Availability First")
        print(f"==================================================================\n")
        uvicorn.run("seal.edgereactor.app:app", host=host, port=port, log_level="info")

    elif args.command == "emulate":
        async def _run_em():
            print(f"[*] Starting OpenSEAL Effects Language Emulation: {args.scenario}...")
            await system.start(start_simulator=True)
            res = await system.trigger_emulation(args.scenario)
            print(f"[+] Completed: {res['steps_completed']}/{res['steps_total']} steps in {res['duration_seconds']:.2f}s")
            for log_line in res["log"]:
                print(f"    - {log_line}")
            await system.stop()

        asyncio.run(_run_em())

    elif args.command == "rules":
        print("\nRegistered Happened-Before Language (HBL) Watchpoints:")
        for wp_id, wp in system.hbl.watchpoints.items():
            print(f"  [{wp.severity}] {wp.rule_id}: {wp.name}")
            print(f"      MITRE ATT&CK for ICS: {wp.mitre_ics_id} - {wp.mitre_ics_name}")
            print(f"      Window: {wp.within_seconds}s | Steps: {len(wp.sequence)}")
            print()

    elif args.command == "playbooks":
        print("\nEdgeReactor Operator Response Playbooks:")
        for pb_id, pb in system.playbooks.items():
            print(f"  [{pb.playbook_id}] {pb.name}")
            print(f"      Target: {pb.target_asset} | Technique: {pb.mitre_ics_technique}")
            print(f"      Steps: {len(pb.steps)} non-disruptive response actions")
            print()


if __name__ == "__main__":
    main()
