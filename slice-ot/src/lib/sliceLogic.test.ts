import { describe, it, expect } from 'vitest';
import {
  ALL_BIAS_IDS,
  calculateLikelihood,
  calculateConfidence,
  calculateConfidenceDetailed,
  calculateImpact,
  determineAction,
  calculateSlice,
  type LikelihoodInputs,
  type ConfidenceInputs,
  type ImpactInputs,
} from './sliceLogic';

describe('SLiCE Methodology Engine', () => {
  it('computes weighted Likelihood score and L5/L1 bounds accurately', () => {
    expect(
      calculateLikelihood({ accessibility: 5, exploitComplexity: 5, historicalFrequency: 5 })
    ).toMatchObject({ score: 5.0, tier: 'L5', icdLanguage: 'Almost certain' });

    expect(
      calculateLikelihood({ accessibility: 1, exploitComplexity: 1, historicalFrequency: 1 })
    ).toMatchObject({ score: 1.0, tier: 'L1', icdLanguage: 'Remote' });

    // 0.4*4 + 0.35*3 + 0.25*3 = 1.6 + 1.05 + 0.75 = 3.40 -> L3
    expect(
      calculateLikelihood({ accessibility: 4, exploitComplexity: 3, historicalFrequency: 3 })
    ).toMatchObject({ score: 3.4, tier: 'L3' });

    // 0.4*5 + 0.35*3 + 0.25*2 = 2.0 + 1.05 + 0.50 = 3.55 -> L4
    expect(
      calculateLikelihood({ accessibility: 5, exploitComplexity: 3, historicalFrequency: 2 })
    ).toMatchObject({ score: 3.55, tier: 'L4' });
  });

  it('evaluates Base Confidence Aggregation rules cleanly', () => {
    const highBase: ConfidenceInputs = {
      controlValidation: 'High',
      assetInventory: 'High',
      networkTelemetry: 'High',
      analyticCorroboration: 'Moderate',
    };
    expect(calculateConfidence(highBase, 3)).toBe('High');

    const modTwoOfFour: ConfidenceInputs = {
      controlValidation: 'High',
      assetInventory: 'High',
      networkTelemetry: 'Low',
      analyticCorroboration: 'Moderate',
    };
    expect(calculateConfidence(modTwoOfFour, 4)).toBe('Moderate');

    const lowTwoDims: ConfidenceInputs = {
      controlValidation: 'High',
      assetInventory: 'Low',
      networkTelemetry: 'Low',
      analyticCorroboration: 'High',
    };
    expect(calculateConfidence(lowTwoDims, 5)).toBe('Low');
  });

  it('enforces Single-Source Override when C4 is Low', () => {
    const inputs: ConfidenceInputs = {
      controlValidation: 'High',
      assetInventory: 'High',
      networkTelemetry: 'High',
      analyticCorroboration: 'Low',
    };
    const res = calculateConfidenceDetailed(inputs, 5, ALL_BIAS_IDS.length);
    expect(res.baseRating).toBe('Moderate');
    expect(res.rating).toBe('Low');
    expect(res.appliedRules.map((r) => r.id)).toContain('single-source-override');
  });

  it('enforces Historical Linkage Rule when H=1 or H=2', () => {
    const inputs: ConfidenceInputs = {
      controlValidation: 'High',
      assetInventory: 'High',
      networkTelemetry: 'High',
      analyticCorroboration: 'High',
    };
    const resH2 = calculateConfidenceDetailed(inputs, 2, ALL_BIAS_IDS.length);
    expect(resH2.baseRating).toBe('High');
    expect(resH2.rating).toBe('Moderate');
    expect(resH2.appliedRules.map((r) => r.id)).toContain('historical-linkage-rule');

    const resH1 = calculateConfidenceDetailed(inputs, 1, ALL_BIAS_IDS.length);
    expect(resH1.rating).toBe('Moderate');
  });

  it('enforces Bias Catalog Gate when fewer than 10 biases are reviewed', () => {
    const inputs: ConfidenceInputs = {
      controlValidation: 'High',
      assetInventory: 'High',
      networkTelemetry: 'High',
      analyticCorroboration: 'High',
    };
    const resIncomplete = calculateConfidenceDetailed(inputs, 4, 9);
    expect(resIncomplete.rating).toBe('Moderate');
    expect(resIncomplete.appliedRules.map((r) => r.id)).toContain('bias-catalog-gate');

    const resComplete = calculateConfidenceDetailed(inputs, 4, 10);
    expect(resComplete.rating).toBe('High');
  });

  it('computes Impact from the worst-case category', () => {
    const imp: ImpactInputs = { safety: 2, environmental: 5, operational: 3 };
    expect(calculateImpact(imp)).toMatchObject({ score: 5, tier: 'I5', desc: 'Catastrophic' });
  });

  it('maps all 9 Decision Matrix cells including the Bottom-Right Paradox', () => {
    expect(determineAction('L5', 'High')).toBe('MITIGATE');
    expect(determineAction('L4', 'Moderate')).toBe('INVESTIGATE');
    expect(determineAction('L4', 'Low')).toBe('CHARACTERIZE');

    expect(determineAction('L3', 'High')).toBe('MONITOR');
    expect(determineAction('L3', 'Moderate')).toBe('ASSESS');
    expect(determineAction('L3', 'Low')).toBe('INVESTIGATE');

    expect(determineAction('L1', 'High')).toBe('ACCEPT');
    expect(determineAction('L2', 'Moderate')).toBe('MONITOR');
    expect(determineAction('L1', 'Low')).toBe('CHARACTERIZE');
    expect(determineAction('L2', 'Low')).toBe('CHARACTERIZE');
  });

  it('recomputes final action when Bias Gate downgrades High Confidence to Moderate', () => {
    const l: LikelihoodInputs = { accessibility: 5, exploitComplexity: 5, historicalFrequency: 4 };
    const c: ConfidenceInputs = {
      controlValidation: 'High',
      assetInventory: 'High',
      networkTelemetry: 'High',
      analyticCorroboration: 'High',
    };
    const i: ImpactInputs = { safety: 4, environmental: 2, operational: 4 };

    const complete = calculateSlice(l, c, i, ALL_BIAS_IDS);
    expect(complete.confidenceRating).toBe('High');
    expect(complete.action).toBe('MITIGATE');

    const incomplete = calculateSlice(l, c, i, ALL_BIAS_IDS.slice(0, 5));
    expect(incomplete.confidenceRating).toBe('Moderate');
    expect(incomplete.action).toBe('INVESTIGATE');
  });
});
