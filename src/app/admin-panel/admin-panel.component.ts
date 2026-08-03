import {DatePipe} from '@angular/common';
import {Component, OnDestroy, OnInit, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {RealtimeChannel} from '@supabase/supabase-js';
import {AccessRequest, AdminAccessService} from '../service/admin-access.service';
import {SupabaseService} from '../service/supabase.service';

@Component({
  selector: 'app-admin-panel',
  imports: [DatePipe, MatButtonModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss'
})
export class AdminPanelComponent implements OnInit, OnDestroy {
  readonly open = signal(false);
  readonly processing = signal<string | null>(null);
  private channel?: RealtimeChannel;

  constructor(
    readonly access: AdminAccessService,
    private readonly supabase: SupabaseService
  ) {}

  ngOnInit() {
    void this.access.load();
    this.channel = this.supabase.client
      .channel('admin-access-requests')
      .on('postgres_changes', {event: '*', schema: 'public', table: 'access_requests'}, () => void this.access.load())
      .subscribe();
  }

  ngOnDestroy() {
    if (this.channel) void this.supabase.client.removeChannel(this.channel);
  }

  toggle() {
    this.open.update(value => !value);
  }

  async approve(request: AccessRequest) {
    this.processing.set(request.user_id);
    await this.access.approve(request);
    this.processing.set(null);
  }

  async reject(request: AccessRequest) {
    this.processing.set(request.user_id);
    await this.access.reject(request);
    this.processing.set(null);
  }
}
