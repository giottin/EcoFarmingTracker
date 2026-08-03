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
  readonly connecting = signal(false);
  readonly error = signal('');

  constructor(private readonly auth: AuthService) {}

  async connect() {
    if (!this.email || this.connecting()) return;
    this.connecting.set(true);
    this.error.set('');
    const authorized = await this.auth.signIn(this.email);
    this.connecting.set(false);
    if (!authorized) this.error.set('Cette adresse n’est pas autorisée.');
  }
}
