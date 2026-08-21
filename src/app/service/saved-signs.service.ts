import {Injectable, signal} from '@angular/core';
import {SupabaseService} from './supabase.service';

export type SavedSign = {id: number; content: string; createdAt: Date; folderId: number | null};
export type SavedSignFolder = {id: number; name: string; collapsed: boolean; createdAt: Date};

type SavedSignRow = {id: number; content: string; created_at: string; folder_id?: number | null};
type SavedSignFolderRow = {id: number; name: string; collapsed: boolean; created_at: string};

@Injectable({providedIn: 'root'})
export class SavedSignsService {
  readonly signs = signal<SavedSign[]>([]);
  readonly folders = signal<SavedSignFolder[]>([]);
  readonly loading = signal(false);

  constructor(private readonly supabase: SupabaseService) {}

  async load() {
    this.loading.set(true);
    try {
      const [signsResult, foldersResult] = await Promise.all([
        this.supabase.client
          .from('saved_signs')
          .select('id, content, created_at, folder_id')
          .order('created_at', {ascending: false}),
        this.supabase.client
          .from('saved_sign_folders')
          .select('id, name, collapsed, created_at')
          .order('created_at', {ascending: true})
          .order('id', {ascending: true})
      ]);
      if (!signsResult.error && signsResult.data) this.signs.set((signsResult.data as SavedSignRow[]).map(row => this.fromRow(row)));
      if (!foldersResult.error && foldersResult.data) this.folders.set((foldersResult.data as SavedSignFolderRow[]).map(row => this.folderFromRow(row)));
    } finally {
      this.loading.set(false);
    }
  }

  async add(content: string): Promise<boolean> {
    const cleanContent = content.trim();
    if (!cleanContent) return false;
    const {data, error} = await this.supabase.client
      .from('saved_signs')
      .insert({content: cleanContent})
      .select('id, content, created_at, folder_id')
      .single();
    if (error || !data) return false;
    this.signs.update(signs => [this.fromRow(data as SavedSignRow), ...signs]);
    return true;
  }

  async addFolder(name: string): Promise<SavedSignFolder | null> {
    const cleanName = this.cleanFolderName(name);
    if (!cleanName) return null;
    const {data, error} = await this.supabase.client
      .from('saved_sign_folders')
      .insert({name: cleanName})
      .select('id, name, collapsed, created_at')
      .single();
    if (error || !data) return null;
    const folder = this.folderFromRow(data as SavedSignFolderRow);
    this.folders.update(folders => [...folders, folder]);
    return folder;
  }

  async renameFolder(id: number, name: string): Promise<boolean> {
    const cleanName = this.cleanFolderName(name);
    if (!cleanName) return false;
    const {data, error} = await this.supabase.client
      .from('saved_sign_folders')
      .update({name: cleanName})
      .eq('id', id)
      .select('id, name, collapsed, created_at')
      .single();
    if (error || !data) return false;
    const folder = this.folderFromRow(data as SavedSignFolderRow);
    this.folders.update(folders => folders.map(current => current.id === id ? folder : current));
    return true;
  }

  async setFolderCollapsed(id: number, collapsed: boolean): Promise<boolean> {
    const {error} = await this.supabase.client
      .from('saved_sign_folders')
      .update({collapsed})
      .eq('id', id);
    if (error) return false;
    this.folders.update(folders => folders.map(folder => folder.id === id ? {...folder, collapsed} : folder));
    return true;
  }

  async removeFolder(id: number): Promise<boolean> {
    const {error} = await this.supabase.client.from('saved_sign_folders').delete().eq('id', id);
    if (error) return false;
    // The foreign key uses ON DELETE SET NULL. Keep the local list in sync so
    // the cards immediately reappear under “Sans dossier”.
    this.folders.update(folders => folders.filter(folder => folder.id !== id));
    this.signs.update(signs => signs.map(sign => sign.folderId === id ? {...sign, folderId: null} : sign));
    return true;
  }

  async moveToFolder(id: number, folderId: number | null): Promise<boolean> {
    const {error} = await this.supabase.client
      .from('saved_signs')
      .update({folder_id: folderId})
      .eq('id', id);
    if (error) return false;
    this.signs.update(signs => signs.map(sign => sign.id === id ? {...sign, folderId} : sign));
    return true;
  }

  async remove(id: number): Promise<boolean> {
    const {error} = await this.supabase.client.from('saved_signs').delete().eq('id', id);
    if (error) return false;
    this.signs.update(signs => signs.filter(sign => sign.id !== id));
    return true;
  }

  private fromRow(row: SavedSignRow): SavedSign {
    return {
      id: Number(row.id),
      content: row.content,
      createdAt: new Date(row.created_at),
      folderId: row.folder_id === null || row.folder_id === undefined ? null : Number(row.folder_id)
    };
  }

  private folderFromRow(row: SavedSignFolderRow): SavedSignFolder {
    return {id: Number(row.id), name: row.name, collapsed: row.collapsed, createdAt: new Date(row.created_at)};
  }

  private cleanFolderName(name: string): string {
    return name.trim().slice(0, 80);
  }
}
