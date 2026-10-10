"""
5x5 cyber-physical risk matrix (cell lookup, not L x C arithmetic).
Tolerable risk and ZCR 4/6/7 thresholds come from config/risk_matrix.yaml.
"""

from typing import Any, Dict, Optional

from core.config_loader import load_risk_matrix


class RiskMatrix:
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        cfg = config or load_risk_matrix()
        self.levels = cfg["levels"]                       # ordered low -> high
        self.tolerable = cfg["tolerable_risk"]
        self.rules = cfg.get("rules", {})
        self.matrix = {int(c): row for c, row in cfg["matrix"].items()}
        for c in range(1, 6):
            if c not in self.matrix or len(self.matrix[c]) != 5:
                raise ValueError(f"risk_matrix.yaml: consequence row {c} must have 5 likelihood cells")
            for cell in self.matrix[c]:
                if cell not in self.levels:
                    raise ValueError(f"risk_matrix.yaml: unknown level '{cell}'")
        if self.tolerable not in self.levels:
            raise ValueError("risk_matrix.yaml: tolerable_risk must be one of levels")

    def level(self, consequence: int, likelihood: int) -> str:
        c = min(5, max(1, int(consequence)))
        l = min(5, max(1, int(likelihood)))
        return self.matrix[c][l - 1]

    def rank(self, level: str) -> int:
        return self.levels.index(level)

    def is_tolerable(self, level: str) -> bool:
        return self.rank(level) <= self.rank(self.tolerable)

    def needs_detailed_assessment(self, level: str) -> bool:
        """ZCR 4 screen."""
        threshold = self.rules.get("zcr4_detailed_assessment_if_initial_risk_at_or_above", "High")
        return self.rank(level) >= self.rank(threshold)
