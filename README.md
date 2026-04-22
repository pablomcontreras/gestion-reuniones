# Modulo Piloto

Base estatica para desarrollar el modulo de gestion de reuniones de la Comision de Gestion de Proyectos de Escuela Dandelion.

## Estructura

- `index.html`: shell principal del modulo con agenda proxima, reunion anterior e historico
- `styles/tokens.css`: variables de diseno compartibles
- `styles/layout.css`: layout base y comportamiento responsive
- `styles/module.css`: componentes del modulo
- `js/config.js`: configuracion del entorno
- `js/api.js`: capa de datos desacoplada
- `js/app.js`: render e interacciones

## Como seguir

1. Conectar `js/api.js` a una fuente real de reuniones, puntos y accionables.
2. Agregar formularios persistentes para alta, edicion y cierre de reuniones.
3. Cambiar `useMocks` a `false` cuando exista una API real.
4. Publicar esta carpeta en GitHub Pages o integrarla luego en el repo principal.
