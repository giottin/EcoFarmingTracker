import {Injectable} from '@angular/core';
import {createClient, SupabaseClient} from '@supabase/supabase-js';
import {environment} from '../../environments/environment';

@Injectable({providedIn: 'root'})
export class SupabaseService {
  private sessionToken = localStorage.getItem('eco-session-token');
  private currentClient = this.createClient();

  get client(): SupabaseClient {
    return this.currentClient;
  }

  get token(): string | null {
    return this.sessionToken;
  }

  setToken(token: string | null) {
    this.sessionToken = token;
    if (token) localStorage.setItem('eco-session-token', token);
    else localStorage.removeItem('eco-session-token');
    this.currentClient = this.createClient();
  }

  private createClient(): SupabaseClient {
    const headers: Record<string, string> = {};
    if (this.sessionToken) headers['x-eco-session'] = this.sessionToken;
    return createClient(environment.supabaseUrl, environment.supabasePublishableKey, {
      global: {headers},
      auth: {persistSession: false, autoRefreshToken: false, detectSessionInUrl: false}
    });
  }
}
