-- Local dev seed — DO NOT use in production.
-- Password for all seed users: admin123
-- Run automatically on: supabase db reset

-- ── Auth users ────────────────────────────────────────────────────────────────
-- adriaan@manengo.be   role: admin
-- maya@test.be         role: assistent
-- sophie@test.be       role: assistent
-- emma@test.be         role: assistent
-- pieter@test.be       role: assistent
-- apotheek@test.be     role: apotheek
-- apotheek2@test.be    role: apotheek

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmation_token, recovery_token,
  email_change_token_new, email_change, raw_app_meta_data,
  raw_user_meta_data, created_at, updated_at
) values
  (
    'fa4db4d7-8186-4b43-b883-97f9c02f138f',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'adriaan@manengo.be', extensions.crypt('admin123', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"admin"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'maya@test.be', extensions.crypt('admin123', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"assistent"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'sophie@test.be', extensions.crypt('admin123', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"assistent"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'emma@test.be', extensions.crypt('admin123', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"assistent"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'pieter@test.be', extensions.crypt('admin123', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"assistent"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'apotheek@test.be', extensions.crypt('admin123', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"apotheek"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'apotheek2@test.be', extensions.crypt('admin123', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"apotheek"}',
    '{"email_verified":true}', now(), now()
  );

-- ── Profile names & phones ────────────────────────────────────────────────────
update public.users set first_name = 'Adriaan', last_name = 'De Bolle',  phone = '+32 479 00 00 01'
  where id = 'fa4db4d7-8186-4b43-b883-97f9c02f138f';
update public.users set first_name = 'Maya',    last_name = 'Abdo',      phone = '+32 479 12 34 56'
  where id = '11111111-1111-1111-1111-111111111111';
update public.users set first_name = 'Sophie',  last_name = 'Laurent',   phone = '+32 478 23 45 67'
  where id = '33333333-3333-3333-3333-333333333333';
update public.users set first_name = 'Emma',    last_name = 'Claes',     phone = '+32 471 34 56 78'
  where id = '44444444-4444-4444-4444-444444444444';
update public.users set first_name = 'Pieter',  last_name = 'Willems',   phone = '+32 477 45 67 89', is_active = false
  where id = '55555555-5555-5555-5555-555555555555';
update public.users set phone = '+32 3 123 45 67'
  where id = '22222222-2222-2222-2222-222222222222';
update public.users set phone = '+32 9 987 65 43'
  where id = '66666666-6666-6666-6666-666666666666';

-- ── Pharmacy profiles ─────────────────────────────────────────────────────────
insert into public.pharmacy_profiles (user_id, company_name, vat_number, billing_street, billing_house_number, billing_postcode, billing_city) values
  ('22222222-2222-2222-2222-222222222222', 'Apotheek Centrum',   'BE 0123.456.789', 'Grote Markt',    '1',  '9000', 'Gent'),
  ('66666666-6666-6666-6666-666666666666', 'De Groene Apotheek', 'BE 0987.654.321', 'Stationstraat', '12', '2000', 'Antwerpen');

-- ── Assistent colors ──────────────────────────────────────────────────────────
update public.users set color = '#3788d8' where id = '11111111-1111-1111-1111-111111111111'; -- Maya
update public.users set color = '#28a745' where id = '33333333-3333-3333-3333-333333333333'; -- Sophie
update public.users set color = '#fd7e14' where id = '44444444-4444-4444-4444-444444444444'; -- Emma
update public.users set color = '#6f42c1' where id = '55555555-5555-5555-5555-555555555555'; -- Pieter

-- ── Locations ─────────────────────────────────────────────────────────────────
insert into public.locations (id, pharmacy_id, name, address) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'Hoofdvestiging', 'Grote Markt 1, 9000 Gent'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '66666666-6666-6666-6666-666666666666', 'Centraal',       'Stationstraat 12, 2000 Antwerpen');

-- ── Platform config — realistic default rates ────────────────────────────────
update public.platform_config set
  default_hourly_rate_assistant = 22.00,
  default_hourly_rate_pharmacy  = 27.00,
  invoice_prefix                = '2026',
  invoice_next_number           = 1,
  company_name                  = 'Apotheekhulp',
  company_street                = 'Wanzelesteenweg 98',
  company_city                  = '9260 Serskamp',
  company_phone                 = '0494/99.61.82',
  company_email                 = 'info@apotheekhulp.be',
  company_vat                   = 'BE1010.352.295';

-- ── Assistant profiles ────────────────────────────────────────────────────────
insert into public.assistant_profiles (user_id, vat_number, vat_liable, company_name, street, house_number, postcode, city, iban) values
  ('11111111-1111-1111-1111-111111111111', 'BE 0698.123.456', true,  'Maya Abdo BV',        'Korte Meer',    '7',  '9000', 'Gent',      'BE68 5390 0754 7034'),
  ('33333333-3333-3333-3333-333333333333', 'BE 0712.234.567', true,  'Laurent Consulting',  'Rue de la Loi', '20', '1000', 'Brussel',   'BE71 0689 9999 0101'),
  ('44444444-4444-4444-4444-444444444444', null,              false, null,                  'Antwerpseweg',  '55', '2800', 'Mechelen',  'BE56 7512 0612 5004'),
  ('55555555-5555-5555-5555-555555555555', 'BE 0765.345.678', true,  'Willems Interim',     'Veldstraat',    '3',  '9000', 'Gent',      'BE45 0689 1234 5678');

-- ── Pharmacy profiles — add vat_liable ───────────────────────────────────────
update public.pharmacy_profiles set vat_liable = true
  where user_id in ('22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666666');

-- ── Links (assistent ↔ locatie — with rates) ─────────────────────────────────
insert into public.links (assistant_id, location_id, hourly_rate_assistant, hourly_rate_pharmacy) values
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 23.00, 28.50),
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 21.50, 26.50),
  ('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 22.50, 27.50),
  ('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 22.00, 27.00),
  ('44444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 20.00, 25.00),
  ('44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 21.00, 26.00);

-- ── Shifts (June 2026) ────────────────────────────────────────────────────────
insert into public.shifts (assistant_id, location_id, date, start_time, end_time, break_minutes, status) values
  -- Maya — approved
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-06-02', '08:00', '17:00', 30, 'approved'),
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-06-05', '08:00', '13:00',  0, 'approved'),
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-06-09', '08:00', '17:00', 30, 'approved'),
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-06-16', '08:00', '17:00', 30, 'approved'),
  ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-06-23', '08:00', '17:00', 30, 'pending_apotheek'),
  -- Sophie — mix
  ('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-06-03', '09:00', '18:00', 30, 'approved'),
  ('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-06-04', '08:00', '13:00',  0, 'pending_assistant'),
  ('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-06-10', '09:00', '18:00', 30, 'approved'),
  ('33333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-06-17', '09:00', '18:00', 30, 'approved'),
  ('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-06-24', '09:00', '13:00',  0, 'pending_apotheek'),
  -- Emma — approved
  ('44444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-06-04', '08:00', '17:00', 30, 'approved'),
  ('44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-06-11', '08:00', '17:00', 30, 'approved'),
  ('44444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '2026-06-18', '08:00', '13:00',  0, 'pending_assistant'),
  ('44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2026-06-25', '08:00', '17:00', 30, 'approved');
