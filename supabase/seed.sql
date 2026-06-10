-- Staging / production migration seed.
-- Temp password for all users: Welkom2026!
-- Run automatically on: supabase db reset
--
-- Users migrated from apotheekhulp.be (June 2026):
--   admin:           adriaan@manengo.be
--   assistenten:     14 active, 3 inactive (TEST accounts excluded)
--   apotheken:       15 active (TEST accounts excluded)
--
-- No links or shifts — configure per environment after reset.

-- ── Auth users ────────────────────────────────────────────────────────────────

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, confirmation_token, recovery_token,
  email_change_token_new, email_change, raw_app_meta_data,
  raw_user_meta_data, created_at, updated_at
) values
  -- Admin
  (
    'fa4db4d7-8186-4b43-b883-97f9c02f138f',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'adriaan@manengo.be', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"admin"}',
    '{"email_verified":true}', now(), now()
  ),
  -- ── Actieve assistenten ───────────────────────────────────────────────────
  (
    '102b89a4-8e7a-4ef9-acf3-12177bc6a31b',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'mayaabdo220@gmail.com', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"assistent"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    '3781f16d-e4f1-422d-8874-39508e3756dd',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'bram.clement@hotmail.com', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"assistent"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    '7203906f-b4b8-470a-94fc-5534a6e08ab9',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'ldrrg100@proton.me', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"assistent"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    'fb40d127-11ce-4b68-8828-b851f4e0724d',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'doliaulon@yahoo.com', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"assistent"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    'a522d654-4a21-46d7-ba93-dc44198b1bb9',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'antar.mohamad999@gmail.com', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"assistent"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    'f49014be-e314-46d7-85f1-2fb21f51b817',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'kakina13@wp.pl', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"assistent"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    '9797cd19-3514-4a42-a8d9-6d628785a7d2',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'shivsagar_2011@hotmail.com', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"assistent"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    '9471a711-f639-4387-9ad4-5dfeddf432d6',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'rohaertveronique@hotmail.com', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"assistent"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    '3116bd53-932e-43fe-bcb6-c6efb4452d87',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'santiagogomez.victoria@gmail.com', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"assistent"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    'e4b208c5-81d2-4704-a8e3-619dc344838e',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'ikramtaouil@hotmail.be', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"assistent"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    '48731158-51cd-472b-ab14-76507e738ceb',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'vanessa@voedselwijs.be', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"assistent"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    '251729d9-c542-4d78-b405-3396137f97ee',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'cvds21@hotmail.com', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"assistent"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    '9d0885f3-236a-45c9-89f6-c8583bfdc12c',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'louise.vanoosthuysse@gmail.com', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"assistent"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    '167946bf-c685-41f2-bd6b-a61b632c3306',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'charlottevanzaelen@hotmail.com', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"assistent"}',
    '{"email_verified":true}', now(), now()
  ),
  -- ── Inactieve assistenten ─────────────────────────────────────────────────
  (
    'a3817a5e-3407-4dfc-8624-8776a5a4887c',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    '50.zahra.50@gmail.com', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"assistent"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    '4dfb8725-5e53-46f2-8db4-e5ed8ded4489',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'emilie.herzeel@outlook.com', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"assistent"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    '752240b8-b4ea-41b1-8361-90ebd6ea2612',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'fleur.huyge@icloud.com', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"assistent"}',
    '{"email_verified":true}', now(), now()
  ),
  -- ── Apotheken ─────────────────────────────────────────────────────────────
  (
    '25b62af3-dde1-4706-99b6-fdbe9b7109a0',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'pieterdebecker@hotmail.com', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"apotheek"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    '8aa45290-1c3f-4573-95ca-d262920e65f5',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'apotheek.jelle.van.laecken@skynet.be', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"apotheek"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    'acc6cabc-cf50-4884-a9ac-02bfd20c049e',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'lieve.vanachter@skynet.be', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"apotheek"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    '73187d2f-9a52-4dc3-acb4-17e0030d9494',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'yelle.corrynen@hotmail.com', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"apotheek"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    '79ac50d3-7881-48e2-91db-b02eb47b9538',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'suppliers@phoenixbelgium.be', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"apotheek"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    'b77d93b7-d05b-4d3b-83d9-3861c86f4582',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'bruno@apotheekdedeyne.be', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"apotheek"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    '9b9eacc7-f6ed-4e94-b078-e3415e084d30',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'info@shpharma.be', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"apotheek"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    '77793938-f095-45ca-86f7-3ca59cd8d203',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'facturatie@apotheekverfaillie.be', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"apotheek"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    'f845435a-8e32-44e1-b77f-0c7ed93e7dfb',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'lauren.verstraete@medi-market.be', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"apotheek"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    'e5cfb262-6e36-4eb2-8e83-b8accb77aa18',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'apotheekgroenenhoek@gmail.com', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"apotheek"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    '6502552b-e9d9-4a47-ac97-37c9b5ae3443',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'info@apotheekvanhuysse.be', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"apotheek"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    'dc740e98-3190-4973-b444-f3b46e1b501d',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'apotheek.rodenbach@telenet.be', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"apotheek"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    '752de282-5eb9-4e44-a532-701f76dd7f5c',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'invoices.apo@goed.be', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"apotheek"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    'f3d6723c-4146-4a7d-8570-f28bb0ff2a6a',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'facturatie@coopapotheken.be', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"apotheek"}',
    '{"email_verified":true}', now(), now()
  ),
  (
    'e4a8623a-0f4c-4879-954a-0208d1dd5bb3',
    '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'suppliers@phoenixbelgium.be2', extensions.crypt('Welkom2026!', extensions.gen_salt('bf')),
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"],"role":"apotheek"}',
    '{"email_verified":true}', now(), now()
  );

