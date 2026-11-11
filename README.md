# RestoFlow — Frontend

Interfaz web de RestoFlow para administradores, mozos y cocineros.

**Tecnologías:** React 19 · Vite · Tailwind CSS 4 · React Router · Axios · react-hot-toast · lucide-react (íconos)

## Requisitos

- Node.js 20 o superior
- El [backend](https://github.com/CataldiDonato/TP-Desarrollo-de-software-Backend) levantado

## Instalación paso a paso

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo .env con la dirección de la API
cp .env.example .env

# 3. Levantar en modo desarrollo
npm run dev
```

La app queda en `http://localhost:5000`. Para entrar, usá los usuarios de prueba que crea el backend con `npm run seed` (están en el README del backend).

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run build` | Genera la versión de producción en `dist/` |
| `npm run preview` | Sirve localmente la versión de producción |
| `npm run lint` | Revisa el código con ESLint |
| `npm test` | Tests unitarios (Vitest) |
| `npm run test:e2e` | Test end-to-end en un navegador real (Playwright) |

## Tests

| Archivo | Tipo | Qué prueba |
|---|---|---|
| `src/components/common/Modal.test.jsx` | Unitario de **componente** | El modal muestra título y contenido, se cierra con la X y con el fondo, y no se cierra al tocar adentro |
| `src/utils/formato.test.js` | Unitario | Formato de precios y mensajes de error |
| `e2e/flujo-admin.spec.js` | **End-to-end** | Login fallido, login del admin, navegación, alta y baja de una categoría, y protección de rutas |
| `src/models/modelos.test.js` | Unitario | Clases de modelo: construcción desde la API, métodos del dominio y `toApi()` |
| `e2e/flujo-comanda.spec.js` | **End-to-end** | Circuito completo con los 3 roles: el mozo abre una mesa con un pedido con observaciones, la cocina lo prepara y el mozo cobra |

**Antes de correr el e2e por primera vez:**

```bash
npx playwright install chromium   # baja el navegador que usa Playwright (una sola vez)
```

El e2e necesita el **backend levantado con el seed cargado** (`npm run seed`), porque entra con `admin@restoflow.com` / `admin1234`. Si en tu base ese usuario tiene otra contraseña, pasala por variable de entorno:

```bash
E2E_EMAIL=otro@mail.com E2E_PASSWORD=otraClave npm run test:e2e
```

El frontend lo levanta Playwright solo (o usa el que ya esté corriendo en el puerto 5000).

Evidencia de la última ejecución: [docs/evidencia-tests.md](docs/evidencia-tests.md).

## Qué puede hacer cada rol

| Pantalla | Administrador | Mozo | Cocinero |
|---|:-:|:-:|:-:|
| Home (dashboard) | ✔ | | |
| Mesas (ver, filtrar, detalle) | ✔ | ✔ | |
| Mesas (crear, editar, borrar) | ✔ | | |
| Reservas | ✔ | ✔ | |
| Comandas (abrir, agregar productos, cobrar; también con QR de Mercado Pago) | ✔ | ✔ | |
| Productos (ver, detalle con historial de precios) | ✔ | ✔ | |
| Productos (crear, editar, borrar) | ✔ | | |
| Categorías, Medios de pago, Usuarios | ✔ | | |
| Cocina KDS (ver) | ✔ | | ✔ |
| Cocina KDS (cambiar estado de platos) | | | ✔ |

Las rutas están protegidas por rol en `src/routes/AppRouter.jsx` (componente `RutaProtegida`). El backend vuelve a controlar los permisos en cada pedido.

La única ruta pública además del login es `/pago/resultado`: ahí vuelve el cliente desde Mercado Pago después de pagar. Solo muestra un mensaje; la comanda la cierra el backend.

## Cobro con Mercado Pago (QR)

En el detalle de una comanda abierta, **Cobrar con Mercado Pago (QR)** abre `PagoQrModal`:

1. Pide al backend el link de pago (`POST /comandas/:id/mercadopago`) y lo muestra como QR (`qrcode.react`).
2. El cliente lo escanea y paga desde el celular.
3. El modal consulta la comanda cada 3 segundos y, cuando el backend la marca como `Pagada` (por el webhook de MP), avisa y se cierra.

Si se agregan o quitan productos, hay que cerrar el modal y generar un QR nuevo. El medio `MercadoPago` no aparece en el cobro manual. Configuración y pruebas: [`Backend/docs/MERCADOPAGO.md`](../Backend/docs/MERCADOPAGO.md).

## Estructura

```
src/
├── components/
│   ├── common/Modal.jsx        # Ventana modal genérica que usan todos los formularios
│   └── layout/Navbar.jsx       # Barra de navegación (muestra los links según el rol)
├── context/AuthContext.jsx     # Sesión del usuario (token y datos) compartida en toda la app
├── models/                     # Clases de modelo (una por entidad) — ver "Modelos" más abajo
├── pages/                      # Una carpeta por pantalla: página + sus modales
├── routes/                     # Rutas y protección por rol
├── services/                   # Llamadas a la API con Axios (una por recurso)
├── utils/                      # Formato de precios y fechas, rutas por rol
└── index.css                   # Tailwind CSS: tokens del diseño y componentes reutilizables
```

### Patrón de cada pantalla (CRUD)

1. **Servicio** (`services/x.service.js`): una función por endpoint.
2. **Página** (`pages/X/XPage.jsx`): carga la lista en un `useEffect`, la muestra en una tabla y abre los modales.
3. **Modal de formulario** (`pages/X/XFormModal.jsx`): sirve para crear (`xInicial = null`) y para editar (`xInicial = objeto`). Recibe datos por props (input) y avisa al padre con `onGuardado` / `onCancelar` (output).

### Modelos (clases)

Cada entidad del backend tiene su clase en `src/models/` (`Mesa`, `Producto`, `Reserva`, `Comanda`, `PedidoCocina`, etc.). Todas heredan de `Modelo`, que implementa el patrón **Factory Method**: `Mesa.desdeApi(json)` construye el objeto a partir de la respuesta de la API.

- **Respuestas:** los servicios convierten el `data` de cada respuesta en instancias con `conModelo(Clase)`, así las pantallas usan métodos del dominio (`mesa.estaOcupada`, `comanda.estaAbierta`, `detalle.esModificable`, `pedido.siguienteEstado`) en lugar de comparar strings sueltos.
- **Requests:** los formularios arman el cuerpo del pedido con `toApi()` (`new Producto(form).toApi()`, `new Reserva(form).toApi()`), y la pantalla de nueva comanda usa `ItemComanda` para los productos que se van cargando.

### Estilos: Tailwind CSS (mobile-first)

Se usa **Tailwind CSS v4** (plugin `@tailwindcss/vite`). Tailwind es mobile-first: una clase sin prefijo vale para todas las pantallas y los prefijos `sm:` / `md:` / `lg:` la cambian desde ese ancho en adelante. Breakpoints: **SM 640px**, **MD 768px** y **LG 1024px**.

`src/index.css` sigue la organización que propone Tailwind:

- `@theme`: colores y sombras del diseño (cada token genera sus utilidades, ej. `bg-surface`, `text-muted`).
- `@layer components`: piezas que se repiten en muchas pantallas (`btn`, `data-table`, `form-group`, `modal`, `badge`), armadas con `@apply`.
- El layout propio de cada pantalla se escribe con utilidades en el JSX (ej. `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`).
