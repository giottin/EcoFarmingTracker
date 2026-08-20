import type {Crop} from '../model/crop';
import {FERTILIZER_DEFINITIONS} from '../fertilizer-plans/fertilizer-data';

/** One farming plot and one land claim always cover a 5 × 5 area. */
export const PLANTS_PER_CLAIM = 25;

/**
 * ECO starts reducing yield below roughly twenty times the crop consumption.
 * This is deliberately separate from PLANTS_PER_CLAIM: it is only a warning rule.
 */
export const NUTRIENT_WARNING_MULTIPLIER = 20;

export type Nutrients = {nitrogen: number; phosphorus: number; potassium: number};
export type NutrientKey = keyof Nutrients;
export type FertilizerPlanLineLike = {key: string; perClaim: number; total?: number};

export const EMPTY_NUTRIENTS: Readonly<Nutrients> = {nitrogen: 0, phosphorus: 0, potassium: 0};

const NUTRIENT_KEYS: readonly NutrientKey[] = ['nitrogen', 'phosphorus', 'potassium'];

export function clampNutrients(nutrients: Nutrients): Nutrients {
  return {
    nitrogen: clamp(nutrients.nitrogen),
    phosphorus: clamp(nutrients.phosphorus),
    potassium: clamp(nutrients.potassium)
  };
}

export function hasTrackedNutrients(nutrients: Nutrients | undefined): nutrients is Nutrients {
  return !!nutrients && NUTRIENT_KEYS.every(key => Number.isFinite(nutrients[key]));
}

export function cropNutrientConsumptionPerPlant(crop: Crop): Nutrients {
  return crop.nutrientConsumption;
}

/** The average soil value falls by exactly one 5 × 5 claim, regardless of field size. */
export function cropNutrientConsumptionPerClaim(crop: Crop): Nutrients {
  return scale(cropNutrientConsumptionPerPlant(crop), PLANTS_PER_CLAIM);
}

export function calculateFieldNutrientsAfterHarvest(current: Nutrients | undefined, crop: Crop): Nutrients | undefined {
  if (!hasTrackedNutrients(current)) return undefined;
  return subtract(current, cropNutrientConsumptionPerClaim(crop));
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
  const thresholds = scale(cropNutrientConsumptionPerPlant(crop), NUTRIENT_WARNING_MULTIPLIER);
  return NUTRIENT_KEYS.filter(key => current[key] < thresholds[key]);
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
  return clampNutrients({
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

function finiteNonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Number(value)) : 0;
}
