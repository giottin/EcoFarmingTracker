import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldRowContainerComponent } from './field-row-container.component';
import {FertilizerPlansService} from '../service/fertilizer-plans.service';

describe('FieldRowContainerComponent', () => {
  let component: FieldRowContainerComponent;
  let fixture: ComponentFixture<FieldRowContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldRowContainerComponent],
      providers: [{provide: FertilizerPlansService, useValue: {load: async () => undefined, plans: () => []}}]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldRowContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
