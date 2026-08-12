import {Injectable, signal} from '@angular/core';
import {SupabaseService} from './supabase.service';

export type SavedSign = {id: number; content: string; createdAt: Date};
type SavedSignRow = {id: number; content: string; created_at: string};

@Injectable({providedIn: 'root'})
export class SavedSignsService {
  readonly signs = signal<SavedSign[]>([]);
  readonly loading = signal(false);

  constructor(private readonly supabase: SupabaseService) {}

  async load() {
    this.loading.set(true);
    const {data, error} = await this.supabase.client
      .from('saved_signs')
      .select('id, content, created_at')
      .order('created_at', {ascending: false});
    if (!error && data) this.signs.set((data as SavedSignRow[]).map(row => this.fromRow(row)));
    this.loading.set(false);
  }

  async add(content: string): Promise<boolean> {
    const cleanContent = content.trim();
    if (!cleanContent) return false;
    const {data, error} = await this.supabase.client
      .from('saved_signs')
      .insert({content: cleanContent})
      .select('id, content, created_at')
      .single();
    if (error || !data) return false;
    this.signs.update(signs => [this.fromRow(data as SavedSignRow), ...signs]);
    return true;
  }

  async remove(id: number): Promise<boolean> {
    const {error} = await this.supabase.client.from('saved_signs').delete().eq('id', id);
    if (error) return false;
    this.signs.update(signs => signs.filter(sign => sign.id !== id));
    return true;
  }

  private fromRow(row: SavedSignRow): SavedSign {
    return {id: Number(row.id), content: row.content, createdAt: new Date(row.created_at)};
  }
}
