create table if not exists public.group_join_requests (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  unique (group_id, user_id)
);

create index if not exists group_join_requests_group_status_idx on public.group_join_requests (group_id, status);
create index if not exists group_join_requests_user_id_idx on public.group_join_requests (user_id);

alter table public.group_join_requests enable row level security;

create policy group_join_requests_requester_select on public.group_join_requests
  for select to authenticated using (user_id = (select auth.uid()));
create policy group_join_requests_manager_select on public.group_join_requests
  for select to authenticated using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = group_join_requests.group_id
        and gm.user_id = (select auth.uid())
        and gm.role in ('owner', 'admin')
    )
  );

-- Membership mutations only occur through the checked functions below.
drop policy if exists group_members_insert_admins on public.group_members;
drop policy if exists group_members_update_admins on public.group_members;
drop policy if exists group_members_delete_admins on public.group_members;

drop policy if exists invites_member_manage on public.invites;

create or replace function public.create_group_invite(p_group_id uuid)
returns public.invites
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_invite public.invites;
begin
  if not exists (
    select 1 from public.group_members gm
    where gm.group_id = p_group_id and gm.user_id = v_user_id and gm.role in ('owner', 'admin')
  ) then
    raise exception 'Only an Owner or Admin can create an invite' using errcode = '42501';
  end if;
  insert into public.invites (group_id, code, created_by, expires_at)
  values (
    p_group_id,
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
    v_user_id,
    now() + interval '7 days'
  )
  returning * into v_invite;
  return v_invite;
end;
$$;

create or replace function public.set_group_member_role(p_group_id uuid, p_user_id uuid, p_role text)
returns public.group_members
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_actor_role text;
  v_member public.group_members;
begin
  select role into v_actor_role from public.group_members where group_id = p_group_id and user_id = v_actor;
  if v_actor_role is null then raise exception 'You are not a member of this Link' using errcode = '42501'; end if;
  if p_role not in ('admin', 'member') then raise exception 'Only admin and member roles can be assigned' using errcode = '22023'; end if;
  if v_actor_role <> 'owner' then raise exception 'Only the Owner can change roles' using errcode = '42501'; end if;
  if p_user_id = v_actor then raise exception 'The Owner role cannot be changed here' using errcode = '22023'; end if;
  update public.group_members
  set role = p_role
  where group_id = p_group_id and user_id = p_user_id
  returning * into v_member;
  if v_member.group_id is null then raise exception 'Member not found' using errcode = 'P0002'; end if;
  return v_member;
end;
$$;

create or replace function public.remove_group_member(p_group_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_actor_role text;
  v_target_role text;
begin
  select role into v_actor_role from public.group_members where group_id = p_group_id and user_id = v_actor;
  select role into v_target_role from public.group_members where group_id = p_group_id and user_id = p_user_id;
  if v_target_role is null then raise exception 'Member not found' using errcode = 'P0002'; end if;
  if p_user_id = v_actor then
    if v_target_role = 'owner' then raise exception 'Transfer ownership before leaving this Link' using errcode = '22023'; end if;
  elsif v_actor_role not in ('owner', 'admin') then
    raise exception 'Only an Owner or Admin can remove members' using errcode = '42501';
  elsif v_target_role = 'owner' or (v_target_role = 'admin' and v_actor_role <> 'owner') then
    raise exception 'You cannot remove this member' using errcode = '42501';
  end if;
  delete from public.group_members where group_id = p_group_id and user_id = p_user_id;
end;
$$;

create or replace function public.request_to_join_group(p_group_id uuid)
returns public.group_join_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_request public.group_join_requests;
begin
  if not exists (
    select 1 from public.groups g
    where g.id = p_group_id and g.visibility = 'discoverable' and g.parent_group_id is null
  ) then
    raise exception 'This Link is not discoverable' using errcode = '42501';
  end if;
  if public.is_group_member(p_group_id, v_user_id) then
    raise exception 'You are already in this Link' using errcode = '22023';
  end if;
  insert into public.group_join_requests (group_id, user_id)
  values (p_group_id, v_user_id)
  on conflict (group_id, user_id) do update set status = 'pending', created_at = now(), reviewed_at = null, reviewed_by = null
  returning * into v_request;
  return v_request;
end;
$$;

create or replace function public.review_group_join_request(p_request_id uuid, p_approve boolean)
returns public.group_join_requests
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_request public.group_join_requests;
  v_count integer;
begin
  select * into v_request from public.group_join_requests where id = p_request_id for update;
  if v_request.id is null or v_request.status <> 'pending' then raise exception 'Pending join request not found' using errcode = 'P0002'; end if;
  if not exists (
    select 1 from public.group_members gm
    where gm.group_id = v_request.group_id and gm.user_id = v_actor and gm.role in ('owner', 'admin')
  ) then raise exception 'Only an Owner or Admin can review join requests' using errcode = '42501'; end if;
  if p_approve then
    perform 1 from public.groups where id = v_request.group_id for update;
    select count(*) into v_count from public.group_members where group_id = v_request.group_id;
    if v_count >= 10 then raise exception 'This Link already has 10 people' using errcode = '23514'; end if;
    insert into public.group_members (group_id, user_id, role)
    values (v_request.group_id, v_request.user_id, 'member')
    on conflict (group_id, user_id) do nothing;
  end if;
  update public.group_join_requests
  set status = case when p_approve then 'approved' else 'rejected' end,
      reviewed_at = now(), reviewed_by = v_actor
  where id = p_request_id
  returning * into v_request;
  return v_request;
end;
$$;

create or replace function public.list_discoverable_groups()
returns table (id uuid, name text, description text, member_count bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select g.id, g.name, g.description, count(gm.user_id)
  from public.groups g
  left join public.group_members gm on gm.group_id = g.id
  where g.visibility = 'discoverable' and g.parent_group_id is null
  group by g.id, g.name, g.description
  having count(gm.user_id) < 10;
$$;

revoke all on function public.create_group_invite(uuid), public.set_group_member_role(uuid, uuid, text), public.remove_group_member(uuid, uuid), public.request_to_join_group(uuid), public.review_group_join_request(uuid, boolean), public.list_discoverable_groups() from public, anon;
grant execute on function public.create_group_invite(uuid), public.set_group_member_role(uuid, uuid, text), public.remove_group_member(uuid, uuid), public.request_to_join_group(uuid), public.review_group_join_request(uuid, boolean), public.list_discoverable_groups() to authenticated;
