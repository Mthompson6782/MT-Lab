"""
CUTLASS | Cyber Unified Threat Level Automated Site Survey
ISA/IEC 62443-3-2 Automated Risk Assessment Platform for Walmart OT.

Usage:
    python main.py [--serve] [--port 8080]
"""

import argparse
from datetime import datetime, timezone
import json
import logging
import os
import sys

# Ensure local imports work smoothly
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from ai.llm_analyzer import LLMAnalyzer
from connectors.armis_connector import ArmisConnector
from connectors.rune_connector import RuneCveConnector
from core.attack_graph import AttackGraphEngine
from core.crs_generator import CRSGenerator
from core.risk_engine import RiskEngine
from core.sl_evaluator import SecurityLevelEvaluator
from core.zone_partitioner import ZonePartitioner
from reports.report_generator import ReportGenerator

logging.basicConfig(level=logging.INFO, format="[%(levelname)s] %(message)s")
logger = logging.getLogger("CUTLASS")


def run_pipeline(
    armis_devices_file: str,
    armis_boundaries_file: str,
    rune_feed_file: str,
    output_dir: str
):
    print("\n" + "="*80)
    print("   CUTLASS | Cyber Unified Threat Level Automated Site Survey")
    print("   ISA/IEC 62443-3-2 Cyber-Physical Risk Platform • Walmart OT Cyber Defense")
    print("   Target Security Level: SL-T 2 (Across all OT Zones)")
    print("="*80 + "\n")

    # 1. Ingestion Layer (Armis + RUNE)
    logger.info("Ingesting OT Asset telemetry from Armis...")
    armis = ArmisConnector()
    assets = armis.fetch_assets(local_json_path=armis_devices_file)
    conduits = armis.fetch_conduits(local_json_path=armis_boundaries_file)
    logger.info(f"Loaded {len(assets)} assets and {len(conduits)} conduits.")

    logger.info("Ingesting CVE intelligence from internal RUNE engine...")
    rune = RuneCveConnector()
    cves = rune.fetch_vulnerabilities(local_json_path=rune_feed_file)
    enriched_assets = rune.enrich_assets(assets, cves)
    total_cves_mapped = sum(len(a.vulnerabilities) for a in enriched_assets)
    logger.info(f"Mapped {total_cves_mapped} active CVEs from RUNE across discovered assets.")

    # 2. Zone & Conduit Partitioning (Clause Z1 & Z3)
    logger.info("Partitioning System Under Consideration (SuC) into Purdue Zones & Conduits...")
    partitioner = ZonePartitioner(facility_id="DC-6094", facility_type="Distribution Center")
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    suc = partitioner.build_system_under_consideration(
        name="Walmart DC #6094 (Ambient & Cold Chain Operations)",
        assets=enriched_assets,
        conduits=conduits,
        assessment_time=now_str
    )

    # 3. Detailed Risk Assessment (Clause Z5: Likelihood x Consequence)
    logger.info("Executing Detailed Cyber-Physical Risk Assessment (Likelihood x Consequence)...")
    risk_engine = RiskEngine()
    suc = risk_engine.evaluate_suc_risk(suc)
    logger.info(f"SuC Overall Inherent Risk Score: {suc.overall_risk_score} / 25")

    # 3.5. Attack Graph & Cyber-Physical Blast Radius Modeling
    logger.info("Computing Multi-Hop Attack Paths & Supply Chain Blast Radius...")
    attack_graph_engine = AttackGraphEngine()
    suc = attack_graph_engine.compute_attack_paths_and_blast_radius(suc)
    logger.info(f"Identified {len(suc.attack_paths)} critical multi-hop attack paths.")
    logger.info(f"Total Facility Financial Loss Exposure: ${suc.total_financial_loss_exposure_usd:,.2f}")

    # 4. Security Level (SL-T 2 vs SL-A) Gap Evaluation (IEC 62443-3-3 FR 1-7)
    logger.info("Evaluating Achieved Security Levels (SL-A) against Mandated SL-T 2...")
    sl_evaluator = SecurityLevelEvaluator()
    suc = sl_evaluator.evaluate_suc_security_levels(suc)
    logger.info(f"Facility SL-2 Compliance: {suc.sl2_compliance_percentage}%")

    # 5. AI / LLM Intelligence Engine
    logger.info("Invoking AI Analyzer for Contextual Threat Narratives & Compensating Controls...")
    ai = LLMAnalyzer()
    exec_summary = ai.generate_executive_summary(suc)

    # 6. Cybersecurity Requirements Specification (CRS) Generation (Clause Z6)
    logger.info("Generating Cybersecurity Requirements Specification (CRS)...")
    crs_gen = CRSGenerator()
    crs_doc = crs_gen.generate_crs_document(suc)
    logger.info(f"Generated {crs_doc['total_requirements']} formal engineering requirements.")

    # 7. Audit Reporting Deliverables
    logger.info(f"Generating audit deliverables in {output_dir}...")
    report_gen = ReportGenerator(output_dir=output_dir)
    json_path = report_gen.generate_json_report(suc)
    md_path = report_gen.generate_markdown_report(suc, exec_summary, crs_doc)

    print("\n" + "-"*80)
    print("[SUCCESS] CUTLASS ASSESSMENT COMPLETE:")
    print(f"   * Audit Markdown Report : {md_path}")
    print(f"   * Machine JSON Data     : {json_path}")
    print(f"   * Interactive Dashboard : {os.path.join(BASE_DIR, 'ui', 'index.html')}")
    print(f"   * SL-2 Compliance Rate  : {suc.sl2_compliance_percentage}%")
    print(f"   * Inherent Risk Score   : {suc.overall_risk_score} / 25")
    print(f"   * Attack Paths Modeled  : {len(suc.attack_paths)} Critical Chains")
    print(f"   * Financial Loss At Risk: ${suc.total_financial_loss_exposure_usd:,.2f}")
    print("-"*80 + "\n")

    return suc


def main():
    parser = argparse.ArgumentParser(description="Walmart IEC 62443-3-2 Risk Assessment Platform")
    parser.add_argument("--serve", action="store_true", help="Launch local dashboard web server")
    parser.add_argument("--port", type=int, default=8080, help="Web server port (default 8080)")
    args = parser.parse_args()

    armis_dev = os.path.join(BASE_DIR, "data", "sample_telemetry", "armis_dc_devices.json")
    armis_bnd = os.path.join(BASE_DIR, "data", "sample_telemetry", "armis_dc_boundaries.json")
    rune_feed = os.path.join(BASE_DIR, "data", "sample_telemetry", "rune_cve_feed.json")
    output_dir = os.path.join(BASE_DIR, "reports")

    run_pipeline(armis_dev, armis_bnd, rune_feed, output_dir)

    if args.serve:
        import http.server
        import socketserver

        ui_dir = os.path.join(BASE_DIR, "ui")
        os.chdir(ui_dir)
        handler = http.server.SimpleHTTPRequestHandler
        print(f"[SERVER] Serving Walmart 62443 Dashboard at http://localhost:{args.port}/ ...")
        with socketserver.TCPServer(("", args.port), handler) as httpd:
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\nServer stopped.")


if __name__ == "__main__":
    main()
