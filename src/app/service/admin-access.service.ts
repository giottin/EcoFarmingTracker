import {Injectable, signal} from '@angular/core';
import {SupabaseService} from './supabase.service';

export interface AllowedEmail {
  email: string;
  role: 'admin' | 'member';
  created_at: string;
}

@Injectable({providedIn: 'root'})
export class AdminAccessService {
  readonly members = signal<AllowedEmail[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private readonly supabase: SupabaseService) {}

  async load() {
    this.loading.set(true);
    this.error.set(null);
    const {data, error} = await this.supabase.client
      .from('allowed_emails')
      .select('email, role, created_at')
      .order('created_at', {ascending: true});
    this.loading.set(false);
    if (error) {
      this.error.set('Impossible de charger les adresses autorisées.');
      return;
    }
    this.members.set(data ?? []);
  }

  async add(email: string): Promise<boolean> {
    this.error.set(null);
    const normalizedEmail = email.trim().toLowerCase();
    const {error} = await this.supabase.client.from('allowed_emails').insert({
      email: normalizedEmail,
      role: 'member'
    });
    if (error) {
      this.error.set(error.code === '23505' ? 'Cette adresse est déjà autorisée.' : 'Impossible d’ajouter cette adresse.');
      return false;
    }
    await this.load();
    return true;
  }

  async remove(member: AllowedEmail): Promise<boolean> {
    this.error.set(null);
    const {error} = await this.supabase.client.rpc('remove_allowed_email', {
      requested_email: member.email
    });
    if (error) {
      this.error.set('Impossible de supprimer cette adresse.');
      return false;
    }
    this.members.update(items => items.filter(item => item.email !== member.email));
    return true;
  }
}
