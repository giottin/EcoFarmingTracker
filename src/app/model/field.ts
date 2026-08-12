import {Crop} from './crop';
import {Duration} from './duration';
import {signal} from '@angular/core';

export class Field {
  id: number;
  name = signal('');
  crop = signal(new Crop('-1', '', false, new Duration(0, 0)));
  plantTime = signal<Date | undefined>(undefined)
  harvestTime = signal<Date | undefined>(undefined);
  selfRegenFullyGrown = signal(false);

  isPlanted = signal(false);


  constructor(id: number, crop: Crop) {
    this.id = id;
    this.crop = signal(crop);
    this.selfRegenFullyGrown = signal(false);
  }

  serialize(): StoredField {
    return {
      id: this.id,
      name: this.name(),
      cropId: this.crop().id(),
      plantTime: this.plantTime(),
      harvestTime: this.harvestTime(),
      selfRegenFullyGrown: this.selfRegenFullyGrown(),
      isPlanted: this.isPlanted()
    }
  }

  onPlant(growthMultiplier = 1) {
    this.selfRegenFullyGrown.set(false);
    this.plant(growthMultiplier);
  }

  onHarvest() {
    this.harvest();
  }

  private plant(growthMultiplier = 1) {
    const plantTime = new Date();
    this.plantTime.set(plantTime);
    this.isPlanted.set(true);

    const plantTimestamp = plantTime.getTime();
    const growthHours = this.crop().growthTime().hours;
    const growthMinutes = this.crop().growthTime().minutes;
    let additionalMillis = ((growthHours * 60 * 60 * 1000) + (growthMinutes * 60 * 1000)) * growthMultiplier;
    if (this.selfRegenFullyGrown()) {
      additionalMillis *= 0.5;
    }
    const harvestTimestamp = plantTimestamp + additionalMillis;
    this.harvestTime.set(new Date(harvestTimestamp));
  }

  private harvestRegenerating() {
    this.selfRegenFullyGrown.set(true);
    this.plant();
  }

  private harvest() {
    this.plantTime.set(undefined);
    this.isPlanted.set(false)

    this.harvestTime.set(undefined);
  }

}

export type StoredField = {
  id: number,
  name: string,
  cropId: string,
  plantTime: Date | undefined,
  harvestTime: Date | undefined,
  selfRegenFullyGrown: boolean,
  isPlanted: boolean
}
