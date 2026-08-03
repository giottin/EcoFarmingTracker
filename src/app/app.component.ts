import {Component, effect, Signal} from '@angular/core';
import {FooterComponent} from './footer/footer.component';
import {HeaderComponent} from './header/header.component';
import {FieldRowContainerComponent} from './field-row-container/field-row-container.component';
import {LoginComponent} from './login/login.component';
import {AccessState, AuthService} from './service/auth.service';
import {SettingsService} from './service/settings.service';
import {MatButtonModule} from '@angular/material/button';
import {AdminPanelComponent} from './admin-panel/admin-panel.component';

@Component({
  selector: 'app-root',
  imports: [
    FooterComponent,
    HeaderComponent,
    FieldRowContainerComponent,
    LoginComponent,
    MatButtonModule,
    AdminPanelComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly accessState: Signal<AccessState>;
  private settingsLoaded = false;

  constructor(
    readonly auth: AuthService,
    private readonly settings: SettingsService
  ) {
    this.accessState = auth.accessState;
    effect(() => {
      if (this.accessState() === 'authorized' && !this.settingsLoaded) {
        this.settingsLoaded = true;
        void this.settings.load();
      }
    });
  }
}
