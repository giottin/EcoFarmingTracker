import {Component, inject} from '@angular/core';
import {NgOptimizedImage} from '@angular/common';
import {MatDialog, MatDialogModule} from '@angular/material/dialog';
import {SettingsDialogComponent} from '../settings-dialog/settings-dialog.component';
import {AuthService} from '../service/auth.service';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-header',
  imports: [
    NgOptimizedImage,
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  readonly dialog = inject(MatDialog);
  readonly auth = inject(AuthService);

  openSettingsDialog() {
    const dialogRef = this.dialog.open(SettingsDialogComponent);

    dialogRef.afterClosed().subscribe(result => {

    });
  }
}
