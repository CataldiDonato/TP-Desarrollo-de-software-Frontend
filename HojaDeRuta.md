Aquí tienes la **Guía Unificada y Actualizada** para todo el equipo. 

Unifica la arquitectura, las correcciones de carpetas (todo dentro de `src/`), la división de tareas por integrante, el flujo de Git y la explicación paso a paso del **patrón de CRUD** con los componentes listos para usar y replicar.

Podés guardar este contenido en un archivo **`GUIA_FRONTEND.md`** dentro de la carpeta `Frontend/`.

---

# 🚀 Guía Oficial de Desarrollo Frontend - RestoFlow (React + Vite)

Documento oficial de arquitectura frontend, distribución de pantallas por integrante, estándar de código para CRUDs y flujo de Git para el equipo.

---

## 📂 1. Estructura Oficial del Proyecto (`Frontend/src/`)

> ⚠️ **REGLA DE ORO:** Todos los componentes, vistas, rutas y servicios deben vivir **DENTRO de `Frontend/src/`**. No crear carpetas de código en la raíz de `Frontend/`.

```text
Frontend/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/                      # Imágenes y fuentes estáticas
│   ├── components/
│   │   ├── common/                  # Componentes reutilizables (Botones, Modales genéricos)
│   │   └── layout/
│   │       └── Navbar.jsx           # Barra de navegación superior
│   ├── services/                    # Clientes de API (Axios)
│   │   ├── api.js                   # Instancia base de Axios
│   │   ├── productos.service.js     # Donato
│   │   ├── categorias.service.js    # Donato
│   │   ├── mesas.service.js         # Gaspar
│   │   ├── reservas.service.js      # Gaspar
│   │   ├── comandas.service.js      # Tomas
│   │   ├── mediosPago.service.js    # Tomas
│   │   ├── usuarios.service.js      # Ismael
│   │   ├── cocina.service.js        # Ismael
│   │   └── dashboard.service.js     # Ismael
│   ├── pages/                       # Vistas principales de la app
│   │   ├── Home/                    # Ismael
│   │   ├── Reservas/                # Gaspar
│   │   ├── Mesas/                   # Gaspar
│   │   ├── Comandas/                # Tomas
│   │   ├── Cocina/                  # Ismael
│   │   ├── Usuarios/                # Ismael
│   │   └── Productos/               # Donato
│   ├── routes/
│   │   └── AppRouter.jsx            # Enrutador principal de la app
│   ├── App.css
│   ├── App.jsx                      # Provider Router y wrappers globales
│   ├── index.css                    # Sistema de diseño CSS global
│   └── main.jsx                     # Punto de entrada de Vite
├── .env
├── .gitignore
├── index.html
└── package.json
```

---

## 🛠️ 2. Archivos Base de la Infraestructura (Sostén General)

### 📄 `src/services/api.js`
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

### 📄 `src/components/layout/Navbar.jsx`
```jsx
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-group">
        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
        <span className="separator">|</span>
        <NavLink to="/reservas" className={({ isActive }) => isActive ? 'active' : ''}>Reservas</NavLink>
        <span className="separator">|</span>
        <NavLink to="/mesas" className={({ isActive }) => isActive ? 'active' : ''}>Mesas</NavLink>
        <span className="separator">|</span>
        <NavLink to="/comandas" className={({ isActive }) => isActive ? 'active' : ''}>Comandas</NavLink>
      </div>
      <div className="nav-group">
        <NavLink to="/cocina" className={({ isActive }) => isActive ? 'active' : ''}>Cocina KDS</NavLink>
        <span className="separator">|</span>
        <NavLink to="/usuarios" className={({ isActive }) => isActive ? 'active' : ''}>Usuarios</NavLink>
        <span className="separator">|</span>
        <NavLink to="/productos" className={({ isActive }) => isActive ? 'active' : ''}>Productos</NavLink>
      </div>
    </nav>
  );
}
```

### 📄 `src/routes/AppRouter.jsx`
```jsx
import { Routes, Route } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

// Vistas
import ProductosPage from '../pages/Productos/ProductosPage';
// Descomentar a medida que cada integrante cree su página:
// import HomePage from '../pages/Home/HomePage';
// import ReservasPage from '../pages/Reservas/ReservasPage';
// import MesasPage from '../pages/Mesas/MesasPage';
// import ComandasPage from '../pages/Comandas/ComandasPage';
// import CocinaPage from '../pages/Cocina/CocinaPage';
// import UsuariosPage from '../pages/Usuarios/UsuariosPage';

export default function AppRouter() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/productos" element={<ProductosPage />} />
          {/* <Route path="/" element={<HomePage />} /> */}
          {/* <Route path="/reservas" element={<ReservasPage />} /> */}
          {/* <Route path="/mesas" element={<MesasPage />} /> */}
          {/* <Route path="/comandas/*" element={<ComandasPage />} /> */}
          {/* <Route path="/cocina" element={<CocinaPage />} /> */}
          {/* <Route path="/usuarios" element={<UsuariosPage />} /> */}
        </Routes>
      </main>
    </>
  );
}
```

