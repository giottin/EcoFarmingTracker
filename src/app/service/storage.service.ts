import {Injectable} from '@angular/core';
import {Field, StoredField} from '../model/field';
import {SupabaseService} from './supabase.service';

type FieldRow = {
  id: number;
  name: string;
  crop_id: string;
  plant_time: string | null;
  harvest_time: string | null;
  self_regen_fully_grown: boolean;
  is_planted: boolean;
  plant_count: number | null;
  sort_order: number;
};

@Injectable({providedIn: 'root'})
export class StorageService {
  private readonly saveTimers = new Map<number, ReturnType<typeof setTimeout>>();
  private readonly localWriteUntil = new Map<number, number>();

  constructor(private readonly supabase: SupabaseService) {}

  hasPendingWrites(): boolean {
    return this.saveTimers.size > 0;
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
      .select('id, name, crop_id, plant_time, harvest_time, self_regen_fully_grown, is_planted, plant_count, sort_order')
      .order('sort_order', {ascending: true})
      .order('id', {ascending: true});
    if (error || !data) return [];
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
    this.localWriteUntil.set(id, Date.now() + 1500);
    return id;
  }

  saveField(field: Field, sortOrder = 0) {
    const existingTimer = this.saveTimers.get(field.id);
    if (existingTimer) clearTimeout(existingTimer);
    this.saveTimers.set(field.id, setTimeout(() => {
      this.saveTimers.delete(field.id);
      this.localWriteUntil.set(field.id, Date.now() + 1500);
      void this.supabase.client
        .from('farming_fields')
        .update(this.toRow(field, sortOrder))
        .eq('id', field.id)
        .then(({error}) => {
          if (error) console.error('Unable to save field', {fieldId: field.id, error});
        });
    }, 300));
  }

  async deleteField(id: number) {
    const timer = this.saveTimers.get(id);
    if (timer) clearTimeout(timer);
    this.saveTimers.delete(id);
    this.localWriteUntil.set(id, Date.now() + 1500);
    await this.supabase.client.from('farming_fields').delete().eq('id', id);
  }

  watchFields(onChange: () => void) {
    const timer = setInterval(() => {
      if (!this.hasPendingWrites()) onChange();
    }, 5000);
    return () => clearInterval(timer);
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
      plantCount: row.plant_count === null ? undefined : Number(row.plant_count)
    };
  }
}