-- ── Admin profile ─────────────────────────────────────────────────────────────
update public.users set first_name = 'Adriaan', last_name = 'De Bolle', phone = '+32 494 99 61 82'
  where id = 'fa4db4d7-8186-4b43-b883-97f9c02f138f';

-- ── Assistent names, phones, colors ──────────────────────────────────────────
update public.users set first_name = 'Maya',      last_name = 'Abdo',           phone = '0466/48.48.11',  color = '#3788d8'
  where id = '102b89a4-8e7a-4ef9-acf3-12177bc6a31b';
update public.users set first_name = 'Bram',      last_name = 'Clement',        phone = '0476/582278',    color = '#28a745'
  where id = '3781f16d-e4f1-422d-8874-39508e3756dd';
update public.users set first_name = 'Liesbeth',  last_name = 'Desmet',         phone = '0475/20.13.69',  color = '#fd7e14'
  where id = '7203906f-b4b8-470a-94fc-5534a6e08ab9';
update public.users set first_name = 'Aulon',     last_name = 'Doli',           phone = '0472/83.91.33',  color = '#6f42c1'
  where id = 'fb40d127-11ce-4b68-8828-b851f4e0724d';
update public.users set first_name = 'Antar',     last_name = 'Mohamad',        phone = '0493857976',     color = '#e83e8c'
  where id = 'a522d654-4a21-46d7-ba93-dc44198b1bb9';
update public.users set first_name = 'Karolina',  last_name = 'Poniedzialek',   phone = '0496331279',     color = '#20c997'
  where id = 'f49014be-e314-46d7-85f1-2fb21f51b817';
update public.users set first_name = 'Cherien',   last_name = 'Ramharakh',      phone = '+32485041123',   color = '#ffc107'
  where id = '9797cd19-3514-4a42-a8d9-6d628785a7d2';
update public.users set first_name = 'Véronique', last_name = 'Rohaert',        phone = null,             color = '#dc3545'
  where id = '9471a711-f639-4387-9ad4-5dfeddf432d6';
update public.users set first_name = 'Victoria',  last_name = 'Santiago Gomez', phone = '0488/43.50.80',  color = '#17a2b8'
  where id = '3116bd53-932e-43fe-bcb6-c6efb4452d87';
update public.users set first_name = 'Ikram',     last_name = 'Taouil',         phone = '0485404164',     color = '#6c757d'
  where id = 'e4b208c5-81d2-4704-a8e3-619dc344838e';
update public.users set first_name = 'Vanessa',   last_name = 'Van Boxem',      phone = '0476/266262',    color = '#007bff'
  where id = '48731158-51cd-472b-ab14-76507e738ceb';
update public.users set first_name = 'Carolien',  last_name = 'Van der Sypt',   phone = '0472579116',     color = '#795548'
  where id = '251729d9-c542-4d78-b405-3396137f97ee';
update public.users set first_name = 'Louise',    last_name = 'Vanoosthuysse',  phone = '0475/68.17.63',  color = '#4caf50'
  where id = '9d0885f3-236a-45c9-89f6-c8583bfdc12c';
