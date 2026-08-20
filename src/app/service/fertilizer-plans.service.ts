import {Injectable, signal} from '@angular/core';
import {SupabaseService} from './supabase.service';
import {clampNutrients, hasTrackedNutrients, type Nutrients} from '../agriculture/soil-nutrients';

export type PlanNutrients = Nutrients;
export type FertilizerPlanLine = {key: string; label: string; iconName: string; perClaim: number; total: number};
export type FertilizerPlanDraft = {fieldId: number; fieldName: string; claims: number; nutrients: PlanNutrients; resultingNutrients: PlanNutrients; lines: FertilizerPlanLine[]};
export type FertilizerPlan = Omit<FertilizerPlanDraft, 'resultingNutrients'> & {id: number; createdAt: Date; resultingNutrients?: PlanNutrients};

type StoredPlan = {lines?: FertilizerPlanLine[]; resultingNutrients?: PlanNutrients};
type FertilizerPlanRow = {id: number; field_id: number | null; field_name: string; claims: number; nutrients: PlanNutrients; plan: StoredPlan; created_at: string};
type PlanPayload = {field_id: number; field_name: string; claims: number; nutrients: PlanNutrients; plan: Required<StoredPlan>};
type AppliedPlanRow = {next_nitrogen: number; next_phosphorus: number; next_potassium: number};

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
      plan: {lines: draft.lines, resultingNutrients: clampNutrients(draft.resultingNutrients)}
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

  /**
   * Applies one plan server-side: field nutrients and plan removal happen in
   * the same transaction, so a double click or a second browser cannot apply
   * the same plan twice. Legacy plans receive a client-calculated fallback.
   */
  async apply(plan: FertilizerPlan, fallback: Nutrients): Promise<Nutrients | null> {
    const {data, error} = await this.supabase.client.rpc('apply_fertilizer_plan', {
      p_plan_id: plan.id,
      p_nitrogen: fallback.nitrogen,
      p_phosphorus: fallback.phosphorus,
      p_potassium: fallback.potassium
    });
    const row = Array.isArray(data) ? data[0] as AppliedPlanRow | undefined : data as AppliedPlanRow | null;
    const nutrients = row ? {
      nitrogen: Number(row.next_nitrogen),
      phosphorus: Number(row.next_phosphorus),
      potassium: Number(row.next_potassium)
    } : undefined;
    if (error || !nutrients || !hasTrackedNutrients(nutrients)) return null;
    this.plans.update(plans => plans.filter(candidate => candidate.id !== plan.id));
    return clampNutrients(nutrients);
  }

  getForField(fieldId: number): FertilizerPlan | null {
    return this.plans().find(candidate => candidate.fieldId === fieldId) ?? null;
  }

  private fromRow(row: FertilizerPlanRow): FertilizerPlan {
    const resultingNutrients = hasTrackedNutrients(row.plan?.resultingNutrients)
      ? clampNutrients(row.plan.resultingNutrients)
      : undefined;
    return {
      id: Number(row.id),
      fieldId: row.field_id === null ? 0 : Number(row.field_id),
      fieldName: row.field_name,
      claims: Number(row.claims),
      nutrients: hasTrackedNutrients(row.nutrients) ? clampNutrients(row.nutrients) : {...EMPTY_PLAN_NUTRIENTS},
      lines: Array.isArray(row.plan?.lines) ? row.plan.lines : [],
      createdAt: new Date(row.created_at),
      ...(resultingNutrients ? {resultingNutrients} : {})
    };
  }
}

const EMPTY_PLAN_NUTRIENTS: PlanNutrients = {nitrogen: 0, phosphorus: 0, potassium: 0};
