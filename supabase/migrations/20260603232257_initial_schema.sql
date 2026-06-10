-- ============================================================
-- public.users
-- ============================================================
create table public.users (
  id          uuid        primary key references auth.users(id) on delete cascade,
  role        text        not null check (role in ('admin', 'assistent', 'apotheek')),
  email       text,
  first_name  text,
  last_name   text,
  phone       text,
  avatar_url  text,
  color       text,
  is_active   boolean     not null default true,
  ical_token  uuid        unique not null default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.users (id, role, email)
  values (
    new.id,
    coalesce(new.raw_app_meta_data->>'role', 'assistent'),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.users enable row level security;

create policy "user can read own row"
  on public.users for select using (id = auth.uid());

create policy "admins can read all users"
  on public.users for select
  using (((auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin');

create policy "user can update own row"
  on public.users for update using (id = auth.uid());

create policy "admins can update any user"
  on public.users for update
  using (((auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin');


-- ============================================================
-- assistant_profiles
-- ============================================================
create table public.assistant_profiles (
  user_id             uuid    primary key references public.users(id) on delete cascade,
  vat_number          text,
  vat_liable          boolean not null default false,
  company_name        text,
  street              text,
  house_number        text,
  postcode            text,
  city                text,
  iban                text,
  invoice_prefix      text,
  invoice_next_number integer not null default 1,
  updated_at          timestamptz not null default now()
);

alter table public.assistant_profiles enable row level security;

create policy "assistant can read own profile"
  on public.assistant_profiles for select using (user_id = auth.uid());

create policy "admins can read all assistant profiles"
  on public.assistant_profiles for select
  using (((auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin');

create policy "assistant can update own profile"
  on public.assistant_profiles for update using (user_id = auth.uid());

create policy "admins can update any assistant profile"
  on public.assistant_profiles for update
  using (((auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin');

create policy "admins can insert assistant profiles"
  on public.assistant_profiles for insert
  with check (((auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin');


-- ============================================================
-- pharmacy_profiles
-- ============================================================
create table public.pharmacy_profiles (
  user_id              uuid primary key references public.users(id) on delete cascade,
  vat_number           text,
  vat_liable           boolean not null default false,
  company_name         text,
  billing_street       text,
  billing_house_number text,
  billing_postcode     text,
  billing_city         text,
  updated_at           timestamptz not null default now()
);

alter table public.pharmacy_profiles enable row level security;

create policy "pharmacy can read own profile"
  on public.pharmacy_profiles for select using (user_id = auth.uid());

create policy "admins can read all pharmacy profiles"
  on public.pharmacy_profiles for select
  using (((auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin');

create policy "pharmacy can update own profile"
  on public.pharmacy_profiles for update using (user_id = auth.uid());

create policy "admins can update any pharmacy profile"
  on public.pharmacy_profiles for update
  using (((auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin');

create policy "admins can insert pharmacy profiles"
  on public.pharmacy_profiles for insert
  with check (((auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin');


-- ============================================================
-- locations
-- ============================================================
create table public.locations (
  id          uuid        primary key default gen_random_uuid(),
  pharmacy_id uuid        not null references public.pharmacy_profiles(user_id) on delete cascade,
  name        text        not null,
  address     text,
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

alter table public.locations enable row level security;

create policy "admins can manage locations"
  on public.locations for all
  using (((auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin');

create policy "pharmacy can read own locations"
  on public.locations for select using (pharmacy_id = auth.uid() and deleted_at is null);

create policy "assistants can read active locations"
  on public.locations for select
  using (
    is_active = true
    and deleted_at is null
    and ((auth.jwt() -> 'app_metadata' ->> 'role')) = 'assistent'
  );


-- ============================================================
-- links
-- ============================================================
create table public.links (
  id                    uuid    primary key default gen_random_uuid(),
  assistant_id          uuid    not null references public.users(id) on delete cascade,
  location_id           uuid    not null references public.locations(id) on delete cascade,
  hourly_rate_assistant numeric(8,2),
  hourly_rate_pharmacy  numeric(8,2),
  km_allowance              numeric(8,4),
  distance_km               numeric(8,2),
  auto_confirm_assistent    boolean not null default false,
  auto_confirm_apotheek     boolean not null default false,
  deleted_at                timestamptz,
  unique (assistant_id, location_id)
);

alter table public.links enable row level security;

create policy "admins can manage links"
  on public.links for all
  using (((auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin');

create policy "assistant can read own links"
  on public.links for select using (assistant_id = auth.uid() and deleted_at is null);


-- ============================================================
-- shifts
-- ============================================================
create table public.shifts (
  id            uuid    primary key default gen_random_uuid(),
  assistant_id  uuid    references public.users(id),
  location_id   uuid    not null references public.locations(id),
  date          date    not null,
  start_time    time    not null,
  end_time      time    not null,
  break_minutes integer not null default 0,
  status        text    not null default 'pending_assistant'
                check (status in ('pending_assistant', 'pending_apotheek', 'approved', 'denied')),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

alter table public.shifts enable row level security;

create policy "admins can manage all shifts"
  on public.shifts for all
  using (((auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin');

create policy "assistant can read own shifts"
  on public.shifts for select using (assistant_id = auth.uid() and deleted_at is null);

create policy "assistant can update own pending shifts"
  on public.shifts for update
  using (assistant_id = auth.uid() and status = 'pending_assistant' and deleted_at is null);

create policy "pharmacy can read shifts at own locations"
  on public.shifts for select
  using (
    deleted_at is null
    and location_id in (
      select id from public.locations where pharmacy_id = auth.uid() and deleted_at is null
    )
  );


-- ============================================================
-- messages
-- ============================================================
create table public.messages (
  id                 uuid    primary key default gen_random_uuid(),
  title              text    not null,
  body               text    not null,
  show_as_popup      boolean not null default false,
  notify_assistants  boolean not null default false,
  notify_pharmacies  boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "admins can manage messages"
  on public.messages for all
  using (((auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin');

create policy "assistants can read messages"
  on public.messages for select
  using (((auth.jwt() -> 'app_metadata' ->> 'role')) = 'assistent');

create policy "pharmacies can read messages"
  on public.messages for select
  using (((auth.jwt() -> 'app_metadata' ->> 'role')) = 'apotheek');


-- ============================================================
-- message_reads  (per-user read tracking for badge counters)
-- ============================================================
create table public.message_reads (
  user_id     uuid        not null references public.users(id) on delete cascade,
  message_id  uuid        not null references public.messages(id) on delete cascade,
  read_at     timestamptz not null default now(),
  primary key (user_id, message_id)
);

alter table public.message_reads enable row level security;

create policy "users can read own message reads"
  on public.message_reads for select
  using (auth.uid() = user_id);

create policy "users can insert own message reads"
  on public.message_reads for insert
  with check (auth.uid() = user_id);


-- ============================================================
-- platform_config  (singleton — one row, id always = 1)
-- ============================================================
create table public.platform_config (
  id                           integer      primary key default 1 check (id = 1),
  km_rate                      numeric(6,4) not null default 0.4326,
  vat_rate                     numeric(5,2) not null default 21.00,
  default_hourly_rate_assistant numeric(8,2) not null default 0.00,
  default_hourly_rate_pharmacy  numeric(8,2) not null default 0.00,
  invoice_prefix               text         not null default '2026',
  invoice_next_number          integer      not null default 1,
  company_name                 text         not null default 'Apotheekhulp',
  company_street               text         not null default 'Wanzelesteenweg 98',
  company_city                 text         not null default '9260 Serskamp',
  company_phone                text         not null default '0494/99.61.82',
  company_email                text         not null default 'info@apotheekhulp.be',
  company_vat                  text         not null default 'BE1010.352.295',
  updated_at                   timestamptz  not null default now()
);

insert into public.platform_config (id) values (1);

alter table public.platform_config enable row level security;

create policy "admins can manage platform config"
  on public.platform_config for all
  using (((auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin');

create policy "authenticated can read platform config"
  on public.platform_config for select
  using (auth.uid() is not null);

-- ============================================================
-- assistant_availability
-- ============================================================
create table public.assistant_availability (
  id            uuid        primary key default gen_random_uuid(),
  assistant_id  uuid        not null references public.users(id) on delete cascade,
  day_of_week   smallint    not null check (day_of_week between 0 and 6), -- 0 = Mon … 6 = Sun
  created_at    timestamptz not null default now(),
  unique(assistant_id, day_of_week)
);

alter table public.assistant_availability enable row level security;

create policy "admins can manage availability"
  on public.assistant_availability for all
  using (((auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin');

create policy "assistants can manage own availability"
  on public.assistant_availability for all
  using (assistant_id = auth.uid());


-- ============================================================
-- invoices
-- ============================================================
create table public.invoices (
  id             uuid          primary key default gen_random_uuid(),
  invoice_number text          not null,
  invoice_date   date          not null,
  type           text          not null check (type in ('assistent', 'apotheek')),
  recipient_id   uuid          not null references public.users(id),
  status         text          not null default 'te_betalen'
                               check (status in ('te_betalen', 'betaald')),
  subtotal       numeric(10,2) not null,
  vat_amount     numeric(10,2) not null,
  total          numeric(10,2) not null,
  notes          text,
  created_at     timestamptz   not null default now(),
  updated_at     timestamptz   not null default now()
);

alter table public.shifts
  add column assistent_invoice_id uuid references public.invoices(id) on delete set null,
  add column apotheek_invoice_id  uuid references public.invoices(id) on delete set null;

alter table public.invoices enable row level security;

create policy "admins can manage invoices"
  on public.invoices for all
  using (((auth.jwt() -> 'app_metadata' ->> 'role')) = 'admin');

create policy "assistent can read own invoices"
  on public.invoices for select
  using (type = 'assistent' and recipient_id = auth.uid());

-- ── iCal public RPC ───────────────────────────────────────────────────────────
-- Called by calendar apps without a user session; uses SECURITY DEFINER to
-- bypass RLS while exposing only the data needed for a calendar feed.
-- Returns >= 1 row for a valid ical_token (shift_id NULL when no shifts yet),
-- or 0 rows for an unknown token, so the caller can distinguish the two cases.
create or replace function public.get_ical_shifts(p_token text)
returns table (
  shift_id       uuid,
  shift_date     text,
  start_time     text,
  end_time       text,
  break_minutes  int,
  status         text,
  location_name  text,
  company_name   text,
  user_first     text,
  user_last      text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
begin
  begin
    select id into v_user_id
    from public.users
    where ical_token = p_token::uuid
      and role = 'assistent'
    limit 1;
  exception when others then
    return; -- malformed UUID
  end;

  if v_user_id is null then return; end if;

  return query
    select
      s.id,
      s.date,
      s.start_time,
      s.end_time,
      s.break_minutes,
      s.status,
      l.name,
      pp.company_name,
      u.first_name,
      u.last_name
    from public.users u
    left join public.shifts s
      on  s.assistant_id = u.id
      and s.status in ('approved', 'pending_apotheek')
      and s.deleted_at is null
    left join public.locations l on l.id = s.location_id
    left join public.pharmacy_profiles pp on pp.user_id = l.pharmacy_id
    where u.id = v_user_id
    order by s.date;
end;
$$;

grant execute on function public.get_ical_shifts(text) to anon;

-- Ensure PostgREST can access all tables via the Data API
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;
grant execute on all functions in schema public to anon, authenticated;
grant select on all tables in schema public to anon;

-- ============================================================
-- Performance indexes
-- ============================================================

-- shifts: most queries filter on status + deleted_at + date range
create index shifts_approved_active_date_idx
  on public.shifts (date desc)
  where status = 'approved' and deleted_at is null;

-- uninvoiced filter per side
create index shifts_uninvoiced_assistent_idx
  on public.shifts (assistant_id, date)
  where status = 'approved' and deleted_at is null and assistent_invoice_id is null;

create index shifts_uninvoiced_apotheek_idx
  on public.shifts (location_id, date)
  where status = 'approved' and deleted_at is null and apotheek_invoice_id is null;

-- general lookups by assistant / location when browsing all statuses
create index shifts_assistant_id_idx on public.shifts (assistant_id);
create index shifts_location_id_idx  on public.shifts (location_id);

-- FK indexes for invoice joins
create index invoices_assistent_fk_idx on public.shifts (assistent_invoice_id);
create index invoices_apotheek_fk_idx  on public.shifts (apotheek_invoice_id);

-- invoices: filtered by type + date range, joined by recipient
create index invoices_type_date_idx on public.invoices (type, invoice_date desc);
create index invoices_recipient_idx on public.invoices (recipient_id);

-- locations: pharmacy → location lookups
create index locations_pharmacy_deleted_idx on public.locations (pharmacy_id, deleted_at);

-- links: rate and active-link lookups
create index links_assistant_location_idx on public.links (assistant_id, location_id);
create index links_deleted_idx            on public.links (deleted_at);

-- Distinct approved months for the month-picker dropdown
create or replace function public.get_shift_months()
returns table (month text)
language sql stable security definer
set search_path = public
as $$
  select distinct to_char(date, 'YYYY-MM') as month
  from public.shifts
  where status = 'approved' and deleted_at is null
  order by month desc;
$$;
grant execute on function public.get_shift_months() to authenticated;