update public.users set first_name = 'Charlotte', last_name = 'Van Zaelen',     phone = '0497/357879',    color = '#ff5722'
  where id = '167946bf-c685-41f2-bd6b-a61b632c3306';

-- Inactieve assistenten
update public.users set first_name = 'Zahraa',  last_name = 'Buni',    phone = '0491/87.55.61', is_active = false
  where id = 'a3817a5e-3407-4dfc-8624-8776a5a4887c';
update public.users set first_name = 'Emilie',  last_name = 'Herzeel', phone = '0472/81.34.34', is_active = false
  where id = '4dfb8725-5e53-46f2-8db4-e5ed8ded4489';
update public.users set first_name = 'Fleur',   last_name = 'Huyge',   phone = '0474/808707',   is_active = false
  where id = '752240b8-b4ea-41b1-8361-90ebd6ea2612';

-- ── Apotheek phone numbers ────────────────────────────────────────────────────
update public.users set phone = '053/77.43.17'  where id = '8aa45290-1c3f-4573-95ca-d262920e65f5'; -- Jelle Van Laecken
update public.users set phone = '0472579116'    where id = '79ac50d3-7881-48e2-91db-b02eb47b9538'; -- BENU NV
update public.users set phone = '093741727'     where id = 'b77d93b7-d05b-4d3b-83d9-3861c86f4582'; -- Dedeyne
update public.users set phone = '051/40.06.85'  where id = '77793938-f095-45ca-86f7-3ca59cd8d203'; -- Verfaillie
update public.users set phone = '0496/58.67.79' where id = 'f845435a-8e32-44e1-b77f-0c7ed93e7dfb'; -- Medi-Market
update public.users set phone = '03/321.20.92'  where id = 'e5cfb262-6e36-4eb2-8e83-b8accb77aa18'; -- Groenenhoek
update public.users set phone = '052/44.40.07'  where id = '6502552b-e9d9-4a47-ac97-37c9b5ae3443'; -- Vanhuysse

-- ── Assistent profiles ────────────────────────────────────────────────────────
insert into public.assistant_profiles (user_id, vat_number, vat_liable, company_name, street, house_number, postcode, city) values
  ('102b89a4-8e7a-4ef9-acf3-12177bc6a31b', 'BE1011553018',    true,  'MAYA ABDO',               'Ledebaan',              '71/0001',    '9300', 'Aalst'),
  ('3781f16d-e4f1-422d-8874-39508e3756dd', '1021804829',      false, 'aBCL',                    'Antwerpsesteenweg',     '355',        '9040', 'Sint-Amandsberg'),
  ('7203906f-b4b8-470a-94fc-5534a6e08ab9', null,              true,  null,                      null,                    null,         null,   null),
  ('fb40d127-11ce-4b68-8828-b851f4e0724d', null,              true,  null,                      null,                    null,         null,   null),
  ('a522d654-4a21-46d7-ba93-dc44198b1bb9', '0804.542.546',    true,  'Mohamad Antar',           'Lanestraat',            '113A 5',     '3090', 'Overijse'),
  ('f49014be-e314-46d7-85f1-2fb21f51b817', 'BE1013269918',    true,  'KAROLINA PONIEDZIALEK',   'Hekkenstraat',          '16',         '8720', 'Wakken'),
  ('9797cd19-3514-4a42-a8d9-6d628785a7d2', 'BE1011.614.285',  true,  'Cherien Ramharakh',       'Schoolstraat',          '183',        '9100', 'Sint-Niklaas'),
  ('9471a711-f639-4387-9ad4-5dfeddf432d6', 'BE 1035596744',   true,  'Coachinique',             'Koestraat',             '43',         '3270', 'Scherpenheuvel'),
  ('3116bd53-932e-43fe-bcb6-c6efb4452d87', 'BE 1023.009.213', false, 'Victoria Santiago Gomez', 'Cellebroedersstraat',   '10 Bus1202', '2000', 'Antwerpen'),
  ('e4b208c5-81d2-4704-a8e3-619dc344838e', 'BE1011127505',    false, 'IKRAM TAOUIL',            'Balansstraat',          '122',        '2018', 'Antwerpen'),
  ('48731158-51cd-472b-ab14-76507e738ceb', 'BE0779319873',    true,  'Refrax BV',               'Oranjerielaan',         '10',         '9030', 'Mariakerke'),
  ('251729d9-c542-4d78-b405-3396137f97ee', 'BE1033578352',    true,  'Pharmaconsult VDS BV',    'Wanzelesteenweg',       '98',         '9260', 'Serskamp'),
  ('9d0885f3-236a-45c9-89f6-c8583bfdc12c', null,              false, null,                      null,                    null,         null,   null),
  ('167946bf-c685-41f2-bd6b-a61b632c3306', 'BE1012075234',    false, 'CVZ SERVICES',            'Boekhoutstraat',        '1',          '9860', 'Oosterzele'),
  -- Inactieve assistenten
  ('a3817a5e-3407-4dfc-8624-8776a5a4887c', 'BE1022572812',    true,  'BV Apotheekhulp',         'Kleine peperstraat',    '12bus0301',  '9100', 'Sint Niklaas'),
  ('4dfb8725-5e53-46f2-8db4-e5ed8ded4489', 'BE0538692270',    false, 'EMILIE HERZEEL',          'Sint Kamielstraat',     '3 bus 1',    '9300', 'Aalst'),
  ('752240b8-b4ea-41b1-8361-90ebd6ea2612', '1016.442.709',    false, 'FLEUR HUYGE',             'Polderstraat',          '21',         '9820', 'Merelbeke');

