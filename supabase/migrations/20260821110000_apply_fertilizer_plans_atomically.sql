-- The plan is locked, applied and removed in one transaction. This makes a
-- duplicate click (or two open browsers) harmless: only the first call sees
-- the pending plan and can update the field.
create or replace function public.apply_fertilizer_plan(
  p_plan_id bigint,
  p_nitrogen numeric,
  p_phosphorus numeric,
  p_potassium numeric
)
returns table (
  next_nitrogen numeric,
  next_phosphorus numeric,
  next_potassium numeric
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_plan public.fertilizer_plans%rowtype;
  v_nitrogen numeric;
  v_phosphorus numeric;
  v_potassium numeric;
begin
  select * into v_plan
  from public.fertilizer_plans
  where id = p_plan_id
  for update;

  if not found or v_plan.field_id is null then
    return;
  end if;

  if jsonb_typeof(v_plan.plan -> 'resultingNutrients') = 'object'
    and jsonb_typeof(v_plan.plan -> 'resultingNutrients' -> 'nitrogen') = 'number'
    and jsonb_typeof(v_plan.plan -> 'resultingNutrients' -> 'phosphorus') = 'number'
    and jsonb_typeof(v_plan.plan -> 'resultingNutrients' -> 'potassium') = 'number' then
    v_nitrogen := (v_plan.plan -> 'resultingNutrients' ->> 'nitrogen')::numeric;
    v_phosphorus := (v_plan.plan -> 'resultingNutrients' ->> 'phosphorus')::numeric;
    v_potassium := (v_plan.plan -> 'resultingNutrients' ->> 'potassium')::numeric;
  else
    -- Compatibility for plans created before resultingNutrients was stored.
    v_nitrogen := p_nitrogen;
    v_phosphorus := p_phosphorus;
    v_potassium := p_potassium;
  end if;

  if v_nitrogen is null or v_phosphorus is null or v_potassium is null
    or v_nitrogen < 0 or v_nitrogen > 100
    or v_phosphorus < 0 or v_phosphorus > 100
    or v_potassium < 0 or v_potassium > 100 then
    return;
  end if;

  update public.farming_fields
  set nitrogen = v_nitrogen,
      phosphorus = v_phosphorus,
      potassium = v_potassium,
      updated_at = now()
  where id = v_plan.field_id
  returning nitrogen, phosphorus, potassium
  into next_nitrogen, next_phosphorus, next_potassium;

  if not found then
    return;
  end if;

  delete from public.fertilizer_plans where id = v_plan.id;
  return next;
end;
$$;

revoke all on function public.apply_fertilizer_plan(bigint, numeric, numeric, numeric) from public;
grant execute on function public.apply_fertilizer_plan(bigint, numeric, numeric, numeric) to anon, authenticated;
