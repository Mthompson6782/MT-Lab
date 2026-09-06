"""Statistical Process and Register Value Profiler (Low-SWaP online statistics)."""

import math
from typing import Dict, Optional, Tuple
from pydantic import BaseModel, Field


class TagBaselineProfile(BaseModel):
    tag: str
    count: int = 0
    min_val: float = float("inf")
    max_val: float = float("-inf")
    mean: float = 0.0
    m2: float = 0.0  # Sum of squares of differences for Welford's algorithm
    ewma: float = 0.0
    
    # CUSUM variables
    cusum_pos: float = 0.0
    cusum_neg: float = 0.0
    
    # Static Physical Bounds (if specified)
    hard_min: Optional[float] = None
    hard_max: Optional[float] = None

    @property
    def variance(self) -> float:
        return self.m2 / (self.count - 1) if self.count > 1 else 0.0

    @property
    def std_dev(self) -> float:
        return math.sqrt(self.variance)


class TagProfiler:
    """Maintains running statistics and baseline envelopes for process variables."""

    def __init__(self, ewma_alpha: float = 0.2, cusum_slack_sigma: float = 0.5, cusum_threshold_sigma: float = 4.0):
        self.ewma_alpha = ewma_alpha
        self.cusum_slack_sigma = cusum_slack_sigma
        self.cusum_threshold_sigma = cusum_threshold_sigma
        self.profiles: Dict[str, TagBaselineProfile] = {}

    def get_or_create_profile(self, tag: str, hard_min: Optional[float] = None, hard_max: Optional[float] = None) -> TagBaselineProfile:
        if tag not in self.profiles:
            self.profiles[tag] = TagBaselineProfile(tag=tag, hard_min=hard_min, hard_max=hard_max)
        return self.profiles[tag]

    def update(self, tag: str, value: float) -> None:
        """Update running statistics using Welford's algorithm and EWMA."""
        prof = self.get_or_create_profile(tag)
        prof.count += 1
        prof.min_val = min(prof.min_val, value)
        prof.max_val = max(prof.max_val, value)

        # Welford's online algorithm
        delta = value - prof.mean
        prof.mean += delta / prof.count
        delta2 = value - prof.mean
        prof.m2 += delta * delta2

        # EWMA
        if prof.count == 1:
            prof.ewma = value
        else:
            prof.ewma = (self.ewma_alpha * value) + ((1.0 - self.ewma_alpha) * prof.ewma)

        # CUSUM update if we have sufficient samples
        if prof.count > 20 and prof.std_dev > 0.0001:
            slack = self.cusum_slack_sigma * prof.std_dev
            prof.cusum_pos = max(0.0, prof.cusum_pos + (value - prof.mean - slack))
            prof.cusum_neg = max(0.0, prof.cusum_neg + (prof.mean - value - slack))

    def evaluate_anomaly(self, tag: str, value: float, min_samples: int = 15) -> Tuple[bool, str, float]:
        """
        Evaluate if a value deviates from established baseline.
        Returns: (is_anomaly, reason_description, z_score)
        """
        if tag not in self.profiles:
            return False, "No baseline for tag yet", 0.0

        prof = self.profiles[tag]

        # 1. Check hard physical bounds first
        if prof.hard_min is not None and value < prof.hard_min:
            return True, f"Hard Lower Safety Boundary Violated: {value} < {prof.hard_min}", 99.0
        if prof.hard_max is not None and value > prof.hard_max:
            return True, f"Hard Upper Safety Boundary Violated: {value} > {prof.hard_max}", 99.0

        if prof.count < min_samples or prof.std_dev <= 0.00001:
            return False, "Baseline warming up", 0.0

        # 2. Z-Score evaluation
        z_score = abs(value - prof.mean) / prof.std_dev

        if z_score > 3.5:
            return True, f"Extreme Baseline Deviation (z-score: {z_score:.2f}, val: {value}, mean: {prof.mean:.2f}±{prof.std_dev:.2f})", z_score

        # 3. CUSUM persistent drift evaluation
        cusum_limit = self.cusum_threshold_sigma * prof.std_dev
        if prof.cusum_pos > cusum_limit or prof.cusum_neg > cusum_limit:
            drift_dir = "positive" if prof.cusum_pos > cusum_limit else "negative"
            return True, f"Stealthy Process Drift Detected (CUSUM {drift_dir} drift)", z_score

        return False, "Value within normal baseline", z_score
