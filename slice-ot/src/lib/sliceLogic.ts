export type LikelihoodScore = 1 | 2 | 3 | 4 | 5;
export type ConfidenceLevel = 'Low' | 'Moderate' | 'High';
export type ImpactScore = 1 | 2 | 3 | 4 | 5;
export type LikelihoodTier = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';
export type ImpactTier = 'I1' | 'I2' | 'I3' | 'I4' | 'I5';
export type SliceAction =
  | 'MITIGATE'
  | 'INVESTIGATE'
  | 'CHARACTERIZE'
  | 'ASSESS'
  | 'MONITOR'
  | 'ACCEPT';

export interface LikelihoodInputs {
  accessibility: LikelihoodScore; // A (Weight: 0.40)
  exploitComplexity: LikelihoodScore; // E (Weight: 0.35)
  historicalFrequency: LikelihoodScore; // H (Weight: 0.25)
}

export interface ConfidenceInputs {
  controlValidation: ConfidenceLevel; // C1
  assetInventory: ConfidenceLevel; // C2
  networkTelemetry: ConfidenceLevel; // C3
  analyticCorroboration: ConfidenceLevel; // C4
}

export interface ImpactInputs {
  safety: ImpactScore;
  environmental: ImpactScore;
  operational: ImpactScore;
}

export interface ScenarioMetadata {
  title: string;
  assetZone: string;
  attackPath: string;
  consequenceChain: string;
}

export interface AppliedRule {
  id: 'single-source-override' | 'historical-linkage-rule' | 'bias-catalog-gate';
  title: string;
  detail: string;
}

export interface AdvisoryFinding {
  id: string;
  severity: 'warn' | 'info';
  title: string;
  detail: string;
}

export interface SliceResult {
  likelihoodScore: number;
  likelihoodTier: LikelihoodTier;
  likelihoodLabel: string;
  likelihoodRange: string;
  baseConfidenceRating: ConfidenceLevel;
  confidenceRating: ConfidenceLevel;
  impactScore: ImpactScore;
  impactTier: ImpactTier;
  impactLabel: string;
  action: SliceAction;
  appliedRules: AppliedRule[];
  advisories: AdvisoryFinding[];
  triplet: string;
}

export interface BiasDefinition {
  id: string;
  number: number;
  label: string;
  effect: string;
  enforcementRule: string;
}

export interface ScenarioPreset {
  id: string;
  name: string;
  badge: string;
  summary: string;
  metadata: ScenarioMetadata;
  likelihood: LikelihoodInputs;
  confidence: ConfidenceInputs;
  impact: ImpactInputs;
  biases: string[];
}

export const BIAS_CATALOG: BiasDefinition[] = [
  {
    id: 'airGap',
    number: 1,
    label: 'Air-Gap Complacency',
    effect: 'Assumes network isolation equals security, ignoring physical vectors and convergence creep.',
    enforcementRule: 'Accessibility floor: air-gapped assets with untrusted physical vectors cannot score below A=3.',
  },
  {
    id: 'absenceEvidence',
    number: 2,
    label: 'Absence-of-Evidence Fallacy',
    effect: 'Interprets zero incidents as security rather than zero detection capability.',
    enforcementRule: 'Detection Sufficiency Test required before scoring H below 3.',
  },
  {
    id: 'vendorTrust',
    number: 3,
    label: 'Vendor Trust Bias',
    effect: 'Accepts OEM security claims without independent verification.',
    enforcementRule: 'Confidence cannot be High if scores rest solely on vendor claims.',
  },
  {
    id: 'safetyReliance',
    number: 4,
    label: 'Safety System Over-Reliance',
    effect: 'Assumes SIS will compensate for BPCS vulnerabilities.',
    enforcementRule: 'Dual-system scenario: must score both SIS-available and SIS-compromised.',
  },
  {
    id: 'recency',
    number: 5,
    label: 'Recency Bias',
    effect: 'Over-weights recent headlines; under-weights persistent threats.',
    enforcementRule: '36-month evidence window. Single-event sensitivity test.',
  },
  {
    id: 'complexity',
    number: 6,
    label: 'Complexity Discount',
    effect: 'Assumes OT attacks must be sophisticated, ignoring simpler paths.',
    enforcementRule: 'Minimum Viable Attack Rule: E scored for simplest path to consequence.',
  },
  {
    id: 'normalization',
    number: 7,
    label: 'Normalization of Residual Risk',
    effect: 'Treats long-standing vulnerabilities as lower risk due to familiarity.',
    enforcementRule: 'Vulnerability Age Neutrality. Untested compensating controls reduce C4.',
  },
  {
    id: 'sector',
    number: 8,
    label: 'Sector Exceptionalism',
    effect: 'Believes the organization is not a plausible target.',
    enforcementRule: 'Platform-based threat inclusion. Opportunistic threat baseline.',
  },
  {
    id: 'anchoring',
    number: 9,
    label: 'Assessment Anchoring',
    effect: 'Prior scores bias reassessment toward incremental adjustment.',
    enforcementRule: 'Blind Scoring Procedure: score before reviewing prior values.',
  },
  {
    id: 'optimism',
    number: 10,
    label: 'Consequence Optimism',
    effect: 'Underestimates cascading consequences and assumes normal operator response.',
    enforcementRule: 'Cascade Modeling and Degraded Response Test.',
  },
];

