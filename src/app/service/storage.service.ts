import {Injectable} from '@angular/core';
import {Field, StoredField} from '../model/field';
import {SupabaseService} from './supabase.service';
import type {Nutrients} from '../agriculture/soil-nutrients';

type FieldRow = {
  id: number;
  name: string;
  crop_id: string;
  plant_time: string | null;
  harvest_time: string | null;
  self_regen_fully_grown: boolean;
  is_planted: boolean;
  plant_count: number | null;
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  sort_order: number;
};

@Injectable({providedIn: 'root'})
export class StorageService {
  private readonly saveTimers = new Map<number, ReturnType<typeof setTimeout>>();
  private readonly inFlightWrites = new Map<number, number>();

  constructor(private readonly supabase: SupabaseService) {}

  hasPendingWrites(): boolean {
    return this.saveTimers.size > 0 || this.inFlightWrites.size > 0;
  }

  async getGrowthTimeModifier(): Promise<number> {
    const {data, error} = await this.supabase.client
      .from('farming_settings')
      .select('growth_time_modifier')
      .eq('singleton', true)
      .single();
    if (error || !data) return 1;
    return Number(data.growth_time_modifier) || 1;
  }

  async saveGrowthTimeModifier(value: number) {
    await this.supabase.client
      .from('farming_settings')
      .update({
        growth_time_modifier: value,
        updated_by: null,
        updated_at: new Date().toISOString()
      })
      .eq('singleton', true);
  }

  async getStoredFields(): Promise<StoredField[]> {
    const {data, error} = await this.supabase.client
      .from('farming_fields')
      .select('id, name, crop_id, plant_time, harvest_time, self_regen_fully_grown, is_planted, plant_count, nitrogen, phosphorus, potassium, sort_order')
      .order('sort_order', {ascending: true})
      .order('id', {ascending: true});
    // Never let a failed network request masquerade as an actual empty list.
    // The caller can then preserve the fields currently shown on screen.
    if (error || !data) {
      console.error('Unable to load fields', {error});
      throw error ?? new Error('Unable to load fields');
    }
    return (data as FieldRow[]).map(row => this.toStoredField(row));
  }

  async createField(field: Field, sortOrder: number): Promise<number | null> {
    const payload = this.toRow(field, sortOrder);
    const {data, error} = await this.supabase.client
      .from('farming_fields')
      .insert(payload)
      .select('id')
      .single();
    if (error || !data) return null;
    const id = Number(data.id);
    return id;
  }

  saveField(field: Field, sortOrder = 0) {
    const existingTimer = this.saveTimers.get(field.id);
    if (existingTimer) clearTimeout(existingTimer);
    this.saveTimers.set(field.id, setTimeout(() => {
      this.saveTimers.delete(field.id);
      void this.updateField(field, sortOrder);
    }, 300));
  }

  /** Saves an important state transition before any dependent operation continues. */
  async saveFieldNow(field: Field, sortOrder = 0): Promise<boolean> {
    const timer = this.saveTimers.get(field.id);
    if (timer) clearTimeout(timer);
    this.saveTimers.delete(field.id);
    return this.updateField(field, sortOrder);
  }

  async deleteField(id: number) {
    const timer = this.saveTimers.get(id);
    if (timer) clearTimeout(timer);
    this.saveTimers.delete(id);
    await this.supabase.client.from('farming_fields').delete().eq('id', id);
  }

  watchFields(onChange: () => void | Promise<void>) {
    let reloading = false;
    const timer = setInterval(async () => {
      if (reloading || this.hasPendingWrites()) return;
      reloading = true;
      try {
        await onChange();
      } finally {
        reloading = false;
      }
    }, 5000);
    return () => clearInterval(timer);
  }

  private async updateField(field: Field, sortOrder: number): Promise<boolean> {
    this.beginWrite(field.id);
    try {
      const {error} = await this.supabase.client
        .from('farming_fields')
        .update(this.toRow(field, sortOrder))
        .eq('id', field.id);
      if (error) {
        console.error('Unable to save field', {fieldId: field.id, error});
        return false;
      }
      return true;
    } finally {
      this.finishWrite(field.id);
    }
  }

  private beginWrite(id: number) {
    this.inFlightWrites.set(id, (this.inFlightWrites.get(id) ?? 0) + 1);
  }

  private finishWrite(id: number) {
    const remaining = (this.inFlightWrites.get(id) ?? 1) - 1;
    if (remaining > 0) this.inFlightWrites.set(id, remaining);
    else this.inFlightWrites.delete(id);
  }

  private toRow(field: Field, sortOrder: number) {
    const stored = field.serialize();
    return {
      name: stored.name,
      crop_id: stored.cropId,
      plant_time: stored.plantTime?.toISOString() ?? null,
      harvest_time: stored.harvestTime?.toISOString() ?? null,
      self_regen_fully_grown: stored.selfRegenFullyGrown,
      is_planted: stored.isPlanted,
      plant_count: stored.plantCount ?? null,
      nitrogen: stored.soilNutrients?.nitrogen ?? null,
      phosphorus: stored.soilNutrients?.phosphorus ?? null,
      potassium: stored.soilNutrients?.potassium ?? null,
      sort_order: sortOrder,
      updated_at: new Date().toISOString()
    };
  }

  private toStoredField(row: FieldRow): StoredField {
    return {
      id: row.id,
      name: row.name,
      cropId: row.crop_id,
      plantTime: row.plant_time ? new Date(row.plant_time) : undefined,
      harvestTime: row.harvest_time ? new Date(row.harvest_time) : undefined,
      selfRegenFullyGrown: row.self_regen_fully_grown,
      isPlanted: row.is_planted,
      plantCount: row.plant_count === null ? undefined : Number(row.plant_count),
      soilNutrients: this.toNutrients(row)
    };
  }

  private toNutrients(row: FieldRow): Nutrients | undefined {
    if (row.nitrogen === null || row.phosphorus === null || row.potassium === null) return undefined;
    const nutrients = {
      nitrogen: Number(row.nitrogen),
      phosphorus: Number(row.phosphorus),
      potassium: Number(row.potassium)
    };
    return Object.values(nutrients).every(value => Number.isFinite(value)) ? nutrients : undefined;
  }
}
