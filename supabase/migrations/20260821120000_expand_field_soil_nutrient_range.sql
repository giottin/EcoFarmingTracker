-- Keep unusual Soil Sampler readings visible so they can be corrected instead
-- of silently changing them to 100 %. Fertilizer plans remain capped at 100 %.
alter table public.farming_fields
  drop constraint if exists farming_fields_nitrogen_range,
  drop constraint if exists farming_fields_phosphorus_range,
  drop constraint if exists farming_fields_potassium_range;

alter table public.farming_fields
  add constraint farming_fields_nitrogen_range check (nitrogen is null or nitrogen between 0 and 999),
  add constraint farming_fields_phosphorus_range check (phosphorus is null or phosphorus between 0 and 999),
  add constraint farming_fields_potassium_range check (potassium is null or potassium between 0 and 999);
