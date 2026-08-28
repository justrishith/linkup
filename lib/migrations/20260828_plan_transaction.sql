alter table public.events add column if not exists idea_id uuid references public.ideas(id) on delete set null;
create index if not exists events_idea_id_idx on public.events (idea_id);

create or replace function public.create_plan(
  p_group_id uuid,
  p_name text,
  p_description text default null,
  p_location text default null,
  p_options jsonb default '[]'::jsonb,
  p_idea_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_event_id uuid;
  v_option jsonb;
begin
  if v_user_id is null or not public.is_group_member(p_group_id, v_user_id) then
    raise exception 'You are not a member of this Link' using errcode = '42501';
  end if;
  if nullif(trim(p_name), '') is null then
    raise exception 'Plan name is required' using errcode = '22023';
  end if;
  if jsonb_typeof(coalesce(p_options, '[]'::jsonb)) <> 'array' then
    raise exception 'Date options must be an array' using errcode = '22023';
  end if;
  if p_idea_id is not null and not exists (
    select 1 from public.ideas i where i.id = p_idea_id and i.group_id = p_group_id
  ) then
    raise exception 'That idea does not belong to this Link' using errcode = '22023';
  end if;

  insert into public.events (group_id, created_by, name, description, location, status, idea_id)
  values (
    p_group_id,
    v_user_id,
    trim(p_name),
    nullif(trim(coalesce(p_description, '')), ''),
    nullif(trim(coalesce(p_location, '')), ''),
    'proposed',
    p_idea_id
  )
  returning id into v_event_id;

  for v_option in select value from jsonb_array_elements(coalesce(p_options, '[]'::jsonb))
  loop
    insert into public.event_date_options (event_id, starts_at, ends_at, created_by)
    values (
      v_event_id,
      (v_option ->> 'starts_at')::timestamptz,
      nullif(v_option ->> 'ends_at', '')::timestamptz,
      v_user_id
    );
  end loop;

  if p_idea_id is not null then
    update public.ideas set status = 'planning', updated_at = now() where id = p_idea_id;
  end if;

  return v_event_id;
end;
$$;

revoke all on function public.create_plan(uuid, text, text, text, jsonb, uuid) from public, anon;
grant execute on function public.create_plan(uuid, text, text, text, jsonb, uuid) to authenticated;
