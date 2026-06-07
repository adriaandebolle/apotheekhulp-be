-- Schedule the daily-digest edge function via pg_cron + pg_net.
-- Runs at 07:00 UTC (= 08:00 Brussels, CET/CEST).
--
-- Before applying in production, set these Supabase secrets:
--   supabase secrets set AWS_ACCESS_KEY_ID=...
--   supabase secrets set AWS_SECRET_ACCESS_KEY=...
--   supabase secrets set AWS_SES_REGION=eu-west-1
--   supabase secrets set EMAIL_FROM=noreply@apotheekhulp.be
--
-- Also replace the placeholders below with your production project values.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Remove existing schedule if re-running this migration
select cron.unschedule('daily-digest') where exists (
  select 1 from cron.job where jobname = 'daily-digest'
);

select cron.schedule(
  'daily-digest',
  '0 7 * * *',
  $$
  select net.http_post(
    url     := 'https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/daily-digest',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer <YOUR_SERVICE_ROLE_KEY>'
    ),
    body    := '{}'::jsonb
  ) as request_id;
  $$
);
