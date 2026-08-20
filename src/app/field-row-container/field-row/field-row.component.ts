import {Component, computed, input, output, signal, WritableSignal} from '@angular/core';
import {Field} from '../../model/field';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {CropService} from '../../service/crop.service';
import {Crop} from '../../model/crop';
import {MatMenuModule} from '@angular/material/menu';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {StorageService} from '../../service/storage.service';
import {FertilizerPlansService} from '../../service/fertilizer-plans.service';
import {MatDialog} from '@angular/material/dialog';
import {FieldNutrientsDialogComponent} from '../../field-nutrients-dialog/field-nutrients-dialog.component';
import {calculateFieldNutrientsAfterFertilization, getNutrientWarnings, hasTrackedNutrients} from '../../agriculture/soil-nutrients';

@Component({
  selector: 'app-field-row',
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, MatMenuModule, FormsModule],
  templateUrl: './field-row.component.html',
  styleUrl: './field-row.component.scss'
})
export class FieldRowComponent {
  field = input.required<Field>();
  sortOrder = input.required<number>();
  now = input.required<number>();
  rowClosed = output<Field>();

  readonly activeFertilizerPlan = computed(() => this.fertilizerPlans.plans().find(plan => plan.fieldId === this.field().id) ?? null);
  readonly needsFertilizing = computed(() => this.activeFertilizerPlan() !== null);
  readonly nutrientWarnings = computed(() => getNutrientWarnings(this.field().soilNutrients(), this.field().crop()));
  readonly hasTrackedNutrients = computed(() => hasTrackedNutrients(this.field().soilNutrients()));
  readonly harvesting = signal(false);
  readonly fertilizing = signal(false);
  readonly fieldStatus = computed<'growing' | 'ready' | 'harvested' | 'fertilizing'>(() => {
    if (!this.field().isPlanted() || !this.field().harvestTime()) return this.needsFertilizing() ? 'fertilizing' : 'harvested';
    return this.field().harvestTime()!.getTime() <= this.now() ? 'ready' : 'growing';
  });
  readonly fieldPlaceholder = computed(() => `Champ ${this.cropDisplayName(this.field().crop())}`);
  readonly hasSelectedCrop = computed(() => this.field().crop().id() !== '-1');
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
  readonly unavailableCropIcons = signal<ReadonlySet<string>>(new Set());

  constructor(
    private readonly cropService: CropService,
    private readonly storageService: StorageService,
    private readonly fertilizerPlans: FertilizerPlansService,
    private readonly dialog: MatDialog
  ) {
    this.cropOptions.set(this.cropService.allCrops);
  }

  cropDisplayName(crop: Crop): string {
    return this.cropService.getDisplayName(crop);
  }

  cropIconUrl(crop: Crop): string {
    return this.cropService.getIconUrl(crop);
  }

  cropIconUnavailable(crop: Crop): boolean {
    return this.unavailableCropIcons().has(crop.iconName);
  }

  markCropIconUnavailable(crop: Crop) {
    this.unavailableCropIcons.update(icons => new Set(icons).add(crop.iconName));
  }

  onCropChange(newCrop: Crop) {
    if (newCrop.id() === this.field().crop().id()) return;
    this.field().crop.set(newCrop);
    this.field().plantTime.set(undefined);
    this.field().harvestTime.set(undefined);
    this.field().selfRegenFullyGrown.set(false);
    this.field().isPlanted.set(false);
    this.save();
  }

  onFieldNameChange(newFieldName: string) {
    this.field().name.set(newFieldName);
    this.save();
  }

  onPlantCountChange(value: number | string | null) {
    const count = Math.floor(Number(value));
    this.field().plantCount.set(Number.isFinite(count) && count > 0 ? count : undefined);
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

  async onHarvest() {
    if (this.harvesting() || this.fieldStatus() !== 'ready') return;
    this.harvesting.set(true);
    const before = this.field().serialize();
    this.field().onHarvest();
    try {
      const saved = await this.storageService.saveFieldNow(this.field(), this.sortOrder());
      if (!saved) this.field().restoreSavedState(before);
    } finally {
      this.harvesting.set(false);
    }
  }

  async onFertilize() {
    if (this.fertilizing()) return;
    const plan = this.fertilizerPlans.getForField(this.field().id);
    if (!plan) return;
    this.fertilizing.set(true);
    try {
      const next = calculateFieldNutrientsAfterFertilization(this.field().soilNutrients(), plan.lines, plan.nutrients);
      if (!next) return;
      const before = this.field().serialize();
      this.field().soilNutrients.set(next);
      const saved = await this.storageService.saveFieldNow(this.field(), this.sortOrder());
      if (!saved) {
        this.field().restoreSavedState(before);
        return;
      }
      await this.fertilizerPlans.remove(plan.id);
    } finally {
      this.fertilizing.set(false);
    }
  }

  openNutrients() {
    const field = this.field();
    const ref = this.dialog.open(FieldNutrientsDialogComponent, {
      width: '24rem',
      maxWidth: '92vw',
      data: {
        fieldName: field.name().trim() || this.fieldPlaceholder(),
        nutrients: field.soilNutrients(),
        warnings: this.nutrientWarnings()
      }
    });
    ref.afterClosed().subscribe(async nutrients => {
      if (!nutrients) return;
      const before = field.serialize();
      field.soilNutrients.set(nutrients);
      const saved = await this.storageService.saveFieldNow(field, this.sortOrder());
      if (!saved) field.restoreSavedState(before);
    });
  }

  private save() {
    this.storageService.saveField(this.field(), this.sortOrder());
  }

  protected readonly close = close;
}


