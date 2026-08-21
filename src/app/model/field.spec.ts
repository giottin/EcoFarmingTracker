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

  it('deducts nutrients once per harvest while keeping a persistent crop planted', () => {
    const cotton = new Crop('cotton', 'Cotton', true, fullGrowth, '', {nitrogen: .1, phosphorus: .15, potassium: .2});
    const field = new Field(1, cotton);
    field.soilNutrients.set({nitrogen: 72, phosphorus: 58, potassium: 81});
    field.onPlant();

    field.onHarvest();

    expect(field.soilNutrients()).toEqual({nitrogen: 69.5, phosphorus: 54.25, potassium: 76});
    expect(field.isPlanted()).toBeTrue();
    expect(field.harvestTime()?.toISOString()).toBe('2026-08-14T02:24:00.000Z');
  });

  it('deducts the persistent huckleberry consumption once during each completed regrowth cycle', () => {
    const huckleberries = new Crop('huckleberries', 'Huckleberries', true, fullGrowth, '', {nitrogen: .1, phosphorus: .15, potassium: .2});
    const field = new Field(1, huckleberries);
    field.soilNutrients.set({nitrogen: 150, phosphorus: 150, potassium: 150});
    field.onPlant();

    jasmine.clock().tick((28 * 60 + 48) * 60 * 1000);
    field.onHarvest();
    jasmine.clock().tick((14 * 60 + 24) * 60 * 1000);
    field.onHarvest();

    expect(field.soilNutrients()).toEqual({nitrogen: 145, phosphorus: 142.5, potassium: 140});
    expect(field.isPlanted()).toBeTrue();
  });
});
