import {Crop} from './crop';
import {Duration} from './duration';
import {Field} from './field';

describe('Field harvest behavior', () => {
  const fullGrowth = new Duration(28, 48);
  const persistentCrops = [
    ['cotton', 'Cotton'],
    ['huckleberries', 'Huckleberries'],
    ['tomatoes', 'Tomatoes']
  ] as const;

  beforeEach(() => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2026-08-13T12:00:00.000Z'));
  });

  afterEach(() => jasmine.clock().uninstall());

  for (const [id, name] of persistentCrops) {
    it(`keeps ${name} planted and starts its historical regrowth timer after harvest`, () => {
      const field = new Field(1, new Crop(id, name, true, fullGrowth));
      field.onPlant();

      field.onHarvest();

      expect(field.isPlanted()).toBeTrue();
      expect(field.selfRegenFullyGrown()).toBeTrue();
      expect(field.plantTime()?.toISOString()).toBe('2026-08-13T12:00:00.000Z');
      expect(field.harvestTime()?.toISOString()).toBe('2026-08-14T02:24:00.000Z');
    });
  }

  it('still clears a crop that must be replanted after harvest', () => {
    const field = new Field(1, new Crop('wheat', 'Wheat', false, new Duration(19, 12)));
    field.onPlant();

    field.onHarvest();

    expect(field.isPlanted()).toBeFalse();
    expect(field.plantTime()).toBeUndefined();
    expect(field.harvestTime()).toBeUndefined();
    expect(field.selfRegenFullyGrown()).toBeFalse();
  });

  it('serializes a field size without changing a running timer', () => {
    const field = new Field(1, new Crop('wheat', 'Wheat', false, new Duration(19, 12)));
    field.onPlant();
    const harvestTime = field.harvestTime()?.toISOString();
    field.plantCount.set(450);

    expect(field.serialize().plantCount).toBe(450);
    expect(field.serialize().isPlanted).toBeTrue();
    expect(field.serialize().harvestTime?.toISOString()).toBe(harvestTime);
  });
});
