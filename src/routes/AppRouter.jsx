import { Routes, Route, Outlet } from 'react-router-dom';
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

function LayoutPrivado() {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
    </>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<LayoutPrivado />}>
        <Route element={<RutaProtegida roles={['Administrador']} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/usuarios" element={<UsuariosPage />} />
        </Route>

        <Route element={<RutaProtegida roles={['Administrador', 'Mozo']} />}>
          <Route path="/comandas" element={<ComandasPage />} />
          <Route path="/comandas/nueva" element={<NuevaComandaPage />} />
          <Route path="/productos" element={<ProductosPage />} />
        </Route>

        <Route element={<RutaProtegida roles={['Administrador', 'Cocinero']} />}>
          <Route path="/cocina" element={<CocinaPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
