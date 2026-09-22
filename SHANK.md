# 🗡️ SHANK — Project Card

**SCADA & Hardware Asset Network Knowledge**

| | |
|---|---|
| **Repo** | [Mthompson6782/shank-ot](https://github.com/Mthompson6782/shank-ot) |
| **Default branch** | `master` |
| **Language** | Python 3.10+ (FastAPI) |
| **Last updated** | 2026-09-22 |
| **Status** | Active development |

---

## One-liner

Infrastructure-centric OT asset intelligence platform that discovers, contextualizes, and risk-scores industrial assets without crashing fragile PLCs — the visibility layer that every OT security program needs first.

---

## What it does

- **Selective probing** of managed industrial switches (SNMP FDB, LLDP/CDP, ARP) for deterministic Layer 1 physical link resolution — pins every PLC to its exact switch port.
- **Backplane crawling** via CIP route paths across ControlLogix 1756, remote Point I/O, and PowerFlex drives — slot-level hardware, firmware, and serial extraction.
- **Kandinsky orthogonal 90° graph engine** across five perspectives: Connections, Locations, Purdue Hierarchy, Networks, Organic.
- **5-tier location tree** disambiguation so identical OEM skid IPs (e.g. `192.168.1.50`) coexist without database collisions.
- **Sampled NetFlow/sFlow** ingestion with Sankey flow matrices and per-asset traffic path profiling.
- **Enterprise connectors**: ServiceNow CMDB (ISA-95), Splunk TA CEF syslog, Fortinet/Palo Alto industrial firewall rule generation.
- **Automated IEC 62443 / NIST SP 800-82 compliance audit** scorecard export, plus HBOM (Hardware Bill of Materials) JSON.

---

## Built-in scenarios

1. Municipal Water Treatment Facility
2. 500kV Electric Substation Alpha (SEL relays, NERC CIP)
3. Petrochemical Continuous Refinery (Triconex SIL 3 SIS)
4. **Walmart DC-6094** — Perishable Grocery & Cold Chain (ammonia refrigeration, Frick Quantum HD, Emerson Copeland E3, Det-Tronics EQP gas detection)

---

## Standards alignment

- ISA/IEC 62443-3-2, 62443-3-3, 62443-4-2
- NIST SP 800-82r3
- NERC CIP-005 / CIP-007
- CISA Cross-Sector CPGs

---

## Why it matters (Walmart context)

SHANK is the asset-intelligence half of the Blade Fleet — it answers *what is actually on the network, where it physically sits, and how risky it is*. It feeds CUTLASS (risk assessment) and SABER (solution security plans) with ground-truth inventory they can't get from passive DPI alone.

- Addresses dormant/cold-standby asset blind spots that passive sniffers miss.
- Slot-level CVE attribution instead of whole-PLC false positives.
- Duplicate-IP disambiguation for standardized OEM skids across the retail footprint.

---

## Quick links

- README: `shank-ot/README.md`
- White paper: `shank-ot/docs/WHITE_PAPER.md`
- CLI: `python -m otbase.cli start --port 8000`
- Tests: `python -m pytest tests/ -v` (35 passing)

---

*Card created 2026-09-22. Source of truth remains the shank-ot repo.*