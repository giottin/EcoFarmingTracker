import {Component, computed, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {FERTILIZER_DEFINITIONS, fertilizerImageUrl} from '../fertilizer-plans/fertilizer-data';
import {FertilizerPlansService} from '../service/fertilizer-plans.service';
import {Field} from '../model/field';
import {FieldService} from '../service/field.service';

export type Nutrients = { nitrogen: number; phosphorus: number; potassium: number };
type Fertilizer = (typeof FERTILIZER_DEFINITIONS)[number] & {available: boolean};
type Solution = { quantities: number[]; final: Nutrients; total: number; totalDeficit: number; worstDeficit: number };

@Component({selector: 'app-automatic-fertilizer-calculator', imports: [FormsModule], templateUrl: './automatic-fertilizer-calculator.component.html', styleUrl: './automatic-fertilizer-calculator.component.scss'})
export class AutomaticFertilizerCalculatorComponent implements OnInit {
  private readonly storageKey = 'eco-automatic-fertilizer-calculator';
  readonly fertilizers: Fertilizer[] = FERTILIZER_DEFINITIONS.map(fertilizer => ({...fertilizer, available: true}));
  readonly imageUrl = fertilizerImageUrl;
  private readonly unavailableImages = new Set<string>();

  readonly fields = signal<Field[]>([]);
  readonly selectedField = computed(() => this.fields().find(field => field.id === this.fieldId) ?? null);
  fieldId: number | null = null;
  current: Nutrients = {nitrogen: 0, phosphorus: 0, potassium: 0};
  claims = 1;
  solution: Solution | null = null;
  savingPlan = false;
  planSaved = false;
  planError = false;

  constructor(
    private readonly fertilizerPlans: FertilizerPlansService,
    private readonly fieldService: FieldService
  ) {}

  async ngOnInit() {
    this.restore();
    this.fields.set(await this.fieldService.getFields());
    await this.fertilizerPlans.load();
    this.calculate();
  }

  calculate() {
    this.current = {nitrogen: this.clamp(this.current.nitrogen), phosphorus: this.clamp(this.current.phosphorus), potassium: this.clamp(this.current.potassium)};
    this.claims = Math.max(1, Math.floor(this.number(this.claims)));
    const scale = 10;
    const capacity = [Math.round((100 - this.current.nitrogen) * scale), Math.round((100 - this.current.phosphorus) * scale), Math.round((100 - this.current.potassium) * scale)];
    const availableFertilizers = this.fertilizers.map((fertilizer, originalIndex) => ({originalIndex, contribution: [Math.round(fertilizer.nitrogen * scale), Math.round(fertilizer.phosphorus * scale), Math.round(fertilizer.potassium * scale)]})).filter(({originalIndex}) => this.fertilizers[originalIndex].available);
    type SearchResult = { quantities: number[]; used: number[]; totalDeficit: number; worstDeficit: number; total: number };
    const result: {best: SearchResult | null} = {best: null};
    const quantities = Array(this.fertilizers.length).fill(0) as number[];
    const consider = (used: number[]) => {
      const last = availableFertilizers[availableFertilizers.length - 1]; let finalUsed = used;
      if (last) { const maximum = Math.min(...capacity.map((limit, nutrient) => Math.floor((limit - used[nutrient]) / last.contribution[nutrient]))); quantities[last.originalIndex] = maximum; finalUsed = used.map((value, nutrient) => value + last.contribution[nutrient] * maximum); }
      const deficits = capacity.map((limit, index) => limit - finalUsed[index]); const totalDeficit = deficits.reduce((sum, value) => sum + value, 0); const worstDeficit = Math.max(...deficits); const total = quantities.reduce((sum, value) => sum + value, 0); const best = result.best;
      if (!best || totalDeficit < best.totalDeficit || (totalDeficit === best.totalDeficit && worstDeficit < best.worstDeficit) || (totalDeficit === best.totalDeficit && worstDeficit === best.worstDeficit && total < best.total)) result.best = {quantities: [...quantities], used: finalUsed, totalDeficit, worstDeficit, total};
      if (last) quantities[last.originalIndex] = 0;
    };
    const search = (index: number, used: number[]) => {
      if (index >= availableFertilizers.length - 1) { consider(used); return; }
      const fertilizer = availableFertilizers[index]; const maximum = Math.min(...capacity.map((limit, nutrient) => Math.floor((limit - used[nutrient]) / fertilizer.contribution[nutrient])));
      for (let count = 0; count <= maximum; count++) { quantities[fertilizer.originalIndex] = count; search(index + 1, used.map((value, nutrient) => value + fertilizer.contribution[nutrient] * count)); }
      quantities[fertilizer.originalIndex] = 0;
    };
    search(0, [0, 0, 0]);
    const best = result.best;
    if (best) this.solution = {quantities: best.quantities, final: {nitrogen: this.current.nitrogen + best.used[0] / scale, phosphorus: this.current.phosphorus + best.used[1] / scale, potassium: this.current.potassium + best.used[2] / scale}, total: best.total, totalDeficit: best.totalDeficit / scale, worstDeficit: best.worstDeficit / scale};
    this.planSaved = false; this.planError = false; this.save();
  }

  quantity(index: number): number { return this.solution?.quantities[index] ?? 0; }
  totalQuantity(index: number): number { return this.quantity(index) * this.claims; }
  format(value: number): string { return Number.isInteger(value) ? String(value) : value.toFixed(1).replace('.', ','); }
  setAvailability(index: number, value: unknown) { this.fertilizers[index].available = value === true; this.calculate(); }
  fieldChanged() { this.planSaved = false; this.planError = false; this.save(); }
  fieldDisplayName(field: Field): string { return field.name().trim() || `Champ sans nom #${field.id}`; }
  imageUnavailable(iconName: string) { return this.unavailableImages.has(iconName); }
  markImageUnavailable(iconName: string) { this.unavailableImages.add(iconName); }
  reset() { this.fieldId = null; this.current = {nitrogen: 0, phosphorus: 0, potassium: 0}; this.claims = 1; this.calculate(); }

  async savePlan() {
    const field = this.selectedField();
    if (!this.solution || !field || this.savingPlan) return;
    this.savingPlan = true; this.planSaved = false; this.planError = false;
    const lines = this.fertilizers.map((fertilizer, index) => ({fertilizer, perClaim: this.quantity(index), total: this.totalQuantity(index)})).filter(({perClaim}) => perClaim > 0).map(({fertilizer, perClaim, total}) => ({key: fertilizer.key, label: fertilizer.label, iconName: fertilizer.iconName, perClaim, total}));
    const saved = await this.fertilizerPlans.addOrReplace({fieldId: field.id, fieldName: this.fieldDisplayName(field), claims: this.claims, nutrients: {...this.current}, lines});
    this.savingPlan = false; this.planSaved = saved; this.planError = !saved;
  }

  private clamp(value: number): number { return Math.min(100, Math.max(0, this.number(value))); }
  private number(value: number): number { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; }
  private save() { localStorage.setItem(this.storageKey, JSON.stringify({fieldId: this.fieldId, current: this.current, claims: this.claims, availability: Object.fromEntries(this.fertilizers.map(item => [item.key, item.available]))})); }
  private restore() {
    try { const saved = JSON.parse(localStorage.getItem(this.storageKey) ?? 'null'); if (!saved) return; this.fieldId = Number.isInteger(saved.fieldId) && saved.fieldId > 0 ? saved.fieldId : null; this.current = {nitrogen: this.clamp(saved.current?.nitrogen), phosphorus: this.clamp(saved.current?.phosphorus), potassium: this.clamp(saved.current?.potassium)}; this.claims = Math.max(1, Math.floor(this.number(saved.claims))); for (const fertilizer of this.fertilizers) { const available = saved.availability?.[fertilizer.key] ?? saved.availability?.[fertilizer.label]; if (typeof available === 'boolean') fertilizer.available = available; } } catch { localStorage.removeItem(this.storageKey); }
  }
}
