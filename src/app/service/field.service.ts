import {Injectable} from '@angular/core';
import {CropService} from './crop.service';
import {Field, StoredField} from '../model/field';
import {StorageService} from './storage.service';

@Injectable({providedIn: 'root'})
export class FieldService {
  constructor(
    private readonly cropService: CropService,
    private readonly storageService: StorageService
  ) {}

  async createRandomField(sortOrder: number): Promise<Field | null> {
    const field = new Field(0, this.cropService.getRandomCrop());
    const id = await this.storageService.createField(field, sortOrder);
    if (id === null) return null;
    field.id = id;
    return field;
  }

  async getFields(): Promise<Field[]> {
    const storedFields = await this.storageService.getStoredFields();
    return storedFields
      .map(storedField => this.deserializeField(storedField))
      .filter((field): field is Field => field !== undefined);
  }

  async deleteField(id: number) {
    await this.storageService.deleteField(id);
  }

  watchFields(onChange: () => void) {
    return this.storageService.watchFields(onChange);
  }

  hasPendingWrites(): boolean {
    return this.storageService.hasPendingWrites();
  }

  private deserializeField(storedField: StoredField): Field | undefined {
    const crop = this.cropService.getCropById(storedField.cropId);
    if (!crop) return undefined;
    const field = new Field(storedField.id, crop);
    field.name.set(storedField.name);
    field.plantTime.set(storedField.plantTime);
    field.harvestTime.set(storedField.harvestTime);
    field.selfRegenFullyGrown.set(storedField.selfRegenFullyGrown);
    field.isPlanted.set(storedField.isPlanted);
    return field;
  }
}
