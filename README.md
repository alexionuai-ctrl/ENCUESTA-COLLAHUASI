# Encuesta de ferias laborales · Fundación Collahuasi

**Estado: prototipo funcional de frontend con modo demostración.** No se ha publicado, conectado a cuentas institucionales ni probado con personas reales. Los datos del dashboard en demo son sintéticos. No se han validado empíricamente los ítems ni la duración.

## Qué incluye esta versión

- `index.html`: encuesta responsive con **6 preguntas obligatorias** y comentario opcional.
- `admin.html`: dashboard de gestión con filtros, indicadores y exportación a Excel.
- `assets/`: logotipos e imágenes entregadas por el usuario para la interfaz.
- `app.js`: captura de respuestas y módulo independiente de contacto voluntario.
- `dashboard.js`: cálculo de indicadores, filtros, autenticación y exportaciones.
- `schema.sql`: estructura nueva de base de datos (v3).
- `migration_v1_to_v2.sql`: migración histórica ya existente.
- `migration_v2_to_v3.sql`: agrega medición de imagen a instalaciones v2.

## Decisión metodológica clave

Esta versión distingue **tres cosas diferentes**:

1. **Conocimiento previo** de Fundación Collahuasi.
2. **Claridad de la orientación** recibida en el stand.
3. **Imagen general** que deja la Fundación.

Por eso **no** se usa una sola pregunta tipo “¿Qué nota le pondrías a Collahuasi del 1 al 7?” como indicador principal. Una nota global puede mezclar reputación previa, desconocimiento de la Fundación y experiencia del stand. Aquí la imagen se mide por separado y con opción:

- `No tengo suficiente información para evaluarla`

Eso evita forzar opinión donde no existe base suficiente.

## Preguntas del formulario

1. Antes de acercarte al stand, ¿qué sabías de Fundación Collahuasi?
2. ¿Cuál fue el principal motivo por el que te acercaste al stand?
3. ¿Qué tan clara fue la orientación que recibiste hoy?
4. Con la información que tienes ahora, ¿qué imagen general te deja Fundación Collahuasi?
5. ¿Qué edad tienes? (años cumplidos)
6. ¿Con qué género te identificas?
7. Comentario opcional.

## Ver la DEMO

Publica los archivos en GitHub Pages o ábrelos mediante un servidor estático. Con `config.js` vacío, el sitio muestra **MODO DEMO**: el formulario no guarda información y `admin.html` usa respuestas simuladas claramente identificadas como ficticias.

## Configurar almacenamiento real

1. Crear proyecto Supabase en cuenta administrada por la organización.
2. Si es una base nueva, ejecutar `schema.sql`.
3. Si ya habías desplegado la v2, ejecutar `migration_v2_to_v3.sql` tras hacer respaldo.
4. Crear usuario administrativo en Supabase Authentication.
5. Autorizar su UUID en `public.staff_users`.
6. Completar `supabaseUrl`, `supabasePublishableKey`, `privacyUrl` y `privacyContact` en `config.js`.
7. Activar GitHub Pages y publicar el repositorio.
8. Probar envíos, login, restricciones de lectura y exportación.

## Estructura visual

Se utilizan los recursos visuales proporcionados por el usuario:

- `logo_fundacion_collahuasi_naranja.png`
- `logo_collahuasi_verde.png`
- `camion_vista_d.jpeg`
- `camion_vista_1.jpeg`

Si el área de comunicaciones exige otra identidad visual, solo debes reemplazar los archivos de `assets/` conservando los mismos nombres.

## Exportación Excel

El panel exporta:

- `Resumen`
- `Respuestas`
- `Comentarios`
- `Contactos` (en descarga separada)

La exportación no implica sincronización permanente con un Excel local; se genera al hacer clic.

## Advertencias

- Este proyecto es un MVP, no una solución completa de seguridad productiva.
- GitHub Pages solo publica la interfaz; el guardado real depende de Supabase.
- El panel puede leer todas las respuestas del evento para usuarios autorizados.
- Las respuestas son voluntarias y no representan automáticamente a toda la feria.
- Antes de producción deben validarse los textos, el aviso de privacidad y el flujo de consentimiento.
