import {Crop} from '../model/crop';
import {Duration} from '../model/duration';
import {
  calculateFertilizerContributionPerClaim,
  calculateFieldNutrientsAfterFertilization,
  calculateFieldNutrientsAfterHarvest,
  cropNutrientConsumptionPerClaim,
  getNutrientWarnings,
  PLANTS_PER_CLAIM
} from './soil-nutrients';

describe('soil nutrient rules', () => {
  const crop = new Crop('test', 'Test', false, new Duration(1, 0), '', {nitrogen: .2, phosphorus: .1, potassium: .3});

  it('uses exactly 25 plants for one claim', () => {
    expect(PLANTS_PER_CLAIM).toBe(25);
    expect(cropNutrientConsumptionPerClaim(crop)).toEqual({nitrogen: 5, phosphorus: 2.5, potassium: 7.5});
  });

  it('subtracts one claim only, regardless of the total field size', () => {
    expect(calculateFieldNutrientsAfterHarvest({nitrogen: 72, phosphorus: 58, potassium: 81}, crop))
      .toEqual({nitrogen: 67, phosphorus: 55.5, potassium: 73.5});
  });

  it('keeps an atypical recorded soil reading above 100 percent visible after harvest', () => {
    expect(calculateFieldNutrientsAfterHarvest({nitrogen: 150, phosphorus: 58, potassium: 81}, crop))
      .toEqual({nitrogen: 145, phosphorus: 55.5, potassium: 73.5});
  });

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
