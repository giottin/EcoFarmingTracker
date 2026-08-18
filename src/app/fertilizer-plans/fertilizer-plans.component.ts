import {Component, OnDestroy, OnInit, signal} from '@angular/core';
import {Field} from '../model/field';
import {FertilizerPlan, FertilizerPlansService} from '../service/fertilizer-plans.service';
import {FieldService} from '../service/field.service';
import {fertilizerImageUrl} from './fertilizer-data';

@Component({selector: 'app-fertilizer-plans', templateUrl: './fertilizer-plans.component.html', styleUrl: './fertilizer-plans.component.scss'})
export class FertilizerPlansComponent implements OnInit, OnDestroy {
  readonly imageUrl = fertilizerImageUrl;
  readonly fields = signal<Field[]>([]);
  private readonly unavailableImages = new Set<string>();
  private readonly refreshTimer = window.setInterval(() => void this.refresh(), 5000);

  constructor(
    readonly fertilizerPlans: FertilizerPlansService,
    private readonly fieldService: FieldService
  ) {}

  async ngOnInit() { await this.refresh(); }
  ngOnDestroy() { window.clearInterval(this.refreshTimer); }

  async remove(plan: FertilizerPlan) { await this.fertilizerPlans.remove(plan.id); }
  fieldName(plan: FertilizerPlan): string {
    const field = this.fields().find(candidate => candidate.id === plan.fieldId);
    return field?.name().trim() || plan.fieldName;
  }
  imageUnavailable(iconName: string) { return this.unavailableImages.has(iconName); }
  markImageUnavailable(iconName: string) { this.unavailableImages.add(iconName); }
  format(value: number): string { return Number.isInteger(value) ? String(value) : value.toFixed(1).replace('.', ','); }

  private async refresh() {
    const [fields] = await Promise.all([this.fieldService.getFields(), this.fertilizerPlans.load()]);
    this.fields.set(fields);
  }
}

