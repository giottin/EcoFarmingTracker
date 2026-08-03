import {Component, computed, effect, input, output, signal, WritableSignal} from '@angular/core';
import {Field} from '../../model/field';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {CropService} from '../../service/crop.service';
import {Crop} from '../../model/crop';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {StorageService} from '../../service/storage.service';
import {SettingsService} from '../../service/settings.service';
import {Duration} from '../../model/duration';

@Component({
  selector: 'app-field-row',
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, FormsModule],
  templateUrl: './field-row.component.html',
  styleUrl: './field-row.component.scss'
})
export class FieldRowComponent {
  field = input.required<Field>();
  sortOrder = input.required<number>();
  rowClosed = output<Field>();

  readonly fieldPlaceholder = computed(() => `${this.field().crop().name().split(' ')[0]} Field`);
  readonly displayedGrowthTime = computed(() => {
    let duration = this.field().crop().growthTime();
    if (this.field().selfRegenFullyGrown()) {
      duration = Duration.multiplyDuration(duration, 0.5);
    }
    return `${duration.hours}H:${duration.minutes}M`;
  });

  readonly dateOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }

  readonly displayedPlantTime = computed(() => this.field().plantTime()?.toLocaleString([], this.dateOptions));
  readonly displayedHarvestTime = computed(() => this.field().harvestTime()?.toLocaleString([], this.dateOptions));

  readonly cropOptions: WritableSignal<Crop[]> = signal([]);

  constructor(cropService: CropService, private storageService: StorageService, private settingsService: SettingsService) {
    this.cropOptions.set(cropService.allCrops);

    effect(() => {

      //Read all these signals to detect changes for saving
      const field = this.field();
      field.name();
      field.crop();
      field.plantTime();
      field.harvestTime();
      field.selfRegenFullyGrown();
      field.isPlanted();

      this.storageService.saveField(field, this.sortOrder());
    });
  }

  onCropChange(newCrop: Crop) {
    this.field().crop.set(newCrop);
    this.field().plantTime.set(undefined);
    this.field().harvestTime.set(undefined);
    this.field().isPlanted.set(false);
  }

  onFieldNameChange(newFieldName: string) {
    this.field().name.set(newFieldName);
  }

  protected readonly close = close;
}


