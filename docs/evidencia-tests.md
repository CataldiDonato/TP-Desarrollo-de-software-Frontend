# Evidencia de ejecución de tests — Frontend

Fecha de ejecución: 06/10/2026 12:40

## Tests unitarios (Vitest) — `npm test`

| Archivo | Qué prueba |
|---|---|
| `src/components/common/Modal.test.jsx` | **Test de componente**: el modal muestra título y contenido, se cierra con la X y con el fondo, y no se cierra al tocar adentro |
| `src/utils/formato.test.js` | Formato de precios y lectura del mensaje de error del backend |

```
 RUN  v5.0.3 /home/donatocataldi/repos/tp-dsw/Frontend
 Test Files  2 passed (2)
      Tests  9 passed (9)
   Start at  12:41:01
   Duration  2.63s (environment 68%, import 16%, tests 11%, transform 5%)
```

## Test end-to-end (Playwright) — `npm run test:e2e`

Abre la app en un navegador real (Chromium) y la usa como una persona: login fallido, login del administrador, navegación y alta + baja de una categoría, y protección de rutas sin sesión.

```
Running 3 tests using 1 worker
  ✓  1 e2e/flujo-admin.spec.js:15:1 › con una contraseña incorrecta muestra el error y no entra (924ms)
  ✓  2 e2e/flujo-admin.spec.js:22:1 › el administrador entra, ve el resumen y hace el CRUD de una categoría (1.7s)
  ✓  3 e2e/flujo-admin.spec.js:46:1 › un usuario sin sesión que entra a una pantalla protegida va al login (688ms)
  3 passed (4.3s)
```
