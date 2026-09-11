-- Crew profile avatars stay private: the owner can manage a file, and only people
-- sharing a Link with the owner can read its short-lived signed URL.
alter table public.profiles add column if not exists avatar_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

create schema if not exists private;

create or replace function private.can_access_avatar_path(p_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    split_part(p_name, '/', 1) = (select auth.uid()::text)
    or exists (
      select 1
      from public.group_members viewer
      join public.group_members avatar_owner on avatar_owner.group_id = viewer.group_id
      where viewer.user_id = (select auth.uid())
        and avatar_owner.user_id::text = split_part(p_name, '/', 1)
    );
$$;

revoke all on function private.can_access_avatar_path(text) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.can_access_avatar_path(text) to authenticated;

drop policy if exists "LinkUp private avatar reads" on storage.objects;
drop policy if exists "LinkUp private avatar uploads" on storage.objects;
drop policy if exists "LinkUp private avatar updates" on storage.objects;
drop policy if exists "LinkUp private avatar deletes" on storage.objects;

create policy "LinkUp private avatar reads" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and private.can_access_avatar_path(name));

create policy "LinkUp private avatar uploads" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and owner_id = (select auth.uid()::text)
    and split_part(name, '/', 1) = (select auth.uid()::text)
  );

create policy "LinkUp private avatar updates" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and owner_id = (select auth.uid()::text))
  with check (
    bucket_id = 'avatars'
    and owner_id = (select auth.uid()::text)
    and split_part(name, '/', 1) = (select auth.uid()::text)
  );

create policy "LinkUp private avatar deletes" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and owner_id = (select auth.uid()::text)
    and split_part(name, '/', 1) = (select auth.uid()::text)
  );
