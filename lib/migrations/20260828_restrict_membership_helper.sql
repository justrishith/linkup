-- RLS may use this helper, but signed-out clients must not call it as an RPC.
revoke all on function public.is_group_member(uuid, uuid) from public, anon;
grant execute on function public.is_group_member(uuid, uuid) to authenticated;
