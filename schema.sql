-- ESQUEMA NUEVO V3. EJECUTAR UNA SOLA VEZ EN SUPABASE (SQL Editor), previa revisión institucional.
-- Para una instancia creada con v2, usar migration_v2_to_v3.sql en vez de borrar tablas.
create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_code text not null check (event_code ~ '^[A-Z0-9_-]{2,48}$'),
  visit_reason text not null check (visit_reason in ('aprendices','practicas_collahuasi','informacion_fundacion','otro')),
  visit_reason_other text check (char_length(visit_reason_other) <= 120),
  familiarity smallint not null check (familiarity between 0 and 5),
  clarity smallint not null check (clarity between 0 and 5),
  image_perception smallint not null check (image_perception between 0 and 5),
  age_years smallint check (age_years between 14 and 100),
  age_range text not null check (age_range in ('menor_18','18_24','25_34','35_44','45_54','55_mas','sin_respuesta')),
  gender text not null check (gender in ('mujer','hombre','otra_identidad','prefiero_no_responder')),
  comment text check (char_length(comment) <= 500),
  constraint visit_reason_other_consistent check (
    (visit_reason = 'otro' and char_length(btrim(coalesce(visit_reason_other,''))) between 3 and 120)
    or (visit_reason <> 'otro' and visit_reason_other is null)
  ),
  constraint age_group_consistent check (
    (age_years is null and age_range = 'sin_respuesta')
    or (age_years between 14 and 17 and age_range = 'menor_18')
    or (age_years between 18 and 24 and age_range = '18_24')
    or (age_years between 25 and 34 and age_range = '25_34')
    or (age_years between 35 and 44 and age_range = '35_44')
    or (age_years between 45 and 54 and age_range = '45_54')
    or (age_years between 55 and 100 and age_range = '55_mas')
  )
);
create table if not exists public.contact_optins (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_code text not null check (event_code ~ '^[A-Z0-9_-]{2,48}$'),
  email text not null check (char_length(email) between 3 and 254 and position('@' in email) > 1),
  consent_version text not null check (char_length(consent_version) between 2 and 40)
);
create table if not exists public.staff_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists survey_event_date_idx on public.survey_responses(event_code,created_at desc);
create index if not exists survey_event_reason_idx on public.survey_responses(event_code,visit_reason);
create index if not exists contacts_event_date_idx on public.contact_optins(event_code,created_at desc);
alter table public.survey_responses enable row level security;
alter table public.contact_optins enable row level security;
alter table public.staff_users enable row level security;
revoke all on table public.survey_responses from anon, authenticated;
revoke all on table public.contact_optins from anon, authenticated;
revoke all on table public.staff_users from anon, authenticated;
grant insert on table public.survey_responses to anon, authenticated;
grant insert on table public.contact_optins to anon, authenticated;
grant select on table public.survey_responses to authenticated;
grant select on table public.contact_optins to authenticated;
grant select on table public.staff_users to authenticated;
drop policy if exists "survey_public_insert" on public.survey_responses;
create policy "survey_public_insert" on public.survey_responses for insert to anon, authenticated with check (true);
drop policy if exists "contacts_public_insert" on public.contact_optins;
create policy "contacts_public_insert" on public.contact_optins for insert to anon, authenticated with check (true);
drop policy if exists "staff_own_membership" on public.staff_users;
create policy "staff_own_membership" on public.staff_users for select to authenticated using (user_id = (select auth.uid()));
drop policy if exists "staff_read_surveys" on public.survey_responses;
create policy "staff_read_surveys" on public.survey_responses for select to authenticated using (
  exists (select 1 from public.staff_users s where s.user_id = (select auth.uid()))
);
drop policy if exists "staff_read_contacts" on public.contact_optins;
create policy "staff_read_contacts" on public.contact_optins for select to authenticated using (
  exists (select 1 from public.staff_users s where s.user_id = (select auth.uid()))
);
-- Las comprobaciones de la base de datos protegen la consistencia, NO impiden bots ni envíos repetidos.
-- PARA PRODUCCIÓN: proteger el endpoint de inserción con una función de servidor y controles de abuso.
-- Autorizar cuentas del equipo manualmente: INSERT INTO public.staff_users(user_id) VALUES ('UUID-DEL-USUARIO');
