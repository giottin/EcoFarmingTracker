import {Crop} from '../model/crop';
import {Duration} from '../model/duration';
import {ALL_CROPS} from '../service/crop.service';
import {
  calculateFertilizerContributionPerClaim,
  calculateFieldNutrientsAfterFertilization,
  calculateFieldNutrientsAfterHarvest,
  calculateNutrientChangeForCrop,
  getNutrientWarnings,
  PLANTS_PER_CLAIM
} from './soil-nutrients';

describe('soil nutrient rules', () => {
  const crop = new Crop('test', 'Test', false, new Duration(1, 0), '', {
    halfSpeedConcentration: {nitrogen: .1, phosphorus: .1, potassium: .1},
    maxResourceContent: {nitrogen: .2, phosphorus: .1, potassium: .3}
  });

  it('keeps the known 25-plant claim footprint without multiplying an unverified per-plant withdrawal', () => {
    expect(PLANTS_PER_CLAIM).toBe(25);
    expect(calculateNutrientChangeForCrop(crop)).toEqual({nitrogen: .2, phosphorus: .1, potassium: .3});
  });

  it('subtracts one claim only, regardless of the total field size', () => {
    expect(calculateFieldNutrientsAfterHarvest({nitrogen: 72, phosphorus: 58, potassium: 81}, crop))
      .toEqual({nitrogen: 71.8, phosphorus: 57.9, potassium: 80.7});
  });

  it('keeps an atypical recorded soil reading above 100 percent visible after harvest', () => {
    expect(calculateFieldNutrientsAfterHarvest({nitrogen: 150, phosphorus: 58, potassium: 81}, crop))
      .toEqual({nitrogen: 149.8, phosphorus: 57.9, potassium: 80.7});
  });

  for (const [cropId, expected] of [
    ['rice', {nitrogen: 149.9, phosphorus: 150, potassium: 150}],
    ['beets', {nitrogen: 149.8, phosphorus: 149.7, potassium: 149.6}],
    ['corn', {nitrogen: 149.6, phosphorus: 149.6, potassium: 149.9}],
    ['wheat', {nitrogen: 149.7, phosphorus: 149.9, potassium: 149.9}],
    ['huckleberries', {nitrogen: 149.9, phosphorus: 149.85, potassium: 149.8}]
  ] as const) {
    it(`uses ${cropId}'s own claim-level N/P/K estimate for one cycle`, () => {
      const currentCrop = ALL_CROPS.find(candidate => candidate.id() === cropId)!;
      expect(calculateFieldNutrientsAfterHarvest({nitrogen: 150, phosphorus: 150, potassium: 150}, currentCrop)).toEqual(expected);
    });
  }

  for (const [cropId, expected] of [
    ['rice', {nitrogen: 149.6, phosphorus: 150, potassium: 150}],
    ['beets', {nitrogen: 149.2, phosphorus: 148.8, potassium: 148.4}],
    ['corn', {nitrogen: 148.4, phosphorus: 148.4, potassium: 149.6}],
    ['wheat', {nitrogen: 148.8, phosphorus: 149.6, potassium: 149.6}],
    ['huckleberries', {nitrogen: 149.6, phosphorus: 149.4, potassium: 149.2}]
  ] as const) {
    it(`keeps ${cropId}'s four completed cycles stable and crop-specific`, () => {
      const currentCrop = ALL_CROPS.find(candidate => candidate.id() === cropId)!;
      let nutrients = {nitrogen: 150, phosphorus: 150, potassium: 150};
      for (let cycle = 0; cycle < 4; cycle++) nutrients = calculateFieldNutrientsAfterHarvest(nutrients, currentCrop)!;
      expect(nutrients.nitrogen).toBeCloseTo(expected.nitrogen, 8);
      expect(nutrients.phosphorus).toBeCloseTo(expected.phosphorus, 8);
      expect(nutrients.potassium).toBeCloseTo(expected.potassium, 8);
    });
  }

  it('keeps legacy fields untracked until a soil reading exists', () => {
    expect(calculateFieldNutrientsAfterHarvest(undefined, crop)).toBeUndefined();
    expect(getNutrientWarnings(undefined, crop)).toEqual([]);
  });

  it('applies saved plan quantities per claim and never their total craft amount', () => {
    const contribution = calculateFertilizerContributionPerClaim([{key: 'compost', perClaim: 2, total: 24}]);
    expect(contribution).toEqual({nitrogen: 16, phosphorus: 8, potassium: 29.6});
    expect(calculateFieldNutrientsAfterFertilization({nitrogen: 70, phosphorus: 80, potassium: 60}, [{key: 'compost', perClaim: 2, total: 24}]))
      .toEqual({nitrogen: 86, phosphorus: 88, potassium: 89.6});
  });

  it('warns for huckleberries only when a used nutrient reaches its exact threshold', () => {
    const huckleberries = new Crop('huckleberries', 'Huckleberries', true, new Duration(1, 0));
    expect(getNutrientWarnings({nitrogen: 45, phosphorus: 19, potassium: 24}, huckleberries)).toEqual([]);
    expect(getNutrientWarnings({nitrogen: 44, phosphorus: 15, potassium: 23}, huckleberries)).toEqual(['phosphorus']);
  });

  it('warns at the corn nitrogen threshold', () => {
    const corn = new Crop('corn', 'Corn', false, new Duration(1, 0));
    expect(getNutrientWarnings({nitrogen: 40, phosphorus: 60, potassium: 50}, corn)).toEqual(['nitrogen']);
  });

  it('ignores nutrients a crop does not use', () => {
    const rice = new Crop('rice', 'Rice', false, new Duration(1, 0));
    expect(getNutrientWarnings({nitrogen: 11, phosphorus: 0, potassium: 0}, rice)).toEqual([]);
    expect(getNutrientWarnings({nitrogen: 10, phosphorus: 100, potassium: 100}, rice)).toEqual(['nitrogen']);
  });
});
