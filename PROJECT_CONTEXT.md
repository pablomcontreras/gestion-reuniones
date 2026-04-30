# Project Context

## Objetivo

Administrar:

- orden del dia de la proxima reunion
- carga de minuta de la reunion mas reciente
- resoluciones y accionables
- memoria institucional historica

La comision se reune los martes de `18:00` a `20:00` en `America/Argentina/Cordoba`.

## Stack real

- Frontend estatico: `HTML`, `CSS`, `JavaScript` vanilla
- Persistencia compartida: `Firebase Realtime Database`
- Hosting: `GitHub Pages`
- Repo fuente: `https://github.com/pablomcontreras/gestion-reuniones`

## Paginas

- `index.html`
  - muestra `Inicio`
  - contiene solo la proxima reunion y su orden del dia
  - enlaza a `Ultima reunion` y `Memoria institucional`
- `ultima-reunion.html`
  - permite cargar asistentes presentes
  - permite registrar comentarios, resoluciones y accionables por punto
- `historico.html`
  - lista reuniones archivadas
- `detalle-reunion.html`
  - muestra una reunion archivada punto por punto
  - por defecto es solo lectura
  - permite habilitar edicion y guardar un log de modificaciones
- `miembros.html`
  - CRUD simple de miembros
- `print-agenda.html`
  - formato limpio para impresion del orden del dia
- `print-acta.html`
  - formato limpio para impresion del acta

## Modelo de datos actual

### `nextAgenda`

- `points[]`
  - `title`
  - `description`

### `previousMeeting`

- `number`
- `dateLabel`
- `startTime`
- `status`
- `motivo`
- `attendees[]`
  - `memberId`
  - `mode` (`Presencial` o `Remota`)
- `items[]`
  - `title`
  - `treated`
  - `statusLabel` (`Tratado`, `Postergado`, `No tratado`)
  - `comments`
  - `resolution`
  - `hasActionables`
  - `actionables[]`
    - `description`
    - `memberId`
    - `done`

### `history`

Cada reunion archivada guarda:

- `id`
- `title`
- `date`
- `startTime`
- `attendees`
- `quorum`
- `status`
- `motivo`
- `items[]`
  - `title`
  - `status`
  - `comments`
  - `resolution`
  - `actionables`

### `meta`

- `lastRolloverMeetingKey`
  - evita ejecutar varias veces el rollover de una misma reunion semanal

## Logica de negocio vigente

### Bloqueo de orden del dia

- Se puede editar hasta el martes a las `16:00`
- Entre las `16:00` y las `00:00` del miercoles aparece el aviso de cierre
- A las `18:00` del martes ocurre el rollover semanal

### Rollover semanal

Implementado en `js/api.js`.

Cuando la app detecta que ya paso la hora de inicio de la reunion actual:

1. archiva `previousMeeting` en `history`
2. convierte `nextAgenda` en el nuevo `previousMeeting`
3. deja `nextAgenda` en blanco
4. marca la reunion como ya procesada en `meta.lastRolloverMeetingKey`

## Decisiones UX actuales

- La landing evita informacion tecnica y muestra solo lo indispensable
- `Ultima reunion` es la pantalla operativa para tomar minuta
- `Memoria institucional` es un indice; el detalle se consulta en pagina separada
- Las actas archivadas pueden corregirse desde su detalle, pero cada cambio exige autor y queda registrado
- Los asistentes se cargan desde la agenda de miembros
- La carga de asistentes usa un estado borrador para no perder filas nuevas antes de guardar

## Riesgos o cuidados al seguir iterando

- No volver a activar `useMocks` en produccion
- Si cambia la logica horaria del rollover, ajustar tanto `js/api.js` como `js/app.js`
- Si cambia la forma del modelo en Firebase, actualizar tambien las vistas imprimibles
- Mantener esta documentacion sincronizada con cada cambio de flujo importante
