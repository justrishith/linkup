alter table public.events add column if not exists rarity smallint not null default 1;
alter table public.events add column if not exists score_version text;
alter table public.events add column if not exists score_total integer;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'events_rarity_check') then
    alter table public.events add constraint events_rarity_check check (rarity between 1 and 5);
  end if;
end $$;

alter table public.event_proofs drop constraint if exists event_proofs_event_id_user_id_key;
create unique index if not exists event_proofs_unique_reference_idx
  on public.event_proofs (event_id, user_id, photo_reference);
create unique index if not exists point_ledger_verified_event_once_idx
  on public.point_ledger (event_id, user_id, reason)
  where event_id is not null and reason = 'verified_event';

drop policy if exists event_proofs_attendee_insert on public.event_proofs;
create policy event_proofs_attendee_insert on public.event_proofs
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.events e
      where e.id = event_id and public.is_group_member(e.group_id)
    )
    and exists (
      select 1 from public.event_members em
      where em.event_id = event_proofs.event_id
        and em.user_id = (select auth.uid())
        and em.rsvp = 'going'
    )
  );

create or replace function public.confirm_plan(p_event_id uuid, p_option_id uuid)
returns public.events
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_event public.events;
  v_starts_at timestamptz;
  v_ends_at timestamptz;
begin
  select e.* into v_event from public.events e where e.id = p_event_id;
  if v_event.id is null then
    raise exception 'Plan not found' using errcode = 'P0002';
  end if;
  if not exists (
    select 1 from public.group_members gm
    where gm.group_id = v_event.group_id and gm.user_id = v_user_id and gm.role in ('owner', 'admin')
  ) then
    raise exception 'Only an Owner or Admin can confirm a plan' using errcode = '42501';
  end if;
  select o.starts_at, o.ends_at into v_starts_at, v_ends_at
  from public.event_date_options o
  where o.id = p_option_id and o.event_id = p_event_id;
  if v_starts_at is null then
    raise exception 'Date option not found' using errcode = 'P0002';
  end if;

  update public.events
  set starts_at = v_starts_at, ends_at = v_ends_at, status = 'confirmed', updated_at = now()
  where id = p_event_id
  returning * into v_event;
  return v_event;
end;
$$;

revoke all on function public.confirm_plan(uuid, uuid) from public, anon;
grant execute on function public.confirm_plan(uuid, uuid) to authenticated;

create or replace function public.verify_event_from_proofs()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.events;
  v_distinct_people integer;
  v_attendee_count integer;
  v_photo_count integer;
  v_points integer;
begin
  select e.* into v_event from public.events e where e.id = new.event_id for update;
  select count(distinct ep.user_id), count(*)
  into v_distinct_people, v_photo_count
  from public.event_proofs ep where ep.event_id = new.event_id;

  if v_distinct_people < 2 or v_event.verified_at is not null then
    return new;
  end if;

  select count(*) into v_attendee_count
  from public.event_members em
  where em.event_id = new.event_id and em.rsvp = 'going';

  -- v1 is intentionally transparent: people*10 + rarity*20 + proof photos*5.
  v_points := (v_attendee_count * 10) + (v_event.rarity * 20) + (v_photo_count * 5);

  update public.events
  set status = 'happened',
      verified_at = now(),
      score_version = 'v1',
      score_total = v_points,
      updated_at = now()
  where id = new.event_id;

  insert into public.point_ledger (group_id, event_id, user_id, points, reason, metadata)
  select
    v_event.group_id,
    new.event_id,
    em.user_id,
    v_points,
    'verified_event',
    jsonb_build_object(
      'version', 'v1',
      'attendee_count', v_attendee_count,
      'rarity', v_event.rarity,
      'photo_count', v_photo_count
    )
  from public.event_members em
  where em.event_id = new.event_id and em.rsvp = 'going'
  on conflict (event_id, user_id, reason) where event_id is not null and reason = 'verified_event'
  do nothing;

  return new;
end;
$$;

revoke all on function public.verify_event_from_proofs() from public, anon, authenticated;
