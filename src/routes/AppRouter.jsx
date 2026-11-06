import { Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import RutaProtegida from './RutaProtegida';

// Vistas
import LoginPage from '../pages/Login/LoginPage';
import ProductosPage from '../pages/Productos/ProductosPage';
import CocinaPage from '../pages/Cocina/CocinaPage';
import HomePage from '../pages/Home/HomePage';
import UsuariosPage from '../pages/Usuarios/UsuariosPage';
import ComandasPage from '../pages/Comandas/ComandasPage';
import NuevaComandaPage from '../pages/Comandas/NuevaComandaPage';
import MesasPage from '../pages/Mesas/MesasPage';
import ReservasPage from '../pages/Reservas/ReservasPage';
import CategoriasPage from '../pages/Categorias/CategoriasPage';
import MediosPagoPage from '../pages/MediosPago/MediosPagoPage';
import ResultadoPagoPage from '../pages/Pago/ResultadoPagoPage';

function LayoutPrivado() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[1100px] px-4 py-5 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      {/* Pública: acá vuelve el cliente desde Mercado Pago (no tiene login) */}
      <Route path="/pago/resultado" element={<ResultadoPagoPage />} />

      <Route element={<LayoutPrivado />}>
        <Route element={<RutaProtegida roles={['Administrador']} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/categorias" element={<CategoriasPage />} />
          <Route path="/medios-pago" element={<MediosPagoPage />} />
        </Route>

        <Route element={<RutaProtegida roles={['Administrador', 'Mozo']} />}>
          <Route path="/mesas" element={<MesasPage />} />
          <Route path="/reservas" element={<ReservasPage />} />
          <Route path="/comandas" element={<ComandasPage />} />
          <Route path="/comandas/nueva" element={<NuevaComandaPage />} />
          <Route path="/productos" element={<ProductosPage />} />
        </Route>

        <Route element={<RutaProtegida roles={['Administrador', 'Cocinero']} />}>
          <Route path="/cocina" element={<CocinaPage />} />
        </Route>
      </Route>

      {/* Cualquier otra dirección vuelve al inicio (RutaProtegida decide a dónde según el rol) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
