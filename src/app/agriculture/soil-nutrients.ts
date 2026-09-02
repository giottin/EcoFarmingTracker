import type {Crop} from '../model/crop';
import {FERTILIZER_DEFINITIONS} from '../fertilizer-plans/fertilizer-data';

/** One farming plot and one land claim always cover a 5 × 5 area. */
export const PLANTS_PER_CLAIM = 25;
/**
 * ECO exposes ResourceConstraints but not the exact AccumulatingPuller
 * withdrawal formula. Our 5 × 5 claim and one nutrient-layer entry have the
 * same footprint, so the tracker applies one claim-level estimate per cycle.
 * Do not multiply this value by PLANTS_PER_CLAIM: MaxResourceContent is not
 * documented as a per-plant soil-sampler withdrawal. Adjust this single value
 * after comparing future in-game measurements, if ECO publishes that formula.
 */
export const CLAIM_NUTRIENT_CYCLE_ESTIMATE_MULTIPLIER = 1;
/** Soil Sampler readings are normally percentages, but atypical readings must
 * remain visible so a player can spot and correct them. */
export const MAX_TRACKED_NUTRIENT = 999;

export type Nutrients = {nitrogen: number; phosphorus: number; potassium: number};
export type NutrientKey = keyof Nutrients;
export type FertilizerPlanLineLike = {key: string; perClaim: number; total?: number};

export const EMPTY_NUTRIENTS: Readonly<Nutrients> = {nitrogen: 0, phosphorus: 0, potassium: 0};

const NUTRIENT_KEYS: readonly NutrientKey[] = ['nitrogen', 'phosphorus', 'potassium'];

/**
 * Minimum soil percentages before ECO starts limiting the maximum yield for a
 * crop. A zero means that the crop does not use that nutrient, so it must not
 * trigger an alert. Soil values already describe one claim; do not multiply
 * these thresholds by the 25 plants in that claim.
 */
export const CROP_NUTRIENT_THRESHOLDS: Readonly<Record<string, Readonly<Nutrients>>> = {
  agave: {nitrogen: 0, phosphorus: 20, potassium: 0},
  beans: {nitrogen: 10, phosphorus: 20, potassium: 20},
  beets: {nitrogen: 20, phosphorus: 30, potassium: 40},
  bolete: {nitrogen: 10, phosphorus: 20, potassium: 20},
  camas: {nitrogen: 20, phosphorus: 10, potassium: 40},
  cookeina: {nitrogen: 10, phosphorus: 20, potassium: 20},
  corn: {nitrogen: 40, phosphorus: 40, potassium: 10},
  cotton: {nitrogen: 10, phosphorus: 15, potassium: 20},
  crimini: {nitrogen: 0, phosphorus: 0, potassium: 20},
  fiddleheads: {nitrogen: 10, phosphorus: 2, potassium: 4},
  fireweed: {nitrogen: 20, phosphorus: 30, potassium: 20},
  flax: {nitrogen: 10, phosphorus: 8, potassium: 12},
  huckleberries: {nitrogen: 10, phosphorus: 15, potassium: 20},
  papayas: {nitrogen: 10, phosphorus: 2, potassium: 4},
  pineapples: {nitrogen: 10, phosphorus: 2, potassium: 4},
  pears: {nitrogen: 50, phosphorus: 20, potassium: 30},
  pumpkins: {nitrogen: 0, phosphorus: 20, potassium: 0},
  rice: {nitrogen: 10, phosphorus: 0, potassium: 0},
  sunflowers: {nitrogen: 40, phosphorus: 40, potassium: 10},
  taro: {nitrogen: 10, phosphorus: 2, potassium: 4},
  tomatoes: {nitrogen: 20, phosphorus: 20, potassium: 20},
  wheat: {nitrogen: 30, phosphorus: 10, potassium: 10}
};

export function clampNutrients(nutrients: Nutrients): Nutrients {
  return {
    nitrogen: clamp(nutrients.nitrogen),
    phosphorus: clamp(nutrients.phosphorus),
    potassium: clamp(nutrients.potassium)
  };
}

/** Keeps a manually recorded Soil Sampler reading without turning a value
 * above 100 % into a different value. Calculated fertilizer targets continue
 * to use clampNutrients() and therefore cannot exceed 100 %. */
