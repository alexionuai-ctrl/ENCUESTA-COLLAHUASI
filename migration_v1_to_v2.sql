-- MIGRACIÓN NO DESTRUCTIVA: utilizar en proyectos Supabase que YA tienen el schema.sql v1.
-- Hacer respaldo, revisar con TI y comprobar existencia de datos antes de ejecutar.
-- Conservar categorías históricas de género y rangos de edad: NO borrar respuestas previas.
ALTER TABLE public.survey_responses
  ADD COLUMN IF NOT EXISTS visit_reason text,
  ADD COLUMN IF NOT EXISTS visit_reason_other text,
  ADD COLUMN IF NOT EXISTS age_years smallint;
ALTER TABLE public.survey_responses
  ADD CONSTRAINT visit_reason_v2_values CHECK (visit_reason IS NULL OR visit_reason IN ('aprendices','practicas_collahuasi','informacion_fundacion','otro')),
  ADD CONSTRAINT visit_reason_v2_other CHECK (
    (visit_reason IS NULL AND visit_reason_other IS NULL)
    OR (visit_reason='otro' AND char_length(btrim(coalesce(visit_reason_other,''))) BETWEEN 3 AND 120)
    OR (visit_reason<>'otro' AND visit_reason_other IS NULL)
  ),
  ADD CONSTRAINT age_years_v2_valid CHECK (age_years IS NULL OR age_years BETWEEN 14 AND 100),
  ADD CONSTRAINT age_years_v2_group CHECK (
    age_years IS NULL
    OR (age_years BETWEEN 14 AND 17 AND age_range='menor_18')
    OR (age_years BETWEEN 18 AND 24 AND age_range='18_24')
    OR (age_years BETWEEN 25 AND 34 AND age_range='25_34')
    OR (age_years BETWEEN 35 AND 44 AND age_range='35_44')
    OR (age_years BETWEEN 45 AND 54 AND age_range='45_54')
    OR (age_years BETWEEN 55 AND 100 AND age_range='55_mas')
  );
CREATE INDEX IF NOT EXISTS survey_event_reason_idx ON public.survey_responses(event_code,visit_reason);
-- En v1 la ausencia de motivo/edad exacta es histórica: quedan NULL y así deben mostrarse.
-- No introducir falsos valores de edad ni motivos en registros antiguos.
-- Nota: este ALTER requiere ejecución solo una vez; no ejecutarlo repetidamente.
