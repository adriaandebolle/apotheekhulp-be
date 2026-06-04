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
insert into public.pharmacy_profiles (user_id, company_name, vat_number, billing_address) values
  ('22222222-2222-2222-2222-222222222222', 'Apotheek Centrum',     'BE 0123.456.789', 'Grote Markt 1, 9000 Gent'),
  ('66666666-6666-6666-6666-666666666666', 'De Groene Apotheek',   'BE 0987.654.321', 'Stationstraat 12, 2000 Antwerpen');
