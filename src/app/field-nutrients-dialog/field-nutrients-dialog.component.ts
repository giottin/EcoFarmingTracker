import {Component, Inject} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {clampNutrients, EMPTY_NUTRIENTS, type NutrientKey, type Nutrients} from '../agriculture/soil-nutrients';

export type FieldNutrientsDialogData = {
  fieldName: string;
  nutrients: Nutrients | undefined;
  warnings: NutrientKey[];
};

@Component({
  selector: 'app-field-nutrients-dialog',
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  templateUrl: './field-nutrients-dialog.component.html',
  styleUrl: './field-nutrients-dialog.component.scss'
})
export class FieldNutrientsDialogComponent {
  readonly values: Nutrients;

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: FieldNutrientsDialogData,
    private readonly dialogRef: MatDialogRef<FieldNutrientsDialogComponent, Nutrients>
  ) {
    this.values = {...(data.nutrients ?? EMPTY_NUTRIENTS)};
  }

  isWarning(key: NutrientKey): boolean {
    return this.data.warnings.includes(key);
  }

  save() {
    this.dialogRef.close(clampNutrients(this.values));
  }
}