export function clampTrackedNutrients(nutrients: Nutrients): Nutrients {
  return {
    nitrogen: clampTracked(nutrients.nitrogen),
    phosphorus: clampTracked(nutrients.phosphorus),
    potassium: clampTracked(nutrients.potassium)
  };
}

export function hasTrackedNutrients(nutrients: Nutrients | undefined): nutrients is Nutrients {
  return !!nutrients && NUTRIENT_KEYS.every(key => Number.isFinite(nutrients[key]));
}

/**
 * Estimated N/P/K variation for one completed crop cycle on one claim.
 * MaxResourceContent is used only as a crop-specific, claim-level estimate;
 * HalfSpeedConcentration remains reserved for yield/alert thresholds.
 */
export function calculateNutrientChangeForCrop(crop: Crop): Nutrients {
  return scale(crop.nutrientConstraints.maxResourceContent, CLAIM_NUTRIENT_CYCLE_ESTIMATE_MULTIPLIER);
}

export function calculateFieldNutrientsAfterHarvest(current: Nutrients | undefined, crop: Crop): Nutrients | undefined {
  if (!hasTrackedNutrients(current)) return undefined;
  return subtract(current, calculateNutrientChangeForCrop(crop));
}

/**
 * The plan stores an amount per claim. Its total craft quantity must never be
 * used here because field nutrients represent the average of all claims.
 */
export function calculateFertilizerContributionPerClaim(lines: readonly FertilizerPlanLineLike[]): Nutrients {
  return lines.reduce<Nutrients>((total, line) => {
    const fertilizer = FERTILIZER_DEFINITIONS.find(candidate => candidate.key === line.key);
    const quantity = finiteNonNegative(line.perClaim);
    if (!fertilizer || quantity === 0) return total;
    return {
      nitrogen: total.nitrogen + fertilizer.nitrogen * quantity,
      phosphorus: total.phosphorus + fertilizer.phosphorus * quantity,
      potassium: total.potassium + fertilizer.potassium * quantity
    };
  }, {...EMPTY_NUTRIENTS});
}

export function calculateFieldNutrientsAfterFertilization(
  current: Nutrients | undefined,
  lines: readonly FertilizerPlanLineLike[],
  fallbackFromPlan?: Nutrients
): Nutrients | undefined {
  const baseline = hasTrackedNutrients(current)
    ? current
    : hasTrackedNutrients(fallbackFromPlan) ? fallbackFromPlan : undefined;
  if (!baseline) return undefined;
  return add(baseline, calculateFertilizerContributionPerClaim(lines));
}

export function getNutrientWarnings(current: Nutrients | undefined, crop: Crop): NutrientKey[] {
  if (!hasTrackedNutrients(current)) return [];
  // Existing crop alerts stay independently calibrated. For a future crop
  // without an explicit threshold, use its HalfSpeedConcentration rather than
  // confusing its estimated nutrient withdrawal with a yield-limit threshold.
  const thresholds = CROP_NUTRIENT_THRESHOLDS[crop.id()] ?? scale(crop.nutrientConstraints.halfSpeedConcentration, 100);
  return NUTRIENT_KEYS.filter(key => thresholds[key] > 0 && current[key] <= thresholds[key]);
}

export function nutrientLabel(key: NutrientKey): string {
  return {nitrogen: 'Azote', phosphorus: 'Phosphore', potassium: 'Potassium'}[key];
}

function add(left: Nutrients, right: Nutrients): Nutrients {
  return clampNutrients({
    nitrogen: left.nitrogen + right.nitrogen,
    phosphorus: left.phosphorus + right.phosphorus,
    potassium: left.potassium + right.potassium
  });
}

function subtract(left: Nutrients, right: Nutrients): Nutrients {
  return clampTrackedNutrients({
    nitrogen: left.nitrogen - right.nitrogen,
    phosphorus: left.phosphorus - right.phosphorus,
    potassium: left.potassium - right.potassium
  });
}

function scale(nutrients: Nutrients, multiplier: number): Nutrients {
  return {
    nitrogen: nutrients.nitrogen * multiplier,
    phosphorus: nutrients.phosphorus * multiplier,
    potassium: nutrients.potassium * multiplier
  };
}

function clamp(value: number): number {
  return Math.min(100, Math.max(0, finiteNonNegative(value)));
}

function clampTracked(value: number): number {
  return Math.min(MAX_TRACKED_NUTRIENT, Math.max(0, finiteNonNegative(value)));
}

function finiteNonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Number(value)) : 0;
}
