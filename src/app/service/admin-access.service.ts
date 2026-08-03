import {Injectable, signal} from '@angular/core';
import {SupabaseService} from './supabase.service';

export interface AccessRequest {
  user_id: string;
  email: string;
  created_at: string;
}

@Injectable({providedIn: 'root'})
export class AdminAccessService {
  readonly requests = signal<AccessRequest[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private readonly supabase: SupabaseService) {}

  async load() {
    this.loading.set(true);
    this.error.set(null);
    const {data, error} = await this.supabase.client
      .from('access_requests')
      .select('user_id, email, created_at')
      .eq('status', 'pending')
      .order('created_at', {ascending: true});

    this.loading.set(false);
    if (error) {
      this.error.set('Impossible de charger les demandes.');
      return;
    }
    this.requests.set(data ?? []);
  }

  async approve(request: AccessRequest): Promise<boolean> {
    this.error.set(null);
    const {error} = await this.supabase.client.from('workspace_members').insert({
      user_id: request.user_id,
      display_name: request.email.split('@')[0],
      role: 'member'
    });
    if (error && error.code !== '23505') {
      this.error.set('Impossible d’autoriser cette adresse.');
      return false;
    }

    const {error: deleteError} = await this.supabase.client
      .from('access_requests')
      .delete()
      .eq('user_id', request.user_id);
    if (deleteError) {
      this.error.set('L’adresse est autorisée, mais la demande n’a pas pu être retirée.');
      return false;
    }
    this.requests.update(items => items.filter(item => item.user_id !== request.user_id));
    return true;
  }

  async reject(request: AccessRequest): Promise<boolean> {
    this.error.set(null);
    const {error} = await this.supabase.client
      .from('access_requests')
      .update({status: 'rejected', updated_at: new Date().toISOString()})
      .eq('user_id', request.user_id);
    if (error) {
      this.error.set('Impossible de refuser cette adresse.');
      return false;
    }
    this.requests.update(items => items.filter(item => item.user_id !== request.user_id));
    return true;
  }
}