export const ALL_BIAS_IDS = BIAS_CATALOG.map((b) => b.id);

export const LIKELIHOOD_TIERS: Array<{
  min: number;
  label: LikelihoodTier;
  icdLanguage: string;
  probRange: string;
  interpretation: string;
}> = [
  {
    min: 4.21,
    label: 'L5',
    icdLanguage: 'Almost certain',
    probRange: '~85–97%',
    interpretation: 'Event is expected absent significant change in conditions.',
  },
  {
    min: 3.41,
    label: 'L4',
    icdLanguage: 'Likely',
    probRange: '~55–80%',
    interpretation: 'Event will probably occur given current trajectory.',
  },
  {
    min: 2.61,
    label: 'L3',
    icdLanguage: 'Roughly even chance',
    probRange: '~40–60%',
    interpretation: 'Contributing factors exist but outcome is uncertain.',
  },
  {
    min: 1.81,
    label: 'L2',
    icdLanguage: 'Unlikely',
    probRange: '~15–35%',
    interpretation: 'Event is possible but not expected under current conditions.',
  },
  {
    min: 0,
    label: 'L1',
    icdLanguage: 'Remote',
    probRange: '~2–15%',
    interpretation: 'Event would require extraordinary or unprecedented circumstances.',
  },
];

export const IMPACT_TIERS: Array<{
  val: ImpactScore;
  label: ImpactTier;
  desc: string;
}> = [
  { val: 5, label: 'I5', desc: 'Catastrophic' },
  { val: 4, label: 'I4', desc: 'Severe' },
  { val: 3, label: 'I3', desc: 'Significant' },
  { val: 2, label: 'I2', desc: 'Minor' },
  { val: 1, label: 'I1', desc: 'Negligible' },
];

export const ACTION_DETAILS: Record<
  SliceAction,
  { title: string; summary: string; mandate: string }
