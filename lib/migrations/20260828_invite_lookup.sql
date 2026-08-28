-- A code holder may preview one invite before joining without bypassing RLS broadly.
create or replace function public.get_group_invite(p_code text)
returns table (
  group_id uuid,
  code text,
  expires_at timestamptz,
  group_name text,
  group_description text
)
language sql
stable
security definer
set search_path = ''
as $$
  select i.group_id, i.code, i.expires_at, g.name, g.description
  from public.invites i
  join public.groups g on g.id = i.group_id
  where i.code = upper(trim(p_code))
    and (select auth.uid()) is not null
  limit 1;
$$;

revoke all on function public.get_group_invite(text) from public, anon;
grant execute on function public.get_group_invite(text) to authenticated;
