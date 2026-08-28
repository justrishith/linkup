create schema if not exists private;

create or replace function private.can_access_photo_path(p_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when split_part(p_name, '/', 1) ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then exists (
        select 1
        from public.group_members gm
        where gm.group_id = split_part(p_name, '/', 1)::uuid
          and gm.user_id = (select auth.uid())
      )
    else false
  end;
$$;

revoke all on function private.can_access_photo_path(text) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.can_access_photo_path(text) to authenticated;

update storage.buckets
set public = false,
    file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'photos';

drop policy if exists "Linkup photo uploads" on storage.objects;
drop policy if exists "Linkup photo deletes" on storage.objects;
drop policy if exists "LinkUp private photo reads" on storage.objects;
drop policy if exists "LinkUp private photo uploads" on storage.objects;
drop policy if exists "LinkUp private photo updates" on storage.objects;
drop policy if exists "LinkUp private photo deletes" on storage.objects;

create policy "LinkUp private photo reads" on storage.objects
  for select to authenticated
  using (bucket_id = 'photos' and private.can_access_photo_path(name));

create policy "LinkUp private photo uploads" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'photos'
    and owner_id = (select auth.uid()::text)
    and private.can_access_photo_path(name)
  );

create policy "LinkUp private photo updates" on storage.objects
  for update to authenticated
  using (bucket_id = 'photos' and owner_id = (select auth.uid()::text))
  with check (
    bucket_id = 'photos'
    and owner_id = (select auth.uid()::text)
    and private.can_access_photo_path(name)
  );

create policy "LinkUp private photo deletes" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'photos'
    and owner_id = (select auth.uid()::text)
    and private.can_access_photo_path(name)
  );
