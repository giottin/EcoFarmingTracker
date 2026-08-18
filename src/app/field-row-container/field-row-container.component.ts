import {Component, OnDestroy, OnInit, signal} from '@angular/core';
import {Field} from '../model/field';
import {FieldService} from '../service/field.service';
import {FieldRowComponent} from './field-row/field-row.component';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {FertilizerPlansService} from '../service/fertilizer-plans.service';

@Component({
  selector: 'app-field-row-container',
  imports: [
    FieldRowComponent,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './field-row-container.component.html',
  styleUrl: './field-row-container.component.scss'
})
export class FieldRowContainerComponent implements OnInit, OnDestroy {
  readonly fields = signal<Field[]>([]);
  readonly loading = signal(true);
  readonly adding = signal(false);
  readonly now = signal(Date.now());
  private readonly clock = window.setInterval(() => this.now.set(Date.now()), 15000);
  private stopWatching?: () => void;

  constructor(
    private readonly fieldService: FieldService,
    private readonly fertilizerPlans: FertilizerPlansService
  ) {}

  async ngOnInit() {
    try {
      const [fields] = await Promise.all([this.fieldService.getFields(), this.fertilizerPlans.load()]);
      this.fields.set(fields);
      if (this.fields().length === 0) await this.addRandomField();
      this.stopWatching = this.fieldService.watchFields(() => void this.reloadFields());
    } finally {
      this.loading.set(false);
    }
  }

  ngOnDestroy() {
    window.clearInterval(this.clock);
    this.stopWatching?.();
  }

  async addRandomField() {
    if (this.adding()) return;
    this.adding.set(true);
    const randomField = await this.fieldService.createRandomField(this.fields().length);
    if (randomField) this.fields.update(fields => [...fields, randomField]);
    this.adding.set(false);
  }

  async onRowClosed(field: Field) {
    this.fields.update(fields => fields.filter(f => f !== field));
    await this.fieldService.deleteField(field.id);
  }

  private async reloadFields() {
    if (this.fieldService.hasPendingWrites()) return;
    const [fields] = await Promise.all([this.fieldService.getFields(), this.fertilizerPlans.load()]);
    this.fields.set(fields);
  }
}
