-- ============================================================
-- public.users
-- One row per auth identity. Stores app-level fields that
-- auth.users cannot hold and that other tables need to JOIN.
-- Role is also in auth.users.app_metadata for JWT-only reads
-- (middleware), but kept here for RLS policies and DB queries.
-- ============================================================
create table public.users (
  id          uuid        primary key references auth.users(id) on delete cascade,
  role        text        not null check (role in ('admin', 'assistent', 'apotheek')),
  first_name  text,
  last_name   text,
  phone       text,
  avatar_url  text,
  color       text,       -- hex calendar color; used by assistants
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create public.users row on auth user insert (covers invite flow).
-- security definer + empty search_path per Supabase security guidance.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.users (id, role)
  values (
    new.id,
    coalesce(new.raw_app_meta_data->>'role', 'assistent')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.users enable row level security;

create policy "user can read own row"
  on public.users for select
  using (id = auth.uid());

create policy "admins can read all users"
  on public.users for select
  using (
    (select role from public.users where id = auth.uid()) = 'admin'
  );

create policy "user can update own row"
  on public.users for update
  using (id = auth.uid());

create policy "admins can update any user"
  on public.users for update
  using (
    (select role from public.users where id = auth.uid()) = 'admin'
  );


-- ============================================================
-- assistant_profiles
-- Extended data for assistants (freelance side).
-- ============================================================
create table public.assistant_profiles (
  user_id      uuid primary key references public.users(id) on delete cascade,
  vat_number   text,
  company_name text,
  address      text,
  iban         text,
  updated_at   timestamptz not null default now()
);

alter table public.assistant_profiles enable row level security;

create policy "assistant can read own profile"
  on public.assistant_profiles for select
  using (user_id = auth.uid());

create policy "admins can read all assistant profiles"
  on public.assistant_profiles for select
  using (
    (select role from public.users where id = auth.uid()) = 'admin'
  );

create policy "assistant can update own profile"
  on public.assistant_profiles for update
  using (user_id = auth.uid());

create policy "admins can update any assistant profile"
  on public.assistant_profiles for update
  using (
    (select role from public.users where id = auth.uid()) = 'admin'
  );

create policy "admins can insert assistant profiles"
  on public.assistant_profiles for insert
  with check (
    (select role from public.users where id = auth.uid()) = 'admin'
  );


-- ============================================================
-- pharmacy_profiles
-- Extended data for pharmacies.
-- ============================================================
create table public.pharmacy_profiles (
  user_id         uuid primary key references public.users(id) on delete cascade,
  vat_number      text,
  company_name    text,
  billing_address text,
  updated_at      timestamptz not null default now()
);

alter table public.pharmacy_profiles enable row level security;

create policy "pharmacy can read own profile"
  on public.pharmacy_profiles for select
  using (user_id = auth.uid());

create policy "admins can read all pharmacy profiles"
  on public.pharmacy_profiles for select
  using (
    (select role from public.users where id = auth.uid()) = 'admin'
  );

create policy "pharmacy can update own profile"
  on public.pharmacy_profiles for update
  using (user_id = auth.uid());

create policy "admins can update any pharmacy profile"
  on public.pharmacy_profiles for update
  using (
    (select role from public.users where id = auth.uid()) = 'admin'
  );

create policy "admins can insert pharmacy profiles"
  on public.pharmacy_profiles for insert
  with check (
    (select role from public.users where id = auth.uid()) = 'admin'
  );


-- ============================================================
-- locations
-- Pharmacy locations. One pharmacy can have multiple branches.
-- ============================================================
create table public.locations (
  id          uuid        primary key default gen_random_uuid(),
  pharmacy_id uuid        not null references public.pharmacy_profiles(user_id) on delete cascade,
  name        text        not null,
  address     text,
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now()
);

alter table public.locations enable row level security;

create policy "admins can manage locations"
  on public.locations for all
  using (
    (select role from public.users where id = auth.uid()) = 'admin'
  );

create policy "pharmacy can read own locations"
  on public.locations for select
  using (pharmacy_id = auth.uid());

create policy "assistants can read active locations"
  on public.locations for select
  using (
    is_active = true
    and (select role from public.users where id = auth.uid()) = 'assistent'
  );


-- ============================================================
-- links
-- Connects an assistant to a pharmacy location with pricing.
-- ============================================================
create table public.links (
  id                    uuid    primary key default gen_random_uuid(),
  assistant_id          uuid    not null references public.users(id) on delete cascade,
  location_id           uuid    not null references public.locations(id) on delete cascade,
  hourly_rate_assistant numeric(8,2),
  hourly_rate_pharmacy  numeric(8,2),
  km_allowance          numeric(8,2),
  distance_km           numeric(8,2),
  unique (assistant_id, location_id)
);

alter table public.links enable row level security;

create policy "admins can manage links"
  on public.links for all
  using (
    (select role from public.users where id = auth.uid()) = 'admin'
  );

create policy "assistant can read own links"
  on public.links for select
  using (assistant_id = auth.uid());


-- ============================================================
-- shifts
-- A single work shift assigned to an assistant at a location.
-- Status flow: pending_assistant → confirmed → pending_admin → approved
-- ============================================================
create table public.shifts (
  id            uuid    primary key default gen_random_uuid(),
  assistant_id  uuid    not null references public.users(id),
  location_id   uuid    not null references public.locations(id),
  date          date    not null,
  start_time    time    not null,
  end_time      time    not null,
  break_minutes integer not null default 0,
  status        text    not null default 'pending_assistant'
                check (status in ('pending_assistant', 'confirmed', 'pending_admin', 'approved')),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.shifts enable row level security;

create policy "admins can manage all shifts"
  on public.shifts for all
  using (
    (select role from public.users where id = auth.uid()) = 'admin'
  );

create policy "assistant can read own shifts"
  on public.shifts for select
  using (assistant_id = auth.uid());

create policy "assistant can update own pending shifts"
  on public.shifts for update
  using (
    assistant_id = auth.uid()
    and status = 'pending_assistant'
  );

create policy "pharmacy can read shifts at own locations"
  on public.shifts for select
  using (
    location_id in (
      select id from public.locations where pharmacy_id = auth.uid()
    )
  );


-- ============================================================
-- messages
-- Admin broadcasts to assistants (tariff changes, news).
-- show_as_popup: display as modal on first login after publish.
-- ============================================================
create table public.messages (
  id            uuid    primary key default gen_random_uuid(),
  title         text    not null,
  body          text    not null,
  show_as_popup boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "admins can manage messages"
  on public.messages for all
  using (
    (select role from public.users where id = auth.uid()) = 'admin'
  );

create policy "assistants can read messages"
  on public.messages for select
  using (
    (select role from public.users where id = auth.uid()) = 'assistent'
  );
