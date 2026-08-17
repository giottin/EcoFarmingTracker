import {AutomaticFertilizerCalculatorComponent} from './automatic-fertilizer-calculator.component';

describe('AutomaticFertilizerCalculatorComponent', () => {
  beforeEach(() => localStorage.clear());

  it('makes every fertilizer available by default', () => {
    const component = new AutomaticFertilizerCalculatorComponent();
    expect(component.fertilizers.every(fertilizer => fertilizer.available)).toBeTrue();
  });

  it('strictly excludes an unchecked fertilizer from the solution', () => {
    const component = new AutomaticFertilizerCalculatorComponent();
    component.current = {nitrogen: 80, phosphorus: 98, potassium: 98};
    component.fertilizers.forEach(fertilizer => fertilizer.available = false);
    component.setAvailability(1, true);
    expect(component.quantity(1)).toBe(1);

    component.setAvailability(1, false);
    expect(component.quantity(1)).toBe(0);
    expect(component.solution!.final).toEqual({nitrogen: 80, phosphorus: 98, potassium: 98});
  });

  it('uses a re-enabled fertilizer again immediately', () => {
    const component = new AutomaticFertilizerCalculatorComponent();
    component.current = {nitrogen: 80, phosphorus: 98, potassium: 98};
    component.fertilizers.forEach(fertilizer => fertilizer.available = false);
    component.setAvailability(1, true);

    expect(component.quantity(1)).toBe(1);
    expect(component.solution!.final).toEqual({nitrogen: 100, phosphorus: 100, potassium: 100});
  });

  it('persists fertilizer availability', () => {
    const component = new AutomaticFertilizerCalculatorComponent();
    component.setAvailability(4, false);

    const restored = new AutomaticFertilizerCalculatorComponent();
    restored.ngOnInit();

    expect(restored.fertilizers[4].available).toBeFalse();
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
});
