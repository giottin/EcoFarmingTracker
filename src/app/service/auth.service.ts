import {Injectable, signal} from '@angular/core';
import {SupabaseService} from './supabase.service';

export type AccessState = 'loading' | 'signed-out' | 'authorized';

type WorkspaceAccess = {email: string; role: 'admin' | 'member'};

@Injectable({providedIn: 'root'})
export class AuthService {
  readonly email = signal<string | null>(null);
  readonly accessState = signal<AccessState>('loading');
  readonly isAdmin = signal(false);

  constructor(private readonly supabase: SupabaseService) {
    void this.initialize();
  }

  private async initialize() {
    if (!this.supabase.token) {
      this.accessState.set('signed-out');
      return;
    }

    const {data, error} = await this.supabase.client.rpc('current_workspace_access');
    const access = data?.[0] as WorkspaceAccess | undefined;
    if (error || !access) {
      this.supabase.setToken(null);
      this.accessState.set('signed-out');
      return;
    }
    this.applyAccess(access);
  }

  async signIn(email: string): Promise<boolean> {
    const {data, error} = await this.supabase.client.rpc('enter_workspace', {
      requested_email: email.trim().toLowerCase()
    });
    const access = data?.[0] as (WorkspaceAccess & {session_token: string}) | undefined;
    if (error || !access) return false;

    this.supabase.setToken(access.session_token);
    this.applyAccess(access);
    return true;
  }

  async signOut() {
    if (this.supabase.token) await this.supabase.client.rpc('leave_workspace');
    this.supabase.setToken(null);
    this.email.set(null);
    this.isAdmin.set(false);
    this.accessState.set('signed-out');
  }

  private applyAccess(access: WorkspaceAccess) {
    this.email.set(access.email);
    this.isAdmin.set(access.role === 'admin');
    this.accessState.set('authorized');
  }
}
