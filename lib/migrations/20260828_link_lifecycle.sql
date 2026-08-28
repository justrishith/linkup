create or replace function public.create_sub_group(
  p_parent_group_id uuid,
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
  if v_user_id is null or not public.is_group_member(p_parent_group_id, v_user_id) then
    raise exception 'You are not a member of the parent Link' using errcode = '42501';
  end if;
  if nullif(trim(p_name), '') is null then
    raise exception 'Sub-link name is required' using errcode = '22023';
  end if;

  insert into public.groups (name, description, owner_id, parent_group_id, visibility, status)
  values (trim(p_name), nullif(trim(coalesce(p_description, '')), ''), v_user_id, p_parent_group_id, 'private', 'active')
  returning * into v_group;

  insert into public.group_members (group_id, user_id, role)
  values (v_group.id, v_user_id, 'owner');
  return v_group;
end;
$$;

revoke all on function public.create_sub_group(uuid, text, text) from public, anon;
grant execute on function public.create_sub_group(uuid, text, text) to authenticated;

create or replace function public.refresh_group_lifecycle()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_group_id uuid := coalesce(new.group_id, old.group_id);
begin
  update public.groups g
  set status = case
    when (select count(*) from public.group_members gm where gm.group_id = v_group_id) >= 3 then 'active'
    else 'forming'
  end,
  updated_at = now()
  where g.id = v_group_id and g.parent_group_id is null and g.status <> 'archived';
  return coalesce(new, old);
end;
$$;

drop trigger if exists group_members_refresh_lifecycle on public.group_members;
create trigger group_members_refresh_lifecycle
after insert or delete on public.group_members
for each row execute function public.refresh_group_lifecycle();

revoke all on function public.refresh_group_lifecycle() from public, anon, authenticated;

update public.groups g
set status = case
  when g.parent_group_id is not null then 'active'
  when (select count(*) from public.group_members gm where gm.group_id = g.id) >= 3 then 'active'
  else 'forming'
end
where g.status <> 'archived';
