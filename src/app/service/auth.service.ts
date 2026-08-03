import {Injectable, signal} from '@angular/core';
import {User} from '@supabase/supabase-js';
import {SupabaseService} from './supabase.service';

export type AccessState = 'loading' | 'signed-out' | 'pending' | 'authorized';

@Injectable({providedIn: 'root'})
export class AuthService {
  readonly user = signal<User | null>(null);
  readonly accessState = signal<AccessState>('loading');

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
      this.accessState.set('signed-out');
      return;
    }

    this.accessState.set('loading');
    const {data, error} = await this.supabase.client
      .from('workspace_members')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    this.accessState.set(!error && data ? 'authorized' : 'pending');
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
