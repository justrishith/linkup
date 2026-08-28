-- Product foundation: Link privacy/sub-links, calendar voting, chat, proof, and points.
alter table public.groups add column if not exists visibility text not null default 'private';
alter table public.groups add column if not exists parent_group_id uuid references public.groups(id) on delete cascade;
alter table public.groups add column if not exists status text not null default 'forming';
alter table public.groups add column if not exists theme jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'groups_visibility_check') then
    alter table public.groups add constraint groups_visibility_check check (visibility in ('private', 'discoverable'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'groups_status_check') then
    alter table public.groups add constraint groups_status_check check (status in ('forming', 'active', 'archived'));
  end if;
end $$;

create index if not exists groups_parent_group_id_idx on public.groups (parent_group_id);
create index if not exists groups_visibility_idx on public.groups (visibility) where visibility = 'discoverable';

alter table public.idea_votes add column if not exists vote text not null default 'like';
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'idea_votes_vote_check') then
    alter table public.idea_votes add constraint idea_votes_vote_check check (vote in ('like', 'dislike', 'undecided'));
  end if;
end $$;

create table if not exists public.event_date_options (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_id, starts_at),
  check (ends_at is null or ends_at > starts_at)
);

create table if not exists public.event_date_votes (
  option_id uuid not null references public.event_date_options(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  vote text not null default 'undecided' check (vote in ('like', 'dislike', 'undecided')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (option_id, user_id)
);

create table if not exists public.group_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

alter table public.events add column if not exists verified_at timestamptz;

create table if not exists public.event_proofs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  photo_reference text not null,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create table if not exists public.point_ledger (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  user_id uuid not null references public.profiles(id) on delete cascade,
  points integer not null check (points > 0),
  reason text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists event_date_options_event_id_idx on public.event_date_options (event_id);
create index if not exists event_date_options_created_by_idx on public.event_date_options (created_by);
create index if not exists event_date_votes_user_id_idx on public.event_date_votes (user_id);
create index if not exists group_messages_group_created_idx on public.group_messages (group_id, created_at desc);
create index if not exists group_messages_user_id_idx on public.group_messages (user_id);
create index if not exists event_proofs_event_id_idx on public.event_proofs (event_id);
create index if not exists event_proofs_user_id_idx on public.event_proofs (user_id);
create index if not exists point_ledger_group_points_idx on public.point_ledger (group_id, points desc);
create index if not exists point_ledger_user_id_idx on public.point_ledger (user_id);
create index if not exists point_ledger_event_id_idx on public.point_ledger (event_id);

alter table public.event_date_options enable row level security;
alter table public.event_date_votes enable row level security;
alter table public.group_messages enable row level security;
alter table public.event_proofs enable row level security;
alter table public.point_ledger enable row level security;

create policy event_date_options_member_select on public.event_date_options
  for select to authenticated
  using (exists (select 1 from public.events e where e.id = event_id and public.is_group_member(e.group_id)));
create policy event_date_options_member_insert on public.event_date_options
  for insert to authenticated
  with check (created_by = (select auth.uid()) and exists (select 1 from public.events e where e.id = event_id and public.is_group_member(e.group_id)));
create policy event_date_options_member_update on public.event_date_options
  for update to authenticated
  using (exists (select 1 from public.events e where e.id = event_id and public.is_group_member(e.group_id)))
  with check (exists (select 1 from public.events e where e.id = event_id and public.is_group_member(e.group_id)));

create policy event_date_votes_member_select on public.event_date_votes
  for select to authenticated
  using (exists (select 1 from public.event_date_options o join public.events e on e.id = o.event_id where o.id = option_id and public.is_group_member(e.group_id)));
create policy event_date_votes_self_write on public.event_date_votes
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()) and exists (select 1 from public.event_date_options o join public.events e on e.id = o.event_id where o.id = option_id and public.is_group_member(e.group_id)));

create policy group_messages_member_select on public.group_messages
  for select to authenticated using (public.is_group_member(group_id));
create policy group_messages_self_insert on public.group_messages
  for insert to authenticated with check (user_id = (select auth.uid()) and public.is_group_member(group_id));
create policy group_messages_self_update on public.group_messages
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and public.is_group_member(group_id));
create policy group_messages_self_delete on public.group_messages
  for delete to authenticated using (user_id = (select auth.uid()));

create policy event_proofs_member_select on public.event_proofs
  for select to authenticated
  using (exists (select 1 from public.events e where e.id = event_id and public.is_group_member(e.group_id)));
create policy event_proofs_attendee_insert on public.event_proofs
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.events e where e.id = event_id and public.is_group_member(e.group_id))
    and exists (select 1 from public.event_members em where em.event_id = event_proofs.event_id and em.user_id = (select auth.uid()))
  );

create policy point_ledger_member_select on public.point_ledger
  for select to authenticated using (public.is_group_member(group_id));

create or replace function public.verify_event_from_proofs()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select count(distinct ep.user_id) from public.event_proofs ep where ep.event_id = new.event_id) >= 2 then
    update public.events
    set status = 'happened', verified_at = coalesce(verified_at, now()), updated_at = now()
    where id = new.event_id and verified_at is null;
  end if;
  return new;
end;
$$;

drop trigger if exists event_proofs_verify_event on public.event_proofs;
create trigger event_proofs_verify_event
after insert on public.event_proofs
for each row execute function public.verify_event_from_proofs();

revoke all on function public.verify_event_from_proofs() from public, anon, authenticated;
