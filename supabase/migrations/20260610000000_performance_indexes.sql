-- Performance indexes

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

-- invoices: filtered by type + date range, joined by recipient
create index invoices_type_date_idx   on public.invoices (type, invoice_date desc);
create index invoices_recipient_idx   on public.invoices (recipient_id);
create index invoices_assistent_fk_idx on public.shifts (assistent_invoice_id);
create index invoices_apotheek_fk_idx  on public.shifts (apotheek_invoice_id);

-- locations: pharmacy → location lookups
create index locations_pharmacy_deleted_idx on public.locations (pharmacy_id, deleted_at);

-- links: rate and active-link lookups
create index links_assistant_location_idx on public.links (assistant_id, location_id);
create index links_deleted_idx            on public.links (deleted_at);

-- Replace the "fetch 2000 shifts to derive month list" query with a single distinct aggregation
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
