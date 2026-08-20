import {Duration} from './duration';
import {signal} from '@angular/core';
import {EMPTY_NUTRIENTS, type Nutrients} from '../agriculture/soil-nutrients';

export class Crop {
  id = signal('');
  name = signal('');
  regenerates = signal(false);
  growthTime = signal(new Duration(0, 0));
  readonly iconName: string;
  /** Consumption per plant, taken from ECO's generated plant data. */
  readonly nutrientConsumption: Nutrients;

  constructor(id: string, name: string, regenerates: boolean, duration: Duration, iconName = '', nutrientConsumption: Nutrients = {...EMPTY_NUTRIENTS}) {
    this.id.set(id);
    this.name.set(name);
    this.regenerates.set(regenerates);
    this.growthTime.set(duration);
    this.iconName = iconName;
    this.nutrientConsumption = {...nutrientConsumption};
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

