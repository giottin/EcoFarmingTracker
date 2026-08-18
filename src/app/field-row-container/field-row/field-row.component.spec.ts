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

  beforeEach(async () => {
    plans.set([]);
    await TestBed.configureTestingModule({
      imports: [FieldRowComponent],
      providers: [{provide: FertilizerPlansService, useValue: {plans, completeForField: async () => true}}]
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
});
