import {Component, computed, input, output, signal, WritableSignal} from '@angular/core';
import {Field} from '../../model/field';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {CropService} from '../../service/crop.service';
import {Crop} from '../../model/crop';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {StorageService} from '../../service/storage.service';

@Component({
  selector: 'app-field-row',
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, FormsModule],
  templateUrl: './field-row.component.html',
  styleUrl: './field-row.component.scss'
})
export class FieldRowComponent {
  field = input.required<Field>();
  sortOrder = input.required<number>();
  now = input.required<number>();
  rowClosed = output<Field>();

  readonly fieldStatus = computed<'growing' | 'ready' | 'harvested'>(() => {
    if (!this.field().isPlanted() || !this.field().harvestTime()) return 'harvested';
    return this.field().harvestTime()!.getTime() <= this.now() ? 'ready' : 'growing';
  });
  readonly fieldPlaceholder = computed(() => `Champ ${this.cropDisplayName(this.field().crop())}`);
  readonly maturityLabel = computed(() => {
    const maturity = this.field().harvestTime();
    if (!maturity) return '';
    const includeYear = maturity.getFullYear() !== new Date(this.now()).getFullYear();
    const date = maturity.toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', ...(includeYear ? {year: 'numeric' as const} : {})
    });
    const time = maturity.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'});
    return `${date} à ${time}`;
  });
  readonly countdown = computed(() => {
    const maturity = this.field().harvestTime();
    if (!maturity) return '';
    const remainingMinutes = Math.ceil((maturity.getTime() - this.now()) / 60000);
    if (remainingMinutes <= 0) return 'Prêt';
    const days = Math.floor(remainingMinutes / 1440);
    const hours = Math.floor((remainingMinutes % 1440) / 60);
    const minutes = remainingMinutes % 60;
    const clock = `${String(hours).padStart(2, '0')} h ${String(minutes).padStart(2, '0')} min`;
    return days > 0 ? `${days} j ${clock}` : clock;
  });

  readonly cropOptions: WritableSignal<Crop[]> = signal([]);

  constructor(private readonly cropService: CropService, private storageService: StorageService) {
    this.cropOptions.set(this.cropService.allCrops);
  }

  cropDisplayName(crop: Crop): string {
    return this.cropService.getDisplayName(crop);
  }

  onCropChange(newCrop: Crop) {
    this.field().crop.set(newCrop);
    this.field().plantTime.set(undefined);
    this.field().harvestTime.set(undefined);
    this.field().isPlanted.set(false);
    this.save();
  }

  onFieldNameChange(newFieldName: string) {
    this.field().name.set(newFieldName);
    this.save();
  }

  onPlant() {
    this.field().onPlant();
    this.save();
  }

  onGentlePlant() {
    this.field().onPlant(0.8);
    this.save();
  }

  onHarvest() {
    this.field().onHarvest();
    this.save();
  }

  private save() {
    this.storageService.saveField(this.field(), this.sortOrder());
  }

  protected readonly close = close;
}


