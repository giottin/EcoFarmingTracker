import {Component, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {AuthService} from '../service/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email = '';
  readonly sending = signal(false);
  readonly sent = signal(false);
  readonly error = signal('');

  constructor(private readonly auth: AuthService) {}

  async sendLink() {
    if (!this.email || this.sending()) return;
    this.sending.set(true);
    this.error.set('');
    const error = await this.auth.sendMagicLink(this.email.trim());
    this.sending.set(false);
    if (error) {
      this.error.set('Impossible d’envoyer le lien. Vérifie l’adresse puis réessaie.');
      return;
    }
    this.sent.set(true);
  }
}
