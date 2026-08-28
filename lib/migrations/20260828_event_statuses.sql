-- Preserve legacy states while adding the explicit planning and proof states.
alter table public.events drop constraint if exists events_status_check;
alter table public.events add constraint events_status_check
  check (status in ('idea', 'proposed', 'planning', 'confirmed', 'happened', 'completed', 'cancelled'));
