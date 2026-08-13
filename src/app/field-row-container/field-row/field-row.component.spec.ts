import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldRowComponent } from './field-row.component';
import { Field } from '../../model/field';
import { CropService } from '../../service/crop.service';

describe('FieldRowComponent', () => {
  let component: FieldRowComponent;
  let fixture: ComponentFixture<FieldRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldRowComponent]
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
});
