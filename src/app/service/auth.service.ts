import {Injectable, signal} from '@angular/core';
import {User} from '@supabase/supabase-js';
import {SupabaseService} from './supabase.service';

export type AccessState = 'loading' | 'signed-out' | 'pending' | 'rejected' | 'authorized';

@Injectable({providedIn: 'root'})
export class AuthService {
  readonly user = signal<User | null>(null);
  readonly accessState = signal<AccessState>('loading');
  readonly isAdmin = signal(false);

  constructor(private readonly supabase: SupabaseService) {
    void this.initialize();
  }

  private async initialize() {
    const {data} = await this.supabase.client.auth.getSession();
    await this.applyUser(data.session?.user ?? null);

    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => void this.applyUser(session?.user ?? null), 0);
    });
  }

  private async applyUser(user: User | null) {
    this.user.set(user);
    if (!user) {
      this.isAdmin.set(false);
      this.accessState.set('signed-out');
      return;
    }

    this.accessState.set('loading');
    const {data, error} = await this.supabase.client
      .from('workspace_members')
      .select('user_id, role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      this.isAdmin.set(data.role === 'admin');
      this.accessState.set('authorized');
      return;
    }

    this.isAdmin.set(false);
    const request = await this.getOrCreateAccessRequest(user);
    this.accessState.set(request === 'rejected' ? 'rejected' : 'pending');
  }

  private async getOrCreateAccessRequest(user: User): Promise<'pending' | 'rejected'> {
    const existing = await this.supabase.client
      .from('access_requests')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing.data?.status === 'rejected') return 'rejected';
    if (existing.data) return 'pending';

    await this.supabase.client.from('access_requests').insert({
      user_id: user.id,
      email: user.email ?? '',
      status: 'pending'
    });
    return 'pending';
  }

  async sendMagicLink(email: string): Promise<string | null> {
    const {error} = await this.supabase.client.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
        shouldCreateUser: true
      }
    });
    return error?.message ?? null;
  }

  async refreshAccess() {
    await this.applyUser(this.user());
  }

  async signOut() {
    await this.supabase.client.auth.signOut();
  }
}
