# RestoFlow — Frontend

Interfaz web de RestoFlow para administradores, mozos y cocineros.

**Tecnologías:** React 19 · Vite · React Router · Axios · react-hot-toast · lucide-react (íconos)

## Requisitos

- Node.js 20 o superior
- El [backend](https://github.com/CataldiDonato/TP-Desarrollo-de-software-Backend) levantado

## Instalación paso a paso

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo .env con la dirección de la API
echo "VITE_API_URL=http://localhost:3000/api" > .env

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
| Comandas (abrir, agregar productos, cobrar) | ✔ | ✔ | |
| Productos (ver, detalle con historial de precios) | ✔ | ✔ | |
| Productos (crear, editar, borrar) | ✔ | | |
| Categorías, Medios de pago, Usuarios | ✔ | | |
| Cocina KDS (ver) | ✔ | | ✔ |
| Cocina KDS (cambiar estado de platos) | | | ✔ |

Las rutas están protegidas por rol en `src/routes/AppRouter.jsx` (componente `RutaProtegida`). El backend vuelve a controlar los permisos en cada pedido.

## Estructura

```
src/
├── components/
│   ├── common/Modal.jsx        # Ventana modal genérica que usan todos los formularios
│   └── layout/Navbar.jsx       # Barra de navegación (muestra los links según el rol)
├── context/AuthContext.jsx     # Sesión del usuario (token y datos) compartida en toda la app
├── models/modelos.js           # Modelos de datos (JSDoc) y valores de los enums
├── pages/                      # Una carpeta por pantalla: página + sus modales
├── routes/                     # Rutas y protección por rol
├── services/                   # Llamadas a la API con Axios (una por recurso)
├── utils/                      # Formato de precios y fechas, rutas por rol
└── index.css                   # Estilos (mobile-first)
```

### Patrón de cada pantalla (CRUD)

1. **Servicio** (`services/x.service.js`): una función por endpoint.
2. **Página** (`pages/X/XPage.jsx`): carga la lista en un `useEffect`, la muestra en una tabla y abre los modales.
3. **Modal de formulario** (`pages/X/XFormModal.jsx`): sirve para crear (`xInicial = null`) y para editar (`xInicial = objeto`). Recibe datos por props (input) y avisa al padre con `onGuardado` / `onCancelar` (output).

### Estilos (mobile-first)

Los estilos base de `index.css` son para celular. Las pantallas más grandes se ajustan al final del archivo con `@media (min-width: ...)` en tres breakpoints: **SM 640px**, **MD 900px** y **LG 1100px**.