> = {
  MITIGATE: {
    title: 'Deploy Controls Immediately',
    summary: 'Risk is high and backed by strong, corroborated evidence.',
    mandate: 'Harden attack path, enforce conduit ACLs, and validate remediation.',
  },
  INVESTIGATE: {
    title: 'Targeted Verification',
    summary: 'Risk appears elevated or moderate, but evidentiary gaps remain.',
    mandate: 'Execute scoped OT pentest, architecture audit, or telemetry check before capex.',
  },
  CHARACTERIZE: {
    title: 'Close Visibility Blind Spots',
    summary: 'Evidence is too thin to rely on the Likelihood score — "we don’t know" ≠ "we’re safe."',
    mandate: 'Deploy passive OT IDS, complete firmware/protocol inventory, and re-score.',
  },
  ASSESS: {
    title: 'Focused Technical Assessment',
    summary: 'Moderate likelihood with partial confidence; narrow uncertainty efficiently.',
    mandate: 'Validate compensating controls and corroborate with second independent source.',
  },
  MONITOR: {
    title: 'Maintain Situational Awareness',
    summary: 'Controls and evidence are adequately aligned to current exposure.',
    mandate: 'Track OT IDS alerts and re-evaluate on defined schedule or topology change.',
  },
  ACCEPT: {
    title: 'Formal Risk Acceptance',
    summary: 'Risk is genuinely low and substantiated by high-confidence evidence.',
    mandate: 'Document owner sign-off, rationale, and review expiration date.',
  },
};

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'bottom-right-paradox',
    name: 'Legacy Line Blind Spot (Bottom-Right Paradox)',
    badge: 'CHARACTERIZE',
    summary: 'Low apparent Likelihood (L1) + Low telemetry/inventory (C-Low) still forces CHARACTERIZE.',
    metadata: {
      title: 'Unauthorized Modbus Write to Packaging Line PLC',
      assetZone: 'Purdue Level 1 · Legacy Packaging Cell (Zone P-04)',
      attackPath: 'Unmonitored vendor laptop / transient maintenance switch port -> Modbus FC 05/06',
      consequenceChain: 'Uncommanded actuator cycle -> pinch hazard (minor injury) + 18-hour line halt',
    },
    likelihood: { accessibility: 2, exploitComplexity: 2, historicalFrequency: 1 },
    confidence: {
      controlValidation: 'Low',
      assetInventory: 'Low',
      networkTelemetry: 'Low',
      analyticCorroboration: 'Low',
    },
    impact: { safety: 3, environmental: 1, operational: 3 },
    biases: ['airGap', 'absenceEvidence', 'complexity'],
  },
  {
    id: 'exposed-water-hmi',
    name: 'Exposed Water Plant HMI',
    badge: 'MITIGATE',
    summary: 'High Likelihood (L5) backed by recent pentest, full inventory, and IDS (C-High).',
    metadata: {
      title: 'Remote Setpoint Override on Chemical Dosing HMI',
      assetZone: 'Purdue Level 2 · Municipal Water Supervisory Zone',
      attackPath: 'Internet-exposed remote desktop gateway -> HMI -> PLC chlorine dosing register',
      consequenceChain: 'Chlorine overfeed -> regulatory violation, boil-water order, public health risk',
    },
    likelihood: { accessibility: 5, exploitComplexity: 5, historicalFrequency: 4 },
    confidence: {
      controlValidation: 'High',
      assetInventory: 'High',
      networkTelemetry: 'High',
      analyticCorroboration: 'High',
    },
    impact: { safety: 4, environmental: 3, operational: 4 },
    biases: [...ALL_BIAS_IDS],
  },
  {
    id: 'vendor-claim-override',
    name: 'Vendor-Claimed Hardening (Single-Source Override)',
    badge: 'INVESTIGATE',
    summary: 'Even with High C1–C3, C4=Low (vendor claim alone) forces overall Confidence to Low.',
    metadata: {
      title: 'Engineering Workstation Pivot into Turbine Control Network',
      assetZone: 'Purdue Level 2/1 · Power Generation Control Ring',
      attackPath: 'Phished dual-homed engineering workstation -> proprietary protocol upload',
      consequenceChain: 'Unplanned turbine trip -> grid instability and multi-day thermal restart',
    },
    likelihood: { accessibility: 3, exploitComplexity: 3, historicalFrequency: 3 },
    confidence: {
      controlValidation: 'High',
      assetInventory: 'High',
      networkTelemetry: 'High',
      analyticCorroboration: 'Low',
    },
    impact: { safety: 3, environmental: 2, operational: 4 },
    biases: [...ALL_BIAS_IDS],
  },
  {
    id: 'sis-linkage-rule',
    name: 'Air-Gapped SIS (Linkage Rule Cap)',
    badge: 'MONITOR',
    summary: 'All C1–C4 High, but H=1 (unprecedented) caps Confidence at Moderate via Linkage Rule.',
    metadata: {
      title: 'Safety Instrumented System Logic Modification via Maintenance Port',
      assetZone: 'Purdue Level 1 · High-Pressure Separator SIS (SIL-3)',
      attackPath: 'Verified physical air-gap -> controlled engineering loader w/ dual custody',
      consequenceChain: 'Overpressure relief failure if simultaneous BPCS upset occurs (Cascade I5)',
    },
    likelihood: { accessibility: 1, exploitComplexity: 1, historicalFrequency: 1 },
    confidence: {
      controlValidation: 'High',
      assetInventory: 'High',
      networkTelemetry: 'High',
      analyticCorroboration: 'High',
    },
    impact: { safety: 5, environmental: 4, operational: 5 },
    biases: [...ALL_BIAS_IDS],
  },
  {
    id: 'lng-vaporizer-moderate',
    name: 'LNG Vaporizer Control (Balanced Moderate)',
    badge: 'ASSESS',
    summary: 'Roughly even chance (L3) with Moderate Confidence -> focused ASSESS recommendation.',
    metadata: {
      title: 'BPCS Vaporizer Outlet Temperature Manipulation',
      assetZone: 'Purdue Level 1/2 · LNG Sendout Train B',
      attackPath: 'DMZ historian jump host -> Level 2 SCADA -> Modbus-TCP write to temperature loop',
      consequenceChain: 'Cryogenic carryover downstream -> vessel embrittlement risk & train shutdown',
    },
    likelihood: { accessibility: 3, exploitComplexity: 3, historicalFrequency: 3 },
    confidence: {
      controlValidation: 'Moderate',
      assetInventory: 'Moderate',
      networkTelemetry: 'Moderate',
      analyticCorroboration: 'Moderate',
    },
    impact: { safety: 4, environmental: 4, operational: 5 },
    biases: [...ALL_BIAS_IDS],
  },
];

