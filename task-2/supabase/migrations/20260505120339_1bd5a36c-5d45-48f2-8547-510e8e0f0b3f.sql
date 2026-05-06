
-- Enums
create type public.host_role as enum ('host', 'checker');
create type public.event_visibility as enum ('public', 'unlisted');
create type public.event_status as enum ('draft', 'published');
create type public.rsvp_status as enum ('going', 'waitlist', 'cancelled', 'checked_in');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  contact_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles readable by all" on public.profiles for select using (true);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "users insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Hosts (organizer entities)
create table public.hosts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  logo_url text,
  bio text,
  contact_email text,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.hosts enable row level security;
create policy "hosts readable by all" on public.hosts for select using (true);
create policy "authenticated users create hosts" on public.hosts for insert with check (auth.uid() = created_by);

-- Host members
create table public.host_members (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.hosts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.host_role not null,
  created_at timestamptz not null default now(),
  unique (host_id, user_id, role)
);
alter table public.host_members enable row level security;

-- Helper: is user a member of host with given role
create or replace function public.is_host_member(_user_id uuid, _host_id uuid, _role public.host_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.host_members where user_id = _user_id and host_id = _host_id and role = _role);
$$;

create or replace function public.is_host_member_any(_user_id uuid, _host_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.host_members where user_id = _user_id and host_id = _host_id);
$$;

create policy "members readable by host members" on public.host_members for select using (
  public.is_host_member_any(auth.uid(), host_id)
);
create policy "host role can manage members" on public.host_members for all using (
  public.is_host_member(auth.uid(), host_id, 'host')
) with check (
  public.is_host_member(auth.uid(), host_id, 'host')
);

-- Allow host creator to bootstrap themselves as first host member
create policy "self insert as host on own created host" on public.host_members for insert with check (
  auth.uid() = user_id and exists (select 1 from public.hosts h where h.id = host_id and h.created_by = auth.uid())
);

-- Hosts update policy now that helper exists
create policy "host members update host" on public.hosts for update using (
  public.is_host_member(auth.uid(), id, 'host')
);
create policy "host members delete host" on public.hosts for delete using (
  public.is_host_member(auth.uid(), id, 'host')
);

-- Events
create table public.events (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.hosts(id) on delete cascade,
  slug text unique not null,
  title text not null,
  description text,
  cover_image_url text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  timezone text not null default 'UTC',
  venue_address text,
  online_url text,
  capacity int not null default 100 check (capacity >= 0),
  visibility public.event_visibility not null default 'public',
  status public.event_status not null default 'draft',
  is_paid boolean not null default false,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.events enable row level security;
create policy "published events readable by all" on public.events for select using (
  status = 'published' or public.is_host_member_any(auth.uid(), host_id)
);
create policy "host role manages events" on public.events for all using (
  public.is_host_member(auth.uid(), host_id, 'host')
) with check (
  public.is_host_member(auth.uid(), host_id, 'host')
);

create index events_host_id_idx on public.events(host_id);
create index events_start_at_idx on public.events(start_at);
create index events_status_visibility_idx on public.events(status, visibility);

-- RSVPs
create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status public.rsvp_status not null default 'going',
  qr_code text not null default replace(gen_random_uuid()::text, '-', ''),
  waitlist_position int,
  checked_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, user_id)
);
alter table public.rsvps enable row level security;
create index rsvps_event_id_idx on public.rsvps(event_id);
create index rsvps_user_id_idx on public.rsvps(user_id);
create unique index rsvps_qr_code_uidx on public.rsvps(qr_code);

create policy "users see own rsvps" on public.rsvps for select using (auth.uid() = user_id);
create policy "host members see event rsvps" on public.rsvps for select using (
  exists (select 1 from public.events e where e.id = event_id and public.is_host_member_any(auth.uid(), e.host_id))
);
create policy "users create own rsvps" on public.rsvps for insert with check (auth.uid() = user_id);
create policy "users update own rsvps" on public.rsvps for update using (auth.uid() = user_id);
create policy "host members update event rsvps" on public.rsvps for update using (
  exists (select 1 from public.events e where e.id = event_id and public.is_host_member_any(auth.uid(), e.host_id))
);

-- Updated_at triggers
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_set_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger hosts_set_updated before update on public.hosts for each row execute function public.set_updated_at();
create trigger events_set_updated before update on public.events for each row execute function public.set_updated_at();
create trigger rsvps_set_updated before update on public.rsvps for each row execute function public.set_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, contact_email)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)), new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- RSVP capacity & waitlist logic
create or replace function public.handle_rsvp_capacity() returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_capacity int;
  v_going_count int;
begin
  if new.status = 'going' then
    select capacity into v_capacity from public.events where id = new.event_id;
    select count(*) into v_going_count from public.rsvps
      where event_id = new.event_id and status in ('going', 'checked_in')
        and (tg_op = 'INSERT' or id <> new.id);
    if v_going_count >= v_capacity then
      new.status := 'waitlist';
      select coalesce(max(waitlist_position), 0) + 1 into new.waitlist_position
        from public.rsvps where event_id = new.event_id and status = 'waitlist';
    else
      new.waitlist_position := null;
    end if;
  end if;
  return new;
end; $$;

create trigger rsvps_capacity_check before insert on public.rsvps for each row execute function public.handle_rsvp_capacity();

-- Promote next waitlist on cancellation
create or replace function public.promote_waitlist() returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_next_id uuid;
  v_capacity int;
  v_going_count int;
begin
  if (tg_op = 'UPDATE' and old.status = 'going' and new.status = 'cancelled')
     or (tg_op = 'DELETE' and old.status = 'going') then
    select capacity into v_capacity from public.events where id = coalesce(new.event_id, old.event_id);
    select count(*) into v_going_count from public.rsvps
      where event_id = coalesce(new.event_id, old.event_id) and status in ('going', 'checked_in');
    if v_going_count < v_capacity then
      select id into v_next_id from public.rsvps
        where event_id = coalesce(new.event_id, old.event_id) and status = 'waitlist'
        order by waitlist_position asc nulls last, created_at asc limit 1;
      if v_next_id is not null then
        update public.rsvps set status = 'going', waitlist_position = null where id = v_next_id;
      end if;
    end if;
  end if;
  return coalesce(new, old);
end; $$;

create trigger rsvps_promote_after_update after update on public.rsvps for each row execute function public.promote_waitlist();
create trigger rsvps_promote_after_delete after delete on public.rsvps for each row execute function public.promote_waitlist();
