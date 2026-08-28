-- RLS may use this helper for the calling user only. The second argument is
-- retained for compatibility with existing policies and transaction functions.
create or replace function public.is_group_member(target_group uuid, target_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select target_user = (select auth.uid())
    and exists (
      select 1
      from public.group_members gm
      where gm.group_id = target_group
        and gm.user_id = (select auth.uid())
    );
$$;

revoke all on function public.is_group_member(uuid, uuid) from public, anon;
grant execute on function public.is_group_member(uuid, uuid) to authenticated;