const CONFIDENCE_VALUES: Record<ConfidenceLevel, number> = {
  Low: 1,
  Moderate: 2,
  High: 3,
};

export function calculateLikelihood(inputs: LikelihoodInputs): {
  score: number;
  tier: LikelihoodTier;
  icdLanguage: string;
  probRange: string;
} {
  const score =
    0.4 * inputs.accessibility +
    0.35 * inputs.exploitComplexity +
    0.25 * inputs.historicalFrequency;
  const roundedScore = Math.round(score * 100) / 100;

  const matched =
    LIKELIHOOD_TIERS.find((t) => roundedScore >= t.min) || LIKELIHOOD_TIERS[4];

  return {
    score: roundedScore,
    tier: matched.label,
    icdLanguage: matched.icdLanguage,
    probRange: matched.probRange,
  };
}

export function calculateBaseConfidence(inputs: ConfidenceInputs): ConfidenceLevel {
  const values = [
    CONFIDENCE_VALUES[inputs.controlValidation],
    CONFIDENCE_VALUES[inputs.assetInventory],
    CONFIDENCE_VALUES[inputs.networkTelemetry],
    CONFIDENCE_VALUES[inputs.analyticCorroboration],
  ];

  const lowCount = values.filter((v) => v === 1).length;
  const modCount = values.filter((v) => v === 2).length;
  const highCount = values.filter((v) => v === 3).length;

  if (lowCount >= 2) return 'Low';
  if (highCount >= 3 && lowCount === 0) return 'High';
  if (modCount + highCount >= 2 && lowCount <= 1) return 'Moderate';
  return 'Low';
}

export function calculateConfidenceDetailed(
  inputs: ConfidenceInputs,
  historicalFrequency: LikelihoodScore,
  biasesReviewedCount = ALL_BIAS_IDS.length
): {
  baseRating: ConfidenceLevel;
  rating: ConfidenceLevel;
  appliedRules: AppliedRule[];
} {
  const baseRating = calculateBaseConfidence(inputs);
  let rating: ConfidenceLevel = baseRating;
  const appliedRules: AppliedRule[] = [];

  if (inputs.analyticCorroboration === 'Low') {
    rating = 'Low';
    appliedRules.push({
      id: 'single-source-override',
      title: 'Single-Source Override Active',
      detail:
        'C4 (Analytic Corroboration) is Low — overall Confidence is forced to Low regardless of C1–C3.',
    });
  }

  if (historicalFrequency <= 2 && rating === 'High') {
    rating = 'Moderate';
    appliedRules.push({
      id: 'historical-linkage-rule',
      title: 'Historical Linkage Rule Cap',
      detail:
        'Historical Frequency is H=1 or H=2 (sparse empirical evidence) — overall Confidence cannot exceed Moderate.',
    });
  }

  if (biasesReviewedCount < ALL_BIAS_IDS.length && rating === 'High') {
    rating = 'Moderate';
    appliedRules.push({
      id: 'bias-catalog-gate',
      title: 'Bias Catalog Gate Active',
      detail: `Only ${biasesReviewedCount}/${ALL_BIAS_IDS.length} OT analytic biases reviewed — Confidence is capped at Moderate until all 10 are evaluated.`,
    });
  }

  return { baseRating, rating, appliedRules };
}

