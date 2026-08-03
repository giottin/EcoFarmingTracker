import {Injectable, signal} from '@angular/core';
import {StorageService} from './storage.service';

@Injectable({providedIn: 'root'})
export class SettingsService {
  private readonly _growthTimeModifier = signal(1);
  readonly growthTimeModifier = this._growthTimeModifier.asReadonly();

  constructor(private readonly storageService: StorageService) {}

  async load() {
    this._growthTimeModifier.set(await this.storageService.getGrowthTimeModifier());
  }

  updateGrowthTimeModifier(value: number) {
    const safeValue = Math.min(100, Math.max(0.1, Number(value) || 1));
    this._growthTimeModifier.set(safeValue);
    void this.storageService.saveGrowthTimeModifier(safeValue);
  }
}
