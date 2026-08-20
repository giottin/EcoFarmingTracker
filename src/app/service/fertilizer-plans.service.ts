import {Injectable, signal} from '@angular/core';
import {SupabaseService} from './supabase.service';
import type {Nutrients} from '../agriculture/soil-nutrients';

export type PlanNutrients = Nutrients;
export type FertilizerPlanLine = {key: string; label: string; iconName: string; perClaim: number; total: number};
export type FertilizerPlanDraft = {fieldId: number; fieldName: string; claims: number; nutrients: PlanNutrients; lines: FertilizerPlanLine[]};
export type FertilizerPlan = FertilizerPlanDraft & {id: number; createdAt: Date};

type FertilizerPlanRow = {id: number; field_id: number | null; field_name: string; claims: number; nutrients: PlanNutrients; plan: {lines?: FertilizerPlanLine[]}; created_at: string};
type PlanPayload = {field_id: number; field_name: string; claims: number; nutrients: PlanNutrients; plan: {lines: FertilizerPlanLine[]}};

@Injectable({providedIn: 'root'})
export class FertilizerPlansService {
  readonly plans = signal<FertilizerPlan[]>([]);
  readonly loading = signal(false);

  constructor(private readonly supabase: SupabaseService) {}

  async load() {
    this.loading.set(true);
    const {data, error} = await this.supabase.client
      .from('fertilizer_plans')
      .select('id, field_id, field_name, claims, nutrients, plan, created_at')
      .order('created_at', {ascending: false});
    if (!error && data) this.plans.set((data as FertilizerPlanRow[]).map(row => this.fromRow(row)));
    this.loading.set(false);
  }

  async addOrReplace(draft: FertilizerPlanDraft): Promise<boolean> {
    const fieldName = draft.fieldName.trim();
    const fieldId = Math.floor(Number(draft.fieldId));
    if (!fieldName || !Number.isFinite(fieldId) || fieldId < 1 || draft.claims < 1) return false;

    const payload: PlanPayload = {
      field_id: fieldId,
      field_name: fieldName,
      claims: draft.claims,
      nutrients: draft.nutrients,
      plan: {lines: draft.lines}
    };
    const existing = this.plans().find(plan => plan.fieldId === fieldId);
    const response = existing
      ? await this.supabase.client.from('fertilizer_plans').update(payload).eq('id', existing.id).select('id, field_id, field_name, claims, nutrients, plan, created_at').single()
      : await this.supabase.client.from('fertilizer_plans').insert(payload).select('id, field_id, field_name, claims, nutrients, plan, created_at').single();
    if (response.error || !response.data) return false;

    const saved = this.fromRow(response.data as FertilizerPlanRow);
    this.plans.update(plans => [saved, ...plans.filter(plan => plan.id !== saved.id && plan.fieldId !== saved.fieldId)]);
    return true;
  }

  async remove(id: number): Promise<boolean> {
    const {error} = await this.supabase.client.from('fertilizer_plans').delete().eq('id', id);
    if (error) return false;
    this.plans.update(plans => plans.filter(plan => plan.id !== id));
    return true;
  }

  async completeForField(fieldId: number): Promise<boolean> {
    const plan = this.getForField(fieldId);
    if (!plan) return true;
    return this.remove(plan.id);
  }

  getForField(fieldId: number): FertilizerPlan | null {
    return this.plans().find(candidate => candidate.fieldId === fieldId) ?? null;
  }

  private fromRow(row: FertilizerPlanRow): FertilizerPlan {
    return {
      id: Number(row.id),
      fieldId: row.field_id === null ? 0 : Number(row.field_id),
      fieldName: row.field_name,
      claims: Number(row.claims),
      nutrients: row.nutrients,
      lines: Array.isArray(row.plan?.lines) ? row.plan.lines : [],
      createdAt: new Date(row.created_at)
    };
  }
}