-- ── Apotheek profiles ─────────────────────────────────────────────────────────
insert into public.pharmacy_profiles (user_id, company_name, vat_number, vat_liable, billing_street, billing_house_number, billing_postcode, billing_city) values
  ('25b62af3-dde1-4706-99b6-fdbe9b7109a0', 'Apham NV',                           'BE0414.244.042',  true, 'Antwerpsesteenweg',    '182',  '2660', 'Hoboken'),
  ('8aa45290-1c3f-4573-95ca-d262920e65f5', 'Apotheek Jelle Van Laecken (BV)',     'BE 0690.886.260', true, 'Nieuwstraat',          '33',   '9280', 'Lebbeke'),
  ('acc6cabc-cf50-4884-a9ac-02bfd20c049e', 'Apotheek Vanachter (BV)',             'BE0425.070.133',  true, 'Eikerlandstraat',      '8',    '2870', 'Puurs-Sint-Amands'),
  ('73187d2f-9a52-4dc3-acb4-17e0030d9494', 'Apotheek Generaal',                  'BE0426.481.482',  true, 'Generaal Lemanstraat', '10',   '2600', 'Berchem'),
  ('79ac50d3-7881-48e2-91db-b02eb47b9538', 'BENU NV',                            'BE0436.826.929',  true, 'Avenue Pasteur',       '2',    '1300', 'Waver'),
  ('b77d93b7-d05b-4d3b-83d9-3861c86f4582', 'Apotheek Dedeyne (NV)',              'BE0423.665.415',  true, 'Hoefijzer',            '1',    '9880', 'Aalter'),
  ('9b9eacc7-f6ed-4e94-b078-e3415e084d30', 'S&H Pharma',                         'BE0835.699.342',  true, 'Loofblommestraat',     '55',   '9051', 'Sint-Denijs-Westrem'),
  ('77793938-f095-45ca-86f7-3ca59cd8d203', 'Apotheek Verfaillie (NV)',            'BE0444.210.609',  true, 'Ieperstraat',          '3/5',  '8700', 'Tielt'),
  ('f845435a-8e32-44e1-b77f-0c7ed93e7dfb', 'Pharmacies by Medi-Market Group SA', 'BE0548.663.375',  true, 'Rue de l''industrie',  '8',    '1400', 'Nivelles'),
  ('e5cfb262-6e36-4eb2-8e83-b8accb77aa18', 'Apotheek Groenenhoek BV',            'BE0447279767',    true, 'Dianalaan',            '174',  '2600', 'Berchem'),
  ('6502552b-e9d9-4a47-ac97-37c9b5ae3443', 'Apotheek Vanhuysse (BVBA)',          'BE0422465104',    true, 'Cesar Meeusstraat',    '6-8',  '9240', 'Zele'),
  ('dc740e98-3190-4973-b444-f3b46e1b501d', 'Apotheek F. Rodenbach (BV)',         'BE0458.238.688',  true, 'Dorpsstraat',          '51',   '9870', 'Zulte'),
  ('752de282-5eb9-4e44-a532-701f76dd7f5c', 'Popelin BV',                         'BE1004.967.609',  true, 'Antwerpsesteenweg',    '263',  '2800', 'Mechelen'),
  ('f3d6723c-4146-4a7d-8570-f28bb0ff2a6a', 'cvso COOP-apotheken',                'BE0421.598.226',  true, 'Nieuwevaart',          '151',  '9000', 'Gent'),
  ('e4a8623a-0f4c-4879-954a-0208d1dd5bb3', 'VOCAPHAR NV',                        'BE1016.797.055',  true, 'Grote straat',         '38',   '9500', 'Geraardsbergen');

