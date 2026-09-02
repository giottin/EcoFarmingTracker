import {Duration} from './duration';
import {signal} from '@angular/core';
import {EMPTY_NUTRIENTS, type Nutrients} from '../agriculture/soil-nutrients';

/**
 * Values declared by ECO's AutoGen ResourceConstraints for one crop. They are
 * intentionally kept separate: half-speed is a yield limitation threshold,
 * whereas max-resource-content is the input to the tracker cycle estimate.
 */
export type CropNutrientConstraints = {
  halfSpeedConcentration: Nutrients;
  maxResourceContent: Nutrients;
};

export const EMPTY_CROP_NUTRIENT_CONSTRAINTS: Readonly<CropNutrientConstraints> = {
  halfSpeedConcentration: {...EMPTY_NUTRIENTS},
  maxResourceContent: {...EMPTY_NUTRIENTS}
};

export class Crop {
  id = signal('');
  name = signal('');
  regenerates = signal(false);
  growthTime = signal(new Duration(0, 0));
  readonly iconName: string;
  /** ECO ResourceConstraints, not a direct statement of per-plant consumption. */
  readonly nutrientConstraints: CropNutrientConstraints;

  constructor(
    id: string,
    name: string,
    regenerates: boolean,
    duration: Duration,
    iconName = '',
    nutrientConstraints: CropNutrientConstraints = EMPTY_CROP_NUTRIENT_CONSTRAINTS
  ) {
    this.id.set(id);
    this.name.set(name);
    this.regenerates.set(regenerates);
    this.growthTime.set(duration);
    this.iconName = iconName;
    this.nutrientConstraints = {
      halfSpeedConcentration: {...nutrientConstraints.halfSpeedConcentration},
      maxResourceContent: {...nutrientConstraints.maxResourceContent}
    };
  }

  serialize() {
    return {
      id: this.id(),
      name: this.name(),
      regenerates: this.regenerates(),
      growthTime: this.growthTime()
    }
  }
}

