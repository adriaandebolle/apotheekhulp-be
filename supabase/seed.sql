-- Local dev seed — DO NOT use in production.
-- Password for all seed users: admin123
-- Run automatically on: supabase db reset

-- ── Seed users ───────────────────────────────────────────────────────────────
-- adriaan@manengo.be   role: admin
-- assistent@test.be    role: assistent
-- apotheek@test.be     role: apotheek

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values (
  'fa4db4d7-8186-4b43-b883-97f9c02f138f',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'adriaan@manengo.be',
  extensions.crypt('admin123', extensions.gen_salt('bf')),
  now(),
  '',
  '',
  '',
  '',
  '{"provider":"email","providers":["email"],"role":"admin"}',
  '{"email_verified":true}',
  now(),
  now()
);
-- The on_auth_user_created trigger auto-inserts into public.users with the matching role

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmation_token, recovery_token,
  email_change_token_new, email_change, raw_app_meta_data,
  raw_user_meta_data, created_at, updated_at
) values (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'assistent@test.be',
  extensions.crypt('admin123', extensions.gen_salt('bf')),
  now(), '', '', '', '',
  '{"provider":"email","providers":["email"],"role":"assistent"}',
  '{"email_verified":true}',
  now(), now()
);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmation_token, recovery_token,
  email_change_token_new, email_change, raw_app_meta_data,
  raw_user_meta_data, created_at, updated_at
) values (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'apotheek@test.be',
  extensions.crypt('admin123', extensions.gen_salt('bf')),
  now(), '', '', '', '',
  '{"provider":"email","providers":["email"],"role":"apotheek"}',
  '{"email_verified":true}',
  now(), now()
);
