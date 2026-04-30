# Gestion de Reuniones

Aplicacion web estatica para administrar las reuniones de la Comision de Gestion de Proyectos de Escuela Dandelion.

La version publicada usa:

- `HTML + CSS + JavaScript` vanilla
- `Firebase Realtime Database` como persistencia compartida
- `GitHub Pages` como hosting del frontend

## Flujo operativo vigente

El sistema trabaja sobre tres estados:

1. `Inicio / Proxima reunion`
2. `Ultima reunion`
3. `Memoria institucional`

Reglas de negocio activas:

1. El orden del dia de la proxima reunion se edita en `Inicio`.
2. La edicion se bloquea los martes a las `16:00` en `America/Argentina/Cordoba`.
3. A las `18:00` del martes ocurre el rollover semanal automaticamente:
   - lo que estaba en `Ultima reunion` pasa a `Memoria institucional`
   - el orden del dia vigente pasa a `Ultima reunion`
   - `Inicio` queda apuntando a la reunion siguiente
   - el orden del dia de `Inicio` se resetea en blanco

## Estructura principal

- `index.html`: inicio y orden del dia de la proxima reunion
- `ultima-reunion.html`: carga de minuta de la reunion en curso o mas reciente
- `historico.html`: indice de memoria institucional
- `detalle-reunion.html`: detalle por reunion archivada
- `miembros.html`: agenda CRUD de miembros
- `print-agenda.html`: vista imprimible del orden del dia
- `print-acta.html`: vista imprimible del acta
- `js/config.js`: configuracion general y entorno
- `js/api.js`: acceso a datos, Firebase y rollover semanal
- `js/app.js`: render, interacciones y logica de UI

## Estado actual

- Persistencia remota activa con `useMocks: false`
- Agenda de miembros reutilizada para asistentes y responsables de accionables
- Actas con separacion por punto entre `Comentarios`, `Resolucion / salida` y `Accionables`
- Versiones imprimibles preparadas para papel / PDF
- `Memoria institucional` editable de forma controlada desde el detalle de cada reunion, con log de modificaciones

## Documentacion operativa

Ver [PROJECT_CONTEXT.md](./PROJECT_CONTEXT.md) para un resumen mas detallado del estado funcional actual, decisiones tomadas y proximos cuidados.
