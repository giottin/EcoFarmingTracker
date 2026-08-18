import {Component, effect, signal, Signal} from '@angular/core';
import {HeaderComponent} from './header/header.component';
import {FieldRowContainerComponent} from './field-row-container/field-row-container.component';
import {LoginComponent} from './login/login.component';
import {AccessState, AuthService} from './service/auth.service';
import {SettingsService} from './service/settings.service';
import {MatButtonModule} from '@angular/material/button';
import {AdminPanelComponent} from './admin-panel/admin-panel.component';
import {SignGeneratorComponent} from './sign-generator/sign-generator.component';
import {AutomaticFertilizerCalculatorComponent} from './automatic-fertilizer-calculator/automatic-fertilizer-calculator.component';
import {SavedSignsComponent} from './saved-signs/saved-signs.component';
import {FertilizerPlansComponent} from './fertilizer-plans/fertilizer-plans.component';

type Tool = 'fields' | 'signs' | 'saved-signs' | 'automatic-fertilizer' | 'fertilizer-plans';

@Component({
  selector: 'app-root',
  imports: [
    HeaderComponent,
    FieldRowContainerComponent,
    LoginComponent,
    MatButtonModule,
    AdminPanelComponent,
    SignGeneratorComponent,
    AutomaticFertilizerCalculatorComponent,
    SavedSignsComponent,
    FertilizerPlansComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  readonly accessState: Signal<AccessState>;
  readonly activeTool = signal<Tool>('fields');
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

  selectTool(tool: Tool) {
    this.activeTool.set(tool);
  }
}
