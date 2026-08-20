import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldRowComponent } from './field-row.component';
import { Field } from '../../model/field';
import { CropService } from '../../service/crop.service';
import {signal} from '@angular/core';
import {FertilizerPlansService} from '../../service/fertilizer-plans.service';

describe('FieldRowComponent', () => {
  let component: FieldRowComponent;
  let fixture: ComponentFixture<FieldRowComponent>;
  const plans = signal<any[]>([]);
  const getForField = jasmine.createSpy('getForField');
  const apply = jasmine.createSpy('apply');

  beforeEach(async () => {
    plans.set([]);
    getForField.calls.reset();
    apply.calls.reset();
    await TestBed.configureTestingModule({
      imports: [FieldRowComponent],
      providers: [{provide: FertilizerPlansService, useValue: {plans, getForField, apply}}]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldRowComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('field', new Field(1, TestBed.inject(CropService).allCrops[0]));
    fixture.componentRef.setInput('sortOrder', 0);
    fixture.componentRef.setInput('now', Date.now());
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the translated harvest button', () => {
    const element = fixture.nativeElement as HTMLElement;
    const labels = Array.from(element.querySelectorAll('button'))
      .map(button => button.textContent?.trim());
    expect(labels).toContain('Récolter');
    expect(labels).not.toContain('Harvest');
  });

  it('shows fertilizing as a secondary status and as the primary state after harvest', () => {
    plans.set([{id: 1, fieldId: 1}]);
    expect(component.needsFertilizing()).toBeTrue();
    expect(component.fieldStatus()).toBe('fertilizing');
  });

  it('applies a plan target once through the plan service and updates only its field', async () => {
    const field = component.field();
    field.soilNutrients.set({nitrogen: 44, phosphorus: 15, potassium: 23});
    const plan = {id: 7, fieldId: field.id, resultingNutrients: {nitrogen: 55, phosphorus: 35, potassium: 40}, lines: []};
    getForField.and.returnValue(plan);
    apply.and.resolveTo({nitrogen: 55, phosphorus: 35, potassium: 40});

    await component.onFertilize();

    expect(apply).toHaveBeenCalledOnceWith(plan, plan.resultingNutrients);
    expect(field.soilNutrients()).toEqual({nitrogen: 55, phosphorus: 35, potassium: 40});
  });
});
