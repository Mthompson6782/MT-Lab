"""
RUNE CVE Connector for Walmart OT IEC 62443-3-2 Platform.
Enriches OT assets with vulnerability records, CVSS scores, CISA KEV status,
and OT-specific exploitability rankings from Walmart's internal RUNE engine.
"""

import json
import logging
import os
from typing import Dict, List, Optional
import urllib.request

from core.models import Asset, Vulnerability

logger = logging.getLogger(__name__)


class RuneCveConnector:
    def __init__(self, rune_api_endpoint: Optional[str] = None, auth_token: Optional[str] = None):
        self.endpoint = rune_api_endpoint or os.getenv("RUNE_API_ENDPOINT")
        self.auth_token = auth_token or os.getenv("RUNE_AUTH_TOKEN")

    def fetch_vulnerabilities(self, local_json_path: Optional[str] = None) -> List[Vulnerability]:
        """
        Loads CVE intelligence from RUNE feed or local JSON cache.
        """
        if local_json_path and os.path.exists(local_json_path):
            logger.info(f"Loading RUNE CVE intelligence from local feed: {local_json_path}")
            with open(local_json_path, "r", encoding="utf-8") as f:
                raw_cves = json.load(f)
            return [Vulnerability(**v) for v in raw_cves]

        if not self.endpoint:
            logger.warning("RUNE endpoint not set; returning empty list.")
            return []

        # Production RUNE REST API Call
        headers = {
            "Authorization": f"Bearer {self.auth_token}",
            "Accept": "application/json",
            "X-Client-ID": "Walmart-OT-62443-Engine"
        }
        url = f"{self.endpoint.rstrip('/')}/api/v2/cves/ot-advisories"
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))

        return [Vulnerability(**item) for item in data.get("vulnerabilities", [])]

    def enrich_assets(self, assets: List[Asset], vulnerabilities: List[Vulnerability]) -> List[Asset]:
        """
        Correlates RUNE CVEs with Armis assets based on vendor, model, firmware, and protocol indicators.
        """
        for asset in assets:
            matched_vulns = []
            for vuln in vulnerabilities:
                # Check for direct component match
                for comp in vuln.affected_components:
                    comp_lower = comp.lower()
                    if (asset.vendor.lower() in comp_lower or asset.model.lower() in comp_lower) or \
                       any(proto.lower() in comp_lower for proto in asset.active_protocols):
                        matched_vulns.append(vuln)
                        break

            # Deduplicate by CVE ID
            unique_vulns = {v.cve_id: v for v in matched_vulns}.values()
            asset.vulnerabilities = list(unique_vulns)

        return assets
