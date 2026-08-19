-- Add only the permission introduced by the field-size feature. The existing
-- permissions for crop state and timers remain unchanged.
grant update (plant_count)
on table public.farming_fields
to anon, authenticated;
