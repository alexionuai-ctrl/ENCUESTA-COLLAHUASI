-- MIGRACIÓN NO DESTRUCTIVA: utilizar en proyectos Supabase que YA tienen la versión 2 del esquema.
-- Hacer respaldo, revisar con TI y comprobar existencia de datos antes de ejecutar.
ALTER TABLE public.survey_responses
  ADD COLUMN IF NOT EXISTS image_perception smallint;
ALTER TABLE public.survey_responses
  ALTER COLUMN image_perception SET DEFAULT NULL;
UPDATE public.survey_responses
SET image_perception = 0
WHERE image_perception IS NULL;
ALTER TABLE public.survey_responses
  ALTER COLUMN image_perception SET NOT NULL;
ALTER TABLE public.survey_responses
  ADD CONSTRAINT image_perception_v3_valid CHECK (image_perception BETWEEN 0 AND 5);
-- La asignación de 0 a registros antiguos significa: "sin información histórica para evaluar imagen".
