# Evidencia de ejecución de tests — Frontend

Fecha de ejecución: 22/10/2026 14:19

## Unitarios y de componente — `npm test` (Vitest + Testing Library)

Resultado: **18 tests, 18 pasan** en 3 archivos.

| Archivo | Tipo | Qué prueba |
|---|---|---|
| `src/components/common/Modal.test.jsx` | Unitario de **componente** | Título y contenido por props (input), aviso con `onCerrar` (output), no se cierra al tocar adentro |
| `src/models/modelos.test.js` | Unitario | Clases de modelo: `desdeApi`, métodos del dominio y `toApi()` |
| `src/utils/formato.test.js` | Unitario | Formato de precios y mensajes de error |

```
 ✓ src/utils/formato.test.js > formatearPrecio > formatea en pesos con separador de miles 2ms
 ✓ src/utils/formato.test.js > formatearPrecio > acepta precios que vienen como texto (Prisma devuelve los Decimal como string) 0ms
 ✓ src/utils/formato.test.js > formatearPrecio > si no hay precio muestra una raya 0ms
 ✓ src/utils/formato.test.js > mensajeDeError > usa el mensaje que mandó el backend 0ms
 ✓ src/utils/formato.test.js > mensajeDeError > si el backend no mandó mensaje usa el texto por defecto 0ms
 ✓ src/models/modelos.test.js > Modelo (factory method) > desdeApi crea una instancia de la subclase que lo llama 2ms
 ✓ src/models/modelos.test.js > Modelo (factory method) > conModelo convierte el data de una respuesta (lista u objeto) 0ms
 ✓ src/models/modelos.test.js > Comanda > arma los detalles como objetos y sabe qué se puede modificar 0ms
 ✓ src/models/modelos.test.js > ItemComanda (modelo de request) > calcula el subtotal y arma el detalle para POST /comandas 1ms
 ✓ src/models/modelos.test.js > ItemComanda (modelo de request) > sumar devuelve un ítem nuevo y no manda observaciones vacías 0ms
 ✓ src/models/modelos.test.js > toApi de los formularios > Producto convierte precio y categoría a número 0ms
 ✓ src/models/modelos.test.js > toApi de los formularios > Reserva manda la fecha en ISO y los números como números 0ms
 ✓ src/models/modelos.test.js > toApi de los formularios > Usuario solo manda la contraseña si se escribió una 1ms
 ✓ src/models/modelos.test.js > PedidoCocina > sabe a qué estado pasa y cuándo ya está listo 0ms
 ✓ src/components/common/Modal.test.jsx > Modal > muestra el título y el contenido que recibe por props 91ms
 ✓ src/components/common/Modal.test.jsx > Modal > llama a onCerrar al tocar el botón de cerrar 23ms
 ✓ src/components/common/Modal.test.jsx > Modal > llama a onCerrar al tocar el fondo oscuro 13ms
 ✓ src/components/common/Modal.test.jsx > Modal > NO se cierra al tocar algo de adentro del modal 12ms
 Test Files  3 passed (3)
      Tests  18 passed (18)
```

## End-to-end — `npm run test:e2e` (Playwright, Chromium)

Resultado: **4 tests, 4 pasan**. Corren contra el backend levantado con los datos del seed.

| Archivo | Qué prueba |
|---|---|
| `e2e/flujo-admin.spec.js` | Login fallido, login del admin, alta y baja de una categoría, ruta protegida sin sesión |
| `e2e/flujo-comanda.spec.js` | Circuito completo con los 3 roles: el mozo abre una mesa con observaciones, la cocina lo prepara y el mozo cobra |

```
  ✓  1 e2e/flujo-admin.spec.js:15:1 › con una contraseña incorrecta muestra el error y no entra (660ms)
  ✓  3 e2e/flujo-admin.spec.js:22:1 › el administrador entra, ve el resumen y hace el CRUD de una categoría (1.1s)
  ✓  2 e2e/flujo-comanda.spec.js:22:1 › el mozo abre una comanda, la cocina la prepara y el mozo la cobra (2.0s)
  ✓  4 e2e/flujo-admin.spec.js:46:1 › un usuario sin sesión que entra a una pantalla protegida va al login (329ms)
  4 passed (2.6s)
```