---

## 👥 3. División de Módulos por Integrante

---

### 🟢 1. DONATO — Módulo: Menú (Productos y Categorías)
* **Rama Git:** `feature/front-menu`
* **Pantallas asociadas:** PDF 2 (Pág 2, 5, 9 y 10).
* **Archivos asignados:**
  * `src/services/productos.service.js`
  * `src/services/categorias.service.js`
  * `src/pages/Productos/ProductosPage.jsx`
  * `src/pages/Productos/ProductoFormModal.jsx`
  * `src/pages/Productos/CategoriaFormModal.jsx`

#### 📋 Funcionalidades:
1. **Listado de Productos (`ProductosPage.jsx`):**
   - Pestañas/Filtros por categoría (*Entradas, Principal, Postre, Bebidas*).
   - Tabla de **Productos** (Nombre, Descripción, Categoría, Precio, Fecha Actualización).
   - Tabla lateral/secundaria de **Categorías** con botones de *editar/eliminar*.
   - Buscador por texto.
2. **Alta/Edición de Producto (`ProductoFormModal.jsx`):**
   - Inputs: Nombre plato, Descripción, Select desplegable de Categoría, Precio.
3. **Alta/Edición de Categoría (`CategoriaFormModal.jsx`):**
   - Input: Nombre de categoría.

---

### 2. GASPAR — Módulo: Salón (Mesas y Reservas)
* **Rama Git:** `feature/front-salon`
* **Pantallas asociadas:** PDF 2 (Pág 1, 2 y 7).
* **Archivos asignados:**
  * `src/services/mesas.service.js`
  * `src/services/reservas.service.js`
  * `src/pages/Mesas/MesasPage.jsx`
  * `src/pages/Reservas/ReservasPage.jsx`
  * `src/pages/Reservas/ReservaFormModal.jsx`

#### 📋 Funcionalidades:
1. **Vista de Mesas (`MesasPage.jsx`):**
   - Tabla de **Mesas**: Número de mesa, Capacidad, Estado (`Libre` / `Ocupada` / `Reservada`).
2. **Vista de Reservas (`ReservasPage.jsx`):**
   - Tabla de **Reservas**: Nombre cliente, Fecha, Teléfono, Estado (`Pendiente`, `Asignado`, `Terminado`, `Cancelado`), Mesa asignada.
   - Acciones: Finalizar reserva, Cancelar reserva.
3. **Formulario de Nueva Reserva (`ReservaFormModal.jsx`):**
   - Inputs: Nombre Cliente, Fecha/Hora, Teléfono, Cantidad de personas.
   - Botón *"Muestra mesas disp"* para seleccionar la mesa disponible correspondiente.

---

### 🟡 3. TOMAS — Módulo: Comandas y Atención (Mozos)
* **Rama Git:** `feature/front-comandas`
* **Pantallas asociadas:** PDF 1 (Pág 2, 3, 4 y 5) / PDF 2 (Pág 3).
* **Archivos asignados:**
  * `src/services/comandas.service.js`
  * `src/services/mediosPago.service.js`
  * `src/pages/Comandas/ComandasPage.jsx`
  * `src/pages/Comandas/NuevaComandaPage.jsx`
  * `src/pages/Comandas/DetalleComandaModal.jsx`

#### 📋 Funcionalidades:
1. **Listado de Comandas (`ComandasPage.jsx`):**
   - Tabla general: Número de mesa, Nombre mozo, Método de pago, Total, Fecha, Estado (`Abierta`/`Cerrada`), Botón *"VER DETALLES"*.
2. **Apertura de Comanda (`NuevaComandaPage.jsx`):**
   - Input: Número de mesa.
   - Formulario "Cargar Producto": Select de producto + Cantidad + Botón `+`.
   - Listado temporal derecho acumulativo antes de confirmar el envío.
3. **Gestión de Detalle (`DetalleComandaModal.jsx`):**
   - Modificar cantidad de items en comanda o quitar producto.

---

### 🔴 4. ISMAEL — Módulo: Cocina (KDS), Usuarios y Dashboard
* **Rama Git:** `feature/front-cocina-admin`
* **Pantallas asociadas:** PDF 1 (Pág 1) / PDF 2 (Pág 4, 6 y 8).
* **Archivos asignados:**
  * `src/services/usuarios.service.js`
  * `src/services/cocina.service.js`
  * `src/services/dashboard.service.js`
  * `src/pages/Home/HomePage.jsx`
  * `src/pages/Usuarios/UsuariosPage.jsx`
  * `src/pages/Usuarios/UsuarioFormModal.jsx`
  * `src/pages/Cocina/CocinaPage.jsx`

#### 📋 Funcionalidades:
1. **Pantalla KDS Cocina (`CocinaPage.jsx`):**
   - Pedidos agrupados por Mesa.
   - Tabla: Producto, Cantidad, Cambio de Estado (`No arrancado` ➔ `En preparación` ➔ `Listo`).