-- ── Locations (één hoofdvestiging per apotheek) ───────────────────────────────
insert into public.locations (id, pharmacy_id, name, address) values
  ('71651831-5006-4636-91eb-869d0857bc16', '25b62af3-dde1-4706-99b6-fdbe9b7109a0', 'Hoofdvestiging', 'Antwerpsesteenweg 182, 2660 Hoboken'),
  ('6d86dcfa-841d-4634-8b24-ffc4dfe3972b', '8aa45290-1c3f-4573-95ca-d262920e65f5', 'Hoofdvestiging', 'Nieuwstraat 33, 9280 Lebbeke'),
  ('c9637f25-e3c7-4cfb-8b1a-4ed5f908969a', 'acc6cabc-cf50-4884-a9ac-02bfd20c049e', 'Hoofdvestiging', 'Eikerlandstraat 8, 2870 Puurs-Sint-Amands'),
  ('2c5b9d04-a55d-4954-8eab-8a21a3277fbb', '73187d2f-9a52-4dc3-acb4-17e0030d9494', 'Hoofdvestiging', 'Generaal Lemanstraat 10, 2600 Berchem'),
  ('c6751652-7959-4f68-9ac6-24207408c777', '79ac50d3-7881-48e2-91db-b02eb47b9538', 'Hoofdvestiging', 'Avenue Pasteur 2, 1300 Waver'),
  ('c551f414-e0dd-44c2-970c-91e48219bc69', 'b77d93b7-d05b-4d3b-83d9-3861c86f4582', 'Hoofdvestiging', 'Hoefijzer 1, 9880 Aalter'),
  ('409cc116-6d8e-4ead-8ca1-a579e71098c9', '9b9eacc7-f6ed-4e94-b078-e3415e084d30', 'Hoofdvestiging', 'Loofblommestraat 55, 9051 Sint-Denijs-Westrem'),
  ('7c08e66b-2de0-4bda-b8e1-0f660fcdf543', '77793938-f095-45ca-86f7-3ca59cd8d203', 'Hoofdvestiging', 'Ieperstraat 3/5, 8700 Tielt'),
  ('b48efadb-5c3c-4b3f-aaef-4620c25b158c', 'f845435a-8e32-44e1-b77f-0c7ed93e7dfb', 'Hoofdvestiging', 'Rue de l''industrie 8, 1400 Nivelles'),
  ('627965f2-f32b-4957-96de-46ea7b93fab4', 'e5cfb262-6e36-4eb2-8e83-b8accb77aa18', 'Hoofdvestiging', 'Dianalaan 174, 2600 Berchem'),
  ('783da3b8-442a-4f44-be98-9ae8d9228838', '6502552b-e9d9-4a47-ac97-37c9b5ae3443', 'Hoofdvestiging', 'Cesar Meeusstraat 6-8, 9240 Zele'),
  ('a78636f7-6dda-4521-ba6d-f43ae9a9a467', 'dc740e98-3190-4973-b444-f3b46e1b501d', 'Hoofdvestiging', 'Dorpsstraat 51, 9870 Zulte'),
  ('1b67b93b-3b69-401e-b276-105657dc1c70', '752de282-5eb9-4e44-a532-701f76dd7f5c', 'Hoofdvestiging', 'Antwerpsesteenweg 263, 2800 Mechelen'),
  ('b6b51283-0ead-49e6-928d-7d05e388afad', 'f3d6723c-4146-4a7d-8570-f28bb0ff2a6a', 'Hoofdvestiging', 'Nieuwevaart 151, 9000 Gent'),
  ('eaa88f0f-d7d2-45b0-a526-d137ade3e5fd', 'e4a8623a-0f4c-4879-954a-0208d1dd5bb3', 'Hoofdvestiging', 'Grote straat 38, 9500 Geraardsbergen');

-- ── Platform config ───────────────────────────────────────────────────────────
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
