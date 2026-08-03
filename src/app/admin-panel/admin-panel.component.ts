import {Component, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {AdminAccessService, AllowedEmail} from '../service/admin-access.service';

@Component({
  selector: 'app-admin-panel',
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss'
})
export class AdminPanelComponent implements OnInit {
  readonly open = signal(false);
  readonly processing = signal<string | null>(null);
  email = '';
  constructor(readonly access: AdminAccessService) {}

  ngOnInit() {
    void this.access.load();
  }

  toggle() { this.open.update(value => !value); }

  async add() {
    if (!this.email.trim() || this.processing()) return;
    this.processing.set('add');
    if (await this.access.add(this.email)) this.email = '';
    this.processing.set(null);
  }

  async remove(member: AllowedEmail) {
    this.processing.set(member.email);
    await this.access.remove(member);
    this.processing.set(null);
  }
}