2. **Gestión de Usuarios (`UsuariosPage.jsx`):**
   - Tabla: Nombre, Email, Rol (`Admin`, `Cocinero`, `Mozo`), Acciones (Editar/Eliminar).
   - Modal de Alta/Edición de usuario.
3. **Dashboard Home (`HomePage.jsx`):**
   - Tarjetas de métricas: *Estado Salón (mesas libres/ocupadas), Ventas del día ($), En Cocina (pedidos pendientes), Reservas de hoy*.
   - Tabla resumen: Mesas activas y Próximas reservas.

---

## 📖 4. Patrón Estándar para Construir un CRUD (Paso a Paso)

Cada módulo sigue un esquema estricto de **4 archivos**. Tomamos como ejemplo funcional el **módulo de Productos**:

### Paso 1: Definir el Servicio (`src/services/productos.service.js`)
```javascript
import api from './api';

export const getProductos = () => api.get('/productos');
export const createProducto = (data) => api.post('/productos', data);
export const updateProducto = (id, data) => api.put(`/productos/${id}`, data);
export const deleteProducto = (id) => api.delete(`/productos/${id}`);
```

---

### Paso 2: Crear el Modal Formulario (`src/pages/Productos/ProductoFormModal.jsx`)
Sirve tanto para **Crear** (`productoInicial = null`) como para **Editar** (`productoInicial = { ... }`).

```jsx
import { useState, useEffect } from 'react';
import { createProducto, updateProducto } from '../../services/productos.service';
import toast from 'react-hot-toast';

export default function ProductoFormModal({ productoInicial, onGuardado, onCancelar }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    id_categoria: ''
  });
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (productoInicial) {
      setFormData(productoInicial);
    }
  }, [productoInicial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      if (productoInicial?.id) {
        await updateProducto(productoInicial.id, formData);
        toast.success('Producto actualizado correctamente');
      } else {
        await createProducto(formData);
        toast.success('Producto creado correctamente');
      }
      onGuardado();
    } catch (error) {
      toast.error(error.response?.data?.mensaje || 'Error al guardar el producto');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{productoInicial ? 'Editar Producto' : 'Nuevo Producto'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre</label>
            <input name="nombre" value={formData.nombre} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <input name="descripcion" value={formData.descripcion} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Precio</label>
            <input type="number" name="precio" value={formData.precio} onChange={handleChange} required />
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancelar}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={cargando}>
              {cargando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

### Paso 3: Crear la Pantalla Principal (`src/pages/Productos/ProductosPage.jsx`)
Maneja la lista, el filtrado, la eliminación y el control de apertura del modal.

```jsx
import { useState, useEffect } from 'react';
import { getProductos, deleteProducto } from '../../services/productos.service';
import ProductoFormModal from './ProductoFormModal';
import toast from 'react-hot-toast';

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  
  // Control de Modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState(null);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const res = await getProductos();
      setProductos(res.data);
    } catch (err) {
      toast.error('Error al cargar productos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleEliminar = async (id) => {
    if (!confirm('¿Seguro de que deseas eliminar este producto?')) return;
    try {
      await deleteProducto(id);
      toast.success('Producto eliminado');
      cargarDatos();
    } catch (err) {
      toast.error('Error al eliminar producto');
    }
  };

  const abrirNuevoModal = () => {
    setProductoAEditar(null);
    setModalAbierto(true);
  };

  const abrirEditarModal = (producto) => {
    setProductoAEditar(producto);
    setModalAbierto(true);
  };

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestión de Productos</h1>
        <button className="btn btn-primary" onClick={abrirNuevoModal}>
          + Nuevo Producto
        </button>
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="search-input"
        />
      </div>

      {cargando ? (
        <p>Cargando datos...</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.map(p => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.descripcion}</td>
                <td>${p.precio}</td>
                <td>
                  <button className="btn-icon" onClick={() => abrirEditarModal(p)}>✏️</button>
                  <button className="btn-icon text-danger" onClick={() => handleEliminar(p.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalAbierto && (
        <ProductoFormModal
          productoInicial={productoAEditar}
          onGuardado={() => {
            setModalAbierto(false);
            cargarDatos();
          }}
          onCancelar={() => setModalAbierto(false)}
        />
      )}
    </div>
  );
}
```

---

### Paso 4: Registrar la ruta en `AppRouter.jsx`
Simplemente importar la pantalla y agregar el `<Route>` correspondiente.

---

## 🔄 5. Flujo de Git para la Integración

1. **Asegurar que `main` tiene el esqueleto limpio:**
   ```bash
   git checkout main
   git pull origin main
   ```
2. **Crear la rama individual:**
   ```bash
   git checkout -b feature/front-menu      # Donato
   git checkout -b feature/front-salon     # Gaspar
   git checkout -b feature/front-comandas  # Tomas
   git checkout -b feature/front-cocina    # Ismael
   ```
3. **Al finalizar un módulo:**
   ```bash
   git add .
   git commit -m "feat(front): implementa vista y CRUD de productos"
   git push origin <tu-rama>
   ```
4. **Abrir Pull Request (PR)** hacia `main` para que un compañero lo revise antes de mergear.