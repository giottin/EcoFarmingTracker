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

  it('should display the translated harvest button', () => {
    const element = fixture.nativeElement as HTMLElement;
    const labels = Array.from(element.querySelectorAll('button'))
      .map(button => button.textContent?.trim());
    expect(labels).toContain('Récolter');
    expect(labels).not.toContain('Harvest');
  });
});
