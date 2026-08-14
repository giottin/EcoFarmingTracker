import {
  AVAILABILITY_WEIGHTS,
  AutomaticFertilizerCalculatorComponent,
  calculateAvailabilityScore,
  calculateDifficultyPenalty
} from './automatic-fertilizer-calculator.component';

describe('AutomaticFertilizerCalculatorComponent', () => {
  beforeEach(() => localStorage.clear());

  it('uses a quantity-weighted difficulty penalty', () => {
    expect(calculateDifficultyPenalty([1, 0], [5, 1])).toBe(4);
    expect(calculateDifficultyPenalty([3, 0], [5, 1])).toBe(12);
    expect(calculateDifficultyPenalty([3, 2], [5, 1])).toBe(12);
  });

  it('keeps the historical deficit score when every difficulty is equal', () => {
    expect(calculateAvailabilityScore(127, [4, 2, 1], [3, 3, 3], 'normal')).toBe(127);
    expect(calculateAvailabilityScore(127, [4, 2, 1], [5, 5, 5], 'high')).toBe(127);
  });

  it('prefers an easier combination when agronomic results are close', () => {
    const easyCombination = calculateAvailabilityScore(100, [3, 0], [1, 5], 'normal');
    const difficultCombination = calculateAvailabilityScore(95, [0, 1], [1, 5], 'normal');

    expect(easyCombination).toBeLessThan(difficultCombination);
  });

  it('still prefers a difficult fertilizer when its agronomic gain is significant', () => {
    const easyCombination = calculateAvailabilityScore(100, [3, 0], [1, 5], 'normal');
    const effectiveDifficultCombination = calculateAvailabilityScore(20, [0, 1], [1, 5], 'normal');

    expect(effectiveDifficultCombination).toBeLessThan(easyCombination);
  });

  it('makes the availability weight stronger without changing the calculation code', () => {
    expect(AVAILABILITY_WEIGHTS.low).toBeLessThan(AVAILABILITY_WEIGHTS.normal);
    expect(AVAILABILITY_WEIGHTS.normal).toBeLessThan(AVAILABILITY_WEIGHTS.high);
    expect(calculateAvailabilityScore(100, [2, 0], [5, 1], 'low'))
      .toBeLessThan(calculateAvailabilityScore(100, [2, 0], [5, 1], 'high'));
  });

  it('persists editable difficulties and availability importance', () => {
    const component = new AutomaticFertilizerCalculatorComponent();
    component.current = {nitrogen: 80, phosphorus: 98, potassium: 98};
    component.fertilizers[0].difficulty = 5;
    component.availabilityImportance = 'high';
    component.calculate();

    const restored = new AutomaticFertilizerCalculatorComponent();
    restored.ngOnInit();

    expect(restored.fertilizers[0].difficulty).toBe(5);
    expect(restored.availabilityImportance).toBe('high');
    expect(restored.current).toEqual({nitrogen: 80, phosphorus: 98, potassium: 98});
  });

  it('keeps every final nutrient at or below 100 percent', () => {
    const component = new AutomaticFertilizerCalculatorComponent();
    component.current = {nitrogen: 63.4, phosphorus: 71.2, potassium: 82.8};
    component.calculate();

    expect(component.solution).not.toBeNull();
    expect(component.solution!.final.nitrogen).toBeLessThanOrEqual(100);
    expect(component.solution!.final.phosphorus).toBeLessThanOrEqual(100);
    expect(component.solution!.final.potassium).toBeLessThanOrEqual(100);
  });

  it('can still select a difficulty-5 fertilizer when it is clearly beneficial', () => {
    const component = new AutomaticFertilizerCalculatorComponent();
    component.current = {nitrogen: 80, phosphorus: 98, potassium: 98};
    component.fertilizers.forEach(fertilizer => fertilizer.difficulty = 1);
    component.fertilizers[1].difficulty = 5;
    component.availabilityImportance = 'high';
    component.calculate();

    expect(component.quantity(1)).toBe(1);
    expect(component.solution!.final).toEqual({nitrogen: 100, phosphorus: 100, potassium: 100});
  });
});
