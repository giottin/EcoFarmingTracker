import {AutomaticFertilizerCalculatorComponent} from './automatic-fertilizer-calculator.component';
import {FertilizerPlansService} from '../service/fertilizer-plans.service';
import {FieldService} from '../service/field.service';
import {Field} from '../model/field';
import {CropService} from '../service/crop.service';

describe('AutomaticFertilizerCalculatorComponent', () => {
  beforeEach(() => localStorage.clear());
  const createComponent = () => new AutomaticFertilizerCalculatorComponent(
    {addOrReplace: async () => true, load: async () => undefined} as unknown as FertilizerPlansService,
    {getFields: async () => [], watchFields: () => () => undefined} as unknown as FieldService,
    {} as CropService
  );

  it('makes every fertilizer available by default', () => {
    const component = createComponent();
    expect(component.fertilizers.every(fertilizer => fertilizer.available)).toBeTrue();
  });

  it('strictly excludes an unchecked fertilizer from the solution', () => {
    const component = createComponent();
    component.current = {nitrogen: 80, phosphorus: 98, potassium: 98};
    component.fertilizers.forEach(fertilizer => fertilizer.available = false);
    component.setAvailability(1, true);
    expect(component.quantity(1)).toBe(1);

    component.setAvailability(1, false);
    expect(component.quantity(1)).toBe(0);
    expect(component.solution!.final).toEqual({nitrogen: 80, phosphorus: 98, potassium: 98});
  });

  it('uses a re-enabled fertilizer again immediately', () => {
    const component = createComponent();
    component.current = {nitrogen: 80, phosphorus: 98, potassium: 98};
    component.fertilizers.forEach(fertilizer => fertilizer.available = false);
    component.setAvailability(1, true);

    expect(component.quantity(1)).toBe(1);
    expect(component.solution!.final).toEqual({nitrogen: 100, phosphorus: 100, potassium: 100});
  });

  it('persists fertilizer availability', () => {
    const component = createComponent();
    component.setAvailability(4, false);

    const restored = createComponent();
    void restored.ngOnInit();

    expect(restored.fertilizers[4].available).toBeFalse();
  });

  it('keeps every final nutrient at or below 100 percent', () => {
    const component = createComponent();
    component.current = {nitrogen: 63.4, phosphorus: 71.2, potassium: 82.8};
    component.calculate();

    expect(component.solution).not.toBeNull();
    expect(component.solution!.final.nitrogen).toBeLessThanOrEqual(100);
    expect(component.solution!.final.phosphorus).toBeLessThanOrEqual(100);
    expect(component.solution!.final.potassium).toBeLessThanOrEqual(100);
  });

  it('derives claims from the selected field size and always rounds up', () => {
    const component = createComponent();
    component.fields.set([{id: 12, plantCount: () => 451} as unknown as Field]);
    component.fieldId.set(12);

    expect(component.claims()).toBe(19);
  });

  it('saves the exact current quantities against the selected field', async () => {
    const addOrReplace = jasmine.createSpy('addOrReplace').and.resolveTo(true);
    const component = new AutomaticFertilizerCalculatorComponent(
      {addOrReplace, load: async () => undefined} as unknown as FertilizerPlansService,
      {getFields: async () => [], watchFields: () => () => undefined} as unknown as FieldService,
      {} as CropService
    );
    component.fields.set([{id: 42, name: () => 'Betteraves', plantCount: () => 25} as unknown as Field]);
    component.fieldId.set(42);
    component.current = {nitrogen: 80, phosphorus: 98, potassium: 98};
    component.fertilizers.forEach(fertilizer => fertilizer.available = false);
    component.setAvailability(1, true);

    await component.savePlan();

    expect(addOrReplace).toHaveBeenCalledWith(jasmine.objectContaining({fieldId: 42, fieldName: 'Betteraves', claims: 1, lines: [{key: 'hide', label: 'Peau', iconName: 'HideAshFertilizerItem', perClaim: 1, total: 1}]}));
  });
});
