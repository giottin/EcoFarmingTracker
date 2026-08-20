-- Soil values are nullable so existing fields remain fully usable until a
-- player records their first Soil Sampler measurement.
alter table public.farming_fields
  add column if not exists nitrogen numeric(6, 2),
  add column if not exists phosphorus numeric(6, 2),
  add column if not exists potassium numeric(6, 2);

alter table public.farming_fields
  drop constraint if exists farming_fields_nitrogen_range,
  drop constraint if exists farming_fields_phosphorus_range,
  drop constraint if exists farming_fields_potassium_range;

alter table public.farming_fields
  add constraint farming_fields_nitrogen_range check (nitrogen is null or nitrogen between 0 and 100),
  add constraint farming_fields_phosphorus_range check (phosphorus is null or phosphorus between 0 and 100),
  add constraint farming_fields_potassium_range check (potassium is null or potassium between 0 and 100);

-- Client updates stay restricted to the precise newly-added state columns.
grant update (nitrogen) on public.farming_fields to anon, authenticated;
grant update (phosphorus) on public.farming_fields to anon, authenticated;
grant update (potassium) on public.farming_fields to anon, authenticated;
