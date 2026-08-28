-- Keep Link creation and invite acceptance atomic so RLS never sees half-created state.
create or replace function public.create_group(
  p_name text,
  p_description text default null
)
returns public.groups
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_group public.groups;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if nullif(trim(p_name), '') is null then
    raise exception 'Link name is required' using errcode = '22023';
  end if;

  insert into public.groups (name, description, owner_id)
  values (trim(p_name), nullif(trim(coalesce(p_description, '')), ''), v_user_id)
  returning * into v_group;

  insert into public.group_members (group_id, user_id, role)
  values (v_group.id, v_user_id, 'owner');

  return v_group;
end;
$$;

revoke all on function public.create_group(text, text) from public, anon;
grant execute on function public.create_group(text, text) to authenticated;

create or replace function public.accept_group_invite(p_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_group_id uuid;
  v_expires_at timestamptz;
  v_member_count integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select i.group_id, i.expires_at
  into v_group_id, v_expires_at
  from public.invites i
  where i.code = upper(trim(p_code))
  for update;

  if v_group_id is null then
    raise exception 'Invite not found' using errcode = 'P0002';
  end if;

  if v_expires_at is not null and v_expires_at <= now() then
    raise exception 'This invite has expired' using errcode = '22023';
  end if;

  if exists (
    select 1 from public.group_members gm
    where gm.group_id = v_group_id and gm.user_id = v_user_id
  ) then
    return v_group_id;
  end if;

  -- Serialize joins for one Link so two simultaneous accepts cannot exceed ten people.
  perform 1 from public.groups g where g.id = v_group_id for update;
  select count(*) into v_member_count
  from public.group_members gm
  where gm.group_id = v_group_id;

  if v_member_count >= 10 then
    raise exception 'This Link already has 10 people' using errcode = '23514';
  end if;

  insert into public.group_members (group_id, user_id, role)
  values (v_group_id, v_user_id, 'member');

  return v_group_id;
end;
$$;

revoke all on function public.accept_group_invite(text) from public, anon;
grant execute on function public.accept_group_invite(text) to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      split_part(coalesce(new.email, ''), '@', 1),
      'LinkUp member'
    )
  )
  on conflict (id) do update
  set display_name = case
    when nullif(trim(public.profiles.display_name), '') is null
      then excluded.display_name
    else public.profiles.display_name
  end;

  return new;
end;
$$;

create index if not exists groups_owner_id_idx on public.groups (owner_id);
create index if not exists invites_group_id_idx on public.invites (group_id);
create index if not exists invites_created_by_idx on public.invites (created_by);