export function calculateConfidence(
  inputs: ConfidenceInputs,
  historicalFrequency: LikelihoodScore,
  biasesReviewedCount = ALL_BIAS_IDS.length
): ConfidenceLevel {
  return calculateConfidenceDetailed(inputs, historicalFrequency, biasesReviewedCount).rating;
}

export function calculateImpact(inputs: ImpactInputs): {
  score: ImpactScore;
  tier: ImpactTier;
  desc: string;
} {
  const maxScore = Math.max(inputs.safety, inputs.environmental, inputs.operational) as ImpactScore;
  const matched = IMPACT_TIERS.find((t) => t.val === maxScore) || IMPACT_TIERS[4];
  return { score: maxScore, tier: matched.label, desc: matched.desc };
}

export function determineAction(
  likelihoodTier: LikelihoodTier | string,
  confidenceRating: ConfidenceLevel
): SliceAction {
  if (likelihoodTier === 'L4' || likelihoodTier === 'L5') {
    if (confidenceRating === 'High') return 'MITIGATE';
    if (confidenceRating === 'Moderate') return 'INVESTIGATE';
    return 'CHARACTERIZE';
  }

  if (likelihoodTier === 'L3') {
    if (confidenceRating === 'High') return 'MONITOR';
    if (confidenceRating === 'Moderate') return 'ASSESS';
    return 'INVESTIGATE';
  }

  if (confidenceRating === 'High') return 'ACCEPT';
  if (confidenceRating === 'Moderate') return 'MONITOR';
  return 'CHARACTERIZE';
}

export function collectAdvisories(
  lInputs: LikelihoodInputs,
  cInputs: ConfidenceInputs,
  iInputs: ImpactInputs,
  reviewedBiases: string[]
): AdvisoryFinding[] {
  const advisories: AdvisoryFinding[] = [];
  const maxImpact = Math.max(iInputs.safety, iInputs.environmental, iInputs.operational);

  if (lInputs.accessibility <= 2 && !reviewedBiases.includes('airGap')) {
    advisories.push({
      id: 'air-gap-floor',
      severity: 'warn',
      title: 'Air-Gap Complacency Check (Bias #1)',
      detail:
        'Asset scored A <= 2. Confirm USB/removable media controls and physical access before keeping A below 3.',
    });
  }

  if (lInputs.historicalFrequency <= 2 && cInputs.networkTelemetry === 'Low') {
    advisories.push({
      id: 'detection-sufficiency',
      severity: 'warn',
      title: 'Absence-of-Evidence Fallacy (Bias #2)',
      detail:
        'H <= 2 while Network Telemetry (C3) is Low. Pass the Detection Sufficiency Test before ruling out prior unseen intrusions.',
    });
  }

  if (maxImpact >= 3) {
    advisories.push({
      id: 'cascade-degraded',
      severity: 'info',
      title: 'Cascade Modeling & Degraded Response (Bias #10)',
      detail:
        'Impact >= I3 requires documenting consequence chains at least 2 levels deep and scoring degraded operator response.',
    });
  }

  return advisories;
}

export function calculateSlice(
  lInputs: LikelihoodInputs,
  cInputs: ConfidenceInputs,
  iInputs: ImpactInputs,
  reviewedBiases: string[] = ALL_BIAS_IDS
): SliceResult {
  const lResult = calculateLikelihood(lInputs);
  const cResult = calculateConfidenceDetailed(
    cInputs,
    lInputs.historicalFrequency,
    reviewedBiases.length
  );
  const iResult = calculateImpact(iInputs);
  const action = determineAction(lResult.tier, cResult.rating);
  const advisories = collectAdvisories(lInputs, cInputs, iInputs, reviewedBiases);

  return {
    likelihoodScore: lResult.score,
    likelihoodTier: lResult.tier,
    likelihoodLabel: lResult.icdLanguage,
    likelihoodRange: lResult.probRange,
    baseConfidenceRating: cResult.baseRating,
    confidenceRating: cResult.rating,
    impactScore: iResult.score,
    impactTier: iResult.tier,
    impactLabel: iResult.desc,
    action,
    appliedRules: cResult.appliedRules,
    advisories,
    triplet: `${lResult.tier} (${lResult.score.toFixed(2)}) : C-${cResult.rating} : ${iResult.tier}`,
  };
}
